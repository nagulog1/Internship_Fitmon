import useAuthStore from '../store/useAuthStore';
import { PageHeader } from '../components/ui';
import { cx } from '../utils/format';

const threads = [
  { title: 'Workspace', meta: 'Active', active: true },
  { title: 'Session reviews', meta: 'Soon' },
  { title: 'Athlete notes', meta: 'Soon' },
];

const notes = [
  { title: 'Athlete overview', copy: 'Keep tabs on progress, patterns, and areas that need attention.' },
  { title: 'Report review', copy: 'Compare recent sessions and highlight the next focus areas.' },
  { title: 'Trusted space', copy: 'Keep coaching notes and guidance in one place.' },
];

export default function Mentor() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="animate-rise">
      <PageHeader label="Coach studio" title={`Hi, ${user?.name?.split(' ')[0] || 'coach'}.`} description="Review sessions, leave notes, and guide safer training." />

      <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside aria-label="Conversations">
          <p className="label mb-3 text-ink">Inbox</p>
          <ul className="border-t border-ink">
            {threads.map((thread) => (
              <li key={thread.title} className={cx('flex items-center justify-between border-b border-rule py-3 text-sm', thread.active ? 'font-semibold' : 'text-ink-2')}>
                <span className="flex items-center gap-2">
                  {thread.active ? <span className="size-1.5 bg-signal" /> : null}
                  {thread.title}
                </span>
                <span className="text-xs text-muted">{thread.meta}</span>
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex min-h-[420px] flex-col border-t-2 border-ink">
          <ol className="flex-1">
            {notes.map((note, i) => (
              <li key={note.title} className="flex gap-5 border-b border-rule py-5">
                <span className="figure text-3xl text-signal">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-semibold">{note.title}</h3>
                  <p className="mt-1 text-sm text-ink-2">{note.copy}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex gap-2">
            <label htmlFor="mentor-message" className="sr-only">Message</label>
            <input id="mentor-message" type="text" className="field" placeholder="Messaging is coming soon" readOnly aria-readonly="true" />
            <button type="button" className="btn btn-ink" disabled>Send</button>
          </div>
        </section>
      </div>
    </div>
  );
}
