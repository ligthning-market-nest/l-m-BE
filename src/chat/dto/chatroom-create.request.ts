import { IsInt, Min } from 'class-validator';

export class ChatroomCreateRequest {
    @IsInt()
    @Min(1)
    itemId: number;
}
