import type { Quality, Recipe } from '../types/Recipe';
import type { CookingStepScore } from '../types/Cooking';
import { BreadManager, type BreadOrder, type BreadResult } from '../systems/BreadManager';
import { CookingManager } from '../systems/CookingManager';
import { audio } from '../systems/AudioManager';
import { $, on, panel, food } from '../ui/UI';

const steps = [
    { id: 'batter', name: '반죽 양', title: '붕어 틀에 반죽을 부어요', prompt: '꾹 누르고, 주황 칸까지 차면 손을 놓아요.', button: '꾹 눌러 반죽 붓기', duration: 2400 },
    { id: 'filling', name: '팥 채우기', title: '팥을 배 가운데에 올려요', prompt: '숟가락이 가운데 주황 칸에 왔을 때 톡!', button: '지금 팥 올리기', duration: 3200 },
    { id: 'bake-front', name: '앞면 굽기', title: '앞면을 노릇하게 구워요', prompt: '주황 칸에서 뒤집어요. 한 번만 익어요.', button: '지금 뒤집기', duration: 4000 },
    { id: 'bake-back', name: '뒷면 굽기', title: '뒷면까지 구워 꺼내요', prompt: '주황 칸에서 꺼내면 양면이 알맞아요.', button: '지금 꺼내기', duration: 4000 }
];

export class BreadCooking {
    private index = 0;
    private scoop = 0;
    private scores: CookingStepScore[] = [];
    private frame = 0;
    private started = 0;
    private held = false;
    private resolved = false;
    private finished = false;
    private resultShown = false;
    private order: BreadOrder;

    constructor(private recipe: Recipe, private pot: boolean, private extra: string, private finish: (quality: Quality, extra: string, result?: BreadResult) => void, customer?: { id: string; name: string }) {
        this.order = BreadManager.order(customer, extra);
        $('interface').classList.add('minigame-cooking');
        $('panel').classList.add('minigame-panel', 'bread-panel');
        this.render();
    }
    private get center() { return this.index === 0 ? .7 : this.index === 1 ? .5 : this.order.center; }
    private get range() { return .1 + (this.pot ? .015 : 0); }
    private get progress() {
        const elapsed = Math.max(0, performance.now() - this.started);
        if (this.index !== 1) return Math.min(1, elapsed / steps[this.index].duration);
        const phase = (elapsed % steps[this.index].duration) / steps[this.index].duration;
        return phase < .5 ? phase * 2 : (1 - phase) * 2;
    }
    private art() {
        return `<div class="bread-stage ${this.resultShown ? 'bread-served' : this.index > 1 ? 'bread-closed' : ''}"><div class="bread-griddle"><div class="bread-fish ${this.index > 2 ? 'bread-turned' : ''}"><span class="bread-tail"></span><span class="bread-body"><i class="bread-eye"></i><i class="bread-gill"></i><i class="bread-scales"></i><i class="bread-filling ${this.scoop || this.resultShown ? 'set' : ''} ${this.order.scoops === 2 ? 'generous' : ''}"></i></span></div></div>${this.index === 1 && !this.resultShown ? '<span id="bread-spoon" aria-hidden="true">🥄</span>' : '<span class="bread-steam" aria-hidden="true">♨</span>'}</div>`;
    }
    private render() {
        cancelAnimationFrame(this.frame);
        this.resolved = false; this.held = false;
        const step = steps[this.index];
        panel(`<div class="eyebrow">${this.recipe.name} · ${Math.min(3, this.index + 1)} / 3 ${step.name}${this.index > 1 ? ` (${this.index - 1} / 2)` : ''}</div><h2>${step.title}</h2><p class="bread-order">${this.order.name} · ${this.order.texture} · ${this.order.scoops === 2 ? '팥 넉넉하게' : '달콤한 팥 한 숟갈'}</p><p class="muted">${step.prompt}</p>${this.art()}<div class="rice-meter bread-meter"><div class="rice-perfect" style="left:${(this.center - this.range) * 100}%;width:${this.range * 200}%"></div><i id="bread-needle"></i></div><div class="bread-labels"><span>${this.index === 0 ? '적게' : this.index === 1 ? '꼬리' : '덜 익음'}</span><b>주황 칸 = PERFECT</b><span>${this.index === 0 ? '많이' : this.index === 1 ? '머리' : '더 익음'}</span></div><p id="bread-feedback" class="mini-feedback" aria-live="polite">${this.index === 0 ? '마우스·터치 또는 스페이스·엔터를 꾹 눌러요.' : this.index === 1 ? `${this.scoop + 1} / ${this.order.scoops} 숟갈 · 배 가운데에 올려 주세요.` : '앞뒷면 모두 정성껏 구워요. 놓쳐도 괜찮아요.'}</p><div id="bread-controls"><button id="bread-action" class="primary">${step.button}</button></div>`);
        this.started = performance.now();
        if (this.index === 0) this.bindPour();
        else { on('bread-action', () => this.stop()); this.tick(); }
    }
    private bindPour() {
        const button = $('bread-action');
        const start = () => {
            if (this.resolved || this.finished || this.held) return;
            this.held = true; this.started = performance.now(); this.tick(); audio.note(220, .12);
        };
        const end = () => { if (this.held) this.stop(); };
        button.addEventListener('pointerdown', e => { if (e.button !== 0) return; e.preventDefault(); button.setPointerCapture(e.pointerId); start(); });
        for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(event, end);
        button.addEventListener('keydown', e => { if (!['Space', 'Enter'].includes(e.code)) return; e.preventDefault(); if (!e.repeat) start(); });
        button.addEventListener('keyup', e => { if (['Space', 'Enter'].includes(e.code)) { e.preventDefault(); end(); } });
        button.addEventListener('blur', end);
    }
    private tick = () => {
        if (this.resolved || this.finished) return;
        if ((this.index !== 1 && this.progress >= 1) || (this.index === 1 && performance.now() - this.started >= 6000)) { this.stop(true); return; }
        $('bread-needle').style.left = `${this.progress * 100}%`;
        if (this.index === 0) $('panel').querySelector('.bread-fish')?.setAttribute('style', `opacity:${.25 + this.progress * .75};transform:scale(${.7 + this.progress * .3})`);
        if (this.index === 1) $('bread-spoon').style.left = `${15 + this.progress * 70}%`;
        if (this.index > 1) $('panel').querySelector('.bread-fish')?.setAttribute('style', `--bread-color:hsl(${42 - this.progress * 14} 56% ${76 - this.progress * 38}%)`);
        this.frame = requestAnimationFrame(this.tick);
    };
    private stop(timeout = false) {
        if (this.resolved || this.finished || this.resultShown) return;
        const step = steps[this.index], score = timeout ? 0 : BreadManager.score(this.progress, this.center, this.range);
        this.resolved = true; this.held = false; cancelAnimationFrame(this.frame);
        this.scores.push({ id: this.index === 1 ? `filling-${this.scoop + 1}` : step.id, name: this.index === 1 ? `팥 ${this.scoop + 1}숟갈` : step.name, score });
        if (this.index === 1) { this.scoop++; $('panel').querySelector('.bread-filling')?.classList.add('set'); }
        if (this.index === 2) $('panel').querySelector('.bread-fish')?.classList.add('bread-flip');
        if (score >= 90) audio.success(); else audio.note(523, .2);
        $('bread-feedback').innerHTML = `<b>${CookingManager.scoreGrade(score).label} · ${score}점</b> ${timeout ? '조금 늦었지만 괜찮아요. 다음 손길을 준비해요.' : score >= 90 ? '딱 알맞아요! 작은 정성이 쌓여요.' : '조금 달라도 따뜻하게 만들 수 있어요.'}`;
        const next = this.index === 0 ? '팥 채우기 →' : this.index === 1 ? this.scoop < this.order.scoops ? '팥 한 숟갈 더 →' : '틀 닫고 굽기 →' : this.index === 2 ? '뒷면 굽기 →' : '붕어빵 완성하기 →';
        $('bread-controls').innerHTML = `<button id="bread-next" class="primary">${next}</button>`;
        on('bread-next', () => {
            if (!this.resolved || this.finished || this.resultShown) return;
            if (this.index === 1 && this.scoop < this.order.scoops) this.render();
            else if (this.index < 3) { this.index++; this.render(); }
            else this.results();
        });
    }
    private results() {
        this.resultShown = true;
        const result = BreadManager.result(this.scores, this.order);
        $('panel').classList.add('bread-results');
        panel(`<div class="eyebrow">${this.recipe.name} · 꼬리까지 따뜻하게</div><div class="rice-result-title">${food('bread')}<div><span class="quality ${result.score >= 90 ? 'q-perfect' : ''}">${CookingManager.scoreGrade(result.score).label}</span><h2>${result.score} / 100점</h2></div></div>${this.art()}<div class="rice-step-results">${this.scores.map(s => `<div><span>${s.name}</span><b>${s.score}점</b></div>`).join('')}</div><p class="muted">${this.order.texture}, 팥 ${this.order.scoops}숟갈. 따뜻할 때 전해 주세요.</p><button id="bread-finish" class="primary">음식 담아 주기 →</button>`);
        on('bread-finish', () => {
            if (this.finished) return;
            this.finished = true; cancelAnimationFrame(this.frame);
            $('panel').classList.remove('minigame-panel', 'bread-panel', 'bread-results');
            $('interface').classList.remove('minigame-cooking'); $('nav').classList.remove('locked');
            window.setTimeout(() => this.finish(result.quality, this.extra, result), 0);
        });
    }
}
