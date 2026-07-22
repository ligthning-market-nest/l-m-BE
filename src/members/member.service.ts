import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
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

        const conflict = await this.memberRepository.findByNickname(trimmedNickname);
        if (conflict && conflict.id !== memberId) {
            throw new ConflictException('이미 사용 중인 닉네임입니다.');
        }

        const member = await this.findById(memberId);
        member.nickname = trimmedNickname;
        return this.memberRepository.save(member);
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
}
