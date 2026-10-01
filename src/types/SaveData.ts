import type { CustomerProgress } from './Customer';
export interface NightReport {
    served: number;
    gold: number;
    perfect: number;
    intimacy: Record<string, number>;
    discoveries: string[];
}
export interface SaveData {
    version: 1;
    gold: number;
    level: number;
    night: number;
    customers: Record<string, CustomerProgress>;
    unlockedRecipes: string[];
    upgrades: Record<string, number>;
    settings: {
        sound: boolean;
    };
    activeNight: {
        queue: string[];
        report: NightReport;
    } | null;
}
