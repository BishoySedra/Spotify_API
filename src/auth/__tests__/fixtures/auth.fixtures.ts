export const AUTH_ENV = {
  SPOTIFY_CLIENT_ID: 'test-client-id',
  SPOTIFY_CLIENT_SECRET: 'test-client-secret',
  SPOTIFY_REDIRECT_URI: 'http://localhost:3000/auth/callback',
};

export const EXCHANGE_CODE_SUCCESS_RESPONSE = {
  data: {
    access_token: 'access-123',
    refresh_token: 'refresh-456',
    expires_in: 3600,
    scope: 'playlist-read-private',
  },
};

export const EXCHANGE_CODE_SPOTIFY_ERROR = {
  response: {
    status: 400,
    data: { error_description: 'Invalid authorization code' },
  },
};

export const REFRESH_TOKEN_SUCCESS_RESPONSE = {
  data: {
    access_token: 'new-access-789',
    expires_in: 3600,
  },
};

export const REFRESH_TOKEN_SPOTIFY_ERROR = {
  response: {
    status: 400,
    data: { error_description: 'Invalid refresh token' },
  },
};
