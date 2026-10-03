import type { CharacterStoryEvent } from '../types/CharacterStory';
export const dongguLetters: CharacterStoryEvent[] = [
    { id: 'DONGGU_LETTER_1', title: '멀리서 온 누나의 편지', minVisits: 3, minIntimacy: 4, visitsSincePrevious: 0, before: [], after: [
        { speaker: 'guest', text: '사장님, 누나 보고 싶다… 오늘은 더 많이요.', emotion: 'quiet', pause: 350 },
        { speaker: 'chef', text: '멀리 일하러 간 누나 말이지? 너에게 온 편지가 있어.' },
        { speaker: 'chef', text: '“동구야, 누나는 먼 도시에서 일하고 있어. 자주 만나지 못해도 네 생각은 매일 해.”' },
        { speaker: 'chef', text: '“밥 잘 먹고, 따뜻한 곳에서 쉬어. 너를 만나는 날에는 오래 산책하자. 사랑해, 우리 동구.”' },
        { speaker: 'guest', text: '누나도 제 생각을 하고 있었네요.', emotion: 'shy' },
        { speaker: 'guest', text: '오늘은 잘 먹었다고 전해 주세요. 저, 여기서 잘 기다리고 있다고요.', emotion: 'smile' }
    ], summary: '멀리 일하러 간 인간 주인 누나에게 편지가 왔어요. 자주 만나지 못해도 서로를 매일 생각하고 있어요.' },
    { id: 'DONGGU_LETTER_2', title: '답장에 담은 한 끼', minVisits: 6, minIntimacy: 10, visitsSincePrevious: 3, before: [], after: [
        { speaker: 'guest', text: '누나 보고 싶다. 그래도 오늘은 웃으면서 말할 수 있어요.', emotion: 'smile' },
        { speaker: 'chef', text: '그럼 오늘은 우리가 답장을 써 볼까?' },
        { speaker: 'guest', text: '“누나, 나 밥 잘 먹고 있어. 이 식당에 오면 기다리는 밤도 따뜻해.”', emotion: 'smile' },
        { speaker: 'guest', text: '“일하느라 힘들지? 누나도 끼니 거르지 마. 우리 만나면 골목을 같이 걷자.”', emotion: 'quiet' },
        { speaker: 'chef', text: '꼭 전해 줄게. 여기서 먹은 따뜻한 한 끼도 함께 적어 두자.' },
        { speaker: 'guest', text: '고마워요. 누나가 오면 이 식당부터 소개할래요!', emotion: 'smile' }
    ], summary: '동구와 함께 누나에게 답장을 썼어요. 그리운 마음과 식당에서 잘 지내고 있다는 소식을 담았어요.' }
];
