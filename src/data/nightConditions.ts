import type { Weather } from '../types/Weather';
export type NightConditionId = 'ordinary' | 'shower' | 'cold';
export interface NightCondition {
    id: NightConditionId;
    title: string;
    description: string;
    extraGuests: number;
    recipeWeights: Record<string, number>;
}
export const nightConditions: Record<NightConditionId, NightCondition> = {
    ordinary: { id: 'ordinary', title: '평범한 밤', description: '작은 불빛 아래, 저마다의 발걸음이 찾아와요.', extraGuests: 0, recipeWeights: {} },
    shower: { id: 'shower', title: '소나기', description: '오늘은 비를 피하려는 손님이 조금 많을 것 같아요.', extraGuests: 1, recipeWeights: { oden: 3, ramen: 3 } },
    cold: { id: 'cold', title: '유난히 추운 밤', description: '쌀쌀한 바람에 따뜻한 국물이 생각나는 밤이에요.', extraGuests: 0, recipeWeights: { oden: 4, ramen: 4 } },
};
export function rollNightCondition(weather: Weather, random = Math.random): NightConditionId {
    if (weather === 'rain') return random() < .7 ? 'shower' : 'ordinary';
    if (weather === 'snow') return 'cold';
    return random() < .25 ? 'cold' : 'ordinary';
}
export const validNightCondition = (value: unknown): value is NightConditionId => typeof value === 'string' && Object.hasOwn(nightConditions, value);
