import { HttpException } from '@nestjs/common';
import { HttpExceptionFilter } from '../http-exception.filter';
import { createMockHost } from './helpers/mock-host.helper';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('should handle HttpException and return structured error', () => {
    const { host, mockStatus, mockJson } = createMockHost();
    const exception = new HttpException('Not found', 404);
    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        statusCode: 404,
        message: 'Not found',
      },
    });
  });

  it('should handle unknown exceptions as 500', () => {
    const { host, mockStatus, mockJson } = createMockHost();
    const exception = new Error('Something broke');
    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        statusCode: 500,
        message: 'Internal server error',
      },
    });
  });

  it('should handle non-Error objects as 500', () => {
    const { host, mockStatus, mockJson } = createMockHost();
    filter.catch('string error', host);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        statusCode: 500,
        message: 'Internal server error',
      },
    });
  });
});
