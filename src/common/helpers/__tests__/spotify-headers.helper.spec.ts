import {
  authHeaders,
  authHeadersWithContentType,
} from '../spotify-headers.helper';

describe('authHeaders', () => {
  it('should return an Authorization header with Bearer token', () => {
    const headers = authHeaders('test-token');
    expect(headers).toEqual({ Authorization: 'Bearer test-token' });
  });
});

describe('authHeadersWithContentType', () => {
  it('should return Authorization and Content-Type headers', () => {
    const headers = authHeadersWithContentType('test-token');
    expect(headers).toEqual({
      Authorization: 'Bearer test-token',
      'Content-Type': 'application/json',
    });
  });
});
