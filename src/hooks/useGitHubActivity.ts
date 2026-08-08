import { useEffect, useState } from 'react';

export type GitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    // GitHub has trimmed the public push payload: `commits` and `size` are
    // often absent now, leaving only the ref and the resulting head sha.
    commits?: { message: string; sha: string }[];
    size?: number;
    head?: string;
    ref?: string;
    ref_type?: string;
    action?: string;
    pull_request?: { number: number; title: string; html_url: string };
    issue?: { number: number; title: string; html_url: string };
  };
};

type State = {
  events: GitHubEvent[];
  error: string | null;
  loading: boolean;
};

/**
 * Recent public GitHub activity.
 *
 * The events endpoint only keeps ~90 days of history, so a quiet account
 * returns an empty list — the contribution graph carries the section then.
 *
 * Unauthenticated requests are rate-limited to 60/hour per IP, which is plenty
 * for a personal page, so no token is involved and this stays a static site.
 */
export function useGitHubActivity(user: string, limit = 5): State {
  const [state, setState] = useState<State>({
    events: [],
    error: null,
    loading: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `https://api.github.com/users/${user}/events/public?per_page=30`,
          {
            signal: controller.signal,
            headers: { Accept: 'application/vnd.github+json' },
          },
        );
        if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
        const events = (await res.json()) as GitHubEvent[];
        setState({
          events: events.filter(isInteresting).slice(0, limit),
          error: null,
          loading: false,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          events: [],
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false,
        });
      }
    })();

    return () => controller.abort();
  }, [user, limit]);

  return state;
}

/** Event types the feed knows how to describe in words. */
const INTERESTING = new Set([
  'PushEvent',
  'CreateEvent',
  'WatchEvent',
  'ForkEvent',
  'PullRequestEvent',
  'IssuesEvent',
  'ReleaseEvent',
  'PublicEvent',
]);

const isInteresting = (event: GitHubEvent) => INTERESTING.has(event.type);
