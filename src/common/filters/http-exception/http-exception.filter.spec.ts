import { HttpException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: ReturnType<typeof createMockHost>;

  function createMockHost() {
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    return {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus, json: mockJson }),
        getRequest: () => ({}),
      }),
    } as never;
  }

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockHost = createMockHost();
  });

  it('should handle HttpException and return structured error', () => {
    const exception = new HttpException('Not found', 404);
    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        statusCode: 404,
        message: 'Not found',
      },
    });
  });

  it('should handle unknown exceptions as 500', () => {
    const exception = new Error('Something broke');
    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        statusCode: 500,
        message: 'Internal server error',
      },
    });
  });

  it('should handle non-Error objects as 500', () => {
    filter.catch('string error', mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        statusCode: 500,
        message: 'Internal server error',
      },
    });
  });
});
