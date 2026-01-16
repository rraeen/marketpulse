import { NextResponse } from 'next/server';

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Standardized error response handler
 */
export function createErrorResponse(
  message: string,
  status: number,
  code?: string,
  details?: unknown
): NextResponse<ApiError> {
  const error: ApiError = { error: message };
  if (code) error.code = code;
  if (details) error.details = details;

  return NextResponse.json(error, { status });
}

/**
 * Standardized success response handler
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Handles async route errors consistently
 */
export function handleRouteError(error: unknown, context: string): NextResponse<ApiError> {
  const err = error as Error;
  console.error(`${context} error:`, err);

  // Handle known error types
  if (err.message === 'Email already registered') {
    return createErrorResponse(err.message, 409, 'EMAIL_EXISTS');
  }

  if (err.message === 'Invalid credentials') {
    return createErrorResponse(err.message, 401, 'INVALID_CREDENTIALS');
  }

  if (err.message === 'Unauthorized' || err.message === 'Forbidden') {
    return createErrorResponse(err.message, 403, 'FORBIDDEN');
  }

  // Generic error response
  return createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR');
}
