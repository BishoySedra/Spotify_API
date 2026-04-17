import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyAuthGuard } from '../common/guards/spotify-auth/spotify-auth.guard';
import { SpotifyToken } from '../common/decorators/spotify-token.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RemoveTracksDto } from './dto/remove-tracks.dto';
import { CopyTracksByDateDto } from './dto/copy-tracks-by-date.dto';

@ApiTags('Spotify')
@ApiBearerAuth()
@Controller('spotify')
export class SpotifyController {
  constructor(private readonly service: SpotifyService) {}

  @UseGuards(SpotifyAuthGuard)
  @Get('playlists')
  async getPlaylists(@SpotifyToken() token: string) {
    const data = await this.service.getPlaylists(token);
    return {
      message: `Fetched ${data?.total ?? 0} owned/collaborative playlists`,
      data,
    };
  }

  @UseGuards(SpotifyAuthGuard)
  @Get('playlists/:id/items')
  async getTracks(@SpotifyToken() token: string, @Param('id') id: string) {
    const data = await this.service.getTracks(token, id);
    return {
      message: `Fetched ${data?.tracks?.length ?? 0} tracks from playlist ${id}`,
      data,
    };
  }

  @UseGuards(SpotifyAuthGuard)
  @Delete('playlists/:id/items')
  async removeItems(
    @SpotifyToken() token: string,
    @Param('id') id: string,
    @Body() body: RemoveTracksDto,
  ) {
    const data = await this.service.removeTracksFromPlaylist(
      token,
      id,
      body.uris,
      body.snapshot_id,
    );
    return {
      message: `Removed ${data?.removedCount ?? 0} tracks from playlist ${id}`,
      data,
    };
  }

  @UseGuards(SpotifyAuthGuard)
  @Delete('playlists/:id/items/by-date')
  async removeItemsByDate(
    @SpotifyToken() token: string,
    @Param('id') id: string,
    @Query('addedAt') addedAt: string,
  ) {
    const data = await this.service.removeTracksByDate(token, id, addedAt);
    return {
      message: `Removed ${data?.removedCount ?? 0} tracks added on ${data?.date} from playlist ${id}`,
      data,
    };
  }

  @UseGuards(SpotifyAuthGuard)
  @Post('playlists/:id/items/copy-by-date')
  async copyItemsByDate(
    @SpotifyToken() token: string,
    @Param('id') id: string,
    @Query('addedAt') addedAt: string,
    @Body() body: CopyTracksByDateDto,
  ) {
    const data = await this.service.copyTracksByDate(
      token,
      id,
      body.targetPlaylistId,
      addedAt,
    );
    return {
      message: `Copied ${data?.addedCount ?? 0} tracks added on ${data?.date} to playlist ${body.targetPlaylistId}`,
      data,
    };
  }

  @UseGuards(SpotifyAuthGuard)
  @Get('library')
  async getFullLibrary(@SpotifyToken() token: string) {
    const data = await this.service.getFullLibrary(token);
    return {
      message: `Fetched full library: ${data?.total ?? 0} playlists`,
      data,
    };
  }
}
