import { ExternalLink } from 'lucide-react';
import { BiasDot } from './badges';
import { biasLabelPt } from './bias';
import type { FeedSource } from '@/lib/api';

export function SourceRow({ source }: { source: FeedSource }) {
  const initial = source.publisherName.charAt(0).toUpperCase();
  return (
    <div className="flex items-start gap-3.5 border-b border-border py-3 last:border-b-0">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-card-muted font-display text-lg font-bold">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs">
          <BiasDot label={source.biasLabel} />
          <span className="font-medium text-foreground">{source.publisherName}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{biasLabelPt(source.biasLabel)}</span>
          {source.tone ? (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-subtle-foreground">
                tom: {source.tone}
              </span>
            </>
          ) : null}
        </div>
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="mt-1 flex items-center gap-1.5 truncate text-sm text-foreground hover:text-accent"
        >
          <span className="truncate">{source.title}</span>
          <ExternalLink size={12} className="shrink-0 text-subtle-foreground" />
        </a>
      </div>
    </div>
  );
}
