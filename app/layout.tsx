import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CS2 嫌疑人监控系统',
  description: '基于 Next.js 的 CS2 作弊嫌疑人监控工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        <div className="min-h-screen bg-background">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold">CS2 嫌疑人监控系统</h1>
              </div>
              <nav className="flex items-center space-x-4">
                <a href="/" className="text-sm font-medium hover:text-primary">
                  监控列表
                </a>
                <a href="/suspects/add" className="text-sm font-medium hover:text-primary">
                  添加嫌疑人
                </a>
              </nav>
            </div>
          </header>
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}