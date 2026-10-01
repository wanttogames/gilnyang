import type { Quality } from '../types/Recipe';
export class CookingManager {
    static quality(progress: number, action: string, pot: boolean): Quality { const tolerance = action === 'hold' ? 0.18 : pot ? 0.10 : 0.09; const target = action === 'hold' ? 1 : 0.72; const error = Math.abs(progress - target); return error <= tolerance ? '완벽' : error <= 0.25 ? '맛있음' : '보통'; }
    static reward(q: Quality) { return q === '완벽' ? { gold: 15, intimacy: 3 } : q === '맛있음' ? { gold: 12, intimacy: 2 } : { gold: 10, intimacy: 1 }; }
}
