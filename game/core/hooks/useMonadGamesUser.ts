'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type MGUser = { id: number; username: string; walletAddress: string };

export function useMonadGamesUser(wallet?: string | null) {
    const [user, setUser] = useState<MGUser | null>(null);
    const [hasUsername, setHasUsername] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopPoll = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    };

    const refetch = useCallback(async () => {
        if (!wallet) {
            setUser(null);
            setHasUsername(false);
            setError(null);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(
                `/api/monad-username?wallet=${wallet.toLowerCase()}`,
                { cache: 'no-store' }
            );
            const json = await res.json();
            if (!res.ok || !json.ok)
                throw new Error(json?.error || `HTTP ${res.status}`);
            setHasUsername(Boolean(json.hasUsername));
            setUser(json.user ?? null);
            if (json.hasUsername) stopPoll();
        } catch (e: any) {
            setError(e?.message || 'Failed to fetch');
            setHasUsername(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [wallet]);

    useEffect(() => {
        stopPoll();
        void refetch();
        return () => stopPoll();
    }, [refetch]);

    const startPolling = useCallback(
        (ms = 3000) => {
            stopPoll();
            pollRef.current = setInterval(() => {
                void refetch();
            }, ms);
        },
        [refetch]
    );

    return { user, hasUsername, loading, error, refetch, startPolling };
}
