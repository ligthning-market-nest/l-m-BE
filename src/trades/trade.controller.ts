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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PurchaseRequest } from './dto/purchase.request';
import { ReviewRequest } from './dto/review.request';
import { TradeResponse, WishlistResponse } from './dto/trade.response';
import { WishlistRequest } from './dto/wishlist.request';
import { TradeService } from './trade.service';

type AuthenticatedRequest = Request & { user: { memberId: number } };

@Controller('trade')
@UseGuards(JwtAuthGuard)
export class TradeController {
    constructor(private readonly tradeService: TradeService) {}

    @Post('purchase')
    purchase(
        @Req() request: AuthenticatedRequest,
        @Body() body: PurchaseRequest,
    ): Promise<TradeResponse> {
        return this.tradeService.purchase(request.user.memberId, body.itemId);
    }


    @Get('history')
    history(@Req() request: AuthenticatedRequest): Promise<TradeResponse[]> {
        return this.tradeService.history(request.user.memberId);
    }



    @Post('wishlist')
    addWishlist(
        @Req() request: AuthenticatedRequest,
        @Body() body: WishlistRequest,
    ): Promise<WishlistResponse> {
        return this.tradeService.addWishlist(request.user.memberId, body.itemId);
    }



    @Get('wishlist')
    wishlists(@Req() request: AuthenticatedRequest): Promise<WishlistResponse[]> {
        return this.tradeService.wishlists(request.user.memberId);
    }



    @Get('wishlist/:id')
    wishlist(
        @Req() request: AuthenticatedRequest,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<WishlistResponse> {
        return this.tradeService.wishlist(request.user.memberId, id);
    }



    @Delete('wishlist/:id')
    removeWishlist(
        @Req() request: AuthenticatedRequest,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        return this.tradeService.removeWishlist(request.user.memberId, id);
    }



    @Patch(':id/review')
    review(
        @Req() request: AuthenticatedRequest,
        @Param('id', ParseIntPipe) id: number,
        @Body() body: ReviewRequest,
    ): Promise<TradeResponse> {
        return this.tradeService.review(
            request.user.memberId,
            id,
            body.rating,
            body.review,
        );
    }
}
