'use client';

import dynamic from 'next/dynamic';
import GameNav from '../../game/core/GameNav';

const NadDefenseRoot = dynamic(() => import('../../game/core/NadDefenseRoot'), {
    ssr: false,
});

export default function GamePage() {
    return (
        <div className='relative min-h-dvh'>
            {/* background to match landing */}
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(236,72,153,0.12),transparent_45%)]' />

            {/* centered watermark behind the game */}
            <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                <div
                    className='select-none text-5xl md:text-7xl font-semibold tracking-tight
                        bg-gradient-to-br from-indigo-400/30 via-fuchsia-400/30 to-cyan-300/30
                        bg-clip-text text-transparent'
                >
                    NaddefensE
                </div>
            </div>

            {/* centered game card */}
            <div className='relative z-10 mx-auto flex min-h-dvh items-center justify-center px-4 py-8'>
                <div
                    className='relative w-[min(1200px,92vw)] aspect-[64/45] max-h-[80vh]
                     rounded-2xl border border-white/10 bg-black/40 backdrop-blur
                     shadow-[0_1px_0_#ffffff12_inset,0_0_0_1px_rgba(255,255,255,0.04)]
                     overflow-hidden'
                >
                    {/* Phaser FITs to this parent */}
                    <NadDefenseRoot />
                </div>
            </div>

            {/* centered floating nav pill */}
            <GameNav />
        </div>
    );
}
