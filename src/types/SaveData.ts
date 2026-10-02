import type { AlleyNightState } from './AlleyEvent';
import type { NightConditionId } from '../data/nightConditions';
import type { CustomerProgress } from './Customer';
import type { Weather } from './Weather';
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
    weather: Weather;
    customers: Record<string, CustomerProgress>;
    unlockedRecipes: string[];
    pendingRecipeUnlocks: string[];
    upgrades: Record<string, number>;
    settings: {
        sound: boolean;
    };
    recentCustomers?: string[];
    completedAlleyEvents?: string[];
    recentAlleyEventIds?: string[];
    activeNight: {
        alley?: AlleyNightState;
        condition?: NightConditionId;
        pairStarts?: number[];
        queue: string[];
        report: NightReport;
    } | null;
}
