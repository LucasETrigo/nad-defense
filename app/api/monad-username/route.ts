import { NextResponse } from 'next/server';

const SOURCES = [
    (w: string) => `https://monadclip.fun/api/check-wallet?wallet=${w}`,
    (w: string) =>
        `https://monad-games-id-site.vercel.app/api/check-wallet?wallet=${w}`,
];

function isHexAddress(s: string) {
    return /^0x[0-9a-fA-F]{40}$/.test(s);
}

async function fetchJson(url: string) {
    // Node/Undici follows redirects by default; still normalize 3xx with body.
    const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });

    let data: any = null;
    try {
        data = await res.json();
    } catch {
        /* some 3xx may still have no body */
    }

    // Treat 2xx as success, and also treat 3xx with JSON as success.
    if (res.ok || (res.status >= 300 && res.status < 400 && data)) {
        return { ok: true, data };
    }

    // If 3xx with Location, follow once manually for safety.
    if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (loc) {
            const res2 = await fetch(new URL(loc, url).toString(), {
                cache: 'no-store',
            });
            const data2 = await res2.json();
            if (res2.ok || data2) return { ok: true, data: data2 };
        }
    }

    return { ok: false, error: `HTTP ${res.status}` };
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const wallet = (url.searchParams.get('wallet') || '').trim().toLowerCase();

    if (!isHexAddress(wallet)) {
        return NextResponse.json(
            { ok: false, error: 'Invalid wallet' },
            { status: 400 }
        );
    }

    let lastError = 'Unknown error';
    for (const make of SOURCES) {
        try {
            const { ok, data, error } = await fetchJson(make(wallet));
            if (!ok) {
                lastError = error || lastError;
                continue;
            }

            // Normalize payload
            const has = !!data?.hasUsername;
            const user = has ? data?.user ?? null : null;
            const username = user?.username ?? null;

            return NextResponse.json(
                { ok: true, hasUsername: has && !!username, user },
                { headers: { 'Cache-Control': 'no-store' } }
            );
        } catch (e: any) {
            lastError = e?.message || lastError;
        }
    }

    return NextResponse.json(
        { ok: false, error: lastError },
        { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
}
