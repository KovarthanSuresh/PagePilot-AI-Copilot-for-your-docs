// frontend/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PagePilot',
  description: 'Smart Documents Companion powered by GenAI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Ensure background covers full viewport */}
        <div className="min-h-screen bg-gray-800 text-white">
          {children}
        </div>
      </body>
    </html>
  );
}
