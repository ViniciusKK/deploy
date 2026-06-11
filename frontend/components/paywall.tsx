'use client';

import { useState } from 'react';
import { Show, SignInButton, useAuth } from '@clerk/nextjs';
import { Check, X } from 'lucide-react';
import { API_BASE } from '@/lib/api';

const BENEFITS = [
  'Comparações ilimitadas entre veículos',
  'Alertas de pontos cegos na sua cobertura',
  'Despachos diários direto no seu e-mail',
  'Sem anúncios, sem distração',
];

export function Paywall({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/billing/checkout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Checkout falhou: ${res.status}`);
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setError('Não foi possível iniciar o pagamento. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-6">
      <div
        className="absolute inset-0 bg-foreground/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md border border-foreground bg-background shadow-2xl">
        <div className="h-1.5 w-full bg-accent" />
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-6 grid h-8 w-8 place-items-center rounded-pill bg-card-muted text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </button>

        <div className="px-8 pb-8 pt-7">
          <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
            Assinatura · Espectro Premium
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight">
            Leia além da manchete.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Você chegou ao limite de leituras gratuitas deste mês. Assine para
            continuar comparando como cada veículo conta a mesma história.
          </p>

          <ul className="mt-6 flex flex-col gap-2.5">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center bg-foreground text-background">
                  <Check size={11} strokeWidth={3} />
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex items-baseline gap-2 border-t border-border pt-6">
            <span className="font-display text-4xl font-bold">R$ 15</span>
            <span className="text-sm text-muted-foreground">/mês · cancele quando quiser</span>
          </div>

          <div className="mt-5 flex flex-col gap-2.5">
            <Show when="signed-in">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full rounded-pill bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? 'Redirecionando…' : 'Assinar por R$ 15/mês'}
              </button>
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="flex w-full items-center justify-center gap-2.5 rounded-pill bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                  <GoogleIcon />
                  Continuar com Google
                </button>
              </SignInButton>
              <p className="text-center font-mono text-[11px] text-subtle-foreground">
                Entre para concluir a assinatura
              </p>
            </Show>
            <button
              onClick={onClose}
              className="w-full rounded-pill px-5 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Agora não
            </button>
          </div>

          {error ? <p className="mt-3 text-center text-sm text-accent">{error}</p> : null}

          <p className="mt-5 border-t border-border pt-4 text-center font-mono text-[10px] uppercase tracking-wider text-subtle-foreground">
            Demonstração · pagamento processado pela Stripe
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
