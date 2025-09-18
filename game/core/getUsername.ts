// game/core/getUsername.ts
export type MonadClipResponse = {
    hasUsername?: boolean;
    user?: { username?: string | null; walletAddress?: string | null };
};

export async function getMonadUsername(
    addr: `0x${string}`
): Promise<string | null> {
    const url = `https://monadclip.fun/api/check-wallet?wallet=${addr}`;
    try {
        console.debug('[username] fetching for', addr, url);
        const res = await fetch(url, { method: 'GET', cache: 'no-store' });

        if (!res.ok) {
            console.warn('[username] HTTP error', res.status, res.statusText);
            return null;
        }

        const json = (await res.json()) as MonadClipResponse;
        console.debug('[username] api json =', json);

        const has = Boolean(json?.hasUsername);
        const name = json?.user?.username ?? null;
        return has && typeof name === 'string' && name.length > 0 ? name : null;
    } catch (e) {
        console.warn('[username] fetch error', e);
        return null;
    }
}
