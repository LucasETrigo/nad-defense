'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    usePrivy,
    type CrossAppAccountWithMetadata,
} from '@privy-io/react-auth';
import { useEffect, useMemo, useState } from 'react';
import { useMonadGamesUser } from '../game/core/hooks/useMonadGamesUser';
import Leaderboard from '@/game/ui/Leaderboard';

const MONAD_PROVIDER_APP_ID = 'cmd8euall0037le0my79qpz42';
const shortAddr = (a?: string | null) =>
    a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';

function getCrossAppAddress(user: any): `0x${string}` | null {
    const cross = (user?.linkedAccounts || []).find(
        (a: any) =>
            a?.type === 'cross_app' &&
            a?.providerApp?.id === MONAD_PROVIDER_APP_ID
    ) as CrossAppAccountWithMetadata | undefined;
    const addr = cross?.embeddedWallets?.[0]?.address as
        | `0x${string}`
        | undefined;
    return addr ?? null;
}

export default function Landing() {
    const { ready, authenticated, login, logout, user } = usePrivy();

    const crossAddr = useMemo(() => getCrossAppAddress(user), [user]);

    const {
        user: mgUser,
        hasUsername,
        loading,
        error,
        refetch,
        startPolling,
    } = useMonadGamesUser(crossAddr || undefined);
    const username = hasUsername ? mgUser?.username ?? null : null;

    const canPlay = authenticated && !!crossAddr && !!username && !loading;

    const handleRegisterClick = () => {
        window.open('https://monadclip.fun/', '_blank', 'noopener,noreferrer');
        startPolling(3000);
    };

    return (
        <main className='relative min-h-dvh overflow-hidden'>
            <div className='pointer-events-none absolute inset-0'>
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.25),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(236,72,153,0.18),transparent_45%)]' />
                <div className='absolute -top-24 -right-24 h-[38rem] w-[38rem] rounded-full bg-fuchsia-500/10 blur-3xl' />
                <div className='absolute -bottom-32 -left-20 h-[32rem] w-[32rem] rounded-full bg-indigo-500/10 blur-3xl' />
            </div>

            {/* top-right pill */}
            <div className='fixed top-3 right-3 z-50 pointer-events-none'>
                <div className='pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-black/40 backdrop-blur px-3 py-1.5 text-xs text-white/90 shadow-sm'>
                    {authenticated ? (
                        <>
                            <span className='relative flex h-1.5 w-1.5'>
                                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-70' />
                                <span className='relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400' />
                            </span>
                            <span className='font-medium'>{username}</span>
                        </>
                    ) : (
                        <span className='text-white/70'>
                            {ready ? 'Guest' : 'Loading…'}
                        </span>
                    )}
                </div>
            </div>

            <section className='relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col items-center justify-center px-6 text-center'>
                <div className='flex items-center justify-center'>
                    <Image
                        src='/assets/images/NaddefensE-logo.png'
                        alt='NaddefensE'
                        width={260}
                        height={64}
                        className='select-none object-contain drop-shadow-[0_6px_24px_rgba(99,102,241,0.35)]'
                        priority
                    />
                </div>

                <p className='mt-4 text-base md:text-lg text-white/75 max-w-2xl'>
                    Destroy the meteorites to defend Nad World.
                </p>

                {authenticated && username && (
                    <div className='mt-6 text-sm text-white/70'>
                        Welcome{' '}
                        <span className='font-semibold text-white'>
                            {username}
                        </span>
                    </div>
                )}

                <div className='mt-3 flex flex-col sm:flex-row items-center gap-3'>
                    {!authenticated ? (
                        <button
                            onClick={login}
                            className='cursor-pointer rounded-xl px-6 py-3 text-sm font-medium text-white
                 bg-gradient-to-br from-indigo-500 to-fuchsia-600
                 shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset]
                 hover:opacity-95 active:scale-[0.99] transition'
                        >
                            {ready ? 'Sign in with Monad Games ID' : 'Loading…'}
                        </button>
                    ) : (
                        <>
                            <Link
                                href={canPlay ? '/game' : '#'}
                                aria-disabled={!canPlay}
                                className={`cursor-pointer rounded-xl px-6 py-3 text-sm font-medium
                    ${
                        canPlay
                            ? 'text-white bg-gradient-to-br from-emerald-500 to-cyan-500 hover:opacity-95 active:scale-[0.99] transition'
                            : 'text-white/60 border border-white/15 bg-white/5 cursor-not-allowed'
                    }
                    shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset]`}
                            >
                                {canPlay
                                    ? 'Play'
                                    : loading
                                    ? 'Checking…'
                                    : 'Username required'}
                            </Link>
                            <button
                                onClick={logout}
                                className='cursor-pointer rounded-xl px-6 py-3 text-sm font-medium text-white/90
                   border border-white/15 bg-white/5 hover:bg-white/10 active:bg-white/15 transition'
                                title='Logout'
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>

                {authenticated && crossAddr && !canPlay && (
                    <div className='mt-6 w-full max-w-md rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] backdrop-blur px-4 py-3 text-left'>
                        {loading ? (
                            <>
                                <div className='text-sm text-white/80'>
                                    Checking username…
                                </div>
                                <div className='mt-2 h-4 w-40 animate-pulse rounded bg-white/15' />
                            </>
                        ) : (
                            <>
                                <div className='text-sm text-amber-200/90 font-medium'>
                                    Username required
                                </div>
                                <div className='mt-1 text-sm text-white/80'>
                                    Connected wallet:{' '}
                                    <span className='font-mono'>
                                        {shortAddr(crossAddr)}
                                    </span>
                                </div>
                                <div className='mt-3 flex items-center gap-2'>
                                    <button
                                        onClick={handleRegisterClick}
                                        className='cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-black bg-amber-300 hover:opacity-95 active:scale-[0.99] transition'
                                    >
                                        Register username ↗
                                    </button>
                                    <button
                                        onClick={refetch}
                                        className='cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-white/80 border border-white/15 hover:bg-white/10 active:bg-white/15 transition'
                                        title='Re-check'
                                    >
                                        I’ve registered — check again
                                    </button>
                                </div>
                                {error && (
                                    <div className='mt-2 text-xs text-white/60'>
                                        Note: {error}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                <div className='mt-8 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/60'>
                    <span className='underline px-3 py-1'>Controls</span>
                </div>
                <div className='mt-4 text-xs text-white/50'>
                    <span className='rounded-md border border-white/15 bg-white/5 px-2 py-1'>
                        ↑↓←→
                    </span>
                    <span className='mx-2'>+</span>
                    <span className='rounded-md border border-white/15 bg-white/5 px-2 py-1'>
                        Space
                    </span>
                </div>
                <footer className='mt-12 text-xs text-white/40'>
                    Built by{' '}
                    <a
                        href='https://x.com/0xLukkz'
                        target='_blank'
                        rel='noreferrer'
                        className='underline'
                    >
                        0xLukkz
                    </a>{' '}
                    for the Monad community. Powered by Monad Games ID.
                </footer>
            </section>
        </main>
    );
}
