import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diffwise — PRs, made clear",
  description:
    "Understand pull requests in seconds with an AI-powered code review brief.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
