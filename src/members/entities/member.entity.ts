import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConnectionStatus } from './enums/connectionStatus.enum';

//회원 인증 방식
//local은 그냥 로그인, 구글은 구글 로그인
export type AuthMethod = 'local' | 'google';

@Entity('members')
export class Member {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nickname: string | null;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  googleId: string | null;

  @Column({ type: 'enum', enum: ['local', 'google'], default: 'google' })
  authMethod: AuthMethod;

  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.OFFLINE,
  })
  connectionStatus: ConnectionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
