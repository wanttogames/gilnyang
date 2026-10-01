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
    activeNight: {
        queue: string[];
        report: NightReport;
    } | null;
}
