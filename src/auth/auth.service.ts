import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import type { SpotifyTokenResponse } from '../common/types/spotify-token-response.type';
import type { SpotifyRefreshTokenResponse } from '../common/types/spotify-refresh-token-response.type';
import type { AxiosErrorResponse } from '../common/types/axios-error-response.type';
import {
  SPOTIFY_TOKEN_URL,
  SPOTIFY_AUTHORIZE_URL,
  SPOTIFY_SCOPES,
} from '../common/constants';
import { ERROR_MESSAGES } from '../common/constants';

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

  private get credentials(): string {
    return Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    );
  }

  private tokenHeaders() {
    return {
      Authorization: `Basic ${this.credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: SPOTIFY_SCOPES.join(' '),
    });

    return `${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
  }> {
    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
      }).toString();

      const res = await axios.post<SpotifyTokenResponse>(
        SPOTIFY_TOKEN_URL,
        body,
        { headers: this.tokenHeaders() },
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
        axiosErr.response?.data?.error_description ??
          ERROR_MESSAGES.EXCHANGE_CODE_FAILED,
        axiosErr.response?.status ?? 500,
      );
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    try {
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString();

      const res = await axios.post<SpotifyRefreshTokenResponse>(
        SPOTIFY_TOKEN_URL,
        body,
        { headers: this.tokenHeaders() },
      );

      return {
        access_token: res.data.access_token,
        expires_in: res.data.expires_in,
      };
    } catch (err) {
      const axiosErr = err as AxiosErrorResponse;
      throw new HttpException(
        axiosErr.response?.data?.error_description ??
          ERROR_MESSAGES.REFRESH_TOKEN_FAILED,
        axiosErr.response?.status ?? 500,
      );
    }
  }
}
