import Link from 'next/link';
import { CategoryTag, FactualityBadge } from './badges';
import { SourceRow } from './source-row';
import type { FeedStory } from '@/lib/api';

export function Hero({ story }: { story: FeedStory }) {
  const sources = story.sources.slice(0, 4);
  return (
    <section className="mx-auto max-w-[1440px] px-10 pb-10 pt-6">
      <div className="border-t-4 border-foreground pt-6">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <CategoryTag category="política" />
          <FactualityBadge level="high" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {story.sourceCount} fontes · {new Date(story.publishedAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
        <Link href={`/stories/${story.id}`} className="group block">
          <h1 className="font-display text-[48px] font-bold leading-[1.05] tracking-tight max-w-4xl group-hover:underline lg:text-[56px]">
            {story.title}
          </h1>
        </Link>
        {story.summary ? (
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground max-w-3xl">
            {story.summary}
          </p>
        ) : null}
        <div className="mt-8 border-t border-border pt-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Como está sendo coberto
            </span>
            <Link
              href={`/stories/${story.id}`}
              className="font-mono text-[11px] uppercase tracking-wider text-accent hover:underline"
            >
              Ver comparação completa →
            </Link>
          </div>
          <div>
            {sources.map((s) => (
              <SourceRow key={s.articleId} source={s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
