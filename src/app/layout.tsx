import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SiteInteractions } from "@/components/SiteInteractions";
import { T } from "@/components/T";

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plex-arabic",
});

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oppa.example"),
  title: { default: "Oppa أوبا، من الفكرة إلى الأثر", template: "%s · Oppa" },
  description:
    "أوبا، من الفكرة إلى الأثر: عملاء أكثر، طلبات تتكرر، وفريق يبيع بثقة، خلال ربع سنة واحد. Oppa, ideas into impact: more customers, repeat orders and a team that closes, in one quarter.",
  openGraph: { type: "website", siteName: "Oppa", locale: "ar_IQ", alternateLocale: ["en_GB"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${archivo.variable} ${plexArabic.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply the saved language before first paint so returning English readers don't see a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var l=localStorage.getItem('oppa.lang');if(l==='en'){document.documentElement.lang='en';document.documentElement.dir='ltr'}}catch(e){}",
          }}
        />
      </head>
      <body>
        <T as="a" k="skip" className="skip" href="#main" />
        <div id="page">
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </div>
        <div className="cursor" aria-hidden="true" hidden />
        <SiteInteractions />
      </body>
    </html>
  );
}
