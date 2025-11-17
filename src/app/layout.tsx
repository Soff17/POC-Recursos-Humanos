import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Configure Inter
const inter = Inter({
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Talent Hub | Gestión de Talento - España",
    description: "Sistema inteligente de gestión de recursos humanos. Selección automatizada de personal técnico y militar mediante IA, análisis de perfiles y gestión de talento especializado en tecnologías de la información y comunicaciones para la Defensa Nacional.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
