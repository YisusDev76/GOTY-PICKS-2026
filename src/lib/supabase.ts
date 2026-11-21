import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase SOLO para el servidor (route handlers y server components).
 * Si no configuraste las variables de entorno, devuelve null y la app sigue
 * funcionando sin backend (solo se desactivan los links cortos).
 */
let cliente: SupabaseClient | null | undefined;

export function supabase(): SupabaseClient | null {
  if (cliente !== undefined) return cliente;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  cliente = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return cliente;
}

export function backendActivo(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}
