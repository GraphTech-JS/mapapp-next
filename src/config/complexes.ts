export type Building = [x: number, y: number, w: number, d: number, h: number, biz?: boolean];
export type Layout = {
  roads: { x: number; y: number; w: number; h: number; dir: "h" | "v" }[];
  park: { x: number; y: number; w: number; h: number };
  route: string;
  buildings: Building[];
  pinBuildings: number[];
};

export type ComplexGeo = {
  latitude: number;
  longitude: number;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: "UA";
};

export const LAYOUTS: Record<"a" | "b", Layout> = {
  a: {
    roads: [{ x: 0, y: 200, w: 440, h: 36, dir: "h" }, { x: 256, y: 0, w: 32, h: 440, dir: "v" }],
    park: { x: 180, y: 110, w: 62, h: 72 },
    route: "M60 218 H272 V300 H330",
    buildings: [
      [30, 30, 70, 150, 96], [110, 30, 120, 60, 72], [110, 110, 60, 70, 50],
      [300, 30, 110, 60, 118, true], [300, 110, 50, 70, 66], [365, 110, 45, 70, 84],
      [30, 255, 90, 60, 80, true], [30, 330, 60, 80, 58], [140, 255, 90, 150, 128],
      [300, 255, 110, 55, 72], [300, 325, 60, 85, 104, true], [370, 325, 40, 85, 50],
    ],
    pinBuildings: [3, 6, 10, 0, 8],
  },
  b: {
    roads: [{ x: 0, y: 120, w: 440, h: 32, dir: "h" }, { x: 150, y: 0, w: 32, h: 440, dir: "v" }],
    park: { x: 20, y: 320, w: 110, h: 100 },
    route: "M40 136 H166 V300 H200",
    buildings: [
      [20, 20, 110, 80, 90], [200, 20, 70, 80, 124, true], [290, 20, 130, 40, 64], [290, 70, 60, 40, 80],
      [20, 170, 50, 130, 110, true], [80, 170, 50, 60, 60], [80, 240, 50, 60, 72],
      [200, 170, 220, 50, 96], [200, 240, 60, 180, 136, true], [280, 240, 60, 90, 58],
      [360, 240, 60, 180, 86, true], [280, 350, 60, 70, 66],
    ],
    pinBuildings: [1, 4, 8, 0, 10],
  },
};

export const COMPLEXES = [
  {
    id: "varshavskyi",
    layout: "a",
    geo: {
      latitude: 50.5018,
      longitude: 30.4148,
      streetAddress: "просп. Європейського Союзу",
      addressLocality: "Київ",
      addressRegion: "Київ",
      postalCode: "04213",
      addressCountry: "UA",
    },
  },
  {
    id: "dibrova",
    layout: "b",
    geo: {
      latitude: 50.4915,
      longitude: 30.419,
      streetAddress: "вул. Віктора Некрасова, 57",
      addressLocality: "Київ",
      addressRegion: "Київ",
      postalCode: "04136",
      addressCountry: "UA",
    },
  },
] as const satisfies readonly { id: string; layout: keyof typeof LAYOUTS; geo: ComplexGeo }[];

export type ComplexId = (typeof COMPLEXES)[number]["id"];
