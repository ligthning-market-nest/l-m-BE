import {
    ConflictException,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { ConnectionStatus } from '../members/entities/enums/connectionStatus.enum';
import { AuthMemberResponseDto } from './dto/auth-member-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { GoogleProfileDto } from './dto/google-profile.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { MemberService } from '../members/member.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly memberService: MemberService,
        private readonly jwtService: JwtService,
    ) {}

    async signup(email: string, password: string): Promise<AuthResponseDto> {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            throw new ConflictException('이메일과 비밀번호를 입력하세요.');
        }

        const existing = await this.memberService.findByEmail(normalizedEmail);
        if (existing) {
            throw new ConflictException('이미 가입된 이메일입니다.');
        }

        const member = await this.memberService.createLocalMember(normalizedEmail, password);
        const accessToken = await this.signToken(member.id, member.email, member.nickname, member.authMethod);

        return {
            accessToken,
            member: this.toMemberResponse(member),
            isNewMember: true,
        };
    }

    async login(email: string, password: string): Promise<AuthResponseDto> {
        const normalizedEmail = email.trim().toLowerCase();
        const member = await this.memberService.findByEmail(normalizedEmail);

        if (!member) {
            throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        const passwordMatches = await this.memberService.verifyPassword(member, password);
        if (!passwordMatches) {
            throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        const onlineMember = await this.memberService.markOnline(member.id);
        const accessToken = await this.signToken(
            onlineMember.id,
            onlineMember.email,
            onlineMember.nickname,
            onlineMember.authMethod,
        );

        return {
            accessToken,
            member: this.toMemberResponse(onlineMember),
            isNewMember: false,
        };
    }

    async googleLogin(googleProfile: GoogleProfileDto): Promise<AuthResponseDto> {
        const { member, isNewMember } = await this.memberService.findOrCreateGoogleMember(googleProfile);
        const accessToken = await this.signToken(member.id, member.email, member.nickname, member.authMethod);

        return {
            accessToken,
            member: this.toMemberResponse(member),
            isNewMember,
        };
    }

    async updateNickname(memberId: number, nickname: string): Promise<AuthMemberResponseDto> {
        const member = await this.memberService.updateNickname(memberId, nickname);
        return this.toMemberResponse(member);
    }

    async validateAccessToken(memberId: number): Promise<AuthMemberResponseDto> {
        const member = await this.memberService.findById(memberId);
        return this.toMemberResponse(member);
    }

    private async signToken(
        memberId: number,
        email: string,
        nickname: string,
        authMethod: 'local' | 'google',
    ): Promise<string> {
        const payload: JwtPayloadDto = {
            memberId,
            email,
            nickname,
            authMethod,
        };

        return this.jwtService.signAsync(payload);
    }

    private toMemberResponse(member: {
        id: number;
        nickname: string;
        email: string;
        googleId: string | null;
        authMethod: 'local' | 'google';
        connectionStatus: ConnectionStatus;
    }): AuthMemberResponseDto {
        return {
            id: member.id,
            nickname: member.nickname,
            email: member.email,
            googleId: member.googleId,
            authMethod: member.authMethod,
            connectionStatus: member.connectionStatus,
        };
    }
}
