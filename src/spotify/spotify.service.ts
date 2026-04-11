import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SpotifyService {
  private async getCurrentUserId(token: string): Promise<string> {
    const res = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.id;
  }

  async getPlaylists(token: string) {
    try {
      const [playlistsRes, userId] = await Promise.all([
        axios.get('https://api.spotify.com/v1/me/playlists?limit=50', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        this.getCurrentUserId(token),
      ]);

      const filtered = playlistsRes.data.items.filter(
        (p: any) => p.owner?.id === userId || p.collaborative === true,
      );

      const playlists = filtered.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || null,
        public: p.public,
        collaborative: p.collaborative,
        tracksCount: p.items?.total ?? p.tracks?.total ?? 0,
        imageUrl: p.images?.[0]?.url ?? null,
        spotifyUrl: p.external_urls?.spotify ?? null,
      }));

      return { total: playlists.length, playlists };
    } catch (err: any) {
      this.handleError(err);
    }
  }

  private async fetchTracksForPlaylist(token: string, playlistId: string) {
    const res = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/items`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return res.data.items
      .filter((i: any) => (i.track ?? i.item) !== null)
      .map((i: any) => {
        const t = i.track ?? i.item;
        return {
          id: t.id,
          title: t.name,
          artists: t.artists.map((a: any) => a.name),
          album: t.album?.name ?? null,
          albumImageUrl: t.album?.images?.[0]?.url ?? null,
          durationMs: t.duration_ms,
          explicit: t.explicit,
          spotifyUrl: t.external_urls?.spotify ?? null,
          addedAt: i.added_at,
        };
      });
  }

  async getTracks(token: string, playlistId: string) {
    try {
      const tracks = await this.fetchTracksForPlaylist(token, playlistId);
      return { playlistId, total: tracks.length, tracks };
    } catch (err: any) {
      this.handleError(err);
    }
  }

  async getFullLibrary(token: string) {
    try {
      const [playlistsRes, userId] = await Promise.all([
        axios.get('https://api.spotify.com/v1/me/playlists?limit=50', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        this.getCurrentUserId(token),
      ]);

      const filtered: any[] = playlistsRes.data.items.filter(
        (p: any) => p.owner?.id === userId || p.collaborative === true,
      );

      const results = await Promise.all(
        filtered.map(async (p: any) => {
          const tracks = await this.fetchTracksForPlaylist(token, p.id).catch(
            () => [],
          );
          return {
            id: p.id,
            name: p.name,
            description: p.description || null,
            public: p.public,
            collaborative: p.collaborative,
            imageUrl: p.images?.[0]?.url ?? null,
            spotifyUrl: p.external_urls?.spotify ?? null,
            tracksCount: tracks.length,
            tracks,
          };
        }),
      );

      return { total: results.length, playlists: results };
    } catch (err: any) {
      this.handleError(err);
    }
  }

  private handleError(err: any) {
    if (err.response?.status === 401) {
      throw new HttpException('Invalid Spotify token', 401);
    }

    if (err.response?.status === 403) {
      throw new HttpException(
        'Access denied — this playlist is private and not owned by you',
        403,
      );
    }

    if (err.response?.status === 429) {
      throw new HttpException('Rate limit exceeded', 429);
    }

    throw new HttpException(
      err.response?.data?.error?.message ?? err.message ?? 'Spotify API error',
      err.response?.status ?? 500,
    );
  }
}
