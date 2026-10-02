export type DubuTreasure = 'button' | 'cap' | 'stone';
export interface DubuDigState {
    target: number;
    treasure: DubuTreasure;
    sniffed?: number;
    missed?: number;
    found: boolean;
}
export const dubuTreasures = {
    button: { name: '낡은 단추', reaction: '“동그란 게 예뻐요!”' },
    cap: { name: '병뚜껑', reaction: '“반짝해요! 보물이에요!”' },
    stone: { name: '작은 돌', reaction: '“매끈해요. 주머니에 쏙 들어가겠어요!”' },
};
/** One sniff, then one or two gentle digs. Every route finds a small treasure. */
export function newDubuDig(random = Math.random): DubuDigState {
    const treasures: DubuTreasure[] = ['button', 'cap', 'stone'];
    return { target: Math.floor(random() * 3), treasure: treasures[Math.floor(random() * 3)], found: false };
}
export function digDubu(state: DubuDigState, spot: number): boolean {
    if (!Number.isInteger(spot) || spot < 0 || spot > 2 || state.found) return false;
    if (state.sniffed === undefined) state.sniffed = spot;
    else if (spot === state.target) state.found = true;
    else if (state.missed === undefined) state.missed = spot;
    else return false;
    return true;
}
export function restoreDubuDig(raw: unknown): DubuDigState | undefined {
    if (!raw || typeof raw !== 'object') return undefined;
    const r = raw as Record<string, unknown>;
    const spot = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 3;
    if (!spot(r.target) || typeof r.treasure !== 'string' || !Object.hasOwn(dubuTreasures, r.treasure)) return undefined;
    const sniffed = spot(r.sniffed) ? r.sniffed : undefined;
    const missed = sniffed !== undefined && spot(r.missed) && r.missed !== r.target ? r.missed : undefined;
    return { target: r.target, treasure: r.treasure as DubuTreasure, ...(sniffed !== undefined ? { sniffed } : {}), ...(missed !== undefined ? { missed } : {}), found: sniffed !== undefined && r.found === true };
}
