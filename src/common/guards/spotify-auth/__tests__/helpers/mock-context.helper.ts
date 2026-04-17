export function mockContext(authHeader?: string) {
  const req: Record<string, unknown> = {
    headers: { authorization: authHeader },
  };
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as never;
}
