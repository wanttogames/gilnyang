import type { RiceballStep, OdenCookingConfig } from '../types/Cooking';

export const riceballSteps: RiceballStep[] = [
    { id: 'quantity', type: 'quantity', title: '밥을 알맞게 담아요', instruction: '가운데에 가까울수록 좋아요. 천천히 멈춰 주세요.', button: '이만큼 담기', duration: 8000, perfectRange: .08 },
    { id: 'shape', type: 'shape', title: '왼쪽, 오른쪽. 꼭꼭!', instruction: '왼쪽부터 번갈아 4번. 천천히 눌러도 괜찮아요.', beats: 4, cooldown: 800 },
    { id: 'wrap', type: 'wrap', title: '김을 가운데에 감아요', instruction: '김이 주먹밥 가운데에 왔을 때 감아 주세요.', button: '지금 김 감기', duration: 8000, perfectRange: .09 }
];

export const odenCooking: OdenCookingConfig = {
    pieces: [
        { id: 'square', name: '사각 어묵', shape: 'square', duration: 6000 },
        { id: 'triangle', name: '삼각 어묵', shape: 'triangle', duration: 7500 },
        { id: 'round', name: '둥근 어묵', shape: 'round', duration: 9000 }
    ],
    goodStart: .4,
    perfectCenter: .68,
    perfectRange: .12,
    lateGoodEnd: .92
};
