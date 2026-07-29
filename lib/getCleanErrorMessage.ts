/**
 * Safely extracts human-readable error messages from Axios / API errors for frontend components.
 * Guarantees that raw status codes ("Request failed with status code 500"), error codes ("P2002"),
 * or unformatted error objects are replaced with clean, friendly fallback text.
 */
export function getCleanErrorMessage(
  error: any,
  fallbackMessage: string = "An error occurred. Please try again."
): string {
  if (!error) return fallbackMessage;

  // 1. Check for server response error payload (e.g. { error: "..." } or { message: "..." })
  const serverError = error.response?.data?.error || error.response?.data?.message;
  if (typeof serverError === "string" && serverError.trim().length > 0) {
    const msg = serverError.trim();
    const isRawErrorCode = /^P2\d{3}$/.test(msg) || /^ERR_/.test(msg);
    const isStatusMessage = msg.includes("Request failed with status code");

    if (!isRawErrorCode && !isStatusMessage && msg !== "[object Object]") {
      return msg;
    }
  }

  // 2. Check standard Error message if client-side/network error
  if (typeof error.message === "string" && error.message.trim().length > 0) {
    const msg = error.message.trim();
    const isStatusMessage = msg.includes("Request failed with status code");
    const isNetworkError = msg === "Network Error" || msg.includes("ECONNREFUSED");
    const isRawErrorCode = /^P2\d{3}$/.test(msg) || /^ERR_/.test(msg);

    if (!isStatusMessage && !isNetworkError && !isRawErrorCode && msg !== "[object Object]") {
      return msg;
    }
  }

  // 3. String error
  if (typeof error === "string" && error.trim().length > 0) {
    if (!/^P2\d{3}$/.test(error) && !error.includes("ERR_") && !error.includes("Request failed")) {
      return error;
    }
  }

  return fallbackMessage;
}
