import { useEffect } from 'react';
import Header from './components/Header';
import HabitList from './components/HabitList';
import BreathingGuide from './components/BreathingGuide';
import Journal from './components/Journal';

function App() {
  // Apply theme from localStorage on initial load for no-flash
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <HabitList />
            <Journal />
          </section>
          <aside className="lg:col-span-1">
            <BreathingGuide />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
