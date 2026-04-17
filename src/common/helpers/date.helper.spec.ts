import { HttpException } from '@nestjs/common';
import { parseDate, filterTracksByDate } from './date.helper';
import { ERROR_MESSAGES } from '../constants';
import type { MappedTrack } from '../types';

describe('parseDate', () => {
  it('should parse a valid ISO date string', () => {
    expect(parseDate('2025-01-15')).toBe('2025-01-15');
  });

  it('should parse a full ISO datetime and return date portion', () => {
    expect(parseDate('2025-03-20T14:30:00Z')).toBe('2025-03-20');
  });

  it('should throw HttpException 400 for invalid date', () => {
    expect(() => parseDate('not-a-date')).toThrow(HttpException);
    expect(() => parseDate('not-a-date')).toThrow(
      ERROR_MESSAGES.INVALID_DATE_FORMAT,
    );
  });

  it('should throw with status 400', () => {
    try {
      parseDate('invalid');
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(400);
    }
  });
});

describe('filterTracksByDate', () => {
  const tracks: MappedTrack[] = [
    {
      id: '1',
      uri: 'spotify:track:1',
      title: 'Track A',
      artists: ['Artist A'],
      album: 'Album A',
      albumImageUrl: null,
      durationMs: 200000,
      explicit: false,
      spotifyUrl: null,
      addedAt: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      uri: 'spotify:track:2',
      title: 'Track B',
      artists: ['Artist B'],
      album: 'Album B',
      albumImageUrl: null,
      durationMs: 180000,
      explicit: true,
      spotifyUrl: null,
      addedAt: '2025-01-16T08:00:00Z',
    },
    {
      id: '3',
      uri: 'spotify:track:3',
      title: 'Track C',
      artists: ['Artist C'],
      album: 'Album C',
      albumImageUrl: null,
      durationMs: 220000,
      explicit: false,
      spotifyUrl: null,
      addedAt: '2025-01-15T23:59:59Z',
    },
  ];

  it('should return tracks matching the given date', () => {
    const result = filterTracksByDate(tracks, '2025-01-15');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('3');
  });

  it('should return empty array when no tracks match', () => {
    const result = filterTracksByDate(tracks, '2025-12-25');
    expect(result).toHaveLength(0);
  });

  it('should return single match when only one track matches', () => {
    const result = filterTracksByDate(tracks, '2025-01-16');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});
