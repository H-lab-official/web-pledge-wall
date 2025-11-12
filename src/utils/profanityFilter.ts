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
  if (!text || text.trim().length === 0) {
    return false
  }
  
  const lowerText = text.toLowerCase().trim()
  
  // Check each bad word (sort by length descending to check longer phrases first)
  const sortedBadWords = [...thaiBadWords].sort((a, b) => b.length - a.length)
  
  for (const badWord of sortedBadWords) {
    const lowerBadWord = badWord.toLowerCase()
    
    // Find all occurrences of the bad word in the text
    let searchIndex = 0
    while (true) {
      const index = lowerText.indexOf(lowerBadWord, searchIndex)
      if (index === -1) break
      
      // Check character before the bad word
      const beforeChar = index > 0 ? lowerText[index - 1] : ''
      // Check character after the bad word
      const afterChar = index + lowerBadWord.length < lowerText.length 
        ? lowerText[index + lowerBadWord.length] 
        : ''
      
      // Check if it's a word boundary
      // For Thai text without spaces, we need to be more careful
      // Only consider it a match if:
      // 1. It's at the start/end of the text, OR
      // 2. It's surrounded by spaces/punctuation, OR
      // 3. It's a standalone word (not part of another word)
      const isStartBoundary = index === 0
      const isEndBoundary = index + lowerBadWord.length === lowerText.length
      const isBeforeBoundary = isStartBoundary || /[\s,.!?;:()[\]{}'"/\\]/.test(beforeChar)
      const isAfterBoundary = isEndBoundary || /[\s,.!?;:()[\]{}'"/\\]/.test(afterChar)
      
      // Only match if both sides are boundaries (it's a complete word)
      if (isBeforeBoundary && isAfterBoundary) {
        return true
      }
      
      // Move search index forward
      searchIndex = index + 1
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

