# GOTY Picks 2026 🏆

App web (mobile first) para armar tus predicciones de **The Game Awards 2026** (10 de diciembre de 2026).
En cada categoría eliges dos cosas:

- ❤️ **Quiero que gane**: tu favorito personal.
- 💰 **Apostaría por**: el que crees que de verdad se lleva el premio.

Al final ves tu boleta en la app y la exportas como imagen lista para Instagram (post 4:5 o historia 9:16).

> Proyecto de fans, sin relación oficial con The Game Awards.

## Cómo funciona

1. **Eliges cuántas categorías**: las 5 principales, las 10 principales, todas (30) o manual.
2. **Armas la boleta**: portadas grandes con el nombre debajo y dos botones por nominado (❤️ y 💰).
   Lo que llevas se guarda solo en tu navegador (`localStorage`), así que puedes cerrar y volver.
3. **Ves tu resultado** en `/resultado?p=...`. Ese link ya contiene tus picks, así que funciona
   aunque no haya base de datos.
4. **Exportas la imagen**: "Compartir imagen" abre el menú nativo del celular (Instagram, WhatsApp...)
   y "Descargar PNG" la baja.
5. **Link corto (opcional, usa Supabase)**: guarda tu boleta y te da un link `/b/abc123xy`.
   Al pegarlo en WhatsApp o X sale la imagen como vista previa.

## Stack y por qué

| Pieza | Qué es | Por qué |
| --- | --- | --- |
| [Next.js 16](https://nextjs.org) (App Router) | Framework de React con frontend y backend en el mismo proyecto | Las páginas y la API viven juntas; Vercel lo despliega sin configuración |
| TypeScript | JavaScript con tipos | Atrapa errores antes de correr (parecido a tener un esquema en Spark) |
| Tailwind CSS | Clases de utilidad para estilos (`px-4`, `rounded-full`...) | Se escribe mobile first por defecto: lo base es celular y `sm:` agranda para pantallas más anchas |
| `next/og` | Genera PNG en el servidor a partir de JSX | La imagen sale igual en cualquier celular, sin depender del navegador |
| [Supabase](https://supabase.com) | Postgres administrado con API | Plan gratis; solo se usa para los links cortos |
| [Vercel](https://vercel.com) | Hosting | Plan Hobby gratis, despliega cada push de GitHub |

### Costo: $0

- **Vercel Hobby**: gratis para proyectos personales. Cubre de sobra un proyecto de portafolio.
- **Supabase Free**: 500 MB de base de datos. Cada boleta pesa ~150 bytes, o sea, millones de boletas.
  Ojo: un proyecto gratis se **pausa tras 1 semana sin actividad**; se reactiva desde el panel.
- La app **funciona sin Supabase**: si no configuras las variables, simplemente no aparece el botón de link corto.

## Estructura

```
src/
  data/nominados.ts        ← Lista oficial de categorías y nominados (edítala aquí)
  lib/picks.ts             ← Tipos y codificación de la boleta en la URL
  lib/supabase.ts          ← Cliente de Supabase (solo servidor)
  components/
    ArmarBoleta.tsx        ← Pasos 1 y 2: elegir categorías y marcar ❤️/💰 (Client Component)
    Portada.tsx            ← Portada del juego, o tarjeta con iniciales si no hay imagen
    VistaBoleta.tsx        ← La boleta en la app
    Exportar.tsx           ← Vista previa de la imagen + compartir / descargar / link corto
  app/
    page.tsx               ← "/"
    resultado/page.tsx     ← "/resultado?p=...&n=..."
    b/[id]/page.tsx        ← "/b/<id>" boleta guardada en Supabase
    api/imagen/route.tsx   ← GET  → PNG para Instagram
    api/boletas/route.ts   ← POST → guarda la boleta y devuelve el id corto
supabase/schema.sql        ← Tabla y permisos (Row Level Security)
```

**Cómo se guarda una boleta en la URL**: 3 caracteres por categoría → `[categoría][❤️][💰]` usando la
posición en `nominados.ts` (en base 36, `_` = sin elegir). Ejemplo: `p=023` = Juego del Año, ❤️ el
nominado 2 y 💰 el nominado 3. Por eso **no cambies el orden** de categorías ni nominados: agrega al final.

**Server vs Client Components** (repaso rápido): en Next.js los componentes corren en el servidor por
defecto. Solo los que llevan `"use client"` (como `ArmarBoleta` y `Exportar`) se mandan al navegador,
porque usan estado (`useState`) o APIs del navegador (`localStorage`, `navigator.share`).

## Correr en tu compu

Necesitas Node.js 20 o más.

```bash
npm install
npm run dev
# abre http://localhost:3000 (en el celular: http://<IP-de-tu-compu>:3000 en la misma red)
```

Otros comandos: `npm run build` (compila como en producción) y `npm run lint` (revisa el código).

## Configurar Supabase (opcional, para links cortos)

1. Crea una cuenta en [supabase.com](https://supabase.com) y un proyecto nuevo (plan Free).
   Elige la región más cercana a tus usuarios.
2. En el proyecto ve a **SQL Editor**, pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y dale **Run**.
3. Ve a **Project Settings → API** y copia:
   - **Project URL** → `SUPABASE_URL`
   - La llave **anon / public** → `SUPABASE_ANON_KEY`
4. Para desarrollo local, copia `.env.example` como `.env.local` y pega los valores.
   `.env.local` no se sube a git.

La llave *anon* es pública por diseño; lo que protege los datos son las políticas de
Row Level Security del `schema.sql`: cualquiera puede crear y leer boletas, nadie puede editarlas ni borrarlas.

## Publicar en Vercel

1. Entra a [vercel.com](https://vercel.com) con tu cuenta de GitHub (plan Hobby).
2. **Add New → Project** → importa `GOTY-PICKS-2026`. Detecta Next.js solo; no cambies nada.
3. En **Environment Variables** agrega `SUPABASE_URL` y `SUPABASE_ANON_KEY` (si configuraste Supabase).
4. **Deploy**. Cada push a la rama principal publica una nueva versión, y cada PR tiene su propio link de vista previa.

## Agregar portadas

Por ahora cada nominado se muestra con una tarjeta de color y sus iniciales. Para poner portadas reales:

1. Guarda la imagen en `public/portadas/` (por ejemplo `public/portadas/gta6.jpg`, vertical 3:4 de preferencia).
2. En `src/data/nominados.ts` agrega la ruta: `{ titulo: "Grand Theft Auto VI", portada: "/portadas/gta6.jpg" }`.

Las portadas son material con derechos de sus editoras; para un proyecto de fans usa imágenes de prensa oficiales.

## Fuente de los nominados

Lista anunciada el 17 de noviembre de 2026, cruzada entre
[Game Informer](https://gameinformer.com/2026/11/17/here-are-the-nominees-for-the-game-awards-2026) y
[The Outer Haven](https://www.theouterhaven.net/the-game-awards-2026-nominees-full-list/).
*Forefront* (VR/AR) aparece en una fuente y en la otra no: conviene confirmarlo en thegameawards.com.

## Créditos

- Fuentes: Archivo Black e Inter (SIL Open Font License), incluidas en `src/assets/fonts`.
- Emojis de la imagen: [Twemoji](https://github.com/jdecked/twemoji) (CC-BY 4.0).

## Ideas para después

- Estadísticas de la comunidad ("el 62% apuesta por GTA VI") con una vista SQL sobre `boletas`.
- Modo resultados después del 10 de diciembre: marcar ganadores y calcular tu puntaje.
- Portadas reales y límite de peticiones en `/api/boletas` si el tráfico crece.
