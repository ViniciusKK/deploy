import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { getStoryComparison } from '@/lib/api';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { CategoryTag, FactualityBadge, BiasDot } from '@/components/badges';
import { PerspectiveCard } from '@/components/perspective-card';
import { BIAS_ORDER, biasLabelPt } from '@/components/bias';

export default async function StoryPage({ params }: { params: { id: string } }) {
  const story = await getStoryComparison(params.id).catch(() => null);
  if (!story) notFound();

  const sharedFacts = new Set(story.sharedFacts);
  const total = Object.values(story.biasDistribution).reduce((a, b) => a + b, 0);
  const presentBiases = new Set(story.perspectives.map((p) => p.biasLabel));
  const missing = BIAS_ORDER.filter((b) => !presentBiases.has(b));

  return (
    <main>
      <Nav />
      <article className="mx-auto max-w-[1440px] px-10 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={12} /> Voltar à edição
        </Link>

        <header className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <CategoryTag category="política" />
              <FactualityBadge level="high" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {new Date(story.publishedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h1 className="font-display text-[56px] font-bold leading-[1.02] tracking-tight">
              {story.title}
            </h1>
            {story.summary ? (
              <p className="max-w-3xl text-lg leading-relaxed text-foreground">{story.summary}</p>
            ) : null}
          </div>

          <aside className="flex flex-col gap-4 border border-border bg-card-muted/40 p-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Cobertura
              </p>
              <p className="mt-1 font-display text-3xl font-bold">{story.sourceCount} fontes</p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Distribuição editorial
              </p>
              <div className="space-y-1.5">
                {BIAS_ORDER.map((label) => {
                  const count = story.biasDistribution[label] ?? 0;
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  const colorClass =
                    {
                      LEFT: 'bg-bias-left',
                      LEAN_LEFT: 'bg-bias-lean-left',
                      CENTER: 'bg-bias-center',
                      LEAN_RIGHT: 'bg-bias-lean-right',
                      RIGHT: 'bg-bias-right',
                    }[label] ?? 'bg-subtle-foreground';
                  return (
                    <div key={label} className="flex items-center gap-3 text-xs">
                      <BiasDot label={label} />
                      <span className="w-32 text-muted-foreground">{biasLabelPt(label)}</span>
                      <div className="flex-1 overflow-hidden rounded-pill bg-border/60">
                        <div className={colorClass} style={{ width: `${pct}%`, height: 6 }} />
                      </div>
                      <span className="w-10 text-right font-mono text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {missing.length > 0 ? (
              <div className="flex items-start gap-2 rounded-sm bg-bias-right/10 p-3 text-xs text-foreground">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-bias-right" />
                <span>
                  Nenhuma cobertura encontrada da{' '}
                  <strong>{missing.map(biasLabelPt).join(', ')}</strong>.
                </span>
              </div>
            ) : null}
          </aside>
        </header>

        {story.sharedFacts.length > 0 ? (
          <section className="mt-12 border-t border-foreground pt-6">
            <h2 className="font-display text-2xl font-bold">Em que todos concordam</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fatos centrais que aparecem em pelo menos duas redações.
            </p>
            <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
              {story.sharedFacts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2 rounded-sm bg-card-muted p-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-pill bg-foreground" />
                  {fact}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-12 border-t border-foreground pt-6">
          <div className="flex items-baseline justify-between pb-6">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
                Comparação editorial
              </span>
              <h2 className="mt-1 font-display text-3xl font-bold tracking-tight">
                Lado a lado, do extremo ao centro
              </h2>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Ordenado por espectro
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {story.perspectives.map((p) => (
              <PerspectiveCard key={p.articleId} perspective={p} sharedFacts={sharedFacts} />
            ))}
          </div>
        </section>

        {story.uniqueFactsByPublisher.some((u) => u.facts.length > 0) ? (
          <section className="mt-12 border-t border-foreground pt-6">
            <h2 className="font-display text-2xl font-bold">Cada um por si</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fatos que apareceram em apenas uma cobertura.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {story.uniqueFactsByPublisher
                .filter((u) => u.facts.length > 0)
                .map((u) => (
                  <div key={u.publisher} className="border border-border p-4">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      {u.publisher}
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {u.facts.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-pill bg-accent" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </section>
        ) : null}
      </article>
      <Footer />
    </main>
  );
}
