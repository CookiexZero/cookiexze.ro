import { GITHUB_USER } from "../config";
import {
  useContributionWeeks,
  useGitHubContributions,
  type ContributionDay,
} from "../hooks/useGitHubContributions";

/** Square size and the gap between squares, in px — shared by the grid and the
 *  month labels so the two stay aligned. Sized so half a year of weeks still
 *  fits one desktop column without horizontal scrolling. */
const CELL = 11;
const GAP = 3;
const STRIDE = CELL + GAP;

/** Activity intensity follows the page's blue-to-cyan palette. */
const LEVELS = [
  "contribution-level-0",
  "contribution-level-1",
  "contribution-level-2",
  "contribution-level-3",
  "contribution-level-4",
];

const WEEKDAYS = ["Пн", "", "Ср", "", "Пт", "", ""];

const MONTHS = [
  "янв",
  "фев",
  "мар",
  "апр",
  "май",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

export function ContributionGraph({ months = 6 }: { months?: number }) {
  const { days, total, error, loading } = useGitHubContributions(
    GITHUB_USER,
    months,
  );
  const weeks = useContributionWeeks(days);

  if (loading) {
    return (
      <div className="data-loading contribution-graph" role="status">
        Загружаю контрибуции…
      </div>
    );
  }

  if (error || weeks.length === 0)
    return (
      <p className="data-message contribution-graph">
        {error
          ? "График контрибуций временно недоступен."
          : "За этот период пока нет контрибуций."}
      </p>
    );

  return (
    <div className="contribution-graph">
      <div className="contribution-summary">
        <p>
          <strong>{total}</strong>{" "}
          {plural(total, "контрибуция", "контрибуции", "контрибуций")}
        </p>
        <p className="contribution-period">
          за {months} {plural(months, "месяц", "месяца", "месяцев")}
        </p>
      </div>

      {/* Half a year of weeks is wider than a phone; it scrolls here rather
          than widening the page. */}
      <div
        className="contribution-scroll"
        tabIndex={0}
        role="region"
        aria-label="Прокручиваемый график контрибуций GitHub"
      >
        <div
          className="flex gap-2"
          role="img"
          aria-label={`График контрибуций GitHub за последние ${months} ${plural(months, "месяц", "месяца", "месяцев")}: ${total} всего`}
        >
          <div className="graph-label flex flex-col">
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
                <div
                  key={column}
                  className="flex flex-col"
                  style={{ gap: GAP }}
                >
                  {week.map((day, row) => (
                    <Cell key={row} day={day} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="contribution-legend">
        меньше
        {LEVELS.map((background, level) => (
          <span
            key={level}
            className={background}
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
      className={LEVELS[day.level] ?? LEVELS[0]}
      style={{ width: CELL, height: CELL }}
      title={`${formatDate(day.date)}: ${day.count} ${plural(day.count, "контрибуция", "контрибуции", "контрибуций")}`}
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
          className="graph-label absolute top-0"
          style={{ left: column * STRIDE }}
        >
          {text}
        </span>
      ))}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
