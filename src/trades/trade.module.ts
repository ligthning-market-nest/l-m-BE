import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemModule } from '../Items/item.module';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../members/member.module';
import { Trade } from './entities/trade.entity';
import { Wishlist } from './entities/wishlist.entity';
import { TradeController } from './trade.controller';
import { TradeRepository } from './trade.repository';
import { TradeService } from './trade.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Trade, Wishlist]),
        AuthModule,
        ItemModule,
        MemberModule,
    ],
    controllers: [TradeController],
    providers: [TradeRepository, TradeService],
    exports: [TradeRepository, TradeService],
})
export class TradeModule {}
