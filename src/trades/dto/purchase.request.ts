import { IsInt, Min } from 'class-validator';

export class PurchaseRequest {
    @IsInt()
    @Min(1)
    itemId: number;
}
