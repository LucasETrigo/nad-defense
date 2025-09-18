let player: { address?: `0x${string}`; username?: string | null } = {};

export function setPlayer(p: Partial<typeof player>) {
    player = { ...player, ...p };
}

export function getPlayer() {
    return player;
}
