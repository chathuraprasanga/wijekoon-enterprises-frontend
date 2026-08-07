export interface ApiErrorResponse {
  message: string;
}

export interface PagedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
