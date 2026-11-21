import { codificar, decodificar, limpiarNombre } from "@/lib/picks";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/boletas  { codigo: string, nombre?: string }  ->  { id: string }
 *
 * Guarda una boleta en Supabase y devuelve un id corto para compartir (/b/<id>).
 * Validamos aquí (en el servidor) porque cualquiera puede llamar a esta URL.
 */
export async function POST(request: Request) {
  const db = supabase();
  if (!db) {
    return Response.json({ error: "El backend no está configurado." }, { status: 503 });
  }

  let cuerpo: { codigo?: unknown; nombre?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  const picks = decodificar(typeof cuerpo.codigo === "string" ? cuerpo.codigo : null);
  if (picks.length === 0) {
    return Response.json({ error: "Boleta inválida." }, { status: 400 });
  }

  const fila = {
    id: idCorto(),
    codigo: codificar(picks), // re-codificado: solo guardamos datos normalizados
    nombre: limpiarNombre(typeof cuerpo.nombre === "string" ? cuerpo.nombre : "") || null,
  };

  const { error } = await db.from("boletas").insert(fila);
  if (error) {
    console.error("Supabase insert", error);
    return Response.json({ error: "No se pudo guardar." }, { status: 500 });
  }
  return Response.json({ id: fila.id }, { status: 201 });
}

/** 8 caracteres de [a-z0-9]: ~2.8 billones de combinaciones, suficiente para no chocar. */
function idCorto(): string {
  const alfabeto = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join("");
}
