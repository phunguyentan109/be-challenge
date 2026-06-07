import { NextFunction, Request, Response } from 'express';
import { MovieService } from '../services/movie.service';
import {
  parseCreateMovieBody,
  parseMovieFilters,
  parseMovieIdParam,
  parseUpdateMovieBody,
} from '../validations/movie.validation';
import { HttpStatus } from '../constants/httpStatus';

export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const movie = await this.movieService.createMovie(parseCreateMovieBody(req.body), req.files as never);
      res.status(HttpStatus.CREATED).json(movie);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.movieService.listMovies(parseMovieFilters(req.query));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const movie = await this.movieService.getMovie(parseMovieIdParam(req.params.id));
      res.json(movie);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const movie = await this.movieService.updateMovie(
        parseMovieIdParam(req.params.id),
        parseUpdateMovieBody(req.body),
        req.files as never,
      );
      res.json(movie);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.movieService.deleteMovie(parseMovieIdParam(req.params.id));
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}
