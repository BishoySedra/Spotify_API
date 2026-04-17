import { Request } from 'express';

export interface SpotifyRequest extends Request {
  spotifyToken: string;
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyExternalUrls {
  spotify: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  external_urls: SpotifyExternalUrls;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
}

export interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  explicit: boolean;
  external_urls: SpotifyExternalUrls;
}

export interface SpotifyPlaylistItem {
  track: SpotifyTrack | null;
  item?: SpotifyTrack | null;
  added_at: string;
}

export interface SpotifyPlaylistOwner {
  id: string;
  display_name: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  public: boolean;
  collaborative: boolean;
  owner: SpotifyPlaylistOwner;
  tracks: { total: number };
  items?: { total: number };
  images: SpotifyImage[];
  external_urls: SpotifyExternalUrls;
}

export interface SpotifyPaginatedResponse<T> {
  items: T[];
  next: string | null;
  total: number;
  limit: number;
  offset: number;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
}

export interface SpotifyTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export interface SpotifyRefreshTokenResponse {
  access_token: string;
  expires_in: number;
}

export interface SpotifySnapshotResponse {
  snapshot_id: string;
}

export interface MappedTrack {
  id: string;
  uri: string;
  title: string;
  artists: string[];
  album: string | null;
  albumImageUrl: string | null;
  durationMs: number;
  explicit: boolean;
  spotifyUrl: string | null;
  addedAt: string;
}

export interface AxiosErrorResponse {
  response?: {
    status: number;
    data: {
      error?: { message: string };
      error_description?: string;
    };
  };
  message?: string;
}
