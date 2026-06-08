import { Check, Circle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { biasColorClass, biasLabelPt } from './bias';

export function CategoryTag({ category }: { category: string }) {
  const key = category.toLowerCase();
  const colorMap: Record<string, string> = {
    politica: 'text-cat-politica',
    economia: 'text-cat-economia',
    mundo: 'text-cat-mundo',
    tecnologia: 'text-cat-tecnologia',
    clima: 'text-cat-clima',
    cultura: 'text-cat-cultura',
  };
  const color = colorMap[key] ?? 'text-foreground';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider',
        color,
      )}
    >
      <Circle className="fill-current" size={6} strokeWidth={0} />
      {category}
    </span>
  );
}

type Factuality = 'high' | 'mixed' | 'low';
export function FactualityBadge({ level = 'high' }: { level?: Factuality }) {
  const map: Record<Factuality, { label: string; icon: React.ReactNode; cls: string }> = {
    high: {
      label: 'Factualidade alta',
      icon: <Check size={11} />,
      cls: 'border-fact-high text-fact-high',
    },
    mixed: {
      label: 'Factualidade mista',
      icon: <AlertTriangle size={11} />,
      cls: 'border-fact-mixed text-fact-mixed',
    },
    low: {
      label: 'Factualidade baixa',
      icon: <AlertTriangle size={11} />,
      cls: 'border-fact-low text-fact-low',
    },
  };
  const v = map[level];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider',
        v.cls,
      )}
    >
      {v.icon}
      {v.label}
    </span>
  );
}

export function BlindspotBadge({ missingLabels }: { missingLabels: string[] }) {
  if (missingLabels.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-bias-right px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-white">
      <AlertTriangle size={11} />
      Pouco visto pela {missingLabels.map(biasLabelPt).join(' / ')}
    </span>
  );
}

export function BiasDot({ label }: { label: string }) {
  return <span className={cn('inline-block h-2.5 w-2.5 rounded-pill', biasColorClass(label))} />;
}
