import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Comets",
  description: "Asteroids inspired on-chain game",
};

const Hyperspace = localFont({ src: "../assets/Hyperspace.otf" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={Hyperspace.className}>
        <Providers>
          <div className="flex flex-col w-full h-full">
            <Navbar />
            <div className="flex-1 content-center self-center">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
