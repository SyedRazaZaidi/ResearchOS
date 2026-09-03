import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResearchOS — Evidence Operating System",
  description:
    "Autonomous AI research platform. Plan, retrieve, critique, verify, cite — then generate. Claim-level auditability for scientific work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-ink-900 font-sans text-mist-100 antialiased">
        {children}
      </body>
    </html>
  );
}
