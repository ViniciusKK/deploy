import { getHomepageFeed } from '@/lib/api';
import { BreakingBanner, Nav } from '@/components/nav';
import { Hero } from '@/components/hero';
import { ComparisonSection } from '@/components/comparison';
import { DispatchesSection } from '@/components/dispatches';
import { BlindspotSection } from '@/components/blindspot';
import { Footer } from '@/components/footer';

export default async function HomePage() {
  const feed = await getHomepageFeed().catch(() => null);

  if (!feed) {
    return (
      <main>
        <Nav />
        <div className="mx-auto max-w-2xl px-10 py-20 text-center">
          <h1 className="font-display text-4xl font-bold">Sem conexão com a API</h1>
          <p className="mt-4 text-muted-foreground">
            Verifique se a API está rodando em <code className="font-mono">http://localhost:3000</code>.
          </p>
        </div>
      </main>
    );
  }

  const breakingMessage =
    feed.hero?.title ?? 'Acompanhe as histórias do dia em mais de uma voz.';

  return (
    <main>
      <Nav />
      <BreakingBanner message={breakingMessage} />
      <section className="mx-auto max-w-[1440px] px-10 pb-2 pt-10">
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {new Date(feed.generatedAt).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}{' '}
          · Edição da casa
        </p>
        <h1 className="mt-2 font-display text-5xl font-bold leading-[1.05] tracking-tight">
          O que está sendo dito hoje
        </h1>
      </section>
      {feed.hero ? <Hero story={feed.hero} /> : null}
      <div className="flex flex-col gap-16 py-12">
        <ComparisonSection stories={feed.comparison} />
        <DispatchesSection dispatches={feed.dispatches} />
        <BlindspotSection blindspots={feed.blindspots} />
      </div>
      <Footer />
    </main>
  );
}
