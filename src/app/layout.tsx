import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Explore Your Patch — Nature, Heritage & Area Intelligence',
  description: 'One postcode, the full picture — nature, heritage, wildlife & area intelligence for any UK postcode',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="bg-patch-deep-green text-white px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a href="/" className="font-serif text-xl tracking-wide">
              🌿 Explore Your Patch
            </a>
            <span className="text-patch-lichen text-sm hidden sm:inline">Nature · Heritage · Wildlife · Intelligence</span>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-patch-deep-green text-patch-lichen text-center py-8 mt-16 text-sm">
          <p>Data from postcodes.io, Police UK, Environment Agency, Land Registry, NBN Atlas</p>
          <p className="mt-1 opacity-60">Open data, beautifully presented</p>
        </footer>
      </body>
    </html>
  )
}
