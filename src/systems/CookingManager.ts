import type { Quality } from '../types/Recipe';
export class CookingManager {
    static quality(progress: number, action: string, pot: boolean): Quality { const tolerance = action === 'hold' ? 0.18 : pot ? 0.10 : 0.09; const target = action === 'hold' ? 1 : 0.72; const error = Math.abs(progress - target); return error <= tolerance ? '완벽' : error <= 0.25 ? '맛있음' : '보통'; }
    static riceballTimingScore(progress: number, perfectRange: number): number {
        const error = Math.abs(progress - .5);
        if (error <= perfectRange) return 100 - Math.round(error / perfectRange * 5);
        if (error <= .25) return 89 - Math.round((error - perfectRange) / (.25 - perfectRange) * 29);
        return Math.max(0, 59 - Math.round((error - .25) / .25 * 59));
    }
    static totalScore(scores: number[]): number {
        return scores.length ? Math.round(scores.reduce((sum, score) => sum + Math.max(0, Math.min(100, score)), 0) / scores.length) : 0;
    }
    static scoreGrade(score: number): { quality: Quality; label: string } {
        return score >= 90 ? { quality: '완벽', label: 'PERFECT' } : score >= 60 ? { quality: '맛있음', label: 'GOOD' } : { quality: '보통', label: 'NORMAL' };
    }
    static odenState(progress: number, goodStart: number, center: number, range: number, lateGoodEnd: number): { label: string; tone: string; score: number } {
        const start = center - range, end = center + range;
        if (progress < goodStart) return { label: '설익음', tone: 'raw', score: Math.max(0, Math.round(progress / goodStart * 59)) };
        if (progress < start) return { label: '적당함', tone: 'good', score: 60 + Math.round((progress - goodStart) / (start - goodStart) * 29) };
        if (progress <= end) return { label: 'PERFECT', tone: 'perfect', score: 100 - Math.round(Math.abs(progress - center) / range * 5) };
        if (progress <= lateGoodEnd) return { label: '조금 더 익음', tone: 'late', score: 89 - Math.round((progress - end) / (lateGoodEnd - end) * 29) };
        return { label: '퍼짐', tone: 'over', score: Math.max(0, Math.round((1 - Math.min(1, progress)) / (1 - lateGoodEnd) * 59)) };
    }
    static reward(q: Quality) { return q === '완벽' ? { gold: 15, intimacy: 3 } : q === '맛있음' ? { gold: 12, intimacy: 2 } : { gold: 10, intimacy: 1 }; }
}
