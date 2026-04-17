import type { SpotifyExternalUrls } from './spotify-external-urls.type';

export interface SpotifyArtist {
  id: string;
  name: string;
  external_urls: SpotifyExternalUrls;
}
