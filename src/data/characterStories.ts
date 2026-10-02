import type { CharacterStoryEvent, StoryLine } from '../types/CharacterStory';
const guest = (text: string, emotion: StoryLine['emotion'] = 'normal', pause = 0): StoryLine => ({ speaker: 'guest', text, emotion, pause });
const chef = (text: string): StoryLine => ({ speaker: 'chef', text });

/** Per-character arcs share the same visit gates and saved dialogue cursor. */
export const characterStories: Record<string, CharacterStoryEvent[]> = {
    nabi: [
        { id: 'NABI_STORY_1', title: '처음 만난 손님', minVisits: 1, minIntimacy: 0, visitsSincePrevious: 0,
            before: [guest('...여기 앉아도 돼요?', 'shy'), chef('물론이지. 편한 자리에 앉아.'), guest('참치 주먹밥 하나 주세요.', 'shy')], after: [],
            summary: '조심스레 자리를 묻던 첫 인사. 나비는 참치 주먹밥을 주문했어요.' },
        { id: 'NABI_STORY_2', title: '김을 많이', minVisits: 3, minIntimacy: 3, visitsSincePrevious: 2,
            before: [guest('저...', 'shy'), guest('오늘은 김을 조금 많이 넣어줄 수 있어요?', 'shy'), chef('김? 물론이지.'), guest('...네. 그냥 그게 좋아서요.', 'shy')], after: [], revealsPreference: true,
            summary: '나비는 김이 넉넉한 주먹밥을 좋아해요. 작은 부탁을 기억해 두기로 했어요.' },
        { id: 'NABI_STORY_3', title: '익숙한 냄새', minVisits: 5, minIntimacy: 8, visitsSincePrevious: 2,
            before: [guest('이상하네요.', 'quiet'), chef('뭐가?'), guest('여기 오면 가끔...', 'quiet', 350), guest('예전에 맡았던 냄새가 나는 것 같아요.', 'quiet'), chef('예전에?'), guest('...아무것도 아니에요.', 'shy', 300)], after: [],
            summary: '식당에서 익숙한 냄새가 난다는 나비. 무슨 냄새인지는 아직 말하지 않았어요.' },
        { id: 'NABI_STORY_4', title: '그 사람이 만들어주던 것', minVisits: 7, minIntimacy: 12, visitsSincePrevious: 2,
            before: [], after: [guest('맛있어요.'), guest('...그 사람도 이렇게 만들어줬어요.', 'quiet', 450), chef('그 사람?'), guest('예전에 이 근처에 살던 사람이요.', 'quiet'), guest('항상 김을 많이 넣어줬어요.', 'quiet'), chef('그래서 김을 많이 좋아하는 거구나.'), guest('...그런가 봐요.', 'shy')],
            summary: '예전에 이 근처에 살던 사람이 김을 많이 넣어 주었다고 해요. 주먹밥에는 작은 기억이 담겨 있었어요.' },
        { id: 'NABI_STORY_5', title: '기다림', minVisits: 10, minIntimacy: 18, visitsSincePrevious: 3,
            before: [], after: [guest('예전에는 매일 이 근처에 왔어요.', 'quiet'), guest('골목에 살던 할머니가 저녁마다 밥을 줬거든요.', 'quiet'), guest('비 오는 날엔 박스를 깔아주고, 겨울엔 따뜻한 물도 놓아줬어요.', 'quiet'), guest('남은 밥으로 작은 주먹밥도 만들어줬고요.', 'quiet'), guest('근데 어느 날부터 안 보였어요.', 'quiet', 450), chef('어디로 갔는지는 몰라?'), guest('...몰라요.', 'quiet'), guest('그래도 가끔 그 골목에 가봐요.', 'quiet', 500), guest('혹시 다시 있을까 봐.', 'quiet')],
            summary: '밥과 따뜻한 물을 챙겨 주던 골목의 할머니. 어느 날부터 보이지 않아 나비는 가끔 그 골목을 돌아봐요.' },
        { id: 'NABI_STORY_COMPLETE', title: '오늘도 김 많이', minVisits: 13, minIntimacy: 24, visitsSincePrevious: 3,
            before: [guest('참치 주먹밥 하나 주세요.'), chef('김 많이?'), guest('...네.', 'shy', 400), guest('이제 말 안 해도 아네요.'), chef('단골이니까.'), guest('...헤헤.', 'smile')],
            after: [guest('예전에는 여기 오는 이유가...', 'quiet'), guest('그 사람을 기다리기 위해서였어요.', 'quiet'), guest('요즘은...', 'shy', 450), guest('여기 오고 싶어서 오는 날도 있어요.', 'smile')],
            summary: '기다리기 위해 오던 밤에서, 오고 싶어서 오는 밤으로. 오늘도 김 많이. 나비의 첫 이야기를 함께했어요.' }
    ],
    dubu: [
        { id: 'DUBU_STORY_1', title: '맛있는 냄새!', minVisits: 1, minIntimacy: 0, visitsSincePrevious: 0,
          before: [guest('안녕하세요!', 'smile'), guest('여기 맛있는 냄새 나요!', 'smile'), chef('어서 와.'), guest('어묵 주세요!')], after: [],
          summary: '자리 앞에서 급하게 멈춘 두부. 맛있는 냄새를 따라 찾아온 활발한 첫 손님이에요.' },
        { id: 'DUBU_STORY_2', title: '또 뭘 주워왔어?', minVisits: 3, minIntimacy: 3, visitsSincePrevious: 2, arrival: { item: 'button' },
          before: [chef('그건 또 뭐야?'), guest('주웠어요!', 'smile'), chef('...왜?'), guest('예쁘잖아요!', 'smile')], after: [],
          summary: '낡은 단추를 자랑스럽게 내려놓았어요. 두부에게는 작고 예쁜 보물인가 봐요.' },
        { id: 'DUBU_STORY_3', title: '수집가 두부', minVisits: 5, minIntimacy: 8, visitsSincePrevious: 2, arrival: { item: 'cap' },
          before: [chef('오늘도 주워왔네.'), guest('네!', 'smile'), chef('이런 걸 왜 계속 모으는 거야?'), guest('...좋은 거잖아요.'), chef('두부 기준으로?'), guest('네!', 'smile'), guest('어묵도 국물 많이 주세요!', 'smile')], after: [], revealsPreference: true,
          summary: '오늘의 보물은 병뚜껑. 두부 기준으로는 좋은 물건이래요. 어묵 국물도 넉넉한 걸 좋아해요.' },
        { id: 'DUBU_STORY_4', title: '좋은 걸 가져가고 싶어서', minVisits: 7, minIntimacy: 12, visitsSincePrevious: 2, arrival: { item: 'button' },
          before: [], after: [chef('두부는 왜 맨날 이런 걸 찾는 거야?'), guest('집에 가져가려고요.'), chef('집에?'), guest('주인이 이런 거 좋아해요.'), chef('정말?'), guest('...아마도요.', 'quiet', 350)],
          summary: '주인에게 가져가려고 좋은 걸 찾는 두부. 좋아할 거라는 말 끝에 잠깐 망설였어요.' },
        { id: 'DUBU_STORY_5', title: '요즘 늦게 와요', minVisits: 10, minIntimacy: 18, visitsSincePrevious: 3, arrival: { quiet: true },
          before: [], after: [chef('오늘은 아무것도 안 주워왔네?'), guest('...네.', 'quiet'), chef('무슨 일 있어?'), guest('주인이 요즘 늦게 와요.', 'quiet'), chef('많이 늦어?'), guest('제가 잘 때 와요.', 'quiet'), guest('그래서 좋은 걸 찾아놔도...', 'quiet', 450), guest('보여줄 시간이 없어요.', 'quiet')],
          summary: '빈손으로 온 조용한 밤. 주인이 늦게 돌아와 보물을 보여줄 시간이 없다고 해요.' },
        { id: 'DUBU_STORY_COMPLETE', title: '이번엔 여기 둘래요', minVisits: 13, minIntimacy: 24, visitsSincePrevious: 3, arrival: { item: 'stone' },
          before: [chef('오늘도 가져왔네.'), guest('네!', 'smile'), guest('...근데 이건 집에 안 가져갈래요.'), chef('왜?'), guest('여기 둘래요.'), chef('왜 여기?'), guest('여기도 제가 좋아하는 곳이니까요!', 'smile')], after: [],
          summary: '작은 돌을 식당에 놓고 간 두부. 이 식당도 두부가 좋아하는 곳이 되었어요.' }
    ]
};
export const nabiAfterStoryOrders = ['오늘도 김 많이요.', '밖에 조금 추워졌어요. 따뜻한 주먹밥 부탁해요.', '참치 주먹밥 하나요. 오늘은 여기 좀 오래 있어도 돼요?'];
export const nabiPreferenceOrders = ['오늘도 참치 주먹밥이요. 김은 조금 넉넉하게요.', '그 바삭한 김이 좋아요. 주먹밥 하나 부탁해요.'];

export const dubuAfterStoryOrders = ['오늘은 뭐 없나 찾아보고 왔어요!', '저번에 둔 돌 아직 있어요?', '어묵 국물 많이요!'];
