import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import {
  SpotifyTokenResponse,
  SpotifyRefreshTokenResponse,
  AxiosErrorResponse,
} from '../common/types/spotify.types';

@Injectable()
export class AuthService {
  private get clientId(): string {
    return process.env.SPOTIFY_CLIENT_ID!;
  }

  private get clientSecret(): string {
    return process.env.SPOTIFY_CLIENT_SECRET!;
  }

  private get redirectUri(): string {
    return process.env.SPOTIFY_REDIRECT_URI!;
  }

  getAuthorizationUrl(): string {
    const scopes = [
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-library-read',
      'user-read-private',
      'user-read-email',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
  }> {
    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');

    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
      }).toString();

      const res = await axios.post<SpotifyTokenResponse>(
        'https://accounts.spotify.com/api/token',
        body,
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return {
        access_token: res.data.access_token,
        refresh_token: res.data.refresh_token,
        expires_in: res.data.expires_in,
        scope: res.data.scope,
      };
    } catch (err) {
      const axiosErr = err as AxiosErrorResponse;
      throw new HttpException(
        axiosErr.response?.data?.error_description ?? 'Failed to exchange code',
        axiosErr.response?.status ?? 500,
      );
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');

    try {
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString();

      const res = await axios.post<SpotifyRefreshTokenResponse>(
        'https://accounts.spotify.com/api/token',
        body,
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return {
        access_token: res.data.access_token,
        expires_in: res.data.expires_in,
      };
    } catch (err) {
      const axiosErr = err as AxiosErrorResponse;
      throw new HttpException(
        axiosErr.response?.data?.error_description ?? 'Failed to refresh token',
        axiosErr.response?.status ?? 500,
      );
    }
  }
}
