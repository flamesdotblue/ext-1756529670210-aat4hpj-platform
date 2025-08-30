import { useEffect, useMemo, useRef, useState } from 'react';
import { Timer } from 'lucide-react';

export default function BreathingGuide() {
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [duration, setDuration] = useState(60);
  const [phase, setPhase] = useState('Inhale');

  const phases = useMemo(() => [
    { name: 'Inhale', seconds: 4 },
    { name: 'Hold', seconds: 4 },
    { name: 'Exhale', seconds: 4 },
  ], []);
  const phaseIdxRef = useRef(0);
  const phaseTimeRef = useRef(phases[0].seconds);

  useEffect(() => {
    let id;
    if (running) {
      id = setInterval(() => {
        setSecondsLeft(prev => Math.max(0, prev - 1));
        phaseTimeRef.current -= 1;
        if (phaseTimeRef.current <= 0) {
          phaseIdxRef.current = (phaseIdxRef.current + 1) % phases.length;
          const next = phases[phaseIdxRef.current];
          phaseTimeRef.current = next.seconds;
          setPhase(next.name);
        }
      }, 1000);
    }
    return () => clearInterval(id);
  }, [running, phases]);

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  const start = () => {
    setSecondsLeft(duration);
    setPhase('Inhale');
    phaseIdxRef.current = 0;
    phaseTimeRef.current = phases[0].seconds;
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const resume = () => setRunning(true);
  const reset = () => {
    setRunning(false);
    setSecondsLeft(duration);
    setPhase('Inhale');
    phaseIdxRef.current = 0;
    phaseTimeRef.current = phases[0].seconds;
  };

  const progress = ((duration - secondsLeft) / duration) * 100;
  const circleScale = phase === 'Inhale' ? 1.1 : phase === 'Hold' ? 1.0 : 0.9;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="h-5 w-5 text-teal-600" />
        <h2 className="font-semibold">Breathing</h2>
      </div>

      <div className="aspect-square w-full max-w-sm mx-auto">
        <div className="relative h-full w-full flex items-center justify-center">
          <div
            className="h-56 w-56 sm:h-64 sm:w-64 rounded-full bg-gradient-to-br from-teal-400/90 to-emerald-500/90 backdrop-blur shadow-lg transition-transform duration-1000"
            style={{ transform: `scale(${circleScale})` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-slate-600 dark:text-slate-400">Phase</div>
              <div className="text-2xl font-semibold tracking-tight">{phase}</div>
              <div className="mt-2 text-xs text-slate-500">{secondsLeft}s left</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <select
            value={duration}
            onChange={e => {
              const v = Number(e.target.value);
              setDuration(v);
              setSecondsLeft(v);
            }}
            className="col-span-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 px-3 py-2 text-sm"
          >
            <option value={60}>1 minute</option>
            <option value={120}>2 minutes</option>
            <option value={180}>3 minutes</option>
          </select>
          {!running && secondsLeft === duration && (
            <button onClick={start} className="col-span-2 rounded-lg bg-teal-600 text-white px-3 py-2 text-sm hover:bg-teal-700">Start</button>
          )}
          {running && (
            <button onClick={pause} className="col-span-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">Pause</button>
          )}
          {!running && secondsLeft !== duration && secondsLeft > 0 && (
            <button onClick={resume} className="col-span-1 rounded-lg bg-teal-600 text-white px-3 py-2 text-sm hover:bg-teal-700">Resume</button>
          )}
          {!running && secondsLeft !== duration && (
            <button onClick={reset} className="col-span-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">Reset</button>
          )}
          {!running && secondsLeft === 0 && (
            <button onClick={reset} className="col-span-2 rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700">Restart</button>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-600 dark:text-slate-400">
        Tip: Breathe in through the nose, out through the mouth. Keep shoulders relaxed and attention on sensations of the breath.
      </p>
    </div>
  );
}
