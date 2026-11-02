import { useMemo, useState } from 'react';
import { Play, Search } from 'lucide-react';
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

const difficultyTag = {
  Beginner: 'tag-good',
  Intermediate: 'tag-warn',
  Advanced: 'tag-bad',
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
    <div className="animate-rise">
      <PageHeader
        label="Library"
        title="Workouts"
        description="Short technique videos. Watch one before a set, then let FitMon check your form."
      />

      <div className="mb-8 flex flex-col-reverse gap-4 border-b border-rule md:flex-row md:items-end md:justify-between">
        <div className="flex gap-6 overflow-x-auto" aria-label="Muscle group">
          {MUSCLES.map((m) => (
            <button key={m} type="button" aria-pressed={muscle === m} onClick={() => setMuscle(m)} className="tab">
              {m}
            </button>
          ))}
        </div>
        <div className="relative md:mb-2 md:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="workout-search" className="sr-only">Search workouts</label>
          <input id="workout-search" className="field h-10 pl-9 text-sm" placeholder="Search" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </div>

      {filtered.length ? (
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((workout, index) => (
            <li key={workout.id} className="group">
              <div className="relative aspect-video overflow-hidden bg-ink">
                {playing === workout.id ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${workout.ytId}?rel=0&autoplay=1`}
                    title={workout.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 size-full border-0"
                  />
                ) : (
                  <button type="button" onClick={() => setPlaying(workout.id)} className="absolute inset-0 size-full text-left" aria-label={`Play ${workout.name}`}>
                    <img
                      src={`https://i.ytimg.com/vi/${workout.ytId}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }}
                      className="size-full object-cover grayscale transition duration-300 group-hover:grayscale-0"
                    />
                    <span className="figure absolute top-3 left-4 text-2xl text-paper drop-shadow">{String(index + 1).padStart(2, '0')}</span>
                    <span className="absolute right-0 bottom-0 grid size-12 place-items-center bg-signal text-ink transition-colors group-hover:bg-paper">
                      <Play className="size-4 fill-current" />
                    </span>
                  </button>
                )}
              </div>
              <div className="mt-3 flex items-start justify-between gap-3 border-b border-rule pb-3">
                <div>
                  <p className="text-[17px] font-semibold">{workout.name}</p>
                  <p className="mt-0.5 text-sm text-muted">{workout.muscle}</p>
                </div>
                <span className={cx('tag mt-1', difficultyTag[workout.difficulty])}>{workout.difficulty}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No matches"
          description="Try a different search or muscle group."
          action={<button type="button" className="btn btn-line" onClick={() => { setSearch(''); setMuscle('All'); }}>Clear filters</button>}
        />
      )}
    </div>
  );
}
