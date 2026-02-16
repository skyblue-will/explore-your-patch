import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Explore Your Patch — UK Postcode Area Profiles',
  description: 'Wildlife, house prices, crime, flood risk and more for any UK postcode.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="border-b border-patch-line px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <a href="/" className="font-serif text-lg text-patch-deep tracking-tight">
              Explore Your Patch
            </a>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-patch-line text-patch-muted text-center py-8 mt-16 text-xs">
          <p>Open data from Police UK, Environment Agency, Land Registry, NBN Atlas</p>
        </footer>
      </body>
    </html>
  )
}
