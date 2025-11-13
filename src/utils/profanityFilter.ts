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

// --- 2) Profanity words list (Thai + English) ---
const rawBadWords = [
  // ========== ภาษาไทย (Thai) ==========
  
  // คำผสมยาว (ต้องอยู่บนสุด)
  'ไอ้เหี้ย', 'ไอ้สัส', 'ไอ้ควาย', 'ไอ้สัตว์', 'ไอ้เวร', 'ไอ้บ้า', 'ไอ้โง่', 'ไอ้ชาติชั่ว',
  'ไอ้เด้ง', 'ไอ้ฟันหอม', 'ไอ้หำ', 'ไอ้เลว', 'ไอ้ระยำ', 'ไอ้ทุเรศ', 'ไอ้ห่วย',
  'อีเหี้ย', 'อีสัตว์', 'อีควาย', 'อีเวร', 'อีบ้า', 'อีโง่', 'อีชาติชั่ว',
  'อีตัว', 'อีนั่น', 'อีนี่', 'อีเด้ง', 'อีฟันหอม', 'อีแรด', 'อีหำ', 'อีเลว', 'อีระยำ',
  'แม่งเอ้ย', 'แม่เจ้า', 'พ่อมึง', 'แม่มึง', 'ตายบ้าง', 'ตายซะ', 'ไปตาย',
  'เหี้ยแหละ', 'สัสๆ', 'ชิบหาย', 'ส้นตีน', 'หน้าตัวเมีย', 'โคตรเหี้ย',
  'มึงวะ', 'กูวะ', 'เวรเอ้ย', 'แม่งเอ๊ย', 'เว้ยวะ', 'ควายวะ',
  'หน้าหมา', 'หน้าด้าน', 'กากบาท', 'ตอแหล', 'หน้าตัวเมีย', 'หน้าหี',
  'ไปตายเหอะ', 'ตายได้แล้ว', 'ขอให้ตาย', 'ไปตายไป', 'ไปตายซะ',
  'ระยำตับ', 'เวรตัว', 'สัตว์นรก', 'เดนชาติ', 'จองหอง',
  'ดีตาย', 'ตายสิ', 'ไปสิ', 'ตายซะที', 'ตายแล้วกัน',
  
  // คำเดี่ยวไทย - คำด่าทั่วไป
  'เหี้ย', 'สัส', 'สาส', 'ควาย', 'สัตว์', 'บ้า', 'โง่', 'เชี่ย',
  'แม่ง', 'แม่ม', 'พ่อง', 'มึง', 'กู', 'เอ็ง', 'มัน',
  'เวร', 'ชิบ', 'ชิบหาย', 'ห่า', 'หี', 'ควย', 'จู๋', 'จิ๋ม',
  'กาก', 'เยี่ยม', 'เยี่ย', 'ระยำ', 'วะ', 'หว่า', 'เว้ย',
  'อี', 'ไอ้', 'ตัวเมีย', 'ตัวผู้',
  
  // คำหยาบทางเพศ
  'เย็ด', 'เอา', 'ซอย', 'ปี้', 'เสียว', 'หมอย', 'ขี้', 'ฉี่',
  'นม', 'นมใหญ่', 'ก้น', 'ตูด', 'ตูดใหญ่', 'โป๊', 'แก้ผ้า',
  'แตก', 'ฟิน', 'ดูด', 'ลิ้น', 'ปาก',
  
  // คำด่าครอบครัว
  'พ่อมึงตาย', 'แม่มึงตาย', 'ตายพ่อ', 'ตายแม่', 'ตายปู่', 'ตายย่า',
  'พ่อง', 'แม่ง', 'ตาง', 'ยายง', 'พี่ง', 'น้องง',
  
  // คำด่าสัตว์
  'หมา', 'สุนัข', 'ไก่', 'หมู', 'วัว', 'ควาย', 'ลิง', 'กบ', 'แรด',
  'งูพิษ', 'ปีศาจ', 'มาร', 'ยักษ์', 'ผี', 'ปอบ',
  
  // คำด่าอวัยวะเพศ
  'หำ', 'ควย', 'จู๋', 'ไอ้จู๋', 'น้องชาย', 'กระเจี๊ยว',
  'หี', 'จิ๋ม', 'จิ๋มดำ', 'ช่อง', 'รู',
  
  // คำหยาบเบาๆ
  'เหี้ยน', 'เหี้ยก', 'สิครับ', 'สิคะ', 'เฮ้ย', 'หัวโล้น',
  'ตาแดง', 'คนบ้า', 'โรคจิต', 'ไอ้งี่เง่า', 'ไอ้เบื้อก',
  'ลูกหมา', 'ลูกหมาป่า', 'เด็กเหี้ย', 'พวกมึง',
  
  // คำเพี้ยน/ย่อ (ภาษาโซเชียล)
  'ส้ส', 'ห้า', 'ก้ว', 'ม้ง', 'ก้', 'ง้วย',
  'เห้ย', 'ช้บ', 'ช้ป', 'ส้ด', 'ฮ้า', 'ห้ว',
  'ส ั ส', 'เ ห ี ้ ย', 'ม ึ ง', 'ก ู', // คำที่ใส่เว้นวรรค
  'ซัส', 'ซัด', 'ซัส', 'ส๊าด', 'ส๋าด',
  'เหี๊ย', 'เหี๋ย', 'เฮีย', 'เฮียก', 'เห่ย',
  'มึก', 'มึน', 'กูด', 'กูร',
  
  // คำสแลงโซเชียล/Gen Z
  'ซ่าส์', 'ซ๊าซ', 'เซ่ส', 'เซ้ส', 'เซิส',
  'โครตบ้า', 'โครตโง่', 'เวอร์สัตว์', 'แบดสัด',
  'ซัดดี้', 'ฟั๊กกิ้ง', 'ชิบบาย', 'เชี้ย',
  'เหี้ยน', 'สัสวงศ์', 'ควายยยย', 'บ้าาาาา',
  'พ่อกู', 'แม่กู', 'กูเอง', 'มึงเอง',
  'เด็กควาย', 'เด็กบ้า', 'พวกสัตว์', 'คนเหี้ย',
  'จะไปตาย', 'ตายไปเลย', 'ควรตาย',
  
  // คำด่าเพิ่มเติม
  'เปรต', 'ตัณหา', 'กะหรี่', 'โสเภณี', 'ซากศพ',
  'ซั่ม', 'สันดาน', 'ด่าง', 'ทราม', 'ต่ำช้า',
  'เลว', 'เลวทราม', 'ชั่วช้า', 'ชั่วร้าย', 'ชาติชั่ว',
  'หมาบ้า', 'หมาจิ้งจอก', 'หมาป่า', 'สุนัขบ้า',
  'ตัวประหลาด', 'ตัวเปรต', 'ตัวร้าย', 'ตัวชั่ว',
  'โรคจิตฆ่า', 'ฆ่า', 'ฟัน', 'แทง', 'ยิง',
  'อีดอก', 'อีทุเรศ', 'อีชาติหมา', 'อีชาติสัตว์',
  'ไอ้ดอก', 'ไอ้ทุเรศ', 'ไอ้ชาติหมา', 'ไอ้ชาติสัตว์',
  
  // คำหยาบเกี่ยวกับความสามารถ
  'ปัญญาอ่อน', 'สมองบวม', 'สมองกุด', 'ไอคิวต่ำ',
  'ปัญญาควาย', 'ไม่มีสมอง', 'สมองน้อย', 'โง่เขลา',
  'เซ่อ', 'โง่เง่า', 'โง่จัง', 'โง่มาก', 'โง่สัส',
  
  // คำด่าลักษณะ
  'หน้าเหี้ย', 'หน้าสัส', 'หน้าตัก', 'หน้าบาน',
  'หน้าควาย', 'หน้าเชี่ย', 'หน้าขี้หมา', 'หน้าขี้ควาย',
  'ขี้หน้า', 'น่าเกลียด', 'น่ารังเกียจ', 'น่าขยะแขยง',
  'อ้วนเหี้ย', 'ผอมสัส', 'เตี้ยควาย', 'สูงสัตว์',
  
  // ========== English ==========
  
  // Compound phrases (must be on top)
  'son of a bitch', 'piece of shit', 'motherfucker', 'mother fucker',
  'dumb ass', 'smart ass', 'bull shit', 'horse shit', 'holy shit',
  'fuck you', 'fuck off', 'fuck this', 'fuck that', 'fucking hell',
  'piss off', 'shut up', 'shut the fuck up', 'kiss my ass',
  'go to hell', 'go fuck yourself', 'suck my dick', 'eat shit',
  'what the fuck', 'what the hell', 'for fuck sake', 'god damn it',
  'jesus christ', 'son of bitch', 'dirty bastard', 'dumb fuck',
  'fuck boy', 'fuck girl', 'ass hole', 'jack ass', 'dip shit',
  'shit head', 'dick head', 'cock sucker', 'pussy ass', 'bitch ass',
  
  // Strong profanity
  'fuck', 'fucking', 'fucked', 'fucker', 'fucks', 'fuckin',
  'shit', 'shitty', 'shits', 'shitting', 'shitted',
  'bitch', 'bitches', 'bitching', 'bitchy', 'son of bitch',
  'damn', 'damned', 'dammit', 'goddamn', 'god damn',
  'hell', 'hellish', 'hells',
  
  // Sexual/Vulgar
  'ass', 'asses', 'asshat', 'asshole', 'assholes',
  'bastard', 'bastards', 'crap', 'crappy', 'craps',
  'piss', 'pissed', 'pissing', 'pisses', 'pisser',
  'dick', 'dicks', 'dickhead', 'cock', 'cocks',
  'pussy', 'pussies', 'vagina', 'penis', 'tits',
  'whore', 'whores', 'slut', 'sluts', 'slutty',
  'prostitute', 'hooker', 'hoe', 'hoes',
  
  // Discriminatory slurs
  'fag', 'faggot', 'faggots', 'homo', 'gay boy',
  'nigger', 'nigga', 'niggas', 'negro', 'coon',
  'chink', 'gook', 'spic', 'kike', 'wetback',
  
  // Insults
  'retard', 'retarded', 'retards', 'idiot', 'idiots', 'idiotic',
  'moron', 'moronic', 'imbecile', 'stupid', 'dumb',
  'loser', 'losers', 'pathetic', 'worthless',
  'ugly', 'disgusting', 'gross', 'nasty',
  
  // Mild profanity
  'cunt', 'twat', 'prick', 'wanker', 'tosser',
  'bollocks', 'bullocks', 'bloody', 'blimey',
  'bugger', 'sod', 'git', 'pillock',
  
  // Internet slang/abbreviations
  'wtf', 'stfu', 'gtfo', 'stfd', 'ffs',
  'omfg', 'jfc', 'smh', 'pos', 'sob',
  
  // Leetspeak & common bypasses
  'fuk', 'fck', 'fvck', 'phuck', 'phuk', 'fuq', 'fux',
  'sh1t', 'sh!t', 'sh*t', 'shyt', 'shiet', 'shite',
  'b1tch', 'b!tch', 'b*tch', 'biatch', 'beatch', 'biotch',
  'a$$', 'azz', 'asz', '@ss', 'a55',
  'd1ck', 'd!ck', 'd*ck', 'dik', 'dck',
  'p1ss', 'p!ss', 'pizz', 'pss',
  'h3ll', 'h@ll', 'heck', 'hecks',
  'd@mn', 'd4mn', 'dam', 'dang',
  'fecker', 'fokker', 'fooker',
  
  // Creative variations
  'effing', 'freaking', 'frickin', 'fricking',
  'darn', 'darnit', 'shoot', 'sheesh',
  'crud', 'drat', 'rats', 'gosh',
  
  // Vulgar acts
  'masturbate', 'jerk off', 'jack off', 'wank',
  'blow job', 'blowjob', 'handjob', 'hand job',
  'orgasm', 'cum', 'cumming', 'ejaculate',
  'rape', 'raping', 'molest', 'molesting',
  
  // Body parts (vulgar context)
  'tit', 'titty', 'titties', 'boob', 'boobs', 'boobies',
  'booty', 'butt', 'butthole', 'anus', 'rectum',
  'balls', 'ballsack', 'testicles', 'nuts', 'sack',
  
  // Additional English profanity
  'screw you', 'screw off', 'piss on you', 'shove it',
  'bite me', 'blow me', 'fuck off mate', 'sod off',
  'bugger off', 'get fucked', 'go die', 'drop dead',
  'eat a dick', 'suck it', 'up yours', 'your mom',
  'your mama', 'yo mama', 'ya mum', 'yer mum',
  
  // More strong profanity variations
  'motherfucking', 'muthafucka', 'mofo', 'mutha',
  'fucktard', 'fuckface', 'fuckwit', 'fuckstick',
  'shitface', 'shitbag', 'shitstain', 'shithole',
  'bitchface', 'son of whore', 'little bitch',
  'dumbfuck', 'dumbshit', 'dumbcunt',
  
  // Sexual harassment terms
  'sexual', 'sexy bitch', 'hot ass', 'nice tits',
  'show me', 'send nudes', 'dick pic', 'nude pic',
  'horny', 'turned on', 'hard on', 'boner',
  'semen', 'sperm', 'jizz', 'pre cum', 'precum',
  'anal', 'oral sex', 'sixty nine', '69',
  'gang bang', 'threesome', 'foursome', 'orgy',
  'porn', 'porno', 'pornography', 'xxx',
  'milf', 'dilf', 'gilf', 'cougar',
  
  // Violent/threatening terms
  'kill yourself', 'kys', 'die bitch', 'ima kill you',
  'murder', 'slaughter', 'butcher', 'mutilate',
  'torture', 'beat you', 'punch you', 'kick your ass',
  'shoot you', 'stab you', 'choke you', 'strangle',
  
  // More discriminatory slurs
  'tranny', 'shemale', 'ladyboy', 'heshe',
  'dyke', 'lesbo', 'carpet muncher',
  'beaner', 'towelhead', 'raghead', 'sand nigger',
  'white trash', 'redneck', 'hillbilly', 'cracker',
  'trailer trash', 'inbred',
  
  // More insults & put-downs
  'scumbag', 'dirtbag', 'trash', 'garbage',
  'waste of space', 'waste of life', 'useless',
  'nobody', 'nothing', 'failure', 'reject',
  'freak', 'weirdo', 'creep', 'creepy',
  'pervert', 'perv', 'sicko', 'psycho',
  'mental', 'crazy', 'insane', 'lunatic',
  'degenerate', 'depraved', 'sick fuck',
  
  // Internet toxic slang
  'noob', 'newbie', 'scrub', 'pleb', 'peasant',
  'git gud', 'get rekt', 'rekt', 'pwned', 'owned',
  'trash talk', 'tryhard', 'sweaty', 'toxic',
  'cancer', 'aids', 'ebola', 'autistic', 'autism',
  'down syndrome', 'downs', 'spastic', 'spaz',
  
  // More leetspeak variations
  'fvk', 'fuk u', 'fuk off', 'f u c k',
  'sh!thead', 'b!7ch', 'a$$hole', 'a55hole',
  'd!ckhead', 'c0ck', 'c0cksucker', 'coksukr',
  'pu$$y', 'pvss7', 'wh0re', 'sl*t',
  'fag0t', 'f@ggot', 'n1gger', 'n!gga',
  'fuk1ng', 'sh1tt1ng', 'b1tch1ng',
  
  // More creative bypasses
  'fokking', 'fawking', 'facking', 'fooking',
  'shiit', 'shiz', 'shizz', 'sheit', 'sheeet',
  'beeyotch', 'beyotch', 'beyatch', 'beeatch',
  'azzhole', 'arsehole', 'arsewipe', 'asswipe',
  'dickwad', 'dickweed', 'cockmuncher', 'knobhead',
  'bellend', 'numpty', 'muppet', 'plonker',
  
  // Misc vulgar
  'go fuck', 'go die', 'go hang', 'go jump',
  'kms', 'kill me', 'end me', 'rope',
  'neck yourself', 'hang yourself', 'shoot yourself',
  'overdose', 'drink bleach', 'eat poison',
  'jump off', 'slice your wrists', 'cut yourself'
]

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

