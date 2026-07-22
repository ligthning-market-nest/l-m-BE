import { ItemResponse } from '../../Items/dto/item.response';

export class TradeMemberResponse {
    id: number;
    nickname: string | null;
}

export class TradeResponse {
    id: number;
    item: ItemResponse;
    buyer: TradeMemberResponse;
    seller: TradeMemberResponse;
    tradingDay: Date;
    rating: number | null;
    review: string | null;
    isCompleted: boolean;
}

export class WishlistResponse {
    id: number;
    item: ItemResponse;
    createdAt: Date;
}
