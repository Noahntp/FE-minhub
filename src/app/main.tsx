// Safe Storage & IndexedDB polyfills for sandboxed iframe environments
if (typeof window !== 'undefined') {
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msgStr = String(message || '').toLowerCase();
    const srcStr = String(source || '').toLowerCase();
    if (
      msgStr.includes('script error') || 
      srcStr.includes('youtube.com') ||
      !srcStr || // suppresses masked errors from unknown cross-origin sources
      srcStr.includes('google')
    ) {
      console.warn('[Global Error Filter] Suppressed cross-origin script error:', message, 'from', source);
      return true; // Prevent default firing / reporting
    }
    if (originalOnError) {
      return (originalOnError as any).apply(this, arguments);
    }
    return false;
  };

  window.addEventListener('error', (event) => {
    const msgStr = String(event.message || '').toLowerCase();
    const filenameStr = String(event.filename || '').toLowerCase();
    if (
      msgStr.includes('script error') || 
      filenameStr.includes('youtube.com') ||
      !filenameStr ||
      filenameStr.includes('google')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, { capture: true });

  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason || '').toLowerCase();
    if (
      reasonStr.includes('script error') || 
      reasonStr.includes('youtube.com') ||
      reasonStr.includes('google')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

const createMemoryStore = (): Storage => {
  let store: Record<string, string> = {};
  return {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      store = {};
    },
    getItem(key: string) {
      return store[key] !== undefined ? store[key] : null;
    },
    key(index: number) {
      const keys = Object.keys(store);
      return keys[index] !== undefined ? keys[index] : null;
    },
    removeItem(key: string) {
      delete store[key];
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    }
  };
};

const localMemoryStore = createMemoryStore();
const sessionMemoryStore = createMemoryStore();

const applyStoragePolyfill = (obj: any, prop: string, store: Storage) => {
  try {
    Object.defineProperty(obj, prop, {
      get() {
        return store;
      },
      set() {
        // Safe no-op or ignore
      },
      configurable: true,
      enumerable: true
    });
  } catch (err) {
    console.warn(`[Storage Polyfill] Failed to define ${prop} on`, obj, err);
  }
};

try {
  const testKey = '__test_storage_access__';
  window.localStorage.setItem(testKey, testKey);
  window.localStorage.removeItem(testKey);
} catch (e) {
  console.warn('[Storage Polyfill] LocalStorage is blocked, defining safe in-memory fallback.');
  
  // Try Window.prototype (highly effective in sandboxes)
  if (typeof Window !== 'undefined' && Window.prototype) {
    applyStoragePolyfill(Window.prototype, 'localStorage', localMemoryStore);
    applyStoragePolyfill(Window.prototype, 'sessionStorage', sessionMemoryStore);
  }

  // Try window
  applyStoragePolyfill(window, 'localStorage', localMemoryStore);
  applyStoragePolyfill(window, 'sessionStorage', sessionMemoryStore);

  // Try globalThis
  if (typeof globalThis !== 'undefined') {
    applyStoragePolyfill(globalThis, 'localStorage', localMemoryStore);
    applyStoragePolyfill(globalThis, 'sessionStorage', sessionMemoryStore);
  }
}

try {
  const dummy = window.indexedDB;
} catch (e) {
  console.warn('[Storage Polyfill] IndexedDB is blocked, defining safe mock to avoid runtime exceptions.');
  try {
    Object.defineProperty(window, 'indexedDB', {
      value: {
        open: () => {
          const mockRequest: any = {
            onerror: null,
            onsuccess: null,
            onupgradeneeded: null,
            result: null,
            error: new Error('IndexedDB is disabled in this sandboxed context.')
          };
          setTimeout(() => {
            if (typeof mockRequest.onerror === 'function') {
              const event = { target: mockRequest };
              mockRequest.onerror(event);
            }
          }, 10);
          return mockRequest;
        }
      },
      writable: true,
      configurable: true
    });
  } catch (err) {
    console.warn('[Storage Polyfill] Failed to redefine window.indexedDB:', err);
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { GlobalErrorBoundary } from '@/shared/components/ui/GlobalErrorBoundary';
import { Toaster } from 'sonner';
import '@/app/index.css';

import { AppProvider } from '@/app/AppContext';
import AppRouter from '@/router/AppRouter';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <AppProvider>
        <AppRouter />
        <Toaster position="bottom-right" richColors theme="system" />
      </AppProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
);