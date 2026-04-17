import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import type { SpotifyUser } from '../common/types/spotify-user.type';
import type { SpotifyPaginatedResponse } from '../common/types/spotify-paginated-response.type';
import type { SpotifyPlaylist } from '../common/types/spotify-playlist.type';
import type { SpotifyPlaylistItem } from '../common/types/spotify-playlist-item.type';
import type { SpotifySnapshotResponse } from '../common/types/spotify-snapshot-response.type';
import type { MappedTrack } from '../common/types/mapped-track.type';
import { SPOTIFY_API_BASE, SPOTIFY_BATCH_SIZE } from '../common/constants';
import { ERROR_MESSAGES } from '../common/constants';
import { withSpotifyErrorHandling } from '../common/helpers';
import { authHeaders, authHeadersWithContentType } from '../common/helpers';
import { parseDate, filterTracksByDate } from '../common/helpers';

@Injectable()
export class SpotifyService {
  private async getCurrentUserId(token: string): Promise<string> {
    const res = await axios.get<SpotifyUser>(`${SPOTIFY_API_BASE}/me`, {
      headers: authHeaders(token),
    });
    return res.data.id;
  }

  private async fetchUserPlaylists(token: string) {
    const [playlistsRes, userId] = await Promise.all([
      axios.get<SpotifyPaginatedResponse<SpotifyPlaylist>>(
        `${SPOTIFY_API_BASE}/me/playlists?limit=50`,
        { headers: authHeaders(token) },
      ),
      this.getCurrentUserId(token),
    ]);

    return playlistsRes.data.items.filter(
      (p) => p.owner?.id === userId || p.collaborative === true,
    );
  }

  private async fetchTracksForPlaylist(
    token: string,
    playlistId: string,
  ): Promise<MappedTrack[]> {
    const allItems: SpotifyPlaylistItem[] = [];
    let url: string | null =
      `${SPOTIFY_API_BASE}/playlists/${playlistId}/items?limit=${SPOTIFY_BATCH_SIZE}`;

    while (url) {
      const res: AxiosResponse<SpotifyPaginatedResponse<SpotifyPlaylistItem>> =
        await axios.get(url, { headers: authHeaders(token) });
      allItems.push(...res.data.items);
      url = res.data.next;
    }

    return allItems
      .filter((i) => (i.track ?? i.item) != null)
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

  private async getTracksByDate(
    token: string,
    playlistId: string,
    addedAt: string,
  ) {
    const dateStr = parseDate(addedAt);
    const allTracks = await this.fetchTracksForPlaylist(token, playlistId);
    const matching = filterTracksByDate(allTracks, dateStr);
    return { dateStr, matching };
  }

  async getPlaylists(token: string) {
    return withSpotifyErrorHandling(async () => {
      const filtered = await this.fetchUserPlaylists(token);

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
    });
  }

  async getTracks(token: string, playlistId: string) {
    return withSpotifyErrorHandling(async () => {
      const tracks = await this.fetchTracksForPlaylist(token, playlistId);
      return { playlistId, total: tracks.length, tracks };
    });
  }

  async getFullLibrary(token: string) {
    return withSpotifyErrorHandling(async () => {
      const filtered = await this.fetchUserPlaylists(token);

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
    });
  }

  async removeTracksFromPlaylist(
    token: string,
    playlistId: string,
    trackUris: string[],
    snapshotId?: string,
  ) {
    return withSpotifyErrorHandling(async () => {
      const removed: string[] = [];

      for (let i = 0; i < trackUris.length; i += SPOTIFY_BATCH_SIZE) {
        const batch = trackUris.slice(i, i + SPOTIFY_BATCH_SIZE);
        const body: { items: { uri: string }[]; snapshot_id?: string } = {
          items: batch.map((uri) => ({ uri })),
        };
        if (snapshotId) body.snapshot_id = snapshotId;

        const res = await axios.delete<SpotifySnapshotResponse>(
          `${SPOTIFY_API_BASE}/playlists/${playlistId}/items`,
          { headers: authHeadersWithContentType(token), data: body },
        );

        snapshotId = res.data.snapshot_id;
        removed.push(...batch);
      }

      return { playlistId, removedCount: removed.length, snapshotId };
    });
  }

  async removeTracksByDate(token: string, playlistId: string, addedAt: string) {
    return withSpotifyErrorHandling(async () => {
      const { dateStr, matching } = await this.getTracksByDate(
        token,
        playlistId,
        addedAt,
      );

      if (matching.length === 0) {
        return {
          playlistId,
          date: dateStr,
          removedCount: 0,
          message: ERROR_MESSAGES.NO_TRACKS_ON_DATE,
        };
      }

      const uris = matching.map((t) => t.uri);
      const result = await this.removeTracksFromPlaylist(
        token,
        playlistId,
        uris,
      );

      return {
        playlistId,
        date: dateStr,
        removedCount: result.removedCount,
        snapshotId: result.snapshotId,
        removedTracks: matching.map((t) => ({
          uri: t.uri,
          title: t.title,
          artists: t.artists,
          addedAt: t.addedAt,
        })),
      };
    });
  }

  async addTracksToPlaylist(
    token: string,
    playlistId: string,
    trackUris: string[],
  ) {
    return withSpotifyErrorHandling(async () => {
      let snapshotId: string | undefined;

      for (let i = 0; i < trackUris.length; i += SPOTIFY_BATCH_SIZE) {
        const batch = trackUris.slice(i, i + SPOTIFY_BATCH_SIZE);
        const res = await axios.post<SpotifySnapshotResponse>(
          `${SPOTIFY_API_BASE}/playlists/${playlistId}/items`,
          { uris: batch },
          { headers: authHeadersWithContentType(token) },
        );
        snapshotId = res.data.snapshot_id;
      }

      return { playlistId, addedCount: trackUris.length, snapshotId };
    });
  }

  async copyTracksByDate(
    token: string,
    sourcePlaylistId: string,
    targetPlaylistId: string,
    addedAt: string,
  ) {
    return withSpotifyErrorHandling(async () => {
      const { dateStr, matching } = await this.getTracksByDate(
        token,
        sourcePlaylistId,
        addedAt,
      );

      if (matching.length === 0) {
        return {
          sourcePlaylistId,
          targetPlaylistId,
          date: dateStr,
          addedCount: 0,
          message: ERROR_MESSAGES.NO_TRACKS_ON_DATE,
        };
      }

      const uris = matching.map((t) => t.uri);
      const result = await this.addTracksToPlaylist(
        token,
        targetPlaylistId,
        uris,
      );

      return {
        sourcePlaylistId,
        targetPlaylistId,
        date: dateStr,
        addedCount: result.addedCount,
        snapshotId: result.snapshotId,
        tracks: matching.map((t) => ({
          uri: t.uri,
          title: t.title,
          artists: t.artists,
          addedAt: t.addedAt,
        })),
      };
    });
  }
}
