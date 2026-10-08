import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Propwise | Dubai Market Intelligence",
  description:
    "An interactive Dubai real estate intelligence prototype. All statistics are fictional demo data.",
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
