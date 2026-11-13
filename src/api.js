import axios from "axios";

export const TOKEN_KEY = "rent_tracker_token";
export const MUST_CHANGE_PASSWORD_KEY = "rent_tracker_must_change_password";

// One Axios instance for the whole app. The base URL comes from the .env file.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// Attach the JWT to every request when the landlord is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 means the token is missing or expired: clear it and return to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Read the small, non-sensitive display fields from the JWT payload.
export function getSessionUser() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
}

export const getMustChangePassword = () =>
  localStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === "true";

export const setMustChangePassword = (value) => {
  if (value) {
    localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, "true");
  } else {
    localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
  }
};

export const clearAuth = () => {
  clearToken();
  localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
};

// Turn FastAPI error payloads into a readable sentence.
export function errorMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(", ");
  }
  return error?.message || fallback;
}
