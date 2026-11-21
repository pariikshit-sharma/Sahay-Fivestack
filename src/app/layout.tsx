import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/core/context/AppContext";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "SAHAY — Your Benefits. Your Language. Your Access.",
  description:
    "Discover Indian government welfare schemes and citizen benefits in your own language, through voice and simple interaction.",
  keywords: [
    "Government Schemes",
    "PM-KISAN",
    "Ayushman Bharat",
    "Welfare",
    "India",
    "Citizen Benefits",
    "Voice Assistant",
    "Multilingual",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f253e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className="h-full">
      <body className="flex flex-col min-h-screen bg-sahay-warm-50 text-sahay-navy-950">
        <AppProvider>
          <Navbar />
          <main id="main-content" className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
