import axios from 'axios';
import { SPOTIFY_API_BASE } from '../../../common/constants';
import { makeTrackItem } from '../helpers/make-track-item.helper';

export const PLAYLISTS_API_RESPONSE = {
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
        external_urls: { spotify: 'https://open.spotify.com/playlist/p1' },
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
};

export const USER_API_RESPONSE = { data: { id: 'user1' } };

export function mockPlaylistsApiCalls(
  mockedAxios: jest.Mocked<typeof axios>,
) {
  mockedAxios.get.mockImplementation((url: string) => {
    if (url.includes('/me/playlists')) {
      return Promise.resolve(PLAYLISTS_API_RESPONSE);
    }
    if (url === `${SPOTIFY_API_BASE}/me`) {
      return Promise.resolve(USER_API_RESPONSE);
    }
    return Promise.reject(new Error('Unexpected URL'));
  });
}

export const PAGINATED_TRACKS_PAGE_1 = {
  data: {
    items: [makeTrackItem('t1', '2025-01-15T00:00:00Z')],
    next: 'https://api.spotify.com/v1/playlists/p1/items?offset=100',
  },
};

export const PAGINATED_TRACKS_PAGE_2 = {
  data: {
    items: [makeTrackItem('t2', '2025-01-16T00:00:00Z')],
    next: null,
  },
};

export const TRACKS_WITH_NULL = {
  data: {
    items: [
      makeTrackItem('t1', '2025-01-15T00:00:00Z'),
      { track: null, added_at: '2025-01-15T00:00:00Z' },
    ],
    next: null,
  },
};

export const DATE_FILTER_TRACKS = {
  data: {
    items: [
      makeTrackItem('t1', '2025-01-15T10:00:00Z'),
      makeTrackItem('t2', '2025-01-16T10:00:00Z'),
      makeTrackItem('t3', '2025-01-15T20:00:00Z'),
    ],
    next: null,
  },
};

export const COPY_TRACKS = {
  data: {
    items: [
      makeTrackItem('t1', '2025-03-10T08:00:00Z'),
      makeTrackItem('t2', '2025-03-11T08:00:00Z'),
    ],
    next: null,
  },
};
