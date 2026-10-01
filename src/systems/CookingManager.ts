import type { Quality } from '../types/Recipe';
export class CookingManager {
    static quality(progress: number, action: string, pot: boolean): Quality { const tolerance = action === 'hold' ? 0.18 : pot ? 0.10 : 0.09; const target = action === 'hold' ? 1 : 0.72; const error = Math.abs(progress - target); return error <= tolerance ? '완벽' : error <= 0.25 ? '맛있음' : '보통'; }
    static riceballTimingScore(progress: number, perfectRange: number): number {
        const error = Math.abs(progress - .5);
        if (error <= perfectRange) return 100 - Math.round(error / perfectRange * 5);
        if (error <= .25) return 89 - Math.round((error - perfectRange) / (.25 - perfectRange) * 29);
        return Math.max(0, 59 - Math.round((error - .25) / .25 * 59));
    }
    static riceballTotal(scores: number[]): number {
        return scores.length ? Math.round(scores.reduce((sum, score) => sum + Math.max(0, Math.min(100, score)), 0) / scores.length) : 0;
    }
    static riceballGrade(score: number): { quality: Quality; label: string } {
        return score >= 90 ? { quality: '완벽', label: 'PERFECT' } : score >= 60 ? { quality: '맛있음', label: 'GOOD' } : { quality: '보통', label: 'NORMAL' };
    }
    static reward(q: Quality) { return q === '완벽' ? { gold: 15, intimacy: 3 } : q === '맛있음' ? { gold: 12, intimacy: 2 } : { gold: 10, intimacy: 1 }; }
}
