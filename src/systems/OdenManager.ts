import { odenCooking } from '../data/cookingSteps';
import { CookingManager } from './CookingManager';
import type { Quality } from '../types/Recipe';

export interface OdenResult { score: number; selectionScore: number; timingScore: number; quality: Quality; reaction: string }
export interface OdenOrder { ids: string[]; center: number; texture: string; customerName: string }

export class OdenManager {
    static order(customerId = '', customerName = '친구', random = Math.random): OdenOrder {
        const ids = odenCooking.pieces.map(piece => piece.id);
        for (let i = ids.length - 1; i > 0; i--) {
            const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
            [ids[i], ids[j]] = [ids[j], ids[i]];
        }
        const soft = ['dubu', 'mongsil'].includes(customerId);
        const firm = ['kkamang', 'nabi'].includes(customerId);
        return { ids, customerName, center: soft ? .77 : firm ? .59 : .68,
            texture: soft ? '푹 익혀 부드럽게' : firm ? '살짝 익혀 탱글하게' : '알맞게 익혀 따뜻하게' };
    }

    static result(mistakes: number, scores: number[], order: OdenOrder): OdenResult {
        const selectionScore = Math.max(60, 100 - mistakes * 10);
        const timingScore = CookingManager.totalScore(scores);
        const score = Math.round(selectionScore * .2 + timingScore * .8);
        const quality = CookingManager.scoreGrade(score).quality;
        const reaction = quality === '완벽' ? `${order.texture} 딱 좋아요! 꼬치 순서까지 기억해 줬네요.`
            : quality === '맛있음' ? '따뜻한 국물에 어묵 한입… 오늘도 잘 먹었어요!'
            : '조금 일찍, 조금 늦게 건져도 괜찮아요. 따뜻하게 챙겨 줘서 고마워요.';
        return { score, selectionScore, timingScore, quality, reaction };
    }
}
