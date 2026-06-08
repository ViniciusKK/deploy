export function Footer() {
  return (
    <footer className="mt-16 bg-inverse text-inverse-foreground">
      <div className="mx-auto max-w-[1440px] px-10 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="font-display text-3xl font-bold">Espectro</div>
            <p className="mt-4 text-sm text-inverse-foreground/70">
              Jornalismo comparativo. Lado a lado, sem favoritismo.
            </p>
          </div>
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-inverse-foreground/60">
              Seções
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Política</li>
              <li>Economia</li>
              <li>Mundo</li>
              <li>Tecnologia</li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-inverse-foreground/60">
              Metodologia
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Como medimos viés</li>
              <li>Fontes monitoradas</li>
              <li>Erratas</li>
              <li>API</li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-inverse-foreground/60">
              Sobre
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Time</li>
              <li>Contato</li>
              <li>Imprensa</li>
              <li>Carreiras</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex items-center justify-between border-t border-inverse-foreground/20 pt-6 text-xs text-inverse-foreground/50">
          <span>© {new Date().getFullYear()} Espectro</span>
          <span>Privacidade · Termos · Cookies · Contato</span>
        </div>
      </div>
    </footer>
  );
}
