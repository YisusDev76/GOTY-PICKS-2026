import { legible, type Pick } from "@/lib/picks";

/** La boleta "en la app": una lista clara de tus picks por categoría. */
export function VistaBoleta({ picks, nombre }: { picks: Pick[]; nombre: string }) {
  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-oro">GOTY Picks · The Game Awards 2026</p>
      <h1 className="mt-2 font-display text-3xl uppercase leading-tight sm:text-5xl">
        {nombre ? `Los picks de ${nombre}` : "Mis picks"}
      </h1>
      <ul className="mt-6 space-y-3">
        {legible(picks).map(({ categoria, fav, bet }) => (
          <li key={categoria.id} className="rounded-2xl border border-borde bg-panel p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-oro">{categoria.nombre}</p>
            <p className="mt-2 flex gap-2">
              <span className="text-amor" aria-label="Quiero que gane">❤️</span>
              <span className={fav ? "font-semibold" : "text-tenue"}>{fav?.titulo ?? "Sin elegir"}</span>
            </p>
            <p className="mt-1 flex gap-2">
              <span aria-label="Apostaría">💰</span>
              <span className={bet ? "font-semibold" : "text-tenue"}>{bet?.titulo ?? "Sin elegir"}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
