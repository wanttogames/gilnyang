import { customers, customerById } from '../data/customers';
import type { SaveData } from '../types/SaveData';
export class CustomerManager {
    static queue(s: SaveData): string[] { const available = customers.filter(c => c.unlockNight <= s.night); if (s.night === 1)
        return available.slice(0, 5).map(c => c.id); const newcomer = available.find(c => !s.customers[c.id].unlocked); const result = Array.from({ length: 5 }, (_, i) => available[(s.night - 2 + i) % available.length].id); if (newcomer)
        result[0] = newcomer.id; return result; }
    static current(s: SaveData) { return customerById(s.activeNight!.queue[s.activeNight!.report.served]); }
}
