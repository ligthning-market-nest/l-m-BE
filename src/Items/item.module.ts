import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../members/member.module';
import { ItemImage } from './entities/image.entity';
import { Item } from './entities/item.entity';
import { ItemController } from './item.controller';
import { ItemRepository } from './item.repository';
import { ItemService } from './item.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Item, ItemImage]),
        AuthModule,
        MemberModule,
    ],
    controllers: [ItemController],
    providers: [ItemRepository, ItemService],
    exports: [ItemRepository, ItemService, TypeOrmModule],
})
export class ItemModule {}
