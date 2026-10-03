export interface SpecialOrderDefinition { customerId: string; recipes: { id: string; extra: string; quote: string }[] }
export const specialOrders: SpecialOrderDefinition[] = [
    { customerId: 'nabi', recipes: [{ id: 'rice', extra: 'seaweed', quote: '오늘은 김을 넉넉히 감싸 주세요. 바삭한 소리를 오래 듣고 싶어요.' }] },
    { customerId: 'dubu', recipes: [{ id: 'oden', extra: 'broth', quote: '보물을 찾느라 많이 걸었어요! 오늘은 국물 넉넉한 어묵으로 힘을 채울래요.' }] },
    { customerId: 'kkamang', recipes: [{ id: 'ramen', extra: 'egg', quote: '오늘은 계란 두 개… 라면 위에 올려 줘. 길었던 밤이거든.' }, { id: 'oden', extra: 'broth', quote: '오늘은 어묵 국물을 조금 더. 오래 따뜻했으면 좋겠어.' }] },
    { customerId: 'mongsil', recipes: [{ id: 'bread', extra: 'redbean', quote: '오늘은 팥이 가득한 붕어빵! 골목 친구들에게 자랑하고 싶은 맛으로 부탁해요!' }, { id: 'milk', extra: 'warm', quote: '오늘은 따뜻한 우유로 부탁해요. 수다 떨다가 목이 조금 쉬었거든요!' }] },
    { customerId: 'kong', recipes: [{ id: 'rice', extra: 'tuna', quote: '오늘은 참치를 넉넉히 넣어 주세요! 별을 세러 가기 전에 배부르게 먹을래요.' }] },
    { customerId: 'donggu', recipes: [{ id: 'ramen', extra: 'broth', quote: '누나 보고 싶다… 오늘은 누나가 해주던 라면처럼, 따뜻한 국물을 넉넉히 주세요.' }, { id: 'milk', extra: 'warm', quote: '누나 보고 싶다… 누나가 챙겨 주던 따뜻한 우유처럼 만들어 주세요.' }] },
    { customerId: 'bori', recipes: [{ id: 'oden', extra: 'broth', quote: '오늘은 편지가 많았어요. 국물 넉넉한 어묵 한 그릇이면 다시 힘이 날 것 같아요.' }] },
    { customerId: 'dal', recipes: [{ id: 'milk', extra: 'warm', quote: '시를 한 줄 더 쓰고 싶어요. 오늘은 온기를 더한 우유 한 잔 부탁해요.' }] },
    { customerId: 'hodu', recipes: [{ id: 'bread', extra: 'redbean', quote: '제 빵집에도 이런 맛을 내고 싶어요. 오늘은 팥을 가득 넣은 붕어빵을 부탁해요!' }, { id: 'rice', extra: 'tuna', quote: '빵집 준비를 하느라 끼니를 놓쳤어요. 오늘은 참치 넉넉한 주먹밥 부탁해요.' }] }
];
export const specialOrderReactions: Record<string, string> = {
    nabi: '바삭한 소리까지 기억해 주셨네요. 오늘 밤은 조금 덜 외로워요.',
    dubu: '힘이 다시 났어요! 다음에는 더 멋진 보물을 찾아올게요!',
    kkamang: '…내가 부탁한 대로네. 오늘은 조금 더 앉아 있다 갈게.',
    mongsil: '바로 이 맛이에요! 내일 골목에 자랑할 이야기가 생겼네요!',
    kong: '배가 든든해졌어요! 오늘은 별을 백 개까지 셀 수 있겠어요!',
    donggu: '누나가 챙겨 주던 한 끼처럼 따뜻해요. 누나도 밥 잘 먹었으면 좋겠어요.',
    bori: '제 부탁을 기억해 주셔서 고마워요. 남은 편지도 힘내서 배달할게요.',
    dal: '이 온기를 오늘의 시에 적어 둘게요.',
    hodu: '이 맛과 다정함, 제 빵집에서도 꼭 기억하고 싶어요.'
};
