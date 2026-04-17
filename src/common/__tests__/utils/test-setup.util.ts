export function registerMockCleanup() {
  afterEach(() => {
    jest.resetAllMocks();
  });
}
