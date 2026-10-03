export function LegalPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[720px] px-4 pb-16 pt-24 text-[var(--text-base)] leading-[var(--leading-loose)] [&_a]:text-[var(--color-accent)] [&_a]:underline [&_h1]:mb-1 [&_h1]:text-[var(--text-2xl)] [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-[var(--text-lg)] [&_h2]:font-bold [&_hr]:my-8 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-[var(--color-border)] [&_li]:mt-1 [&_p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
      {children}
    </div>
  );
}

export const BASE_PATH = "/es/tiendanube/ocultar-envios-y-pagos";
