import axios, { type AxiosResponse } from 'axios';
import type { 
  SavedSectionCreateDto, 
  PublicSavedSectionDto,
  ApiResponse,
  ApiError 
} from '../../types/savedSections.types';

// Base axios instance for saved sections API
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API response handler
const handleResponse = <T>(response: AxiosResponse<T>): ApiResponse<T> => ({
  data: response.data,
  status: response.status,
});

// API error handler
const handleError = (error: unknown): never => {
  const errorResponse = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
  const apiError: ApiError = {
    message: errorResponse?.response?.data?.message || errorResponse?.message || 'Unknown error',
    status: errorResponse?.response?.status || 500,
  };
  throw apiError;
};

/**
 * Create a new saved section
 * POST /api/sections
 */
export const createSavedSection = async (
  createDto: SavedSectionCreateDto
): Promise<ApiResponse<PublicSavedSectionDto>> => {
  try {
    const response = await api.post<PublicSavedSectionDto>('/sections', createDto);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Get all saved sections
 * GET /api/sections
 */
export const getSavedSections = async (): Promise<ApiResponse<PublicSavedSectionDto[]>> => {
  try {
    const response = await api.get<PublicSavedSectionDto[]>('/sections');
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Delete a saved section by ID
 * DELETE /api/sections/{itemId}
 */
export const deleteSavedSection = async (itemId: string): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete<void>(`/sections/${itemId}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Export the api instance for potential customization
export { api as savedSectionsApi };
