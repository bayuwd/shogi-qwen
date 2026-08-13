import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shogi - Player vs AI",
  description: "A web-based Shogi (Japanese Chess) game with Kanji + English piece display",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
