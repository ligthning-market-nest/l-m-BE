import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { ConnectionStatus } from './entities/enums/connectionStatus.enum';
import { Member } from './entities/member.entity';
import { MemberRepository } from './member.repository';

export type GoogleProfile = {
    googleId: string;
    email: string;
    nickname: string;
};

@Injectable()
export class MemberService {
    constructor(private readonly memberRepository: MemberRepository) {}

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

    async createLocalMember(email: string, password: string): Promise<Member> {
        const nickname = await this.generateAvailableNickname(email.split('@')[0] || 'user');
        const hashedPassword = await bcrypt.hash(password, 10);

        return this.memberRepository.save(
            this.memberRepository.create({
                email,
                nickname,
                password: hashedPassword,
                googleId: null,
                authMethod: 'local',
                connectionStatus: ConnectionStatus.Online,
            }),
        );
    }

    async findOrCreateGoogleMember(
        googleProfile: GoogleProfile,
    ): Promise<{ member: Member; isNewMember: boolean }> {
        const googleMember =
            (await this.memberRepository.findByGoogleId(googleProfile.googleId)) ??
            (await this.memberRepository.findByEmail(googleProfile.email));

        if (googleMember) {
            googleMember.googleId = googleProfile.googleId;
            googleMember.authMethod = 'google';
            googleMember.connectionStatus = ConnectionStatus.Online;

            const member = await this.memberRepository.save(googleMember);
            return { member, isNewMember: false };
        }

        const nickname = await this.generateAvailableNickname(googleProfile.nickname);
        const password = await bcrypt.hash(randomUUID(), 10);

        const member = await this.memberRepository.save(
            this.memberRepository.create({
                email: googleProfile.email,
                nickname,
                googleId: googleProfile.googleId,
                password,
                authMethod: 'google',
                connectionStatus: ConnectionStatus.Online,
            }),
        );

        return { member, isNewMember: true };
    }

    async verifyPassword(member: Member, rawPassword: string): Promise<boolean> {
        return bcrypt.compare(rawPassword, member.password);
    }

    async markOnline(memberId: number): Promise<Member> {
        const member = await this.findById(memberId);
        member.connectionStatus = ConnectionStatus.Online;
        return this.memberRepository.save(member);
    }

    async markOffline(memberId: number): Promise<Member> {
        const member = await this.findById(memberId);
        member.connectionStatus = ConnectionStatus.Offline;
        return this.memberRepository.save(member);
    }

    async updateNickname(memberId: number, nickname: string): Promise<Member> {
        const sanitizedNickname = this.sanitizeNickname(nickname);

        if (!sanitizedNickname) {
            throw new ConflictException('닉네임을 입력하세요.');
        }

        const conflict = await this.memberRepository.findByNickname(sanitizedNickname);
        if (conflict && conflict.id !== memberId) {
            throw new ConflictException('이미 사용 중인 닉네임입니다.');
        }

        const member = await this.findById(memberId);
        member.nickname = sanitizedNickname;
        return this.memberRepository.save(member);
    }

    private sanitizeNickname(baseNickname: string): string {
        return baseNickname.replace(/[^a-zA-Z0-9가-힣]/g, '').slice(0, 20);
    }

    private async generateAvailableNickname(baseNickname: string): Promise<string> {
        const sanitizedNickname = this.sanitizeNickname(baseNickname);
        const fallbackNickname = sanitizedNickname || 'user';

        if (!(await this.memberRepository.findByNickname(fallbackNickname))) {
            return fallbackNickname;
        }

        for (let index = 1; index < 1000; index += 1) {
            const suffix = String(index);
            const availableLength = 20 - suffix.length;
            const candidateNickname = `${fallbackNickname.slice(0, availableLength)}${suffix}`;

            if (!(await this.memberRepository.findByNickname(candidateNickname))) {
                return candidateNickname;
            }
        }

        return `${fallbackNickname.slice(0, 16)}${Date.now().toString().slice(-4)}`;
    }
}
