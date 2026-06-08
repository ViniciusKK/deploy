import Link from 'next/link';
import { BiasDot } from './badges';
import { biasLabelPt } from './bias';
import type { FeedDispatch } from '@/lib/api';

export function DispatchesSection({ dispatches }: { dispatches: FeedDispatch[] }) {
  if (dispatches.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1440px] px-10">
      <div className="border-t border-foreground pt-6">
        <div className="flex items-baseline justify-between pb-6">
          <h2 className="font-display text-3xl font-bold tracking-tight">Últimos despachos</h2>
          <a
            href="#"
            className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            Ver todos →
          </a>
        </div>
        <div className="divide-y divide-border">
          {dispatches.slice(0, 6).map((d, i) => (
            <Link
              key={d.articleId}
              href={`/stories/${d.storyId}`}
              className="group flex gap-6 py-5"
            >
              <span className="w-7 shrink-0 font-mono text-2xl font-bold leading-none text-foreground/15 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <BiasDot label={d.biasLabel} />
                  <span className="font-medium">{d.publisherName}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{biasLabelPt(d.biasLabel)}</span>
                </div>
                <h3 className="font-display text-xl font-bold leading-snug group-hover:underline">
                  {d.title}
                </h3>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  História: {d.storyTitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
