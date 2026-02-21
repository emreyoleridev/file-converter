import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Universal File Converter | Secure & Fast',
  description: 'Convert any file format directly in your browser securely.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex-1 relative z-10">
            {children}
          </main>
          <footer className="py-6 border-t border-primary/10 mt-auto text-center text-sm text-foreground/70 bg-background/60 backdrop-blur-md relative z-10">
            Built by{" "}
            <a
              href="https://github.com/emreyoleridev"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-primary underline underline-offset-4 hover:text-blue-500 transition-colors"
            >
              Emre Yoleri
            </a>
          </footer>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
