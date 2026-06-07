import { HttpError } from './httpError';
import { HttpStatus } from '../constants/httpStatus';

export const parseRequiredString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(HttpStatus.BAD_REQUEST, `${field} is required`);
  }

  return value.trim();
};

export const parseOptionalString = (value: unknown, field: string): string | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new HttpError(HttpStatus.BAD_REQUEST, `${field} must be a string`);
  }

  return value.trim();
};

export const parseNumber = (
  value: unknown,
  field: string,
  options: { required?: boolean; min?: number; max?: number } = {},
): number | undefined => {
  if (value === undefined || value === null || value === '') {
    if (options.required) {
      throw new HttpError(HttpStatus.BAD_REQUEST, `${field} is required`);
    }

    return undefined;
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new HttpError(HttpStatus.BAD_REQUEST, `${field} must be a number`);
  }

  if (options.min !== undefined && number < options.min) {
    throw new HttpError(HttpStatus.BAD_REQUEST, `${field} must be greater than or equal to ${options.min}`);
  }

  if (options.max !== undefined && number > options.max) {
    throw new HttpError(HttpStatus.BAD_REQUEST, `${field} must be less than or equal to ${options.max}`);
  }

  return number;
};

export const parseDate = (value: unknown, field: string): Date | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new HttpError(HttpStatus.BAD_REQUEST, `${field} must be an ISO date string`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(HttpStatus.BAD_REQUEST, `${field} must be a valid ISO date string`);
  }

  return date;
};
