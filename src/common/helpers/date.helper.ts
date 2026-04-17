import { HttpException } from '@nestjs/common';
import { ERROR_MESSAGES } from '../constants';
import type { MappedTrack } from '../types';

export function parseDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new HttpException(ERROR_MESSAGES.INVALID_DATE_FORMAT, 400);
  }
  return date.toISOString().split('T')[0];
}

export function filterTracksByDate(
  tracks: MappedTrack[],
  targetDateStr: string,
): MappedTrack[] {
  return tracks.filter((t) => {
    const trackDate = new Date(t.addedAt).toISOString().split('T')[0];
    return trackDate === targetDateStr;
  });
}
