import { Course, Chapter, Lesson, Resource, User, QAMessage, StudentProgress, PayoutRequest, AuditLog, InstructorRequest, AccountRequest } from '@/shared/types';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';

export interface ApiConfig {
  mode: 'mock' | 'api';
  baseUrl: string;
  authToken?: string;
  isLogEnabled: boolean;
}

export function getNormalizedBaseUrl(rawUrl?: string): string {
  let url = (rawUrl || '').trim();
  if (!url) {
    url = 'http://localhost:8000/api';
  }
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  return url;
}

const initialMode = (import.meta as any).env?.VITE_API_MODE === 'api' ? 'api' : 'mock';

const initialBaseUrl = getNormalizedBaseUrl(
  localStorage.getItem('mindhub_api_base_url') || (import.meta as any).env?.VITE_API_BASE_URL
);

const config: ApiConfig = {
  mode: initialMode,
  baseUrl: initialBaseUrl,
  authToken: localStorage.getItem('mindhub_api_token') || undefined,
  isLogEnabled: true,
};

const devLog = (category: string, action: string, payload?: any) => {
  if (config.isLogEnabled) {
    console.log(
      `%c[API ${config.mode.toUpperCase()}] %c${category} -> ${action}`,
      'color: #8b5e3c; font-weight: bold;',
      'color: #10b981;',
      payload || ''
    );
    // Append to virtual logger for developer console in dashboards
    try {
      const logs = JSON.parse(localStorage.getItem('mindhub_virtual_api_logs') || '[]');
      const newLog = {
        id: 'log-' + Date.now() + Math.random().toString(36).substr(2, 4),
        time: new Date().toLocaleTimeString(),
        mode: config.mode,
        category,
        action,
        payload: payload ? JSON.stringify(payload, null, 2) : 'No payload',
      };
      localStorage.setItem('mindhub_virtual_api_logs', JSON.stringify([newLog, ...logs].slice(0, 100)));
    } catch (e) {
      /* ignore storage errors */
    }
  }
};

export class ApiError extends Error {
  status: number;
  errors?: any;
  constructor(message: string, status: number, errors?: any) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getNormalizedBaseUrl(config.baseUrl);
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');
  
  const effectiveToken = config.authToken || localStorage.getItem('mindhub_api_token');
  if (effectiveToken) {
    headers.set('Authorization', `Bearer ${effectiveToken}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    });
  } catch (netErr: any) {
    devLog('Network Error', String(netErr), { url });
    throw new ApiError(
      `Không thể kết nối đến máy chủ API (${netErr?.message || 'Failed to fetch'}). Vui lòng kiểm tra Server Backend.`,
      0,
      { isNetworkError: true, originalError: String(netErr), url }
    );
  }

  if (!response.ok) {
    const errText = await response.text();
    let errJson;
    try {
      errJson = JSON.parse(errText);
    } catch {
      /* ignore */
    }
    const errMsg = errJson?.message || errJson?.error || `HTTP error! status: ${response.status}`;
    devLog('Error Response', errMsg, { status: response.status, url });
    throw new ApiError(errMsg, response.status, errJson?.errors);
  }

  // Handle No Content / Empty HTTP 204 response safely
  if (response.status === 204) {
    return { success: true } as unknown as T;
  }

  const json = await response.json();
  // Unwrap Laravel ApiResponse envelope: { success, data, message }
  if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
    if (json.data && typeof json.data === 'object') {
      if (json.pagination && !(json.data as any).pagination) {
        (json.data as any).pagination = json.pagination;
      }
      if (json.meta && !(json.data as any).meta) {
        (json.data as any).meta = json.meta;
      }
    }
    return json.data as T;
  }
  return json as T;
}

async function apiFetchEnvelope<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T; meta?: any }> {
  const url = `${config.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const headers = new Headers(options.headers || {});
  
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');
  
  const effectiveToken = config.authToken || localStorage.getItem('mindhub_api_token');
  if (effectiveToken) {
    headers.set('Authorization', `Bearer ${effectiveToken}`);
  }

  let response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    });
  } catch (netErr) {
    devLog('Network Error', String(netErr), { url });
    throw new Error('Không thể kết nối đến máy chủ Backend.');
  }

  if (!response.ok) {
    const errText = await response.text();
    let errJson;
    try {
      errJson = JSON.parse(errText);
    } catch {
      /* ignore */
    }
    const errMsg = errJson?.message || errJson?.error || `HTTP error! status: ${response.status}`;
    devLog('Error Response', errMsg, { status: response.status, url });
    throw new ApiError(errMsg, response.status, errJson?.errors);
  }

  if (response.status === 204) {
    return { data: [] as unknown as T };
  }

  const json = await response.json();
  if (json && typeof json === 'object' && 'data' in json) {
    return {
      data: json.data as T,
      meta: json.meta,
    };
  }
  return { data: json as T };
}

interface Section {
  id: string;
  title: string;
  course_id: string;
  order: number;
}

export const setAuthToken = (token: string | null) => {
  if (token) {
    config.authToken = token;
    localStorage.setItem('mindhub_api_token', token);
  } else {
    config.authToken = undefined;
    localStorage.removeItem('mindhub_api_token');
  }
};

export { apiFetch, apiFetchEnvelope, devLog, config };
