"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Suit = "major" | "wands" | "cups" | "swords" | "pentacles";
type Card = {
  id: string;
  nameTh: string;
  nameEn: string;
  suit: Suit;
  image: string;
  upright: string;
  reversed: string;
  advice: string;
};
type DrawnCard = Card & { reversedDraw: boolean };
type QuestionKind = "love" | "work" | "money" | "health" | "decision" | "general";

const commonsImage = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(fileName)}?width=500`;

const majorCards: Card[] = [
  ["00", "เดอะฟูล", "The Fool", "การเริ่มต้น อิสระ และการลองสิ่งใหม่", "ความหุนหันหรือก้าวไปโดยยังไม่พร้อม", "เปิดรับโอกาส แต่ตรวจทางลงก่อนก้าว"],
  ["01", "นักมายากล", "The Magician", "ความสามารถ ทรัพยากรพร้อม และการลงมือทำ", "ศักยภาพที่ยังไม่ถูกใช้หรือการสื่อสารที่คลุมเครือ", "ใช้สิ่งที่มีอยู่ให้เกิดผลจริง"],
  ["02", "มหาปุโรหิตหญิง", "The High Priestess", "สัญชาตญาณ ความลับ และสิ่งที่ยังไม่เปิดเผย", "การไม่ฟังเสียงภายในหรือข้อมูลที่ถูกปิดบัง", "ชะลอคำตอบเพื่อฟังความรู้สึกที่แท้จริง"],
  ["03", "จักรพรรดินี", "The Empress", "ความอุดมสมบูรณ์ การดูแล และการเติบโต", "การทุ่มเทจนลืมตนเองหรือการเติบโตติดขัด", "หล่อเลี้ยงสิ่งสำคัญอย่างสม่ำเสมอ"],
  ["04", "จักรพรรดิ", "The Emperor", "โครงสร้าง ความมั่นคง และอำนาจตัดสินใจ", "การควบคุมมากไปหรือขาดระเบียบ", "ตั้งขอบเขตและตัดสินใจด้วยหลักการ"],
  ["05", "พระสังฆราช", "The Hierophant", "คำแนะนำ ระบบ และแนวทางที่พิสูจน์แล้ว", "การตั้งคำถามต่อกรอบเดิมหรือกฎที่ไม่เหมาะ", "ขอคำแนะนำจากผู้รู้แล้วเลือกให้เข้ากับตน"],
  ["06", "คู่รัก", "The Lovers", "ความสัมพันธ์ ความสอดคล้อง และการเลือกจากคุณค่า", "ความไม่ลงรอยหรือการตัดสินใจที่ขัดใจตนเอง", "เลือกสิ่งที่ตรงกับคุณค่าระยะยาว"],
  ["07", "รถศึก", "The Chariot", "แรงขับ การควบคุมทิศทาง และชัยชนะ", "แรงดึงคนละทางหรือการเร่งโดยขาดการควบคุม", "กำหนดทิศเดียวแล้วเดินหน้าอย่างมีวินัย"],
  ["08", "พละกำลัง", "Strength", "ความกล้าภายใน ความอดทน และการควบคุมอารมณ์", "ความไม่มั่นใจหรือใช้กำลังฝืนเกินไป", "ชนะด้วยความนิ่งมากกว่าการบังคับ"],
  ["09", "ฤๅษี", "The Hermit", "การทบทวน ค้นหาคำตอบ และเว้นระยะ", "การเก็บตัวมากไปหรือหลีกเลี่ยงความจริง", "ถอยหนึ่งก้าวเพื่อเห็นภาพที่ชัดขึ้น"],
  ["10", "กงล้อแห่งโชคชะตา", "Wheel of Fortune", "จังหวะเปลี่ยน วัฏจักร และโอกาสที่เข้ามา", "ความล่าช้าหรือรูปแบบเดิมที่วนซ้ำ", "ปรับตัวให้ทันจังหวะที่กำลังเปลี่ยน"],
  ["11", "ความยุติธรรม", "Justice", "ข้อเท็จจริง ความรับผิดชอบ และผลตามเหตุ", "ข้อมูลไม่ครบ ความลำเอียง หรือหลีกเลี่ยงผลของการเลือก", "ตัดสินจากหลักฐาน ไม่ใช่ความกลัว"],
  ["12", "ชายผู้ถูกแขวน", "The Hanged Man", "การหยุดรอ มุมมองใหม่ และการยอมปล่อย", "การค้างคาเพราะไม่ยอมเปลี่ยนมุมมอง", "อย่าฝืนจังหวะ ใช้ช่วงรอเพื่อมองใหม่"],
  ["13", "ความตาย", "Death", "การจบช่วงเดิมและการเปลี่ยนแปลงครั้งสำคัญ", "การยื้อสิ่งที่หมดเวลาแล้ว", "ยอมปิดบทเก่าเพื่อเปิดพื้นที่ให้บทใหม่"],
  ["14", "ความพอดี", "Temperance", "สมดุล การเยียวยา และการค่อย ๆ ประสาน", "ความสุดโต่งหรือส่วนผสมที่ยังไม่ลงตัว", "ลดความเร่งและหาจุดพอดีที่ทำต่อเนื่องได้"],
  ["15", "ปีศาจ", "The Devil", "พันธนาการ ความยึดติด และแรงปรารถนา", "การเริ่มมองเห็นทางออกจากสิ่งที่ผูกมัด", "ซื่อสัตย์กับสิ่งที่ควบคุมคุณอยู่"],
  ["16", "หอคอย", "The Tower", "ความจริงที่สั่นคลอนโครงสร้างเดิมและการเปลี่ยนฉับพลัน", "การเลี่ยงการเปลี่ยนหรือแรงสั่นสะเทือนภายใน", "รักษาสิ่งจำเป็น แล้วสร้างใหม่บนความจริง"],
  ["17", "ดวงดาว", "The Star", "ความหวัง การฟื้นตัว และทิศทางที่สว่างขึ้น", "ความหวังลดลงหรือยังไม่เชื่อในทางของตน", "รักษาความหวังพร้อมลงมือทีละขั้น"],
  ["18", "ดวงจันทร์", "The Moon", "ความไม่ชัดเจน อารมณ์ และสิ่งที่อาจไม่เป็นอย่างเห็น", "ความจริงเริ่มเปิดเผยหรือความกลัวกำลังคลาย", "อย่ารีบสรุปจนกว่าจะตรวจข้อมูลครบ"],
  ["19", "ดวงอาทิตย์", "The Sun", "ความชัดเจน ความสำเร็จ และพลังชีวิต", "ความสุขที่ล่าช้าหรือคาดหวังความสมบูรณ์เกินไป", "แสดงตัวตนและใช้ความชัดเจนนำทาง"],
  ["20", "การพิพากษา", "Judgement", "การตื่นรู้ การประเมินใหม่ และโอกาสแก้ตัว", "การตัดสินตนเองหนักไปหรือไม่ยอมรับบทเรียน", "รับบทเรียนแล้วตอบรับการเรียกครั้งใหม่"],
  ["21", "โลก", "The World", "ความสมบูรณ์ การปิดวงจร และความสำเร็จระยะยาว", "งานเกือบจบแต่ยังมีรายละเอียดค้าง", "ปิดสิ่งที่ค้างให้ครบก่อนเริ่มรอบใหม่"],
].map(([id, nameTh, nameEn, upright, reversed, advice]) => ({
  id: `major-${id}`,
  nameTh,
  nameEn,
  suit: "major" as const,
  image: commonsImage(`RWS Tarot ${id} ${nameEn.replace("The ", "")}.jpg`),
  upright,
  reversed,
  advice,
}));

const suits = {
  wands: { th: "ไม้เท้า", en: "Wands", file: "Wands", focus: "แรงผลักดัน งานสร้างสรรค์ และการลงมือ", advice: "จัดพลังให้ตรงเป้าหมาย" },
  cups: { th: "ถ้วย", en: "Cups", file: "Cups", focus: "ความรู้สึก ความสัมพันธ์ และความเข้าใจ", advice: "ฟังความรู้สึกโดยไม่ละเลยข้อเท็จจริง" },
  swords: { th: "ดาบ", en: "Swords", file: "Swords", focus: "ความคิด การสื่อสาร และความขัดแย้ง", advice: "พูดให้ชัดและแยกข้อเท็จจริงจากความกังวล" },
  pentacles: { th: "เหรียญ", en: "Pentacles", file: "Pents", focus: "เงิน งาน สุขภาพกาย และความมั่นคง", advice: "ใช้แผนที่วัดผลได้และทำอย่างสม่ำเสมอ" },
} as const;

const ranks = [
  { th: "หนึ่ง", en: "Ace", up: "เมล็ดพันธุ์หรือโอกาสใหม่", rev: "โอกาสที่ยังไม่พร้อมหรือเริ่มช้า", tip: "เริ่มจากก้าวเล็กที่จับต้องได้" },
  { th: "สอง", en: "Two", up: "การชั่งใจและประสานสองทางเลือก", rev: "ความลังเลหรือสมดุลที่เสียไป", tip: "กำหนดเกณฑ์เลือกให้ชัด" },
  { th: "สาม", en: "Three", up: "การขยายผล ความร่วมมือ และพัฒนาการ", rev: "การร่วมมือสะดุดหรือผลยังไม่เต็มที่", tip: "คุยบทบาทและความคาดหวังให้ตรงกัน" },
  { th: "สี่", en: "Four", up: "ฐานที่มั่นคง การพัก และการรักษาสิ่งที่มี", rev: "ความนิ่งที่กลายเป็นติดอยู่กับที่", tip: "รักษาฐานเดิมพร้อมเปิดพื้นที่ให้การเปลี่ยน" },
  { th: "ห้า", en: "Five", up: "บททดสอบ ความเปลี่ยนแปลง และความไม่ลงตัว", rev: "ความขัดแย้งเริ่มคลายแต่ยังมีแผลเดิม", tip: "แก้ต้นเหตุแทนการเอาชนะกัน" },
  { th: "หก", en: "Six", up: "ความคืบหน้า การช่วยเหลือ และการกลับสู่สมดุล", rev: "การให้รับไม่เท่ากันหรือความคืบหน้าช้า", tip: "ทบทวนว่าใครควรให้และใครควรรับ" },
  { th: "เจ็ด", en: "Seven", up: "การประเมินทางเลือกและยืนหยัดในจุดยืน", rev: "ตัวเลือกมากจนสับสนหรือแรงใจลด", tip: "ตัดสิ่งรบกวนแล้วเลือกเรื่องสำคัญที่สุด" },
  { th: "แปด", en: "Eight", up: "การเคลื่อนไหว ฝึกฝน และสร้างความชำนาญ", rev: "ความล่าช้า งานซ้ำ หรือการฝืนจังหวะ", tip: "ปรับกระบวนการก่อนเพิ่มความเร็ว" },
  { th: "เก้า", en: "Nine", up: "ผลจากความพยายาม ความพอใจ และใกล้ถึงเป้าหมาย", rev: "ความคาดหวังสูงหรือเหนื่อยใกล้เส้นชัย", tip: "รักษาพลังไว้จบสิ่งสำคัญ" },
  { th: "สิบ", en: "Ten", up: "บทสรุป ความรับผิดชอบ และผลระยะยาว", rev: "ภาระเกินกำลังหรือเรื่องที่ยังปิดไม่ลง", tip: "แบ่งเบาภาระและปิดงานทีละส่วน" },
  { th: "เด็กถือ", en: "Page of", up: "ข่าวใหม่ ความอยากรู้ และการเรียนรู้", rev: "ข่าวคลาดเคลื่อนหรือยังขาดประสบการณ์", tip: "ตรวจข้อมูลและเปิดใจเรียนรู้" },
  { th: "อัศวิน", en: "Knight of", up: "การเคลื่อนไปข้างหน้าและการทุ่มเท", rev: "รีบร้อน แกว่งไปมา หรือพลังผิดทิศ", tip: "กำหนดความเร็วให้เหมาะกับความเสี่ยง" },
  { th: "ราชินี", en: "Queen of", up: "วุฒิภาวะ การเข้าใจตน และการดูแล", rev: "อารมณ์หรือความต้องการภายในเสียสมดุล", tip: "ดูแลขอบเขตของตนก่อนช่วยผู้อื่น" },
  { th: "ราชา", en: "King of", up: "ความเชี่ยวชาญ ภาวะผู้นำ และการควบคุมสถานการณ์", rev: "ใช้อำนาจไม่พอดีหรือมั่นใจเกินข้อมูล", tip: "นำด้วยความรับผิดชอบและรับฟัง" },
] as const;

const minorCards: Card[] = (Object.keys(suits) as Exclude<Suit, "major">[]).flatMap((suit) => {
  const s = suits[suit];
  return ranks.map((rank, index) => {
    const number = String(index + 1).padStart(2, "0");
    const isCourt = index >= 10;
    return {
      id: `${suit}-${number}`,
      nameTh: isCourt ? `${rank.th}${s.th}` : `${rank.th}${s.th}`,
      nameEn: isCourt ? `${rank.en} ${s.en}` : `${rank.en} of ${s.en}`,
      suit,
      image: commonsImage(`${s.file}${number}.jpg`),
      upright: `${rank.up} ในเรื่อง${s.focus}`,
      reversed: `${rank.rev} โดยเฉพาะด้าน${s.focus}`,
      advice: `${rank.tip} และ${s.advice}`,
    };
  });
});

const deck = [...majorCards, ...minorCards];

const spreads: Record<number, string[]> = {
  1: ["คำตอบหลัก"],
  3: ["สถานการณ์", "สิ่งที่ต้องระวัง", "แนวทางต่อไป"],
  5: ["แก่นของเรื่อง", "อิทธิพลที่ผ่านมา", "อุปสรรค", "คำแนะนำ", "แนวโน้มผลลัพธ์"],
  10: ["สถานการณ์ปัจจุบัน", "แรงต้าน", "รากของเรื่อง", "สิ่งที่ผ่านมา", "สิ่งที่มุ่งหวัง", "อนาคตใกล้", "ท่าทีของคุณ", "คนและสิ่งแวดล้อม", "ความหวังหรือความกังวล", "แนวโน้มปลายทาง"],
};

const kindLabels: Record<QuestionKind, string> = {
  love: "ความรักและความสัมพันธ์",
  work: "งานและเส้นทางอาชีพ",
  money: "การเงินและทรัพย์สิน",
  health: "สุขภาพและการดูแลตนเอง",
  decision: "การตัดสินใจ",
  general: "ภาพรวมของเรื่องนี้",
};

function classifyQuestion(question: string): QuestionKind {
  if (/รัก|แฟน|คู่|เขา|เธอ|สัมพันธ์|แต่งงาน|คืนดี/.test(question)) return "love";
  if (/งาน|หัวหน้า|ตำแหน่ง|เลื่อน|ย้าย|บริษัท|อาชีพ|ธุรกิจ|โปรเจกต์/.test(question)) return "work";
  if (/เงิน|รายได้|หนี้|ลงทุน|ซื้อ|ขาย|กำไร|ทรัพย์|บ้าน|รถ/.test(question)) return "money";
  if (/สุขภาพ|ป่วย|เจ็บ|รักษา|ร่างกาย|นอน|เครียด/.test(question)) return "health";
  if (/ควร|เลือก|ตัดสินใจ|หรือไม่|ได้ไหม|ดีไหม/.test(question)) return "decision";
  return "general";
}

function drawCards(count: number): DrawnCard[] {
  const pool = [...deck];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).map((card) => ({ ...card, reversedDraw: Math.random() < 0.32 }));
}

function cardReading(card: DrawnCard, position: string, kind: QuestionKind) {
  const meaning = card.reversedDraw ? card.reversed : card.upright;
  const direction = card.reversedDraw ? "ไพ่กลับหัวชี้ว่า" : "ไพ่ตั้งตรงชี้ว่า";
  const context: Record<QuestionKind, string> = {
    love: "ในความสัมพันธ์ ควรดูทั้งการกระทำและความรู้สึกที่สื่อออกมาจริง",
    work: "ในเรื่องงาน ให้พิจารณาคน ระบบ และจังหวะลงมือควบคู่กัน",
    money: "ด้านการเงินควรอิงตัวเลขจริงและเผื่อความไม่แน่นอน",
    health: "ด้านสุขภาพ ไพ่ใช้เพื่อสะท้อนใจเท่านั้น ไม่แทนคำแนะนำจากแพทย์",
    decision: "สำหรับการตัดสินใจนี้ อย่าใช้ความรู้สึกชั่ววูบเป็นเกณฑ์เดียว",
    general: "นำความหมายนี้ไปเทียบกับสิ่งที่กำลังเกิดขึ้นจริงรอบตัวคุณ",
  };
  return `ในตำแหน่ง “${position}” ${direction} ${meaning} ${context[kind]} คำแนะนำคือ ${card.advice}`;
}

function overallReading(cards: DrawnCard[], question: string, kind: QuestionKind) {
  const uprightCount = cards.filter((card) => !card.reversedDraw).length;
  const majorCount = cards.filter((card) => card.suit === "major").length;
  const suitCounts = cards.reduce<Record<string, number>>((acc, card) => {
    if (card.suit !== "major") acc[card.suit] = (acc[card.suit] || 0) + 1;
    return acc;
  }, {});
  const dominant = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as Exclude<Suit, "major"> | undefined;
  const last = cards[cards.length - 1];
  const tone = uprightCount / cards.length >= 0.7
    ? "ภาพรวมเปิดทางไปในเชิงบวก หากลงมืออย่างมีสติ"
    : uprightCount / cards.length >= 0.4
      ? "ภาพรวมมีทั้งโอกาสและข้อจำกัด จึงยังไม่ใช่คำตอบแบบได้หรือไม่ได้ทันที"
      : "ภาพรวมแนะนำให้ชะลอ ตรวจข้อมูล และแก้สิ่งติดขัดก่อนเดินหน้าเต็มกำลัง";
  const major = majorCount >= Math.max(2, Math.ceil(cards.length / 3))
    ? "ไพ่ชุดใหญ่ปรากฏเด่น แปลว่าเรื่องนี้อาจเป็นจุดเปลี่ยนหรือบทเรียนสำคัญกว่าปัญหาระยะสั้น"
    : "ไพ่เน้นเรื่องที่จัดการได้ผ่านพฤติกรรม การสื่อสาร และการวางแผนในชีวิตประจำวัน";
  const suit = dominant ? `พลังของชุด${suits[dominant].th}เด่น จึงควรให้น้ำหนักกับ${suits[dominant].focus}` : "พลังของไพ่กระจายหลายด้าน จึงควรมองเรื่องนี้แบบรอบด้าน";
  const outcome = `${last.nameTh}${last.reversedDraw ? "กลับหัว" : "ตั้งตรง"}อยู่ปลายทาง จึงสรุปแนวโน้มว่า ${last.reversedDraw ? last.reversed : last.upright}`;
  return {
    headline: tone,
    paragraphs: [
      `สำหรับคำถาม “${question}” ไพ่กำลังสะท้อนเรื่อง${kindLabels[kind]} ${major}`,
      `${suit} ${outcome}`,
      `คำตอบที่นำไปใช้ได้ตอนนี้คือ ${last.advice} แล้วสังเกตผลจริงก่อนตัดสินใจขั้นถัดไป`,
    ],
  };
}

function CardBack({ small = false }: { small?: boolean }) {
  return (
    <div className={`card-back ${small ? "card-back-small" : ""}`} aria-hidden="true">
      <div className="card-back-inner">
        <span>✦</span><span className="moon">☾</span><span>✦</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [count, setCount] = useState(3);
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [view, setView] = useState<"overall" | "cards">("overall");
  const [revealing, setRevealing] = useState(false);
  const kind = useMemo(() => classifyQuestion(question), [question]);
  const overall = useMemo(() => cards.length ? overallReading(cards, question, kind) : null, [cards, question, kind]);

  function predict() {
    if (!question.trim() || revealing) return;
    setRevealing(true);
    setCards([]);
    window.setTimeout(() => {
      setCards(drawCards(count));
      setView("overall");
      setRevealing(false);
      window.setTimeout(() => document.getElementById("reading")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }, 650);
  }

  function reset() {
    setCards([]);
    setQuestion("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main>
      <section className="hero" aria-labelledby="page-title">
        <div className="stars" aria-hidden="true" />
        <nav className="nav-shell">
          <a className="brand" href="#top" aria-label="หน้าแรก ไพ่ยิปซีตอบคำถาม"><span>☾</span> ไพ่ยิปซี</a>
          <span className="private-note">ไม่เก็บคำถามของคุณ</span>
        </nav>

        <div id="top" className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">ตั้งจิต • ตั้งคำถาม • เปิดไพ่</p>
            <h1 id="page-title">คำตอบอาจซ่อนอยู่<br />ในไพ่ที่คุณเลือก</h1>
            <p className="intro">ถามหนึ่งเรื่องที่อยู่ในใจ แล้วให้ไพ่ทั้ง 78 ใบช่วยสะท้อนสถานการณ์ มุมที่อาจมองข้าม และแนวทางต่อไป</p>
            <div className="trust-row" aria-label="ข้อมูลบริการ">
              <span>✦ ฟรี</span><span>✦ ไม่ต้องสมัคร</span><span>✦ อ่านได้ทันที</span>
            </div>
          </div>

          <div className="card-fan" aria-hidden="true">
            <div className="fan-card fan-left"><CardBack /></div>
            <div className="fan-card fan-center"><CardBack /></div>
            <div className="fan-card fan-right"><CardBack /></div>
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          </div>

          <form className="question-panel" onSubmit={(event) => { event.preventDefault(); predict(); }}>
            <div className="step-label"><span>01</span><p>เขียนคำถามของคุณ</p></div>
            <label className="sr-only" htmlFor="question">คำถามที่ต้องการถามไพ่</label>
            <textarea
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={180}
              placeholder="เช่น งานที่กำลังตัดสินใจจะมีแนวโน้มอย่างไร?"
              rows={3}
            />
            <div className="counter">{question.length}/180</div>

            <div className="step-label second"><span>02</span><p>เลือกจำนวนไพ่</p></div>
            <div className="count-grid" role="radiogroup" aria-label="จำนวนไพ่">
              {[1, 3, 5, 10].map((option) => (
                <button
                  className={count === option ? "count-option active" : "count-option"}
                  type="button"
                  role="radio"
                  aria-checked={count === option}
                  key={option}
                  onClick={() => setCount(option)}
                >
                  <strong>{option}</strong><span>ใบ</span>
                  <small>{option === 1 ? "คำตอบตรง" : option === 3 ? "กระชับพอดี" : option === 5 ? "รอบด้าน" : "ลงลึก"}</small>
                </button>
              ))}
            </div>
            <button className="predict-button" type="submit" disabled={!question.trim() || revealing}>
              {revealing ? "กำลังสับไพ่…" : "เปิดไพ่ทำนาย"}<span aria-hidden="true">→</span>
            </button>
            <p className="hint">หลีกเลี่ยงคำถามเดิมซ้ำ ๆ ในช่วงเวลาใกล้กัน เพื่อให้คุณได้ทบทวนคำตอบอย่างเต็มที่</p>
          </form>
        </div>
      </section>

      {revealing && (
        <section className="shuffle-stage" aria-live="polite">
          <div className="shuffle-cards"><CardBack small /><CardBack small /><CardBack small /></div>
          <p>กำลังสับไพ่และวางสำรับสำหรับคำถามของคุณ…</p>
        </section>
      )}

      {cards.length > 0 && overall && (
        <section id="reading" className="reading-section">
          <div className="reading-head">
            <p className="eyebrow dark">ผลการเปิดไพ่ {cards.length} ใบ</p>
            <h2>คำถามของคุณ</h2>
            <blockquote>“{question}”</blockquote>
            <div className="view-tabs" role="tablist" aria-label="รูปแบบคำทำนาย">
              <button role="tab" aria-selected={view === "overall"} className={view === "overall" ? "active" : ""} onClick={() => setView("overall")}>อ่านภาพรวม</button>
              <button role="tab" aria-selected={view === "cards"} className={view === "cards" ? "active" : ""} onClick={() => setView("cards")}>อ่านทีละใบ</button>
            </div>
          </div>

          <div className={`spread spread-${cards.length}`}>
            {cards.map((card, index) => (
              <button
                type="button"
                className="spread-card"
                key={card.id}
                style={{ "--delay": `${index * 90}ms` } as CSSProperties}
                onClick={() => { setView("cards"); window.setTimeout(() => document.getElementById(`card-${index}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 20); }}
                aria-label={`ดูคำทำนาย ${card.nameTh} ${card.reversedDraw ? "กลับหัว" : "ตั้งตรง"}`}
              >
                <span className="position-number">{index + 1}</span>
                <div className={card.reversedDraw ? "card-image reversed" : "card-image"}>
                  <img src={card.image} alt={`ไพ่ ${card.nameTh}`} referrerPolicy="no-referrer" />
                </div>
                <strong>{card.nameTh}</strong>
                <small>{card.reversedDraw ? "กลับหัว" : "ตั้งตรง"} • {spreads[cards.length][index]}</small>
              </button>
            ))}
          </div>

          {view === "overall" ? (
            <article className="overall-panel" role="tabpanel">
              <div className="reading-icon">✦</div>
              <div>
                <p className="section-kicker">ภาพรวมจากไพ่ทุกใบ</p>
                <h3>{overall.headline}</h3>
                {overall.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </article>
          ) : (
            <div className="individual-list" role="tabpanel">
              {cards.map((card, index) => (
                <article id={`card-${index}`} className="individual-card" key={card.id}>
                  <div className={card.reversedDraw ? "mini-card reversed" : "mini-card"}><img src={card.image} alt="" referrerPolicy="no-referrer" /></div>
                  <div>
                    <p className="section-kicker">ใบที่ {index + 1} • {spreads[cards.length][index]}</p>
                    <h3>{card.nameTh} <span>{card.nameEn}</span></h3>
                    <span className={card.reversedDraw ? "orientation reversed-label" : "orientation"}>{card.reversedDraw ? "ไพ่กลับหัว" : "ไพ่ตั้งตรง"}</span>
                    <p>{cardReading(card, spreads[cards.length][index], kind)}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="reading-actions">
            <button className="secondary-button" onClick={() => { setCards(drawCards(count)); setView("overall"); }}>สับและเปิดใหม่</button>
            <button className="text-button" onClick={reset}>ถามคำถามใหม่</button>
          </div>
        </section>
      )}

      <footer>
        <div><strong>☾ ไพ่ยิปซีตอบคำถาม</strong><p>พื้นที่เล็ก ๆ สำหรับทบทวนเรื่องที่อยู่ในใจ</p></div>
        <p>ไพ่เป็นเครื่องมือเพื่อการสะท้อนตนเอง ไม่ใช่ข้อเท็จจริงหรือคำแนะนำทางการแพทย์ กฎหมาย และการเงิน</p>
        <p className="credit">ภาพไพ่ Rider–Waite–Smith ต้นฉบับ ค.ศ. 1909 • Public Domain • จาก Wikimedia Commons</p>
      </footer>
    </main>
  );
}
