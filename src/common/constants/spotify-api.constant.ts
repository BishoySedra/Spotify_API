export const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';
export const SPOTIFY_TOKEN_URL = `${SPOTIFY_ACCOUNTS_BASE}/api/token`;
export const SPOTIFY_AUTHORIZE_URL = `${SPOTIFY_ACCOUNTS_BASE}/authorize`;

export const SPOTIFY_SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
  'user-read-private',
  'user-read-email',
];

export const SPOTIFY_BATCH_SIZE = 100;
