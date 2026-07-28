import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileResponse } from './dto/profile.response';
import { ProfileUpdate } from './dto/profile.update';
import { TokenChargeRequest } from './dto/token-charge.request';
import { MemberService } from './member.service';

type AuthenticatedRequest = Request & { user: { memberId: number } };

@Controller('user')
@UseGuards(JwtAuthGuard)
export class MemberController {
    constructor(private readonly memberService: MemberService) {}

    @Get('profile')
    profile(@Req() request: AuthenticatedRequest): Promise<ProfileResponse> {
        return this.memberService.profile(
            request.user.memberId,
            request.user.memberId,
        );
    }

    @Get('profile/:id')
    publicProfile(
        @Req() request: AuthenticatedRequest,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ProfileResponse> {
        return this.memberService.profile(request.user.memberId, id);
    }

    @Patch('profile')
    updateProfile(
        @Req() request: AuthenticatedRequest,
        @Body() body: ProfileUpdate,
    ): Promise<ProfileResponse> {
        return this.memberService.updateProfile(
            request.user.memberId,
            body.introduction,
        );
    }

    @Patch('token')
    chargeToken(
        @Req() request: AuthenticatedRequest,
        @Body() body: TokenChargeRequest,
    ): Promise<ProfileResponse> {
        return this.memberService.chargeTokens(
            request.user.memberId,
            body.amount,
        );
    }

    @Post(':id/follow')
    follow(
        @Req() request: AuthenticatedRequest,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        return this.memberService.follow(request.user.memberId, id);
    }

    @Delete(':id/follow')
    unfollow(
        @Req() request: AuthenticatedRequest,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        return this.memberService.unfollow(request.user.memberId, id);
    }
}
