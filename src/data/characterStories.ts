import type { CharacterStoryEvent, StoryLine } from '../types/CharacterStory';
const nabi = (text: string, emotion: StoryLine['emotion'] = 'normal', pause = 0): StoryLine => ({ speaker: 'guest', text, emotion, pause });
const chef = (text: string): StoryLine => ({ speaker: 'chef', text });

/** Only Nabi has a drama arc. Other customers retain their existing stories. */
export const characterStories: Record<string, CharacterStoryEvent[]> = {
    nabi: [
        { id: 'NABI_STORY_1', title: '처음 만난 손님', minVisits: 1, minIntimacy: 0, visitsSincePrevious: 0,
            before: [nabi('...여기 앉아도 돼요?', 'shy'), chef('물론이지. 편한 자리에 앉아.'), nabi('참치 주먹밥 하나 주세요.', 'shy')], after: [],
            summary: '조심스레 자리를 묻던 첫 인사. 나비는 참치 주먹밥을 주문했어요.' },
        { id: 'NABI_STORY_2', title: '김을 많이', minVisits: 3, minIntimacy: 3, visitsSincePrevious: 2,
            before: [nabi('저...', 'shy'), nabi('오늘은 김을 조금 많이 넣어줄 수 있어요?', 'shy'), chef('김? 물론이지.'), nabi('...네. 그냥 그게 좋아서요.', 'shy')], after: [], revealsPreference: true,
            summary: '나비는 김이 넉넉한 주먹밥을 좋아해요. 작은 부탁을 기억해 두기로 했어요.' },
        { id: 'NABI_STORY_3', title: '익숙한 냄새', minVisits: 5, minIntimacy: 8, visitsSincePrevious: 2,
            before: [nabi('이상하네요.', 'quiet'), chef('뭐가?'), nabi('여기 오면 가끔...', 'quiet', 350), nabi('예전에 맡았던 냄새가 나는 것 같아요.', 'quiet'), chef('예전에?'), nabi('...아무것도 아니에요.', 'shy', 300)], after: [],
            summary: '식당에서 익숙한 냄새가 난다는 나비. 무슨 냄새인지는 아직 말하지 않았어요.' },
        { id: 'NABI_STORY_4', title: '그 사람이 만들어주던 것', minVisits: 7, minIntimacy: 12, visitsSincePrevious: 2,
            before: [], after: [nabi('맛있어요.'), nabi('...그 사람도 이렇게 만들어줬어요.', 'quiet', 450), chef('그 사람?'), nabi('예전에 이 근처에 살던 사람이요.', 'quiet'), nabi('항상 김을 많이 넣어줬어요.', 'quiet'), chef('그래서 김을 많이 좋아하는 거구나.'), nabi('...그런가 봐요.', 'shy')],
            summary: '예전에 이 근처에 살던 사람이 김을 많이 넣어 주었다고 해요. 주먹밥에는 작은 기억이 담겨 있었어요.' },
        { id: 'NABI_STORY_5', title: '기다림', minVisits: 10, minIntimacy: 18, visitsSincePrevious: 3,
            before: [], after: [nabi('예전에는 매일 이 근처에 왔어요.', 'quiet'), nabi('골목에 살던 할머니가 저녁마다 밥을 줬거든요.', 'quiet'), nabi('비 오는 날엔 박스를 깔아주고, 겨울엔 따뜻한 물도 놓아줬어요.', 'quiet'), nabi('남은 밥으로 작은 주먹밥도 만들어줬고요.', 'quiet'), nabi('근데 어느 날부터 안 보였어요.', 'quiet', 450), chef('어디로 갔는지는 몰라?'), nabi('...몰라요.', 'quiet'), nabi('그래도 가끔 그 골목에 가봐요.', 'quiet', 500), nabi('혹시 다시 있을까 봐.', 'quiet')],
            summary: '밥과 따뜻한 물을 챙겨 주던 골목의 할머니. 어느 날부터 보이지 않아 나비는 가끔 그 골목을 돌아봐요.' },
        { id: 'NABI_STORY_COMPLETE', title: '오늘도 김 많이', minVisits: 13, minIntimacy: 24, visitsSincePrevious: 3,
            before: [nabi('참치 주먹밥 하나 주세요.'), chef('김 많이?'), nabi('...네.', 'shy', 400), nabi('이제 말 안 해도 아네요.'), chef('단골이니까.'), nabi('...헤헤.', 'smile')],
            after: [nabi('예전에는 여기 오는 이유가...', 'quiet'), nabi('그 사람을 기다리기 위해서였어요.', 'quiet'), nabi('요즘은...', 'shy', 450), nabi('여기 오고 싶어서 오는 날도 있어요.', 'smile')],
            summary: '기다리기 위해 오던 밤에서, 오고 싶어서 오는 밤으로. 오늘도 김 많이. 나비의 첫 이야기를 함께했어요.' }
    ]
};
export const nabiAfterStoryOrders = ['오늘도 김 많이요.', '밖에 조금 추워졌어요. 따뜻한 주먹밥 부탁해요.', '참치 주먹밥 하나요. 오늘은 여기 좀 오래 있어도 돼요?'];
export const nabiPreferenceOrders = ['오늘도 참치 주먹밥이요. 김은 조금 넉넉하게요.', '그 바삭한 김이 좋아요. 주먹밥 하나 부탁해요.'];
