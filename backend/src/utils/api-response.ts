export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

export const sendSuccess = <T>(
  data: T,
  message = "Success"
): ApiSuccessResponse<T> => ({
  success: true,
  message,
  data
});

export const sendError = (
  message: string,
  errors?: Record<string, string[]>
): ApiErrorResponse => ({
  success: false,
  message,
  errors
});
