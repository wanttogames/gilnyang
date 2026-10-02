import type { Weather } from './Weather';
export type AlleyEventType = 'AMBIENT' | 'CHARACTER' | 'DISCOVERY' | 'TROUBLE';
export type AlleyVisual = 'tin' | 'kitten' | 'dig' | 'watch' | 'wait' | 'sign' | 'menu' | 'blackout' | 'cats' | 'parcel';
export interface AlleyEventChoice {
    id: string;
    label: string;
    resultText: string;
    gold?: number;
}
export interface AlleyEvent {
    id: string;
    type: AlleyEventType;
    title: string;
    description: string;
    visual: AlleyVisual;
    characterId?: string;
    requiredCustomers?: string[];
    storyRange?: { customerId: string; min: number; max?: number };
    preferredWeather?: Weather;
    once?: boolean;
    weight: number;
    choices?: AlleyEventChoice[];
    resultText?: string;
}
/** Small save ledger, never character progress or an inventory. */
export interface AlleyNightState {
    checks: number[];
    seenIds: string[];
    pending?: { eventId: string; choiceId?: string };
}
