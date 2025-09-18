'use client';

import { useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { writeScoreWithPrivy } from '@/game/core/score/onchain';

declare global {
    interface Window {
        nadSubmitScore?: (score: number) => void;
    }
}

export default function ScoreSubmitBridge() {
    const { wallets } = useWallets();
    const embedded = wallets.find(
        (w) => (w as any).walletClientType === 'privy'
    );

    useEffect(() => {
        // install global only when embedded wallet is available
        window.nadSubmitScore = async (score: number) => {
            if (!embedded) {
                console.warn('[score] No embedded wallet');
                return;
            }
            const eip1193 = await (embedded as any).getEthereumProvider?.();
            const account = (embedded as any).address as `0x${string}`;
            try {
                const hash = await writeScoreWithPrivy({
                    eip1193,
                    account,
                    score,
                });
                console.log('[score] submitted tx', hash);
            } catch (e) {
                console.warn('[score] submit failed:', e);
            }
        };

        return () => {
            // clean up (avoid stale closures)
            if (window.nadSubmitScore) delete window.nadSubmitScore;
        };
    }, [embedded]);

    return null;
}
