import './globals.css'

export const metadata = {
    title: 'Budżet Domowy',
    description: 'Aplikacja do zarządzania budżetem',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pl" suppressHydrationWarning>
            <body className="bg-gray-50" suppressHydrationWarning>
                {children}
            </body>
        </html>
    )
}