import type { AxiosErrorResponse } from '../../../types';

export const UNAUTHORIZED_ERROR: AxiosErrorResponse = {
  response: { status: 401, data: {} },
};

export const FORBIDDEN_ERROR: AxiosErrorResponse = {
  response: { status: 403, data: {} },
};

export const RATE_LIMITED_ERROR: AxiosErrorResponse = {
  response: { status: 429, data: {} },
};

export const BAD_REQUEST_WITH_MESSAGE: AxiosErrorResponse = {
  response: {
    status: 400,
    data: { error: { message: 'Bad request from Spotify' } },
  },
};

export const NETWORK_ERROR: AxiosErrorResponse = {
  message: 'Network error',
};

export const EMPTY_ERROR: AxiosErrorResponse = {};
