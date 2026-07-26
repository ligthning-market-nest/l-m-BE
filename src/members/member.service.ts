import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { ProfileResponse } from './dto/profile.response';
import { ConnectionStatus } from './entities/enums/connectionStatus.enum';
import { Member } from './entities/member.entity';
import { MemberRepository } from './member.repository';

export type GoogleProfile = {
    googleId: string;
    email: string;
};

@Injectable()
export class MemberService {
    constructor(private readonly memberRepository: MemberRepository) {}


    //일반 회원 생성
    //여기서 save 써서 저장
    async createLocalMember(email: string, password: string): Promise<Member> {
        const hashedPassword = await bcrypt.hash(password, 10); //비번 해시

        //새 객체로 저장
        return this.memberRepository.save(
            this.memberRepository.create({
                email,
                nickname: null,
                password: hashedPassword,
                googleId: null,
                authMethod: 'local',
                connectionStatus: ConnectionStatus.ONLINE,
                introduction: null,
                tokenBalance: 1000,
                nicknameUpdatedAt: null,
                introductionUpdatedAt: null,
            }),
        );
    }

    //구글 로그인인데 기존 로그인 또는 새 로그인
    async findOrCreateGoogleMember(
        googleProfile: GoogleProfile,
    ): Promise<{ member: Member; isNewMember: boolean }> {
        //google 유저 찾기
        const googleMember =
            (await this.memberRepository.findByGoogleId(googleProfile.googleId)) ??
            (await this.memberRepository.findByEmail(googleProfile.email));

            //구글 유저면 값 다 넣고, 저장
        if (googleMember) {
            googleMember.googleId = googleProfile.googleId;
            googleMember.authMethod = 'google';
            googleMember.connectionStatus = ConnectionStatus.ONLINE;

            const member = await this.memberRepository.save(googleMember);
            return { member, isNewMember: false };
        }

        const password = await bcrypt.hash(randomUUID(), 10);   //비번 해시
        
        //만들기 + 저장
        const member = await this.memberRepository.save(
            this.memberRepository.create({
                email: googleProfile.email,
                nickname: null,
                googleId: googleProfile.googleId,
                password,
                authMethod: 'google',
                connectionStatus: ConnectionStatus.ONLINE,
                introduction: null,
                tokenBalance: 1000,
                nicknameUpdatedAt: null,
                introductionUpdatedAt: null,
            }),
        );

        return { member, isNewMember: true };
    }

    async verifyPassword(member: Member, rawPassword: string): Promise<boolean> {
        return bcrypt.compare(rawPassword, member.password);
    }

    async markOnline(memberId: number): Promise<Member> {
        const member = await this.findById(memberId);
        member.connectionStatus = ConnectionStatus.ONLINE;
        return this.memberRepository.save(member);
    }

    async markOffline(memberId: number): Promise<Member> {
        const member = await this.findById(memberId);
        member.connectionStatus = ConnectionStatus.OFFLINE;
        return this.memberRepository.save(member);
    }

    async updateNickname(memberId: number, nickname: string): Promise<Member> {
        const trimmedNickname = nickname.trim();

        if (!trimmedNickname) {
            throw new ConflictException('닉네임을 입력하세요.');
        }

        const member = await this.findById(memberId);
        this.ensureUpdatePeriod(member.nicknameUpdatedAt, 30, '닉네임');

        const conflict = await this.memberRepository.findByNickname(trimmedNickname);
        if (conflict && conflict.id !== memberId) {
            throw new ConflictException('이미 사용 중인 닉네임입니다.');
        }

        member.nickname = trimmedNickname;
        member.nicknameUpdatedAt = new Date();
        return this.memberRepository.save(member);
    }

    async updateProfile(
        memberId: number,
        introduction: string,
    ): Promise<ProfileResponse> {
        const member = await this.findById(memberId);
        const trimmedIntroduction = introduction.trim();

        if (!trimmedIntroduction) {
            throw new BadRequestException('자기소개를 입력하세요.');
        }
        if (this.containsExternalContact(trimmedIntroduction)) {
            throw new BadRequestException(
                '자기소개에 연락처, 계좌번호, SNS 또는 외부 URL을 입력할 수 없습니다.',
            );
        }

        this.ensureUpdatePeriod(member.introductionUpdatedAt, 7, '자기소개');
        member.introduction = trimmedIntroduction;
        member.introductionUpdatedAt = new Date();
        await this.memberRepository.save(member);

        return this.profile(memberId, memberId);
    }

    async profile(viewerId: number, memberId: number): Promise<ProfileResponse> {
        const member = await this.findById(memberId);
        const [followerCount, followingCount, followed] = await Promise.all([
            this.memberRepository.countFollowers(memberId),
            this.memberRepository.countFollowing(memberId),
            viewerId === memberId
                ? Promise.resolve(false)
                : this.memberRepository
                      .findFollow(viewerId, memberId)
                      .then((follow) => Boolean(follow)),
        ]);
        const isOwner = viewerId === memberId;

        return {
            id: member.id,
            nickname: member.nickname,
            email: isOwner ? member.email : null,
            introduction: member.introduction,
            connectionStatus: member.connectionStatus,
            tokenBalance: isOwner ? member.tokenBalance : null,
            followerCount,
            followingCount,
            followed,
        };
    }

    async follow(
        followerId: number,
        followingId: number,
    ): Promise<{ message: string }> {
        if (followerId === followingId) {
            throw new BadRequestException('본인을 팔로우할 수 없습니다.');
        }

        const existing = await this.memberRepository.findFollow(
            followerId,
            followingId,
        );
        if (existing) {
            throw new ConflictException('이미 팔로우한 사용자입니다.');
        }

        const [follower, following] = await Promise.all([
            this.findById(followerId),
            this.findById(followingId),
        ]);
        await this.memberRepository.createFollow(follower, following);
        return { message: '팔로우했습니다.' };
    }

    async unfollow(
        followerId: number,
        followingId: number,
    ): Promise<{ message: string }> {
        const follow = await this.memberRepository.findFollow(
            followerId,
            followingId,
        );
        if (!follow) {
            throw new NotFoundException('팔로우 관계를 찾을 수 없습니다.');
        }

        await this.memberRepository.removeFollow(follow);
        return { message: '팔로우를 취소했습니다.' };
    }

    async changePassword(
        memberId: number,
        currentPassword: string,
        newPassword: string,
    ): Promise<void> {
        const member = await this.findById(memberId);
        const passwordMatches = await this.verifyPassword(member, currentPassword);

        if (!passwordMatches) {
            throw new BadRequestException('현재 비밀번호가 올바르지 않습니다.');
        }

        member.password = await bcrypt.hash(newPassword, 10);
        await this.memberRepository.save(member);
    }

    async findById(id: number): Promise<Member> {
        const member = await this.memberRepository.findById(id);

        if (!member) {
            throw new NotFoundException('회원을 찾을 수 없습니다.');
        }

        return member;
    }

    async findByEmail(email: string): Promise<Member | null> {
        return this.memberRepository.findByEmail(email);
    }

    async findByNickname(nickname: string): Promise<Member | null> {
        return this.memberRepository.findByNickname(nickname);
    }

    private ensureUpdatePeriod(
        updatedAt: Date | null,
        periodDays: number,
        fieldName: string,
    ): void {
        if (!updatedAt) {
            return;
        }

        const nextUpdateAt = new Date(updatedAt);
        nextUpdateAt.setDate(nextUpdateAt.getDate() + periodDays);

        if (nextUpdateAt > new Date()) {
            throw new ConflictException(
                `${fieldName}은 ${nextUpdateAt.toLocaleDateString('ko-KR')} 이후 변경할 수 있습니다.`,
            );
        }
    }

    private containsExternalContact(introduction: string): boolean {
        const externalContactPattern =
            /(https?:\/\/|www\.|instagram|인스타|카카오|kakao|계좌|@[\w.]+|\d{2,4}[-\s]\d{3,4}[-\s]\d{4})/i;
        return externalContactPattern.test(introduction);
    }
}
