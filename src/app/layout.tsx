import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chase — Construction Action Tracker',
  description: 'Track RFIs, approvals, submittals and follow-ups across your construction projects.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
