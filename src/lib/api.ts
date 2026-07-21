import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const SESSION_TOKEN_KEY = "mindhub_session_token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 30_000,
  withCredentials: true,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(
      SESSION_TOKEN_KEY,
    );

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
);

api.interceptors.response.use(
  (response) => response,

  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(SESSION_TOKEN_KEY);
    }

    return Promise.reject(error);
  },
);

export function saveSessionToken(
  token: string,
): void {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
}

export function clearSessionToken(): void {
  localStorage.removeItem(SESSION_TOKEN_KEY);
}
