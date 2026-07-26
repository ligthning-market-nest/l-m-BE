import  {
    Column,
    JoinColumn,
    Entity,
    ManyToOne,
    CreateDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Member } from 'src/members/entities/member.entity';
import { Chatroom } from './chatroom.entity';


@Entity('messages')
export class ChatMessage {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'text', nullable: false })
    content:  string;

    @Column({ name: 'is_read', type: 'boolean', default: false })
    isRead: boolean;

    @Column({ name: 'chatroom_id', type: 'bigint', nullable: false })
    chatroomId: number;

    @ManyToOne(() => Chatroom, {nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chatroom_id' })
    chatroom: Chatroom;

    @Column({ name: 'sender_id', type: 'bigint', nullable: false })
    senderId: number;

    @ManyToOne(() => Member, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sender_id' })
    sender: Member;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;
}