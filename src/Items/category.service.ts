import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

type CategorySeed = {
  name: string;
  depth: number;
  children?: CategorySeed[];
};

const CATEGORY_TREE: CategorySeed[] = [
  {
    name: '의류',
    depth: 1,
    children: [
      {
        name: '남성의류',
        depth: 2,
        children: [
          { name: '상의', depth: 3 },
          { name: '하의', depth: 3 },
        ],
      },
      {
        name: '여성의류',
        depth: 2,
        children: [
          { name: '상의', depth: 3 },
          { name: '하의', depth: 3 },
        ],
      },
    ],
  },
  {
    name: '신발',
    depth: 1,
    children: [
      {
        name: '남성신발',
        depth: 2,
        children: [
          { name: '250', depth: 3 },
          { name: '260', depth: 3 },
          { name: '270', depth: 3 },
        ],
      },
      {
        name: '여성신발',
        depth: 2,
        children: [
          { name: '230', depth: 3 },
          { name: '240', depth: 3 },
          { name: '250', depth: 3 },
        ],
      },
    ],
  },
  {
    name: '스포츠',
    depth: 1,
    children: [
      {
        name: '축구',
        depth: 2,
        children: [
          { name: '축구화', depth: 3 },
          { name: '유니폼', depth: 3 },
        ],
      },
      {
        name: '농구',
        depth: 2,
        children: [
          { name: '농구화', depth: 3 },
          { name: '유니폼', depth: 3 },
        ],
      },
    ],
  },
];

@Injectable()
export class CategoryService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.categoryRepository.count();
    if (count > 0) {
      return;
    }

    await this.seedTree(CATEGORY_TREE, null);
  }

  findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { depth: 'ASC', id: 'ASC' },
    });
  }

  private async seedTree(nodes: CategorySeed[], parent: Category | null) {
    for (const node of nodes) {
      const category = await this.categoryRepository.save(
        this.categoryRepository.create({
          name: node.name,
          depth: node.depth,
          parentId: parent?.id ?? null,
          parent,
        }),
      );

      if (node.children?.length) {
        await this.seedTree(node.children, category);
      }
    }
  }
}
