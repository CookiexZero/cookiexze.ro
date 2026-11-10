const MAX_AGE_MS = 5 * 60_000;
const snapshots = new Map<string, { data: unknown; fetchedAt: number }>();
const pending = new Map<string, Promise<unknown>>();

/** Keep the last good public response available while a stale entry refreshes. */
export function readCachedJson<T>(url: string): T | undefined {
  return snapshots.get(url)?.data as T | undefined;
}

/** Share in-flight requests across mounts; failed requests remain retryable. */
export function fetchCachedJson<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const cached = snapshots.get(url);
  if (cached && Date.now() - cached.fetchedAt < MAX_AGE_MS) {
    return Promise.resolve(cached.data as T);
  }
  const existing = pending.get(url);
  if (existing) return existing as Promise<T>;

  const request = fetch(url, options)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const data: unknown = await response.json();
      snapshots.set(url, { data, fetchedAt: Date.now() });
      return data;
    })
    .finally(() => pending.delete(url));
  pending.set(url, request);
  return request as Promise<T>;
}
