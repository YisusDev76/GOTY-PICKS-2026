/**
 * Nominados oficiales de The Game Awards 2026 (anunciados el 17 de noviembre de 2026).
 *
 * Fuentes cruzadas:
 *  - https://gameinformer.com/2026/11/17/here-are-the-nominees-for-the-game-awards-2026
 *  - https://www.theouterhaven.net/the-game-awards-2026-nominees-full-list/
 *
 * ⚠️ IMPORTANTE: el ORDEN de las categorías y de los nominados se usa para codificar
 * las boletas en la URL (ver src/lib/picks.ts). Si cambias el orden después de que
 * alguien comparta su boleta, su link mostrará otros juegos. Para agregar algo,
 * hazlo siempre AL FINAL de la lista.
 *
 * Portadas: pon la imagen en /public/portadas/ y escribe la ruta en `portada`
 * (por ejemplo "/portadas/gta6.jpg"). Si no hay portada, la app dibuja una tarjeta
 * con las iniciales del juego.
 */

export type Nominado = {
  titulo: string;
  /** Texto secundario: juego del actor, equipo del jugador, etc. */
  detalle?: string;
  portada?: string;
};

export type Categoria = {
  /** Identificador estable, en minúsculas y sin espacios. */
  id: string;
  nombre: string;
  nombreOriginal: string;
  /** Posición en el ranking de "principales" (1 = la más importante). */
  principal?: number;
  nominados: Nominado[];
};

const n = (titulo: string, detalle?: string): Nominado =>
  detalle ? { titulo, detalle } : { titulo };

export const EDICION = {
  nombre: "The Game Awards 2026",
  fechaCeremonia: "2026-12-10",
};

export const CATEGORIAS: Categoria[] = [
  {
    id: "goty",
    nombre: "Juego del Año",
    nombreOriginal: "Game of the Year",
    principal: 1,
    nominados: [
      n("007 First Light"),
      n("Control Resonant"),
      n("Grand Theft Auto VI"),
      n("Phantom Blade Zero"),
      n("Resident Evil Requiem"),
      n("The Legend of Zelda: Ocarina of Time"),
    ],
  },
  {
    id: "direccion",
    nombre: "Mejor Dirección",
    nombreOriginal: "Best Game Direction",
    principal: 2,
    nominados: [
      n("Control Resonant"),
      n("Grand Theft Auto VI"),
      n("Phantom Blade Zero"),
      n("Pragmata"),
      n("Resident Evil Requiem"),
    ],
  },
  {
    id: "narrativa",
    nombre: "Mejor Narrativa",
    nombreOriginal: "Best Narrative",
    principal: 3,
    nominados: [
      n("007 First Light"),
      n("Control Resonant"),
      n("Grand Theft Auto VI"),
      n("Resident Evil Requiem"),
      n("The Blood of Dawnwalker"),
    ],
  },
  {
    id: "arte",
    nombre: "Mejor Dirección de Arte",
    nombreOriginal: "Best Art Direction",
    principal: 4,
    nominados: [
      n("Control Resonant"),
      n("Grand Theft Auto VI"),
      n("Mouse: P.I. for Hire"),
      n("Phantom Blade Zero"),
      n("The Legend of Zelda: Ocarina of Time"),
    ],
  },
  {
    id: "musica",
    nombre: "Mejor Banda Sonora",
    nombreOriginal: "Best Score and Music",
    principal: 5,
    nominados: [
      n("Ace Combat 8: Wings of Theve"),
      n("Grand Theft Auto VI"),
      n("Mixtape"),
      n("Phantom Blade Zero"),
      n("The Legend of Zelda: Ocarina of Time"),
    ],
  },
  {
    id: "audio",
    nombre: "Mejor Diseño de Audio",
    nombreOriginal: "Best Audio Design",
    principal: 9,
    nominados: [
      n("Ace Combat 8: Wings of Theve"),
      n("Control Resonant"),
      n("Grand Theft Auto VI"),
      n("Resident Evil Requiem"),
      n("Star Wars: Galactic Racer"),
    ],
  },
  {
    id: "actuacion",
    nombre: "Mejor Actuación",
    nombreOriginal: "Best Performance",
    principal: 6,
    nominados: [
      n("Angela Sant'Albano", "Resident Evil Requiem"),
      n("Liam McIntyre", "Marvel's Wolverine"),
      n("Manni L. Perez", "Grand Theft Auto VI"),
      n("Patrick Gibson", "007 First Light"),
      n("Rahul Kohli", "Saros"),
    ],
  },
  {
    id: "impacto",
    nombre: "Juego de Impacto",
    nombreOriginal: "Games for Impact",
    nominados: [
      n("Big Walk"),
      n("Cairn"),
      n("Forever Ago"),
      n("Life Is Strange: Reunion"),
      n("Lily's World XD"),
      n("Mixtape"),
    ],
  },
  {
    id: "accesibilidad",
    nombre: "Innovación en Accesibilidad",
    nombreOriginal: "Innovation in Accessibility",
    nominados: [
      n("Assassin's Creed Black Flag Resynced"),
      n("Forza Horizon 6"),
      n("Gears of War: E-Day"),
      n("Marvel's Wolverine"),
      n("Rhythm Heaven Groove"),
    ],
  },
  {
    id: "continuo",
    nombre: "Mejor Juego Continuo",
    nombreOriginal: "Best Ongoing Game",
    nominados: [
      n("ARC Raiders"),
      n("Final Fantasy XIV"),
      n("Fortnite"),
      n("No Man's Sky"),
      n("The Witcher 3: Wild Hunt"),
    ],
  },
  {
    id: "comunidad",
    nombre: "Mejor Apoyo a la Comunidad",
    nombreOriginal: "Best Community Support",
    nominados: [
      n("Crimson Desert"),
      n("Helldivers 2"),
      n("No Man's Sky"),
      n("The Witcher 3: Wild Hunt"),
      n("Warframe"),
    ],
  },
  {
    id: "indie",
    nombre: "Mejor Juego Independiente",
    nombreOriginal: "Best Independent Game",
    principal: 7,
    nominados: [
      n("Big Walk"),
      n("Cairn"),
      n("Denshattack!"),
      n("Mewgenics"),
      n("Mina the Hollower"),
    ],
  },
  {
    id: "indie-debut",
    nombre: "Mejor Debut Indie",
    nombreOriginal: "Best Debut Indie Game",
    nominados: [
      n("Dressmaker"),
      n("Esoteric Ebb"),
      n("Orbitals"),
      n("Replaced"),
      n("Silver Pines"),
    ],
  },
  {
    id: "movil",
    nombre: "Mejor Juego Móvil",
    nombreOriginal: "Best Mobile Game",
    nominados: [
      n("Arknights: Endfield"),
      n("Monster Hunter Outlanders"),
      n("Neverness to Everness"),
      n("Pokémon Champions"),
      n("Where Winds Meet"),
    ],
  },
  {
    id: "vr",
    nombre: "Mejor Juego VR / AR",
    nombreOriginal: "Best VR / AR",
    nominados: [
      // Forefront aparece en algunas listas y en otras no: verifícalo en thegameawards.com.
      n("Forefront"),
      n("Into the Radius 2"),
      n("Little Nightmares VR: Altered Echoes"),
      n("Teenage Mutant Ninja Turtles: Empire City"),
      n("Thief VR: Legacy of Shadow"),
    ],
  },
  {
    id: "accion",
    nombre: "Mejor Juego de Acción",
    nombreOriginal: "Best Action Game",
    principal: 10,
    nominados: [
      n("Ace Combat 8: Wings of Theve"),
      n("Gears of War: E-Day"),
      n("Onimusha: Way of the Sword"),
      n("Phantom Blade Zero"),
      n("Saros"),
    ],
  },
  {
    id: "accion-aventura",
    nombre: "Mejor Acción / Aventura",
    nombreOriginal: "Best Action / Adventure",
    principal: 8,
    nominados: [
      n("007 First Light"),
      n("Control Resonant"),
      n("Grand Theft Auto VI"),
      n("Pragmata"),
      n("Resident Evil Requiem"),
      n("The Legend of Zelda: Ocarina of Time"),
    ],
  },
  {
    id: "rpg",
    nombre: "Mejor RPG",
    nombreOriginal: "Best Role Playing",
    nominados: [
      n("Final Fantasy Resonance"),
      n("Fire Emblem: Fortune's Weave"),
      n("Monster Hunter Stories 3: Twisted Reflection"),
      n("The Blood of Dawnwalker"),
      n("Trails in the Sky 2nd Chapter"),
    ],
  },
  {
    id: "pelea",
    nombre: "Mejor Juego de Pelea",
    nombreOriginal: "Best Fighting",
    nominados: [
      n("2XKO"),
      n("Avatar Legends: The Fighting Game"),
      n("Invincible VS"),
      n("Marvel Tōkon: Fighting Souls"),
      n("My Hero Academia: All's Justice"),
    ],
  },
  {
    id: "familiar",
    nombre: "Mejor Juego Familiar",
    nombreOriginal: "Best Family",
    nominados: [
      n("Big Walk"),
      n("LEGO Batman: Legacy of the Dark Knight"),
      n("Nintendo Switch Sports Resort"),
      n("Pokémon Pokopia"),
      n("Yoshi and the Mysterious Book"),
    ],
  },
  {
    id: "estrategia",
    nombre: "Mejor Simulación / Estrategia",
    nombreOriginal: "Best Sim / Strategy",
    nominados: [
      n("Mewgenics"),
      n("Planet Zoo 2"),
      n("Pokémon Pokopia"),
      n("Slay the Spire 2"),
      n("Star Wars Zero Company"),
    ],
  },
  {
    id: "deportes",
    nombre: "Mejor Deportes / Carreras",
    nombreOriginal: "Best Sports / Racing",
    nominados: [
      n("EA Sports FC 27"),
      n("Forza Horizon 6"),
      n("Nintendo Switch Sports Resort"),
      n("Screamer"),
      n("Star Wars: Galactic Racer"),
    ],
  },
  {
    id: "multijugador",
    nombre: "Mejor Multijugador",
    nombreOriginal: "Best Multiplayer",
    nominados: [
      n("Big Walk"),
      n("Call of Duty: Modern Warfare 4"),
      n("Gears of War: E-Day"),
      n("Marathon"),
      n("Meccha Chameleon"),
      n("Orbitals"),
    ],
  },
  {
    id: "adaptacion",
    nombre: "Mejor Adaptación",
    nombreOriginal: "Best Adaptation",
    nominados: [
      n("Cyberpunk: Edgerunners 2"),
      n("Fallout (Temporada 2)"),
      n("Mortal Kombat II"),
      n("Resident Evil"),
      n("The Super Mario Galaxy Movie"),
    ],
  },
  {
    id: "creacion",
    nombre: "Mejor Creación de Usuarios",
    nombreOriginal: "Best User Creation",
    nominados: [
      n("A Dream of Silence: Revamped", "Baldur's Gate 3"),
      n("Create Aeronautics", "Minecraft"),
      n("Nopixel V", "Grand Theft Auto Online"),
      n("Star Wars Droid Tycoon", "Fortnite"),
      n("TTK", "Roblox"),
    ],
  },
  {
    id: "creador",
    nombre: "Creador de Contenido del Año",
    nombreOriginal: "Content Creator of the Year",
    nominados: [
      n("CDawg"),
      n("Cellbit"),
      n("IShowSpeed"),
      n("LilSimsie"),
      n("OhnePixel"),
    ],
  },
  {
    id: "esports-atleta",
    nombre: "Mejor Atleta de Esports",
    nombreOriginal: "Best Esports Athlete",
    nominados: [
      n("Chovy", "Gen.G"),
      n("Donk", "Team Spirit"),
      n("Erde", "LOUD"),
      n("Yatoro", "Team Spirit"),
      n("ZywOo", "Team Vitality"),
    ],
  },
  {
    id: "esports-juego",
    nombre: "Mejor Juego de Esports",
    nombreOriginal: "Best Esports Game",
    nominados: [
      n("Counter-Strike 2"),
      n("Dota 2"),
      n("League of Legends"),
      n("Mobile Legends: Bang Bang"),
      n("Valorant"),
    ],
  },
  {
    id: "esports-equipo",
    nombre: "Mejor Equipo de Esports",
    nombreOriginal: "Best Esports Team",
    nominados: [
      n("Gen.G", "League of Legends"),
      n("LOUD", "Valorant"),
      n("Team Falcons", "Counter-Strike 2"),
      n("Team Falcons", "Rocket League"),
      n("Team Spirit", "Dota 2"),
      n("Team Vitality", "Counter-Strike 2"),
    ],
  },
  {
    id: "anticipado",
    nombre: "Juego Más Esperado",
    nombreOriginal: "Most Anticipated Game",
    nominados: [
      n("Fable"),
      n("Final Fantasy VII Revelation"),
      n("God of War Laufey"),
      n("Resident Evil Veronica"),
      n("The Witcher 4"),
    ],
  },
];

/** Categorías ordenadas por importancia (las que tienen `principal`). */
export function categoriasPrincipales(cuantas: number): Categoria[] {
  return CATEGORIAS.filter((c) => c.principal !== undefined)
    .sort((a, b) => a.principal! - b.principal!)
    .slice(0, cuantas);
}
