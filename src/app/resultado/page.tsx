import type { Metadata } from "next";
import Link from "next/link";
import { Exportar } from "@/components/Exportar";
import { VistaBoleta } from "@/components/VistaBoleta";
import { codificar, decodificar, limpiarNombre, urlImagen } from "@/lib/picks";
import { backendActivo } from "@/lib/supabase";

type Props = PageProps<"/resultado">;

async function leer(searchParams: Props["searchParams"]) {
  const { p, n } = await searchParams;
  const picks = decodificar(typeof p === "string" ? p : null);
  return { picks, codigo: codificar(picks), nombre: limpiarNombre(typeof n === "string" ? n : "") };
}

// Vista previa al pegar el link en WhatsApp / X / Discord.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { picks, codigo, nombre } = await leer(searchParams);
  if (picks.length === 0) return {};
  const titulo = nombre ? `Los picks de ${nombre} · GOTY 2026` : "Mis picks · GOTY 2026";
  return {
    title: titulo,
    openGraph: { title: titulo, images: [urlImagen(codigo, nombre, "post")] },
    twitter: { card: "summary_large_image" },
  };
}

export default async function Resultado({ searchParams }: Props) {
  const { picks, codigo, nombre } = await leer(searchParams);

  if (picks.length === 0) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pt-16 text-center">
        <h1 className="font-display text-3xl uppercase">Boleta vacía</h1>
        <p className="mt-3 text-tenue">Este link no trae picks válidos.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-oro px-6 py-3 font-bold text-black">
          Armar mi boleta
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 pt-8">
      <VistaBoleta picks={picks} nombre={nombre} />
      <Exportar codigo={codigo} nombre={nombre} backend={backendActivo()} />
    </main>
  );
}
