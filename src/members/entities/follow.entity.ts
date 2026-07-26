import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    Column,
} from 'typeorm';
import { Member } from './member.entity';

@Entity('follows')
@Unique('UQ_follows_follower_following', ['followerId', 'followingId'])
export class Follow {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'follower_id', type: 'int' })
    followerId: number;

    @ManyToOne(() => Member, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'follower_id' })
    follower: Member;

    @Column({ name: 'following_id', type: 'int' })
    followingId: number;

    @ManyToOne(() => Member, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'following_id' })
    following: Member;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;
}
