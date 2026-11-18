import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BOLSA, CORAZON } from "@/assets/emoji";
import { EDICION } from "@/data/nominados";
import { decodificar, FORMATOS, legible, limpiarNombre, type Formato, type PickLegible } from "@/lib/picks";

/**
 * GET /api/imagen?p=<codigo>&n=<nombre>&f=post|historia
 *
 * Genera la imagen "instagrameable" en el servidor con next/og (Satori):
 * escribes JSX con estilos inline y sale un PNG. Ojo: Satori solo entiende
 * flexbox (nada de grid) y cada <div> con varios hijos necesita display:flex.
 */

// Las fuentes no dependen de la petición: se leen una sola vez al cargar el módulo.
const carpeta = join(process.cwd(), "src/assets/fonts");
const fuentes = Promise.all([
  readFile(join(carpeta, "ArchivoBlack-Regular.ttf")),
  readFile(join(carpeta, "Inter-Medium.ttf")),
  readFile(join(carpeta, "Inter-ExtraBold.ttf")),
]);

const ORO = "#f5c451";
const FONDO = "#0b0a12";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const picks = legible(decodificar(searchParams.get("p")));
  const nombre = limpiarNombre(searchParams.get("n"));
  const formato: Formato = searchParams.get("f") === "historia" ? "historia" : "post";
  const { ancho, alto } = FORMATOS[formato];

  if (picks.length === 0) {
    return new Response("Boleta inválida", { status: 400 });
  }

  const [archivo, interMedium, interBold] = await fuentes;

  return new ImageResponse(<Boleta picks={picks} nombre={nombre} ancho={ancho} alto={alto} />, {
    width: ancho,
    height: alto,
    fonts: [
      { name: "Archivo", data: archivo, weight: 400, style: "normal" },
      { name: "Inter", data: interMedium, weight: 500, style: "normal" },
      { name: "Inter", data: interBold, weight: 800, style: "normal" },
    ],
    headers: {
      // La imagen de un código dado nunca cambia: que la CDN la guarde mucho tiempo.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

function Boleta({
  picks,
  nombre,
  ancho,
  alto,
}: {
  picks: PickLegible[];
  nombre: string;
  ancho: number;
  alto: number;
}) {
  const padding = 64;
  const alturaEncabezado = alto > 1500 ? 360 : 270;
  const alturaPie = 90;
  const columnas = picks.length > 8 ? 2 : 1;
  const filas = Math.ceil(picks.length / columnas);
  const espacio = 14;
  const alturaCuerpo = alto - padding * 2 - alturaEncabezado - alturaPie;
  const alturaFila = (alturaCuerpo - espacio * (filas - 1)) / filas;
  const anchoTarjeta = (ancho - padding * 2 - espacio * (columnas - 1)) / columnas;

  // Escala de letra según cuánto espacio tiene cada tarjeta.
  const letraPick = Math.round(Math.min(alturaFila * 0.25, columnas === 1 ? 40 : 28));
  const letraCategoria = Math.round(Math.max(14, letraPick * 0.62));

  const titulo = nombre ? `Los picks de ${nombre}` : "Mis picks";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding,
        backgroundColor: FONDO,
        backgroundImage: `radial-gradient(circle at 15% 0%, rgba(245,196,81,0.28), transparent 45%), radial-gradient(circle at 100% 100%, rgba(139,92,246,0.30), transparent 50%)`,
        color: "white",
        fontFamily: "Inter",
      }}
    >
      {/* Encabezado */}
      <div style={{ display: "flex", flexDirection: "column", height: alturaEncabezado }}>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 6,
            color: ORO,
            textTransform: "uppercase",
          }}
        >
          {`GOTY Picks · ${EDICION.nombre}`}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Archivo",
            fontSize: alto > 1500 ? 88 : 72,
            lineHeight: 1.05,
            marginTop: 18,
            textTransform: "uppercase",
          }}
        >
          {titulo}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22, fontSize: 26, color: "#c9c6d6" }}>
          <Icono src={CORAZON} tam={28} />
          <span style={{ marginRight: 24 }}>quiero que gane</span>
          <Icono src={BOLSA} tam={28} />
          <span>apostaría</span>
        </div>
      </div>

      {/* Tarjetas: repartidas en 1 o 2 columnas */}
      <div style={{ display: "flex", gap: espacio, height: alturaCuerpo }}>
        {Array.from({ length: columnas }, (_, c) => (
          <div key={c} style={{ display: "flex", flexDirection: "column", gap: espacio, width: anchoTarjeta }}>
            {picks.slice(c * filas, (c + 1) * filas).map((p) => (
              <Tarjeta
                key={p.categoria.id}
                pick={p}
                ancho={anchoTarjeta}
                alto={alturaFila}
                letraPick={letraPick}
                letraCategoria={letraCategoria}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pie */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          height: alturaPie,
          fontSize: 24,
          color: "#9b97ad",
        }}
      >
        <span>¿Y los tuyos? Arma tu boleta</span>
        <span style={{ color: ORO, fontWeight: 800 }}>10 · DIC · 2026</span>
      </div>
    </div>
  );
}

function Tarjeta({
  pick,
  ancho,
  alto,
  letraPick,
  letraCategoria,
}: {
  pick: PickLegible;
  ancho: number;
  alto: number;
  letraPick: number;
  letraCategoria: number;
}) {
  const mismo = pick.fav && pick.bet && pick.fav.titulo === pick.bet.titulo && pick.fav.detalle === pick.bet.detalle;
  const lineas: { iconos: string[]; texto: string }[] = mismo
    ? [{ iconos: [CORAZON, BOLSA], texto: pick.fav!.titulo }]
    : [
        { iconos: [CORAZON], texto: pick.fav?.titulo ?? "—" },
        { iconos: [BOLSA], texto: pick.bet?.titulo ?? "—" },
      ];
  const tamIcono = Math.round(letraPick * 0.95);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: ancho,
        height: alto,
        padding: "0 22px",
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: letraCategoria,
          fontWeight: 800,
          color: ORO,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          marginBottom: 4,
        }}
      >
        {pick.categoria.nombre}
      </div>
      {lineas.map((l, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", fontSize: letraPick, fontWeight: 800, lineHeight: 1.25 }}
        >
          <div style={{ display: "flex", gap: 4, width: (tamIcono + 4) * l.iconos.length + 10, flexShrink: 0 }}>
            {l.iconos.map((src, j) => (
              <Icono key={j} src={src} tam={tamIcono} />
            ))}
          </div>
          <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{l.texto}</span>
        </div>
      ))}
    </div>
  );
}

function Icono({ src, tam }: { src: string; tam: number }) {
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- Satori solo entiende <img>
  return <img src={src} width={tam} height={tam} />;
}
