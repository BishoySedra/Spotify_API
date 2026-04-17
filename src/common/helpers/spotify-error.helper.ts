import { HttpException } from '@nestjs/common';
import type { AxiosErrorResponse } from '../types';
import { ERROR_MESSAGES } from '../constants';

export function handleSpotifyError(err: AxiosErrorResponse): never {
  const status = err.response?.status;

  if (status === 401) {
    throw new HttpException(ERROR_MESSAGES.INVALID_TOKEN, 401);
  }

  if (status === 403) {
    throw new HttpException(ERROR_MESSAGES.ACCESS_DENIED, 403);
  }

  if (status === 429) {
    throw new HttpException(ERROR_MESSAGES.RATE_LIMITED, 429);
  }

  throw new HttpException(
    err.response?.data?.error?.message ??
      err.message ??
      ERROR_MESSAGES.DEFAULT_API_ERROR,
    status ?? 500,
  );
}

export async function withSpotifyErrorHandling<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (err) {
    if (err instanceof HttpException) throw err;
    handleSpotifyError(err as AxiosErrorResponse);
  }
}
