import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    ChatMessageResponse,
    ChatroomResponse,
} from './dto/chat.response';

import { ChatroomCreateRequest } from './dto/chatroom-create.request';
import { ChatroomStatusUpdateRequest } from './dto/chatroom-status-update.request';
import { ChatService } from './chat.service';

type AuthenticatedRequest = Request & { user: { memberId: number } };

@Controller('chatroom')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post('create')
    create(
        @Req() request: AuthenticatedRequest,
        @Body() body: ChatroomCreateRequest,
    ): Promise<ChatroomResponse> {
        return this.chatService.create(request.user.memberId, body.itemId);
    }



    @Get('history')
    history(
        @Req() request: AuthenticatedRequest,
        @Query('status') status?: string,
    ): Promise<ChatroomResponse[]> {
        return this.chatService.history(request.user.memberId, status);
    }



    @Get('message')
    messages(
        @Req() request: AuthenticatedRequest,
        @Query('chatroomId', ParseIntPipe) chatroomId: number,
    ): Promise<ChatMessageResponse[]> {
        return this.chatService.messages(request.user.memberId, chatroomId);
    }



    @Get(':id')
    detail(
        @Req() request: AuthenticatedRequest,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ChatroomResponse> {
        return this.chatService.detail(request.user.memberId, id);
    }



    @Patch(':id/status')
    updateStatus(
        @Req() request: AuthenticatedRequest,
        @Param('id', ParseIntPipe) id: number,
        @Body() body: ChatroomStatusUpdateRequest,
    ): Promise<ChatroomResponse> {
        return this.chatService.updateStatus(request.user.memberId, id, body.status);
    }



    @Delete(':id')
    remove(
        @Req() request: AuthenticatedRequest,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        return this.chatService.remove(request.user.memberId, id);
    }
}
