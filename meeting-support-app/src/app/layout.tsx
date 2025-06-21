import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI会議アシスタント',
  description: 'リアルタイム文字起こしで会議をサポート',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}