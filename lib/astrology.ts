import { Engine, transitAspects, type BodyId, type Chart, type Zodiac } from "caelus";
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
  asOfLabel: string;
  precision: "date" | "time" | "full";
  western: { title: string; natalFacts: string[]; cycleFacts: string[]; facts: string[] };
  thai: { title: string; natalFacts: string[]; cycleFacts: string[]; facts: string[] };
  chinese: { title: string; natalFacts: string[]; cycleFacts: string[]; facts: string[] };
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
const phasesTh: Record<string, string> = { applying: "กำลังเข้าองศา", separating: "กำลังแยกองศา", exact: "องศาสนิท" };
const chineseElements: Record<string, string> = { 木: "ไม้", 火: "ไฟ", 土: "ดิน", 金: "ทอง", 水: "น้ำ" };
const ganElements: Record<string, string> = {
  甲: "ไม้หยาง", 乙: "ไม้หยิน", 丙: "ไฟหยาง", 丁: "ไฟหยิน", 戊: "ดินหยาง",
  己: "ดินหยิน", 庚: "ทองหยาง", 辛: "ทองหยิน", 壬: "น้ำหยาง", 癸: "น้ำหยิน",
};
const ganElementCode: Record<string, keyof typeof chineseElements> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};
const generates: Record<keyof typeof chineseElements, keyof typeof chineseElements> = {
  木: "火", 火: "土", 土: "金", 金: "水", 水: "木",
};
const controls: Record<keyof typeof chineseElements, keyof typeof chineseElements> = {
  木: "土", 土: "水", 水: "火", 火: "金", 金: "木",
};
const branchClashes = new Set(["子午", "午子", "丑未", "未丑", "寅申", "申寅", "卯酉", "酉卯", "辰戌", "戌辰", "巳亥", "亥巳"]);
const branchCombines = new Set(["子丑", "丑子", "寅亥", "亥寅", "卯戌", "戌卯", "辰酉", "酉辰", "巳申", "申巳", "午未", "未午"]);

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

function currentParts(timezoneOffset: number) {
  const shifted = new Date(Date.now() + (timezoneOffset * 60 * 60 * 1000));
  return {
    year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(), minute: shifted.getUTCMinutes(),
  };
}

function currentLabel(parts: ReturnType<typeof currentParts>) {
  const date = new Intl.DateTimeFormat("th-TH", { dateStyle: "long", timeZone: "UTC" })
    .format(new Date(Date.UTC(parts.year, parts.month - 1, parts.day)));
  return `${date} เวลา ${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")} น.`;
}

function transitFacts(
  natal: Chart,
  current: Chart,
  zodiac: Zodiac,
  bodies: BodyId[],
  includeHouse: boolean,
  limit: number,
) {
  return transitAspects(natal, engine, current.jdUt, { maxOrb: 3, zodiac, bodies })
    .filter((hit) => bodiesTh[hit.transit] && bodiesTh[hit.natal] && aspectsTh[hit.aspect])
    .sort((a, b) => b.strength - a.strength)
    .slice(0, limit)
    .map((hit) => {
      const house = includeHouse ? ` ในเรือนกำเนิดที่ ${hit.natalHouse}` : "";
      return `${bodiesTh[hit.transit]}จร${aspectsTh[hit.aspect]}${bodiesTh[hit.natal]}กำเนิด${house} (${phasesTh[hit.phase] ?? hit.phase}, คลาด ${hit.orb.toFixed(1)}°)`;
    });
}

function currentPositions(chart: Chart, bodyIds: string[]) {
  return bodyIds.flatMap((body) => {
    const position = chart.bodies[body];
    if (!position) return [];
    return [`${bodiesTh[body]}จรอยู่ราศี${degreeText(position.lon)}${position.retrograde ? " พักร์" : ""}`];
  });
}

function elementRelation(natalGan: string, currentGan: string, label: string) {
  const natal = ganElementCode[natalGan];
  const current = ganElementCode[currentGan];
  if (!natal || !current) return `${label} ${currentGan}`;
  if (natal === current) return `${label}ธาตุ${chineseElements[current]}เสริมพลังดิถีธาตุเดียวกัน`;
  if (generates[current] === natal) return `${label}ธาตุ${chineseElements[current]}ส่งกำลังให้ดิถีธาตุ${chineseElements[natal]}`;
  if (generates[natal] === current) return `${label}ธาตุ${chineseElements[current]}ดึงพลังจากดิถีธาตุ${chineseElements[natal]}ไปสู่การลงมือและผลงาน`;
  if (controls[current] === natal) return `${label}ธาตุ${chineseElements[current]}กดดันดิถีธาตุ${chineseElements[natal]}ให้รับผิดชอบและตัดสินใจรอบคอบ`;
  return `${label}ดิถีธาตุ${chineseElements[natal]}ต้องออกแรงควบคุมธาตุ${chineseElements[current]} โดยเฉพาะเรื่องทรัพยากรและผลลัพธ์`;
}

function branchRelation(natalBranch: string, currentBranch: string, label: string) {
  const pair = `${natalBranch}${currentBranch}`;
  if (branchClashes.has(pair)) return `${label}${currentBranch}ชงกับกิ่งวันกำเนิด${natalBranch}: จังหวะเปลี่ยนหรือแรงปะทะเด่น`;
  if (branchCombines.has(pair)) return `${label}${currentBranch}六合กับกิ่งวันกำเนิด${natalBranch}: การประสานและความร่วมมือเด่น`;
  if (natalBranch === currentBranch) return `${label}${currentBranch}ซ้ำกิ่งวันกำเนิด: เรื่องเดิมหรือแรงกดดันภายในถูกเน้นย้ำ`;
  return `${label}${currentBranch}ไม่ชงหรือ六合โดยตรงกับกิ่งวันกำเนิด${natalBranch}`;
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
  const now = new Date();
  const current = currentParts(birth.timezoneOffset);
  const currentWestern = engine.chart(
    now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(),
    lat, lon, { houseSystem: "placidus", zodiac: "tropical" },
  );
  const currentThai = engine.chart(
    now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(),
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

  const includeHouses = hasTime && Boolean(place);
  const thaiCycleFacts = [
    ...currentPositions(currentThai, ["jupiter", "saturn", "mars"]),
    ...transitFacts(thai, currentThai, "sidereal:lahiri", ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"], includeHouses, 4),
  ];
  const westernCycleFacts = [
    ...currentPositions(currentWestern, ["jupiter", "saturn", "uranus", "pluto"]),
    ...transitFacts(western, currentWestern, "tropical", ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"], includeHouses, 4),
  ];

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


  const currentEight = Solar.fromYmdHms(current.year, current.month, current.day, current.hour, current.minute, 0)
    .getLunar().getEightChar();
  const chineseCycleFacts = [
    `เสาจรปี ${currentEight.getYear()} • เดือน ${currentEight.getMonth()} • วัน ${currentEight.getDay()}`,
    elementRelation(eight.getDayGan(), currentEight.getYearGan(), "พลังปีจร: "),
    elementRelation(eight.getDayGan(), currentEight.getMonthGan(), "พลังเดือนจร: "),
    elementRelation(eight.getDayGan(), currentEight.getDayGan(), "พลังวันจร: "),
    branchRelation(eight.getDayZhi(), currentEight.getYearZhi(), "กิ่งปีจร "),
    branchRelation(eight.getDayZhi(), currentEight.getDayZhi(), "กิ่งวันจร "),
  ];

  const notes: string[] = [];
  if (!hasTime) notes.push("ไม่กรอกเวลา: ไม่ใช้ลัคนา เสาเวลา และตำแหน่งจันทร์ที่อาจเปลี่ยนระหว่างวัน");
  if (hasTime && !place) notes.push("ไม่พบสถานที่เกิด: ไม่ใช้ลัคนา แต่ยังคำนวณดาวจากวันและเวลาที่กรอก");
  if (place) notes.push(`พิกัดอ้างอิง: ${place.label}`);
  notes.push(`เขตเวลาที่ใช้: UTC${birth.timezoneOffset >= 0 ? "+" : ""}${birth.timezoneOffset}`);

  const localLabel = new Intl.DateTimeFormat("th-TH", { dateStyle: "long" }).format(new Date(Date.UTC(year, month - 1, day)));
  const asOfLabel = currentLabel(current);
  return {
    birthLabel: `${localLabel}${hasTime ? ` เวลา ${birth.time} น.` : ""}${birth.place?.trim() ? ` • ${birth.place.trim()}` : ""}`,
    asOfLabel,
    precision: hasTime && place ? "full" : hasTime ? "time" : "date",
    western: { title: "ดวงสากล", natalFacts: westernFacts, cycleFacts: westernCycleFacts, facts: [...westernFacts, `ดวงจร ณ ${asOfLabel}`, ...westernCycleFacts] },
    thai: { title: "โหราศาสตร์ไทย", natalFacts: thaiFacts, cycleFacts: thaiCycleFacts, facts: [...thaiFacts, `ดวงจร ณ ${asOfLabel}`, ...thaiCycleFacts] },
    chinese: { title: "ดวงจีน (สี่เสา)", natalFacts: [...pillars, ...elements], cycleFacts: chineseCycleFacts, facts: [...pillars, ...elements, `ดวงจร ณ ${asOfLabel}`, ...chineseCycleFacts] },
    notes,
  };
}
