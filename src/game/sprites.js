/*
- ============================================================
-  PERSONAJES EN PIXEL ART — POLÍTICOS Y VILLANAS
- ============================================================
-  Cada personaje es una cuadrícula de texto (12 columnas x 13 filas).
-  Cada letra es un color definido en su "palette".
-  El punto "." es transparente.
-
-  Para crear un personaje nuevo:
-    1. Copia uno existente.
-    2. Cambia su id, name y colores en "palette".
-    3. "Píntalo" cambiando las letras del "map".
-  Todas las filas deben tener el mismo largo (12 caracteres).
-
-  Letras comunes:
-    K = contorno   W = blanco   S = piel
- ============================================================
 */

const BASE = {
  K: "#140c2b",
  W: "#ffffff",
  S: "#f3c79a",
};

// ---------------------- POLÍTICOS ----------------------
export const HEROES = [
  {
    id: "politico_p",
    name: "Señor Posky",
    power: "Discurso hipnótico",
    color: "#2f6bff",
    palette: { B: "#1c3b87", R: "#d92338", E: "#1a1a2e" },
    map: [
      "...KKKKKK...",
      "..KSSSSSSK..",
      "..KSKEEKEK..",
      "..KSKEEKEK..",
      "..KSSSSSSK..",
      "...KSSSSK...",
      ".KBBBWWBBBK.",
      "KBBBBRBBBBBK",
      "KBBBPPRBBBBK",
      ".KBBBPKBBBK.",
      "..KBBBBBBK..",
      "..KEEKKEEK..",
      "...K....K...",
    ],
  },
  {
    id: "politica_l",
    name: "Señorita L",
    power: "Veto ejecutivo",
    color: "#9c27b0",
    palette: { M: "#8e24aa", H: "#5d4037", L: "#e1bee7" },
    map: [
      "..KKHHHHKK..",
      ".KHHHHHHHHK.",
      ".KHWKSSKWHK.",
      ".KHHSSSSHHK.",
      "..KKSSSSKK..",
      "...KWWWWK...",
      ".KMMMMMMMMK.",
      "KMMMMLMMMMMK",
      "KMMMMLMMMMMK",
      ".KMMMLLLLMK.",
      "..KMMMMMMK..",
      "..KMMKKMMK..",
      "...K....K...",
    ],
  },
  {
    id: "politico_a",
    name: "Armando",
    power: "Fuerza de campaña",
    color: "#2e7d32",
    palette: { G: "#1b5e20", O: "#ffb300", H: "#3e2723" },
    map: [
      "..KKHHHHKK..",
      ".KHHHHHHHHK.",
      ".KHSSSSSSHHK",
      ".KHSWSSWSHK.",
      "..KHSSSSHK..",
      "...KSSSSK...",
      "KKGGGGGGGGKK",
      "KGGGGOOGGGGK",
      "KGAAAKAGGGGK",
      ".KGAAAGGGKK.",
      "..KGGGGGGK..",
      "..KGGKKGGK..",
      "...K....K...",
    ],
  },
];

// ---------------------- VILLANAS ----------------------
export const VILLAINS = [
  {
    id: "scarlet",
    name: "Scarlet Glam",
    crime: "Ojos lindos",
    color: "#e91e63",
    palette: { R: "#c2185b", Y: "#fdd835", E: "#1a1a1a" },
    map: [
      "..KKYYYYKK..",
      ".KYYYYYYYYK.",
      ".KYEKSSKEYK.",
      ".KYYSSSSYYK.",
      "..KKSSSSKK..",
      "...KSSSSK...",
      ".KRRRRRRRRK.",
      "KRRRRRRRRRRK",
      "KRRRRRRRRRRK",
      ".KKRRRRRRKK.",
      "..KRRRRRRK..",
      "..KEEKKEEK..",
      "...K....K...",
    ],
  },
  {
    id: "violet",
    name: "Lady Violet",
    crime: "Fuerza Publica",
    color: "#7b1fa2",
    palette: { V: "#6a1b9a", B: "#121212", L: "#ba68c8" },
    map: [
      "..KKBBBBKK..",
      ".KBBBBBBBBK.",
      ".KBBWSSWBK..",
      ".KBBSSSSBK..",
      "..KKSSSSKK..",
      "...KSSSSK...",
      ".KVVVVVVVVK.",
      "KVVVVVVVVVVK",
      "KVVVLVVLVVVK",
      ".KKVVVVVVKK.",
      "..KVVVVVVK..",
      "..KBBKKBBK..",
      "...K....K...",
    ],
  },
  {
    id: "siren",
    name: "Sirena Esmeralda",
    crime: "Sin titulos universitarios",
    color: "#00bfa5",
    palette: { E: "#00897b", F: "#d84315", Y: "#ffd54f" },
    map: [
      "..KKFFFFKK..",
      ".KFFFFFFFFK.",
      ".KFFWSSWFFK.",
      ".KFFSSSSFFK.",
      "..KKSSSSKK..",
      "...KSSSSK...",
      ".KEEEEEEEEK.",
      "KEEEEEEEEEEK",
      "KEEEYYEEYEEK",
      ".KKEEEEEEKK.",
      "..KEEEEEEK..",
      "..KKK..KKK..",
      "............",
    ],
  },
  {
    id: "catya",
    name: "Catya Sombra",
    crime: "solo viaja en helicoptero",
    color: "#37474f",
    palette: { D: "#212121", G: "#cfd8dc", E: "#000000" },
    map: [
      "..KDD..DDK..",
      "..KDDDDDDK..",
      ".KDDEKKEEDK.",
      ".KDDSSSSDDK.",
      "..KKSSSSKK..",
      "...KSSSSK...",
      ".KDDDDDDDDK.",
      "KDDDDDDDDDDK",
      "KDDDDDDDDDDK",
      ".KKDDDDDDKK.",
      "..KDDDDDDK..",
      "..KDDKKDDK..",
      "...K....K...",
    ],
  },
  {
    id: "blaze",
    name: "Ruby Flame",
    crime: "Congresista",
    color: "#ff3d00",
    palette: { R: "#d50000", F: "#ff6d00", O: "#ffab00" },
    map: [
      "..KKFFFFKK..",
      ".KFFFFFFFFK.",
      ".KFFWSSWFFK.",
      ".KFFSSSSFFK.",
      "..KKSSSSKK..",
      "...KSSSSK...",
      ".KRRRRRRRRK.",
      "KRROORROORKK",
      "KRRRRRRRRRRK",
      ".KKRRRRRRKK.",
      "..KRRRRRRK..",
      "..KROKKROK..",
      "...K....K...",
    ],
  },
];

// ---------------------- OBJETOS ----------------------
export const ITEMS = {
  star: {
    id: "star",
    palette: { Y: "#ffe14a", O: "#ff9d1f" },
    map: [
      ".....KK.....",
      "....KYYK....",
      "....KYYK....",
      "KKKKKYYKKKKK",
      "KYYYYYYYYYYK",
      ".KYYYOOYYYK.",
      "..KYYYYYYK..",
      "..KYYKKYYK..",
      ".KYYK..KYYK.",
      ".KYK....KYK.",
      ".KK......KK.",
      "............",
      "............",
    ],
  },
  medal: {
    id: "medal",
    palette: { R: "#ff3b5c", B: "#3aa0ff", O: "#ffc933", Y: "#fff35c" },
    map: [
      "..KK....KK..",
      "..KRK..KBK..",
      "...KRKKBK...",
      "....KRBK....",
      "...KKKKKK...",
      "..KOOOOOOK..",
      ".KOOYYYYOOK.",
      ".KOYYOOYYOK.",
      ".KOYYOOYYOK.",
      ".KOOYYYYOOK.",
      "..KOOOOOOK..",
      "...KKKKKK...",
      "............",
    ],
  },
  bomb: {
    id: "bomb",
    palette: { D: "#3a2d5c", G: "#6d5fa0", F: "#ff9d1f", Y: "#ffe14a" },
    map: [
      ".........Y..",
      "........YF..",
      ".......KF...",
      "......KK....",
      "...KKKKKK...",
      "..KDDDDDDK..",
      ".KDGGDDDDDK.",
      ".KDGDDDDDDK.",
      ".KDDDDDDDDK.",
      ".KDDDDDDDDK.",
      "..KDDDDDDK..",
      "...KKKKKK...",
      "............",
    ],
  },
};

// ---------------- Render con caché (rápido) ----------------
const cache = new Map();

export function getSpriteCanvas(sprite, px = 2, flip = false) {
  const key = `${sprite.id}-${px}-${flip}`;
  if (cache.has(key)) return cache.get(key);

  const palette = { ...BASE, ...sprite.palette };
  const rows = sprite.map.length;
  const cols = sprite.map[0].length;
  const cv = document.createElement("canvas");
  cv.width = cols * px;
  cv.height = rows * px;
  const ctx = cv.getContext("2d");

  sprite.map.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === ".") continue;
      ctx.fillStyle = palette[ch] || "#ff00ff";
      const cc = flip ? cols - 1 - c : c;
      ctx.fillRect(cc * px, r * px, px, px);
    }
  });

  cache.set(key, cv);
  return cv;
}