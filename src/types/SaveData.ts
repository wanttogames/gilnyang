import type { AlleyNightState } from './AlleyEvent';
import type { NightConditionId } from '../data/nightConditions';
import type { CustomerProgress } from './Customer';
import type { Weather } from './Weather';
import type { RecipeMastery, KitchenNight } from '../systems/KitchenManager';
export interface NightReport {
    served: number;
    gold: number;
    perfect: number;
    intimacy: Record<string, number>;
    discoveries: string[];
}
export interface SaveData {
    version: 2;
    gold: number;
    level: number;
    night: number;
    /** Set after the new-player opening sequence; absent in older saves. */
    prologueSeen?: boolean;
    dongguLetters?: import('../systems/LetterManager').LetterProgress;
    weather: Weather;
    customers: Record<string, CustomerProgress>;
    unlockedRecipes: string[];
    pendingRecipeUnlocks: string[];
    upgrades: Record<string, number>;
    recipeMastery?: Record<string, RecipeMastery>;
    restaurantDecor?: import('../systems/DecorationManager').RestaurantDecor;
    specialOrderHistory?: Record<string, import('../systems/SpecialOrderManager').SpecialOrderHistory>;
    settings: {
        sound: boolean;
    };
    recentCustomers?: string[];
    completedAlleyEvents?: string[];
    recentAlleyEventIds?: string[];
    activeNight: {
        kitchen?: KitchenNight;
        specialOrders?: Record<string, import('../systems/SpecialOrderManager').SpecialOrder | null>;
        alley?: AlleyNightState;
        condition?: NightConditionId;
        pairStarts?: number[];
        queue: string[];
        report: NightReport;
    } | null;
}
