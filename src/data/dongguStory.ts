import type { CharacterStoryEvent, StoryLine } from '../types/CharacterStory';

const guest = (text: string, emotion: StoryLine['emotion'] = 'normal', pause = 0): StoryLine => ({ speaker: 'guest', text, emotion, pause });
const chef = (text: string): StoryLine => ({ speaker: 'chef', text });

/** Donggu is a principal story character: his scent memories bridge Nabi's waiting and the old diner mystery. */
export const dongguStory: CharacterStoryEvent[] = [
    {
        id: 'DONGGU_STORY_1', title: '하얀 꼬리의 손님', minVisits: 1, minIntimacy: 0, visitsSincePrevious: 0,
        before: [
            { ...guest('...여기였구나.', 'quiet'), gaze: 'street' },
            chef('처음 오는 거 아니야?'),
            guest('저는 동구예요. 처음 보는 사장님은 맞아요.', 'smile'),
            guest('그런데 이 골목 냄새는 알아요.', 'quiet'),
            guest('따뜻한 우유 한 잔 주세요.')
        ],
        after: [],
        summary: '새하얀 스피츠 동구가 골목 냄새를 알아보며 찾아왔어요. 사장님은 처음 보지만 이곳은 처음이 아닌 듯해요.'
    },
    {
        id: 'DONGGU_STORY_2', title: '낡은 골목을 기억하는 코', minVisits: 3, minIntimacy: 4, visitsSincePrevious: 2,
        before: [
            { ...guest('간판은 달라졌는데 길은 그대로네요.', 'quiet'), gaze: 'street' },
            chef('예전에 자주 왔어?'),
            guest('네. 아주 오래전에요.'),
            guest('저 모퉁이를 돌면 밥 냄새가 먼저 났어요.', 'smile'),
            chef('누가 밥을 줬는데?'),
            guest('...다음에 말해 드릴게요.', 'shy', 350)
        ],
        after: [],
        summary: '동구는 간판이 바뀌기 전 골목을 기억해요. 모퉁이 너머에서 늘 밥 냄새가 났다고 했어요.'
    },
    {
        id: 'DONGGU_STORY_3', title: '조금 식혀 주세요', minVisits: 5, minIntimacy: 8, visitsSincePrevious: 2,
        before: [
            guest('오늘도 우유 주세요.'),
            guest('너무 뜨겁지 않게, 조금만 식혀서요.', 'smile'),
            chef('따뜻한 건 좋아하면서?'),
            guest('네. 따뜻한 냄새가 오래 남는 게 좋아요.', 'smile')
        ],
        after: [], revealsPreference: true,
        summary: '동구는 따뜻하지만 너무 뜨겁지 않은 우유를 좋아해요. 향을 오래 기억하고 싶어서래요.'
    },
    {
        id: 'DONGGU_STORY_4', title: '같은 손길', minVisits: 7, minIntimacy: 12, visitsSincePrevious: 2,
        before: [],
        after: [
            guest('이 온도...', 'quiet', 300),
            guest('그 할머니도 늘 이렇게 식혀 줬어요.', 'quiet'),
            chef('할머니?'),
            guest('골목 동물들 밥을 챙겨주던 분이요.'),
            guest('고양이들부터 먹이고, 저는 늘 마지막이었어요.', 'smile'),
            chef('그래도 기다렸네.'),
            guest('기다리면 꼭 제 몫도 있었거든요.', 'smile')
        ],
        summary: '동구도 골목 동물들을 챙기던 할머니를 기억하고 있어요. 늘 마지막까지 기다리면 동구 몫도 남겨 주었다고 해요.'
    },
    {
        id: 'DONGGU_STORY_5', title: '삼색 고양이', minVisits: 10, minIntimacy: 18, visitsSincePrevious: 3,
        before: [
            { ...guest('여기 오는 삼색 고양이 있죠?', 'quiet'), gaze: 'street' },
            chef('나비 말하는 거야?'),
            guest('나비... 지금은 그런 이름이군요.', 'quiet'),
            chef('예전에도 알았어?'),
            guest('할머니 밥그릇 옆에 늘 먼저 와 있던 아이예요.'),
            guest('저보다 훨씬 작았는데, 기다리는 건 제일 잘했어요.', 'quiet')
        ],
        after: [],
        summary: '동구가 기억하는 작은 삼색 고양이는 나비였어요. 두 친구는 같은 할머니의 밥을 기다리던 사이였던 것 같아요.'
    },
    {
        id: 'DONGGU_STORY_COMPLETE', title: '같은 사람을 기다렸어요', minVisits: 13, minIntimacy: 24, visitsSincePrevious: 3,
        before: [],
        after: [
            guest('사장님.'),
            guest('나비가 아직도 그 할머니를 기다린다면...', 'quiet'),
            chef('응.'),
            guest('저도 같은 사람을 기다린 거예요.', 'quiet', 350),
            guest('마지막으로 본 날, 할머니는 이 골목을 몇 번이나 돌아봤어요.'),
            guest('그리고 식당 쪽을 보면서 말했어요.'),
            guest('“다시 불이 켜지면 꼭 들르렴.”', 'quiet', 450),
            chef('이 식당을 알고 있었던 거야?'),
            guest('네. 그래서 불이 켜진 걸 보고 다시 온 거예요.', 'smile')
        ],
        summary: '동구와 나비가 기다리던 사람은 같았어요. 할머니는 마지막 날 “다시 불이 켜지면 꼭 들르라”고 말했고, 동구는 그 약속 때문에 돌아왔어요.'
    }
];
