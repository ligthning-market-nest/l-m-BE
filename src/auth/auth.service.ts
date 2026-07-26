import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectionStatus } from '../members/entities/enums/connectionStatus.enum';
import { AuthMemberResponseDto } from './dto/auth.member.response';
import { AuthResponseDto } from './dto/auth.response';
import { GoogleProfileDto } from './dto/google-profile.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { MemberService } from '../members/member.service';
import { MessageResponse } from './dto/message.response';

@Injectable()
export class AuthService {
  constructor(
    private readonly memberService: MemberService,
    private readonly jwtService: JwtService,
  ) {}

  //회원 가입
  async signup(email: string, password: string): Promise<AuthResponseDto> {
    //이메일 앞뒤 공백 제거하고, 소문자로
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      throw new ConflictException('이메일과 비밀번호를 입력하세요.');
    }

    const existing = await this.memberService.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    //저장
    const member = await this.memberService.createLocalMember(
      normalizedEmail,
      password,
    );

    return {
      accessToken: await this.signToken(
        member.id,
        member.email,
        member.nickname,
        member.authMethod,
      ),
      member: this.toMemberResponse(member),
      isNewMember: true,
    };
  }


  //로그인
  async login(email: string, password: string): Promise<AuthResponseDto> {
    const normalizedEmail = email.trim().toLowerCase();
    const member = await this.memberService.findByEmail(normalizedEmail);

    if (!member) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    //비번 비교
    const passwordMatches = await this.memberService.verifyPassword(
      member,
      password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    //로그인 했으니까 온라인 상태
    const onlineMember = await this.memberService.markOnline(member.id);
    const accessToken = await this.signToken(
      onlineMember.id,
      onlineMember.email,
      onlineMember.nickname,
      onlineMember.authMethod,
    );

    //토큰 등 반환
    return {
      accessToken,
      member: this.toMemberResponse(onlineMember),
      isNewMember: false,
    };
  }


  //구글 로그인
  async googleLogin(googleProfile: GoogleProfileDto): Promise<AuthResponseDto> {
    const { member, isNewMember } =
      await this.memberService.findOrCreateGoogleMember(googleProfile);
    const accessToken = await this.signToken(
      member.id,
      member.email,
      member.nickname,
      member.authMethod,
    );

    return {
      accessToken,
      member: this.toMemberResponse(member),
      isNewMember,
    };
  }

  //닉네임 변경
  async updateNickname(
    memberId: number,
    nickname: string,
  ): Promise<MessageResponse> {
    await this.memberService.updateNickname(memberId, nickname);
    return { message: '닉네임이 변경되었습니다.' };
  }

  async logout(memberId: number): Promise<MessageResponse> {
    await this.memberService.markOffline(memberId);
    return { message: '로그아웃되었습니다.' };
  }

  async changePassword(
    memberId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<MessageResponse> {
    await this.memberService.changePassword(
      memberId,
      currentPassword,
      newPassword,
    );
    return { message: '비밀번호가 변경되었습니다.' };
  }

  //엑세스 토큰 검증
  async validateAccessToken(memberId: number): Promise<AuthMemberResponseDto> {
    const member = await this.memberService.findById(memberId);
    return this.toMemberResponse(member);
  }

  //jwt 페이로드에 담을 데이터들
  private async signToken(
    memberId: number,
    email: string,
    nickname: string | null,
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

  //공용으로 쓰일 멤버 객체 반환
  private toMemberResponse(member: {
    id: number;
    nickname: string | null;
    email: string;
    googleId: string | null;
    authMethod: 'local' | 'google';
    connectionStatus: ConnectionStatus;
    introduction: string | null;
    tokenBalance: number;
  }): AuthMemberResponseDto {
    return {
      id: member.id,
      nickname: member.nickname,
      email: member.email,
      googleId: member.googleId,
      authMethod: member.authMethod,
      connectionStatus: member.connectionStatus,
      introduction: member.introduction,
      tokenBalance: member.tokenBalance,
    };
  }
}
