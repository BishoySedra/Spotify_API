import type { SpotifyPlaylistOwner } from './spotify-playlist-owner.type';
import type { SpotifyImage } from './spotify-image.type';
import type { SpotifyExternalUrls } from './spotify-external-urls.type';

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
