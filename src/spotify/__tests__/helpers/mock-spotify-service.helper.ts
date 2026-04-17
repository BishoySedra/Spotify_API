export function createMockSpotifyService() {
  return {
    getPlaylists: jest.fn(),
    getTracks: jest.fn(),
    removeTracksFromPlaylist: jest.fn(),
    removeTracksByDate: jest.fn(),
    copyTracksByDate: jest.fn(),
    getFullLibrary: jest.fn(),
    addTracksToPlaylist: jest.fn(),
  };
}
