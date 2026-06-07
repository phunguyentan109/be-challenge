import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { HttpError } from '../utils/httpError';
import { HttpStatus } from '../constants/httpStatus';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(HttpStatus.NOT_FOUND).json({
    message: `Route ${req.method} ${req.path} not found`,
  });
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2023') {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid id format' });
      return;
    }

    if (error.code === 'P2025') {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'Resource not found' });
      return;
    }
  }

  console.error(error);
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
};
