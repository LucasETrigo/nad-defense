type Row = {
    wallet: string;
    username: string;
    score: number;
    ts: number;
};

class ScoreStore {
    private rows: Row[] = [];

    add(row: Row) {
        this.rows.push(row);
        if (this.rows.length > 1000) this.rows.shift();
    }

    top(n = 50) {
        return [...this.rows]
            .sort((a, b) => b.score - a.score || a.ts - b.ts)
            .slice(0, n);
    }

    all() {
        return [...this.rows];
    }
}

const globalAny = global as any;
export const scoreStore: ScoreStore =
    globalAny.__nad_store || (globalAny.__nad_store = new ScoreStore());
