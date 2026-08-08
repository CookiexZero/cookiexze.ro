import { useEffect, useMemo, useState } from 'react';

export type ContributionDay = {
  date: string;
  count: number;
  /** 0-4, as GitHub buckets them. */
  level: number;
};

type State = {
  days: ContributionDay[];
  total: number;
  error: string | null;
  loading: boolean;
};

/**
 * Daily contribution counts for the last `months` months.
 *
 * GitHub only exposes the contribution graph through the authenticated GraphQL
 * API, so this goes through a public mirror that scrapes the profile page. That
 * has a useful side effect: it includes private-repo contributions whenever the
 * profile is set to show them, which the public events feed never does.
 */
export function useGitHubContributions(user: string, months = 3): State {
  const [state, setState] = useState<State>({
    days: [],
    total: 0,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${user}?y=last`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`Contributions API returned ${res.status}`);
        const body = (await res.json()) as { contributions: ContributionDay[] };

        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - months);
        const from = toISODate(cutoff);

        const days = body.contributions.filter((day) => day.date >= from);
        setState({
          days,
          total: days.reduce((sum, day) => sum + day.count, 0),
          error: null,
          loading: false,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          days: [],
          total: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false,
        });
      }
    })();

    return () => controller.abort();
  }, [user, months]);

  return state;
}

/**
 * Lays the days out the way GitHub does: one column per week, one row per
 * weekday. Weeks start on Monday, so the first column is padded with nulls
 * until its real first day lands on the right row.
 */
export function groupIntoWeeks(
  days: ContributionDay[],
): (ContributionDay | null)[][] {
  if (days.length === 0) return [];

  const cells: (ContributionDay | null)[] = [
    ...Array<null>(mondayIndex(days[0]!.date)).fill(null),
    ...days,
  ];

  const weeks: (ContributionDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const week = cells.slice(i, i + 7);
    // Pad the trailing week so every column renders the same height.
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

export function useContributionWeeks(
  days: ContributionDay[],
): (ContributionDay | null)[][] {
  return useMemo(() => groupIntoWeeks(days), [days]);
}

/** Monday = 0 … Sunday = 6, rather than JS's Sunday-first numbering. */
function mondayIndex(iso: string): number {
  return (new Date(`${iso}T00:00:00`).getDay() + 6) % 7;
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
