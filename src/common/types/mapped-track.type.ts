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
