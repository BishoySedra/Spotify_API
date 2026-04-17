export function createMockHost() {
  const mockJson = jest.fn().mockReturnThis();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status: mockStatus, json: mockJson }),
      getRequest: () => ({}),
    }),
  } as never;

  return { host, mockJson, mockStatus };
}
