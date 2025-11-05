import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import PrivyProvider from "@/providers/PrivyProvider";

export const metadata: Metadata = {
  title: "SomniaX - Deploy AI Agents",
  description: "Deploy AI Agents. Get Results. Pay Only For Success.",
  icons: {
    icon: '/somnialogo.png',
    shortcut: '/somnialogo.png',
    apple: '/somnialogo.png',
    other: {
      rel: 'icon',
      url: '/somnialogo.png',
    },
  },
  openGraph: {
    title: "SomniaX - Deploy AI Agents",
    description: "Deploy AI Agents. Get Results. Pay Only For Success.",
    images: ['/somnialogo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "SomniaX - Deploy AI Agents",
    description: "Deploy AI Agents. Get Results. Pay Only For Success.",
    images: ['/somnialogo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <PrivyProvider>
          <Header />
          {children}
          <Toaster />
        </PrivyProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}