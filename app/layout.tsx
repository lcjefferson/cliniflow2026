import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "DentalCare - Sistema de Gestão Odontológica",
    description: "Sistema completo de gestão para clínicas odontológicas",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className="antialiased" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
