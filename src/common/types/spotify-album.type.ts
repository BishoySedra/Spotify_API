import type { SpotifyImage } from './spotify-image.type';

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
}
