import type { SaveData } from '../types/SaveData';
import { customerById } from '../data/customers';
export const rumorGuests = [{ id: 'ambient_soli', threshold: 1 }, { id: 'ambient_lulu', threshold: 3 }];
export interface Referral { id: string; sourceId: string; night: number }
export interface RumorState { successes: number; unlocked: string[]; pending: Referral[] }
export class RumorManager {
    static state(s: SaveData) { return s.alleyRumor ??= this.restore(undefined); }
    static restore(value: unknown): RumorState {
        const raw = value && typeof value === 'object' ? value as Partial<RumorState> : {};
        const successes = Number.isSafeInteger(raw.successes) && raw.successes! >= 0 ? raw.successes! : 0;
        const valid = (id: unknown): id is string => rumorGuests.some(g => g.id === id);
        const unlocked = [...new Set(Array.isArray(raw.unlocked) ? raw.unlocked.filter(valid) : [])];
        const pending: Referral[] = [];
        if(Array.isArray(raw.pending))for(const v of raw.pending)if(v && valid(v.id) && !unlocked.includes(v.id) && !pending.some(p=>p.id===v.id) && customerById(v.sourceId)?.role !== 'ambient' && !!customerById(v.sourceId) && Number.isSafeInteger(v.night) && v.night>=1)pending.push({id:v.id,sourceId:v.sourceId,night:v.night});
        return { successes, unlocked, pending };
    }
    static migrate(s: SaveData, value: unknown) {
        const state=this.restore(value);
        if(value!==undefined)return state;
        const history=Object.entries(s.specialOrderHistory ?? {}).filter(([id])=>!!customerById(id));
        state.successes=history.reduce((n,[,h])=>n+h.completed,0);
        const source=history.sort((a,b)=>b[1].completed-a[1].completed)[0]?.[0];
        if(source)for(const g of rumorGuests)if(state.successes>=g.threshold)state.pending.push({id:g.id,sourceId:source,night:s.night});
        return state;
    }
    static success(s: SaveData, sourceId: string) {
        const state = this.state(s); state.successes++;
        const g = rumorGuests.find(g=>state.successes>=g.threshold && !state.unlocked.includes(g.id) && !state.pending.some(p=>p.id===g.id));
        if(!g)return undefined;
        state.pending.push({id:g.id,sourceId,night:s.night});
        s.activeNight?.report.discoveries.push('골목 소문 · ' + customerById(g.id).name + '에게 식당을 소개했어요. 다음 밤 방문 예정!');
        return customerById(g.id).name;
    }
    static arrange(s: SaveData, queue: string[]) {
        const state=this.state(s), referral=state.pending.find(p=>p.night<s.night), result: Record<string,string> = {};
        if(!referral)return result;
        // Replace a walk-in only; principal stories and their queue positions stay intact.
        const index=queue.map(id=>customerById(id)?.role==='ambient').lastIndexOf(true);
        if(index<0)queue.push(referral.id);else queue[index]=referral.id;
        state.unlocked.push(referral.id); state.pending=state.pending.filter(p=>p.id!==referral.id);
        result[referral.id]=referral.sourceId; return result;
    }
    static greeting(s: SaveData,id: string) { const source=s.activeNight?.referrals?.[id];return source ? customerById(source)?.name + '에게 이 식당 이야기를 듣고 왔어요. 잘 부탁해요!' : undefined; }
    static restoreReferrals(value: unknown): Record<string,string> {
        const raw=value && typeof value==='object' ? value as Record<string,unknown> : {}, result:Record<string,string>={};
        for(const g of rumorGuests){const source=raw[g.id];if(typeof source==='string' && customerById(source) && customerById(source).role!=='ambient')result[g.id]=source;}
        return result;
    }
}
