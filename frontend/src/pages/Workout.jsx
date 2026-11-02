import { useMemo, useState } from 'react';
import { Play, Search, SearchX } from 'lucide-react';
import { EmptyState, PageHeader } from '../components/ui';
import { cx } from '../utils/format';

const workouts = [
  { id: 1, name: 'Push-Up Form Guide', muscle: 'Chest', difficulty: 'Beginner', ytId: 'IODxDxX7oi4' },
  { id: 2, name: 'Bench Press Technique', muscle: 'Chest', difficulty: 'Intermediate', ytId: 'rT7DgCr-3pg' },
  { id: 3, name: 'Pull-Up Tutorial', muscle: 'Back', difficulty: 'Intermediate', ytId: 'eGo4IYlbE5g' },
  { id: 4, name: 'Deadlift Form Guide', muscle: 'Back', difficulty: 'Advanced', ytId: 'op9kVnSso6Q' },
  { id: 5, name: 'Squat Technique', muscle: 'Legs', difficulty: 'Beginner', ytId: 'aclHkVaku9U' },
  { id: 6, name: 'Leg Press Guide', muscle: 'Legs', difficulty: 'Intermediate', ytId: 'IZxyjW7LOLM' },
  { id: 7, name: 'Shoulder Press Form', muscle: 'Shoulders', difficulty: 'Intermediate', ytId: 'qEwKCR5JCog' },
  { id: 8, name: 'Lateral Raise Tutorial', muscle: 'Shoulders', difficulty: 'Beginner', ytId: '3VcKaXpzqRo' },
  { id: 9, name: 'Bicep Curl Guide', muscle: 'Arms', difficulty: 'Beginner', ytId: 'ykJmrZ5v0Oo' },
  { id: 10, name: 'Tricep Dips Tutorial', muscle: 'Arms', difficulty: 'Intermediate', ytId: '0326dy_-CzM' },
  { id: 11, name: 'Plank Variations', muscle: 'Core', difficulty: 'Beginner', ytId: 'ASdvN_XEl_c' },
  { id: 12, name: 'Ab Workout Routine', muscle: 'Core', difficulty: 'Intermediate', ytId: 'DHD1-2P4ngg' },
];

const MUSCLES = ['All', ...new Set(workouts.map((w) => w.muscle))];

const difficultyBadge = {
  Beginner: 'badge-good',
  Intermediate: 'badge-warn',
  Advanced: 'badge-bad',
};

export default function Workout() {
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState('All');
  const [playing, setPlaying] = useState(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return workouts.filter((workout) => {
      const matchesMuscle = muscle === 'All' || workout.muscle === muscle;
      const matchesSearch = !term || workout.name.toLowerCase().includes(term) || workout.muscle.toLowerCase().includes(term);
      return matchesMuscle && matchesSearch;
    });
  }, [muscle, search]);

  return (
    <div className="animate-fade-up">
      <PageHeader eyebrow="Library" title="Workouts" description="Technique guides to sharpen your form before your next tracked session." />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="workout-search" className="sr-only">Search workouts</label>
          <input
            id="workout-search"
            className="input pl-10"
            placeholder="Search workouts or muscles"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0" aria-label="Muscle group">
          {MUSCLES.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={muscle === m}
              onClick={() => setMuscle(m)}
              className={cx(
                'h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium transition-colors',
                muscle === m ? 'border-fg bg-fg text-bg' : 'border-line-strong text-fg-2 hover:border-white/25 hover:text-fg'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((workout) => (
            <li key={workout.id} className="card group overflow-hidden transition-colors hover:border-line-strong">
              <div className="relative aspect-video bg-surface">
                {playing === workout.id ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${workout.ytId}?rel=0&autoplay=1`}
                    title={workout.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 size-full border-0"
                  />
                ) : (
                  <button type="button" onClick={() => setPlaying(workout.id)} className="absolute inset-0 size-full" aria-label={`Play ${workout.name}`}>
                    <img
                      src={`https://i.ytimg.com/vi/${workout.ytId}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }}
                      className="size-full object-cover opacity-80 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime text-lime-ink shadow-lg transition-transform group-hover:scale-110">
                      <Play className="ml-0.5 size-5 fill-current" />
                    </span>
                  </button>
                )}
              </div>
              <div className="p-4">
                <p className="font-medium">{workout.name}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="badge badge-neutral">{workout.muscle}</span>
                  <span className={cx('badge', difficultyBadge[workout.difficulty])}>{workout.difficulty}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No workouts found"
          description="Try a different search or muscle group."
          action={
            <button type="button" className="btn btn-ghost" onClick={() => { setSearch(''); setMuscle('All'); }}>
              Clear filters
            </button>
          }
        />
      )}
    </div>
  );
}
