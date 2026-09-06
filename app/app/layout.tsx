import type { Metadata } from 'next';
import { WalletContextProvider } from '@/components/WalletContextProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Click The Cookie — on Cookie Chain',
  description:
    'Every click is a real on-chain transaction on Cookie Chain. Click the cookie, burn COOK, hit golden cookies, upgrade your production.',
  metadataBase: new URL('https://clickthecookie.xyz'),
  openGraph: {
    title: 'Click The Cookie — on Cookie Chain',
    description: 'The most memetic use of an SVM. Every click is a real tx.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#07111f] text-slate-100">
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}
