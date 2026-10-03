import { decorations, decorSlots, decorById, type DecorSlot } from '../data/decorations';
import type { SaveData } from '../types/SaveData';
export interface RestaurantDecor { owned: string[]; equipped: Record<DecorSlot, string> }
export class DecorationManager {
    static restore(value: unknown): RestaurantDecor {
        const raw = value && typeof value === 'object' ? value as Partial<RestaurantDecor> : {};
        const owned = [...new Set(Array.isArray(raw.owned) ? raw.owned.filter(id => typeof id === 'string' && !!decorById(id)) : [])];
        const equipped = Object.fromEntries(decorSlots.map(slot => {
            const id = raw.equipped?.[slot.id], d = id ? decorById(id) : undefined;
            return [slot.id, d && d.slot === slot.id && (d.cost === 0 || owned.includes(d.id)) ? d.id : slot.id + '-basic'];
        })) as Record<DecorSlot, string>;
        return { owned, equipped };
    }
    static state(s: SaveData) { return s.restaurantDecor ??= this.restore(undefined); }
    static owns(s: SaveData, id: string) { const d = decorById(id); return !!d && (d.cost === 0 || this.state(s).owned.includes(id)); }
    static style(s: SaveData, slot: DecorSlot) { return decorById(this.state(s).equipped[slot])!; }
    static equip(s: SaveData, id: string) {
        const d = decorById(id); if (!d || !this.owns(s, id)) return false;
        this.state(s).equipped[d.slot] = id; return true;
    }
    static buy(s: SaveData, id: string) {
        const d = decorById(id); if (!d || this.owns(s,id) || !Number.isFinite(s.gold) || s.gold < d.cost) return false;
        s.gold -= d.cost; this.state(s).owned.push(id); this.equip(s, id); return true;
    }
    static count(s: SaveData) { return decorations.filter(d => d.cost > 0 && this.owns(s,d.id)).length; }
}
