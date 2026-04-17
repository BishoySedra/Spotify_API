import { Test } from '@nestjs/testing';
import { SpotifyController } from './spotify.controller';
import { SpotifyService } from './spotify.service';

describe('SpotifyController', () => {
  let controller: SpotifyController;
  let service: jest.Mocked<SpotifyService>;

  beforeEach(async () => {
    const mockService = {
      getPlaylists: jest.fn(),
      getTracks: jest.fn(),
      removeTracksFromPlaylist: jest.fn(),
      removeTracksByDate: jest.fn(),
      copyTracksByDate: jest.fn(),
      getFullLibrary: jest.fn(),
      addTracksToPlaylist: jest.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [SpotifyController],
      providers: [{ provide: SpotifyService, useValue: mockService }],
    }).compile();

    controller = module.get(SpotifyController);
    service = module.get(SpotifyService);
  });

  describe('getPlaylists', () => {
    it('should return playlists with message', async () => {
      service.getPlaylists.mockResolvedValue({
        total: 2,
        playlists: [
          {
            id: 'p1',
            name: 'Playlist 1',
            description: null,
            public: true,
            collaborative: false,
            tracksCount: 10,
            imageUrl: null,
            spotifyUrl: null,
          },
          {
            id: 'p2',
            name: 'Playlist 2',
            description: null,
            public: false,
            collaborative: true,
            tracksCount: 5,
            imageUrl: null,
            spotifyUrl: null,
          },
        ],
      });

      const result = await controller.getPlaylists('token');

      expect(result.message).toContain('2');
      expect(result.data?.total).toBe(2);
      expect(service.getPlaylists).toHaveBeenCalledWith('token');
    });
  });

  describe('getTracks', () => {
    it('should return tracks with message', async () => {
      service.getTracks.mockResolvedValue({
        playlistId: 'p1',
        total: 1,
        tracks: [
          {
            id: 't1',
            uri: 'spotify:track:t1',
            title: 'Track 1',
            artists: ['Artist'],
            album: 'Album',
            albumImageUrl: null,
            durationMs: 200000,
            explicit: false,
            spotifyUrl: null,
            addedAt: '2025-01-15T00:00:00Z',
          },
        ],
      });

      const result = await controller.getTracks('token', 'p1');

      expect(result.message).toContain('1 tracks');
      expect(result.data?.tracks).toHaveLength(1);
      expect(service.getTracks).toHaveBeenCalledWith('token', 'p1');
    });
  });

  describe('removeItems', () => {
    it('should call removeTracksFromPlaylist and return message', async () => {
      service.removeTracksFromPlaylist.mockResolvedValue({
        playlistId: 'p1',
        removedCount: 2,
        snapshotId: 'snap-1',
      });

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
      service.removeTracksByDate.mockResolvedValue({
        playlistId: 'p1',
        date: '2025-01-15',
        removedCount: 3,
        snapshotId: 'snap-2',
        removedTracks: [],
      });

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
      service.copyTracksByDate.mockResolvedValue({
        sourcePlaylistId: 'src',
        targetPlaylistId: 'tgt',
        date: '2025-01-15',
        addedCount: 5,
        snapshotId: 'snap-3',
        tracks: [],
      });

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
      service.getFullLibrary.mockResolvedValue({
        total: 1,
        playlists: [],
      });

      const result = await controller.getFullLibrary('token');

      expect(result.message).toContain('1 playlists');
      expect(service.getFullLibrary).toHaveBeenCalledWith('token');
    });
  });
});
