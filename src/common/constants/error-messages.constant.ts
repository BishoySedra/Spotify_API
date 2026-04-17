export const ERROR_MESSAGES = {
  INVALID_TOKEN: 'Invalid Spotify token',
  ACCESS_DENIED:
    'Access denied — this playlist is private and not owned by you',
  RATE_LIMITED: 'Rate limit exceeded',
  INVALID_DATE_FORMAT:
    'Invalid date format. Use ISO 8601 (e.g. 2025-01-15 or 2025-01-15T00:00:00Z)',
  NO_TRACKS_ON_DATE: 'No tracks found added on this date',
  EXCHANGE_CODE_FAILED: 'Failed to exchange code',
  REFRESH_TOKEN_FAILED: 'Failed to refresh token',
  DEFAULT_API_ERROR: 'Spotify API error',
} as const;
