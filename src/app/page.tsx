import { ArmarBoleta } from "@/components/ArmarBoleta";
import { decodificar, limpiarNombre } from "@/lib/picks";

// "/" arma la boleta. Si llega con ?p=...&n=... (botón "Editar"), arranca con esos picks.
export default async function Inicio({ searchParams }: PageProps<"/">) {
  const { p, n } = await searchParams;
  const picks = decodificar(typeof p === "string" ? p : null);
  const nombre = limpiarNombre(typeof n === "string" ? n : "");
  return <ArmarBoleta inicial={picks.length ? { picks, nombre } : undefined} />;
}
