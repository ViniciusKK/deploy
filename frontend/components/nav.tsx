'use client';

import { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { Show, SignInButton, UserButton } from '@clerk/nextjs';
import { Paywall } from '@/components/paywall';

const SECTIONS = ['Política', 'Economia', 'Mundo', 'Clima', 'Tecnologia', 'Cultura'];

export function Nav() {
  const [paywallOpen, setPaywallOpen] = useState(false);

  return (
    <header className="border-b border-foreground bg-background">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-10 py-4">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center bg-foreground text-background font-display text-xl font-bold">
              E
            </div>
            <span className="font-display text-2xl font-bold tracking-tight">Espectro</span>
          </div>
          <nav className="hidden gap-8 text-sm md:flex">
            {SECTIONS.map((s) => (
              <a key={s} href="#" className="text-foreground hover:text-accent">
                {s}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-pill bg-card-muted px-3 py-2 text-sm text-muted-foreground md:flex">
            <Search size={16} />
            <span>Buscar histórias e fontes</span>
          </div>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="rounded-pill bg-card-muted px-5 py-2.5 text-sm font-medium hover:bg-border">
                Entrar
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{ elements: { avatarBox: 'h-10 w-10' } }}
            />
          </Show>
          <button
            onClick={() => setPaywallOpen(true)}
            className="flex items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Assinar
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-pill bg-card-muted md:hidden">
            <Menu size={18} />
          </button>
        </div>
      </div>
      <Paywall open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </header>
  );
}

export function BreakingBanner({ message }: { message: string }) {
  return (
    <div className="bg-accent text-accent-foreground">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-10 py-2.5 text-sm">
        <span className="rounded-sm bg-accent-foreground/15 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider">
          Última hora
        </span>
        <span className="truncate">{message}</span>
      </div>
    </div>
  );
}
