export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { scoreStore } from '@/game/server/scoreStore';

export async function GET() {
    return NextResponse.json(
        {
            ok: true,
            top: scoreStore.top(50),
            allCount: scoreStore.all().length,
        },
        { status: 200 }
    );
}
