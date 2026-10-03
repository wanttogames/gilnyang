import { customers } from '../data/customers';
import { dialogues } from '../data/dialogues';
import { dongguLetters } from '../data/dongguLetters';
import { CharacterStoryManager } from '../systems/CharacterStoryManager';
import { characterPortrait } from '../game/CharacterArt';
import type { SaveData } from '../types/SaveData';
import { modal, on, closeModal } from './UI';
interface Memory { id: string; name: string; title: string; summary: string; lines: { speaker: string; text: string }[] }
export class MemoryAlbum {
    static memories(s: SaveData): Memory[] {
        return customers.flatMap(c => {
            const p = s.customers[c.id]; if (!p?.unlocked) return [];
            const events = CharacterStoryManager.events(c.id);
            const stories: Memory[] = events.length ? events.slice(0, p.characterStory?.stage ?? 0).map(e => ({ id: c.id, name: c.name, title: e.title, summary: e.summary, lines: [...e.before, ...e.after].map(l => ({ speaker: l.speaker === 'guest' ? c.name : '주인공', text: l.text })) })) : (dialogues[c.id]?.stories ?? []).slice(0, p.storyStage).map((lines, i) => ({ id: c.id, name: c.name, title: '작은 이야기 ' + (i + 1), summary: lines[0], lines: lines.map(text => ({ speaker: c.name, text })) }));
            if (c.id === 'donggu') stories.push(...dongguLetters.slice(0, s.dongguLetters?.stage ?? 0).map(e => ({ id: c.id, name: c.name, title: e.title, summary: e.summary, lines: e.after.map(l => ({ speaker: l.speaker === 'guest' ? c.name : '주인공', text: l.text })) })));
            return stories;
        });
    }
    static open(s: SaveData) {
        const memories = this.memories(s);
        modal(`<div class="sheet-head"><div><div class="eyebrow">MEMORIES OF THE ALLEY · ${memories.length}</div><h2>추억 앨범</h2></div><button id="album-close" class="close" aria-label="닫기">×</button></div><p class="muted">함께한 밤과 마음에 담아 둔 이야기. 언제든 다시 펼쳐 보세요.</p><div class="memory-grid">${memories.map((m, i) => `<button class="memory-card" id="memory-${i}">${characterPortrait(m.id) ? `<img src="${characterPortrait(m.id)}" alt="${m.name}">` : ''}<small>${m.name}의 기억</small><h3>${m.title}</h3><p>${m.summary}</p><span>다시 읽기 →</span></button>`).join('')}</div>${!memories.length ? '<div class="album-empty">아직 빈 앨범이에요.<br>친구들의 이야기를 끝까지 들으면 첫 추억이 남아요.</div>' : ''}<div class="letter-hint"><h3>동구에게 온 편지</h3><p>${(s.dongguLetters?.stage ?? 0) >= 2 ? '누나의 편지와 동구의 답장을 모두 보관했어요.' : (s.dongguLetters?.stage ?? 0) === 1 ? '다음 편지 · 방문 6회, 친밀도 10 · 첫 편지 뒤 3회 방문' : '첫 편지 · 동구 방문 3회, 친밀도 4'}</p></div>`);
        on('album-close', closeModal);
        memories.forEach((m, i) => on('memory-' + i, () => {
            modal(`<div class="sheet-head"><div><div class="eyebrow">${m.name}의 기억 · 다시 읽기</div><h2>${m.title}</h2></div><button id="album-back" class="close" aria-label="앨범으로 돌아가기">←</button></div><div class="memory-reader">${m.lines.map(l => `<div><small>${l.speaker}</small><p>${l.text}</p></div>`).join('')}</div><button id="album-done" class="primary">앨범으로 돌아가기</button>`);
            on('album-back', () => this.open(s)); on('album-done', () => this.open(s));
        }));
    }
}
