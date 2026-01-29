import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "KGS Pattensen - Kursmanager",
    description: "Einbuchungssystem für Schüler der KGS Pattensen",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="de">
            <body className={inter.className}>
                <nav className="fixed top-0 w-full z-50 glass-card rounded-none border-x-0 border-t-0 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Image
                            src="/logo.png"
                            alt="KGS Pattensen Logo"
                            width={200}
                            height={50}
                            className="h-10 w-auto"
                        />
                    </div>
                    <div className="text-sm font-medium opacity-70">
                        Schuljahr 2025/26
                    </div>
                </nav>
                <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
                    {children}
                </main>
            </body>
        </html>
    );
}
