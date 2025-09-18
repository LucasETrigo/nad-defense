'use client';
import type { CrossAppAccountWithMetadata } from '@privy-io/react-auth';

const MONAD_PROVIDER_APP_ID = 'cmd8euall0037le0my79qpz42';

/** Return the **Monad Games ID embedded wallet** address or null. */
export function getCrossAppAddress(user: any): `0x${string}` | null {
    if (!user?.linkedAccounts?.length) return null;
    const cross = user.linkedAccounts.find(
        (a: any) =>
            a?.type === 'cross_app' &&
            a?.providerApp?.id === MONAD_PROVIDER_APP_ID
    ) as CrossAppAccountWithMetadata | undefined;

    const addr = cross?.embeddedWallets?.[0]?.address as
        | `0x${string}`
        | undefined;
    return addr ?? null;
}
