import type { RiceballStep } from '../types/Cooking';

export const riceballSteps: RiceballStep[] = [
    { id: 'quantity', type: 'quantity', title: '밥을 알맞게 담아요', instruction: '가운데에 가까울수록 좋아요. 천천히 멈춰 주세요.', button: '이만큼 담기', duration: 8000, perfectRange: .08 },
    { id: 'shape', type: 'shape', title: '왼쪽, 오른쪽. 꼭꼭!', instruction: '왼쪽부터 번갈아 4번. 천천히 눌러도 괜찮아요.', beats: 4, cooldown: 800 },
    { id: 'wrap', type: 'wrap', title: '김을 가운데에 감아요', instruction: '김이 주먹밥 가운데에 왔을 때 감아 주세요.', button: '지금 김 감기', duration: 8000, perfectRange: .09 }
];
