import { StoryCard } from './story-card';
import type { FeedStory } from '@/lib/api';

export function ComparisonSection({ stories }: { stories: FeedStory[] }) {
  if (stories.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1440px] px-10">
      <div className="border-t border-foreground pt-6">
        <div className="max-w-2xl pb-6">
          <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
            Comparação editorial
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight">
            Uma só história, lados diferentes da mesma manchete
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Veja como veículos de espectros distintos contam a mesma história — e o que cada um enfatiza ou ignora.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {stories.slice(0, 3).map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
