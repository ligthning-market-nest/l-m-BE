import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../members/member.module';
import { Category } from './entities/category.entity';
import { ItemImage } from './entities/image.entity';
import { Item } from './entities/item.entity';
import { ItemController } from './item.controller';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { ItemRepository } from './item.repository';
import { ItemService } from './item.service';
import { UploadedFilesCleanupInterceptor } from './interceptors/uploaded-files-cleanup.interceptor';

@Module({
    imports: [
        TypeOrmModule.forFeature([Item, ItemImage, Category]),
        AuthModule,
        MemberModule,
    ],
    controllers: [ItemController, CategoryController],
    providers: [
        CategoryService,
        ItemRepository,
        ItemService,
        UploadedFilesCleanupInterceptor,
    ],
    exports: [ItemRepository, ItemService, TypeOrmModule],
})
export class ItemModule {}
