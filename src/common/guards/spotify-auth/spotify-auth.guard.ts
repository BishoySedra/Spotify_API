import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SpotifyRequest } from '../../types/spotify.types';

@Injectable()
export class SpotifyAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<SpotifyRequest>();
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Spotify token');
    }

    req.spotifyToken = auth.split(' ')[1];
    return true;
  }
}
