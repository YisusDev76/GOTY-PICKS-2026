import { CATEGORIAS, type Categoria, type Nominado } from "@/data/nominados";

/**
 * Una boleta = lista de categorías elegidas, y en cada una dos picks:
 *  - fav (❤): el que quieres que gane
 *  - bet (💰): por el que apostarías
 * Guardamos índices (posición en src/data/nominados.ts), no textos.
 */
export type Pick = {
  cat: number; // índice en CATEGORIAS
  fav: number | null; // índice del nominado
  bet: number | null;
};

export type Boleta = {
  nombre: string;
  picks: Pick[];
};

/**
 * Codificación compacta para URLs: 3 caracteres por categoría.
 *   [categoría en base36][fav][bet]   ("_" = sin elegir)
 * Ejemplo: "02_" = categoría 0, ❤ nominado 2, 💰 sin elegir.
 * 30 categorías caben en 90 caracteres: ideal para links y para la imagen.
 */
const VACIO = "_";

export function codificar(picks: Pick[]): string {
  return picks
    .map(
      (p) =>
        p.cat.toString(36) +
        (p.fav === null ? VACIO : p.fav.toString(36)) +
        (p.bet === null ? VACIO : p.bet.toString(36)),
    )
    .join("");
}

export function decodificar(codigo: string | null | undefined): Pick[] {
  if (!codigo || codigo.length % 3 !== 0 || codigo.length > 3 * CATEGORIAS.length) {
    return [];
  }
  const picks: Pick[] = [];
  const vistas = new Set<number>();
  for (let i = 0; i < codigo.length; i += 3) {
    const cat = parseInt(codigo[i], 36);
    const categoria = CATEGORIAS[cat];
    if (!categoria || vistas.has(cat)) return []; // código inválido: mejor nada que basura
    vistas.add(cat);
    const leer = (c: string) => {
      if (c === VACIO) return null;
      const idx = parseInt(c, 36);
      return Number.isInteger(idx) && idx < categoria.nominados.length ? idx : NaN;
    };
    const fav = leer(codigo[i + 1]);
    const bet = leer(codigo[i + 2]);
    if (Number.isNaN(fav) || Number.isNaN(bet)) return [];
    picks.push({ cat, fav, bet });
  }
  return picks;
}

/**
 * Limpia el nombre que el usuario escribe (se muestra en la imagen).
 * Quitamos emojis porque la fuente de la imagen no los trae.
 */
export function limpiarNombre(nombre: string | null | undefined): string {
  return (nombre ?? "")
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 30);
}

export type PickLegible = {
  categoria: Categoria;
  fav: Nominado | null;
  bet: Nominado | null;
};

export function legible(picks: Pick[]): PickLegible[] {
  return picks.map((p) => {
    const categoria = CATEGORIAS[p.cat];
    return {
      categoria,
      fav: p.fav === null ? null : categoria.nominados[p.fav],
      bet: p.bet === null ? null : categoria.nominados[p.bet],
    };
  });
}

/** URL relativa de la página de resultado para una boleta. */
export function urlResultado(boleta: Boleta): string {
  const params = new URLSearchParams({ p: codificar(boleta.picks) });
  const nombre = limpiarNombre(boleta.nombre);
  if (nombre) params.set("n", nombre);
  return `/resultado?${params.toString()}`;
}

export type Formato = "post" | "historia";

export const FORMATOS: Record<Formato, { ancho: number; alto: number; etiqueta: string }> = {
  post: { ancho: 1080, alto: 1350, etiqueta: "Post 4:5" },
  historia: { ancho: 1080, alto: 1920, etiqueta: "Historia 9:16" },
};

export function urlImagen(codigo: string, nombre: string, formato: Formato): string {
  const params = new URLSearchParams({ p: codigo, f: formato });
  if (nombre) params.set("n", nombre);
  return `/api/imagen?${params.toString()}`;
}

/** Iniciales para la portada de respaldo: "Grand Theft Auto VI" -> "GTA". */
export function iniciales(titulo: string): string {
  const palabras = titulo
    .replace(/[:()!']/g, " ")
    .split(/\s+/)
    .filter((w) => w && !["the", "of", "and", "a", "for", "in", "to"].includes(w.toLowerCase()));
  return palabras
    .slice(0, 3)
    .map((w) => (/^\d+$/.test(w) || /^[IVX]+$/.test(w) ? w : w[0].toUpperCase()))
    .join("")
    .slice(0, 5);
}

/** Color estable a partir del texto, para que cada juego tenga siempre el mismo tono. */
export function tono(texto: string): number {
  let h = 0;
  for (const ch of texto) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}
