import { IsInt, Min } from 'class-validator';

export class ChatroomJoinRequest {
    @IsInt()
    @Min(1)
    chatroomId: number;
}
