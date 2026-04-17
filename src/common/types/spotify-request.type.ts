import { Request } from 'express';

export interface SpotifyRequest extends Request {
  spotifyToken: string;
}
