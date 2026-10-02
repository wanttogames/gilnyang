import { ambientCustomers } from './ambientCustomers';
import type { Customer } from '../types/Customer';
export const customers: Customer[] = [
    { id: 'nabi', name: '나비', species: '삼색 고양이', personality: '조용하고 수줍은 골목 산책가', favoriteFoodIds: ['rice'], favoriteIngredients: ['seaweed'], color: 0xf7edda, accent: 0xda9152, unlockNight: 1 },
    { id: 'dubu', name: '두부', species: '시바견', personality: '작은 보물을 주워 오는 낙천가', favoriteFoodIds: ['oden'], favoriteIngredients: ['broth'], color: 0xc68b5d, accent: 0xf4dfbc, dog: true, unlockNight: 1 },
    { id: 'kkamang', name: '까망', species: '검은 고양이', personality: '말수는 적어도 마음은 따뜻해요', favoriteFoodIds: ['ramen', 'oden'], favoriteIngredients: ['broth'], color: 0x363d4d, accent: 0x606b7a, unlockNight: 1 },
    { id: 'mongsil', name: '몽실', species: '포메라니안', personality: '골목 소식을 모두 아는 수다쟁이', favoriteFoodIds: ['bread', 'milk'], favoriteIngredients: ['warm'], color: 0xe8bd83, accent: 0xf7e6c6, dog: true, unlockNight: 1 },
    { id: 'kong', name: '콩이', species: '고등어태비 고양이', personality: '별을 세는 호기심 많은 꼬마', favoriteFoodIds: ['rice'], favoriteIngredients: ['tuna'], color: 0xa49b89, accent: 0x55524e, unlockNight: 1 },
    { id: 'donggu', role: 'main', name: '동구', species: '새하얀 스피츠', personality: '오래된 골목 냄새를 기억하는 다정한 길잡이', favoriteFoodIds: ['milk', 'bread'], favoriteIngredients: ['warm'], color: 0xfff9ef, accent: 0xf0dfcf, dog: true, unlockNight: 3 },
    { id: 'bori', name: '보리', species: '웰시코기', personality: '편지를 배달하는 성실한 친구', favoriteFoodIds: ['oden'], favoriteIngredients: ['broth'], color: 0xb87748, accent: 0xefce9d, dog: true, unlockNight: 4 },
    { id: 'dal', name: '달이', species: '회색 고양이', personality: '달빛 아래 시를 쓰는 여행자', favoriteFoodIds: ['milk'], favoriteIngredients: ['warm'], color: 0x999daf, accent: 0xe2dfd7, unlockNight: 7 },
    { id: 'hodu', name: '호두', species: '갈색 푸들', personality: '언젠가 빵집을 열고 싶은 꿈쟁이', favoriteFoodIds: ['rice'], favoriteIngredients: ['tuna'], color: 0x98705d, accent: 0xcfad87, dog: true, unlockNight: 10 }
];
export const allCustomers = [...customers, ...ambientCustomers];
export const customerById = (id: string) => allCustomers.find(c => c.id === id)!;
