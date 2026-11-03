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
      <PageHeader kicker="Coach studio" title={`Hi, ${user?.name?.split(' ')[0] || 'coach'}`} description="Review sessions, leave notes, and guide safer training." />

      <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="card p-3" aria-label="Conversations">
          <p className="px-3 pt-3 pb-2 text-sm text-ink-2">Inbox</p>
          <ul className="flex flex-col gap-1">
            {threads.map((thread) => (
              <li key={thread.title} className={cx('flex items-center justify-between rounded-full px-4 py-2.5 text-sm', thread.active ? 'bg-ink text-on-ink' : 'text-ink-2')}>
                {thread.title}
                <span className={cx('text-xs', thread.active ? 'text-volt' : 'text-muted')}>{thread.meta}</span>
              </li>
            ))}
          </ul>
        </aside>

        <section className="card flex min-h-[440px] flex-col p-6 sm:p-8">
          <ol className="grid flex-1 gap-3 md:grid-cols-3">
            {notes.map((note, i) => (
              <li key={note.title} className="flex flex-col justify-between rounded-[4px] bg-canvas p-6">
                <span className="stat text-5xl text-ink/15">0{i + 1}</span>
                <div className="mt-10">
                  <h3 className="font-medium">{note.title}</h3>
                  <p className="mt-1 text-sm text-ink-2">{note.copy}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex items-end gap-3">
            <label htmlFor="mentor-message" className="sr-only">Message</label>
            <input id="mentor-message" type="text" className="field" placeholder="Messaging is coming soon" readOnly aria-readonly="true" />
            <button type="button" className="btn btn-dark" disabled>Send</button>
          </div>
        </section>
      </div>
    </div>
  );
}
