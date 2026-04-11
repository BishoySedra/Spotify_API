import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyAuthGuard } from '../common/guards/spotify-auth/spotify-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Spotify')
@ApiBearerAuth()
@Controller('spotify')
export class SpotifyController {
  constructor(private readonly service: SpotifyService) {}

  @UseGuards(SpotifyAuthGuard)
  @Get('playlists')
  async getPlaylists(@Req() req: any) {
    const data = await this.service.getPlaylists(req.spotifyToken);
    return {
      message: `Fetched ${data?.total ?? 0} owned/collaborative playlists`,
      data,
    };
  }

  @UseGuards(SpotifyAuthGuard)
  @Get('playlists/:id/items')
  async getTracks(@Req() req: any, @Param('id') id: string) {
    const data = await this.service.getTracks(req.spotifyToken, id);
    return {
      message: `Fetched ${(data?.tracks as any[])?.length ?? 0} tracks from playlist ${id}`,
      data,
    };
  }

  @UseGuards(SpotifyAuthGuard)
  @Get('library')
  async getFullLibrary(@Req() req: any) {
    const data = await this.service.getFullLibrary(req.spotifyToken);
    return {
      message: `Fetched full library: ${data?.total ?? 0} playlists`,
      data,
    };
  }
}
