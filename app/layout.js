import { Bebas_Neue, DM_Sans } from 'next/font/google';
import './globals.css';

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dmsans',
  display: 'swap',
});

export const metadata = {
  title: 'The Founder Energy Quiz | The Energetic Edge',
  description:
    "Fifteen questions. Three minutes. Find out which state is running your business right now, and what's costing you.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bebas.variable} ${dmSans.variable}`}>
      <body className="bg-navy-700 font-sans text-white antialiased">{children}</body>
    </html>
  );
}
