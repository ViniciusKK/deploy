import { AlertTriangle } from 'lucide-react';
import { biasLabelPt } from './bias';
import { BiasDot } from './badges';
import type { FeedBlindspot } from '@/lib/api';

export function BlindspotSection({ blindspots }: { blindspots: FeedBlindspot[] }) {
  if (blindspots.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1440px] px-10">
      <div className="border-t border-foreground pt-6">
        <div className="pb-6">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            O que está sendo deixado de lado
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Histórias cobertas só por um lado do espectro. Quem está silenciando o quê?
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {blindspots.map((b) => (
            <article key={b.storyId} className="border border-border bg-card-muted/40 p-6">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-pill bg-bias-right px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-white">
                <AlertTriangle size={11} />
                Pouco visto pela {b.missingBiasLabels.map(biasLabelPt).join(' / ')}
              </div>
              <h3 className="font-display text-2xl font-bold leading-snug">{b.storyTitle}</h3>
              <div className="mt-4 flex flex-col gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Coberta por
                </span>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {b.coveredBy.map((c, i) => (
                    <li key={`${c.publisherName}-${i}`} className="flex items-center gap-2">
                      <BiasDot label={c.biasLabel} />
                      <span>{c.publisherName}</span>
                      <span className="text-muted-foreground">— {biasLabelPt(c.biasLabel)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
