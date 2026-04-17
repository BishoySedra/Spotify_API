import { HttpException } from '@nestjs/common';
import {
  handleSpotifyError,
  withSpotifyErrorHandling,
} from './spotify-error.helper';
import { ERROR_MESSAGES } from '../constants';
import type { AxiosErrorResponse } from '../types';

describe('handleSpotifyError', () => {
  it('should throw 401 for invalid token', () => {
    const err: AxiosErrorResponse = { response: { status: 401, data: {} } };
    expect(() => handleSpotifyError(err)).toThrow(HttpException);
    expect(() => handleSpotifyError(err)).toThrow(ERROR_MESSAGES.INVALID_TOKEN);
  });

  it('should throw 403 for access denied', () => {
    const err: AxiosErrorResponse = { response: { status: 403, data: {} } };
    expect(() => handleSpotifyError(err)).toThrow(HttpException);
    expect(() => handleSpotifyError(err)).toThrow(ERROR_MESSAGES.ACCESS_DENIED);
  });

  it('should throw 429 for rate limit', () => {
    const err: AxiosErrorResponse = { response: { status: 429, data: {} } };
    expect(() => handleSpotifyError(err)).toThrow(HttpException);
    expect(() => handleSpotifyError(err)).toThrow(ERROR_MESSAGES.RATE_LIMITED);
  });

  it('should use Spotify error message when available', () => {
    const err: AxiosErrorResponse = {
      response: {
        status: 400,
        data: { error: { message: 'Bad request from Spotify' } },
      },
    };
    expect(() => handleSpotifyError(err)).toThrow('Bad request from Spotify');
  });

  it('should fall back to err.message', () => {
    const err: AxiosErrorResponse = { message: 'Network error' };
    expect(() => handleSpotifyError(err)).toThrow('Network error');
  });

  it('should fall back to default message when nothing is available', () => {
    const err: AxiosErrorResponse = {};
    expect(() => handleSpotifyError(err)).toThrow(
      ERROR_MESSAGES.DEFAULT_API_ERROR,
    );
  });

  it('should use 500 when no status is available', () => {
    const err: AxiosErrorResponse = {};
    try {
      handleSpotifyError(err);
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(500);
    }
  });
});

describe('withSpotifyErrorHandling', () => {
  it('should return the result of a successful operation', async () => {
    const result = await withSpotifyErrorHandling(async () => 'success');
    expect(result).toBe('success');
  });

  it('should rethrow HttpException without mapping', async () => {
    const exception = new HttpException('Custom error', 400);
    await expect(
      withSpotifyErrorHandling(async () => {
        throw exception;
      }),
    ).rejects.toThrow(exception);
  });

  it('should map non-HttpException errors through handleSpotifyError', async () => {
    const axiosErr: AxiosErrorResponse = {
      response: { status: 401, data: {} },
    };
    await expect(
      withSpotifyErrorHandling(async () => {
        throw axiosErr;
      }),
    ).rejects.toThrow(ERROR_MESSAGES.INVALID_TOKEN);
  });
});
