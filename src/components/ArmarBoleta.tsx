"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIAS, categoriasPrincipales, type Nominado } from "@/data/nominados";
import { limpiarNombre, urlResultado, type Pick } from "@/lib/picks";
import { Portada } from "./Portada";

type Modo = "todas" | "top5" | "top10" | "manual";
type Paso = "elegir" | "boleta";
type Seleccion = Record<number, { fav: number | null; bet: number | null }>;

const MODOS: { id: Modo; titulo: string; detalle: string }[] = [
  { id: "top5", titulo: "Las 5 principales", detalle: "Juego del Año y las grandes" },
  { id: "top10", titulo: "Las 10 principales", detalle: "Un poco más a fondo" },
  { id: "todas", titulo: "Todas", detalle: `${CATEGORIAS.length} categorías, modo experto` },
  { id: "manual", titulo: "Manual", detalle: "Tú eliges cuáles" },
];

const CLAVE_LOCAL = "goty-picks-2026";
/** Pausa antes de pasar sola a la siguiente categoría, para que se vea lo que marcaste. */
const PAUSA_AVANCE = 1000;
const PAUSA_IGUAL = 250;

type Estado = {
  modo: Modo;
  manual: number[];
  picks: Seleccion;
  nombre: string;
  paso: Paso;
  /** Posición (dentro de las categorías elegidas) que se está viendo en el carrusel. */
  actual: number;
  /** Categorías marcadas como "Me da igual": no salen en la boleta. */
  igual: number[];
};

function indicesDeModo(modo: Modo, manual: number[]): number[] {
  if (modo === "todas") return CATEGORIAS.map((_, i) => i);
  if (modo === "manual") return [...manual].sort((a, b) => a - b);
  return categoriasPrincipales(modo === "top5" ? 5 : 10).map((c) => CATEGORIAS.indexOf(c));
}

export function ArmarBoleta({ inicial }: { inicial?: { picks: Pick[]; nombre: string } }) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>(() =>
    inicial && inicial.picks.length > 0
      ? {
          modo: "manual",
          manual: inicial.picks.map((p) => p.cat),
          picks: Object.fromEntries(inicial.picks.map((p) => [p.cat, { fav: p.fav, bet: p.bet }])),
          nombre: inicial.nombre,
          paso: "boleta",
          actual: 0,
          igual: [],
        }
      : { modo: "top5", manual: [], picks: {}, nombre: "", paso: "elegir", actual: 0, igual: [] },
  );
  const [cargado, setCargado] = useState(false);
  const [direccion, setDireccion] = useState<"izq" | "der">("der");
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toque = useRef<{ x: number; y: number } | null>(null);

  // Recupera lo que el usuario llevaba (solo en el navegador, después de montar
  // para no romper la "hidratación" de React). Si vienes de "Editar", manda la URL.
  useEffect(() => {
    if (!inicial?.picks.length) {
      try {
        const guardado = localStorage.getItem(CLAVE_LOCAL);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- leer localStorage solo es posible tras montar
        if (guardado) setEstado((e) => ({ ...e, ...JSON.parse(guardado) }));
      } catch {
        /* modo incógnito o datos corruptos: empezamos de cero */
      }
    }
    setCargado(true);
  }, [inicial]);

  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(CLAVE_LOCAL, JSON.stringify(estado));
    } catch {
      /* sin almacenamiento disponible: no pasa nada */
    }
  }, [estado, cargado]);

  // Si el componente se desmonta con un avance pendiente, lo cancelamos.
  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  const indices = useMemo(() => indicesDeModo(estado.modo, estado.manual), [estado.modo, estado.manual]);
  const igual = useMemo(() => new Set(estado.igual), [estado.igual]);
  const ultima = indices.length - 1;
  // La posición se acota aquí: si cambiaste de modo, puede haber quedado fuera de rango.
  const pos = Math.max(0, Math.min(estado.actual, ultima));

  const estaCompleta = (cat: number) =>
    igual.has(cat) || (estado.picks[cat]?.fav != null && estado.picks[cat]?.bet != null);
  const completas = indices.filter(estaCompleta).length;
  const enBoleta = indices.filter((i) => !igual.has(i));
  const conAlgo = enBoleta.filter((i) => estado.picks[i]?.fav != null || estado.picks[i]?.bet != null).length;

  const actualizar = (cambio: Partial<Estado>) => setEstado((e) => ({ ...e, ...cambio }));

  function cancelarAvance() {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
  }

  const irA = (nueva: number) => {
    cancelarAvance();
    if (nueva < 0 || nueva > ultima || nueva === pos) return;
    setDireccion(nueva > pos ? "der" : "izq");
    actualizar({ actual: nueva });
    window.scrollTo({ top: 0 });
  };

  const avanzarLuego = (pausa: number) => {
    cancelarAvance();
    if (pos >= ultima) return;
    temporizador.current = setTimeout(() => irA(pos + 1), pausa);
  };

  const marcar = (cat: number, tipo: "fav" | "bet", nominado: number) => {
    const previo = estado.picks[cat] ?? { fav: null, bet: null };
    const nuevo = { ...previo, [tipo]: previo[tipo] === nominado ? null : nominado };
    setEstado((e) => ({
      ...e,
      picks: { ...e.picks, [cat]: nuevo },
      igual: e.igual.filter((x) => x !== cat),
    }));
    if (nuevo.fav != null && nuevo.bet != null) avanzarLuego(PAUSA_AVANCE);
    else cancelarAvance();
  };

  const marcarIgual = (cat: number) => {
    if (igual.has(cat)) {
      cancelarAvance();
      setEstado((e) => ({ ...e, igual: e.igual.filter((x) => x !== cat) }));
      return;
    }
    setEstado((e) => ({
      ...e,
      igual: [...e.igual, cat],
      picks: { ...e.picks, [cat]: { fav: null, bet: null } },
    }));
    avanzarLuego(PAUSA_IGUAL);
  };

  const verBoleta = () => {
    cancelarAvance();
    const picks: Pick[] = enBoleta.map((cat) => ({
      cat,
      fav: estado.picks[cat]?.fav ?? null,
      bet: estado.picks[cat]?.bet ?? null,
    }));
    router.push(urlResultado({ nombre: estado.nombre, picks }));
  };

  // Deslizar a los lados cambia de categoría; el scroll vertical sigue siendo del navegador.
  const alTocar = (e: React.TouchEvent) => {
    const t = e.touches[0];
    toque.current = { x: t.clientX, y: t.clientY };
  };
  const alSoltar = (e: React.TouchEvent) => {
    if (!toque.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - toque.current.x;
    const dy = t.clientY - toque.current.y;
    toque.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) irA(dx < 0 ? pos + 1 : pos - 1);
  };

  if (estado.paso === "elegir") {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-8">
        <Encabezado />

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-oro">1 · ¿Cuántas categorías?</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {MODOS.map((m) => {
              const activo = estado.modo === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => actualizar({ modo: m.id })}
                  aria-pressed={activo}
                  className={`rounded-2xl border p-4 text-left transition ${
                    activo ? "border-oro bg-oro/10" : "border-borde bg-panel hover:border-tenue"
                  }`}
                >
                  <span className="block font-bold">{m.titulo}</span>
                  <span className="mt-1 block text-sm text-tenue">{m.detalle}</span>
                </button>
              );
            })}
          </div>

          {estado.modo === "manual" && (
            <ul className="mt-4 divide-y divide-borde rounded-2xl border border-borde bg-panel">
              {CATEGORIAS.map((c, i) => {
                const marcada = estado.manual.includes(i);
                return (
                  <li key={c.id}>
                    <label className="flex min-h-12 cursor-pointer items-center gap-3 px-4 py-2">
                      <input
                        type="checkbox"
                        className="size-5 accent-[var(--color-oro)]"
                        checked={marcada}
                        onChange={() =>
                          actualizar({
                            manual: marcada ? estado.manual.filter((x) => x !== i) : [...estado.manual, i],
                          })
                        }
                      />
                      <span>{c.nombre}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-oro">2 · Tu nombre (opcional)</h2>
          <input
            type="text"
            value={estado.nombre}
            maxLength={30}
            onChange={(e) => actualizar({ nombre: e.target.value })}
            onBlur={() => actualizar({ nombre: limpiarNombre(estado.nombre) })}
            placeholder="Aparece en tu imagen: “Los picks de …”"
            className="mt-3 w-full rounded-2xl border border-borde bg-panel px-4 py-3 text-base placeholder:text-tenue focus:border-oro focus:outline-none"
          />
        </section>

        <BarraInferior>
          <button
            type="button"
            disabled={indices.length === 0}
            onClick={() => {
              actualizar({ paso: "boleta" });
              window.scrollTo({ top: 0 });
            }}
            className="w-full rounded-full bg-oro px-6 py-4 font-bold text-black disabled:opacity-40"
          >
            Armar mi boleta ({indices.length} {indices.length === 1 ? "categoría" : "categorías"})
          </button>
        </BarraInferior>
      </main>
    );
  }

  const cat = indices[pos];
  const categoria = CATEGORIAS[cat];
  const sel = estado.picks[cat] ?? { fav: null, bet: null };
  const esIgual = igual.has(cat);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            cancelarAvance();
            actualizar({ paso: "elegir" });
          }}
          className="rounded-full border border-borde px-4 py-2 text-sm text-tenue"
        >
          ← Categorías
        </button>
        <button
          type="button"
          disabled={conAlgo === 0}
          onClick={verBoleta}
          className="rounded-full border border-oro/60 px-4 py-2 text-sm font-semibold text-oro disabled:opacity-30"
        >
          Ver boleta
        </button>
      </div>

      {/* Progreso: un segmento por categoría. */}
      <div className="mt-5 flex items-center justify-between text-xs text-tenue">
        <span>
          Categoría <span className="font-bold text-white">{pos + 1}</span>/{indices.length}
        </span>
        <span>
          <span className="font-bold text-white">{completas}</span>/{indices.length} completas
        </span>
      </div>
      <div className="mt-2 flex gap-0.5" aria-hidden>
        {indices.map((i, n) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              igual.has(i) ? "bg-tenue/50" : estaCompleta(i) ? "bg-oro" : "bg-borde"
            } ${n === pos ? "outline outline-1 outline-offset-1 outline-white/70" : ""}`}
          />
        ))}
      </div>

      <section
        key={categoria.id}
        aria-labelledby={`cat-${categoria.id}`}
        onTouchStart={alTocar}
        onTouchEnd={alSoltar}
        className={`mt-5 touch-pan-y ${direccion === "der" ? "entrar-der" : "entrar-izq"}`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <h2 id={`cat-${categoria.id}`} className="font-display text-2xl uppercase leading-tight">
              {categoria.nombre}
            </h2>
            <p className="text-xs text-tenue">{categoria.nombreOriginal}</p>
          </div>
          <span className="shrink-0 text-sm">
            <span className={sel.fav != null ? "" : "opacity-25"}>❤️</span>{" "}
            <span className={sel.bet != null ? "" : "opacity-25"}>💰</span>
          </span>
        </div>
        <p className="mt-2 text-sm text-tenue">
          Toca <span className="text-amor">❤️</span> si quieres que gane y <span className="text-oro">💰</span> si
          apostarías por él.
        </p>

        <ul
          className={`mt-4 grid grid-cols-2 gap-x-3 gap-y-5 transition sm:grid-cols-3 ${esIgual ? "opacity-35" : ""}`}
        >
          {categoria.nominados.map((nom, i) => (
            <TarjetaNominado
              key={`${nom.titulo}-${i}`}
              nominado={nom}
              esFav={sel.fav === i}
              esBet={sel.bet === i}
              onFav={() => marcar(cat, "fav", i)}
              onBet={() => marcar(cat, "bet", i)}
            />
          ))}
        </ul>

        <button
          type="button"
          onClick={() => marcarIgual(cat)}
          aria-pressed={esIgual}
          className={`mt-6 w-full rounded-2xl border px-4 py-3 font-semibold transition ${
            esIgual ? "border-tenue bg-tenue/20 text-white" : "border-dashed border-borde text-tenue"
          }`}
        >
          {esIgual ? "🤷 Me da igual · no sale en tu boleta" : "🤷 Me da igual esta categoría"}
        </button>
      </section>

      <BarraInferior>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={pos === 0}
            onClick={() => irA(pos - 1)}
            aria-label="Categoría anterior"
            className="rounded-full border border-borde px-5 py-4 font-bold disabled:opacity-30"
          >
            ←
          </button>
          {pos < ultima ? (
            <button
              type="button"
              onClick={() => irA(pos + 1)}
              className="flex-1 rounded-full bg-oro px-6 py-4 font-bold text-black"
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              disabled={conAlgo === 0}
              onClick={verBoleta}
              className="flex-1 rounded-full bg-oro px-6 py-4 font-bold text-black disabled:opacity-40"
            >
              Ver mi boleta →
            </button>
          )}
        </div>
      </BarraInferior>
    </main>
  );
}

function TarjetaNominado({
  nominado,
  esFav,
  esBet,
  onFav,
  onBet,
}: {
  nominado: Nominado;
  esFav: boolean;
  esBet: boolean;
  onFav: () => void;
  onBet: () => void;
}) {
  return (
    <li className="flex flex-col">
      <Portada
        nominado={nominado}
        className={`ring-offset-2 ring-offset-fondo transition ${
          esFav && esBet ? "ring-4 ring-oro" : esFav ? "ring-4 ring-amor" : esBet ? "ring-4 ring-oro" : ""
        }`}
      />
      {/* El nombre SIEMPRE va debajo de la portada, nunca encima. */}
      <p className="mt-2 text-sm font-semibold leading-snug">{nominado.titulo}</p>
      {nominado.detalle && <p className="text-xs text-tenue">{nominado.detalle}</p>}
      <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
        <button
          type="button"
          onClick={onFav}
          aria-pressed={esFav}
          aria-label={`Quiero que gane ${nominado.titulo}`}
          className={`h-11 rounded-full border text-lg transition ${
            esFav ? "border-amor bg-amor/20" : "border-borde bg-panel opacity-70"
          }`}
        >
          ❤️
        </button>
        <button
          type="button"
          onClick={onBet}
          aria-pressed={esBet}
          aria-label={`Apostaría por ${nominado.titulo}`}
          className={`h-11 rounded-full border text-lg transition ${
            esBet ? "border-oro bg-oro/20" : "border-borde bg-panel opacity-70"
          }`}
        >
          💰
        </button>
      </div>
    </li>
  );
}

function Encabezado() {
  return (
    <header>
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-oro">The Game Awards · 10 dic 2026</p>
      <h1 className="mt-2 font-display text-4xl uppercase leading-none sm:text-6xl">GOTY Picks 2026</h1>
      <p className="mt-3 max-w-prose text-tenue">
        En cada categoría marca <span className="text-amor">❤️</span> al que quieres que gane y{" "}
        <span className="text-oro">💰</span> al que crees que va a ganar. Al final te llevas tu boleta como
        imagen para Instagram.
      </p>
    </header>
  );
}

/** Barra fija abajo: en móvil el botón principal queda siempre al alcance del pulgar. */
function BarraInferior({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-borde bg-fondo/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      <div className="mx-auto max-w-3xl">{children}</div>
    </div>
  );
}
