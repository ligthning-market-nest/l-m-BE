import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Item } from '../Items/entities/item.entity';
import { Member } from '../members/entities/member.entity';
import { Trade } from './entities/trade.entity';
import { Wishlist } from './entities/wishlist.entity';



@Injectable()
export class TradeRepository {
    constructor(
        @InjectRepository(Trade)
        private readonly tradeRepository: Repository<Trade>,
        @InjectRepository(Wishlist)
        private readonly wishlistRepository: Repository<Wishlist>,
        private readonly dataSource: DataSource,
    ) {}



    async purchase(itemId: number, buyerId: number): Promise<Trade> {
        const tradeId = await this.dataSource.transaction(async (manager) => {
            const item = await manager.findOne(Item, {
                where: { id: itemId },
                relations: { seller: true, images: true },
                lock: { mode: 'pessimistic_write' },
            });

            if (!item) {
                throw new NotFoundException('상품을 찾을 수 없습니다.');
            }


            if (item.sellerId === buyerId) {
                throw new ForbiddenException('본인이 등록한 상품은 구매할 수 없습니다.');
            }

            if (item.stock < 1) {
                throw new ConflictException('품절된 상품입니다.');
            }

            const buyer = await manager.findOne(Member, {
                where: { id: buyerId },
                lock: { mode: 'pessimistic_write' },
            });
            const seller = await manager.findOne(Member, {
                where: { id: item.sellerId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!buyer || !seller) {
                throw new NotFoundException('거래 회원을 찾을 수 없습니다.');
            }

            if (buyer.tokenBalance < item.price) {
                throw new BadRequestException('보유 토큰이 부족합니다.');
            }

            item.stock -= 1;
            buyer.tokenBalance -= item.price;
            seller.tokenBalance += item.price;

            await manager.save(Item, item);
            await manager.save(Member, [buyer, seller]);

            const trade = manager.create(Trade, {
                itemId: item.id,
                item,
                buyerId: buyer.id,
                buyer,
                sellerId: item.sellerId,
                seller,
                rating: null,
                review: null,
                isCompleted: true,
            });

            const savedTrade = await manager.save(Trade, trade);
            await manager.delete(Wishlist, { memberId: buyer.id, itemId: item.id });

            return savedTrade.id;
        });

        const trade = await this.findTradeById(tradeId);


        return trade as Trade;
    }



    findHistory(memberId: number): Promise<Trade[]> {
        return this.tradeRepository.find({
            where: [{ buyerId: memberId }, { sellerId: memberId }],
            relations: {
                item: { seller: true, images: true },
                buyer: true,
                seller: true,
            },
            order: { tradingDay: 'DESC' },
        });
    }



    findTradeById(id: number): Promise<Trade | null> {
        return this.tradeRepository.findOne({
            where: { id },
            relations: {
                item: { seller: true, images: true },
                buyer: true,
                seller: true,
            },
        });
    }



    saveTrade(trade: Trade): Promise<Trade> {
        return this.tradeRepository.save(trade);
    }


    findWishlist(memberId: number, itemId: number): Promise<Wishlist | null> {
        return this.wishlistRepository.findOne({ where: { memberId, itemId } });
    }



    createWishlist(member: Member, item: Item): Promise<Wishlist> {
        return this.wishlistRepository.save(
            this.wishlistRepository.create({
                memberId: member.id,
                member,
                itemId: item.id,
                item,
            }),
        );
    }



    findWishlists(memberId: number): Promise<Wishlist[]> {
        return this.wishlistRepository.find({
            where: { memberId },
            relations: { item: { seller: true, images: true } },
            order: { createdAt: 'DESC' },
        });
    }




    findWishlistById(id: number, memberId: number): Promise<Wishlist | null> {
        return this.wishlistRepository.findOne({
            where: { id, memberId },
            relations: { item: { seller: true, images: true } },
        });
    }



    async deleteWishlist(id: number, memberId: number): Promise<boolean> {
        const result = await this.wishlistRepository.delete({ id, memberId });

        return result.affected === 1;
    }
}
