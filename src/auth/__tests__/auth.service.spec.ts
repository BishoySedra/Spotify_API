import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import axios from 'axios';
import { AuthService } from '../auth.service';
import { SPOTIFY_AUTHORIZE_URL, SPOTIFY_SCOPES } from '../../common/constants';
import { registerMockCleanup } from '../../common/__tests__/utils/test-setup.util';
import {
  AUTH_ENV,
  EXCHANGE_CODE_SUCCESS_RESPONSE,
  EXCHANGE_CODE_SPOTIFY_ERROR,
  REFRESH_TOKEN_SUCCESS_RESPONSE,
  REFRESH_TOKEN_SPOTIFY_ERROR,
} from './fixtures/auth.fixtures';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    Object.assign(process.env, AUTH_ENV);

    const module = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get(AuthService);
  });

  registerMockCleanup();

  describe('getAuthorizationUrl', () => {
    it('should return a valid Spotify authorize URL', () => {
      const url = service.getAuthorizationUrl();
      expect(url).toContain(SPOTIFY_AUTHORIZE_URL);
      expect(url).toContain(`client_id=${AUTH_ENV.SPOTIFY_CLIENT_ID}`);
      expect(url).toContain('response_type=code');
      expect(url).toContain(
        `redirect_uri=${encodeURIComponent(AUTH_ENV.SPOTIFY_REDIRECT_URI)}`,
      );
    });

    it('should include all required scopes', () => {
      const url = service.getAuthorizationUrl();
      for (const scope of SPOTIFY_SCOPES) {
        expect(url).toContain(encodeURIComponent(scope));
      }
    });
  });

  describe('exchangeCode', () => {
    it('should return tokens on success', async () => {
      mockedAxios.post.mockResolvedValueOnce(EXCHANGE_CODE_SUCCESS_RESPONSE);

      const result = await service.exchangeCode('auth-code');

      expect(result.access_token).toBe('access-123');
      expect(result.refresh_token).toBe('refresh-456');
      expect(result.expires_in).toBe(3600);
      expect(result.scope).toBe('playlist-read-private');
    });

    it('should throw HttpException on Spotify error', async () => {
      mockedAxios.post.mockRejectedValueOnce(EXCHANGE_CODE_SPOTIFY_ERROR);

      await expect(service.exchangeCode('bad-code')).rejects.toThrow(
        'Invalid authorization code',
      );
    });

    it('should use fallback message on network error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.exchangeCode('code')).rejects.toThrow(
        'Failed to exchange code',
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token on success', async () => {
      mockedAxios.post.mockResolvedValueOnce(REFRESH_TOKEN_SUCCESS_RESPONSE);

      const result = await service.refreshAccessToken('refresh-token');

      expect(result.access_token).toBe('new-access-789');
      expect(result.expires_in).toBe(3600);
    });

    it('should throw HttpException on Spotify error', async () => {
      mockedAxios.post.mockRejectedValueOnce(REFRESH_TOKEN_SPOTIFY_ERROR);

      await expect(service.refreshAccessToken('bad-refresh')).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });
});
