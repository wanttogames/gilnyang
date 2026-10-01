import { customers, customerById } from '../data/customers';
import type { SaveData } from '../types/SaveData';
export class CustomerManager {
    static queue(s: SaveData, random = Math.random): string[] {
        const available = customers.filter(c => c.unlockNight <= s.night);
        if (s.night === 1)
            return available.slice(0, 5).map(c => c.id);
        const newcomer = available.find(c => !s.customers[c.id].unlocked);
        const result: string[] = newcomer ? [newcomer.id] : [];
        while (result.length < 5) {
            const pool = available.filter(c => result.filter(id => id === c.id).length < 2 && c.id !== result[result.length - 1]);
            const weighted = pool.map(c => ({ id: c.id, weight: c.id === 'kkamang' && s.weather === 'rain' ? 4 : 1 }));
            let pick = random() * weighted.reduce((sum, c) => sum + c.weight, 0);
            const selected = weighted.find(c => (pick -= c.weight) < 0) || weighted[weighted.length - 1];
            result.push(selected.id);
        }
        return result;
    }
    static current(s: SaveData) { return customerById(s.activeNight!.queue[s.activeNight!.report.served]); }
}
