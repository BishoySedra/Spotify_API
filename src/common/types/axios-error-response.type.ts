export interface AxiosErrorResponse {
  response?: {
    status: number;
    data: {
      error?: { message: string };
      error_description?: string;
    };
  };
  message?: string;
}
