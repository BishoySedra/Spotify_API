import { HttpException } from '@nestjs/common';
import {
  handleSpotifyError,
  withSpotifyErrorHandling,
} from '../spotify-error.helper';
import { ERROR_MESSAGES } from '../../constants';
import type { AxiosErrorResponse } from '../../types';
import {
  UNAUTHORIZED_ERROR,
  FORBIDDEN_ERROR,
  RATE_LIMITED_ERROR,
  BAD_REQUEST_WITH_MESSAGE,
  NETWORK_ERROR,
  EMPTY_ERROR,
} from './fixtures/spotify-error.fixtures';

describe('handleSpotifyError', () => {
  it('should throw 401 for invalid token', () => {
    expect(() => handleSpotifyError(UNAUTHORIZED_ERROR)).toThrow(HttpException);
    expect(() => handleSpotifyError(UNAUTHORIZED_ERROR)).toThrow(
      ERROR_MESSAGES.INVALID_TOKEN,
    );
  });

  it('should throw 403 for access denied', () => {
    expect(() => handleSpotifyError(FORBIDDEN_ERROR)).toThrow(HttpException);
    expect(() => handleSpotifyError(FORBIDDEN_ERROR)).toThrow(
      ERROR_MESSAGES.ACCESS_DENIED,
    );
  });

  it('should throw 429 for rate limit', () => {
    expect(() => handleSpotifyError(RATE_LIMITED_ERROR)).toThrow(HttpException);
    expect(() => handleSpotifyError(RATE_LIMITED_ERROR)).toThrow(
      ERROR_MESSAGES.RATE_LIMITED,
    );
  });

  it('should use Spotify error message when available', () => {
    expect(() => handleSpotifyError(BAD_REQUEST_WITH_MESSAGE)).toThrow(
      'Bad request from Spotify',
    );
  });

  it('should fall back to err.message', () => {
    expect(() => handleSpotifyError(NETWORK_ERROR)).toThrow('Network error');
  });

  it('should fall back to default message when nothing is available', () => {
    expect(() => handleSpotifyError(EMPTY_ERROR)).toThrow(
      ERROR_MESSAGES.DEFAULT_API_ERROR,
    );
  });

  it('should use 500 when no status is available', () => {
    try {
      handleSpotifyError(EMPTY_ERROR);
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
