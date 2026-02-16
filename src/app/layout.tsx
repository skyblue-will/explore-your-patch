import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Explore Your Patch — UK Postcode Area Profiles',
  description: 'Wildlife, house prices, crime, flood risk and more for any UK postcode. Free, open data.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="bg-patch-deep-green text-white px-6 py-4">
          <div className="max-w-5xl mx-auto">
            <a href="/" className="font-serif text-xl tracking-wide">
              🌿 Explore Your Patch
            </a>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-patch-deep-green text-patch-lichen text-center py-8 mt-16 text-sm">
          <p>Built with open data from Police UK, Environment Agency, Land Registry, NBN Atlas & more</p>
        </footer>
      </body>
    </html>
  )
}
