import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ChatroomCreateRequest {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    itemId: number;
}
