import { alleyEvents, alleyEventById } from '../data/alleyEvents';
import type { AlleyEvent, AlleyNightState, AlleyEventChoice } from '../types/AlleyEvent';
import type { SaveData } from '../types/SaveData';
import { CustomerManager } from './CustomerManager';
export class AlleyEventManager {
    static state(s: SaveData) { return s.activeNight!.alley ??= { checks:[], seenIds:[] }; }
    static eligible(s: SaveData, e: AlleyEvent): boolean {
        if (e.once && s.completedAlleyEvents?.includes(e.id)) return false;
        if (e.requiredCustomers?.some(id => !s.customers[id]?.unlocked || s.customers[id]?.characterStory?.pending)) return false;
        const range=e.storyRange, stage=range ? s.customers[range.customerId]?.characterStory?.stage ?? 0 : 0;
        return !range || stage>=range.min && (range.max===undefined || stage<=range.max);
    }
    static weight(s: SaveData,e: AlleyEvent) {
        let weight=e.weight;
        if (e.preferredWeather===s.weather) weight*=2;
        if (s.activeNight?.condition==='shower' && ['rain_kitten','kkamang_alley_watch','swaying_sign'].includes(e.id)) weight*=1.8;
        if (s.activeNight?.condition==='cold' && e.id==='rain_kitten') weight*=.3;
        return weight;
    }
    static pending(s: SaveData) { return s.activeNight?.alley?.pending ? alleyEventById(s.activeNight.alley.pending.eventId) : undefined; }
    /** Only the scene's empty gap calls this; these additional checks protect saved stories. */
    static tryReserve(s: SaveData,random=Math.random): AlleyEvent | undefined {
        const n=s.activeNight;
        if (!n || n.report.served===0 || Object.values(s.customers).some(p=>p.characterStory?.pending)) return undefined;
        const next=n.queue[n.report.served];
        if (next && CustomerManager.solo(s,next)) return undefined;
        if (this.pending(s)) return this.pending(s);
        const state=this.state(s), served=n.report.served;
        if (state.checks.length>=2 || state.seenIds.length>=2 || state.checks.includes(served) || served<(state.checks.length ? Math.ceil(n.queue.length/2) : 1)) return undefined;
        state.checks.push(served);
        const chance=state.seenIds.length ? .18 : .55;
        if (random()>=chance) return undefined;
        const pool=alleyEvents.filter(e=>this.eligible(s,e) && !state.seenIds.includes(e.id) && !s.recentAlleyEventIds?.includes(e.id));
        if (!pool.length) return undefined;
        let pick=random()*pool.reduce((sum,e)=>sum+this.weight(s,e),0);
        const event=pool.find(e=>(pick-=this.weight(s,e))<0) ?? pool[pool.length-1];
        state.seenIds.push(event.id); state.pending={eventId:event.id};
        s.recentAlleyEventIds=[...(s.recentAlleyEventIds ?? []),event.id].slice(-5);
        return event;
    }
    static result(s: SaveData,choiceId: string): AlleyEventChoice | undefined {
        const event=this.pending(s), pending=s.activeNight?.alley?.pending;
        if (!event || !pending) return undefined;
        const choice=event.choices?.find(c=>c.id===(pending.choiceId ?? choiceId)) ?? (!event.choices && (pending.choiceId ?? choiceId)==='observe' ? {id:'observe',label:'잠깐 바라보기',resultText:event.resultText!} : undefined);
        if (!choice) return undefined;
        if (!pending.choiceId) {
            pending.choiceId=choice.id;
            if (choice.gold) { s.gold+=choice.gold; s.activeNight!.report.gold+=choice.gold; }
        }
        return choice;
    }
    static complete(s: SaveData) {
        const event=this.pending(s);
        if (!event || !s.activeNight!.alley!.pending!.choiceId) return false;
        if (event.once && !s.completedAlleyEvents?.includes(event.id)) s.completedAlleyEvents=[...(s.completedAlleyEvents ?? []),event.id];
        delete s.activeNight!.alley!.pending; return true;
    }
    static restore(raw: unknown,queueLength: number): AlleyNightState {
        const value=raw && typeof raw==='object' ? raw as Record<string,unknown> : {};
        const validIds=(v: unknown) => Array.isArray(v) ? [...new Set(v.filter((id: unknown)=>typeof id==='string' && !!alleyEventById(id)))] as string[] : [];
        const state: AlleyNightState={checks:Array.isArray(value.checks) ? [...new Set<number>(value.checks.filter((n: unknown)=>typeof n==='number' && Number.isInteger(n) && n>=1 && n<=queueLength))].slice(0,2) : [],seenIds:validIds(value.seenIds).slice(0,2)};
        const pending=value.pending as {eventId?:unknown;choiceId?:unknown} | undefined;
        const event=typeof pending?.eventId==='string' ? alleyEventById(pending.eventId) : undefined;
        if (event && state.seenIds.includes(event.id)) {
            const choice=typeof pending?.choiceId==='string' && (event.choices?.some(c=>c.id===pending.choiceId) || !event.choices && pending.choiceId==='observe') ? pending.choiceId : undefined;
            state.pending={eventId:event.id,...(choice ? {choiceId:choice} : {})};
        }
        return state;
    }
}
