import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Diary API',
  description: 'API server for AI Diary',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
