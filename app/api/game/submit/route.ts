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

function isHexAddr(s: unknown): s is `0x${string}` {
    return typeof s === 'string' && /^0x[0-9a-fA-F]{40}$/.test(s);
}
function ipFromReq(req: Request) {
    // X-Forwarded-For for Vercel/Netlify, fallback to connection ip when available
    const fwd = req.headers.get('x-forwarded-for') ?? '';
    return fwd.split(',')[0].trim() || '0.0.0.0';
}

type VerifyResp = {
    ok: boolean;
    hasUsername: boolean;
    user?: { username: string; walletAddress: string };
};

const RL: Record<string, { count: number; ts: number }> = {};
const WINDOW_MS = 15_000; // 15s
const MAX_PER_WINDOW = 3;

/** naive in-memory rate-limit: ok for hobby; replace with KV/Upstash for prod */
function rateLimit(key: string) {
    const now = Date.now();
    const rec = (RL[key] ||= { count: 0, ts: now });
    if (now - rec.ts > WINDOW_MS) {
        rec.ts = now;
        rec.count = 0;
    }
    rec.count++;
    return rec.count <= MAX_PER_WINDOW;
}

export async function POST(req: Request) {
    try {
        const ip = ipFromReq(req);
        if (!rateLimit(`ip:${ip}`))
            return bad('Too many submissions (ip)', 429);

        const json = await req.json().catch(() => ({}));
        const { wallet, score } = json as { wallet?: string; score?: number };

        if (!isHexAddr(wallet)) return bad('Invalid wallet', 400);
        if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
            return bad('Invalid score', 400);
        }
        if (!rateLimit(`wallet:${wallet.toLowerCase()}`))
            return bad('Too many submissions (wallet)', 429);

        // 1) Verify username for this wallet using your existing proxy (no CORS)
        const verifyRes = await fetch(
            `${
                new URL(req.url).origin
            }/api/monad-username?wallet=${wallet.toLowerCase()}`,
            { cache: 'no-store' }
        );
        const verify: VerifyResp = await verifyRes.json();
        if (
            !(
                verifyRes.ok &&
                verify.ok &&
                verify.hasUsername &&
                verify.user?.username
            )
        ) {
            return bad('Wallet has no registered username', 403);
        }

        const username = verify.user.username;

        scoreStore.add({
            wallet: wallet.toLowerCase(),
            username,
            score: Math.floor(score),
            ts: Date.now(),
        });

        // 2) (Optional) Forward to real upstream if available
        const upstream = process.env.MONAD_SUBMIT_URL; // e.g. 'https://monad-games-id-site.vercel.app/api/submit'
        const gameId = process.env.NEXT_PUBLIC_GAME_ID || '68';

        if (upstream) {
            const up = await fetch(upstream, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    gameId,
                    wallet: wallet.toLowerCase(),
                    username,
                    score: Math.floor(score),
                }),
                cache: 'no-store',
            });

            const payload = await up.text().catch(() => '');
            return ok({
                forwarded: true,
                status: up.status,
                username,
                wallet,
                score: Math.floor(score),
                upstreamPreview: payload.slice(0, 300),
            });
        }

        return ok({
            forwarded: false,
            note: 'No MONAD_SUBMIT_URL set; accepted locally.',
            username,
            wallet,
            score: Math.floor(score),
        });
    } catch (e: any) {
        return bad(e?.message || 'Submit failed', 500);
    }
}
