import type { SpotifyTrack } from './spotify-track.type';

export interface SpotifyPlaylistItem {
  track: SpotifyTrack | null;
  item?: SpotifyTrack | null;
  added_at: string;
}
