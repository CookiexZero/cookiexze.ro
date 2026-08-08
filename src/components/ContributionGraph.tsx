import { GITHUB_USER } from '../config';
import {
  useContributionWeeks,
  useGitHubContributions,
  type ContributionDay,
} from '../hooks/useGitHubContributions';

/** Square size and the gap between squares, in px — shared by the grid and the
 *  month labels so the two stay aligned. Sized so half a year of weeks still
 *  fits one desktop column without horizontal scrolling. */
const CELL = 11;
const GAP = 3;
const STRIDE = CELL + GAP;

/** Level 0-4 -> background, light-theme ramp. */
const LEVELS = [
  'bg-zinc-100',
  'bg-emerald-200',
  'bg-emerald-300',
  'bg-emerald-500',
  'bg-emerald-700',
];

const WEEKDAYS = ['Пн', '', 'Ср', '', 'Пт', '', ''];

const MONTHS = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

export function ContributionGraph({ months = 6 }: { months?: number }) {
  const { days, total, error, loading } = useGitHubContributions(
    GITHUB_USER,
    months,
  );
  const weeks = useContributionWeeks(days);

  if (loading) {
    return <div className="h-32 animate-pulse rounded-3xl bg-zinc-100" />;
  }

  // The graph is a bonus on top of the feed — stay silent if it can't load.
  if (error || weeks.length === 0) return null;

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-sm text-zinc-700">
          <span className="font-medium text-zinc-900">{total}</span>{' '}
          {plural(total, 'контрибуция', 'контрибуции', 'контрибуций')}
        </p>
        <p className="text-xs text-zinc-400">
          за {months} {plural(months, 'месяц', 'месяца', 'месяцев')}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div
          className="flex gap-2"
          role="img"
          aria-label={`График контрибуций GitHub за последние ${months} ${plural(months, 'месяц', 'месяца', 'месяцев')}: ${total} всего`}
        >
          <div className="flex flex-col text-[10px] leading-none text-zinc-400">
            {/* Spacer matching the month-label row above the grid. */}
            <div style={{ height: 16 }} />
            {WEEKDAYS.map((label, row) => (
              <div
                key={row}
                className="flex items-center"
                style={{ height: CELL, marginBottom: GAP }}
              >
                {label}
              </div>
            ))}
          </div>

          <div>
            <MonthLabels weeks={weeks} />
            <div className="flex" style={{ gap: GAP }}>
              {weeks.map((week, column) => (
                <div key={column} className="flex flex-col" style={{ gap: GAP }}>
                  {week.map((day, row) => (
                    <Cell key={row} day={day} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-zinc-400">
        меньше
        {LEVELS.map((background, level) => (
          <span
            key={level}
            className={`rounded-[3px] ${background}`}
            style={{ width: CELL - 2, height: CELL - 2 }}
          />
        ))}
        больше
      </div>
    </div>
  );
}

function Cell({ day }: { day: ContributionDay | null }) {
  if (!day) {
    return <span style={{ width: CELL, height: CELL }} />;
  }
  return (
    <span
      className={`rounded-[3px] ${LEVELS[day.level] ?? LEVELS[0]}`}
      style={{ width: CELL, height: CELL }}
      title={`${formatDate(day.date)}: ${day.count} ${plural(day.count, 'контрибуция', 'контрибуции', 'контрибуций')}`}
    />
  );
}

/** One label per column whose week opens a new month. */
function MonthLabels({ weeks }: { weeks: (ContributionDay | null)[][] }) {
  const labels: { column: number; text: string }[] = [];
  let previousMonth = -1;

  weeks.forEach((week, column) => {
    const first = week.find((day) => day !== null);
    if (!first) return;
    const month = new Date(`${first.date}T00:00:00`).getMonth();
    if (month !== previousMonth) {
      previousMonth = month;
      labels.push({ column, text: MONTHS[month]! });
    }
  });

  return (
    <div className="relative" style={{ height: 16 }}>
      {labels.map(({ column, text }) => (
        <span
          key={text + column}
          className="absolute top-0 text-[10px] leading-none text-zinc-400"
          style={{ left: column * STRIDE }}
        >
          {text}
        </span>
      ))}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
