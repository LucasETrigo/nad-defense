'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePrivy, CrossAppAccountWithMetadata } from '@privy-io/react-auth';
import { useCrossAppAccounts } from '@privy-io/react-auth';
import { setPlayer } from '../state/playerState';
import { getMonadUsername } from './getUsername';

const MONAD_PROVIDER_APP_ID = 'cmd8euall0037le0my79qpz42';
const shortAddr = (addr?: string | null) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';

export default function LoginGate() {
    const { ready, authenticated, login, logout, user } = usePrivy();
    const { linkCrossAppAccount } = useCrossAppAccounts();
    const [linking, setLinking] = useState(false); // ← replace isLinking
    const [monadAddr, setMonadAddr] = useState<`0x${string}` | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [loadingName, setLoadingName] = useState(false);
    const [hint, setHint] = useState<string>('');

    const lastFetchedRef = useRef<string | null>(null);

    const crossApp = useMemo(() => {
        if (!user) return undefined;
        return user.linkedAccounts?.find(
            (a) =>
                a.type === 'cross_app' &&
                (a as any).providerApp?.id === MONAD_PROVIDER_APP_ID
        ) as CrossAppAccountWithMetadata | undefined;
    }, [user]);

    useEffect(() => {
        if (!ready) return;

        if (!authenticated) {
            setHint('Sign in');
            setMonadAddr(null);
            setUsername(null);
            setLoadingName(false);
            return;
        }

        if (!crossApp) {
            setHint('Link Monad ID');
            setMonadAddr(null);
            setUsername(null);
            setLoadingName(false);
            return;
        }

        const addr = crossApp.embeddedWallets?.[0]?.address as
            | `0x${string}`
            | undefined;
        if (addr) {
            if (addr !== monadAddr) console.debug('[gate] new wallet', addr);
            setPlayer({ address: addr });
            setMonadAddr(addr);
            setHint('Connected');
        } else {
            setHint('No embedded wallet');
            setMonadAddr(null);
            setUsername(null);
            setLoadingName(false);
        }
    }, [ready, authenticated, crossApp]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!monadAddr) return;
            if (lastFetchedRef.current === monadAddr) return;
            lastFetchedRef.current = monadAddr;

            setLoadingName(true);
            const name = await getMonadUsername(monadAddr);
            if (!cancelled) {
                setUsername(name ?? null);
                setPlayer({ username: name ?? null });
                setLoadingName(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [monadAddr]);

    const handleLink = async () => {
        try {
            setLinking(true);
            setHint('Linking Monad Games ID…');
            // Your SDK version likely expects { appId }. If you upgrade later,
            // you can switch back to { providerAppId } safely.
            await (linkCrossAppAccount as any)({
                appId: MONAD_PROVIDER_APP_ID,
            });
            setHint('Linked. Refresh to continue.');
        } catch (e: any) {
            setHint(`Link failed: ${e?.message ?? 'unknown error'}`);
        } finally {
            setLinking(false);
        }
    };

    return (
        <div className='fixed top-3 right-3 z-50 pointer-events-none'>
            <div className='pointer-events-auto'>
                {!ready ? (
                    <div className='flex items-center gap-2 rounded-full border border-white/10 bg-black/40 backdrop-blur px-3 py-1.5 text-xs text-white/80 shadow-sm'>
                        <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white/70' />
                        Loading…
                    </div>
                ) : !authenticated ? (
                    <button
                        onClick={login}
                        className='cursor-pointer flex items-center gap-2 rounded-full border border-white/10 bg-black/45 backdrop-blur px-3 py-1.5 text-xs text-white/90 hover:bg-black/55 active:bg-black/60 transition'
                        title='Sign in'
                    >
                        <span className='h-1.5 w-1.5 rounded-full bg-amber-300' />
                        Sign in
                    </button>
                ) : !crossApp ? (
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={handleLink}
                            disabled={linking}
                            className='cursor-pointer flex items-center gap-2 rounded-full border border-white/10 bg-black/45 backdrop-blur px-3 py-1.5 text-xs text-white/90 hover:bg-black/55 active:bg-black/60 transition disabled:opacity-60'
                            title='Link Monad Games ID'
                        >
                            <span className='h-1.5 w-1.5 rounded-full bg-yellow-300' />
                            {linking ? 'Linking…' : 'Link Monad ID'}
                        </button>
                        <button
                            onClick={logout}
                            className='cursor-pointer ml-1 rounded-full px-2 py-1 text-[10px] text-white/60 hover:text-white/90 transition'
                            title='Logout'
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div
                        className='flex items-center gap-2 rounded-full border border-white/10 bg-black/40 backdrop-blur px-3 py-1.5 text-xs text-white/90 shadow-sm'
                        title={hint}
                    >
                        <span className='relative flex h-1.5 w-1.5'>
                            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-70' />
                            <span className='relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400' />
                        </span>
                        {monadAddr ? (
                            loadingName ? (
                                <span className='inline-block h-3 w-20 rounded bg-white/20 animate-pulse' />
                            ) : (
                                <span className='font-medium'>
                                    {username ?? shortAddr(monadAddr)}
                                </span>
                            )
                        ) : (
                            <span className='opacity-70'>—</span>
                        )}
                        <button
                            onClick={logout}
                            className='cursor-pointer ml-1 rounded-full px-2 py-1 text-[10px] text-white/60 hover:text-white/90 transition'
                            title='Logout'
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
