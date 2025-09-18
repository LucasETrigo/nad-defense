'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    usePrivy,
    type LinkedAccountWithMetadata,
    type WalletWithMetadata,
    type CrossAppAccountWithMetadata,
} from '@privy-io/react-auth';
import { getPlayer } from '../state/playerState';

const MONAD_PROVIDER_APP_ID = 'cmd8euall0037le0my79qpz42';

const shortAddr = (addr?: string | null) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';

/** Type guard: linked account is a wallet with an address */
function isWallet(a: LinkedAccountWithMetadata): a is WalletWithMetadata {
    return a.type === 'wallet' && 'address' in a;
}

/** Type guard: linked account is a Monad Games cross-app account */
function isMonadCrossApp(
    a: LinkedAccountWithMetadata
): a is CrossAppAccountWithMetadata {
    return (
        a.type === 'cross_app' &&
        (a as any)?.providerApp?.id === MONAD_PROVIDER_APP_ID
    );
}

/** Prefer the embedded wallet from Monad Games cross-app; fallback to first wallet */
function pickAddressFromUser(
    user: { linkedAccounts?: LinkedAccountWithMetadata[] } | null | undefined
): `0x${string}` | null {
    const accounts = user?.linkedAccounts ?? [];
    const cross = accounts.find(isMonadCrossApp);
    const embedded = cross?.embeddedWallets?.[0]?.address as
        | `0x${string}`
        | undefined;
    if (embedded) return embedded;
    const wallet = accounts.find(isWallet)?.address as
        | `0x${string}`
        | undefined;
    return wallet ?? null;
}

export default function GameNav() {
    const router = useRouter();
    const { authenticated, logout, user } = usePrivy();

    const [address, setAddress] = useState<`0x${string}` | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);

    // derive best address (playerState -> privy cross_app -> wallet)
    const bestAddr = useMemo(() => {
        const p = getPlayer();
        return (
            (p?.address as `0x${string}` | undefined) ??
            pickAddressFromUser(user)
        );
    }, [user]);

    // keep address in state + poll a bit for changes
    useEffect(() => {
        setAddress(bestAddr ?? null);
        const id = setInterval(() => {
            const next =
                (getPlayer()?.address as `0x${string}` | undefined) ??
                pickAddressFromUser(user);
            if (next !== address) setAddress(next ?? null);
        }, 1000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bestAddr, user]);

    // fetch username via our server proxy (no CORS/redirect issues)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setUsername(null);
            if (!address) return;
            setChecking(true);
            try {
                const res = await fetch(
                    `/api/monad-username?wallet=${address.toLowerCase()}`,
                    {
                        cache: 'no-store',
                    }
                );
                const json = await res.json();
                if (!cancelled) {
                    const name = json?.user?.username as string | undefined;
                    setUsername(json?.hasUsername && name ? name : null);
                }
            } catch {
                if (!cancelled) setUsername(null);
            } finally {
                if (!cancelled) setChecking(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [address]);

    const handleLogout = async () => {
        await logout();
        router.push('/'); // back to landing after logout
    };

    return (
        <div className='fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none'>
            <div
                className='pointer-events-auto grid grid-cols-3 items-center gap-3
                   rounded-full border border-white/10 bg-black/40 backdrop-blur
                   px-6 py-2.5 text-xs text-white/90 shadow-sm
                   min-w-[400px] md:min-w-[600px] h-[52px]'
            >
                {/* LEFT: Back */}
                <div className='flex items-center justify-start'>
                    <button
                        onClick={() => router.push('/')}
                        className='cursor-pointer rounded-full px-3 py-1.5 hover:bg-white/10 transition'
                        title='Back to home'
                    >
                        ← Back
                    </button>
                </div>

                {/* CENTER: Logo */}
                <div className='flex items-center justify-center'>
                    <Image
                        src='/assets/images/NaddefensE-logo.png'
                        alt='NaddefensE Logo'
                        width={120}
                        height={32}
                        className='select-none object-contain'
                        priority
                    />
                </div>

                {/* RIGHT: green dot + USERNAME (fallback to short address) + Logout */}
                <div className='flex items-center justify-end gap-3 min-w-0'>
                    {/* Green Dot */}
                    <span className='relative flex h-2 w-2 shrink-0'>
                        <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-70' />
                        <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-400' />
                    </span>

                    <span
                        className='font-medium truncate max-w-[8rem] md:max-w-[10rem] lg:max-w-[12rem] inline-block align-middle'
                        title={username || address || ''}
                    >
                        {checking && !username ? (
                            <span className='inline-block h-3 w-20 animate-pulse rounded bg-white/20 align-middle' />
                        ) : username ? (
                            <>@{username}</>
                        ) : (
                            shortAddr(address)
                        )}
                    </span>

                    {/* Logout */}
                    {authenticated && (
                        <button
                            onClick={handleLogout}
                            className='cursor-pointer rounded-full px-3 py-1.5 hover:bg-white/10 transition'
                            title='Logout'
                        >
                            Logout
                        </button>
                    )}
                </div>

                {/* subtle separators */}
                <div className='pointer-events-none col-span-3 -z-10 absolute inset-0 flex items-center justify-between px-20 md:px-28'>
                    <div className='h-4 w-px bg-white/10' />
                    <div className='h-4 w-px bg-white/10' />
                </div>
            </div>
        </div>
    );
}
