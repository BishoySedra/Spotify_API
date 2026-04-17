import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { SpotifyRequest } from '../../types/spotify-request.type';

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
