import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ItemService } from '../Items/item.service';
import { MemberService } from '../members/member.service';
import {
    TradeResponse,
    WishlistResponse,
} from './dto/trade.response';
import { Trade } from './entities/trade.entity';
import { Wishlist } from './entities/wishlist.entity';
import { TradeRepository } from './trade.repository';

@Injectable()
export class TradeService {
    constructor(
        private readonly tradeRepository: TradeRepository,
        private readonly itemService: ItemService,
        private readonly memberService: MemberService,
    ) {}

    async purchase(memberId: number, itemId: number): Promise<TradeResponse> {
        const buyer = await this.memberService.findById(memberId);
        return this.toTradeResponse(await this.tradeRepository.purchase(itemId, buyer));
    }

    async history(memberId: number): Promise<TradeResponse[]> {
        const trades = await this.tradeRepository.findHistory(memberId);
        return trades.map((trade) => this.toTradeResponse(trade));
    }

    async addWishlist(memberId: number, itemId: number): Promise<WishlistResponse> {
        const existing = await this.tradeRepository.findWishlist(memberId, itemId);
        if (existing) {
            throw new ConflictException('이미 찜한 상품입니다.');
        }

        const member = await this.memberService.findById(memberId);
        const item = await this.itemService.findEntity(itemId);
        const wishlist = await this.tradeRepository.createWishlist(member, item);
        const savedWishlist = await this.tradeRepository.findWishlistById(
            wishlist.id,
            memberId,
        );
        return this.toWishlistResponse(savedWishlist as Wishlist);
    }

    async wishlists(memberId: number): Promise<WishlistResponse[]> {
        const wishlists = await this.tradeRepository.findWishlists(memberId);
        return wishlists.map((wishlist) => this.toWishlistResponse(wishlist));
    }

    async wishlist(memberId: number, id: number): Promise<WishlistResponse> {
        const wishlist = await this.tradeRepository.findWishlistById(id, memberId);
        if (!wishlist) {
            throw new NotFoundException('찜한 상품을 찾을 수 없습니다.');
        }
        return this.toWishlistResponse(wishlist);
    }

    private toTradeResponse(trade: Trade): TradeResponse {
        return {
            id: trade.id,
            item: this.itemService.toResponse(trade.item),
            buyer: {
                id: trade.buyer.id,
                nickname: trade.buyer.nickname,
            },
            seller: {
                id: trade.seller.id,
                nickname: trade.seller.nickname,
            },
            tradingDay: trade.tradingDay,
            rating: trade.rating,
            review: trade.review,
            isCompleted: trade.isCompleted,
        };
    }

    private toWishlistResponse(wishlist: Wishlist): WishlistResponse {
        return {
            id: wishlist.id,
            item: this.itemService.toResponse(wishlist.item),
            createdAt: wishlist.createdAt,
        };
    }
}
