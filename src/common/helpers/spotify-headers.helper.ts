export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function authHeadersWithContentType(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
