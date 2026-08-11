import { Engine } from "caelus";
import { embeddedData } from "caelus/data-embedded";
import { Solar } from "lunar-typescript";

export type BirthInput = {
  date: string;
  time?: string;
  place?: string;
  timezoneOffset: number;
};

export type AstrologyFacts = {
  birthLabel: string;
  precision: "date" | "time" | "full";
  western: { title: string; facts: string[] };
  thai: { title: string; facts: string[] };
  chinese: { title: string; facts: string[] };
  notes: string[];
};

type Coordinates = { lat: number; lon: number; label: string };

const engine = new Engine(embeddedData);
const signsTh = ["เมษ", "พฤษภ", "เมถุน", "กรกฎ", "สิงห์", "กันย์", "ตุล", "พิจิก", "ธนู", "มังกร", "กุมภ์", "มีน"];
const bodiesTh: Record<string, string> = {
  sun: "อาทิตย์", moon: "จันทร์", mercury: "พุธ", venus: "ศุกร์", mars: "อังคาร",
  jupiter: "พฤหัสบดี", saturn: "เสาร์", uranus: "ยูเรนัส", neptune: "เนปจูน", pluto: "พลูโต",
};
const aspectsTh: Record<string, string> = {
  conjunction: "กุม", opposition: "เล็ง", square: "ฉาก", trine: "ตรีโกณ", sextile: "โยคหน้า",
};
const chineseElements: Record<string, string> = { 木: "ไม้", 火: "ไฟ", 土: "ดิน", 金: "ทอง", 水: "น้ำ" };
const ganElements: Record<string, string> = {
  甲: "ไม้หยาง", 乙: "ไม้หยิน", 丙: "ไฟหยาง", 丁: "ไฟหยิน", 戊: "ดินหยาง",
  己: "ดินหยิน", 庚: "ทองหยาง", 辛: "ทองหยิน", 壬: "น้ำหยาง", 癸: "น้ำหยิน",
};

const knownPlaces: Array<[RegExp, Coordinates]> = [
  [/กรุงเทพ|bangkok|ราชวิถี|rajavithi/i, { lat: 13.7563, lon: 100.5018, label: "กรุงเทพมหานคร" }],
  [/สมุทรสงคราม|samut songkhram/i, { lat: 13.4098, lon: 100.0023, label: "สมุทรสงคราม" }],
  [/ชลบุรี|chonburi|pattaya|พัทยา/i, { lat: 13.3611, lon: 100.9847, label: "ชลบุรี" }],
  [/เชียงใหม่|chiang mai/i, { lat: 18.7883, lon: 98.9853, label: "เชียงใหม่" }],
  [/เชียงราย|chiang rai/i, { lat: 19.9105, lon: 99.8406, label: "เชียงราย" }],
  [/นครราชสีมา|โคราช|nakhon ratchasima|korat/i, { lat: 14.9799, lon: 102.0978, label: "นครราชสีมา" }],
  [/ขอนแก่น|khon kaen/i, { lat: 16.4322, lon: 102.8236, label: "ขอนแก่น" }],
  [/อุดรธานี|udon thani/i, { lat: 17.4138, lon: 102.7872, label: "อุดรธานี" }],
  [/อุบลราชธานี|ubon ratchathani/i, { lat: 15.2447, lon: 104.8473, label: "อุบลราชธานี" }],
  [/สุราษฎร์ธานี|surat thani/i, { lat: 9.1382, lon: 99.3215, label: "สุราษฎร์ธานี" }],
  [/ภูเก็ต|phuket/i, { lat: 7.8804, lon: 98.3923, label: "ภูเก็ต" }],
  [/สงขลา|หาดใหญ่|songkhla|hat yai/i, { lat: 7.0086, lon: 100.4747, label: "สงขลา" }],
];

function degreeText(lon: number) {
  const normalized = ((lon % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const within = normalized % 30;
  const degree = Math.floor(within);
  const minute = Math.round((within - degree) * 60);
  return `${signsTh[signIndex]} ${degree}°${String(minute === 60 ? 0 : minute).padStart(2, "0")}′`;
}

function translateWuXing(value: string) {
  return [...value].map((char) => chineseElements[char] ?? char).join("–");
}

async function resolvePlace(place?: string): Promise<Coordinates | null> {
  const cleaned = place?.trim();
  if (!cleaned) return null;
  const known = knownPlaces.find(([pattern]) => pattern.test(cleaned));
  if (known) return known[1];

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", cleaned);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("accept-language", "th,en");
    const response = await fetch(url, {
      headers: { "User-Agent": "GypsyTarot/1.0 (https://gypsy-woad.vercel.app)" },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return null;
    const results = await response.json() as Array<{ lat?: string; lon?: string; display_name?: string }>;
    const lat = Number(results[0]?.lat);
    const lon = Number(results[0]?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon, label: results[0]?.display_name?.split(",")[0] || cleaned };
  } catch {
    return null;
  }
}

function strongestAspects(chart: ReturnType<Engine["chart"]>) {
  return chart.aspects
    .filter((aspect) => bodiesTh[aspect.a] && bodiesTh[aspect.b] && aspectsTh[aspect.aspect])
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 2)
    .map((aspect) => `${bodiesTh[aspect.a]}${aspectsTh[aspect.aspect]}${bodiesTh[aspect.b]} (คลาด ${aspect.orb.toFixed(1)}°)`);
}

export async function calculateAstrologyFacts(birth: BirthInput): Promise<AstrologyFacts> {
  const [year, month, day] = birth.date.split("-").map(Number);
  const hasTime = /^\d{2}:\d{2}$/.test(birth.time ?? "");
  const [localHour, localMinute] = hasTime ? birth.time!.split(":").map(Number) : [12, 0];
  const place = await resolvePlace(birth.place);
  const utcMillis = Date.UTC(year, month - 1, day, localHour, localMinute) - (birth.timezoneOffset * 60 * 60 * 1000);
  const utc = new Date(utcMillis);
  const lat = place?.lat ?? 0;
  const lon = place?.lon ?? 0;
  const western = engine.chart(
    utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate(), utc.getUTCHours(), utc.getUTCMinutes(), 0,
    lat, lon, { houseSystem: "placidus", zodiac: "tropical" },
  );
  const thai = engine.chart(
    utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate(), utc.getUTCHours(), utc.getUTCMinutes(), 0,
    lat, lon, { houseSystem: "whole_sign", zodiac: "sidereal:lahiri" },
  );

  const westernFacts = [`อาทิตย์อยู่ราศี${degreeText(western.bodies.sun.lon)}`];
  const thaiFacts = [`อาทิตย์อยู่ราศี${degreeText(thai.bodies.sun.lon)} แบบนิรายนะ Lahiri`];
  if (hasTime) {
    westernFacts.push(`จันทร์อยู่ราศี${degreeText(western.bodies.moon.lon)}`);
    thaiFacts.push(`จันทร์อยู่ราศี${degreeText(thai.bodies.moon.lon)}`);
    westernFacts.push(...strongestAspects(western));
  }
  if (hasTime && place) {
    westernFacts.splice(2, 0, `ลัคนาราศี${degreeText(western.angles.asc)}`);
    thaiFacts.push(`ลัคนาราศี${degreeText(thai.angles.asc)}`);
  }

  const solar = Solar.fromYmdHms(year, month, day, localHour, localMinute, 0);
  const eight = solar.getLunar().getEightChar();
  const pillars = [`ปี ${eight.getYear()}`, `เดือน ${eight.getMonth()}`, `วัน ${eight.getDay()}`];
  const elements = [
    `ธาตุเสาปี ${translateWuXing(eight.getYearWuXing())}`,
    `ธาตุเสาเดือน ${translateWuXing(eight.getMonthWuXing())}`,
    `ดิถีวัน ${eight.getDayGan()} (${ganElements[eight.getDayGan()] ?? translateWuXing(eight.getDayWuXing())})`,
  ];
  if (hasTime) {
    pillars.push(`เวลา ${eight.getTime()}`);
    elements.push(`ธาตุเสาเวลา ${translateWuXing(eight.getTimeWuXing())}`);
  }

  const notes: string[] = [];
  if (!hasTime) notes.push("ไม่กรอกเวลา: ไม่ใช้ลัคนา เสาเวลา และตำแหน่งจันทร์ที่อาจเปลี่ยนระหว่างวัน");
  if (hasTime && !place) notes.push("ไม่พบสถานที่เกิด: ไม่ใช้ลัคนา แต่ยังคำนวณดาวจากวันและเวลาที่กรอก");
  if (place) notes.push(`พิกัดอ้างอิง: ${place.label}`);
  notes.push(`เขตเวลาที่ใช้: UTC${birth.timezoneOffset >= 0 ? "+" : ""}${birth.timezoneOffset}`);

  const localLabel = new Intl.DateTimeFormat("th-TH", { dateStyle: "long" }).format(new Date(Date.UTC(year, month - 1, day)));
  return {
    birthLabel: `${localLabel}${hasTime ? ` เวลา ${birth.time} น.` : ""}${birth.place?.trim() ? ` • ${birth.place.trim()}` : ""}`,
    precision: hasTime && place ? "full" : hasTime ? "time" : "date",
    western: { title: "ดวงสากล", facts: westernFacts },
    thai: { title: "โหราศาสตร์ไทย", facts: thaiFacts },
    chinese: { title: "ดวงจีน (สี่เสา)", facts: [...pillars, ...elements] },
    notes,
  };
}
