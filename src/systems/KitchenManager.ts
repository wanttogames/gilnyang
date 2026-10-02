import { recipes, recipeById } from '../data/recipes';
import { customerById } from '../data/customers';
import type { SaveData } from '../types/SaveData';
import type { Quality } from '../types/Recipe';

export interface RecipeMastery { xp: number; cooked: number; bestScore: number | null; decorated: boolean }
export interface KitchenNight {
    night: number; specialRecipeId: string; goalKind: 'serve' | 'perfect'; goalTarget: number;
    counts: Record<string, number>; perfect: number; tickets: number[]; claimed: boolean;
}
export interface KitchenReward { xp: number; bonusGold: number; newBest: boolean; rankUp: boolean; dishUnlocked: boolean; toolsUnlocked: boolean; goalCompleted: boolean }
const levels = [0, 30, 90, 180];
const names = ['새싹 요리사', '익숙한 손길', '든든한 요리사', '골목의 장인'];
export const kitchenDecorations: Record<string, string> = { rice: '청자 접시', oden: '청자 접시', milk: '꽃무늬 머그', ramen: '청자 라면 그릇', bread: '금빛 접시' };
const number = (v: unknown, cap = 1_000_000_000): number => typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(cap, Math.floor(v))) : 0;

export class KitchenManager {
    static rank(xp: number) { const level = levels.filter(n => xp >= n).length - 1; return { level, name: names[level], next: levels[level + 1] }; }
    static mastery(s: SaveData, id: string): RecipeMastery { return s.recipeMastery?.[id] ?? { xp: 0, cooked: 0, bestScore: null, decorated: false }; }
    static style(s: SaveData, id: string) { const m = this.mastery(s, id); return { dish: m.decorated && m.xp >= 30, tools: m.decorated && m.xp >= 90 }; }
    static restoreMastery(raw: unknown): Record<string, RecipeMastery> {
        const input = raw && typeof raw === 'object' ? raw as Record<string, any> : {};
        return Object.fromEntries(recipes.map(r => {
            const value = input[r.id], xp = number(value?.xp);
            return [r.id, { xp, cooked: number(value?.cooked), bestScore: typeof value?.bestScore === 'number' && Number.isFinite(value.bestScore) ? number(value.bestScore, 100) : null,
                decorated: xp >= 30 && value?.decorated === true }];
        }));
    }
    static start(s: SaveData): KitchenNight {
        const night = s.activeNight!;
        const mainMenus = night.queue.slice(night.report.served).map(id => customerById(id)).filter(c => c.role !== 'ambient')
            .map(c => c.favoriteFoodIds.find(id => s.unlockedRecipes.includes(id)) ?? 'rice');
        const candidates = recipes.filter(r => s.unlockedRecipes.includes(r.id) && (!mainMenus.length || mainMenus.includes(r.id)));
        const remaining = night.queue.length - night.report.served;
        return { night: s.night, specialRecipeId: (candidates[(s.night - 1) % candidates.length] ?? recipes[0]).id,
            goalKind: s.night % 2 ? 'serve' : 'perfect', goalTarget: remaining === 0 ? 0 : s.night % 2 ? Math.min(3, remaining) : 1,
            counts: Object.fromEntries(recipes.map(r => [r.id, 0])), perfect: 0, tickets: [], claimed: remaining === 0 };
    }
    static ensure(s: SaveData) { if (!s.activeNight) return undefined; return s.activeNight.kitchen ??= this.start(s); }
    static restoreNight(s: SaveData, raw: unknown): KitchenNight {
        const v = raw as Partial<KitchenNight> | null;
        if (!v || v.night !== s.night || !s.unlockedRecipes.includes(v.specialRecipeId ?? '') || !['serve', 'perfect'].includes(v.goalKind ?? '') || !Number.isInteger(v.goalTarget) || v.goalTarget! < 0 || v.goalTarget! > 3) return this.start(s);
        const served = s.activeNight!.report.served;
        const tickets = Array.isArray(v.tickets) ? [...new Set(v.tickets.filter(i => Number.isInteger(i) && i >= 0 && i < served))] : [];
        const counts = Object.fromEntries(recipes.map(r => [r.id, number(v.counts?.[r.id], tickets.length)]));
        if (Object.values(counts).reduce((sum, n) => sum + n, 0) !== tickets.length) return this.start(s);
        const restored: KitchenNight = { night: s.night, specialRecipeId: v.specialRecipeId!, goalKind: v.goalKind!, goalTarget: v.goalTarget!, tickets, counts, perfect: number(v.perfect, tickets.length), claimed: false };
        restored.claimed = v.claimed === true && this.goalProgress(restored) >= restored.goalTarget;
        return restored;
    }
    static goalProgress(k: KitchenNight) { return k.goalKind === 'perfect' ? k.perfect : k.tickets.length; }
    static goalText(k: KitchenNight) { return k.goalTarget === 0 ? '오늘의 영업을 마쳤어요' : k.goalKind === 'perfect' ? `완벽한 한 끼 ${k.goalTarget}회` : `따뜻한 한 끼 ${k.goalTarget}개 전달`; }
    static record(s: SaveData, recipeId: string, rawScore: number, quality: Quality, ticket: number): KitchenReward {
        const reward: KitchenReward = { xp: 0, bonusGold: 0, newBest: false, rankUp: false, dishUnlocked: false, toolsUnlocked: false, goalCompleted: false };
        const k = this.ensure(s);
        if (!k || !s.unlockedRecipes.includes(recipeId) || !recipes.some(r => r.id === recipeId) || !Number.isInteger(ticket) || ticket !== s.activeNight!.report.served || ticket < 0 || ticket >= s.activeNight!.queue.length || k.tickets.includes(ticket)) return reward;
        const m = this.mastery(s, recipeId), oldXP = m.xp, oldRank = this.rank(oldXP).level;
        reward.xp = quality === '완벽' ? 20 : quality === '맛있음' ? 15 : 10;
        const score = number(rawScore, 100);
        reward.newBest = m.bestScore === null || score > m.bestScore;
        m.xp = number(oldXP + reward.xp); m.cooked++;
        m.bestScore = Math.max(m.bestScore ?? 0, score);
        reward.dishUnlocked = oldXP < 30 && m.xp >= 30;
        reward.toolsUnlocked = oldXP < 90 && m.xp >= 90;
        reward.rankUp = this.rank(m.xp).level > oldRank;
        if (reward.dishUnlocked) m.decorated = true;
        (s.recipeMastery ??= {})[recipeId] = m;
        k.tickets.push(ticket); k.counts[recipeId] = (k.counts[recipeId] ?? 0) + 1; k.perfect += quality === '완벽' ? 1 : 0;
        if (recipeId === k.specialRecipeId) reward.bonusGold += 5;
        if (!k.claimed && this.goalProgress(k) >= k.goalTarget) { k.claimed = true; reward.goalCompleted = true; reward.bonusGold += 20; }
        s.gold += reward.bonusGold; s.activeNight!.report.gold += reward.bonusGold;
        const discoveries = s.activeNight!.report.discoveries;
        if (reward.dishUnlocked) discoveries.push(`${recipeById(recipeId).name} · ${kitchenDecorations[recipeId]} 해금`);
        if (reward.toolsUnlocked) discoveries.push(`${recipeById(recipeId).name} · 장인 조리도구 해금`);
        return reward;
    }
}
