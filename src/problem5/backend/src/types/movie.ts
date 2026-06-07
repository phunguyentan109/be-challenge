export interface MoviePayload {
  name: string;
  description: string;
  rating: number;
  image?: string;
  trailerVideo?: string;
}

export type CreateMovieData = MoviePayload;

export interface UpdateMoviePayload {
  name?: string;
  description?: string;
  rating?: number;
  image?: string;
  trailerVideo?: string;
}

export interface MovieFilters {
  name?: string;
  minRating?: number;
  maxRating?: number;
  createdFrom?: Date;
  createdTo?: Date;
  cursor?: Date;
  limit: number;
}
