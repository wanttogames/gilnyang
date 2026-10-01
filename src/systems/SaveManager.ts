import type { SaveData, NightReport } from '../types/SaveData';
import { customers } from '../data/customers';
import { recipes } from '../data/recipes';
import { WeatherManager } from './WeatherManager';
import { RecipeManager } from './RecipeManager';
export const SAVE_KEY = 'alley-cat-diner-v1';
export const emptyReport = (): NightReport => ({ served: 0, gold: 0, perfect: 0, intimacy: {}, discoveries: [] });
export function newSave(): SaveData { return { version: 2, gold: 0, level: 1, night: 1, weather: 'clear', customers: Object.fromEntries(customers.map(c => [c.id, { intimacy: 0, visitCount: 0, storyStage: 0, unlocked: false, preferenceFound: false }])), unlockedRecipes: ['rice', 'oden', 'milk'], pendingRecipeUnlocks: [], upgrades: {}, settings: { sound: true }, activeNight: null }; }
export class SaveManager {
    static load(): SaveData {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw)
                return newSave();
            const s = JSON.parse(raw);
            if (![1, 2].includes(s.version) || !Number.isFinite(s.gold) || s.gold < 0 || !Number.isInteger(s.night) || s.night < 1 || !s.customers)
                throw Error('invalid');
            const base = newSave();
            for (const c of customers) {
                const v = s.customers[c.id];
                if (v && Number.isFinite(v.intimacy) && v.intimacy >= 0 && Number.isInteger(v.visitCount) && v.visitCount >= 0)
                    base.customers[c.id] = { intimacy: v.intimacy, visitCount: v.visitCount, storyStage: Math.min(3, Math.max(0, Math.floor(v.storyStage || 0))), unlocked: !!v.unlocked, preferenceFound: !!v.preferenceFound };
            }
            base.gold = s.gold;
            base.night = s.night;
            base.level = Math.max(1, Math.floor(s.level || 1));
            base.upgrades = Object.fromEntries(['lamp', 'chair', 'pot', 'sign'].map(id => [id, s.upgrades?.[id] === 1 ? 1 : 0]));
            base.settings.sound = s.settings?.sound !== false;
            base.weather = WeatherManager.valid(s.weather) ? s.weather : s.activeNight ? 'clear' : WeatherManager.roll(s.night);
            base.unlockedRecipes = [...new Set([...base.unlockedRecipes, ...(Array.isArray(s.unlockedRecipes) ? s.unlockedRecipes.filter((id: unknown) => recipes.some(r => r.id === id)) : [])])] as string[];
            base.pendingRecipeUnlocks = Array.isArray(s.pendingRecipeUnlocks) ? [...new Set(s.pendingRecipeUnlocks.filter((id: unknown) => typeof id === 'string' && base.unlockedRecipes.includes(id) && recipes.some(r => r.id === id && r.unlock)))] as string[] : [];
            if (s.activeNight && Array.isArray(s.activeNight.queue) && s.activeNight.queue.length > 0 && s.activeNight.queue.every((id: unknown) => typeof id === 'string' && customers.some(c => c.id === id))) {
                const r = s.activeNight.report;
                if (r && Number.isInteger(r.served) && r.served >= 0 && r.served <= s.activeNight.queue.length && Number.isFinite(r.gold) && Number.isFinite(r.perfect) && r.intimacy && Array.isArray(r.discoveries))
                    base.activeNight = { queue: s.activeNight.queue, report: r };
            }
            RecipeManager.discover(base);
            return base;
        }
        catch {
            return newSave();
        }
    }
    static save(s: SaveData): boolean {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(s));
            const warning = document.querySelector('#save-warning');
            if (warning)
                warning.textContent = '';
            return true;
        }
        catch {
            const warning = document.querySelector('#save-warning');
            if (warning)
                warning.textContent = '자동 저장을 사용할 수 없어요. 브라우저 저장 공간을 확인해 주세요.';
            return false;
        }
    }
}
