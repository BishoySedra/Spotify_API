import { Test } from '@nestjs/testing';
import { SpotifyController } from '../spotify.controller';
import { SpotifyService } from '../spotify.service';
import { createMockSpotifyService } from './helpers/mock-spotify-service.helper';
import {
  PLAYLISTS_RESPONSE,
  TRACKS_RESPONSE,
  REMOVE_TRACKS_RESPONSE,
  REMOVE_BY_DATE_RESPONSE,
  COPY_BY_DATE_RESPONSE,
  LIBRARY_RESPONSE,
} from './fixtures/spotify-controller.fixtures';

describe('SpotifyController', () => {
  let controller: SpotifyController;
  let service: jest.Mocked<SpotifyService>;

  beforeEach(async () => {
    const mockService = createMockSpotifyService();

    const module = await Test.createTestingModule({
      controllers: [SpotifyController],
      providers: [{ provide: SpotifyService, useValue: mockService }],
    }).compile();

    controller = module.get(SpotifyController);
    service = module.get(SpotifyService);
  });

  describe('getPlaylists', () => {
    it('should return playlists with message', async () => {
      service.getPlaylists.mockResolvedValue(PLAYLISTS_RESPONSE);

      const result = await controller.getPlaylists('token');

      expect(result.message).toContain('2');
      expect(result.data?.total).toBe(2);
      expect(service.getPlaylists).toHaveBeenCalledWith('token');
    });
  });

  describe('getTracks', () => {
    it('should return tracks with message', async () => {
      service.getTracks.mockResolvedValue(TRACKS_RESPONSE);

      const result = await controller.getTracks('token', 'p1');

      expect(result.message).toContain('1 tracks');
      expect(result.data?.tracks).toHaveLength(1);
      expect(service.getTracks).toHaveBeenCalledWith('token', 'p1');
    });
  });

  describe('removeItems', () => {
    it('should call removeTracksFromPlaylist and return message', async () => {
      service.removeTracksFromPlaylist.mockResolvedValue(
        REMOVE_TRACKS_RESPONSE,
      );

      const result = await controller.removeItems('token', 'p1', {
        uris: ['spotify:track:t1', 'spotify:track:t2'],
      });

      expect(result.message).toContain('2');
      expect(service.removeTracksFromPlaylist).toHaveBeenCalledWith(
        'token',
        'p1',
        ['spotify:track:t1', 'spotify:track:t2'],
        undefined,
      );
    });
  });

  describe('removeItemsByDate', () => {
    it('should call removeTracksByDate and return message', async () => {
      service.removeTracksByDate.mockResolvedValue(REMOVE_BY_DATE_RESPONSE);

      const result = await controller.removeItemsByDate(
        'token',
        'p1',
        '2025-01-15',
      );

      expect(result.message).toContain('3');
      expect(result.message).toContain('2025-01-15');
    });
  });

  describe('copyItemsByDate', () => {
    it('should call copyTracksByDate and return message', async () => {
      service.copyTracksByDate.mockResolvedValue(COPY_BY_DATE_RESPONSE);

      const result = await controller.copyItemsByDate(
        'token',
        'src',
        '2025-01-15',
        { targetPlaylistId: 'tgt' },
      );

      expect(result.message).toContain('5');
      expect(result.message).toContain('tgt');
    });
  });

  describe('getFullLibrary', () => {
    it('should return library with message', async () => {
      service.getFullLibrary.mockResolvedValue(LIBRARY_RESPONSE);

      const result = await controller.getFullLibrary('token');

      expect(result.message).toContain('1 playlists');
      expect(service.getFullLibrary).toHaveBeenCalledWith('token');
    });
  });
});
