import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

function todayKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function Journal() {
  const [entries, setEntries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mindful.journal')) || [];
    } catch {
      return [];
    }
  });
  const [gratitude, setGratitude] = useState('');
  const [intention, setIntention] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    localStorage.setItem('mindful.journal', JSON.stringify(entries));
  }, [entries]);

  const saveEntry = e => {
    e.preventDefault();
    if (!gratitude && !intention && !notice) return;
    const entry = {
      id: `${Date.now()}`,
      date: todayKey(),
      gratitude: gratitude.trim(),
      intention: intention.trim(),
      notice: notice.trim(),
    };
    setEntries([entry, ...entries].slice(0, 50));
    setGratitude('');
    setIntention('');
    setNotice('');
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm p-5">
      <h2 className="font-semibold mb-4">Mini Journal</h2>
      <form onSubmit={saveEntry} className="grid grid-cols-1 gap-3">
        <input
          value={gratitude}
          onChange={e => setGratitude(e.target.value)}
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 px-3 py-2 text-sm"
          placeholder="I am grateful for..."
          aria-label="Gratitude"
        />
        <input
          value={intention}
          onChange={e => setIntention(e.target.value)}
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 px-3 py-2 text-sm"
          placeholder="Today I intend to..."
          aria-label="Intention"
        />
        <textarea
          value={notice}
          onChange={e => setNotice(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 px-3 py-2 text-sm"
          placeholder="One thing I noticed in my body/mind..."
          aria-label="Noticing"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700 w-fit"
        >
          <Plus className="h-4 w-4" /> Save entry
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Recent entries</h3>
        <ul className="space-y-3">
          {entries.length === 0 && (
            <li className="text-sm text-slate-500 dark:text-slate-400">No entries yet.</li>
          )}
          {entries.slice(0, 5).map(e => (
            <li key={e.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white/60 dark:bg-slate-900/40">
              <div className="text-xs text-slate-500">{e.date}</div>
              {e.gratitude && <div className="text-sm"><span className="font-medium">Gratitude:</span> {e.gratitude}</div>}
              {e.intention && <div className="text-sm"><span className="font-medium">Intention:</span> {e.intention}</div>}
              {e.notice && <div className="text-sm"><span className="font-medium">Noticed:</span> {e.notice}</div>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
