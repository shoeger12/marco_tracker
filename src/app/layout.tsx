import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Marco Tracker',
  description: 'Track your daily macros with ease',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-brand-bg min-h-screen">
        <div className="max-w-md mx-auto pb-20 min-h-screen">
          {children}
        </div>
        <Navigation />
      </body>
    </html>
  )
}
