import { ItemResponse } from '../../Items/dto/item.response';
import { ChatroomStatus } from '../entities/chatroom-status.enum';

export class ChatMemberResponse {
    id: number;
    nickname: string | null;
}

export class ChatMessageResponse {
    id: number;
    content: string;
    isRead: boolean;
    sender: ChatMemberResponse;
    createdAt: Date;
}

export class ChatroomResponse {
    id: number;
    item: ItemResponse;
    buyer: ChatMemberResponse;
    seller: ChatMemberResponse;
    status: ChatroomStatus;
    messages: ChatMessageResponse[];
    createdAt: Date;
    updatedAt: Date;
}
