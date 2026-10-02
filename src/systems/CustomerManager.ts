import { customers, customerById } from '../data/customers';
import { ambientCustomers } from '../data/ambientCustomers';
import { nightConditions, type NightConditionId } from '../data/nightConditions';
import { CharacterStoryManager } from './CharacterStoryManager';
import type { SaveData } from '../types/SaveData';
export class CustomerManager {
    static storyReady(s: SaveData, id: string): boolean {
        const p = s.customers[id];
        if (!p) return false;
        if (CharacterStoryManager.events(id).length) return !!CharacterStoryManager.reserve(id, structuredClone(p), s.night, s);
        const gate = [[5,10],[10,25],[15,50]][p.storyStage];
        return !!gate && p.visitCount + 1 >= gate[0] && p.intimacy >= gate[1];
    }
    static solo(s: SaveData, id: string): boolean {
        if (this.storyReady(s,id)) return true;
        const p=s.customers[id];
        if (!p || CharacterStoryManager.events(id).length) return false;
        const gate=[[5,10],[10,25],[15,50]][p.storyStage];
        // Legacy dialogue unlocks after a meal; protect even a quality bonus crossing its gate.
        const possibleGain=3+(s.upgrades.chair ? 1 : 0)+(p.preferenceFound ? 2 : 0);
        return !!gate && p.visitCount+1>=gate[0] && p.intimacy+possibleGain>=gate[1];
    }
    static queue(s: SaveData, random = Math.random, condition: NightConditionId = 'ordinary'): string[] {
        const available = customers.filter(c => c.unlockNight <= s.night);
        const due = available.filter(c => this.storyReady(s, c.id));
        // One guaranteed story per night. Rotate contenders fairly even with old high-affinity saves.
        due.sort((a,b) => (s.customers[a.id].characterStory?.lastEventNight ?? 0) - (s.customers[b.id].characterStory?.lastEventNight ?? 0) || s.customers[a.id].visitCount - s.customers[b.id].visitCount);
        const result: string[] = [];
        const priority = due[0]?.id;
        const recent = s.recentCustomers?.slice(-3) ?? [];
        const previousIndex = priority ? recent.lastIndexOf(priority) : -1;
        const priorityDelay = previousIndex < 0 ? 0 : previousIndex + 4 - recent.length;
        const history = [...recent];
        const total = 5 + nightConditions[condition].extraGuests;
        while (result.length < total) {
            if (priority && result.length === priorityDelay) { result.push(priority); history.push(priority); continue; }
            const eligible = available.filter(c => !due.some(d => d.id === c.id) && !result.includes(c.id));
            // Guarantee a regular from the principal cast, independently of random ambient choices.
            const principal = eligible.filter(c => ['nabi','dubu','kkamang','mongsil','kong','donggu'].includes(c.id));
            const main = (result.length === total - 1 && !result.some(id => ['nabi','dubu','kkamang','mongsil','kong','donggu'].includes(id)) || random() < .35) && eligible.length;
            let pool = main ? (principal.length ? principal : eligible) : ambientCustomers;
            const fresh = pool.filter(c => !history.slice(-3).includes(c.id));
            if (fresh.length) pool = fresh;
            const weighted = pool.map(c => ({id:c.id, weight: c.id === 'kkamang' && s.weather === 'rain' ? 4 : c.role === 'ambient' ? ambientCustomers.find(a => a.id === c.id)!.spawnWeight : 1}));
            let pick = random() * weighted.reduce((sum,c) => sum + c.weight,0);
            const selected = weighted.find(c => (pick -= c.weight) < 0) ?? weighted[weighted.length - 1];
            result.push(selected.id); history.push(selected.id);
        }
        return result;
    }
    static pairs(s: SaveData, queue: string[], random = Math.random): number[] {
        const pairs: number[] = [];
        for (let i=0;i+1<queue.length;i++) {
            if (this.solo(s,queue[i]) || this.solo(s,queue[i+1])) continue;
            if (random() < .2) { pairs.push(i); i++; }
        }
        return pairs;
    }
    static current(s: SaveData) { return customerById(s.activeNight!.queue[s.activeNight!.report.served]); }
}
