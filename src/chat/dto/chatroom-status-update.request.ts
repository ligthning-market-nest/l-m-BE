import { IsEnum } from 'class-validator';
import { ChatroomStatus } from '../entities/chatroom-status.enum';

export class ChatroomStatusUpdateRequest {
    @IsEnum(ChatroomStatus)
    status: ChatroomStatus;
}
