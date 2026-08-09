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
  uprightTone: number;
  reversedTone: number;
};
type DrawnCard = Card & { reversedDraw: boolean };
type QuestionKind = "love" | "work" | "money" | "health" | "decision" | "general";
type QuestionIntent = "yesno" | "when" | "why" | "feeling" | "choice" | "outcome";

const commonsImage = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(fileName)}?width=500`;

const majorTones: Record<string, [number, number]> = {
  "00": [0.35, -0.45], "01": [0.95, -0.45], "02": [0.1, -0.35], "03": [1.05, -0.35],
  "04": [0.75, -0.55], "05": [0.45, -0.25], "06": [1.05, -0.8], "07": [1, -0.55],
  "08": [0.9, -0.35], "09": [0.05, -0.4], "10": [0.75, -0.55], "11": [0.45, -0.65],
  "12": [-0.25, -0.5], "13": [-0.45, -0.65], "14": [0.75, -0.6], "15": [-1.05, -0.35],
  "16": [-1.35, -0.85], "17": [1.05, -0.5], "18": [-0.75, -0.25], "19": [1.35, 0.55],
  "20": [0.85, -0.35], "21": [1.35, 0.2],
};

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
  uprightTone: majorTones[id][0],
  reversedTone: majorTones[id][1],
}));

const suits = {
  wands: { th: "ไม้เท้า", en: "Wands", file: "Wands", focus: "แรงผลักดัน งานสร้างสรรค์ และการลงมือ", advice: "จัดพลังให้ตรงเป้าหมาย" },
  cups: { th: "ถ้วย", en: "Cups", file: "Cups", focus: "ความรู้สึก ความสัมพันธ์ และความเข้าใจ", advice: "ฟังความรู้สึกโดยไม่ละเลยข้อเท็จจริง" },
  swords: { th: "ดาบ", en: "Swords", file: "Swords", focus: "ความคิด การสื่อสาร และความขัดแย้ง", advice: "พูดให้ชัดและแยกข้อเท็จจริงจากความกังวล" },
  pentacles: { th: "เหรียญ", en: "Pentacles", file: "Pents", focus: "เงิน งาน สุขภาพกาย และความมั่นคง", advice: "ใช้แผนที่วัดผลได้และทำอย่างสม่ำเสมอ" },
} as const;

const ranks = [
  { th: "หนึ่ง", en: "Ace" }, { th: "สอง", en: "Two" }, { th: "สาม", en: "Three" },
  { th: "สี่", en: "Four" }, { th: "ห้า", en: "Five" }, { th: "หก", en: "Six" },
  { th: "เจ็ด", en: "Seven" }, { th: "แปด", en: "Eight" }, { th: "เก้า", en: "Nine" },
  { th: "สิบ", en: "Ten" }, { th: "เด็กถือ", en: "Page of" }, { th: "อัศวิน", en: "Knight of" },
  { th: "ราชินี", en: "Queen of" }, { th: "ราชา", en: "King of" },
] as const;

type MinorProfile = { up: string; rev: string; tip: string; upTone: number; revTone: number };

const minorProfiles: Record<Exclude<Suit, "major">, MinorProfile[]> = {
  wands: [
    { up: "โอกาสใหม่และแรงเริ่มต้นที่พร้อมลงมือ", rev: "อยากเริ่มแต่พลังหรือแผนยังไม่พร้อม", tip: "เลือกเป้าหมายเดียวแล้วเริ่มทันที", upTone: 1.1, revTone: -0.45 },
    { up: "การวางแผนอนาคตและมองทางเลือกที่กว้างขึ้น", rev: "กลัวการเปลี่ยนแปลงจนยังไม่กล้าตัดสินใจ", tip: "กำหนดแผนหลักและแผนสำรองให้ชัด", upTone: 0.45, revTone: -0.45 },
    { up: "แผนเริ่มเห็นผลและมีโอกาสขยายต่อ", rev: "ผลล่าช้าหรือประเมินสถานการณ์ไกลเกินจริง", tip: "เช็กผลจริงก่อนขยายแผน", upTone: 0.85, revTone: -0.35 },
    { up: "ความมั่นคง ข่าวดี หรือจุดที่ควรฉลอง", rev: "บรรยากาศไม่ลงตัวหรือฐานยังไม่มั่นคง", tip: "ทำข้อตกลงและฐานความสัมพันธ์ให้ชัด", upTone: 1, revTone: -0.45 },
    { up: "การแข่งขัน ความเห็นต่าง และการแย่งพื้นที่", rev: "ความขัดแย้งเริ่มลดลงแต่ยังคุยกันไม่จบ", tip: "ตกลงกติกาก่อนถกเถียงรายละเอียด", upTone: -0.55, revTone: 0.05 },
    { up: "ชัยชนะ การยอมรับ และผลสำเร็จที่คนมองเห็น", rev: "ไม่ได้รับการยอมรับหรือมั่นใจเกินผลงานจริง", tip: "ใช้ผลงานที่พิสูจน์ได้แทนการคาดหวังคำชม", upTone: 1.2, revTone: -0.55 },
    { up: "ต้องยืนหยัดและปกป้องสิ่งที่ตนทำมา", rev: "แรงกดดันมากจนเริ่มถอยหรือหมดแรง", tip: "รักษาจุดยืนเฉพาะเรื่องที่สำคัญจริง", upTone: 0.35, revTone: -0.55 },
    { up: "ข่าวหรือความคืบหน้าที่มาเร็วและต่อเนื่อง", rev: "การสื่อสารคลาดเคลื่อนหรือความล่าช้ากะทันหัน", tip: "ตอบสนองเร็วแต่ยืนยันข้อมูลก่อน", upTone: 1.05, revTone: -0.55 },
    { up: "ผ่านมามากและยังไปต่อได้ แต่ต้องระวังตัว", rev: "อ่อนล้า ตั้งการ์ดสูง หรือใกล้หมดแรง", tip: "พักและลดสิ่งที่ไม่จำเป็นก่อนเดินต่อ", upTone: 0.2, revTone: -0.65 },
    { up: "ภาระหนักและรับผิดชอบมากเกินส่วน", rev: "เริ่มวางภาระลง หรืออีกด้านคือควบคุมงานไม่อยู่", tip: "แบ่งงานและปฏิเสธภาระที่ไม่ใช่ของตน", upTone: -0.65, revTone: 0.1 },
    { up: "ข่าวหรือแนวคิดใหม่ที่จุดประกายให้เริ่ม", rev: "ข่าวยังไม่นิ่งหรือเริ่มด้วยความตื่นเต้นชั่วคราว", tip: "ทดลองเล็ก ๆ ก่อนทุ่มเต็มกำลัง", upTone: 0.6, revTone: -0.3 },
    { up: "การรุกไปข้างหน้าอย่างกล้าและรวดเร็ว", rev: "รีบร้อน เปลี่ยนใจง่าย หรือทำก่อนคิด", tip: "ลดความเร็วและกำหนดจุดหยุดตรวจ", upTone: 0.5, revTone: -0.65 },
    { up: "ความมั่นใจ เสน่ห์ และการผลักดันคนรอบตัว", rev: "ความไม่มั่นใจหรือใช้อารมณ์แข่งขันมากไป", tip: "แสดงความต้องการตรง ๆ โดยไม่กดคนอื่น", upTone: 0.9, revTone: -0.5 },
    { up: "วิสัยทัศน์ ภาวะผู้นำ และการพาเรื่องไปข้างหน้า", rev: "ใจร้อน ใช้อำนาจ หรือมองข้ามรายละเอียด", tip: "นำด้วยเป้าหมายที่ชัดและฟังข้อมูลหน้างาน", upTone: 1, revTone: -0.65 },
  ],
  cups: [
    { up: "การเปิดใจ ความรู้สึกใหม่ และการเยียวยา", rev: "เก็บความรู้สึกไว้หรือยังไม่พร้อมเปิดใจ", tip: "พูดความรู้สึกจริงโดยไม่คาดคั้นคำตอบ", upTone: 1.15, revTone: -0.45 },
    { up: "ความรู้สึกตรงกัน การจับมือ และความสัมพันธ์สองฝ่าย", rev: "ความรู้สึกไม่เท่ากันหรือสื่อสารไม่ตรงกัน", tip: "ถามและฟังกันตรง ๆ แทนการเดา", upTone: 1.25, revTone: -0.75 },
    { up: "การสนับสนุนจากกลุ่มเพื่อน ข่าวดี และการเฉลิมฉลอง", rev: "คนแทรก ความสัมพันธ์ซ้อน หรือสังคมพาออกนอกเรื่อง", tip: "แยกเสียงคนอื่นออกจากความต้องการของคู่กรณี", upTone: 0.85, revTone: -0.6 },
    { up: "ความเบื่อหรือมองไม่เห็นโอกาสที่อยู่ตรงหน้า", rev: "เริ่มกลับมาเปิดใจและเห็นทางเลือกใหม่", tip: "ทบทวนสิ่งที่มีอยู่ก่อนปฏิเสธ", upTone: -0.25, revTone: 0.55 },
    { up: "ความเสียใจ ผิดหวัง และจดจ่อกับสิ่งที่เสียไป", rev: "เริ่มยอมรับอดีต ฟื้นใจ และพร้อมเดินต่อ", tip: "ยอมรับสิ่งที่แก้ไม่ได้แล้วดูว่ายังเหลืออะไร", upTone: -0.95, revTone: 0.7 },
    { up: "อดีต ความผูกพันเดิม หรือคนเก่ากลับมาเกี่ยวข้อง", rev: "ติดอยู่กับอดีตหรือเริ่มตัดความทรงจำเดิม", tip: "ใช้บทเรียนเก่า แต่อย่าให้ความทรงจำตัดสินแทนปัจจุบัน", upTone: 0.45, revTone: -0.25 },
    { up: "ตัวเลือกมาก ความฝันมาก และยังแยกจริงกับคิดไม่ออก", rev: "เริ่มตัดตัวเลือกและเห็นความจริงชัดขึ้น", tip: "เลือกจากข้อเท็จจริงหนึ่งข้อที่ตรวจสอบได้", upTone: -0.35, revTone: 0.4 },
    { up: "การถอยจากสิ่งที่ไม่เติมเต็มเพื่อหาทางใหม่", rev: "อยากไปแต่ยังตัดใจไม่ได้ หรือกลับไปวงจรเดิม", tip: "ตัดสินจากสิ่งที่เกิดซ้ำ ไม่ใช่คำสัญญา", upTone: -0.35, revTone: -0.55 },
    { up: "ความสมหวัง ความพอใจ และสิ่งที่ปรารถนาใกล้เป็นจริง", rev: "ได้ไม่เต็มที่หรือคาดหวังว่าผลสำเร็จจะแก้ทุกอย่าง", tip: "ระบุให้ชัดว่าความสำเร็จแบบใดจึงจะพอ", upTone: 1.15, revTone: -0.25 },
    { up: "ความสุขร่วมกัน ความสัมพันธ์มั่นคง และการลงตัวระยะยาว", rev: "ความคาดหวังในครอบครัวหรือความสัมพันธ์ไม่ตรงกัน", tip: "คุยภาพอนาคตและความต้องการของแต่ละฝ่าย", upTone: 1.35, revTone: -0.65 },
    { up: "ข้อความทางใจ คำขอโทษ หรือความรู้สึกใหม่ที่เพิ่งเริ่ม", rev: "อารมณ์ยังไม่นิ่งหรือคำพูดหวานที่ยังไม่มีการกระทำ", tip: "ดูการกระทำหลังคำพูด", upTone: 0.55, revTone: -0.45 },
    { up: "การเข้าหาด้วยความรู้สึก คำชวน หรือข้อเสนอที่น่าพอใจ", rev: "ความโรแมนติกที่ไม่มั่นคงหรือสัญญาเกินจริง", tip: "รับฟังข้อเสนอแต่ตรวจความสม่ำเสมอ", upTone: 0.85, revTone: -0.6 },
    { up: "ความเข้าใจลึก ความอ่อนโยน และสัญชาตญาณที่แม่น", rev: "รับอารมณ์คนอื่นมากไปหรือใช้อารมณ์แทนข้อเท็จจริง", tip: "รักษาขอบเขตและตรวจสิ่งที่รู้สึกกับสิ่งที่เกิดจริง", upTone: 0.85, revTone: -0.55 },
    { up: "วุฒิภาวะทางอารมณ์และการควบคุมความรู้สึกได้", rev: "เก็บกด ควบคุมด้วยอารมณ์ หรือไม่พูดความจริงในใจ", tip: "สื่อสารอย่างนิ่งและรับผิดชอบต่อความรู้สึกตน", upTone: 0.85, revTone: -0.65 },
  ],
  swords: [
    { up: "ความจริงเปิดออก ความคิดชัด และต้องตัดสินใจเด็ดขาด", rev: "ข้อมูลสับสน คิดไม่ชัด หรือใช้คำพูดทำร้ายกัน", tip: "ยืนยันข้อเท็จจริงก่อนตัดสิน", upTone: 0.55, revTone: -0.7 },
    { up: "ทางตันชั่วคราวเพราะยังไม่ยอมเลือกหรือข้อมูลไม่ครบ", rev: "ความกดดันทำให้ต้องเลือกทั้งที่ยังไม่พร้อม", tip: "เปิดข้อมูลที่หลีกเลี่ยงอยู่แล้วกำหนดเส้นตาย", upTone: -0.25, revTone: -0.6 },
    { up: "ความเจ็บปวด คำพูดบาดใจ หรือความจริงที่ยอมรับยาก", rev: "แผลเริ่มสมาน แต่ความเจ็บเดิมยังมีผล", tip: "พูดถึงแผลตรง ๆ และหยุดทำสิ่งที่ทำให้เจ็บซ้ำ", upTone: -1.25, revTone: 0.15 },
    { up: "ต้องพัก หยุดการปะทะ และเว้นระยะก่อนคิดต่อ", rev: "พักไม่พอหรือถูกเร่งให้กลับไปทั้งที่ยังไม่พร้อม", tip: "หยุดตัดสินใจชั่วคราวและฟื้นพลัง", upTone: 0.05, revTone: -0.45 },
    { up: "ความขัดแย้งแบบมีคนชนะแต่ความสัมพันธ์เสีย", rev: "อยากยุติการปะทะแต่ยังมีความค้างคา", tip: "เลือกผลลัพธ์ที่ไม่ต้องเอาชนะอีกฝ่าย", upTone: -0.95, revTone: -0.2 },
    { up: "การออกจากช่วงยากและค่อย ๆ ไปสู่สภาพที่สงบกว่า", rev: "ยังออกจากปัญหาเดิมไม่ได้หรือมีเรื่องค้างตามมา", tip: "ตัดสิ่งที่พากลับสู่วงจรเดิม", upTone: 0.5, revTone: -0.55 },
    { up: "การปิดบัง หลบเลี่ยง หรือใช้กลยุทธ์โดยไม่เปิดไพ่ทั้งหมด", rev: "ความลับเริ่มเปิด การยอมรับผิด หรือหลอกตัวเองต่อไม่ไหว", tip: "ตรวจข้อมูลและอย่าเชื่อคำพูดที่ไม่มีหลักฐาน", upTone: -0.95, revTone: 0.25 },
    { up: "รู้สึกติดกับเพราะความกลัวและข้อจำกัดในความคิด", rev: "เริ่มเห็นทางออกและคืนอำนาจตัดสินใจให้ตนเอง", tip: "แยกข้อจำกัดจริงออกจากสิ่งที่กลัวไปเอง", upTone: -1, revTone: 0.55 },
    { up: "ความกังวล นอนไม่หลับ และคิดเหตุการณ์ร้ายซ้ำ ๆ", rev: "ความกังวลเริ่มคลาย หรือยังเก็บความเครียดไว้ลึก", tip: "หาข้อเท็จจริงและขอความช่วยเหลือแทนคิดคนเดียว", upTone: -1.2, revTone: 0.15 },
    { up: "การจบแบบเจ็บชัด แต่เป็นจุดต่ำสุดก่อนเริ่มใหม่", rev: "เริ่มฟื้นจากจุดแย่ หรือยังยื้อบทที่จบแล้ว", tip: "ยอมรับสิ่งที่จบและหยุดเสียพลังกับวิธีเดิม", upTone: -1.35, revTone: 0.3 },
    { up: "การสังเกต ตรวจสอบ และข่าวที่ต้องอ่านรายละเอียด", rev: "ข่าวลือ การสอดรู้ หรือข้อมูลที่ยังเชื่อไม่ได้", tip: "ตรวจแหล่งข้อมูลและถามให้ตรงประเด็น", upTone: 0.2, revTone: -0.55 },
    { up: "การบุกแก้ปัญหาอย่างเร็วและตรง", rev: "รีบปะทะ พูดแรง หรือเดินหน้าโดยไม่เห็นผลกระทบ", tip: "หยุดหนึ่งจังหวะก่อนตอบโต้", upTone: 0.15, revTone: -0.75 },
    { up: "ความชัดเจน ขอบเขต และการตัดสินจากประสบการณ์", rev: "เย็นชา วิจารณ์แรง หรือใช้เหตุผลตัดความรู้สึก", tip: "พูดตรงโดยไม่ทำลายความสัมพันธ์", upTone: 0.5, revTone: -0.55 },
    { up: "เหตุผล กติกา และอำนาจตัดสินใจที่ยึดหลัก", rev: "ใช้อำนาจกดดัน บิดข้อมูล หรือดื้อกับความคิดตน", tip: "ขอเกณฑ์ตัดสินที่โปร่งใสและตรวจสอบได้", upTone: 0.75, revTone: -0.8 },
  ],
  pentacles: [
    { up: "โอกาสด้านเงิน งาน หรือความมั่นคงที่จับต้องได้", rev: "พลาดโอกาส วางเงินผิดที่ หรือฐานยังไม่พร้อม", tip: "ตรวจเงื่อนไขและเริ่มจากสิ่งที่มีมูลค่าจริง", upTone: 1.2, revTone: -0.65 },
    { up: "การจัดสมดุลหลายภาระและปรับตัวตามสถานการณ์", rev: "ภาระชนกัน เงินหรืองานเริ่มควบคุมไม่อยู่", tip: "จัดลำดับและตัดหนึ่งภาระที่ไม่จำเป็น", upTone: 0.15, revTone: -0.65 },
    { up: "ผลงาน ความร่วมมือ และความเชี่ยวชาญที่ได้รับการเห็นคุณค่า", rev: "มาตรฐานไม่ตรงกัน ทีมไม่ร่วมมือ หรือผลงานยังไม่ผ่าน", tip: "ตกลงมาตรฐานและบทบาทก่อนทำต่อ", upTone: 0.85, revTone: -0.55 },
    { up: "การยึดของเดิมไว้แน่นเพราะต้องการความมั่นคง", rev: "เริ่มปล่อยสิ่งที่ยึดไว้ หรือใช้จ่ายจนเสียการควบคุม", tip: "แยกเงินสำรองออกจากสิ่งที่ยึดเพราะกลัว", upTone: -0.15, revTone: -0.35 },
    { up: "ภาวะขาดแคลน เสียความมั่นคง หรือรู้สึกไม่ได้รับการช่วยเหลือ", rev: "สถานการณ์เริ่มฟื้นและมองเห็นความช่วยเหลือ", tip: "ขอความช่วยเหลือและปิดรายจ่ายที่รั่ว", upTone: -1.05, revTone: 0.6 },
    { up: "การให้และรับที่เป็นธรรม รวมถึงความช่วยเหลือที่มาถูกจังหวะ", rev: "เงื่อนไขไม่เท่าเทียม หนี้บุญคุณ หรือให้รับฝ่ายเดียว", tip: "ทำเงื่อนไข ผลตอบแทน และขอบเขตให้ชัด", upTone: 0.65, revTone: -0.6 },
    { up: "การรอผล ประเมินความคุ้มค่า และต้องอดทนต่ออีกระยะ", rev: "ลงทุนแรงต่อแต่ผลไม่คุ้มหรือใจร้อนอยากเห็นผล", tip: "ตั้งจุดทบทวนว่าจะทำต่อ ปรับ หรือหยุด", upTone: 0.15, revTone: -0.55 },
    { up: "การฝึกฝน ทำงานละเอียด และผลดีจากความสม่ำเสมอ", rev: "งานลวก ซ้ำโดยไม่พัฒนา หรือหมดใจกับสิ่งที่ทำ", tip: "ยกระดับทักษะหนึ่งเรื่องและตรวจคุณภาพทุกครั้ง", upTone: 0.85, revTone: -0.55 },
    { up: "ความมั่นคงจากความสามารถตนเองและผลที่เก็บเกี่ยวได้", rev: "พึ่งภาพลักษณ์หรือใช้จ่ายเพื่อชดเชยความไม่มั่นใจ", tip: "วัดความสำเร็จจากฐานที่ยืนได้ด้วยตนเอง", upTone: 1.05, revTone: -0.45 },
    { up: "ความมั่นคงระยะยาว ทรัพย์สิน และแรงสนับสนุนจากครอบครัวหรือองค์กร", rev: "ปัญหาเรื่องทรัพย์สิน ครอบครัว หรือฐานระยะยาวไม่ลงตัว", tip: "คุยสิทธิ ความรับผิดชอบ และผลระยะยาวเป็นลายลักษณ์อักษร", upTone: 1.35, revTone: -0.75 },
    { up: "ข่าวเรื่องงาน เงิน หรือโอกาสเรียนรู้ที่พัฒนาเป็นผลจริงได้", rev: "ยังไม่เตรียมตัว ขาดวินัย หรือข้อเสนอยังไม่ชัด", tip: "ขอรายละเอียดและพิสูจน์ด้วยงานชิ้นเล็ก", upTone: 0.65, revTone: -0.45 },
    { up: "ความก้าวหน้าแบบช้าแต่มั่นคงและรับผิดชอบ", rev: "ติดอยู่กับกิจวัตร ดื้อกับวิธีเดิม หรือช้าจนพลาดจังหวะ", tip: "รักษาความสม่ำเสมอแต่กำหนดวันวัดผล", upTone: 0.55, revTone: -0.45 },
    { up: "การดูแลสิ่งต่าง ๆ อย่างเป็นรูปธรรมและบริหารทรัพยากรได้ดี", rev: "ทุ่มดูแลคนอื่นจนเสียฐานตนหรือกังวลเรื่องเงินมากไป", tip: "จัดงบ เวลา และพลังของตนก่อนรับภาระเพิ่ม", upTone: 0.95, revTone: -0.5 },
    { up: "ความมั่นคง ความสำเร็จทางวัตถุ และการตัดสินใจแบบมืออาชีพ", rev: "ยึดผลประโยชน์ ควบคุมมากไป หรือเสี่ยงเพราะมั่นใจเกินจริง", tip: "ยึดตัวเลขจริงและผลระยะยาวเป็นหลัก", upTone: 1.1, revTone: -0.75 },
  ],
};

const minorCards: Card[] = (Object.keys(suits) as Exclude<Suit, "major">[]).flatMap((suit) => {
  const s = suits[suit];
  return ranks.map((rank, index) => {
    const profile = minorProfiles[suit][index];
    const number = String(index + 1).padStart(2, "0");
    const isCourt = index >= 10;
    return {
      id: `${suit}-${number}`,
      nameTh: isCourt ? `${rank.th}${s.th}` : `${rank.th}${s.th}`,
      nameEn: isCourt ? `${rank.en} ${s.en}` : `${rank.en} of ${s.en}`,
      suit,
      image: commonsImage(`${s.file}${number}.jpg`),
      upright: profile.up,
      reversed: profile.rev,
      advice: profile.tip,
      uprightTone: profile.upTone,
      reversedTone: profile.revTone,
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

function detectIntent(question: string): QuestionIntent {
  if (/รู้สึก|คิดยังไง|คิดอย่างไร|รักเรา|ชอบเรา|มองเรา/.test(question)) return "feeling";
  if (/เมื่อไหร่|ตอนไหน|อีกนานไหม|กี่วัน|กี่เดือน|ปีไหน/.test(question)) return "when";
  if (/ทำไม|เพราะอะไร|สาเหตุ/.test(question)) return "why";
  if (/เลือก.*หรือ|ระหว่าง|อันไหน|ทางไหนดี/.test(question)) return "choice";
  if (/ไหม|หรือไม่|ได้ไหม|ดีไหม|ควรไหม|มีโอกาส/.test(question)) return "yesno";
  return "outcome";
}

function cardScore(card: DrawnCard) {
  return card.reversedDraw ? card.reversedTone : card.uprightTone;
}

function questionSubject(kind: QuestionKind) {
  const subjects: Record<QuestionKind, string> = {
    love: "ความสัมพันธ์นี้",
    work: "เรื่องงานนี้",
    money: "เรื่องเงินหรือทรัพย์สินนี้",
    health: "เรื่องสุขภาพนี้",
    decision: "ทางเลือกนี้",
    general: "เรื่องที่ถาม",
  };
  return subjects[kind];
}

function answerByContext(score: number, kind: QuestionKind) {
  const positive: Record<QuestionKind, string> = {
    love: "ความสัมพันธ์นี้มีแนวโน้มพัฒนาและได้รับการตอบรับที่ดีขึ้น",
    work: "เรื่องงานนี้มีแนวโน้มคืบหน้าและเกิดผลที่เป็นประโยชน์กับคุณ",
    money: "เรื่องเงินนี้มีแนวโน้มดีขึ้นหรือให้ผลคุ้มค่ากว่าเดิม",
    health: "แนวโน้มโดยรวมเอนมาทางฟื้นตัวหรือจัดการได้ดีขึ้น",
    decision: "ทางเลือกนี้มีแรงสนับสนุนและมีแนวโน้มไปต่อได้",
    general: "เรื่องที่ถามมีแนวโน้มคืบหน้าและคลี่คลายไปในทางที่ดีขึ้น",
  };
  const cautious: Record<QuestionKind, string> = {
    love: "ความสัมพันธ์นี้ยังไปต่อได้ แต่ต้องเคลียร์ความรู้สึกหรือความคาดหวังที่ไม่ตรงกันก่อน",
    work: "เรื่องงานนี้ไปต่อได้แบบมีเงื่อนไข แต่ยังมีรายละเอียดหรือคนที่ต้องจัดการ",
    money: "เรื่องเงินนี้ยังไม่เสีย แต่ไม่ควรตกลงจนกว่าจะตรวจตัวเลขและภาระให้ครบ",
    health: "อาการยังต้องติดตามจากข้อเท็จจริงและไม่ควรฝืนร่างกาย",
    decision: "ทางเลือกนี้ยังไม่ควรตอบตกลงทันที ต้องแก้เงื่อนไขสำคัญก่อน",
    general: "เรื่องที่ถามยังไปต่อได้ แต่ต้องแก้จุดค้างที่ไพ่ระบุให้ชัดก่อน",
  };
  const negative: Record<QuestionKind, string> = {
    love: "ความสัมพันธ์นี้มีแนวโน้มติดขัด ผิดหวัง หรือยังไม่ได้คำตอบตามที่หวัง",
    work: "เรื่องงานนี้มีแนวโน้มสะดุดหรือเสียเปรียบหากยังใช้วิธีเดิม",
    money: "เรื่องเงินนี้มีความเสี่ยงเสียประโยชน์มากกว่าคุ้มในจังหวะปัจจุบัน",
    health: "แนวโน้มเตือนให้หยุดฝืนและตรวจอาการกับผู้เชี่ยวชาญ",
    decision: "ทางเลือกนี้ยังไม่ควรไปต่อในสภาพปัจจุบัน",
    general: "เรื่องที่ถามมีแนวโน้มติดขัดหรือไม่เป็นตามหวังหากไม่มีการเปลี่ยนวิธี",
  };
  return score >= 0.55 ? positive[kind] : score <= -0.45 ? negative[kind] : cautious[kind];
}

function cardReading(card: DrawnCard, position: string, kind: QuestionKind, intent: QuestionIntent) {
  const score = cardScore(card);
  const meaning = card.reversedDraw ? card.reversed : card.upright;
  const contextAnswer = answerByContext(score, kind);
  const subject = questionSubject(kind);
  const consequence = score >= 0.55
    ? `จะช่วยให้${subject}เดินหน้า`
    : score <= -0.45
      ? `จะทำให้${subject}สะดุดหรือไม่เป็นตามหวัง`
      : `ต้องได้รับการจัดการก่อน${subject}จะชัดเจน`;
  const role = /อุปสรรค|แรงต้าน|กังวล|ต้องระวัง/.test(position)
    ? `จุดที่ต้องระวังคือ “${meaning}” หากปล่อยไว้ ภาวะนี้${consequence}`
    : /คำแนะนำ|ท่าที|แนวทาง/.test(position)
      ? `ทางที่ควรทำคือ “${card.advice}” เพื่อแก้หรือใช้ประโยชน์จากภาวะ “${meaning}”`
      : /ผลลัพธ์|ปลายทาง|อนาคต/.test(position)
        ? `${contextAnswer} ไพ่ปลายทางให้เหตุผลว่า “${meaning}”`
        : /ราก|ที่ผ่านมา|อิทธิพล/.test(position)
          ? `ต้นเหตุที่ยังมีผลอยู่คือ “${meaning}” และปัจจัยนี้${consequence}`
          : `สถานการณ์ในตำแหน่งนี้คือ “${meaning}” ซึ่ง${consequence}`;
  const intentLead: Record<QuestionIntent, string> = {
    yesno: score >= .55 ? "คำตอบจากไพ่ใบนี้: ค่อนข้างใช่หรือมีโอกาสสูง" : score <= -.45 ? "คำตอบจากไพ่ใบนี้: ยังไม่ใช่หรือไม่ควรในตอนนี้" : "คำตอบจากไพ่ใบนี้: เป็นไปได้ แต่ต้องมีเงื่อนไข",
    when: score >= .55 ? "ไพ่ใบนี้บอกว่าเรื่องมีโอกาสขยับในระยะใกล้" : score <= -.45 ? "ไพ่ใบนี้บอกว่ายังไม่เกิดเร็ว ๆ นี้" : "ไพ่ใบนี้บอกว่าต้องรอเงื่อนไขหนึ่งคลี่คลายก่อน",
    why: `สาเหตุที่ไพ่ชี้ให้เห็นคือ ${meaning}`,
    feeling: score >= .55 ? "ความรู้สึกจากไพ่ใบนี้เป็นบวกและยังเปิดรับคุณ" : score <= -.45 ? "ความรู้สึกจากไพ่ใบนี้ยังปิดกั้น ผิดหวัง หรือไม่พร้อม" : "มีความรู้สึกอยู่ แต่ยังลังเลและไม่แสดงออกทั้งหมด",
    choice: score >= .55 ? "ทางเลือกที่ไพ่ใบนี้แทนมีข้อดีและควรพิจารณาไปต่อ" : score <= -.45 ? "ทางเลือกที่ไพ่ใบนี้แทนมีความเสี่ยงเด่นและยังไม่ควรเลือก" : "ทางเลือกนี้พอไปได้ แต่ต้องตรวจข้อมูลเพิ่ม",
    outcome: score >= .55 ? `คำทำนายตรง ๆ: ${subject}มีแนวโน้มดีขึ้นหรือเดินหน้า` : score <= -.45 ? `คำทำนายตรง ๆ: ${subject}มีแนวโน้มติดขัดหรือไม่เป็นตามหวัง` : `คำทำนายตรง ๆ: ${subject}ยังไปต่อได้ แต่ต้องแก้เงื่อนไขของไพ่ใบนี้ก่อน`,
  };
  return { meaning, answer: `${intentLead[intent]} — ${role}` };
}

function overallReading(cards: DrawnCard[], kind: QuestionKind, intent: QuestionIntent) {
  const weights = cards.map((_, index) => index === cards.length - 1 ? 1.55 : index === 0 ? 1.15 : 1);
  const score = cards.reduce((sum, card, index) => sum + cardScore(card) * weights[index], 0) / weights.reduce((sum, weight) => sum + weight, 0);
  const last = cards[cards.length - 1];
  const subject = questionSubject(kind);
  const sorted = [...cards].sort((a, b) => cardScore(a) - cardScore(b));
  const risk = sorted[0];
  const support = sorted[sorted.length - 1];
  const lastMeaning = last.reversedDraw ? last.reversed : last.upright;
  const timing = last.suit === "wands"
    ? "มีแนวโน้มขยับค่อนข้างเร็วในระดับวันถึงไม่กี่สัปดาห์"
    : last.suit === "pentacles"
      ? "เป็นจังหวะค่อยเป็นค่อยไป ต้องเผื่อเวลาหลายสัปดาห์ถึงหลายเดือน"
      : last.suit === "cups"
        ? "จะขยับเมื่อความรู้สึกหรือความสัมพันธ์ชัดขึ้น มากกว่าขึ้นกับวันตายตัว"
        : last.suit === "swords"
          ? "จะขยับหลังมีข้อมูล การพูดคุย หรือการตัดสินใจที่ชัด"
          : "จังหวะขึ้นกับการเปลี่ยนแปลงสำคัญที่ไพ่ชุดใหญ่กำลังชี้";
  const direct: Record<QuestionIntent, string> = {
    yesno: score >= .4 ? "คำตอบตรง ๆ: มีโอกาสเป็นไปได้ค่อนข้างมาก" : score <= -.35 ? "คำตอบตรง ๆ: ยังไม่ใช่หรือไม่ควรเดินหน้าตอนนี้" : "คำตอบตรง ๆ: เป็นไปได้ แต่ต้องแก้เงื่อนไขสำคัญก่อน",
    when: score >= .4 ? `คำตอบเรื่องเวลา: ${timing}` : score <= -.35 ? "คำตอบเรื่องเวลา: ยังไม่เกิดเร็ว ๆ นี้ เพราะมีอุปสรรคที่ต้องแก้ก่อน" : `คำตอบเรื่องเวลา: ${timing}`,
    why: `สาเหตุหลักคือ “${risk.reversedDraw ? risk.reversed : risk.upright}” ซึ่งกำลังกด${subject}ไว้`,
    feeling: score >= .4 ? "คำตอบตรง ๆ: อีกฝ่ายมีความรู้สึกในทางบวกและยังเปิดรับคุณ" : score <= -.35 ? "คำตอบตรง ๆ: อีกฝ่ายยังปิดกั้น ผิดหวัง หรือไม่พร้อมเดินหน้า" : "คำตอบตรง ๆ: มีความรู้สึกอยู่ แต่ยังลังเลและไม่พร้อมแสดงออกชัด",
    choice: score >= .4 ? "คำตอบตรง ๆ: ทางเลือกนี้มีข้อดีมากกว่าและพอเดินหน้าต่อได้" : score <= -.35 ? "คำตอบตรง ๆ: ทางเลือกนี้มีความเสี่ยงเด่นและยังไม่ควรเลือก" : "คำตอบตรง ๆ: ทางเลือกนี้ไปได้แบบมีเงื่อนไข ต้องเปรียบเทียบข้อมูลเพิ่ม",
    outcome: score >= .4 ? `คำทำนายตรง ๆ: ${subject}มีแนวโน้มคืบหน้าและจบดีขึ้น` : score <= -.35 ? `คำทำนายตรง ๆ: ${subject}มีแนวโน้มติดขัดหรือไม่เป็นตามหวังถ้ายังใช้วิธีเดิม` : `คำทำนายตรง ๆ: ${subject}ยังไปต่อได้ แต่ต้องแก้จุดเสี่ยงก่อนจึงจะเห็นผล`,
  };
  const reasons: string[] = [];
  if (cardScore(risk) <= -0.25) reasons.push(`จุดเสี่ยงหลักคือ ${risk.nameTh}${risk.reversedDraw ? "กลับหัว" : "ตั้งตรง"}: ${risk.reversedDraw ? risk.reversed : risk.upright}`);
  if (cardScore(support) >= 0.25 && support.id !== risk.id) reasons.push(`แรงสนับสนุนคือ ${support.nameTh}${support.reversedDraw ? "กลับหัว" : "ตั้งตรง"}: ${support.reversedDraw ? support.reversed : support.upright}`);
  reasons.push(`ไพ่ตำแหน่งสุดท้ายคือ ${last.nameTh}${last.reversedDraw ? "กลับหัว" : "ตั้งตรง"} จึงสรุปปลายทางจาก “${lastMeaning}”`);
  const firstStep = cardScore(risk) <= -0.25 ? risk.advice : last.advice;
  const followUp = firstStep !== last.advice ? ` จากนั้นจึง${last.advice}` : "";
  const healthNote = kind === "health" ? " หากมีอาการจริงให้ใช้คำแนะนำแพทย์เป็นหลัก" : "";
  return {
    headline: direct[intent],
    reason: reasons.join(" ขณะเดียวกัน "),
    advice: `สิ่งที่ควรทำก่อนคือ ${firstStep}${followUp}${healthNote}`,
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
  const [phase, setPhase] = useState<"idle" | "shuffle" | "deal">("idle");
  const kind = useMemo(() => classifyQuestion(question), [question]);
  const intent = useMemo(() => detectIntent(question), [question]);
  const overall = useMemo(() => cards.length ? overallReading(cards, kind, intent) : null, [cards, kind, intent]);

  function predict() {
    if (!question.trim() || revealing) return;
    setRevealing(true);
    setPhase("shuffle");
    setCards([]);
    window.setTimeout(() => {
      setPhase("deal");
      setCards(drawCards(count));
      setView("overall");
    }, 900);
    window.setTimeout(() => {
      setRevealing(false);
      setPhase("idle");
      window.setTimeout(() => document.getElementById("reading")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }, 1650);
  }

  function reset() {
    setCards([]);
    setQuestion("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main>
      <section className="hero" aria-labelledby="page-title">
        <nav className="nav-shell">
          <a className="brand" href="#top" aria-label="หน้าแรก ไพ่ยิปซีตอบคำถาม"><span>✦</span> ไพ่ยิปซี</a>
        </nav>

        <div id="top" className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">TAROT READING</p>
            <h1 id="page-title">ถามไพ่<br />หนึ่งคำถาม</h1>
            <p className="intro">เขียนเรื่องที่อยากรู้ แล้วเลือกจำนวนไพ่</p>
          </div>

          <div className="card-fan" aria-hidden="true">
            <div className="fan-card fan-left"><CardBack /></div>
            <div className="fan-card fan-center"><CardBack /></div>
            <div className="fan-card fan-right"><CardBack /></div>
          </div>

          <form className="question-panel" onSubmit={(event) => { event.preventDefault(); predict(); }}>
            <div className="step-label"><p>คำถามของคุณ</p></div>
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

            <div className="step-label second"><p>จำนวนไพ่</p></div>
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
                  <small>{option === 1 ? "ตรง" : option === 3 ? "พอดี" : option === 5 ? "ละเอียด" : "ลึก"}</small>
                </button>
              ))}
            </div>
            <button className="predict-button" type="submit" disabled={!question.trim() || revealing}>
              {revealing ? "กำลังเปิดไพ่…" : "เริ่มทำนาย"}<span aria-hidden="true">✦</span>
            </button>
          </form>
        </div>
      </section>

      {revealing && (
        <div className={`ritual-overlay ${phase}`} aria-live="polite" aria-label={phase === "shuffle" ? "กำลังสับไพ่" : "กำลังวางไพ่"}>
          <div className="ritual-glow" />
          <div className="shuffle-cards"><CardBack small /><CardBack small /><CardBack small /><CardBack small /><CardBack small /></div>
          <p>{phase === "shuffle" ? "กำลังสับไพ่" : "กำลังวางไพ่"}</p>
        </div>
      )}

      {cards.length > 0 && overall && (
        <section id="reading" className="reading-section">
          <div className="reading-head">
            <p className="eyebrow dark">ไพ่ของคุณ • {cards.length} ใบ</p>
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
                <div className="flip-card">
                  <div className="flip-card-inner">
                    <div className="flip-card-back"><CardBack /></div>
                    <div className={card.reversedDraw ? "card-image reversed" : "card-image"}>
                      <img src={card.image} alt={`ไพ่ ${card.nameTh}`} referrerPolicy="no-referrer" />
                    </div>
                  </div>
                </div>
                <strong>{card.nameTh}</strong>
                <small>{card.reversedDraw ? "กลับหัว" : "ตั้งตรง"} • {spreads[cards.length][index]}</small>
              </button>
            ))}
          </div>

          {view === "overall" ? (
            <article className="overall-panel" role="tabpanel">
              <div>
                <p className="section-kicker">คำตอบแบบตรง ๆ</p>
                <h3>{overall.headline}</h3>
                <div className="answer-block"><strong>เพราะอะไร</strong><p>{overall.reason}</p></div>
                <div className="answer-block advice"><strong>ควรทำอย่างไร</strong><p>{overall.advice}</p></div>
              </div>
            </article>
          ) : (
            <div className="individual-list" role="tabpanel">
              {cards.map((card, index) => (
                <article id={`card-${index}`} className="individual-card" key={card.id}>
                  <div className={card.reversedDraw ? "mini-card reversed" : "mini-card"}><img src={card.image} alt="" referrerPolicy="no-referrer" /></div>
                  <div className="card-explanation">
                    <p className="section-kicker">ใบที่ {index + 1} • {spreads[cards.length][index]}</p>
                    <h3>{card.nameTh} <span>{card.nameEn}</span></h3>
                    <span className={card.reversedDraw ? "orientation reversed-label" : "orientation"}>{card.reversedDraw ? "ไพ่กลับหัว" : "ไพ่ตั้งตรง"}</span>
                    {(() => {
                      const reading = cardReading(card, spreads[cards.length][index], kind, intent);
                      return <>
                        <div className="meaning-row"><strong>ไพ่หมายถึงอะไร</strong><p>{reading.meaning}</p></div>
                        <div className="meaning-row direct"><strong>คำทำนายในตำแหน่งนี้</strong><p>{reading.answer}</p></div>
                      </>;
                    })()}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="reading-actions">
            <button className="secondary-button" onClick={predict}>เปิดไพ่ใหม่</button>
            <button className="text-button" onClick={reset}>ถามคำถามใหม่</button>
          </div>
        </section>
      )}

      <footer>
        <p>ใช้ไพ่เพื่อทบทวนตนเอง ไม่แทนคำแนะนำทางการแพทย์ กฎหมาย หรือการเงิน</p>
      </footer>
    </main>
  );
}
