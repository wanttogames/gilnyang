import { nightConditions } from '../data/nightConditions';
import { recipeById, recipes } from '../data/recipes';
import type { Customer } from '../types/Customer';
import type { SaveData } from '../types/SaveData';
export class RecipeManager {
    static order(c: Customer, s: SaveData, random = Math.random) {
        if (c.role !== 'ambient') return recipeById(c.favoriteFoodIds.find(id => s.unlockedRecipes.includes(id)) || 'rice');
        const modifier = nightConditions[s.activeNight?.condition ?? 'ordinary'];
        const pool = s.unlockedRecipes.map(id => ({id, weight: (c.favoriteFoodIds.includes(id) ? 4 : 1) * (modifier.recipeWeights[id] ?? 1)}));
        let pick = random() * pool.reduce((sum,r) => sum + r.weight,0);
        return recipeById((pool.find(r => (pick -= r.weight) < 0) ?? pool[0]).id);
    }
    static all() { return recipes; }
    static discover(s: SaveData): string[] {
        const found: string[] = [];
        for (const recipe of recipes) {
            const u = recipe.unlock;
            if (!u || s.unlockedRecipes.includes(recipe.id))
                continue;
            const guest = s.customers[u.customerId];
            if (guest.visitCount < u.visits || guest.intimacy < u.intimacy)
                continue;
            s.unlockedRecipes.push(recipe.id);
            found.push(recipe.id);
            if (!s.pendingRecipeUnlocks.includes(recipe.id))
                s.pendingRecipeUnlocks.push(recipe.id);
        }
        return found;
    }
}
