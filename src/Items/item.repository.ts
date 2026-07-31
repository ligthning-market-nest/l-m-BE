import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { Member } from 'src/members/entities/member.entity';
import { ItemImage } from './entities/image.entity';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemRepository {
    constructor(
        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,
        private readonly dataSource: DataSource,    //데이터베이스 연결 관리하는 객체
    ) {}

    
    async createWithImages(
        itemData: DeepPartial<Item>, //아이템 객체 저장할 때 필요한 필드만 저장하게 해줌
        seller: Member, // 판매자
        imageUrls: string[] //이미지 여러개니까 배열로 저장
    ): Promise<Item> {

        const itemId = await this.dataSource.transaction(async (manager) => {
            //manager는 트랜잭션 db 담당이어서 기본적인 curd 메서드가 있음
            const item = manager.create(Item, {
                ...itemData,
                sellerId: seller.id,
                seller,
            });

            const saveItem = await manager.save(Item, item);

            const images = imageUrls.map((url) =>
                manager.create(ItemImage, {
                    url,
                    itemId: saveItem.id,
                    item: saveItem,
                }),
            );
            await manager.save(ItemImage, images);
            return saveItem.id;
        });

        const item = await this.findById(itemId);
        return item as Item; //item을 Item 타입으로 반환
    }

    

    findAll(): Promise<Item[]> {
        return this.itemRepository.find({
            relations: { seller: true, images: true, category: true },
            order: { createdAt: 'DESC' },
        });
    }


    findById(id: number): Promise<Item | null> {
        return this.itemRepository.findOne({
            where: { id },
            relations: { seller: true, images: true, category: true },
        })
    }

    async updateWithImage(
        item: Item,
        itemData: DeepPartial<Item>, 
        imageUrls?: string[], //?는 수정안하면 기존 이미지 사용
    ): Promise<Item> {
        await this.dataSource.transaction(async (manager) => {
            manager.merge(Item, item, itemData);
            await manager.save(Item, item);

            if (imageUrls) {
                await manager.delete(ItemImage, { itemId: item.id});

                const images = imageUrls.map((url) => 
                    manager.create(ItemImage, {
                        url,
                        itemId: item.id,
                        item,
                    }),
                );
                await manager.save(ItemImage, images);
            }
        });

        const updateItem = await this.findById(item.id);
        return updateItem as Item;
    }

    remove(item: Item): Promise<Item> {
        return this.itemRepository.remove(item);
    }   

}
