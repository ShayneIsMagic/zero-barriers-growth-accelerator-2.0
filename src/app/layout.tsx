import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
// import ErrorBoundary from '@/components/ErrorBoundary'; // Temporarily disabled

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Zero Barriers Growth Accelerator',
  description:
    'AI-powered marketing optimization platform that systematically analyzes content to identify growth barriers and provide actionable recommendations.',
  keywords: [
    'marketing optimization',
    'growth acceleration',
    'AI analysis',
    'conversion optimization',
    'marketing copy analysis',
    'growth barriers',
    'marketing framework',
    'Simon Sinek',
    'CliftonStrengths',
    'consumer value elements',
  ],
  authors: [{ name: 'Zero Barriers Growth Accelerator' }],
  creator: 'Zero Barriers Growth Accelerator',
  publisher: 'Zero Barriers Growth Accelerator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://zero-barriers-growth.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zero-barriers-growth.com',
    title: 'Zero Barriers Growth Accelerator',
    description:
      'AI-powered marketing optimization platform that systematically analyzes content to identify growth barriers and provide actionable recommendations.',
    siteName: 'Zero Barriers Growth Accelerator',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Zero Barriers Growth Accelerator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zero Barriers Growth Accelerator',
    description:
      'AI-powered marketing optimization platform that systematically analyzes content to identify growth barriers and provide actionable recommendations.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}


