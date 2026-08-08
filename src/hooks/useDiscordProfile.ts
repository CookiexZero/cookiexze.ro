import { useEffect, useState } from 'react';
import { fetchDiscordProfile, type DiscordProfile } from '../lib/discord';

/** How often to re-check the profile while the tab is open. */
const REFRESH_MS = 60_000;

type State = {
  profile: DiscordProfile | null;
  error: string | null;
  loading: boolean;
};

/**
 * Keeps the Discord identity (avatar, banner, name, bio) in sync.
 *
 * It re-fetches on an interval and whenever the tab regains focus, so changing
 * your avatar or banner in Discord is reflected here without a redeploy.
 */
export function useDiscordProfile(id: string): State {
  const [state, setState] = useState<State>({
    profile: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      try {
        const profile = await fetchDiscordProfile(id, controller.signal);
        if (!cancelled) setState({ profile, error: null, loading: false });
      } catch (error) {
        if (cancelled || controller.signal.aborted) return;
        setState((prev) => ({
          // Keep showing the last good profile if a refresh fails.
          profile: prev.profile,
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false,
        }));
      }
    };

    load();
    const timer = setInterval(load, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [id]);

  return state;
}
