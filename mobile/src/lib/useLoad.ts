import { useCallback, useEffect, useRef, useState } from "react";

/** Load data for a screen, with pull-to-refresh and retry. `key` identifies what is being loaded. */
export function useLoad<T>(load: () => Promise<T>, key: string) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  // State is only set once the request settles, never synchronously inside the effect.
  const fetchNow = useCallback(async () => {
    try {
      setData(await loadRef.current());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchNow();
  }, [key, fetchNow]);

  return {
    data, error, loading, refreshing,
    refresh: () => { setRefreshing(true); void fetchNow(); },
    retry: () => { setLoading(true); void fetchNow(); },
  };
}
