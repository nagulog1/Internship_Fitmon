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
      <PageHeader kicker="Library" title="Workouts" description="Short technique videos. Watch one before a set, then let FitMon check your form." />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-full bg-surface p-1 md:inline-flex" aria-label="Muscle group">
          {MUSCLES.map((m) => (
            <button key={m} type="button" aria-pressed={muscle === m} onClick={() => setMuscle(m)} className="seg">
              {m}
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="workout-search" className="sr-only">Search workouts</label>
          <input id="workout-search" className="field h-11 pl-7" placeholder="Search workouts" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </div>

      {filtered.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((workout) => (
            <li key={workout.id} className="group card overflow-hidden">
              <div className="relative isolate aspect-[4/3] bg-panel">
                {playing === workout.id ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${workout.ytId}?rel=0&autoplay=1`}
                    title={workout.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 size-full border-0"
                  />
                ) : (
                  <button type="button" onClick={() => setPlaying(workout.id)} className="absolute inset-0 size-full text-left text-white" aria-label={`Play ${workout.name}`}>
                    <img
                      src={`https://i.ytimg.com/vi/${workout.ytId}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }}
                      className="absolute inset-0 -z-20 size-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="photo-scrim absolute inset-0 -z-10" aria-hidden />
                    <span className="absolute top-5 left-5 text-sm text-white/85">{workout.muscle}</span>
                    <span className="absolute top-5 right-5 flex items-center gap-1 text-sm text-white/85">
                      <Play className="size-3 fill-current" /> Play
                    </span>
                    <span className="headline absolute right-5 bottom-5 left-5 text-[34px]">{workout.name}</span>
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                {playing === workout.id ? (
                  <a href={`https://www.youtube.com/watch?v=${workout.ytId}`} target="_blank" rel="noreferrer" className="text-sm text-ink-2 underline underline-offset-2 hover:text-ink">
                    Watch on YouTube
                  </a>
                ) : (
                  <span className="text-sm text-ink-2">{workout.muscle}</span>
                )}
                <span className={cx('tag', difficultyTag[workout.difficulty])}>{workout.difficulty}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No matches"
          description="Try a different search or muscle group."
          action={<button type="button" className="btn btn-outline" onClick={() => { setSearch(''); setMuscle('All'); }}>Clear filters</button>}
        />
      )}
    </div>
  );
}
