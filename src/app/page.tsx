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
      <div className="text-center max-w-lg">
        <h1 className="text-4xl md:text-5xl font-serif text-patch-deep mb-3 tracking-tight">
          Explore Your Patch
        </h1>
        <p className="text-patch-muted mb-8">
          Wildlife, house prices, crime, flood risk — for any UK postcode.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
          <input
            type="text"
            value={postcode}
            onChange={e => setPostcode(e.target.value)}
            placeholder="e.g. SW1A 1AA"
            className="flex-1 px-4 py-3 border border-patch-line bg-white text-base focus:outline-none focus:border-patch-green transition"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-3 bg-patch-deep text-white text-sm font-medium hover:bg-patch-green transition-colors"
          >
            Go
          </button>
        </form>
      </div>
    </div>
  )
}
