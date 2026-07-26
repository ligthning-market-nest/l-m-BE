import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { ItemService } from '../Items/item.service';
import { MemberService } from '../members/member.service';

import {
    ChatMessageResponse,
    ChatroomResponse,
} from './dto/chat.response';

import { ChatRepository } from './chat.repository';
import { ChatroomStatus } from './entities/chatroom-status.enum';
import { Chatroom } from './entities/chatroom.entity';
import { ChatMessage } from './entities/message.entity';



@Injectable()
export class ChatService {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly itemService: ItemService,
        private readonly memberService: MemberService,
    ){}

    async create(memberId: number, itemId: number): Promise<ChatroomResponse> {
        const buyer = await this.memberService.findById(memberId);
        const item = await this.itemService.findEntity(itemId);

        if(item.sellerId === memberId) {
            throw new ForbiddenException("본인 상품에는 채팅을 요청할 수 없습니다.");
        }

        const existing = await this.chatRepository.findExisting(itemId, memberId);

        if(existing) {
            return this.toChatroomResponse(existing);
        }

        const createRoom = await this.chatRepository.create(item,buyer);

        return this.toChatroomResponse(
            await this.chatRepository.findById(createRoom.id) as Chatroom,
        );
    }

    async history(
        memberId: number,
        statusValue?: string,
    ): Promise<ChatroomResponse[]> {
        const status = this.parseStatus(statusValue);
        const chatrooms = this.chatRepository.findHistory(memberId,status);

        return (await chatrooms).map((chatroom) => this.toChatroomResponse(chatroom));
    }

    async detail(memberId: number, id: number): Promise<ChatroomResponse> {
        return this.toChatroomResponse(await this.findParticipatingChatroom(memberId, id));
    }

    async messages(memberId: number, chatroomId: number): Promise<ChatMessageResponse[]> {
        await this.findParticipatingChatroom(memberId, chatroomId);
        await this.chatRepository.markMessagesRead(chatroomId, memberId);

        const messages = await this.chatRepository.findMessages(chatroomId);

        return messages.map((message) => this.toMessageResponse(message));
    }


    async sendMessage(
        memberId: number,
        chatroomId: number,
        content: string,
    ): Promise<ChatMessageResponse> {
        const trimContent = content.trim();

        if(!trimContent) {
            throw new BadRequestException("빈 메시지는 전송할 수 없습니다.");
        }

        const chatroom = await this.findParticipatingChatroom(memberId, chatroomId);
        const sender = await this.memberService.findById(memberId);
        const message = await this.chatRepository.createMessage(chatroom, sender, trimContent);

        if(chatroom.status === ChatroomStatus.WAITING) {
            chatroom.status = ChatroomStatus.IN_PROGRESS; //진행중으로 바꿈
            await this.chatRepository.saveChatroom(chatroom);
        }

        message.sender = sender;

        return this.toMessageResponse(message);
    }



    async remove(memberId: number, id: number): Promise<{ message: string }> {
        const chatroom = await this.findParticipatingChatroom(memberId, id);
        await this.chatRepository.remove(chatroom);
        
        return { message: "채팅방이 삭제되었습니다." }
    }


    //상태 수정
    async updateStatus(
        memberId: number,
        id: number,
        status: ChatroomStatus,
    ): Promise<ChatroomResponse> {
        const chatroom = await this.findParticipatingChatroom(memberId, id);
        chatroom.status = status;

        return this.toChatroomResponse(
            await this.chatRepository.saveChatroom(chatroom),
        );
    }


    //채팅방 접근
    private async findParticipatingChatroom(
        memberId: number,
        id: number,
    ): Promise<Chatroom> {
        const chatroom = await this.chatRepository.findById(id);

        if(!chatroom) {
            throw new NotFoundException("채팅방을 찾을 수 없습니다.");
        }

        if(chatroom.buyerId !== memberId && chatroom.sellerId !== memberId) {
            throw new BadRequestException("채팅방 참여자만 접근할 수 있습니다.");
        }

        return chatroom
    }

    // 채팅방 상태
    private parseStatus(status?: string): ChatroomStatus | undefined {

        if (!status) {
            return undefined;
        }

        if(!Object.values(ChatroomStatus).includes(status as ChatroomStatus)) {
            throw new BadRequestException("올바르지 않은 채팅방 상태입니다.");
        }

        return status as ChatroomStatus;
    }


    private toChatroomResponse(chatroom: Chatroom): ChatroomResponse {
        return {
            id: chatroom.id,
            item: this.itemService.toResponse(chatroom.item),
            buyer: {
                id: chatroom.buyer.id,
                nickname: chatroom.buyer.nickname,
            },
            seller: {
                id: chatroom.seller.id,
                nickname: chatroom.seller.nickname,
            },
            status: chatroom.status,
            messages: (chatroom.messages ?? [])
                .sort((first, second) => first.createdAt.getTime() - second.createdAt.getTime())
                .map((message) => this.toMessageResponse(message)),
            createdAt: chatroom.createdAt,
            updatedAt: chatroom.updatedAt,
        }
    }



    private toMessageResponse(message: ChatMessage): ChatMessageResponse {
        return {
            id: message.id,
            content: message.content,
            isRead: message.isRead,
            sender: {
                id: message.sender.id,
                nickname: message.sender.nickname
            },
            createdAt: message.createdAt,
        }
    }


}
