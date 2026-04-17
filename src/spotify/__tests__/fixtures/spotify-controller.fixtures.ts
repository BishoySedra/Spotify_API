export const PLAYLISTS_RESPONSE = {
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
};

export const TRACKS_RESPONSE = {
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
};

export const REMOVE_TRACKS_RESPONSE = {
  playlistId: 'p1',
  removedCount: 2,
  snapshotId: 'snap-1',
};

export const REMOVE_BY_DATE_RESPONSE = {
  playlistId: 'p1',
  date: '2025-01-15',
  removedCount: 3,
  snapshotId: 'snap-2',
  removedTracks: [],
};

export const COPY_BY_DATE_RESPONSE = {
  sourcePlaylistId: 'src',
  targetPlaylistId: 'tgt',
  date: '2025-01-15',
  addedCount: 5,
  snapshotId: 'snap-3',
  tracks: [],
};

export const LIBRARY_RESPONSE = {
  total: 1,
  playlists: [],
};
