import { characterPortrait } from '../game/CharacterArt';
import { CharacterStoryManager } from '../systems/CharacterStoryManager';
import type { CustomerProgress } from '../types/Customer';
import { RecipeManager } from '../systems/RecipeManager';
import type { SaveData } from '../types/SaveData';
import { customers } from '../data/customers';
import { ingredients } from '../data/ingredients';
import { dialogues } from '../data/dialogues';
import { DialogueManager } from '../systems/DialogueManager';
import { modal, on, closeModal } from '../ui/UI';
export class CustomerBookScene {
    private static storyCards(id: string, p: CustomerProgress) {
        const events = CharacterStoryManager.events(id);
        if (!events.length) return dialogues[id].stories.map((lines, i) => `<div class="story-card"><span class="eyebrow">이야기 ${i + 1} · ${i < p.storyStage ? '발견한 기억' : '잠긴 기억'}</span><p>${i < p.storyStage ? lines.join('<br>') : '조금 더 친해지면 들려줄 거예요.'}</p></div>`).join('');
        const stage = p.characterStory?.stage ?? 0;
        return events.map((event, i) => `<div class="story-card"><span class="eyebrow">이야기 ${i + 1} · ${i < stage ? event.title : '아직 비밀인 이야기'}</span><p>${i < stage ? event.summary : '여러 밤에 걸쳐 천천히 들려줄 거예요.'}</p></div>`).join('');
    }
    static open(s: SaveData) {
        const discovered = customers.filter(c => s.customers[c.id].unlocked).length;
        modal(`<div class="sheet-head"><div><span class="eyebrow">FRIENDS OF THE ALLEY · ${discovered} / ${customers.length}</span><h2>골목 친구 도감</h2></div><button id="close" class="close" aria-label="닫기">×</button></div><p class="muted">몇 번의 인사, 한 끼의 온기. 천천히 가까워져요.</p><div class="customer-grid">${customers.map(c => { const p = s.customers[c.id]; return `<button class="customer-card ${!p.unlocked ? 'unknown' : ''}" id="card-${c.id}">${characterPortrait(c.id) ? `<img class="portrait pixel-portrait" src="${characterPortrait(c.id)}" alt="${p.unlocked ? c.species : '아직 만나지 못한 친구의 실루엣'}">` : `<span class="portrait" style="--fur:#${c.color.toString(16).padStart(6, '0')};--patch:#${c.accent.toString(16).padStart(6, '0')}"><i></i><b></b></span>`}<h3>${p.unlocked ? c.name : '???'}</h3>${p.unlocked && CharacterStoryManager.complete(c.id, p) ? '<span class="story-complete-badge">첫 이야기를 함께한 친구</span>' : ''}<small>${p.unlocked ? c.species : '아직 만나지 못한 친구'}</small><div class="friend-rank">${p.unlocked ? DialogueManager.rank(p.intimacy) : '어느 밤에 찾아올까요?'}</div><div class="friend-meter"><i style="width:${p.unlocked ? Math.min(100, p.intimacy * 2) : 0}%"></i></div><span class="friend-meta">${p.unlocked ? '방문 ' + p.visitCount + '회 · 친밀도 ' + p.intimacy : '실루엣만 보이네요'}</span></button>`; }).join('')}</div><div class="hint">나비와 두부는 여러 밤의 방문과 친밀도로 이야기를 나눠요.<br>다른 친구 · 5회 & 친밀도 10 / 10회 & 25 / 15회 & 50</div>`);
        on('close', closeModal);
        for (const c of customers)
            on('card-' + c.id, () => {
                const p = s.customers[c.id];
                if (!p.unlocked)
                    return;
                modal(`<div class="sheet-head"><div><span class="eyebrow">${c.species} · ${DialogueManager.rank(p.intimacy)}</span><h2>${c.name}</h2></div><button id="back" class="close" aria-label="도감으로 돌아가기">←</button></div><p class="muted">${c.personality}</p><div class="profile-stats"><span>방문 <b>${p.visitCount}회</b></span><span>친밀도 <b>${p.intimacy}</b></span><span>이야기 <b>${CharacterStoryManager.events(c.id).length ? p.characterStory?.stage ?? 0 : p.storyStage}/${CharacterStoryManager.events(c.id).length || 3}</b></span></div><div class="story-card"><small>좋아하는 음식</small><h3>${RecipeManager.order(c, s).name}</h3><small>숨겨진 취향</small><h3>${p.preferenceFound ? ingredients[c.favoriteIngredients[0]].name + (c.favoriteIngredients[0] === 'warm' ? '' : ' 넉넉하게') : '아직 비밀이에요'}</h3></div>${CharacterStoryManager.complete(c.id, p) ? `<div class="story-complete-badge" id="story-complete">${CharacterStoryManager.events(c.id).at(-1)?.title} · 첫 이야기 완료</div>` : ''}${this.storyCards(c.id, p)}`);
                on('back', () => this.open(s));
            });
    }
}
