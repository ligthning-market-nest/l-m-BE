import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Item } from 'src/Items/entities/item.entity';
import { Member } from 'src/members/entities/member.entity';
import { ChatroomStatus } from './entities/chatroom-status.enum';
import { Chatroom } from './entities/chatroom.entity';
import { ChatMessage } from './entities/message.entity';



@Injectable()
export class ChatRepository {
    constructor(
        @InjectRepository(Chatroom)
        private readonly chatroomRepository: Repository<Chatroom>,

        @InjectRepository(ChatMessage)
        private readonly chatMessageRepository: Repository<ChatMessage>
    ) {}

    findExisting(itemId: number, buyerId: number): Promise<Chatroom | null> {
        return this.chatroomRepository.findOne({
            where: { itemId, buyerId },
            relations: this.chatroomRelations(),
        });
    }


    create(item: Item, buyer: Member): Promise<Chatroom> {
        return this.chatroomRepository.save(
            this.chatroomRepository.create({
                itemId: item.id,
                item,
                buyerId: buyer.id,
                buyer,
                sellerId: item.sellerId,
                seller: item.seller,
                status: ChatroomStatus.WAITING,
            }),
        );
    }

    findById(id: number): Promise<Chatroom | null> {
        return this.chatroomRepository.findOne({
            where: { id },
            relations: this.chatroomRelations(),
        });
    }

    findHistory(memberId: number, status?: ChatroomStatus): Promise<Chatroom[]> {
        return this.chatroomRepository.find({
            where: [
                { buyerId: memberId, ...(status ? { status } : {}) },
                { sellerId: memberId, ...(status ? { status } : {}) },
            ],
            relations: {
                item: { seller: true, images: true },
                buyer: true,
                seller: true,
            },
            order: { updatedAt: 'DESC' },
        });
    }

    saveChatroom(chatroom: Chatroom): Promise<Chatroom> {
        return this.chatroomRepository.save(chatroom);
    }

    createMessage(
        chatroom: Chatroom,
        sender: Member,
        content: string
    ): Promise<ChatMessage> {
        return this.chatMessageRepository.save(
            this.chatMessageRepository.create({
                content,
                chatroomId: chatroom.id,
                chatroom,
                senderId: sender.id,
                sender,
                isRead: false,
            }),
        );
    }


    findMessages(chatroomId: number): Promise<ChatMessage[]> {
        return this.chatMessageRepository.find({
            where: { chatroomId },
            relations: { sender: true },
            order: { createdAt: 'ASC' },
        });
    }

    async markMessagesRead(chatroomId: number, memberId: number): Promise<void> {
        await this.chatMessageRepository.update(
            {
                chatroomId,
                senderId: Not(memberId),
                isRead: false,
            },
            {
                isRead: true,
            },
        );
    }

    remove(chatroom: Chatroom): Promise<Chatroom> {
        return this.chatroomRepository.remove(chatroom);
    }






    private chatroomRelations() {
        return {
            item: { seller: true, images: true },
            buyer: true,
            seller: true,
            messages: { sender: true },
        };
    }
}
