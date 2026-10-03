import { RecipeManager } from './RecipeManager';
import { recipeById } from '../data/recipes';
import type { SaveData } from '../types/SaveData';
import type { Quality } from '../types/Recipe';
import { CookingManager } from './CookingManager';
import { DialogueManager } from './DialogueManager';
import { SaveManager } from './SaveManager';
import { customerById } from '../data/customers';
import { SpecialOrderManager } from './SpecialOrderManager';
import { KitchenManager } from './KitchenManager';
export class ProgressionManager {
    static serve(s: SaveData, id: string, q: Quality, extra: string, meal?: { recipeId: string; score: number }) {
        const c = customerById(id), p = s.customers[id], r = s.activeNight!.report;
        const reward = CookingManager.reward(q);
        const kitchen = meal ? KitchenManager.record(s, meal.recipeId, meal.score, q, r.served) : undefined;
        s.recentCustomers = [...(s.recentCustomers ?? []), id].slice(-3);
        if (c.role === 'ambient') {
            s.gold += reward.gold; r.gold += reward.gold;
            r.perfect += q === '완벽' ? 1 : 0; r.served++;
            SaveManager.save(s);
            return { gold: reward.gold + (kitchen?.bonusGold ?? 0), intimacy: 0, favorite: false, stories: [] as string[], kitchen };
        }
        const specialOrder = SpecialOrderManager.resolve(s, id, meal, extra);
        const favorite = p.preferenceFound && extra === c.favoriteIngredients[0];
        const gain = reward.intimacy + (favorite ? 2 : 0) + (s.upgrades.chair ? 1 : 0) + (specialOrder?.intimacy ?? 0);
        p.unlocked = true;
        p.visitCount++;
        p.intimacy += gain;
        s.gold += reward.gold;
        r.gold += reward.gold;
        r.perfect += q === '완벽' ? 1 : 0;
        r.intimacy[id] = (r.intimacy[id] || 0) + gain;
        r.served++;
        const stories = DialogueManager.unlock(id, p);
        if (stories.length)
            r.discoveries.push(c.name + (p.storyStage === 1 ? '의 취향 발견' : '의 이야기 ' + p.storyStage));
        s.level = 1 + Math.floor(Object.values(s.customers).reduce((n, p) => n + p.visitCount, 0) / 10);
        const newRecipes = RecipeManager.discover(s);
        for (const recipeId of newRecipes)
            r.discoveries.push('새 레시피 · ' + recipeById(recipeId).name);
        SaveManager.save(s);
        return { gold: reward.gold + (kitchen?.bonusGold ?? 0) + (specialOrder?.gold ?? 0), intimacy: gain, favorite, stories, kitchen, specialOrder };
    }
}
