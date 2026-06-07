import { Prisma } from '@prisma/client';
import { CloudinaryService } from './cloudinary.service';
import { MovieRepository } from '../repositories/movie.repository';
import { CreateMovieData, MovieFilters, MoviePayload, UpdateMoviePayload } from '../types/movie';
import { HttpStatus } from '../constants/httpStatus';
import { HttpError } from '../utils/httpError';

export type MovieFiles = {
  image?: Express.Multer.File[];
  trailerVideo?: Express.Multer.File[];
};

export class MovieService {
  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createMovie(payload: MoviePayload, files?: MovieFiles) {
    const data = await this.applyUploads(payload, files);
    return this.movieRepository.create(data as CreateMovieData);
  }

  listMovies(filters: MovieFilters) {
    return this.movieRepository.findMany(filters);
  }

  async getMovie(id: string) {
    const movie = await this.movieRepository.findById(id);
    if (!movie) {
      throw new HttpError(HttpStatus.NOT_FOUND, 'Movie not found');
    }

    return movie;
  }

  async updateMovie(id: string, payload: UpdateMoviePayload, files?: MovieFiles) {
    await this.getMovie(id);
    const data = await this.applyUploads(payload, files);

    if (Object.keys(data).length === 0) {
      throw new HttpError(HttpStatus.BAD_REQUEST, 'At least one field is required');
    }

    try {
      return await this.movieRepository.update(id, data);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async deleteMovie(id: string) {
    await this.getMovie(id);

    try {
      await this.movieRepository.delete(id);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async applyUploads<T extends MoviePayload | UpdateMoviePayload>(
    payload: T,
    files: MovieFiles | undefined,
  ): Promise<T> {
    const data = { ...payload };
    const imageFile = files?.image?.[0];
    const trailerFile = files?.trailerVideo?.[0];

    if (imageFile) {
      data.image = await this.cloudinaryService.uploadFile(imageFile, 'image');
    }

    if (trailerFile) {
      data.trailerVideo = await this.cloudinaryService.uploadFile(trailerFile, 'video');
    }

    return data;
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2023') {
      throw new HttpError(HttpStatus.BAD_REQUEST, 'Invalid movie id');
    }

    throw error;
  }
}
