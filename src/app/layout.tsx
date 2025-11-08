import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Whop Analytics Dashboard",
  description: "Analytics dashboard for Whop creators to track community growth, revenue, and engagement",
  keywords: ["analytics", "dashboard", "whop", "community", "metrics"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
