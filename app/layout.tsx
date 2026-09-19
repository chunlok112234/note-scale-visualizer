import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Scale Shape — See the sound", description: "Explore musical scales through geometry. Rotate, discover, and listen." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
