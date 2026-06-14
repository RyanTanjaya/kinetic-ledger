import axios from 'axios';

// Base URL of the Kinetic Ledger API. Override with VITE_API_URL in a .env file.
const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';

export const api = axios.create({ baseURL });

// Turn an axios error into a user-friendly message. Distinguishes a server-side
// error (has an HTTP response) from the API being unreachable (no response).
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(err)) {
    if (err.response) {
      return (err.response.data as { error?: string } | undefined)?.error ?? fallback;
    }
    return `Can't reach the server at ${baseURL}. Make sure the API is running (npm run dev:server).`;
  }
  return fallback;
}

const TOKEN_KEY = 'kl_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Attach the JWT to every request if present.
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, drop the token and let the app react (AuthProvider listens for this).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      tokenStore.clear();
      window.dispatchEvent(new Event('kl-unauthorized'));
    }
    return Promise.reject(error);
  }
);
