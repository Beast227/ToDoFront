import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/NavBar";
import { Toaster } from "react-hot-toast";

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
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1f2937', // Matches Tailwind gray-800
              color: '#fff',
              border: '1px solid #374151', // Matches Tailwind gray-700
            },
            success: {
              iconTheme: {
                primary: '#06b6d4', // Matches Tailwind cyan-500
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444', // Red for errors
                secondary: '#fff',
              },
            },
          }}
        />
        <main className="grow">
          {children}
        </main>
      </body>
    </html>
  );
}
