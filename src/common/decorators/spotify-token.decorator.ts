import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { SpotifyRequest } from '../types/spotify.types';

export const SpotifyToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<SpotifyRequest>();
    return req.spotifyToken;
  },
);
