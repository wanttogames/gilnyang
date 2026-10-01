import { recipeById, recipes } from '../data/recipes';
import type { Customer } from '../types/Customer';
export class RecipeManager {
    static order(c: Customer) { return recipeById(c.favoriteFoodIds[0]); }
    static all() { return recipes; }
}
