import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import axios from 'axios';
import { AuthService } from './auth.service';
import { SPOTIFY_AUTHORIZE_URL, SPOTIFY_SCOPES } from '../common/constants';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    process.env.SPOTIFY_CLIENT_ID = 'test-client-id';
    process.env.SPOTIFY_CLIENT_SECRET = 'test-client-secret';
    process.env.SPOTIFY_REDIRECT_URI = 'http://localhost:3000/auth/callback';

    const module = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAuthorizationUrl', () => {
    it('should return a valid Spotify authorize URL', () => {
      const url = service.getAuthorizationUrl();
      expect(url).toContain(SPOTIFY_AUTHORIZE_URL);
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('response_type=code');
      expect(url).toContain(
        `redirect_uri=${encodeURIComponent('http://localhost:3000/auth/callback')}`,
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
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'access-123',
          refresh_token: 'refresh-456',
          expires_in: 3600,
          scope: 'playlist-read-private',
        },
      });

      const result = await service.exchangeCode('auth-code');

      expect(result.access_token).toBe('access-123');
      expect(result.refresh_token).toBe('refresh-456');
      expect(result.expires_in).toBe(3600);
      expect(result.scope).toBe('playlist-read-private');
    });

    it('should throw HttpException on Spotify error', async () => {
      const spotifyError = {
        response: {
          status: 400,
          data: { error_description: 'Invalid authorization code' },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(spotifyError);

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
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-789',
          expires_in: 3600,
        },
      });

      const result = await service.refreshAccessToken('refresh-token');

      expect(result.access_token).toBe('new-access-789');
      expect(result.expires_in).toBe(3600);
    });

    it('should throw HttpException on Spotify error', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { error_description: 'Invalid refresh token' },
        },
      });

      await expect(service.refreshAccessToken('bad-refresh')).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });
});
