import { CookingManager } from './CookingManager';
import type { CookingResult, CookingStepScore } from '../types/Cooking';

export interface RamenCustomer { id: string; name: string; twoEggs?: boolean; specialExtra?: string }
export interface RamenOrder { customerName: string; brothCenter: number; noodleCenter: number; texture: string; eggs: number }
export interface RamenResult extends CookingResult { steps: CookingStepScore[]; eggs: number }

export class RamenManager {
    static order(customer?: RamenCustomer, extra = ''): RamenOrder {
        const soft = ['dubu', 'mongsil'].includes(customer?.id ?? '');
        const firm = ['kkamang', 'nabi'].includes(customer?.id ?? '');
        return { customerName: customer?.name ?? '친구', brothCenter: extra === 'broth' ? .82 : .7, noodleCenter: soft ? .76 : firm ? .56 : .66,
            texture: soft ? '부드러운 면' : firm ? '꼬들꼬들한 면' : '알맞게 익힌 면',
            eggs: customer?.twoEggs || extra === 'egg' ? 2 : 1 };
    }

    static score(progress: number, center: number, range: number): number {
        return CookingManager.riceballTimingScore(.5 + Math.max(0, Math.min(1, progress)) - center, range);
    }

    static result(steps: CookingStepScore[], order: RamenOrder): RamenResult {
        // A second egg adds an action, without increasing the weight of eggs in the reward.
        const categories = ['broth', 'noodle', 'egg'].map(id => CookingManager.totalScore(steps.filter(s => s.id.startsWith(id)).map(s => s.score)));
        const score = CookingManager.totalScore(categories);
        const quality = CookingManager.scoreGrade(score).quality;
        return { score, quality, steps: steps.map(s => ({ ...s })), eggs: order.eggs, serving: order.eggs === 2 ? 'two-eggs' : undefined,
            reaction: quality === '완벽' ? `${order.texture}에 반숙 계란${order.eggs === 2 ? ' 두 개' : ''}까지! 국물도 딱 알맞아요.`
                : quality === '맛있음' ? '후루룩… 따뜻한 국물이 속까지 데워 주네요.'
                : '조금 달라도 괜찮아요. 따뜻한 라면 한 그릇, 잘 먹었어요.' };
    }
}
