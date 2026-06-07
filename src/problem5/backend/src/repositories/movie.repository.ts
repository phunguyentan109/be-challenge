import { Movie, Prisma, PrismaClient } from '@prisma/client';
import prisma from '../config/prisma';
import { CreateMovieData, MovieFilters, UpdateMoviePayload } from '../types/movie';

interface MovieListResult {
  data: Movie[];
  pageInfo: {
    hasNextPage: boolean;
    nextCursor: string | null;
  };
}

const buildWhere = (filters: MovieFilters): Prisma.MovieWhereInput => {
  const where: Prisma.MovieWhereInput = {};

  if (filters.name) {
    where.name = {
      contains: filters.name,
      mode: 'insensitive',
    };
  }

  if (filters.minRating !== undefined || filters.maxRating !== undefined) {
    where.rating = {
      ...(filters.minRating !== undefined ? { gte: filters.minRating } : {}),
      ...(filters.maxRating !== undefined ? { lte: filters.maxRating } : {}),
    };
  }

  if (filters.createdFrom || filters.createdTo || filters.cursor) {
    where.createdAt = {
      ...(filters.createdFrom ? { gte: filters.createdFrom } : {}),
      ...(filters.createdTo ? { lte: filters.createdTo } : {}),
      ...(filters.cursor ? { lt: filters.cursor } : {}),
    };
  }

  return where;
};

export class MovieRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(data: CreateMovieData): Promise<Movie> {
    return this.db.movie.create({ data });
  }

  async findMany(filters: MovieFilters): Promise<MovieListResult> {
    const rows = await this.db.movie.findMany({
      where: buildWhere(filters),
      orderBy: { createdAt: 'desc' },
      take: filters.limit + 1,
    });

    const hasNextPage = rows.length > filters.limit;
    const data = hasNextPage ? rows.slice(0, filters.limit) : rows;
    const nextCursor = hasNextPage ? data[data.length - 1]?.createdAt.toISOString() : null;

    return {
      data,
      pageInfo: {
        hasNextPage,
        nextCursor,
      },
    };
  }

  findById(id: string): Promise<Movie | null> {
    return this.db.movie.findUnique({
      where: { id },
    });
  }

  update(id: string, data: UpdateMoviePayload): Promise<Movie> {
    return this.db.movie.update({
      where: { id },
      data,
    });
  }

  delete(id: string): Promise<Movie> {
    return this.db.movie.delete({
      where: { id },
    });
  }
}
