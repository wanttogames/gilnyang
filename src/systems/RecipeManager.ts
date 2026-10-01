import { recipeById, recipes } from '../data/recipes';
import type { Customer } from '../types/Customer';
import type { SaveData } from '../types/SaveData';
export class RecipeManager {
    static order(c: Customer, s: SaveData) { return recipeById(c.favoriteFoodIds.find(id => s.unlockedRecipes.includes(id)) || 'rice'); }
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
