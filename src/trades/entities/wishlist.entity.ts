import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    Column,
} from 'typeorm';
import { Item } from '../../Items/entities/item.entity';
import { Member } from '../../members/entities/member.entity';

@Entity('wishlists')
@Unique('UQ_wishlists_member_item', ['memberId', 'itemId'])
export class Wishlist {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'member_id', type: 'int', nullable: false })
    memberId: number;

    @ManyToOne(() => Member, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'member_id' })
    member: Member;

    @Column({ name: 'item_id', type: 'bigint', nullable: false })
    itemId: number;

    @ManyToOne(() => Item, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'item_id' })
    item: Item;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;
}
