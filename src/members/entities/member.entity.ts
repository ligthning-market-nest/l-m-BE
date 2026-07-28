import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ConnectionStatus } from './enums/connectionStatus.enum';
import { AuthMethod } from './enums/auth-method.enum';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nickname: string | null;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  kakaoId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  appleId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  googleId: string | null;

  @Column({ type: 'enum', enum: ['local', 'google', 'apple', 'kakao'] })
  authMethod: AuthMethod;

  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.OFFLINE,
  })
  connectionStatus: ConnectionStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  introduction: string | null;

  @Column({ name: 'token_balance', type: 'int', default: 1000 })
  tokenBalance: number;

  @Column({ name: 'nickname_updated_at', type: 'datetime', nullable: true })
  nicknameUpdatedAt: Date | null;

  @Column({ name: 'introduction_updated_at', type: 'datetime', nullable: true })
  introductionUpdatedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
