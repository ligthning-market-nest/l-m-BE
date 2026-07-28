import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ChatroomJoinRequest {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    chatroomId: number;
}
