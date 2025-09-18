'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { SCENE_KEYS } from '@/game/common/scene-keys';
import { PreloadScene } from '@/game/scenes/preload-scene';
import { TitleScene } from '@/game/scenes/title-scene';
import { GameScene } from '@/game/scenes/game-scene';
import { GameOverScene } from '@/game/scenes/game-over-scene';
import { getPlayer } from '@/game/state/playerState';
import { submitScore } from '@/game/core/submitScore';

export default function NadDefenseRoot() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!containerRef.current || gameRef.current) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.CANVAS,
            pixelArt: true,
            roundPixels: true,
            scale: {
                parent: containerRef.current,
                width: 640,
                height: 450,
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            backgroundColor: '#000000',
            physics: {
                default: 'arcade',
                arcade: { gravity: { y: 0, x: 0 }, debug: false },
            },
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
        game.scene.add(SCENE_KEYS.TITLE_SCENE, TitleScene);
        game.scene.add(SCENE_KEYS.GAME_SCENE, GameScene);
        game.scene.add(SCENE_KEYS.GAME_OVER_SCENE, GameOverScene);
        game.scene.start(SCENE_KEYS.PRELOAD_SCENE);

        // ---- score bridge: listen for CustomEvent('nad:score', { detail: { score } }) ----
        const onScore = async (e: Event) => {
            const detail = (e as CustomEvent).detail as { score: number };
            const score = Math.max(0, Math.floor(detail?.score ?? 0));

            const wallet = (getPlayer()?.address ?? '') as `0x${string}`;
            if (!wallet || !/^0x[0-9a-fA-F]{40}$/.test(wallet)) {
                console.warn(
                    '[nad:score] missing/invalid wallet; skipped',
                    wallet
                );
                return;
            }
            try {
                const res = await submitScore({ wallet, score });
                console.log('[score submitted]', res);
            } catch (err) {
                console.warn('[score submit failed]', err);
            }
        };

        window.addEventListener('nad:score', onScore as EventListener);

        return () => {
            window.removeEventListener('nad:score', onScore as EventListener);
            gameRef.current?.destroy(true);
            gameRef.current = null;
        };
    }, []);

    return <div ref={containerRef} className='absolute inset-0 phaser-root' />;
}
