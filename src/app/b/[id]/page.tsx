import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Exportar } from "@/components/Exportar";
import { VistaBoleta } from "@/components/VistaBoleta";
import { decodificar, limpiarNombre, urlImagen } from "@/lib/picks";
import { supabase } from "@/lib/supabase";

type Props = PageProps<"/b/[id]">;

// cache(): generateMetadata y la página piden la misma boleta, así solo consultamos una vez.
const buscarBoleta = cache(async (id: string) => {
  const db = supabase();
  if (!db || !/^[a-z0-9]{8}$/.test(id)) return null;
  const { data } = await db.from("boletas").select("codigo, nombre").eq("id", id).maybeSingle();
  if (!data) return null;
  return { picks: decodificar(data.codigo), codigo: data.codigo as string, nombre: limpiarNombre(data.nombre) };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const boleta = await buscarBoleta((await params).id);
  if (!boleta) return {};
  const titulo = boleta.nombre ? `Los picks de ${boleta.nombre} · GOTY 2026` : "Picks · GOTY 2026";
  return {
    title: titulo,
    openGraph: { title: titulo, images: [urlImagen(boleta.codigo, boleta.nombre, "post")] },
    twitter: { card: "summary_large_image" },
  };
}

export default async function BoletaCompartida({ params }: Props) {
  const { id } = await params;
  const boleta = await buscarBoleta(id);
  if (!boleta || boleta.picks.length === 0) notFound();

  return (
    <main className="mx-auto w-full max-w-xl px-4 pt-8">
      <VistaBoleta picks={boleta.picks} nombre={boleta.nombre} />
      <Link href="/" className="mt-6 block rounded-full bg-oro px-6 py-4 text-center font-bold text-black">
        Arma tu propia boleta
      </Link>
      <Exportar codigo={boleta.codigo} nombre={boleta.nombre} backend idGuardado={id} />
    </main>
  );
}
