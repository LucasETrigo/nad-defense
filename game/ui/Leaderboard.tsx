'use client';

import { useEffect, useState } from 'react';

type Row = {
    username?: string;
    wallet?: string;
    walletAddress?: string;
    score?: number;
    rank?: number;
};

export default function Leaderboard({ gameId = 68 }: { gameId?: number }) {
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancel = false;
        (async () => {
            try {
                setLoading(true);

                // 1) Try local scores saved by /api/game/submit
                const local = await fetch('/api/game/scores', {
                    cache: 'no-store',
                })
                    .then((r) => r.json())
                    .catch(() => null);
                if (
                    !cancel &&
                    local?.ok &&
                    Array.isArray(local.top) &&
                    local.top.length
                ) {
                    setRows(
                        local.top.map((r: any, i: number) => ({
                            username: r.username,
                            wallet: r.wallet,
                            score: r.score,
                            rank: i + 1,
                        }))
                    );
                    return; // done
                }

                // 2) Fallback to upstream proxy
                const r = await fetch(
                    `/api/leaderboard?gameId=${gameId}&page=1&sortBy=scores`,
                    { cache: 'no-store' }
                );
                const j = await r.json();
                if (!cancel && j?.ok) {
                    const data = Array.isArray(j.scoreData) ? j.scoreData : [];
                    setRows(data.slice(0, 10));
                }
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => {
            cancel = true;
        };
    }, [gameId]);

    return (
        <div className='w-full max-w-md rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-3 text-sm text-white/90'>
            <div className='mb-2 text-xs uppercase tracking-wide text-white/50'>
                Leaderboard
            </div>
            {loading ? (
                <div className='space-y-2'>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className='h-5 w-full animate-pulse rounded bg-white/10'
                        />
                    ))}
                </div>
            ) : (
                <ol className='space-y-1'>
                    {rows.map((r, i) => {
                        const name = r.username
                            ? `@${r.username}`
                            : r.walletAddress
                            ? `${r.walletAddress.slice(
                                  0,
                                  6
                              )}…${r.walletAddress.slice(-4)}`
                            : r.wallet
                            ? `${r.wallet.slice(0, 6)}…${r.wallet.slice(-4)}`
                            : '—';
                        return (
                            <li
                                key={`${r.wallet || r.walletAddress || i}`}
                                className='flex items-center justify-between gap-2'
                            >
                                <div className='flex items-center gap-2 min-w-0'>
                                    <span className='w-5 text-white/60'>
                                        {(r.rank ?? i + 1)
                                            .toString()
                                            .padStart(2, ' ')}
                                    </span>
                                    <span className='truncate max-w-[12rem]'>
                                        {name}
                                    </span>
                                </div>
                                <span className='font-semibold tabular-nums'>
                                    {r?.score ?? 0}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
}
