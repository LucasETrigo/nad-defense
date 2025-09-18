'use client';

export async function submitScore(opts: {
    wallet: `0x${string}`;
    score: number;
}) {
    const res = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(opts),
    });
    const json = await res.json();
    if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Submit failed (${res.status})`);
    }
    return json as {
        ok: true;
        forwarded: boolean;
        username: string;
        wallet: string;
        score: number;
        status?: number;
        upstreamPreview?: string;
    };
}
