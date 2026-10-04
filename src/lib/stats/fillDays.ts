// The analytics API omits days with no activity; charts need a continuous
// axis. Days are UTC `YYYY-MM-DD` strings, `start` and `end` inclusive.

const DAY_MS = 86_400_000;

function parse(day: string): number {
    return Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10));
}

export function fillDays<T extends { day: string }>(
    rows: readonly T[], start: string, end: string, empty: (day: string) => T,
): T[] {
    const byDay = new Map(rows.map((r) => [r.day.slice(0, 10), r]));
    const out: T[] = [];
    const last = parse(end);
    for (let t = parse(start); t <= last; t += DAY_MS) {
        const day = new Date(t).toISOString().slice(0, 10);
        out.push(byDay.get(day) ?? empty(day));
    }
    return out;
}
