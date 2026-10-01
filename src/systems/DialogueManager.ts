import { rainDialogues } from '../data/rainDialogues';
import type { Weather } from '../types/Weather';
import type { Recipe } from '../types/Recipe';
import { dialogues } from '../data/dialogues';
import type { CustomerProgress } from '../types/Customer';
export class DialogueManager {
    static order(id: string, weather: Weather, recipe: Recipe): string {
        if (weather === 'rain')
            return rainDialogues[id].order.replace('{food}', recipe.name);
        if (recipe.id === 'ramen')
            return '그때 알려 준 계란 라면… 오늘도 먹고 싶어.';
        if (recipe.id === 'bread')
            return '붕어빵 한 마리요! 꼬리부터 먹을 거예요.';
        return dialogues[id].order;
    }
    static reaction(id: string, weather: Weather, favorite: boolean): string {
        return favorite ? dialogues[id].favorite : weather === 'rain' ? rainDialogues[id].thanks : dialogues[id].thanks;
    }
    static unlock(id: string, p: CustomerProgress): string[] {
        const thresholds = [[5, 10], [10, 25], [15, 50]];
        const t = thresholds[p.storyStage];
        if (t && p.visitCount >= t[0] && p.intimacy >= t[1]) {
            const lines = dialogues[id].stories[p.storyStage];
            p.storyStage++;
            if (p.storyStage === 1)
                p.preferenceFound = true;
            return lines;
        }
        return [];
    }
    static rank(n: number) { return n >= 50 ? '특별한 친구' : n >= 25 ? '친한 손님' : n >= 10 ? '단골' : '낯선 손님'; }
}
