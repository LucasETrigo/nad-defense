export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { scoreStore } from '@/game/server/scoreStore';

function bad(msg: string, code = 400, extra?: any) {
    return NextResponse.json(
        { ok: false, error: msg, ...extra },
        { status: code }
    );
}
function ok(data: any) {
    return NextResponse.json({ ok: true, ...data }, { status: 200 });
}

/** Extract JSON array after key "<name>":[ ... ] from a text/x-component stream */
function extractArray(name: string, text: string): any[] {
    const key = `"${name}":[`;
    const i = text.indexOf(key);
    if (i === -1) return [];
    let j = i + key.length - 1;
    let depth = 0;
    let started = false;
    for (; j < text.length; j++) {
        const ch = text[j];
        if (ch === '[') {
            depth++;
            started = true;
        } else if (ch === ']') {
            depth--;
            if (started && depth === 0) {
                j++;
                break;
            }
        }
    }
    const raw = text.slice(i + key.length - 1, j);
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const gameId = url.searchParams.get('gameId') ?? '68';
    const page = url.searchParams.get('page') ?? '1';
    const sortBy = url.searchParams.get('sortBy') ?? 'scores';

    // 1) Try local store first (so your new scores show instantly)
    const localTop = scoreStore.top(50);
    if (localTop.length) {
        return ok({
            source: 'local',
            gameId: Number(gameId),
            page: Number(page),
            sortBy,
            scoreData: localTop.map((r, i) => ({
                rank: i + 1,
                username: r.username,
                walletAddress: r.wallet,
                score: r.score,
                ts: r.ts,
            })),
            transactionData: [],
        });
    }

    // 2) Fallback to upstream (format may change; handle redirects + errors)
    const target = `https://monad-games-id-site.vercel.app/leaderboard?page=${encodeURIComponent(
        page
    )}&gameId=${encodeURIComponent(gameId)}&sortBy=${encodeURIComponent(
        sortBy
    )}&_rsc=1`;

    try {
        const r = await fetch(target, {
            method: 'GET',
            headers: {
                accept: 'text/x-component,*/*',
                rsc: '1',
                'next-url': '/leaderboard',
                'cache-control': 'no-cache',
                pragma: 'no-cache',
                'user-agent': 'Mozilla/5.0 (+leaderboard-proxy)',
            },
            cache: 'no-store',
            redirect: 'follow',
        });

        const bodyText = await r.text();
        if (!r.ok) {
            // Don’t 502 your app; return empty upstream with debug so UI still renders
            return ok({
                source: 'upstream-error',
                gameId: Number(gameId),
                page: Number(page),
                sortBy,
                scoreData: [],
                transactionData: [],
                upstreamStatus: r.status,
                upstreamPreview: bodyText.slice(0, 400),
            });
        }

        const scoreData = extractArray('scoreData', bodyText);
        const transactionData = extractArray('transactionData', bodyText);

        // best-effort lastUpdated
        let lastUpdated: string | null = null;
        const lu =
            bodyText.match(/"lastUpdated":"\$D([^"]+)"/) ||
            bodyText.match(/"lastUpdated":"([^"]+)"/);
        if (lu) lastUpdated = lu[1];

        return ok({
            source: 'upstream',
            gameId: Number(gameId),
            page: Number(page),
            sortBy,
            lastUpdated,
            scoreData,
            transactionData,
        });
    } catch (e: any) {
        // Also don’t 502—just surface the error and empty data
        return ok({
            source: 'proxy-exception',
            gameId: Number(gameId),
            page: Number(page),
            sortBy,
            scoreData: [],
            transactionData: [],
            error: e?.message || 'Proxy parse failed',
        });
    }
}
