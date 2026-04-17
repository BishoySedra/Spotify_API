export function makeTrackItem(id: string, addedAt: string) {
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
