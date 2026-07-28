import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
    BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
    ITEM_IMAGE_MAX_COUNT,
    itemImageUploadOptions,
} from './config/item-image-upload.config';
import { ItemResponse } from './dto/item.response';
import { SaleUpdateRequest } from './dto/sale.update.request';
import { SellRequest } from './dto/sell.request';
import { UploadedFilesCleanupInterceptor } from './interceptors/uploaded-files-cleanup.interceptor';
import { ItemService } from './item.service';

type AuthenticatedRequest = Request & { user: { memberId: number }}
type UploadedItemImage = {
    filename: string;
};

@Controller('trade/sale')
@UseGuards(JwtAuthGuard)
export class ItemController {
    constructor(private readonly itemService: ItemService) {}


    //판매글 생성
    @Post()
    @UseInterceptors(
        FilesInterceptor(
            'images',
            ITEM_IMAGE_MAX_COUNT,
            itemImageUploadOptions,
        ),
        UploadedFilesCleanupInterceptor,
    )
    create(
        @Req() request: AuthenticatedRequest,
        @Body() body: SellRequest,
        @UploadedFiles() images: UploadedItemImage[],
    ): Promise<ItemResponse> {
        if (!images?.length) {
            throw new BadRequestException(
                '상품 이미지를 최소 한 장 등록하세요.',
            );
        }

        const imageUrls = images.map(
            (image) => `/uploads/items/${image.filename}`,
        );

        return this.itemService.create(
            request.user.memberId,
            body,
            imageUrls,
        );
    }

    //판매글 전체 조회
    @Get()
    findAll(): Promise<ItemResponse[]> {
        return this.itemService.findAll();
    }


    //상세 조회
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<ItemResponse> {
        return this.itemService.findOne(id);
    }

    //수정
    @Patch(':id')
    update(
        @Req() request: AuthenticatedRequest,
        @Param('id', ParseIntPipe) id: number,
        @Body() body: SaleUpdateRequest,
    ): Promise<ItemResponse> {
        return this.itemService.update(request.user.memberId,id,body);
    }

    //삭제
    @Delete(':id')
    delete(
        @Req() request: AuthenticatedRequest,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        return this.itemService.remove(request.user.memberId,id);
    }
 



}
