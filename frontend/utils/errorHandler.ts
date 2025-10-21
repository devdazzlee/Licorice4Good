import axios from "axios";
import { toast } from "react-toastify";

export interface BackendError {
  error?: string;
  message?: string;
  errors?: string[] | Record<string, string[]>;
  details?: string;
  code?: string;
}

export const handleBackendError = (
  err: unknown,
  fallbackMessage: string = "An error occurred"
): string => {
  console.log("Error:", err);

  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const responseData = err.response?.data as BackendError | undefined;

    // Handle different types of backend errors
    if (responseData) {
      // Check for multiple error formats
      let errorMessage = "";

      if (responseData.error) {
        errorMessage = responseData.error;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.errors) {
        // Handle validation errors array
        if (Array.isArray(responseData.errors)) {
          errorMessage = responseData.errors.join(", ");
        } else if (typeof responseData.errors === "object") {
          errorMessage = Object.values(responseData.errors).flat().join(", ");
        } else {
          errorMessage = String(responseData.errors);
        }
      } else if (responseData.details) {
        errorMessage = responseData.details;
      } else if (typeof responseData === "string") {
        errorMessage = responseData;
      }

      // Show error in toast and return message
      if (errorMessage) {
        toast.error(errorMessage);
        return errorMessage;
      } else {
        // Fallback based on status codes
        return getFallbackMessage(status, fallbackMessage);
      }
    } else {
      // No response data
      const fallbackMsg =
        "Network error. Please check your connection and try again.";
      toast.error(fallbackMsg);
      return fallbackMsg;
    }
  } else {
    // Non-axios error
    const message = err instanceof Error ? err.message : fallbackMessage;
    toast.error(message);
    return message;
  }
};

const getFallbackMessage = (
  status: number | undefined,
  fallbackMessage: string
): string => {
  if (!status) {
    const fallbackMsg =
      "Network error. Please check your connection and try again.";
    toast.error(fallbackMsg);
    return fallbackMsg;
  }

  let fallbackMsg = "";

  switch (status) {
    case 400:
      fallbackMsg = "Invalid request. Please check your input.";
      break;
    case 401:
      fallbackMsg = "Please log in to access this feature.";
      break;
    case 403:
      fallbackMsg =
        "Access denied. You don't have permission to perform this action.";
      break;
    case 404:
      fallbackMsg = "Resource not found. Please try again.";
      break;
    case 409:
      fallbackMsg = "Conflict. The resource already exists or is in use.";
      break;
    case 422:
      fallbackMsg = "Validation failed. Please check your input.";
      break;
    case 429:
      fallbackMsg = "Too many requests. Please try again later.";
      break;
    case 500:
      fallbackMsg = "Server error. Please try again later.";
      break;
    case 502:
      fallbackMsg = "Bad gateway. Please try again later.";
      break;
    case 503:
      fallbackMsg = "Service unavailable. Please try again later.";
      break;
    default:
      fallbackMsg = `${fallbackMessage} (${status})`;
  }

  toast.error(fallbackMsg);
  return fallbackMsg;
};

export const showSuccessToast = (message: string) => {
  toast.success(message);
};

export const showErrorToast = (message: string) => {
  toast.error(message);
};

export const showInfoToast = (message: string) => {
  toast.info(message);
};

export const showWarningToast = (message: string) => {
  toast.warning(message);
};
