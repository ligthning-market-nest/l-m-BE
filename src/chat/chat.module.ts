import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemModule } from '../Items/item.module';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../members/member.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatRepository } from './chat.repository';
import { ChatService } from './chat.service';
import { Chatroom } from './entities/chatroom.entity';
import { ChatMessage } from './entities/message.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Chatroom, ChatMessage]),
        AuthModule,
        ItemModule,
        MemberModule,
    ],
    controllers: [ChatController],
    providers: [ChatGateway, ChatRepository, ChatService],
})
export class ChatModule {}
