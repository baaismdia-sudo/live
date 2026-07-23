import { useCallback, useEffect, useState } from "react";

export interface QueuedAction<T = Record<string, unknown>> {
  id: string;
  payload: T;
  createdAt: string;
}

/**
 * Minimal offline protection for the scorekeeper: actions taken while
 * offline (or while a write fails) are queued to localStorage per match and
 * auto-flushed the moment the browser reports `online` again, so a dropped
 * connection mid-match doesn't lose a goal/wicket/point.
 */
export function useOfflineQueue<T extends Record<string, unknown>>(
  matchId: string | undefined,
  flush: (action: T) => Promise<void>
) {
  const storageKey = `tournamentlive-offline-queue-${matchId}`;
  const [queue, setQueue] = useState<QueuedAction<T>[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (!matchId) return;
    const raw = window.localStorage.getItem(storageKey);
    if (raw) setQueue(JSON.parse(raw));
  }, [matchId, storageKey]);

  useEffect(() => {
    if (!matchId) return;
    window.localStorage.setItem(storageKey, JSON.stringify(queue));
  }, [queue, matchId, storageKey]);

  const enqueue = useCallback((payload: T) => {
    const action: QueuedAction<T> = { id: crypto.randomUUID(), payload, createdAt: new Date().toISOString() };
    setQueue((q) => [...q, action]);
    return action.id;
  }, []);

  const drain = useCallback(async () => {
    if (queue.length === 0) return;
    const remaining: QueuedAction<T>[] = [];
    for (const action of queue) {
      try {
        await flush(action.payload);
      } catch {
        remaining.push(action);
      }
    }
    setQueue(remaining);
  }, [queue, flush]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      drain();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drain]);

  return { queue, enqueue, drain, isOnline, pendingCount: queue.length };
}
