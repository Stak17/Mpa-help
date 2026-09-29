import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/services/authContext';
import { ToastProvider } from '@/components/common/ToastProvider';

export const viewport: Viewport = {
  themeColor: '#0c0a09',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Mpa Help 🇺🇬 - Simple help for everyday life',
  description:
    'Practical everyday AI assistant for letters, CVs, budgets in UGX, small business WhatsApp marketing, and Luganda translation.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mpa Help',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Mpa Help 🇺🇬 - Simple help for everyday life',
    description:
      'Practical everyday AI assistant for letters, CVs, budgets in UGX, small business WhatsApp marketing, and Luganda translation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mpa Help 🇺🇬 - Simple help for everyday life',
    description:
      'Practical everyday AI assistant for letters, CVs, budgets in UGX, small business WhatsApp marketing, and Luganda translation.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark bg-stone-950 overflow-x-hidden w-full max-w-[100vw]" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className="antialiased min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 overflow-x-hidden w-full max-w-[100vw] selection:bg-emerald-500 selection:text-white"
        suppressHydrationWarning
      >
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
