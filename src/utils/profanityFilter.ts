// ============================================
// 🚀 OPTIMIZED PROFANITY FILTER
// ============================================
// Performance: O(n) where n = text length
// Pre-compiled regex + Normalization

// --- 1) Normalize ข้อความ (ทำให้จับคำเพี้ยนได้ดีขึ้น) ---
export function normalizeThai(input: string): string {
  if (!input) return ''
  
  return input
    .normalize('NFKD')                           // แยกสระ/วรรณยุกต์
    .replace(/\p{M}+/gu, '')                     // ตัดสระ/วรรณยุกต์ประกอบ
    .replace(/[\u200B-\u200D\uFEFF]/g, '')       // ตัด zero-width characters
    .toLowerCase()                               // lowercase
    .replace(/[\s.,!?;:'"()[\]{}/\\|_*~`^=+-]+/g, ' ') // เหลือช่องว่างเดียว
    .replace(/(.)\1{2,}/g, '$1$1')              // ตัวซ้ำยาวๆ เหลือแค่ 2 ตัว (เช่น "สสสสัส" → "สสัส")
    .trim()
}

import profanityWords from '../data/profanityWords.json'

// --- 2) Profanity words list (loaded from JSON) ---
const rawBadWords = (Array.isArray(profanityWords) ? profanityWords : [])
  .map((word) => (typeof word === 'string' ? word.trim() : ''))
  .filter((word) => word.length > 0)

// --- 3) Escape regex special characters ---
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// --- 4) Pre-process: Normalize + Sort by length (ทำครั้งเดียว) ---
const NORMALIZED_BADWORDS = rawBadWords
  .map(normalizeThai)
  .sort((a, b) => b.length - a.length) // ยาวก่อน เพื่อให้แมตช์คำยาวสุด

// --- 5) Pre-compile regex (ทำครั้งเดียว) ---
// ใช้ boundary pattern: ไม่ใช่ตัวอักษร/ตัวเลข หรือ ขอบข้อความ
const alternation = NORMALIZED_BADWORDS.map(escapeRegex).join('|')
const BADWORD_RE = new RegExp(
  `(^|[^\\p{L}\\p{N}])(?:${alternation})(?=$|[^\\p{L}\\p{N}])`,
  'giu'
)

// --- 6) Main check function (O(n)) ---
const checkThaiProfanity = (text: string): boolean => {
  if (!text?.trim()) return false
  
  const normalized = normalizeThai(text)
  BADWORD_RE.lastIndex = 0
  return BADWORD_RE.test(normalized)
}

// --- 7) Export main check function ---
export const checkProfanity = (text: string): boolean => {
  return checkThaiProfanity(text)
}

// --- 8) Get matched profanity words (สำหรับ debug/report) ---
export const getProfanityWords = (text: string): string[] => {
  if (!text?.trim()) return []
  
  const normalized = normalizeThai(text)
  const found = new Set<string>()
  
  BADWORD_RE.lastIndex = 0
  let match: RegExpExecArray | null
  
  while ((match = BADWORD_RE.exec(normalized))) {
    // match[0] มีอักขระก่อนหน้า + คำหยาบ
    // ตัดอักขระที่ไม่ใช่ตัวอักษร/ตัวเลขออก
    const matched = match[0].replace(/^[^\p{L}\p{N}]+/u, '').replace(/[^\p{L}\p{N}]+$/u, '')
    if (matched) {
      found.add(matched)
    }
  }
  
  return [...found]
}

// --- 9) Censor text (แทนที่ด้วย ***) ---
export const filterProfanity = (text: string): string => {
  if (!text?.trim()) return text
  
  const normalized = normalizeThai(text)
  const ranges: Array<{ start: number; end: number }> = []
  
  // หา position ของคำหยาบใน normalized text
  BADWORD_RE.lastIndex = 0
  let match: RegExpExecArray | null
  
  while ((match = BADWORD_RE.exec(normalized))) {
    const before = match[1] ?? ''
    const start = match.index + before.length
    const end = BADWORD_RE.lastIndex
    ranges.push({ start, end })
  }
  
  if (ranges.length === 0) return text
  
  // สร้าง map ระหว่าง normalized index กับ original index (คร่าวๆ)
  // วิธีง่าย: ใช้ความยาวเดิมไปเลย เนื่องจากการ normalize ส่วนใหญ่ลดความยาวเล็กน้อย
  // สำหรับ production แบบแม่นยำ ต้องทำ char-by-char mapping
  
  // แบบง่าย: แทนที่ทั้งข้อความด้วย ***
  let result = text
  const sortedBadWords = [...rawBadWords].sort((a, b) => b.length - a.length)
  
  for (const badWord of sortedBadWords) {
    const regex = new RegExp(
      `(^|[^\\p{L}\\p{N}])(${escapeRegex(badWord)})(?=$|[^\\p{L}\\p{N}])`,
      'giu'
    )
    result = result.replace(regex, (_match, before, word) => {
      return before + '*'.repeat(word.length)
    })
  }
  
  return result
}

