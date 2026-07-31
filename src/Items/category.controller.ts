import { Controller, Get } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { CategoryService } from './category.service';

@Controller('trade/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }
}
