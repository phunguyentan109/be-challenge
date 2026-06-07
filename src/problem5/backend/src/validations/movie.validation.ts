import { MovieFilters, MoviePayload, UpdateMoviePayload } from '../types/movie';
import { HttpStatus } from '../constants/httpStatus';
import { HttpError } from '../utils/httpError';
import { parseDate, parseNumber, parseOptionalString, parseRequiredString } from '../utils/validation';

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;

export const parseMovieIdParam = (id: unknown): string => {
  if (typeof id !== 'string' || id.trim().length === 0) {
    throw new HttpError(HttpStatus.BAD_REQUEST, 'Invalid movie id');
  }

  return id.trim();
};

const parseRating = (value: unknown, required: boolean): number | undefined => {
  try {
    return parseNumber(value, 'rating', { required, min: 0, max: 10 });
  } catch (error) {
    if (error instanceof HttpError && error.message === 'rating must be a number') {
      throw new HttpError(HttpStatus.BAD_REQUEST, 'rating must be a number between 0 and 10');
    }

    throw error;
  }
};

export const parseCreateMovieBody = (body: Record<string, unknown>): MoviePayload => ({
  name: parseRequiredString(body.name, 'name'),
  description: parseRequiredString(body.description, 'description'),
  rating: parseRating(body.rating, true) as number,
  image: parseOptionalString(body.image, 'image'),
  trailerVideo: parseOptionalString(body.trailerVideo, 'trailerVideo'),
});

export const parseUpdateMovieBody = (body: Record<string, unknown>): UpdateMoviePayload => {
  const payload: UpdateMoviePayload = {
    name: parseOptionalString(body.name, 'name'),
    description: parseOptionalString(body.description, 'description'),
    rating: parseRating(body.rating, false),
    image: parseOptionalString(body.image, 'image'),
    trailerVideo: parseOptionalString(body.trailerVideo, 'trailerVideo'),
  };

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
};

export const parseMovieFilters = (query: Record<string, unknown>): MovieFilters => {
  const limitValue = query.limit === undefined ? DEFAULT_LIMIT : Number(query.limit);
  if (!Number.isInteger(limitValue) || limitValue < 1) {
    throw new HttpError(HttpStatus.BAD_REQUEST, 'limit must be a positive integer');
  }

  const minRating = parseNumber(query.minRating, 'minRating', { min: 0, max: 10 });
  const maxRating = parseNumber(query.maxRating, 'maxRating', { min: 0, max: 10 });

  if (minRating !== undefined && maxRating !== undefined && minRating > maxRating) {
    throw new HttpError(HttpStatus.BAD_REQUEST, 'minRating cannot be greater than maxRating');
  }

  return {
    name: parseOptionalString(query.name, 'name'),
    minRating,
    maxRating,
    createdFrom: parseDate(query.createdFrom, 'createdFrom'),
    createdTo: parseDate(query.createdTo, 'createdTo'),
    cursor: parseDate(query.cursor, 'cursor'),
    limit: Math.min(limitValue, MAX_LIMIT),
  };
};
