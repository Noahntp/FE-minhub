// IndexedDB utility for persisting uploaded user MP3 background music
// Stores files as Blobs with auto-expiration (max 1 week / 7 days)

const DB_NAME = 'MindHubMusicDB';
const STORE_NAME = 'uploaded_songs';
const DB_VERSION = 1;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export interface StoredSong {
  id: string;
  title: string;
  blob: Blob;
  uploadedAt: number;
}

export interface PlayableSong {
  id: string;
  title: string;
  url: string;
  isYoutube: boolean;
  uploadedAt: number;
  expiresAt: number;
}

// Track active createObjectURLs to avoid memory leaks
const activeObjectUrls = new Map<string, string>();

export function revokeAllActiveUrls(): void {
  activeObjectUrls.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Error revoking URL:', e);
    }
  });
  activeObjectUrls.clear();
}

function getSafeIndexedDB(): IDBFactory | null {
  try {
    if (typeof window !== 'undefined' && window.indexedDB) {
      return window.indexedDB;
    }
  } catch (e) {
    console.warn('[Storage Polyfill] Failed to safely access window.indexedDB:', e);
  }
  return null;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const idb = getSafeIndexedDB();
      if (!idb) {
        return reject(new Error('IndexedDB is not supported or is blocked in this environment.'));
      }
      const request = idb.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Khởi tạo cơ sở dữ liệu IndexedDB thất bại.'));
      };

      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Validates file type and reads audio metadata to ensure duration is strictly under 6 minutes.
 */
export function validateMp3File(file: File): Promise<{ isValid: boolean; error?: string; duration?: number }> {
  return new Promise((resolve) => {
    // Double check file name extension & mime type
    const nameLower = file.name.toLowerCase();
    const isMp3Extension = nameLower.endsWith('.mp3');
    const isMp3Mime = file.type === 'audio/mpeg' || file.type === 'audio/mp3' || file.type === 'audio/x-mpeg';

    if (!isMp3Extension && !isMp3Mime) {
      return resolve({
        isValid: false,
        error: 'Tệp không đúng định dạng. Chỉ chấp nhận các tệp âm thanh đuôi .mp3'
      });
    }

    let audio: HTMLAudioElement | null = null;
    try {
      if (typeof Audio !== 'undefined') {
        audio = new Audio();
      }
    } catch (e) {
      console.warn('[Audio Polyfill] Audio constructor is blocked or unsupported:', e);
    }

    if (!audio) {
      return resolve({
        isValid: false,
        error: 'Trình duyệt hoặc môi trường sandbox của bạn không hỗ trợ kiểm tra định dạng âm thanh.'
      });
    }

    const objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;

    // Set fallback timeout in case browser fails to trigger events
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        isValid: false,
        error: 'Quá thời gian kiểm tra tệp âm thanh. Vui lòng thử lại.'
      });
    }, 12000);

    audio.addEventListener('loadedmetadata', () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);
      const duration = audio.duration;

      if (isNaN(duration)) {
        return resolve({
          isValid: false,
          error: 'Không tìm thấy thông tin thời lượng bài hát.'
        });
      }

      if (duration > 360) {
        return resolve({
          isValid: false,
          error: `Thời lượng nhạc tải lên lớn hơn giới hạn cho phép. (Bài hát dài ${Math.floor(duration / 60)} phút ${Math.round(duration % 60)} giây, giới hạn tối đa là 6 phút)`
        });
      }

      resolve({
        isValid: true,
        duration
      });
    });

    audio.addEventListener('error', () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);
      resolve({
        isValid: false,
        error: 'Tệp MP3 bị lỗi hoặc không thể phân tích dữ liệu âm thanh.'
      });
    });
  });
}

/**
 * Saves non-expired MP3 custom tracks into IndexedDB store
 */
export async function saveUploadedSong(file: File): Promise<PlayableSong> {
  const db = await openDatabase();
  const id = `user-mp3-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const title = `🎵 ${file.name}`;
  const uploadedAt = Date.now();

  const songData: StoredSong = {
    id,
    title,
    blob: file,
    uploadedAt
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(songData);

    request.onsuccess = () => {
      const url = URL.createObjectURL(file);
      activeObjectUrls.set(id, url);

      resolve({
        id,
        title,
        url,
        isYoutube: false,
        uploadedAt,
        expiresAt: uploadedAt + ONE_WEEK_MS
      });
    };

    request.onerror = () => {
      reject(new Error('Không thể lưu bài hát vào thiết bị của bạn.'));
    };
  });
}

/**
 * Clean up expired files (> 7 days) and load the rest of user uploaded custom songs
 */
export async function loadAndCleanUploadedSongs(): Promise<PlayableSong[]> {
  const db = await openDatabase();
  const now = Date.now();

  // First, fetch all stored entries
  const allEntries: StoredSong[] = await new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error('Truy vấn danh sách nhạc tải lên thất bại.'));
    };
  });

  const validSongs: StoredSong[] = [];
  const expiredIds: string[] = [];

  allEntries.forEach((entry) => {
    const age = now - entry.uploadedAt;
    if (age > ONE_WEEK_MS) {
      expiredIds.push(entry.id);
    } else {
      validSongs.push(entry);
    }
  });

  // Perform async deletions of expired copies of songs
  if (expiredIds.length > 0) {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    expiredIds.forEach((id) => {
      store.delete(id);
    });
  }

  // Generate dynamic runtime URLs for each valid song stored inside the database
  const playableSongs: PlayableSong[] = validSongs.map((song) => {
    let url = activeObjectUrls.get(song.id);
    if (!url) {
      url = URL.createObjectURL(song.blob);
      activeObjectUrls.set(song.id, url);
    }

    return {
      id: song.id,
      title: song.title,
      url: url,
      isYoutube: false,
      uploadedAt: song.uploadedAt,
      expiresAt: song.uploadedAt + ONE_WEEK_MS
    };
  });

  return playableSongs;
}

/**
 * Delete individual song from storage
 */
export async function deleteUploadedSong(id: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      const url = activeObjectUrls.get(id);
      if (url) {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // ignore
        }
        activeObjectUrls.delete(id);
      }
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Xóa bài hát thất bại.'));
    };
  });
}
