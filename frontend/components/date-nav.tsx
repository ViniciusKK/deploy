'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateNavProps {
  availableDates: string[];
  selectedDate: string;
}

const PAD = (n: number) => String(n).padStart(2, '0');
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function DateNav({ availableDates, selectedDate }: DateNavProps) {
  const availableSet = new Set(availableDates);
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

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-[1440px] px-10 py-4">
      <div className="inline-flex flex-col gap-2 border border-border p-3">
        <div className="flex items-center justify-between gap-6">
          <button
            onClick={goToPrev}
            className="grid h-6 w-6 place-items-center rounded-full hover:bg-muted"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {monthLabel}
          </span>
          <button
            onClick={goToNext}
            className="grid h-6 w-6 place-items-center rounded-full hover:bg-muted"
          >
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map((d, i) => (
            <span
              key={i}
              className="flex h-6 w-6 items-center justify-center font-mono text-[9px] text-muted-foreground"
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
                  className="flex h-6 w-6 items-center justify-center rounded-sm font-mono text-[10px] text-foreground hover:bg-muted hover:underline"
                >
                  {day}
                </Link>
              );
            }
            return (
              <span
                key={day}
                className={`flex h-6 w-6 items-center justify-center rounded-sm font-mono text-[10px] ${isToday ? 'text-accent' : 'text-muted-foreground/40'}`}
              >
                {day}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
