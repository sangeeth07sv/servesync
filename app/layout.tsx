import type { Metadata } from "next";
import "./globals.css";
import "./finishing.css";

export const metadata: Metadata = {
  title: "ServeSync — Restaurant Command Center",
  description: "Manage partner orders, menu profitability, expenses, forecasts, and AI insights in one place.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
