// app/layout.js

import { Roboto_Mono } from 'next/font/google';

const robotoMono = Roboto_Mono({ subsets: ['latin'] });
import "./globals.css";

export const metadata = {
  title: "Velo Antwerpen Heatmap",
  description: "Real-time beschikbaarheid van Velo fietsen als warmtekaart.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body >
        {children}
      </body>
    </html>
  );
}