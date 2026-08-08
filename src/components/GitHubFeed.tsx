import { GITHUB_USER } from '../config';
import { useGitHubActivity, type GitHubEvent } from '../hooks/useGitHubActivity';

export function GitHubFeed() {
  const { events, error, loading } = useGitHubActivity(GITHUB_USER);

  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-2xl bg-zinc-100" />
        ))}
      </div>
    );
  }

  if (error || events.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-400">
        {error
          ? 'GitHub не отвечает'
          : 'Нет свежих публичных событий — GitHub хранит ленту только 90 дней'}
      </p>
    );
  }

  return (
    <ol className="space-y-1">
      {events.map((event) => (
        <li key={event.id}>
          <a
            href={`https://github.com/${event.repo.name}`}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-baseline gap-3 rounded-2xl px-3.5 py-2.5 transition hover:bg-white hover:shadow-sm"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-zinc-700">
                {describe(event)}
              </span>
              <span className="block truncate text-xs text-zinc-400">
                {event.repo.name}
              </span>
            </span>
            <time
              dateTime={event.created_at}
              className="shrink-0 text-xs text-zinc-400 tabular-nums"
            >
              {relativeTime(event.created_at)}
            </time>
          </a>
        </li>
      ))}
    </ol>
  );
}

function describe(event: GitHubEvent): string {
  const { payload } = event;
  switch (event.type) {
    case 'PushEvent': {
      const count = payload.commits?.length ?? 0;
      const branch = payload.ref?.replace('refs/heads/', '') ?? 'main';
      const subject = payload.commits?.at(-1)?.message.split('\n')[0];
      return subject
        ? `${subject} (${count} ${plural(count, 'коммит', 'коммита', 'коммитов')} в ${branch})`
        : `Запушил ${count} ${plural(count, 'коммит', 'коммита', 'коммитов')} в ${branch}`;
    }
    case 'CreateEvent':
      return payload.ref_type === 'repository'
        ? 'Создал репозиторий'
        : `Создал ${payload.ref_type} ${payload.ref ?? ''}`.trim();
    case 'WatchEvent':
      return 'Поставил звезду';
    case 'ForkEvent':
      return 'Форкнул репозиторий';
    case 'PullRequestEvent':
      return `${payload.action === 'closed' ? 'Закрыл' : 'Открыл'} PR #${payload.pull_request?.number}: ${payload.pull_request?.title ?? ''}`;
    case 'IssuesEvent':
      return `${payload.action === 'closed' ? 'Закрыл' : 'Открыл'} issue #${payload.issue?.number}: ${payload.issue?.title ?? ''}`;
    case 'ReleaseEvent':
      return 'Выпустил релиз';
    case 'PublicEvent':
      return 'Открыл исходники';
    default:
      return event.type;
  }
}

/** Russian needs three plural forms; pick by the usual 1 / 2-4 / rest rule. */
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return 'сейчас';
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ч`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} д`;
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}
