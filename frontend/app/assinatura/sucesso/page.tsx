'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Check } from 'lucide-react';
import { API_BASE } from '@/lib/api';

type ConfirmState = 'confirming' | 'active' | 'pending' | 'error';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [state, setState] = useState<ConfirmState>('confirming');

  useEffect(() => {
    if (!isLoaded) return;
    if (!sessionId || !isSignedIn) {
      setState('error');
      return;
    }

    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${API_BASE}/billing/confirm?session_id=${encodeURIComponent(sessionId)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) throw new Error(`Confirm failed: ${res.status}`);
        const { status } = (await res.json()) as { status: 'active' | 'pending' };
        setState(status);
      } catch (error) {
        console.error(error);
        setState('error');
      }
    })();
  }, [isLoaded, isSignedIn, sessionId, getToken]);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <div className="w-full max-w-md border border-foreground bg-background text-center">
        <div className="h-1.5 w-full bg-accent" />
        <div className="px-8 py-10">
          {state === 'confirming' ? (
            <>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Confirmando pagamento…
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold">Um instante</h1>
            </>
          ) : null}

          {state === 'active' ? (
            <>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-pill bg-foreground text-background">
                <Check size={22} strokeWidth={3} />
              </span>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-wider text-accent">
                Assinatura ativa
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold leading-tight">
                Bem-vindo ao Espectro Premium
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Sua assinatura de R$ 15/mês está ativa. Boa leitura — agora em
                todas as vozes.
              </p>
            </>
          ) : null}

          {state === 'pending' ? (
            <>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Pagamento em processamento
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold">Quase lá</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Assim que o pagamento for confirmado, sua assinatura será ativada.
              </p>
            </>
          ) : null}

          {state === 'error' ? (
            <>
              <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                Algo deu errado
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold">
                Não foi possível confirmar
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Verifique se você está conectado e tente recarregar a página.
              </p>
            </>
          ) : null}

          <Link
            href="/"
            className="mt-8 inline-block rounded-pill bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Voltar para a capa
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
