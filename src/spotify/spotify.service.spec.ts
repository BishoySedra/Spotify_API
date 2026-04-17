import { Test } from '@nestjs/testing';
import axios from 'axios';
import { SpotifyService } from './spotify.service';
import { SPOTIFY_API_BASE } from '../common/constants';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function makeTrackItem(id: string, addedAt: string) {
  return {
    track: {
      id,
      uri: `spotify:track:${id}`,
      name: `Track ${id}`,
      artists: [{ name: 'Artist', id: 'a1', external_urls: { spotify: '' } }],
      album: {
        name: 'Album',
        id: 'alb1',
        images: [{ url: 'https://img.url', height: 300, width: 300 }],
      },
      duration_ms: 200000,
      explicit: false,
      external_urls: { spotify: `https://open.spotify.com/track/${id}` },
    },
    added_at: addedAt,
  };
}

describe('SpotifyService', () => {
  let service: SpotifyService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SpotifyService],
    }).compile();

    service = module.get(SpotifyService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getPlaylists', () => {
    it('should return owned and collaborative playlists', async () => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('/me/playlists')) {
          return Promise.resolve({
            data: {
              items: [
                {
                  id: 'p1',
                  name: 'My Playlist',
                  description: 'desc',
                  public: true,
                  collaborative: false,
                  owner: { id: 'user1', display_name: 'User' },
                  tracks: { total: 10 },
                  images: [{ url: 'https://img', height: 300, width: 300 }],
                  external_urls: {
                    spotify: 'https://open.spotify.com/playlist/p1',
                  },
                },
                {
                  id: 'p2',
                  name: 'Other Playlist',
                  description: null,
                  public: false,
                  collaborative: false,
                  owner: { id: 'other-user', display_name: 'Other' },
                  tracks: { total: 5 },
                  images: [],
                  external_urls: { spotify: '' },
                },
              ],
            },
          });
        }
        if (url === `${SPOTIFY_API_BASE}/me`) {
          return Promise.resolve({ data: { id: 'user1' } });
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      const result = await service.getPlaylists('token');

      expect(result.total).toBe(1);
      expect(result.playlists[0].id).toBe('p1');
      expect(result.playlists[0].name).toBe('My Playlist');
    });
  });

  describe('getTracks', () => {
    it('should return all tracks with pagination', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          items: [makeTrackItem('t1', '2025-01-15T00:00:00Z')],
          next: 'https://api.spotify.com/v1/playlists/p1/items?offset=100',
        },
      });
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          items: [makeTrackItem('t2', '2025-01-16T00:00:00Z')],
          next: null,
        },
      });

      const result = await service.getTracks('token', 'p1');

      expect(result.total).toBe(2);
      expect(result.tracks).toHaveLength(2);
      expect(result.tracks[0].id).toBe('t1');
      expect(result.tracks[1].id).toBe('t2');
    });

    it('should filter out null tracks', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          items: [
            makeTrackItem('t1', '2025-01-15T00:00:00Z'),
            { track: null, added_at: '2025-01-15T00:00:00Z' },
          ],
          next: null,
        },
      });

      const result = await service.getTracks('token', 'p1');
      expect(result.tracks).toHaveLength(1);
    });
  });

  describe('removeTracksFromPlaylist', () => {
    it('should remove tracks and return snapshot', async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        data: { snapshot_id: 'snap-1' },
      });

      const result = await service.removeTracksFromPlaylist('token', 'p1', [
        'spotify:track:t1',
        'spotify:track:t2',
      ]);

      expect(result.removedCount).toBe(2);
      expect(result.snapshotId).toBe('snap-1');
      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });

    it('should batch in groups of 100', async () => {
      const uris = Array.from({ length: 150 }, (_, i) => `spotify:track:${i}`);
      mockedAxios.delete
        .mockResolvedValueOnce({ data: { snapshot_id: 'snap-1' } })
        .mockResolvedValueOnce({ data: { snapshot_id: 'snap-2' } });

      const result = await service.removeTracksFromPlaylist(
        'token',
        'p1',
        uris,
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(2);
      expect(result.removedCount).toBe(150);
      expect(result.snapshotId).toBe('snap-2');
    });
  });

  describe('addTracksToPlaylist', () => {
    it('should add tracks and return snapshot', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { snapshot_id: 'snap-add' },
      });

      const result = await service.addTracksToPlaylist('token', 'p1', [
        'spotify:track:t1',
      ]);

      expect(result.addedCount).toBe(1);
      expect(result.snapshotId).toBe('snap-add');
    });
  });

  describe('removeTracksByDate', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({
        data: {
          items: [
            makeTrackItem('t1', '2025-01-15T10:00:00Z'),
            makeTrackItem('t2', '2025-01-16T10:00:00Z'),
            makeTrackItem('t3', '2025-01-15T20:00:00Z'),
          ],
          next: null,
        },
      });
    });

    it('should remove tracks matching the date', async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        data: { snapshot_id: 'snap-del' },
      });

      const result = await service.removeTracksByDate(
        'token',
        'p1',
        '2025-01-15',
      );

      expect(result.removedCount).toBe(2);
      expect(result.removedTracks).toHaveLength(2);
    });

    it('should return 0 when no tracks match the date', async () => {
      const result = await service.removeTracksByDate(
        'token',
        'p1',
        '2099-12-25',
      );

      expect(result.removedCount).toBe(0);
      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });
  });

  describe('copyTracksByDate', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({
        data: {
          items: [
            makeTrackItem('t1', '2025-03-10T08:00:00Z'),
            makeTrackItem('t2', '2025-03-11T08:00:00Z'),
          ],
          next: null,
        },
      });
    });

    it('should copy matching tracks to target playlist', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { snapshot_id: 'snap-copy' },
      });

      const result = await service.copyTracksByDate(
        'token',
        'source-p',
        'target-p',
        '2025-03-10',
      );

      expect(result.addedCount).toBe(1);
      expect(result.tracks).toHaveLength(1);
      expect(result.tracks![0].uri).toBe('spotify:track:t1');
    });

    it('should return 0 when no tracks match', async () => {
      const result = await service.copyTracksByDate(
        'token',
        'source-p',
        'target-p',
        '2099-01-01',
      );

      expect(result.addedCount).toBe(0);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });
});
