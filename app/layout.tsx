import './globals.css';
import PrivyProviders from '@/game/core/PrivyProviders';

export const metadata = {
    title: 'Nad Defense - Powered by Monad Games ID',
    description:
        'Nad Defense is a game built on Monad Testnet, destroy the meteorites to defend Nad World.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang='en'>
            <body>
                <PrivyProviders>{children}</PrivyProviders>
            </body>
        </html>
    );
}
