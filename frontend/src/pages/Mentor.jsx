import { BarChart3, Send, ShieldCheck, Users } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { IconChip, PageHeader } from '../components/ui';
import { cx } from '../utils/format';

const threads = [
  { title: 'Workspace', meta: 'Active', active: true },
  { title: 'Session reviews', meta: 'Soon' },
  { title: 'Athlete notes', meta: 'Soon' },
];

const cards = [
  { icon: Users, tone: 'lime', title: 'Athlete overview', copy: 'Keep tabs on progress, patterns, and areas that need attention.' },
  { icon: BarChart3, tone: 'cyan', title: 'Report review', copy: 'Compare recent sessions and highlight the next focus areas.' },
  { icon: ShieldCheck, tone: 'violet', title: 'Trusted space', copy: 'A focused workspace to keep coaching notes and guidance in one place.' },
];

export default function Mentor() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="animate-fade-up">
      <PageHeader eyebrow="Coach studio" title={`Welcome, ${user?.name?.split(' ')[0] || 'coach'}`} description="Review sessions, share notes, and guide safer training." />

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="card p-3" aria-label="Conversations">
          <p className="eyebrow px-3 pt-2 pb-3">Inbox</p>
          <ul className="flex flex-col gap-1">
            {threads.map((thread) => (
              <li key={thread.title}>
                <div
                  className={cx(
                    'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm',
                    thread.active ? 'bg-white/[0.07] font-medium text-fg' : 'text-fg-2'
                  )}
                >
                  {thread.title}
                  <span className={cx('badge', thread.active ? 'badge-good' : 'badge-neutral')}>{thread.meta}</span>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <section className="card flex min-h-[460px] flex-col">
          <div className="flex-1 space-y-3 p-5">
            {cards.map((card) => (
              <div key={card.title} className="flex max-w-lg gap-4 rounded-2xl border border-line bg-white/[0.02] p-4">
                <IconChip icon={card.icon} tone={card.tone} />
                <div>
                  <h3 className="font-medium">{card.title}</h3>
                  <p className="mt-1 text-sm text-fg-2">{card.copy}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-line p-4">
            <label htmlFor="mentor-message" className="sr-only">Message</label>
            <input id="mentor-message" type="text" className="input" placeholder="Coach messaging coming soon" readOnly aria-readonly="true" />
            <button type="button" className="btn btn-primary" disabled aria-label="Send">
              <Send className="size-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
