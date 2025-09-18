export const ASSET_KEYS = Object.freeze({
  BACKGROUND_1: 'BACKGROUND_1',
  BACKGROUND_2: 'BACKGROUND_2',
  BACKGROUND_3: 'BACKGROUND_3',
  PLANET: 'PLANET',
  ASTEROID_EXPLODE: 'ASTEROID_EXPLODE',
  BULLET: 'BULLET',
  HEART: 'HEART',
  ASTEROID: 'ASTEROID',
  SHIP: 'SHIP',
  BACKGROUND_MUSIC: 'BACKGROUND_MUSIC',
  FX_HIT: 'FX_HIT',
  FX_SHOT: 'FX_SHOT',
  FX_EXPLOSION: 'FX_EXPLOSION',
});

export const SPRITESHEET_ASSETS = [
  {
    assetKey: ASSET_KEYS.BACKGROUND_1,
    frameWidth: 640,
    frameHeight: 360,
    path: 'assets/images/foozle/background_1.png',
    frameRate: 8,
    repeat: -1,
  },
  {
    assetKey: ASSET_KEYS.BACKGROUND_2,
    frameWidth: 640,
    frameHeight: 360,
    path: 'assets/images/foozle/background_2.png',
    frameRate: 8,
    repeat: -1,
  },
  {
    assetKey: ASSET_KEYS.BACKGROUND_3,
    frameWidth: 640,
    frameHeight: 360,
    path: 'assets/images/foozle/background_3.png',
    frameRate: 8,
    repeat: -1,
  },
  {
    assetKey: ASSET_KEYS.PLANET,
    frameWidth: 96,
    frameHeight: 96,
    path: 'assets/images/foozle/planet.png',
    frameRate: 4,
    repeat: -1,
  },
  {
    assetKey: ASSET_KEYS.ASTEROID_EXPLODE,
    frameWidth: 96,
    frameHeight: 96,
    path: 'assets/images/foozle/asteroid_explode.png',
    frameRate: 24,
    repeat: 0,
  },
  {
    assetKey: ASSET_KEYS.BULLET,
    frameWidth: 9,
    frameHeight: 9,
    path: 'assets/images/foozle/bullet.png',
    frameRate: 8,
    repeat: -1,
  },
  {
    assetKey: ASSET_KEYS.HEART,
    frameWidth: 16,
    frameHeight: 16,
    path: 'assets/images/mikiz/hearts.png',
    frameRate: 8,
    repeat: -1,
  },
];

export const IMAGE_ASSETS = [
  {
    assetKey: ASSET_KEYS.SHIP,
    path: 'assets/images/foozle/ship.png',
  },
  {
    assetKey: ASSET_KEYS.ASTEROID,
    path: 'assets/images/foozle/asteroid.png',
  },
];

export const AUDIO_ASSETS = [
  {
    assetKey: ASSET_KEYS.BACKGROUND_MUSIC,
    path: 'assets/audio/ansimuz/space_asteroids.wav',
  },
  {
    assetKey: ASSET_KEYS.FX_EXPLOSION,
    path: 'assets/audio/ansimuz/explosion.wav',
  },
  {
    assetKey: ASSET_KEYS.FX_HIT,
    path: 'assets/audio/ansimuz/hit.wav',
  },
  {
    assetKey: ASSET_KEYS.FX_SHOT,
    path: 'assets/audio/ansimuz/shot_1.wav',
  },
];
