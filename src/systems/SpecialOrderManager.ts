import { RumorManager } from './RumorManager';
import { specialOrders, specialOrderReactions } from '../data/specialOrders';
import { recipeById } from '../data/recipes';
import type { SaveData } from '../types/SaveData';
export interface SpecialOrder { recipeId: string; extra: string; status: 'pending' | 'success' | 'missed' }
export interface SpecialOrderHistory { completed: number; lastNight: number }
export class SpecialOrderManager {
    static readonly minScore = 75;
    static readonly bonusGold = 12;
    static readonly bonusIntimacy = 3;
    static definition(id: string) { return specialOrders.find(o => o.customerId === id); }
    static current(s: SaveData, id: string) { const order = s.activeNight?.specialOrders?.[id]; return order?.status === 'pending' ? order : undefined; }
    static detail(s: SaveData, id: string) {
        const order = this.current(s, id);
        return order ? this.definition(id)?.recipes.find(r => r.id === order.recipeId && r.extra === order.extra) : undefined;
    }
    static reserve(s: SaveData, id: string, random = Math.random) {
        const night = s.activeNight, p = s.customers[id], def = this.definition(id);
        if (!night || !p || !def) return undefined;
        const decisions = night.specialOrders ??= {};
        if (Object.hasOwn(decisions, id)) return this.current(s, id);
        decisions[id] = null; // Persist ineligible visits and failed rolls, too.
        const h = s.specialOrderHistory?.[id];
        if (!night.queue.slice(night.report.served).includes(id) || !p.unlocked || p.intimacy < 10 || p.visitCount < 3 || p.characterStory?.pending || (h && s.night - h.lastNight < 2) || Object.values(decisions).some(o => o)) return undefined;
        const recipe = def.recipes.find(r => s.unlockedRecipes.includes(r.id));
        if (!recipe || (h && random() >= .4)) return undefined;
        return decisions[id] = { recipeId: recipe.id, extra: recipe.extra, status: 'pending' };
    }
    static resolve(s: SaveData, id: string, meal: { recipeId: string; score: number } | undefined, extra: string) {
        const order = this.current(s, id), night = s.activeNight;
        if (!order || !night || night.queue[night.report.served] !== id) return undefined;
        const success = !!meal && Number.isFinite(meal.score) && meal.score >= this.minScore && meal.score <= 100 && meal.recipeId === order.recipeId && extra === order.extra;
        order.status = success ? 'success' : 'missed';
        const history = s.specialOrderHistory ??= {}, previous = history[id];
        history[id] = { completed: (previous?.completed ?? 0) + Number(success), lastNight: s.night };
        if (success) { s.gold += this.bonusGold; night.report.gold += this.bonusGold; night.report.discoveries.push('단골 특별 주문 · ' + recipeById(order.recipeId).name + ' 성공'); }
        const referral = success ? RumorManager.success(s,id) : undefined;
        return { success, referral, gold: success ? this.bonusGold : 0, intimacy: success ? this.bonusIntimacy : 0, reaction: success ? specialOrderReactions[id] : '조금 달라도 괜찮아요. 따뜻한 한 끼 잘 먹었어요.' };
    }
    static restoreHistory(value: unknown): Record<string, SpecialOrderHistory> {
        const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {}, result: Record<string, SpecialOrderHistory> = {};
        for (const d of specialOrders) {
            const v = raw[d.customerId] as SpecialOrderHistory | undefined;
            if (v && Number.isSafeInteger(v.completed) && v.completed >= 0 && Number.isSafeInteger(v.lastNight) && v.lastNight >= 1) result[d.customerId] = { completed: v.completed, lastNight: v.lastNight };
        }
        return result;
    }
    static restoreNight(s: SaveData, value: unknown): Record<string, SpecialOrder | null> {
        const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {}, result: Record<string, SpecialOrder | null> = {};
        for (const d of specialOrders) {
            if (!Object.hasOwn(raw, d.customerId)) continue;
            const v = raw[d.customerId] as SpecialOrder | null;
            result[d.customerId] = v && d.recipes.some(r => r.id === v.recipeId && r.extra === v.extra) && s.unlockedRecipes.includes(v.recipeId) && ['pending','success','missed'].includes(v.status) ? { recipeId: v.recipeId, extra: v.extra, status: v.status } : null;
        }
        return result;
    }
}
