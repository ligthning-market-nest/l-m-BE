import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from '../../Items/entities/item.entity';
import { Member } from 'src/members/entities/member.entity';

@Entity('trades')
export class Trade {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'item_id', type: 'bigint', nullable: false })
    itemId: number;

    @ManyToOne(() => Item, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'item_id' })
    item: Item;

    @Column({ name: 'buyer_id', type: 'int', nullable: false })
    buyerId: number;

    @ManyToOne(() => Member, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'buyer_id' })
    buyer: Member;

    @Column({ name: 'seller_id', type: 'int', nullable: false })
    sellerId: number;

    @ManyToOne(() => Member, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'seller_id' })
    seller: Member;

    @CreateDateColumn({ name: 'trading_day', type: 'datetime' })
    tradingDay: Date;

    @Column({ type: 'smallint', nullable: true })
    rating: number | null;

    @Column({ type: 'text', nullable: true })
    review: string | null;

    @Column({ name: 'is_completed', type: 'boolean', default: false })
    isCompleted: boolean;
}
