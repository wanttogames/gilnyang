import type { Recipe } from '../types/Recipe';
export const recipes: Recipe[] = [
    { id: 'rice', name: '참치 주먹밥', subtitle: '작은 손으로 꼭꼭, 마음을 담아', ingredients: ['rice', 'tuna', 'seaweed'], action: 'hold', duration: 2000 },
    { id: 'oden', name: '따끈한 어묵', subtitle: '김이 모락모락, 골목의 온기', ingredients: ['oden', 'broth'], action: 'timing', duration: 3200 },
    { id: 'milk', name: '따뜻한 우유', subtitle: '하루 끝을 부드럽게 감싸는 한 잔', ingredients: ['milk'], action: 'pour', duration: 1800 }
];
export const recipeById = (id: string) => recipes.find(r => r.id === id)!;
