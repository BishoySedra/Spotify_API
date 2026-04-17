import type { SpotifyArtist } from './spotify-artist.type';
import type { SpotifyAlbum } from './spotify-album.type';
import type { SpotifyExternalUrls } from './spotify-external-urls.type';

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
