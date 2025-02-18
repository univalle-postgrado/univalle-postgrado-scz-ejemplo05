import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  private async findOneOrFail(id: number, relations = false): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({
      where: { id: id }
    });
    if (!movie) {
      throw new NotFoundException(`La película con el Id ${id} no existe`);
    }
    return movie;
  }
  
  async create(createMovieDto: CreateMovieDto) {
    const existsCategory = await this.categoriesRepository.exists({
      where: { 
        id: createMovieDto.categoryId
      }
    });
    if (!existsCategory) {
      throw new ConflictException('La categoría no existe');
    }
    return this.moviesRepository.save(createMovieDto);
  }

  findAll() {
    return this.moviesRepository.find();
  }

  findOne(id: number) {
    return this.findOneOrFail(id);
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.findOneOrFail(id);

    if (updateMovieDto.title != null) {
      movie.title = updateMovieDto.title;
    }
    if (updateMovieDto.synopsis != null) {
      movie.synopsis = updateMovieDto.synopsis;
    }
    if (updateMovieDto.director != null) {
      movie.director = updateMovieDto.director;
    }
    if (updateMovieDto.releaseDate != null) {
      movie.releaseDate = updateMovieDto.releaseDate;
    }
    if (updateMovieDto.posterUrl != null) {
      movie.posterUrl = updateMovieDto.posterUrl;
    }
    if (updateMovieDto.rating != null) {
      movie.rating = updateMovieDto.rating;
    }
    if (updateMovieDto.categoryId != null) {
      const existsCategory = await this.categoriesRepository.exists({
        where: { 
          id: updateMovieDto.categoryId
        }
      });
      if (!existsCategory) {
        throw new ConflictException('La categoría no existe');
      }
      movie.categoryId = updateMovieDto.categoryId;
    }

    return this.moviesRepository.save(movie);
  }

  async remove(id: number) {
    const movie = await this.findOneOrFail(id);

    return this.moviesRepository.delete(id);
  }
}
