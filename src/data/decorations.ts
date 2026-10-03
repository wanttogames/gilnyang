export type DecorSlot = 'lamp' | 'awning' | 'seat' | 'sign';
export interface DecorOption { id: string; slot: DecorSlot; name: string; cost: number; colors: number[]; description: string }
export const decorSlots: { id: DecorSlot; name: string }[] = [{ id: 'lamp', name: '조명' }, { id: 'awning', name: '차양' }, { id: 'seat', name: '좌석' }, { id: 'sign', name: '간판' }];
export const decorations: DecorOption[] = [
    { id: 'lamp-basic', slot: 'lamp', name: '골목의 등불', cost: 0, colors: [0xeabb7e, 0x8c5145], description: '식당의 첫 밤을 밝혀 준 등불' },
    { id: 'lamp-moon', slot: 'lamp', name: '달빛 청사초롱', cost: 65, colors: [0xa8c8d0, 0x536c83], description: '푸른 테두리와 작은 달 장식' },
    { id: 'lamp-peach', slot: 'lamp', name: '복숭아빛 등불', cost: 65, colors: [0xefbaa8, 0xa76565], description: '꽃무늬가 비치는 분홍빛 등불' },
    { id: 'awning-basic', slot: 'awning', name: '노을 줄무늬', cost: 0, colors: [0xc78267, 0xe4b389], description: '따뜻한 노을색 차양' },
    { id: 'awning-forest', slot: 'awning', name: '숲빛 줄무늬', cost: 75, colors: [0x748e75, 0xdde0b9], description: '숲을 닮은 초록과 크림 줄무늬' },
    { id: 'awning-night', slot: 'awning', name: '별밤 차양', cost: 90, colors: [0x596a87, 0xa2b0c4], description: '푸른 차양 위에 작은 별이 반짝여요' },
    { id: 'seat-basic', slot: 'seat', name: '익숙한 나무 의자', cost: 0, colors: [0xae7a54, 0x543c37], description: '친구들이 쉬어 가던 나무 의자' },
    { id: 'seat-sage', slot: 'seat', name: '쑥빛 방석', cost: 55, colors: [0x9da982, 0xd9dfbc], description: '쑥빛 방석에 작은 바느질 자국' },
    { id: 'seat-flower', slot: 'seat', name: '꽃무늬 방석', cost: 70, colors: [0xc78e88, 0xf6d9b6], description: '분홍 방석에 수놓은 작은 꽃' },
    { id: 'sign-basic', slot: 'sign', name: '처음의 나무 간판', cost: 0, colors: [0xe7cda5, 0x503b38], description: '길냥이 식당의 익숙한 이름' },
    { id: 'sign-paw', slot: 'sign', name: '발자국 간판', cost: 85, colors: [0xf0dbb0, 0x8b6650], description: '양옆에 고양이 발자국을 새겼어요' },
    { id: 'sign-moon', slot: 'sign', name: '달빛 간판', cost: 100, colors: [0x4e6078, 0xdec996], description: '짙은 밤색 나무에 금빛 식당 이름' }
];
export const decorById = (id: string) => decorations.find(d => d.id === id);
export const cssColor = (n: number) => '#' + n.toString(16).padStart(6, '0');
