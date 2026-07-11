import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Richmax Box Engine V1",
  description: "Packaging calculation system for Richmax offset printing factory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
