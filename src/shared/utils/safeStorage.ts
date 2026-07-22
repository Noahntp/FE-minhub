class MemoryStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] !== undefined ? keys[index] : null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

const localStore = new MemoryStorage();
const sessionStore = new MemoryStorage();

export const safeLocalStorage = (() => {
  try {
    const storage = window.localStorage;
    // Test if we can actually use it
    const testKey = '__safe_storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch (e) {
    console.warn('[Storage Polyfill] window.localStorage is blocked or unavailable. Using safe in-memory fallback.');
    return localStore;
  }
})();

export const safeSessionStorage = (() => {
  try {
    const storage = window.sessionStorage;
    // Test if we can actually use it
    const testKey = '__safe_storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch (e) {
    console.warn('[Storage Polyfill] window.sessionStorage is blocked or unavailable. Using safe in-memory fallback.');
    return sessionStore;
  }
})();
