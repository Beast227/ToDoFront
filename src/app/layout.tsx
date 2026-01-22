import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tada Todo list",
  description: "Todo list stinks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="grow">
          {children}
        </main>
      </body>
    </html>
  );
}
