import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { BiasDot, BlindspotBadge, CategoryTag } from './badges';
import { BIAS_ORDER } from './bias';
import type { FeedStory } from '@/lib/api';

function BiasBar({ distribution }: { distribution: Record<string, number> }) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-pill bg-card-muted">
      {BIAS_ORDER.map((label) => {
        const count = distribution[label] ?? 0;
        if (count === 0) return null;
        const pct = (count / total) * 100;
        const color =
          {
            LEFT: 'bg-bias-left',
            LEAN_LEFT: 'bg-bias-lean-left',
            CENTER: 'bg-bias-center',
            LEAN_RIGHT: 'bg-bias-lean-right',
            RIGHT: 'bg-bias-right',
          }[label] ?? 'bg-subtle-foreground';
        return <div key={label} className={color} style={{ width: `${pct}%` }} />;
      })}
    </div>
  );
}

export function StoryCard({ story, category = 'política' }: { story: FeedStory; category?: string }) {
  const previewSources = story.sources.slice(0, 3);
  const remaining = Math.max(0, story.sourceCount - previewSources.length);
  return (
    <article className="group flex w-full flex-col border-t-2 border-foreground pt-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <CategoryTag category={category} />
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {story.sourceCount} fontes
        </span>
        {story.missingBiasLabels.length > 0 ? (
          <BlindspotBadge missingLabels={story.missingBiasLabels} />
        ) : null}
      </div>
      <Link href={`/stories/${story.id}`} className="hover:underline">
        <h3 className="font-display text-[22px] font-bold leading-tight">{story.title}</h3>
      </Link>
      {story.summary ? (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {story.summary}
        </p>
      ) : null}
      <div className="mt-auto flex flex-col gap-3 pt-5">
        <BiasBar distribution={story.biasDistribution} />
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            {previewSources.map((s) => (
              <span key={s.articleId} className="flex items-center gap-1">
                <BiasDot label={s.biasLabel} />
                {s.publisherName}
              </span>
            ))}
            {remaining > 0 ? <span>+{remaining}</span> : null}
          </div>
          <Link
            href={`/stories/${story.id}`}
            className="flex shrink-0 items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-foreground hover:text-accent"
          >
            Comparar
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
}
