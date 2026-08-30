import { useEffect, useRef, useCallback } from 'react';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import { classroomApi } from '../api';

export interface UseVideoProgressTrackerProps {
  lessonId: string | undefined;
  durationSeconds?: number;
  onAutoCompleted?: () => void;
}

interface PendingCompensation {
  lessonId: string;
  currentSecond: number;
  lastSyncedSecond: number;
  activityDate: string;
  timezone: string;
  timestamp: number;
}

export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh';
  } catch {
    return 'Asia/Ho_Chi_Minh';
  }
}

export function getTodayDateString(timeZone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function useVideoProgressTracker({
  lessonId,
  durationSeconds,
  onAutoCompleted,
}: UseVideoProgressTrackerProps) {
  const userTimezone = getUserTimezone();
  const lastSyncedSecRef = useRef<number>(0);
  const currentSecRef = useRef<number>(0);
  const lastSyncTimeRef = useRef<number>(0);
  const isSyncingRef = useRef<boolean>(false);

  const getStorageKey = useCallback((id: string) => `mindhub_video_pending_compensation_${id}`, []);

  // 1. On Mount or Lesson Change: Check & Compensate Pending Data
  useEffect(() => {
    if (!lessonId) return;
    const numericLessonId = parseInt(String(lessonId).replace(/\D/g, ''), 10);
    if (isNaN(numericLessonId) || numericLessonId <= 0) return;

    lastSyncedSecRef.current = 0;
    currentSecRef.current = 0;
    lastSyncTimeRef.current = Date.now();

    const storageKey = getStorageKey(String(numericLessonId));
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const pending: PendingCompensation = JSON.parse(saved);
        const today = getTodayDateString(userTimezone);
        const timeDiffMs = Date.now() - (pending.timestamp || 0);
        const isWithin24Hours = timeDiffMs <= 24 * 60 * 60 * 1000;
        const diffSeconds = pending.currentSecond - (pending.lastSyncedSecond || 0);

        // Valid compensation condition: diff between 1 and 30 seconds & within 24 hours
        if (diffSeconds > 0 && diffSeconds <= 30 && (pending.activityDate === today || isWithin24Hours)) {
          classroomApi
            .saveVideoPlaybackRatio(
              String(numericLessonId),
              pending.currentSecond,
              durationSeconds,
              false,
              pending.activityDate,
              pending.timezone || userTimezone
            )
            .then(() => {
              lastSyncedSecRef.current = pending.currentSecond;
              currentSecRef.current = pending.currentSecond;
              localStorage.removeItem(storageKey);
            })
            .catch(() => {
              // Retain in storage if network failed
            });
        } else {
          // Outdated or invalid, discard to preserve streak accuracy
          localStorage.removeItem(storageKey);
        }
      } catch (e) {
        localStorage.removeItem(storageKey);
      }
    }
  }, [lessonId, durationSeconds, userTimezone, getStorageKey]);

  // 2. Perform safe sync with Backend & update Local Storage
  const syncProgressToServer = useCallback(
    async (targetSec: number, forceDate?: string) => {
      if (!lessonId || isSyncingRef.current) return;
      const numericLessonId = parseInt(String(lessonId).replace(/\D/g, ''), 10);
      if (isNaN(numericLessonId) || numericLessonId <= 0) return;

      isSyncingRef.current = true;
      const today = forceDate || getTodayDateString(userTimezone);

      try {
        await classroomApi.saveVideoPlaybackRatio(
          String(numericLessonId),
          targetSec,
          durationSeconds,
          false,
          today,
          userTimezone
        );

        lastSyncedSecRef.current = targetSec;
        lastSyncTimeRef.current = Date.now();

        // Clear or refresh compensation buffer on success
        const storageKey = getStorageKey(String(numericLessonId));
        localStorage.removeItem(storageKey);
      } catch (err) {
        // In case of error, update compensation buffer
        const storageKey = getStorageKey(String(numericLessonId));
        const compensationData: PendingCompensation = {
          lessonId: String(numericLessonId),
          currentSecond: targetSec,
          lastSyncedSecond: lastSyncedSecRef.current,
          activityDate: today,
          timezone: userTimezone,
          timestamp: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(compensationData));
      } finally {
        isSyncingRef.current = false;
      }
    },
    [lessonId, durationSeconds, userTimezone, getStorageKey]
  );

  // 3. Callback on video time update (called frequently by player)
  const trackTimeUpdate = useCallback(
    (currentTimeSeconds: number) => {
      const current = Math.floor(currentTimeSeconds);
      currentSecRef.current = current;

      if (!lessonId) return;
      const numericLessonId = parseInt(String(lessonId).replace(/\D/g, ''), 10);
      if (isNaN(numericLessonId) || numericLessonId <= 0) return;

      // Update compensation buffer locally every tick
      const today = getTodayDateString(userTimezone);
      const storageKey = getStorageKey(String(numericLessonId));
      const compensationData: PendingCompensation = {
        lessonId: String(numericLessonId),
        currentSecond: current,
        lastSyncedSecond: lastSyncedSecRef.current,
        activityDate: today,
        timezone: userTimezone,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(compensationData));

      // Throttle: Sync every 6 seconds of playback progress
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncTimeRef.current;
      const progressDiff = current - lastSyncedSecRef.current;

      if (progressDiff >= 6 && timeSinceLastSync >= 5000) {
        syncProgressToServer(current);
      }
    },
    [lessonId, userTimezone, getStorageKey, syncProgressToServer]
  );

  // 4. Force sync on pause or unload
  const trackPauseOrSeek = useCallback(() => {
    if (currentSecRef.current !== lastSyncedSecRef.current) {
      syncProgressToServer(currentSecRef.current);
    }
  }, [syncProgressToServer]);

  return {
    trackTimeUpdate,
    trackPauseOrSeek,
    userTimezone,
  };
}
