import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Member } from 'src/members/entities/member.entity';
import { Category } from './category.enum';
import { ItemImage } from './image.entity';
import { Status } from './status.enum';

@Entity('items')
export class Item {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'varchar', length: 80, nullable: false })
    name: string;

    @Column({ type: 'enum', enum: Status, nullable: false })
    status: Status;

    @Column({ type: 'text', nullable: false })
    description: string;

    @Column({ type: 'int', nullable: false, default: 0 })
    price: number;

    @Column({ type: 'enum', enum: Category, nullable: false })
    category: Category;

    @Column({ type: 'int', nullable: false })
    stock: number;

    @Column({ type: 'simple-json', nullable: false })
    tags: string[];

    @Column({ name: 'direct_trade', type: 'boolean', default: false })
    directTrade: boolean;

    @Column({ name: 'seller_id', type: 'int', nullable: false })
    sellerId: number;

    @ManyToOne(() => Member, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'seller_id' })
    seller: Member;

    @OneToMany(() => ItemImage, (image) => image.item, { cascade: true })
    images: ItemImage[];

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;
}
