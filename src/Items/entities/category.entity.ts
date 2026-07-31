import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 80, nullable: false })
  name: string;

  @Column({ type: 'tinyint', nullable: false, default: 1 })
  depth: number;

  @Column({ name: 'parent_id', type: 'bigint', nullable: true })
  parentId: number | null;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];
}
