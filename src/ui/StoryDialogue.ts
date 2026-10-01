import type { CharacterStoryEvent, StoryLine, StoryPart } from '../types/CharacterStory';
import { $, panel, on } from './UI';

/** One small reader inside the existing panel, not a cutscene scene. */
export class StoryDialogue {
    private delay?: number;
    private waiting = false;
    private closed = false;
    constructor(private event: CharacterStoryEvent, private part: StoryPart, private index: () => number, private advance: () => boolean, private guestName: string, private expression: (line: StoryLine) => void, private done: () => void) {
        $('panel').classList.add('story-dialogue');
        $('nav').classList.add('locked');
        this.render();
    }
    private render() {
        const index = this.index(), line = this.event[this.part][index];
        if (!line) { this.close(); return; }
        this.expression(line);
        this.waiting = !!line.pause;
        panel(`<div id="character-story" data-event="${this.event.id}" data-part="${this.part}" data-line="${index}"><div class="eyebrow">${this.guestName}의 이야기 · ${this.part === 'before' ? '주문 전' : '한 끼를 먹고'}</div><h2>${this.event.title}</h2><div class="story-speaker">${line.speaker === 'guest' ? this.guestName : '주인공'}</div><p id="story-text" class="quote" aria-live="polite">${this.waiting ? '…' : line.text}</p><button id="character-story-next" class="primary">${this.waiting ? '잠깐의 정적 · 탭하면 바로 듣기' : this.buttonLabel()}</button></div>`);
        if (this.waiting) this.delay = window.setTimeout(() => this.reveal(line), line.pause);
        on('character-story-next', () => {
            if (this.closed) return;
            if (this.waiting) { this.reveal(line); return; }
            if (this.advance()) this.close();
            else this.render();
        });
    }
    private buttonLabel() { return this.index() === this.event[this.part].length - 1 ? this.part === 'before' ? '주문 받아 주기 →' : '마음에 담아 두기 →' : '계속 듣기 →'; }
    private reveal(line: StoryLine) {
        window.clearTimeout(this.delay);
        if (this.closed) return;
        this.waiting = false;
        $('story-text').textContent = line.text;
        $('character-story-next').textContent = this.buttonLabel();
    }
    private close() {
        if (this.closed) return;
        this.closed = true;
        window.clearTimeout(this.delay);
        $('panel').classList.remove('story-dialogue');
        $('nav').classList.remove('locked');
        this.done();
    }
}
