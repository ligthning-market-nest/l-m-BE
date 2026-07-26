import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class MessageSendRequest {
    @IsInt()
    @Min(1)
    chatroomId: number;

    @IsString()
    @MinLength(1)
    @MaxLength(2000)
    content: string;
}
