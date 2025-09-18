'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function PrivyProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

    if (!privyAppId) {
        console.warn(
            'NEXT_PUBLIC_PRIVY_APP_ID is not set. Privy auth disabled.'
        );
        return <>{children}</>;
    }

    return (
        <PrivyProvider
            appId={privyAppId}
            config={{
                loginMethodsAndOrder: {
                    primary: ['privy:cmd8euall0037le0my79qpz42'],
                },
                embeddedWallets: {
                    ethereum: { createOnLogin: 'users-without-wallets' },
                },
                appearance: { theme: 'dark' },
            }}
        >
            {children}
        </PrivyProvider>
    );
}
