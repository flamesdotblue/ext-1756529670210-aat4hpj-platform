import { useEffect, useMemo, useState } from 'react';
import { Plus, Check, Activity, Calendar, Trash2 } from 'lucide-react';

function todayKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

const DEFAULT_HABITS = [
  { id: 'breathe-1m', title: '1-minute mindful breathing', perDay: 1 },
  { id: 'checkin-3', title: '3 mindful check-ins', perDay: 3 },
  { id: 'gratitude-1', title: 'Write one gratitude', perDay: 1 },
];

function loadHabits() {
  const raw = localStorage.getItem('mindful.habits');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (_) {
      // fallthrough to defaults
    }
  }
  return DEFAULT_HABITS.map(h => ({ ...h, completed: {} }));
}

function saveHabits(habits) {
  localStorage.setItem('mindful.habits', JSON.stringify(habits));
}

function computeStreak(habit) {
  // Count consecutive days back from today where completed >= perDay
  const perDay = habit.perDay || 1;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 3650; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = todayKey(d);
    const count = habit.completed?.[key] || 0;
    if (count >= perDay) streak += 1;
    else break;
  }
  return streak;
}

export default function HabitList() {
  const [habits, setHabits] = useState(loadHabits());
  const [title, setTitle] = useState('');
  const [perDay, setPerDay] = useState(1);

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  const withStreaks = useMemo(
    () => habits.map(h => ({ ...h, streak: computeStreak(h) })),
    [habits]
  );

  const addHabit = e => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    const newHabit = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: t,
      perDay: Math.max(1, Math.min(10, Number(perDay) || 1)),
      completed: {},
    };
    setHabits([newHabit, ...habits]);
    setTitle('');
    setPerDay(1);
  };

  const incrementToday = (id, delta = 1) => {
    const key = todayKey();
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== id) return h;
        const curr = h.completed?.[key] || 0;
        const next = Math.max(0, curr + delta);
        return { ...h, completed: { ...(h.completed || {}), [key]: next } };
      })
    );
  };

  const removeHabit = id => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold">Daily Micro Habits</h2>
        </div>
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1">
          <Calendar className="h-4 w-4" />
          <span>{todayKey()}</span>
        </div>
      </div>

      <div className="p-5">
        <form onSubmit={addHabit} className="grid grid-cols-1 sm:grid-cols-6 gap-3 mb-5">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="sm:col-span-4 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Add a tiny habit (e.g., 1 mindful sip)"
            aria-label="New habit name"
          />
          <input
            value={perDay}
            onChange={e => setPerDay(e.target.value)}
            type="number"
            min={1}
            max={10}
            className="sm:col-span-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 px-3 py-2 text-sm"
            aria-label="Times per day"
          />
          <button
            type="submit"
            className="sm:col-span-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>

        <ul className="space-y-4">
          {withStreaks.map(habit => (
            <li key={habit.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white/60 dark:bg-slate-900/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium leading-tight pr-3">{habit.title}</h3>
                    <button
                      onClick={() => removeHabit(habit.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-500/10"
                      aria-label="Remove habit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <span>Target: {habit.perDay}/day</span>
                    <span>•</span>
                    <span>Streak: {habit.streak} day{habit.streak === 1 ? '' : 's'}</span>
                  </div>

                  <ProgressRow habit={habit} onIncrement={incrementToday} />
                </div>
              </div>
            </li>
          ))}
          {withStreaks.length === 0 && (
            <li className="text-sm text-slate-500 dark:text-slate-400">No habits yet. Add your first tiny habit above.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function ProgressRow({ habit, onIncrement }) {
  const key = todayKey();
  const count = habit.completed?.[key] || 0;
  const percent = Math.min(100, Math.round((count / habit.perDay) * 100));

  return (
    <div className="mt-4">
      <div className="h-2 rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onIncrement(habit.id, 1)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs hover:bg-emerald-700 shadow-sm"
        >
          <Check className="h-4 w-4" /> Mark one
        </button>
        <button
          onClick={() => onIncrement(habit.id, -1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          −1
        </button>
        <span className="text-xs text-slate-600 dark:text-slate-400 ml-auto">
          Today: {count} / {habit.perDay}
        </span>
      </div>
    </div>
  );
}
