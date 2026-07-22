import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { MemberService } from 'src/members/member.service';
import { ItemResponse } from './dto/item.response';
import { SaleUpdateRequest } from './dto/sale.update.request';
import { SellRequest } from './dto/sell.request';
import { Item } from './entities/item.entity';
import { ItemRepository } from './item.repository';


@Injectable()
export class ItemService {
    constructor(
        private readonly itemRepository: ItemRepository,
        private readonly memberService: MemberService,
    ) {}

    async create(memberId: number, request: SellRequest): Promise<ItemResponse> {
        const seller = await this.memberService.findById(memberId);
        
        //상품 객체 생성 및 저장
        const item = await this.itemRepository.createWithImages(
            {
                name: request.name.trim(),  
                status: request.status,
                description: request.description.trim(),
                price: request.price,
                category: request.category,
                tags: request.tags,
                directTrade: request.directTrade,
            },
        seller,
        request.imageUrls,
    );
        return this.toResponse(item);
    }

    async findAll(): Promise<ItemResponse[]> {
        const item = await this.itemRepository.findAll();
        return item.map((item) => this.toResponse(item));
    }

    async findOne(itemId: number): Promise<ItemResponse> {
        return this.toResponse(await this.findEntity(itemId));
    }

    async update(
        memberId: number,
        id: number,
        request: SaleUpdateRequest,
    ): Promise<ItemResponse> {
        const item = await this.findEntity(id); //상품 찾기
        this.checkOwner(item, memberId);    //권한 체크

        //객체 업데이트 및 저장
        const updateItem = await this.itemRepository.updateWithImage(
            item,
            {
                name: request.name?.trim(),
                status: request.status,
                description: request.description?.trim(),
                price: request.price,
                category: request.category,
                stock: request.stock,
                tags: request.tags?.map((tag) => tag.trim()).filter(Boolean),
                directTrade: request.directTrade,
            },
            request.imageUrls,
        );
        return this.toResponse(updateItem);
    }


    async remove(memberId: number, id: number): Promise<{ message: string}> {
        const item = await this.findEntity(id);
        this.checkOwner(item, memberId);
        await this.itemRepository.remove(item);

        return { message: '판매글 삭제되었습니다.' };
    }


    async findEntity(id: number): Promise<Item> {
        const item = await this.itemRepository.findById(id);

        if(!item) {
            throw new NotFoundException('상품을 찾을 수 없습니다.');
        }
        return item;
    }


    //객체 반환
    toResponse(item: Item): ItemResponse {
        return {
            id: item.id,
            name: item.name,
            status: item.status,
            description: item.description,
            price: item.price,
            category: item.category,
            stock: item.stock,
            tags: item.tags,
            directTrade: item.directTrade,
            seller: {
                id: item.seller.id,
                nickname: item.seller.nickname,
            },
            images: (item.images ?? []).map((image) => ({
                id: image.id,
                url: image.url,
            })),
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        }
    }


    private checkOwner(item: Item, memberId: number): void {
        if(item.sellerId !== memberId) {
            throw new ForbiddenException("판매자만 상품을 수정할 수 있습니다.")
        }
    }

    
}