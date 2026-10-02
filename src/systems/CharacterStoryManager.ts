import { characterStories } from '../data/characterStories';
import { dongguStory } from '../data/dongguStory';
import type { CharacterStoryProgress } from '../types/CharacterStory';
import type { Weather } from '../types/Weather';
import type { CustomerProgress } from '../types/Customer';

const emptyProgress = (): CharacterStoryProgress => ({ stage: 0, lastEventVisit: 0, lastEventNight: 0 });
export class CharacterStoryManager {
    static events(id: string) { return id === 'donggu' ? dongguStory : characterStories[id] ?? []; }
    static progress(p: CustomerProgress) { return p.characterStory ??= emptyProgress(); }
    static complete(id: string, p: CustomerProgress) { const count = this.events(id).length; return count > 0 && (p.characterStory?.stage ?? 0) >= count; }
    static pendingEvent(id: string, p: CustomerProgress) { return this.events(id).find(e => e.id === p.characterStory?.pending?.eventId); }
    static reserve(id: string, p: CustomerProgress, night: number, context?: { weather: Weather; unlockedRecipes: string[] }) {
        if (!this.events(id).length) return undefined;
        const progress = this.progress(p);
        if (progress.pending) return this.pendingEvent(id, p);
        const event = this.events(id)[progress.stage], visit = p.visitCount + 1;
        // Completed visits and elapsed nights both matter, even for old high-intimacy saves.
        if (!event || progress.lastEventVisit >= visit || (progress.stage > 0 && night <= progress.lastEventNight) || visit < event.minVisits || p.intimacy < event.minIntimacy || (progress.stage > 0 && visit - progress.lastEventVisit < event.visitsSincePrevious)) return undefined;
        if (event.requiredRecipe && !context?.unlockedRecipes.includes(event.requiredRecipe)) return undefined;
        const eligibleVisit = Math.max(event.minVisits, progress.lastEventVisit + event.visitsSincePrevious);
        if (event.preferRain && context?.weather !== 'rain' && visit < eligibleVisit + event.preferRain.fallbackVisits) return undefined;
        progress.pending = { eventId: event.id, visit, night, part: event.before.length ? 'before' : 'after', line: 0 };
        return event;
    }
    static advance(id: string, p: CustomerProgress): boolean {
        const progress = this.progress(p), pending = progress.pending, event = this.pendingEvent(id, p);
        if (!pending || !event) return false;
        pending.line++;
        if (pending.line < event[pending.part].length) return false;
        if (pending.part === 'before' && event.after.length) { pending.part = 'after'; pending.line = 0; return true; }
        progress.stage++;
        progress.lastEventVisit = pending.visit;
        progress.lastEventNight = pending.night;
        if (event.revealsPreference) p.preferenceFound = true;
        delete progress.pending;
        return true;
    }
    /** Old storyStage belongs to the original three-line system; never map it to this arc. */
    static restore(id: string, value: unknown, visits: number): CharacterStoryProgress | undefined {
        const events = this.events(id);
        if (!events.length) return undefined;
        const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {};
        const integer = (v: unknown) => typeof v === 'number' && Number.isInteger(v) && v >= 0;
        const progress: CharacterStoryProgress = { stage: integer(raw.stage) ? Math.min(events.length, raw.stage as number) : 0, lastEventVisit: integer(raw.lastEventVisit) ? Math.min(visits + 1, raw.lastEventVisit as number) : 0, lastEventNight: integer(raw.lastEventNight) ? raw.lastEventNight as number : 0 };
        const pending = raw.pending as Record<string, unknown> | undefined;
        const event = events[progress.stage];
        if (pending && event && pending.eventId === event.id && (pending.part === 'before' || pending.part === 'after') && integer(pending.line) && (pending.line as number) < event[pending.part].length && integer(pending.visit) && ((pending.visit as number) === visits || (pending.visit as number) === visits + 1) && integer(pending.night) && (pending.night as number) > 0) {
            progress.pending = { eventId: event.id, visit: pending.visit as number, night: pending.night as number, part: pending.part, line: pending.line as number };
        }
        return progress;
    }
}
