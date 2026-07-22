import { IsInt, Min } from 'class-validator';

export class WishlistRequest {
    @IsInt()
    @Min(1)
    itemId: number;
}
