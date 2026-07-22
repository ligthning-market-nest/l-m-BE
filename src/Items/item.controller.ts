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
    UseGuards,
} from '@nestjs/common';




import type { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ItemResponse } from './dto/item.response';
import { SaleUpdateRequest } from './dto/sale.update.request';
import { SellRequest } from './dto/sell.request';
import { ItemService } from './item.service';


type AuthenticatedRequest = Request & { user: { memberId: number }}

@Controller('trade/sale')
@UseGuards(JwtAuthGuard)
export class ItemController {
    constructor(private readonly itemService: ItemService) {}


    //판매글 생성
    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Body() body: SellRequest,
    ): Promise<ItemResponse> {
        return this.itemService.create(request.user.memberId,body);
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
        @Param(':id', ParseIntPipe) id: number,    
    ): Promise<{ message: string }> {
        return this.itemService.remove(request.user.memberId,id);
    }
 



}
