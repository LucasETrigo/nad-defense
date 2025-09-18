import Phaser from 'phaser';
import { getPlayer } from '@/game/state/playerState';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';

export class TitleScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.TITLE_SCENE,
        });
    }

    create() {
        const { address, username } = getPlayer?.() ?? {};
        if (address) {
            this.add
                .text(
                    this.scale.width / 2,
                    60,
                    username ? `Signed in: ${username}` : `Wallet: ${address}`,
                    { fontSize: '14px' }
                )
                .setOrigin(0.5);
        }

        // create game background
        for (let i = 1; i < 4; i += 1) {
            this.add
                .sprite(0, 0, ASSET_KEYS[`BACKGROUND_${i}`], 0)
                .setOrigin(0)
                .setAlpha(0.4)
                .play(ASSET_KEYS[`BACKGROUND_${i}`])
                .setScale(1, 1.25);
        }

        // create planet to defend
        this.add
            .sprite(
                this.scale.width / 2,
                this.scale.height / 2,
                ASSET_KEYS.PLANET,
                0
            )
            .play(ASSET_KEYS.PLANET);

        this.add
            .text(this.scale.width / 2, 100, 'Nad Defense', {
                fontSize: '32px',
            })
            .setOrigin(0.5);
        this.add
            .text(this.scale.width / 2, 130, 'Made by: 0xLukkz', {
                fontSize: '11px',
            })
            .setOrigin(0.5);

        this.add
            .text(this.scale.width / 2, 350, 'Click to play!', {
                fontSize: '22px',
            })
            .setOrigin(0.5);

        this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once(
                Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
                () => {
                    this.scene.start(SCENE_KEYS.GAME_SCENE);
                }
            );
        });

        this.cameras.main.fadeIn(500);
    }
}
