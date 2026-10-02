import { CookingManager } from './CookingManager';
import type { CookingResult, CookingStepScore } from '../types/Cooking';

export interface BreadOrder { name: string; center: number; texture: string; scoops: number }
export interface BreadResult extends CookingResult { steps: CookingStepScore[]; scoops: number }
export class BreadManager {
    static order(customer?: { id: string; name: string }, extra = ''): BreadOrder {
        const crispy = ['mongsil', 'kkamang'].includes(customer?.id ?? '');
        const soft = ['dubu', 'donggu'].includes(customer?.id ?? '');
        return { name: customer?.name ?? '친구', center: crispy ? .76 : soft ? .58 : .67,
            texture: crispy ? '바삭한 껍질' : soft ? '부드러운 껍질' : '노릇한 껍질', scoops: extra === 'redbean' ? 2 : 1 };
    }
    static score(progress: number, center: number, range: number) {
        return CookingManager.riceballTimingScore(.5 + Math.max(0, Math.min(1, progress)) - center, range);
    }
    static result(steps: CookingStepScore[], order: BreadOrder): BreadResult {
        const scores = ['batter', 'filling', 'bake'].map(id => CookingManager.totalScore(steps.filter(s => s.id.startsWith(id)).map(s => s.score)));
        const score = CookingManager.totalScore(scores), quality = CookingManager.scoreGrade(score).quality;
        return { score, quality, steps: steps.map(s => ({ ...s })), scoops: order.scoops,
            reaction: quality === '완벽' ? `${order.texture}에 ${order.scoops === 2 ? '팥도 듬뿍! ' : ''}꼬리부터 한입… 딱 좋아요!`
                : quality === '맛있음' ? '따끈한 붕어빵에 달콤한 팥! 하나씩 아껴 먹을래요.'
                : '조금 모양이 달라도 괜찮아요. 따뜻하게 구워 줘서 고마워요.' };
    }
}
