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
import { AuthResponseDto } from './dto/auth-response.dto';
import { GoogleProfileDto } from './dto/google-profile.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { UpdateNicknameDto } from './dto/update-nickname.dto';

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
        const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(
            /\/$/,
            '',
        );
        const callbackUrl = new URL(`${frontendUrl}/auth/callback`);
        callbackUrl.searchParams.set('accessToken', result.accessToken);
        callbackUrl.searchParams.set('member', JSON.stringify(result.member));
        callbackUrl.searchParams.set('isNewMember', String(result.isNewMember));

        response.redirect(callbackUrl.toString());
    }

    @Post('signup')
    async signup(@Body() body: SignupDto): Promise<AuthResponseDto> {
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
        @Body() body: UpdateNicknameDto,
    ) {
        return this.authService.updateNickname(request.user.memberId, body.nickname);
    }
}
