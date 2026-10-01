import type { Recipe } from '../types/Recipe';
export const recipes: Recipe[] = [
    { id: 'rice', name: '참치 주먹밥', subtitle: '작은 손으로 꼭꼭, 마음을 담아', ingredients: ['rice', 'tuna', 'seaweed'], action: 'hold', duration: 2000, extraIngredientIds: ['seaweed', 'tuna'], actionTitle: '꼭꼭, 주먹밥을 쥐어요', actionButton: '꾹 눌러 만들기' },
    { id: 'oden', name: '따끈한 어묵', subtitle: '김이 모락모락, 골목의 온기', ingredients: ['oden', 'broth'], action: 'timing', duration: 3200, extraIngredientIds: ['broth'], actionTitle: '알맞게 익으면 건져요', actionButton: '지금 건져내기' },
    { id: 'milk', name: '따뜻한 우유', subtitle: '하루 끝을 부드럽게 감싸는 한 잔', ingredients: ['milk'], action: 'pour', duration: 1800, extraIngredientIds: ['warm'], actionTitle: '컵에 우유를 따라요', actionButton: '꾹 눌러 따르기' },
    { id: 'ramen', name: '계란 라면', subtitle: '비 오는 밤, 국물에 담은 작은 위로', ingredients: ['noodle', 'broth', 'egg'], action: 'timing', duration: 3000, extraIngredientIds: ['broth', 'egg'], actionTitle: '보글보글, 면이 익으면 불을 꺼요', actionButton: '지금 불 끄기', unlock: { customerId: 'kkamang', visits: 3, intimacy: 5, reason: '까망의 단골 선물' } },
    { id: 'bread', name: '붕어빵', subtitle: '노릇한 꼬리 끝까지 달콤한 밤', ingredients: ['batter', 'redbean'], action: 'flip', duration: 1800, extraIngredientIds: ['redbean', 'warm'], actionTitle: '노릇하게 구워 한 번 뒤집어요', actionButton: '지금 뒤집기', unlock: { customerId: 'mongsil', visits: 3, intimacy: 5, reason: '몽실의 달콤한 제안' } }
];
export const recipeById = (id: string) => recipes.find(r => r.id === id)!;
