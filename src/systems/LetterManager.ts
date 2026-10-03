import { dongguLetters } from '../data/dongguLetters';
import type { SaveData } from '../types/SaveData';
export interface LetterProgress { stage: number; lastVisit: number; lastNight: number; line?: number }
export class LetterManager {
    static restore(value: unknown): LetterProgress {
        const r = value && typeof value === 'object' ? value as Record<string, unknown> : {};
        const n = (v: unknown) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 ? v : 0;
        const p: LetterProgress = { stage: Math.min(dongguLetters.length, n(r.stage)), lastVisit: n(r.lastVisit), lastNight: n(r.lastNight) };
        if (Number.isInteger(r.line) && typeof r.line === 'number' && r.line >= 0 && r.line < (dongguLetters[p.stage]?.after.length ?? 0)) p.line = r.line;
        return p;
    }
    static pending(s: SaveData) { return s.dongguLetters?.line !== undefined ? dongguLetters[s.dongguLetters.stage] : undefined; }
    static reserve(s: SaveData) {
        const p = s.dongguLetters ??= this.restore(undefined), c = s.customers.donggu, event = dongguLetters[p.stage];
        if (this.pending(s)) return this.pending(s);
        if (!event || !c.unlocked || c.visitCount < event.minVisits || c.intimacy < event.minIntimacy || s.night <= p.lastNight || c.visitCount - p.lastVisit < event.visitsSincePrevious) return undefined;
        p.line = 0; return event;
    }
    static advance(s: SaveData) {
        const event = this.pending(s), p = s.dongguLetters;
        if (!event || !p || p.line === undefined) return false;
        if (++p.line < event.after.length) return false;
        p.stage++; p.lastVisit = s.customers.donggu.visitCount; p.lastNight = s.night; delete p.line;
        s.activeNight?.report.discoveries.push('동구의 편지 · ' + event.title);
        return true;
    }
}
