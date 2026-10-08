import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  icons: { icon: "/brand/favicon.png" },
  title: "Propwise | Dubai Market Intelligence",
  description:
    "Dubai market intelligence for September 2026, using DLD-based figures supplied by Propwise.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
