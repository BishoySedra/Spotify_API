import { Test } from '@nestjs/testing';
import axios from 'axios';
import { SpotifyService } from '../spotify.service';
import { registerMockCleanup } from '../../common/__tests__/utils/test-setup.util';
import {
  mockPlaylistsApiCalls,
  PAGINATED_TRACKS_PAGE_1,
  PAGINATED_TRACKS_PAGE_2,
  TRACKS_WITH_NULL,
  DATE_FILTER_TRACKS,
  COPY_TRACKS,
} from './fixtures/spotify-service.fixtures';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SpotifyService', () => {
  let service: SpotifyService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SpotifyService],
    }).compile();

    service = module.get(SpotifyService);
  });

  registerMockCleanup();

  describe('getPlaylists', () => {
    it('should return owned and collaborative playlists', async () => {
      mockPlaylistsApiCalls(mockedAxios);

      const result = await service.getPlaylists('token');

      expect(result.total).toBe(1);
      expect(result.playlists[0].id).toBe('p1');
      expect(result.playlists[0].name).toBe('My Playlist');
    });
  });

  describe('getTracks', () => {
    it('should return all tracks with pagination', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(PAGINATED_TRACKS_PAGE_1)
        .mockResolvedValueOnce(PAGINATED_TRACKS_PAGE_2);

      const result = await service.getTracks('token', 'p1');

      expect(result.total).toBe(2);
      expect(result.tracks).toHaveLength(2);
      expect(result.tracks[0].id).toBe('t1');
      expect(result.tracks[1].id).toBe('t2');
    });

    it('should filter out null tracks', async () => {
      mockedAxios.get.mockResolvedValueOnce(TRACKS_WITH_NULL);

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
      mockedAxios.get.mockResolvedValue(DATE_FILTER_TRACKS);
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
      mockedAxios.get.mockResolvedValue(COPY_TRACKS);
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
