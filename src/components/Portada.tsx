import type { Nominado } from "@/data/nominados";
import { iniciales, tono } from "@/lib/picks";

/**
 * Portada grande del nominado. Si no hay imagen en /public/portadas,
 * dibuja una tarjeta con degradado e iniciales (siempre del mismo color por juego).
 */
export function Portada({ nominado, className = "" }: { nominado: Nominado; className?: string }) {
  const base = `aspect-[3/4] w-full overflow-hidden rounded-xl ${className}`;

  if (nominado.portada) {
    // <img> normal a propósito: next/image necesita configurar dominios y aquí no aporta mucho.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={nominado.portada} alt="" className={`${base} object-cover`} loading="lazy" />;
  }

  const h = tono(nominado.titulo + (nominado.detalle ?? ""));
  return (
    <div
      aria-hidden
      className={`${base} flex items-center justify-center`}
      style={{
        background: `linear-gradient(150deg, hsl(${h} 70% 42%), hsl(${(h + 50) % 360} 65% 18%))`,
      }}
    >
      <span className="font-display text-3xl tracking-tight text-white/90 drop-shadow sm:text-4xl">
        {iniciales(nominado.titulo)}
      </span>
    </div>
  );
}
