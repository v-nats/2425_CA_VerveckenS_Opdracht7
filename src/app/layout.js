// app/layout.js
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata = {
  title: "Velo Antwerpen Heatmap",
  description: "Real-time beschikbaarheid van Velo fietsen als warmtekaart.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}