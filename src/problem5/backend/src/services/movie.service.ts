import { Prisma } from '@prisma/client';
import { MovieRepository } from '../repositories/movie.repository';
import { CreateMovieData, MovieFilters, MoviePayload, UpdateMoviePayload } from '../types/movie';
import { HttpStatus } from '../constants/httpStatus';
import { HttpError } from '../utils/httpError';
import { MediaUploadService } from './media-upload.service';

export type MovieFiles = {
  image?: Express.Multer.File[];
  trailerVideo?: Express.Multer.File[];
};

export class MovieService {
  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly mediaUploadService: MediaUploadService,
  ) {}

  async createMovie(payload: MoviePayload, files?: MovieFiles) {
    const movie = await this.movieRepository.create(payload as CreateMovieData);
    await this.enqueueUploads(movie.id, files);

    return movie;
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
    const hasPayload = Object.keys(payload).length > 0;
    const hasFiles = this.hasUploadFiles(files);

    if (!hasPayload && !hasFiles) {
      throw new HttpError(HttpStatus.BAD_REQUEST, 'At least one field is required');
    }

    try {
      const movie = hasPayload ? await this.movieRepository.update(id, payload) : await this.getMovie(id);
      await this.enqueueUploads(id, files);

      return movie;
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

  private hasUploadFiles(files: MovieFiles | undefined) {
    return Boolean(files?.image?.[0] || files?.trailerVideo?.[0]);
  }

  private async enqueueUploads(movieId: string, files: MovieFiles | undefined) {
    const imageFile = files?.image?.[0];
    const trailerFile = files?.trailerVideo?.[0];

    if (imageFile) {
      await this.mediaUploadService.publish({
        movieId,
        field: 'image',
        resourceType: 'image',
        file: {
          buffer: imageFile.buffer.toString('base64'),
          mimetype: imageFile.mimetype,
          originalname: imageFile.originalname,
          size: imageFile.size,
        },
      });
    }

    if (trailerFile) {
      await this.mediaUploadService.publish({
        movieId,
        field: 'trailerVideo',
        resourceType: 'video',
        file: {
          buffer: trailerFile.buffer.toString('base64'),
          mimetype: trailerFile.mimetype,
          originalname: trailerFile.originalname,
          size: trailerFile.size,
        },
      });
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2023') {
      throw new HttpError(HttpStatus.BAD_REQUEST, 'Invalid movie id');
    }

    throw error;
  }
}
