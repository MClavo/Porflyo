// Types for saved sections API

export interface ApiResponse<T = unknown> {
  data?: T;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
}