'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateNavProps {
  availableDates: string[];
  selectedDate: string;
}

const PAD = (n: number) => String(n).padStart(2, '0');
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function relativeLabel(dateStr: string, today: string): string {
  const diff = Math.round(
    (new Date(today + 'T00:00:00Z').getTime() - new Date(dateStr + 'T00:00:00Z').getTime()) /
      86400000,
  );
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff <= 6) return `${diff} dias atrás`;
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

export function DateNav({ availableDates, selectedDate }: DateNavProps) {
  const [open, setOpen] = useState(false);
  const availableSet = new Set(availableDates);
  const today = new Date().toISOString().slice(0, 10);

  const [selYear, selMonth] = selectedDate.split('-').map(Number);
  const [viewYear, setViewYear] = useState(selYear);
  const [viewMonth, setViewMonth] = useState(selMonth);

  const goToPrev = () => {
    if (viewMonth === 1) { setViewYear((y) => y - 1); setViewMonth(12); }
    else setViewMonth((m) => m - 1);
  };
  const goToNext = () => {
    if (viewMonth === 12) { setViewYear((y) => y + 1); setViewMonth(1); }
    else setViewMonth((m) => m + 1);
  };

  const firstDay = new Date(Date.UTC(viewYear, viewMonth - 1, 1));
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth, 0)).getUTCDate();
  const startOffset = firstDay.getUTCDay();
  const monthLabel = firstDay.toLocaleDateString('pt-BR', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  });

  // Shortcuts: available dates excluding today, up to 5 most recent
  const shortcuts = availableDates.filter((d) => d !== today).slice(0, 5);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="grid h-4 w-4 place-items-center text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        aria-label="Navegar por data"
      >
        <Calendar size={12} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 backdrop-blur-sm pt-32"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-72 border border-border bg-background p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-foreground">
                Edições anteriores
              </span>
              <button
                onClick={() => setOpen(false)}
                className="grid h-5 w-5 place-items-center text-muted-foreground hover:text-foreground"
              >
                <X size={13} />
              </button>
            </div>

            {shortcuts.length > 0 && (
              <div className="mb-4 flex flex-col gap-1">
                {shortcuts.map((d) => (
                  <Link
                    key={d}
                    href={`/?date=${d}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-sm px-2 py-1.5 font-mono text-[11px] hover:bg-muted ${
                      d === selectedDate ? 'bg-foreground text-background' : 'text-foreground'
                    }`}
                  >
                    <span>{relativeLabel(d, today)}</span>
                    <span className="text-muted-foreground">
                      {d.split('-').slice(1).reverse().join('/')}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-4">
              <div className="mb-2 flex items-center justify-between">
                <button
                  onClick={goToPrev}
                  className="grid h-5 w-5 place-items-center text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {monthLabel}
                </span>
                <button
                  onClick={goToNext}
                  className="grid h-5 w-5 place-items-center text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {WEEKDAYS.map((d, i) => (
                  <span
                    key={i}
                    className="flex h-6 w-6 items-center justify-center font-mono text-[9px] text-muted-foreground/50"
                  >
                    {d}
                  </span>
                ))}
                {Array.from({ length: startOffset }).map((_, i) => (
                  <span key={`e-${i}`} className="h-6 w-6" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${viewYear}-${PAD(viewMonth)}-${PAD(day)}`;
                  const isSelected = dateStr === selectedDate;
                  const isAvailable = availableSet.has(dateStr);
                  const isToday = dateStr === today;

                  if (isSelected) {
                    return (
                      <span
                        key={day}
                        className="flex h-6 w-6 items-center justify-center rounded-sm bg-foreground font-mono text-[10px] font-bold text-background"
                      >
                        {day}
                      </span>
                    );
                  }
                  if (isAvailable) {
                    return (
                      <Link
                        key={day}
                        href={`/?date=${dateStr}`}
                        onClick={() => setOpen(false)}
                        className="flex h-6 w-6 items-center justify-center rounded-sm font-mono text-[10px] text-foreground hover:bg-muted hover:underline"
                      >
                        {day}
                      </Link>
                    );
                  }
                  return (
                    <span
                      key={day}
                      className={`flex h-6 w-6 items-center justify-center font-mono text-[10px] ${
                        isToday ? 'text-accent' : 'text-muted-foreground/30'
                      }`}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
