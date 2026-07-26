import { HttpException, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';


import { Server, Socket } from 'socket.io';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { ChatService } from './chat.service';
import { ChatroomJoinRequest } from './dto/chatroom-join.request';
import { MessageSendRequest } from './dto/message-send.request';

@WebSocketGateway({
    namespace: 'chat',
    cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true,
    },
})
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChatGateway implements OnGatewayConnection {
    @WebSocketServer()
    private readonly server: Server;

    constructor(
        private readonly jwtService: JwtService,
        private readonly chatService: ChatService,
    ) {}


    async handleConnection(client: Socket): Promise<void> {
        try {
            const token = this.extractToken(client);
            const payload = await this.jwtService.verifyAsync<JwtPayloadDto>(token);
            client.data.memberId = payload.memberId;
        } catch {
            client.emit('authError', {
                message: '유효한 로그인이 필요합니다.',
            });
            client.disconnect();
        }
    }

    @SubscribeMessage('joinChatroom')
    async joinChatroom(
        @ConnectedSocket() client: Socket,
        @MessageBody() request: ChatroomJoinRequest,
    ): Promise<{ chatroomId: number }> {
        try {
            const memberId = this.getMemberId(client);
            await this.chatService.detail(memberId, request.chatroomId);
            await client.join(this.chatroomName(request.chatroomId));

            return {
                chatroomId: request.chatroomId,
            };
        } catch (error) {
            throw this.toWsException(error);
        }
    }

    @SubscribeMessage('sendMessage')
    async sendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() request: MessageSendRequest,
    ) {
        try {
            const memberId = this.getMemberId(client);
            const message = await this.chatService.sendMessage(
                memberId,
                request.chatroomId,
                request.content,
            );

            const chatroomName = this.chatroomName(request.chatroomId);
            await client.join(chatroomName);

            this.server.to(chatroomName).emit('messageCreated', message);

            return message;
        } catch (error) {
            throw this.toWsException(error);
        }
    }

    private extractToken(client: Socket): string {
        const authToken = client.handshake.auth?.token;

        if (typeof authToken === 'string' && authToken.trim()) {
            return authToken.replace(/^Bearer\s+/i, '');
        }

        const authorization = client.handshake.headers.authorization;
        
        if (authorization?.startsWith('Bearer ')) {
            return authorization.slice(7);
        }

        throw new WsException('액세스 토큰이 없습니다.');
    }

    private getMemberId(client: Socket): number {
        const memberId = client.data.memberId;

        if (typeof memberId !== 'number') {
            throw new WsException('인증되지 않은 연결입니다.');
        }

        return memberId;
    }

    private chatroomName(chatroomId: number): string {
        return `chatroom:${chatroomId}`;
    }

    private toWsException(error: unknown): WsException {
        if (error instanceof WsException) {
            return error;
        }

        if (error instanceof HttpException) {
            return new WsException(error.message);
        }
        
        return new WsException('채팅 처리 중 오류가 발생했습니다.');
    }
}
