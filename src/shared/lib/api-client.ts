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
    url = 'http://127.0.0.1:8000/api';
  }
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  return url;
}

const initialMode = (import.meta as any).env?.VITE_API_MODE === 'mock' ? 'mock' : 'api';

const initialBaseUrl = getNormalizedBaseUrl(
  localStorage.getItem('mindhub_api_base_url') || (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
);

const config: ApiConfig = {
  mode: initialMode,
  baseUrl: initialBaseUrl,
  authToken: localStorage.getItem('mindhub_api_token') || undefined,
  isLogEnabled: false,
};

// In-flight request deduplication map
const inFlightRequests = new Map<string, Promise<any>>();

// Short-term in-memory cache for GET requests (TTL 20 seconds)
interface CacheEntry {
  data: any;
  expiry: number;
}
const apiMemoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 20000;

export function clearApiCache(endpointPrefix?: string) {
  if (!endpointPrefix) {
    apiMemoryCache.clear();
  } else {
    for (const key of apiMemoryCache.keys()) {
      if (key.includes(endpointPrefix)) {
        apiMemoryCache.delete(key);
      }
    }
  }
}

const devLog = (category: string, action: string, payload?: any) => {
  if (config.isLogEnabled) {
    const modeLabel = config.mode === 'api' ? 'REAL' : 'MOCK';
    console.log(
      `%c[API ${modeLabel}] %c${category} -> ${action}`,
      'color: #8b5e3c; font-weight: bold;',
      'color: #10b981;',
      payload || ''
    );
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

async function executeFetch<T>(url: string, options: RequestInit): Promise<T> {
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
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('mindhub-auth-unauthorized', { detail: { message: 'Phiên đăng nhập đã hết hạn' } }));
    }
    
    const errText = await response.text();
    let errJson;
    try {
      errJson = JSON.parse(errText);
    } catch {
      /* ignore */
    }
    let validationMsg = '';
    if (errJson?.errors && typeof errJson.errors === 'object') {
      const flattened = Object.values(errJson.errors).flat().filter((val) => typeof val === 'string' && val.trim().length > 0);
      if (flattened.length > 0) {
        validationMsg = (flattened as string[]).join('. ');
      }
    }
    const finalMessage = validationMsg || errJson?.message || `Lỗi máy chủ (${response.status})`;
    throw new ApiError(finalMessage, response.status, errJson?.errors || errJson);
  }

  if (response.status === 204) {
    return { success: true } as unknown as T;
  }

  const json = await response.json();
  // Unwrap Laravel ApiResponse envelope: { success, data, message }
  if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
    if (json.success === false) {
      throw new ApiError(json.message || 'Yêu cầu không thể hoàn thành', response.status === 200 ? 400 : response.status, json.errors);
    }
    
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

function buildUrlWithQuery(endpoint: string, options?: RequestInit & { query?: Record<string, any>; params?: Record<string, any> }): string {
  const baseUrl = getNormalizedBaseUrl(config.baseUrl);
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const queryObj = options?.query || options?.params;
  if (!queryObj || typeof queryObj !== 'object') {
    return `${baseUrl}${cleanEndpoint}`;
  }
  const searchParams = new URLSearchParams();
  Object.entries(queryObj).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, String(val));
    }
  });
  const qs = searchParams.toString();
  return qs ? `${baseUrl}${cleanEndpoint}${cleanEndpoint.includes('?') ? '&' : '?'}${qs}` : `${baseUrl}${cleanEndpoint}`;
}

async function apiFetch<T>(endpoint: string, options: RequestInit & { query?: Record<string, any>; params?: Record<string, any> } = {}): Promise<T> {
  const url = buildUrlWithQuery(endpoint, options);
  const method = (options.method || 'GET').toUpperCase();

  // Mutations invalidate in-memory cache
  if (method !== 'GET') {
    apiMemoryCache.clear();
    return executeFetch<T>(url, options);
  }

  // 1. Check in-memory cache
  const cacheKey = `${url}:${config.authToken || localStorage.getItem('mindhub_api_token') || 'anon'}`;
  const cached = apiMemoryCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }

  // 2. In-flight request deduplication
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)! as Promise<T>;
  }

  const fetchPromise = executeFetch<T>(url, options)
    .then((data) => {
      apiMemoryCache.set(cacheKey, {
        data,
        expiry: Date.now() + CACHE_TTL_MS,
      });
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

async function apiFetchEnvelope<T>(endpoint: string, options: RequestInit & { query?: Record<string, any>; params?: Record<string, any> } = {}): Promise<{ data: T; meta?: any }> {
  const url = buildUrlWithQuery(endpoint, options);
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

export function uploadFileWithProgress<T = any>(
  endpoint: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    const baseUrl = getNormalizedBaseUrl(config.baseUrl);
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    const url = `${baseUrl}${cleanEndpoint}`;
    const xhr = new XMLHttpRequest();
    const effectiveToken = config.authToken || localStorage.getItem('mindhub_api_token');

    xhr.open('POST', url);
    xhr.setRequestHeader('Accept', 'application/json');
    if (effectiveToken) {
      xhr.setRequestHeader('Authorization', `Bearer ${effectiveToken}`);
    }

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          const data = (json && typeof json === 'object' && 'data' in json) ? json.data : json;
          resolve(data as T);
        } catch {
          resolve(xhr.responseText as unknown as T);
        }
      } else {
        let errJson: any;
        try {
          errJson = JSON.parse(xhr.responseText);
        } catch {}
        const message = errJson?.message || `Lỗi tải lên tệp tin (${xhr.status})`;
        reject(new ApiError(message, xhr.status, errJson?.errors));
      }
    };

    xhr.onerror = () => {
      reject(new ApiError('Lỗi kết nối mạng khi tải lên tệp tin.', 0));
    };

    xhr.ontimeout = () => {
      reject(new ApiError('Quá thời gian chờ khi tải lên tệp tin.', 0));
    };

    xhr.send(formData);
  });
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

