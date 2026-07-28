import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth.response';
import { GoogleProfileDto } from './dto/google-profile.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { NicknameUpdate } from '../members/dto/nickname.update';
import { MessageResponse } from './dto/message.response';
import { PasswordChangeDto } from './dto/password-change.dto';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { KakaoProfileDto } from './dto/kakao-profile.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin(): void {
    return;
  }

  @Get('login/oauth2/code/google')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req()
    request: Request & {
      user: GoogleProfileDto;
    },
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.authService.googleLogin(request.user);

    this.redirectToFrontend(response, result);
}


  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  kakaoLogin(): void {
    return;
  }

  @Get('login/oauth2/code/kakao')
  @UseGuards(KakaoAuthGuard)
  async kakaoCallback(
    @Req()
    request: Request & {
      user: KakaoProfileDto;
    },
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.authService.kakaoLogin(request.user);

    this.redirectToFrontend(response, result);
  }

  // @Get('apple')
  // @UseGuards(AppleAuthGuard)
  // appleLogin(): void {
  //   return;
  // }
  //
  // @Post('login/oauth2/code/apple')
  // @UseGuards(AppleAuthGuard)
  // async appleCallback(
  //   @Req()
  //   request: Request & {
  //     user: AppleProfileDto;
  //   },
  //   @Res() response: Response,
  // ): Promise<void> {
  //   const result = await this.authService.appleLogin(request.user);
  //
  //   this.redirectToFrontend(response, result);
  // }

  @Post('signup')
  signup(@Body() body: SignupDto): Promise<AuthResponseDto> {
    return this.authService.signup(body.email, body.password);
  }


  @Post('login')
  async login(@Body() body: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(body.email, body.password);
  }


  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: Request & { user: { memberId: number } }) {
    return this.authService.validateAccessToken(request.user.memberId);
  }

  @Patch('me/nickname')
  @UseGuards(JwtAuthGuard)
  async updateNickname(
    @Req() request: Request & { user: { memberId: number } },
    @Body() body: NicknameUpdate,
  ): Promise<MessageResponse> {
    return this.authService.updateNickname(
      request.user.memberId,
      body.nickname,
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(
    @Req() request: Request & { user: { memberId: number } },
  ): Promise<MessageResponse> {
    return this.authService.logout(request.user.memberId);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() request: Request & { user: { memberId: number } },
    @Body() body: PasswordChangeDto,
  ): Promise<MessageResponse> {
    return this.authService.changePassword(
      request.user.memberId,
      body.currentPassword,
      body.newPassword,
    );
  }




  private redirectToFrontend(
    response: Response,
    result: AuthResponseDto,
  ): void {
    const frontendUrl = (
      process.env.FRONTEND_URL ?? 'http://localhost:5173'
    ).replace(/\/$/, '');

    const callbackUrl = new URL(`${frontendUrl}/auth/callback`);

    callbackUrl.searchParams.set('accessToken', result.accessToken);
    callbackUrl.searchParams.set('member', JSON.stringify(result.member));
    callbackUrl.searchParams.set(
      'isNewMember',
      String(result.isNewMember),
    );

    response.redirect(callbackUrl.toString());
  }
}
