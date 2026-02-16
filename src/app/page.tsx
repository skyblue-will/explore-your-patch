'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [postcode, setPostcode] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = postcode.trim().replace(/\s+/g, '').toUpperCase()
    if (cleaned) router.push(`/postcode/${cleaned}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-serif text-patch-deep-green mb-6 leading-tight">
          Explore Your Patch
        </h1>
        <p className="text-gray-500 mb-10 max-w-sm mx-auto leading-relaxed">
          Wildlife, house prices, crime, flood risk and more — for any UK postcode.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="text"
            value={postcode}
            onChange={e => setPostcode(e.target.value)}
            placeholder="e.g. SW1A 1AA"
            className="flex-1 px-6 py-4 rounded-xl border-2 border-patch-lichen/30 bg-white text-lg text-center focus:outline-none focus:border-patch-forest focus:ring-2 focus:ring-patch-forest/20 transition placeholder:text-patch-lichen/50"
            autoFocus
          />
          <button
            type="submit"
            className="px-8 py-4 bg-patch-forest text-white rounded-xl text-lg font-medium hover:bg-patch-deep-green transition-colors shadow-sm"
          >
            Go
          </button>
        </form>
      </div>
    </div>
  )
}
