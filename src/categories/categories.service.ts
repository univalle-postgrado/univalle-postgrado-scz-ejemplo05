import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  private async findOneOrFail(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id }
    });
    if (!category) {
      throw new NotFoundException(`La categoría con el Id ${id} no existe`);
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const existsCategory = await this.categoriesRepository.exists({
      where: { 
        title: createCategoryDto.title
      }
    });
    if (existsCategory) {
      throw new ConflictException('El título ya está registrado');
    }
    return this.categoriesRepository.save(createCategoryDto);
  }

  findAll() {
    return this.categoriesRepository.find();
  }

  findOne(id: number) {
    return this.findOneOrFail(id);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOneOrFail(id);

    if (updateCategoryDto.title != null) {
      const existsCategory = await this.categoriesRepository.exists({
        where: { 
          title: updateCategoryDto.title,
          id: Not(id)
        }
      });
      if (existsCategory) {
        throw new ConflictException('El título ya está registrado');
      }

      category.title = updateCategoryDto.title;
    }
    if (updateCategoryDto.description != null) {
      category.description = updateCategoryDto.description;
    }
    if (updateCategoryDto.enabled != null) {
      category.enabled = updateCategoryDto.enabled;
    }

    return this.categoriesRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.findOneOrFail(id);

    return this.categoriesRepository.delete(id);
  }
}
