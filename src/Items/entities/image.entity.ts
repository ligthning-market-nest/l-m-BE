import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from './item.entity';

@Entity('images')
export class ItemImage {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'varchar', length: 2048, nullable: false })
    url: string;

    @Column({ name: 'item_id', type: 'bigint', nullable: false })
    itemId: number;

    @ManyToOne(() => Item, (item) => item.images, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'item_id' })
    item: Item;
}
