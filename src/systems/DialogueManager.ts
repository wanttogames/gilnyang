import { CharacterStoryManager } from './CharacterStoryManager';
import { nabiAfterStoryOrders, nabiPreferenceOrders, dubuAfterStoryOrders, kkamangAfterStoryOrders } from '../data/characterStories';
import { rainDialogues } from '../data/rainDialogues';
import type { Weather } from '../types/Weather';
import type { Recipe } from '../types/Recipe';
import { dialogues } from '../data/dialogues';
import type { CustomerProgress } from '../types/Customer';
export class DialogueManager {
    static order(id: string, weather: Weather, recipe: Recipe, progress?: CustomerProgress): string {
        if (id === 'kkamang' && recipe.id === 'ramen') {
            if (progress?.characterStory?.pending?.eventId === 'KKAMANG_STORY_4') return '오늘은 계란 두 개.';
            if (progress && CharacterStoryManager.complete(id, progress)) {
                if (Math.random() < .04) return '여기, 나쁘지 않아.';
                const pool = [weather === 'rain' ? '비 오네.' : '라면.', ...kkamangAfterStoryOrders];
                return pool[Math.floor(Math.random() * pool.length)];
            }
            return weather === 'rain' ? '비 오네. 라면.' : '라면. 계란은 반숙.';
        }
        if (id === 'dubu' && progress) {
            const base = weather === 'rain' ? rainDialogues[id].order.replace('{food}', recipe.name) : dialogues[id].order;
            if (CharacterStoryManager.complete(id, progress)) {
                if (Math.random() < .04) return '오늘은 주인이 일찍 왔어요! 어묵 주세요!';
                const pool = [base, ...dubuAfterStoryOrders];
                return pool[Math.floor(Math.random() * pool.length)];
            }
            if ((progress.characterStory?.stage ?? 0) >= 3 && Math.random() < .35) return '어묵 국물 많이 주세요!';
            return base;
        }
        if (id === 'nabi' && progress) {
            const extra = CharacterStoryManager.complete(id, progress) ? nabiAfterStoryOrders : (progress.characterStory?.stage ?? 0) >= 2 ? nabiPreferenceOrders : [];
            const base = weather === 'rain' ? rainDialogues[id].order.replace('{food}', recipe.name) : dialogues[id].order;
            const pool = [base, ...extra];
            return pool[Math.floor(Math.random() * pool.length)];
        }
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
        if (CharacterStoryManager.events(id).length) return [];
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
