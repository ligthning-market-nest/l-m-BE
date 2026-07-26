import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

import { Item } from 'src/Items/entities/item.entity';
import { Member } from 'src/members/entities/member.entity';
import { ChatMessage } from './message.entity';
import { ChatroomStatus } from './chatroom-status.enum';

@Entity('chatroom')
@Unique('UQ_chatroom_item_buyer', ['itemId', 'buyerId'])
export class Chatroom {


    @PrimaryGeneratedColumn({ type: 'bigint'})
    id: number;

    @Column({ name: 'item_id', type: 'bigint', nullable: false })
    itemId: number;

    @ManyToOne(() => Item, { nullable: false, onDelete: 'CASCADE'})
    @JoinColumn({ name: 'item_id'})
    item: Item;

    @Column( {name: 'buyer_id', type: 'bigint', nullable: false })
    buyerId: number;


    @ManyToOne(() => Member, {nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'buyer_id'})
    buyer: Member;

    @Column({ name: 'seller_id', type: 'bigint', nullable: false })
    sellerId: number;


    @ManyToOne(() => Member, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'seller_id' })
    seller: Member;

    @Column({ type: 'enum', enum: ChatroomStatus, default: ChatroomStatus.WAITING })
    status: ChatroomStatus;
    

    @OneToMany(() => ChatMessage, (message) => message.chatroom, { cascade: true })
    messages: ChatMessage[];

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;
    
}

