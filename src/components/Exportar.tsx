"use client";

import { useState } from "react";
import Link from "next/link";
import { FORMATOS, urlImagen, type Formato } from "@/lib/picks";

/**
 * Vista previa de la imagen + botones para descargarla, compartirla y
 * (si Supabase está configurado) crear un link corto.
 */
export function Exportar({
  codigo,
  nombre,
  backend,
  idGuardado,
}: {
  codigo: string;
  nombre: string;
  backend: boolean;
  /** Si ya viene de /b/<id>, no hace falta volver a guardar. */
  idGuardado?: string;
}) {
  const [formato, setFormato] = useState<Formato>("historia");
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [idCorto, setIdCorto] = useState<string | null>(idGuardado ?? null);
  const linkCorto = (id: string) => `${window.location.origin}/b/${id}`;

  const src = urlImagen(codigo, nombre, formato);
  const archivo = `goty-picks-2026-${formato}.png`;

  async function obtenerArchivo(): Promise<File> {
    const res = await fetch(src);
    if (!res.ok) throw new Error("No se pudo generar la imagen");
    return new File([await res.blob()], archivo, { type: "image/png" });
  }

  async function descargar() {
    setOcupado(true);
    try {
      const file = await obtenerArchivo();
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = archivo;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setAviso("Ups, no se pudo descargar. Intenta otra vez.");
    } finally {
      setOcupado(false);
    }
  }

  // En el celular, "Compartir" abre el menú nativo (Instagram, WhatsApp...) con la imagen.
  async function compartir() {
    setOcupado(true);
    try {
      const file = await obtenerArchivo();
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Mis GOTY Picks 2026" });
      } else {
        await descargar();
        setAviso("Tu navegador no comparte imágenes directo; la descargamos para que la subas.");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setAviso("No se pudo compartir.");
    } finally {
      setOcupado(false);
    }
  }

  async function crearLink() {
    setOcupado(true);
    setAviso(null);
    try {
      const res = await fetch("/api/boletas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo, nombre }),
      });
      if (!res.ok) throw new Error();
      const { id } = (await res.json()) as { id: string };
      setIdCorto(id);
      await copiar(linkCorto(id));
    } catch {
      setAviso("No se pudo guardar la boleta. Intenta más tarde.");
    } finally {
      setOcupado(false);
    }
  }

  async function copiar(texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setAviso("Link copiado ✔");
    } catch {
      setAviso(texto);
    }
  }

  const { ancho, alto } = FORMATOS[formato];

  return (
    <section className="mt-10">
      <h2 className="text-sm font-bold uppercase tracking-widest text-oro">Llévatela a Instagram</h2>

      <div role="radiogroup" aria-label="Formato" className="mt-3 grid grid-cols-2 gap-2 rounded-full bg-panel p-1">
        {(Object.keys(FORMATOS) as Formato[]).map((f) => (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={formato === f}
            onClick={() => setFormato(f)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              formato === f ? "bg-white text-black" : "text-tenue"
            }`}
          >
            {FORMATOS[f].etiqueta}
          </button>
        ))}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element -- la imagen la genera nuestra propia API */}
      <img
        key={src}
        src={src}
        width={ancho}
        height={alto}
        alt="Vista previa de tu boleta"
        className="mx-auto mt-4 h-auto w-full max-w-sm rounded-2xl border border-borde bg-panel"
      />

      <div className="mt-4 grid gap-3">
        <button
          type="button"
          onClick={compartir}
          disabled={ocupado}
          className="rounded-full bg-oro px-6 py-4 font-bold text-black disabled:opacity-50"
        >
          Compartir imagen
        </button>
        <button
          type="button"
          onClick={descargar}
          disabled={ocupado}
          className="rounded-full border border-borde px-6 py-4 font-semibold disabled:opacity-50"
        >
          Descargar PNG
        </button>

        {backend &&
          (idCorto ? (
            <button
              type="button"
              onClick={() => copiar(linkCorto(idCorto))}
              className="rounded-full border border-borde px-6 py-4 font-semibold"
            >
              🔗 Copiar link: /b/{idCorto}
            </button>
          ) : (
            <button
              type="button"
              onClick={crearLink}
              disabled={ocupado}
              className="rounded-full border border-borde px-6 py-4 font-semibold disabled:opacity-50"
            >
              🔗 Crear link para compartir
            </button>
          ))}

        <Link
          href={`/?${new URLSearchParams(nombre ? { p: codigo, n: nombre } : { p: codigo })}`}
          className="py-2 text-center text-sm text-tenue underline underline-offset-4"
        >
          Editar mis picks
        </Link>
      </div>

      {aviso && (
        <p role="status" className="mt-3 break-all text-center text-sm text-tenue">
          {aviso}
        </p>
      )}
    </section>
  );
}
