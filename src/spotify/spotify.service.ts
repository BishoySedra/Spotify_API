import { Injectable, HttpException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import {
  SpotifyUser,
  SpotifyPaginatedResponse,
  SpotifyPlaylist,
  SpotifyPlaylistItem,
  SpotifySnapshotResponse,
  MappedTrack,
  AxiosErrorResponse,
} from '../common/types/spotify.types';

@Injectable()
export class SpotifyService {
  private async getCurrentUserId(token: string): Promise<string> {
    const res = await axios.get<SpotifyUser>('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.id;
  }

  async getPlaylists(token: string) {
    try {
      const [playlistsRes, userId] = await Promise.all([
        axios.get<SpotifyPaginatedResponse<SpotifyPlaylist>>(
          'https://api.spotify.com/v1/me/playlists?limit=50',
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        this.getCurrentUserId(token),
      ]);

      const filtered = playlistsRes.data.items.filter(
        (p) => p.owner?.id === userId || p.collaborative === true,
      );

      const playlists = filtered.map((p) => ({
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
    } catch (err) {
      this.handleError(err as AxiosErrorResponse);
    }
  }

  private async fetchTracksForPlaylist(
    token: string,
    playlistId: string,
  ): Promise<MappedTrack[]> {
    const allItems: SpotifyPlaylistItem[] = [];
    let url: string | null =
      `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=100`;

    while (url) {
      const res: AxiosResponse<SpotifyPaginatedResponse<SpotifyPlaylistItem>> =
        await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
      allItems.push(...res.data.items);
      url = res.data.next;
    }

    return allItems
      .filter((i) => (i.track ?? i.item) !== null)
      .map((i) => {
        const t = (i.track ?? i.item)!;
        return {
          id: t.id,
          uri: t.uri,
          title: t.name,
          artists: t.artists.map((a) => a.name),
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
    } catch (err) {
      this.handleError(err as AxiosErrorResponse);
    }
  }

  async getFullLibrary(token: string) {
    try {
      const [playlistsRes, userId] = await Promise.all([
        axios.get<SpotifyPaginatedResponse<SpotifyPlaylist>>(
          'https://api.spotify.com/v1/me/playlists?limit=50',
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        this.getCurrentUserId(token),
      ]);

      const filtered = playlistsRes.data.items.filter(
        (p) => p.owner?.id === userId || p.collaborative === true,
      );

      const results = await Promise.all(
        filtered.map(async (p) => {
          const tracks = await this.fetchTracksForPlaylist(token, p.id).catch(
            (): MappedTrack[] => [],
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
    } catch (err) {
      this.handleError(err as AxiosErrorResponse);
    }
  }

  async removeTracksFromPlaylist(
    token: string,
    playlistId: string,
    trackUris: string[],
    snapshotId?: string,
  ) {
    try {
      const removed: string[] = [];

      for (let i = 0; i < trackUris.length; i += 100) {
        const batch = trackUris.slice(i, i + 100);
        const body: { items: { uri: string }[]; snapshot_id?: string } = {
          items: batch.map((uri) => ({ uri })),
        };
        if (snapshotId) body.snapshot_id = snapshotId;

        const res = await axios.delete<SpotifySnapshotResponse>(
          `https://api.spotify.com/v1/playlists/${playlistId}/items`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            data: body,
          },
        );

        snapshotId = res.data.snapshot_id;
        removed.push(...batch);
      }

      return { playlistId, removedCount: removed.length, snapshotId };
    } catch (err) {
      this.handleError(err as AxiosErrorResponse);
    }
  }

  async removeTracksByDate(token: string, playlistId: string, addedAt: string) {
    try {
      const targetDate = new Date(addedAt);
      if (isNaN(targetDate.getTime())) {
        throw new HttpException(
          'Invalid date format. Use ISO 8601 (e.g. 2025-01-15 or 2025-01-15T00:00:00Z)',
          400,
        );
      }
      const targetDateStr = targetDate.toISOString().split('T')[0];

      const allTracks = await this.fetchTracksForPlaylist(token, playlistId);

      const matchingTracks = allTracks.filter((t) => {
        const trackDate = new Date(t.addedAt).toISOString().split('T')[0];
        return trackDate === targetDateStr;
      });

      if (matchingTracks.length === 0) {
        return {
          playlistId,
          date: targetDateStr,
          removedCount: 0,
          message: 'No tracks found added on this date',
        };
      }

      const uris = matchingTracks.map((t) => t.uri);
      const result = await this.removeTracksFromPlaylist(
        token,
        playlistId,
        uris,
      );

      return {
        playlistId,
        date: targetDateStr,
        removedCount: result?.removedCount ?? 0,
        snapshotId: result?.snapshotId,
        removedTracks: matchingTracks.map((t) => ({
          uri: t.uri,
          title: t.title,
          artists: t.artists,
          addedAt: t.addedAt,
        })),
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.handleError(err as AxiosErrorResponse);
    }
  }

  async addTracksToPlaylist(
    token: string,
    playlistId: string,
    trackUris: string[],
  ) {
    try {
      let snapshotId: string | undefined;

      for (let i = 0; i < trackUris.length; i += 100) {
        const batch = trackUris.slice(i, i + 100);
        const res = await axios.post<SpotifySnapshotResponse>(
          `https://api.spotify.com/v1/playlists/${playlistId}/items`,
          { uris: batch },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        snapshotId = res.data.snapshot_id;
      }

      return { playlistId, addedCount: trackUris.length, snapshotId };
    } catch (err) {
      this.handleError(err as AxiosErrorResponse);
    }
  }

  async copyTracksByDate(
    token: string,
    sourcePlaylistId: string,
    targetPlaylistId: string,
    addedAt: string,
  ) {
    try {
      const targetDate = new Date(addedAt);
      if (isNaN(targetDate.getTime())) {
        throw new HttpException(
          'Invalid date format. Use ISO 8601 (e.g. 2025-01-15 or 2025-01-15T00:00:00Z)',
          400,
        );
      }
      const targetDateStr = targetDate.toISOString().split('T')[0];

      const allTracks = await this.fetchTracksForPlaylist(
        token,
        sourcePlaylistId,
      );

      const matchingTracks = allTracks.filter((t) => {
        const trackDate = new Date(t.addedAt).toISOString().split('T')[0];
        return trackDate === targetDateStr;
      });

      if (matchingTracks.length === 0) {
        return {
          sourcePlaylistId,
          targetPlaylistId,
          date: targetDateStr,
          addedCount: 0,
          message: 'No tracks found added on this date',
        };
      }

      const uris = matchingTracks.map((t) => t.uri);
      const result = await this.addTracksToPlaylist(
        token,
        targetPlaylistId,
        uris,
      );

      return {
        sourcePlaylistId,
        targetPlaylistId,
        date: targetDateStr,
        addedCount: result?.addedCount ?? 0,
        snapshotId: result?.snapshotId,
        tracks: matchingTracks.map((t) => ({
          uri: t.uri,
          title: t.title,
          artists: t.artists,
          addedAt: t.addedAt,
        })),
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.handleError(err as AxiosErrorResponse);
    }
  }

  private handleError(err: AxiosErrorResponse): never {
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
