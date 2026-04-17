export interface SpotifyPaginatedResponse<T> {
  items: T[];
  next: string | null;
  total: number;
  limit: number;
  offset: number;
}
