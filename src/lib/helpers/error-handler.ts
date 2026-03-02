import axios from "axios";

export interface ErrorInfo {
  message: string;
  code?: string;
}

/**
 * Convert various error types to user-friendly messages
 */
export const getErrorMessage = (error: unknown): ErrorInfo => {
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as any;
    // Specific error based on status code
    switch (status) {
      case 401:
        return {
          message: "Invalid email or password. Please try again.",
          code: "INVALID_CREDENTIALS",
        };
      case 404:
        return {
          message: "User not found. Please check your email or sign up.",
          code: "USER_NOT_FOUND",
        };
      case 429:
        return {
          message: "Too many login attempts. Please try again later.",
          code: "RATE_LIMITED",
        };
      case 500:
        return {
          message: "Server error. Please try again later.",
          code: "SERVER_ERROR",
        };
      default:
        if (error.message === "Network Error") {
          return {
            message: "Network connection failed. Please check your internet connection.",
            code: "NETWORK_ERROR",
          };
        }
    }

    // Fallback to backend error message if available
    if (data?.message) {
      return {
        message: data.message,
        code: data.code || "UNKNOWN_ERROR",
      };
    }
  }

  // Standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message || "An error occurred. Please try again.",
      code: "UNKNOWN_ERROR",
    };
  }

  // Unknown error
  return {
    message: "An unexpected error occurred. Please try again.",
    code: "UNKNOWN_ERROR",
  };
};
