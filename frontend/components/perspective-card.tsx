import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BiasDot } from './badges';
import { biasBorderClass, biasColorClass, biasLabelPt } from './bias';
import type { ComparisonPerspective } from '@/lib/api';

export function PerspectiveCard({
  perspective,
  sharedFacts,
}: {
  perspective: ComparisonPerspective;
  sharedFacts: Set<string>;
}) {
  const initial = perspective.publisherName.charAt(0).toUpperCase();
  return (
    <article className="flex flex-col border border-border bg-background">
      <header className={cn('flex items-center gap-3 border-b border-border p-4')}>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-card-muted font-display text-lg font-bold">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs">
            <BiasDot label={perspective.biasLabel} />
            <span className="font-medium">{perspective.publisherName}</span>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {biasLabelPt(perspective.biasLabel)} · {perspective.publisherDomain}
          </p>
        </div>
        <a
          href={perspective.url}
          target="_blank"
          rel="noreferrer"
          aria-label="Abrir matéria original"
          className="grid h-9 w-9 place-items-center rounded-pill bg-card-muted text-foreground hover:bg-foreground hover:text-background"
        >
          <ExternalLink size={14} />
        </a>
      </header>

      <div className="flex flex-col gap-4 p-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Manchete da casa
          </p>
          <h3 className="mt-1 font-display text-xl font-bold leading-snug">{perspective.title}</h3>
        </div>

        {perspective.tone ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono uppercase tracking-wider text-muted-foreground">Tom:</span>
            <span
              className={cn(
                'rounded-pill px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-white',
                biasColorClass(perspective.biasLabel),
              )}
            >
              {perspective.tone}
            </span>
          </div>
        ) : null}

        {perspective.coreFacts.length > 0 ? (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Fatos centrais
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {perspective.coreFacts.map((fact, i) => {
                const isShared = sharedFacts.has(fact);
                return (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className={cn(
                        'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-pill',
                        isShared ? 'bg-foreground' : 'bg-accent',
                      )}
                    />
                    <span className={cn(isShared ? 'text-foreground' : 'font-medium text-accent')}>
                      {fact}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {perspective.editorialReading ? (
          <div className={cn('border-l-2 pl-4', biasBorderClass(perspective.biasLabel))}>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Lente editorial
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {perspective.editorialReading}
            </p>
          </div>
        ) : (
          <div className="rounded-sm bg-card-muted p-3 text-xs text-muted-foreground">
            Análise editorial ainda não gerada para este veículo. Rode a análise com
            <code className="ml-1 font-mono">force: true</code> para preencher.
          </div>
        )}

        {perspective.excerpt ? (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Trecho
            </p>
            <p className="mt-1 line-clamp-6 text-sm leading-relaxed text-muted-foreground">
              {perspective.excerpt}…
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
