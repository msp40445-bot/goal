import { useState } from 'react'
import { Quote, RefreshCw } from 'lucide-react'

const QUOTES = [
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Indeed, with hardship comes ease.", author: "Quran 94:6" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Verily, Allah does not change the condition of a people until they change what is in themselves.", author: "Quran 13:11" },
  { text: "Do not grieve; indeed Allah is with us.", author: "Quran 9:40" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "A year from now you will wish you had started today.", author: "Karen Lamb" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Unknown" },
  { text: "Take account of yourselves before you are taken to account.", author: "Umar ibn Al-Khattab" },
  { text: "The believer's shade on the Day of Resurrection will be his charity.", author: "Prophet Muhammad (PBUH)" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Strive for progress, not perfection.", author: "Unknown" },
  { text: "Be in this world as if you were a stranger or a traveler.", author: "Prophet Muhammad (PBUH)" },
  { text: "Excellence is not a destination but a continuously growing process.", author: "Ed Foreman" },
]

function getInitialQuoteIndex() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return dayOfYear % QUOTES.length
}

export default function MotivationalQuote() {
  const [quoteIndex, setQuoteIndex] = useState(getInitialQuoteIndex)

  const nextQuote = () => {
    setQuoteIndex((quoteIndex + 1) % QUOTES.length)
  }

  const quote = QUOTES[quoteIndex]

  return (
    <div className="card p-4 relative overflow-hidden">
      <div className="absolute top-2 right-2 opacity-5">
        <Quote className="w-16 h-16 text-primary" />
      </div>
      <div className="flex items-start gap-2 mb-2">
        <Quote className="w-3.5 h-3.5 text-primary-light mt-0.5 flex-shrink-0" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Daily Motivation</span>
      </div>
      <p className="text-sm text-text-primary leading-relaxed mb-2 italic">
        &ldquo;{quote.text}&rdquo;
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">- {quote.author}</span>
        <button
          onClick={nextQuote}
          className="p-1 hover:bg-surface-light rounded transition-colors"
        >
          <RefreshCw className="w-3 h-3 text-text-muted" />
        </button>
      </div>
    </div>
  )
}
