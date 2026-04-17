import { UnauthorizedException } from '@nestjs/common';
import { SpotifyAuthGuard } from './spotify-auth.guard';

describe('SpotifyAuthGuard', () => {
  let guard: SpotifyAuthGuard;

  beforeEach(() => {
    guard = new SpotifyAuthGuard();
  });

  function mockContext(authHeader?: string) {
    const req: Record<string, unknown> = {
      headers: { authorization: authHeader },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as never;
  }

  it('should return true and set spotifyToken for valid Bearer token', () => {
    const ctx = mockContext('Bearer my-access-token');
    const result = guard.canActivate(ctx);
    expect(result).toBe(true);

    const req = ctx.switchToHttp().getRequest() as Record<string, unknown>;
    expect(req.spotifyToken).toBe('my-access-token');
  });

  it('should throw UnauthorizedException when no Authorization header', () => {
    const ctx = mockContext(undefined);
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for non-Bearer scheme', () => {
    const ctx = mockContext('Basic abc123');
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for empty string', () => {
    const ctx = mockContext('');
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});
