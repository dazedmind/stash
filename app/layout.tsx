import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stash | Mobile Finance",
  description: "A mobile-first finance app with digital-first income allocation.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Stash",
  },
  icons: {
    apple: [
      { url: 'stash-logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#181818",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
