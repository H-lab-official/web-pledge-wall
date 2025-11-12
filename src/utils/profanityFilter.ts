import { Filter } from 'bad-words'

// Thai profanity words (add more as needed)
const thaiBadWords = [
  'บ้า', 'โง่', 'ควาย', 'สัตว์', 'ส้นตีน',
  'อี', 'ไอ้', 'มึง', 'กู', 'เย็ด', 'ควย',
  'วะ', 'สัส', 'สาส', 'เวร', 'ชิบหาย', 'ชิบ',
  'แม่ง', 'แม่ม', 'เหี้ย', 'เยี่ย', 'เยี่ยม',
  'กาก', 'กากบาท',
  // คำผสม (เรียงจากยาวไปสั้น เพื่อให้ตรวจคำยาวก่อน)
  'ไอ้สัส', 'ไอ้เหี้ย', 'ไอ้เวร', 'ไอ้สัตว์', 'ไอ้ควาย',
  'อีเหี้ย', 'อีสัตว์', 'อีควาย', 'มึงวะ', 'กูวะ'
]

// Create filter instance
const filter = new Filter({ emptyList: true })

// Add Thai bad words
thaiBadWords.forEach(word => {
  filter.addWords(word.toLowerCase())
  filter.addWords(word.toUpperCase())
})

// Custom Thai profanity check (more comprehensive)
// Check for whole words only, not substrings
const checkThaiProfanity = (text: string): boolean => {
  const lowerText = text.toLowerCase()
  
  // Check each bad word (sort by length descending to check longer phrases first)
  const sortedBadWords = [...thaiBadWords].sort((a, b) => b.length - a.length)
  
  for (const badWord of sortedBadWords) {
    const lowerBadWord = badWord.toLowerCase()
    
    // Simple check: if the bad word exists in the text
    if (lowerText.includes(lowerBadWord)) {
      const index = lowerText.indexOf(lowerBadWord)
      
      // Get characters before and after
      const before = index > 0 ? lowerText[index - 1] : ''
      const after = index + lowerBadWord.length < lowerText.length 
        ? lowerText[index + lowerBadWord.length] 
        : ''
      
      // Check if it's at word boundaries (Thai doesn't use spaces, so we check for Thai chars)
      const beforeIsBoundary = !before || /[\s,.!?;:()[\]{}'"/\\]/.test(before)
      const afterIsBoundary = !after || /[\s,.!?;:()[\]{}'"/\\]/.test(after)
      
      // If both before and after are boundaries, it's a match
      if (beforeIsBoundary && afterIsBoundary) {
        return true
      }
      
      // For Thai text without spaces, if the bad word is at start or end
      if (index === 0 || index + lowerBadWord.length === lowerText.length) {
        return true
      }
      
      // For Thai, also check if it's surrounded by Thai characters (not in middle of another word)
      // If before or after is punctuation/space, it's likely a separate word
      if (beforeIsBoundary || afterIsBoundary) {
        return true
      }
    }
  }
  
  return false
}

export const checkProfanity = (text: string): boolean => {
  if (!text || text.trim().length === 0) {
    return false
  }
  
  // Use custom Thai check first
  return checkThaiProfanity(text)
}

export const filterProfanity = (text: string): string => {
  if (!text || text.trim().length === 0) {
    return text
  }
  
  let filteredText = text
  
  // Replace bad words with asterisks
  thaiBadWords.forEach(word => {
    const regex = new RegExp(word, 'gi')
    filteredText = filteredText.replace(regex, '*'.repeat(word.length))
  })
  
  // Also use bad-words library
  return filter.clean(filteredText)
}

export const getProfanityWords = (text: string): string[] => {
  if (!text || text.trim().length === 0) {
    return []
  }
  
  const lowerText = text.toLowerCase()
  const foundWords: string[] = []
  
  // Check each bad word (as whole words only)
  thaiBadWords.forEach(word => {
    const lowerBadWord = word.toLowerCase()
    const escapedWord = lowerBadWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    
    // Split text by spaces and punctuation to get words
    const words = lowerText.split(/[\s,.!?;:]+/).filter(w => w.length > 0)
    
    // Check if bad word appears as a complete word
    if (words.includes(lowerBadWord)) {
      foundWords.push(word)
      return
    }
    
    // Check word boundaries
    const boundaryPattern = `(^|[\\s,.!?;:])${escapedWord}([\\s,.!?;:]|$)`
    const regex = new RegExp(boundaryPattern, 'i')
    if (regex.test(lowerText)) {
      const index = lowerText.indexOf(lowerBadWord)
      if (index !== -1) {
        const before = index > 0 ? lowerText[index - 1] : ' '
        const after = index + lowerBadWord.length < lowerText.length 
          ? lowerText[index + lowerBadWord.length] 
          : ' '
        const isWordBoundary = /[\s,.!?;:]/.test(before) || /[\s,.!?;:]/.test(after)
        if (isWordBoundary) {
          foundWords.push(word)
        }
      }
    }
  })
  
  return foundWords
}

