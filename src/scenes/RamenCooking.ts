import type { Quality, Recipe } from '../types/Recipe';
import type { CookingStepScore } from '../types/Cooking';
import { CookingManager } from '../systems/CookingManager';
import { RamenManager, type RamenOrder, type RamenCustomer, type RamenResult } from '../systems/RamenManager';
import { audio } from '../systems/AudioManager';
import { $, on, panel, food } from '../ui/UI';

const steps = [
    { id: 'broth', name: '국물 양', title: '따뜻한 국물을 부어요', prompt: '버튼을 꾹 누르고, 주황 칸에 차면 손을 놓아요.', button: '꾹 눌러 국물 붓기', duration: 2800, range: .09 },
    { id: 'noodle', name: '면 익힘', title: '면을 취향에 맞게 건져요', prompt: '면이 한 번만 익어요. 주황 칸에서 건져 주세요.', button: '지금 면 건지기', duration: 6200, range: .1 },
    { id: 'egg', name: '계란 넣기', title: '보글보글, 계란을 톡!', prompt: '막대가 주황 칸에 왔을 때 계란을 넣어요.', button: '지금 계란 넣기', duration: 3600, range: .1 }
];

export class RamenCooking {
    private index = 0;
    private egg = 0;
    private scores: CookingStepScore[] = [];
    private frame = 0;
    private started = 0;
    private resolved = false;
    private finished = false;
    private held = false;
    private showingResult = false;
    private order: RamenOrder;

    constructor(private recipe: Recipe, private pot: boolean, private extra: string, private finish: (quality: Quality, extra: string, result?: RamenResult) => void, customer?: RamenCustomer) {
        this.order = RamenManager.order(customer, extra);
        $('interface').classList.add('minigame-cooking');
        $('panel').classList.add('minigame-panel', 'ramen-panel');
        this.render();
    }

    private get center() { return this.index === 0 ? this.order.brothCenter : this.index === 1 ? this.order.noodleCenter : .5; }
    private get range() { return steps[this.index].range + (this.pot ? .015 : 0); }
    private get progress() {
        const elapsed = Math.max(0, performance.now() - this.started);
        if (this.index !== 2) return Math.min(1, elapsed / steps[this.index].duration);
        const phase = (elapsed % steps[this.index].duration) / steps[this.index].duration;
        return phase < .5 ? phase * 2 : (1 - phase) * 2;
    }

    private bowl() {
        return `<div class="ramen-stage ramen-step-${steps[this.index].id}"><div class="ramen-steam" aria-hidden="true"><i></i><i></i><i></i></div><div class="ramen-bowl"><div class="ramen-soup"></div><div class="ramen-noodles ${this.index > 1 ? 'lifted' : ''}"><i></i><i></i><i></i></div>${Array.from({ length: this.order.eggs }, (_, i) => `<div class="ramen-egg ${i === 1 ? 'ramen-second-egg' : ''} ${this.showingResult || i < this.egg ? 'set' : ''}"><i></i></div>`).join('')}<div class="ramen-scallion ${this.showingResult ? 'set' : ''}" aria-hidden="true"></div></div></div>`;
    }

    private render() {
        cancelAnimationFrame(this.frame);
        this.resolved = false;
        this.held = false;
        const step = steps[this.index];
        panel(`<div class="eyebrow">${this.recipe.name} · ${this.index + 1} / 3 ${step.name}</div><h2>${step.title}</h2><p class="ramen-order">${this.order.customerName} · ${this.order.texture}${this.extra === 'broth' ? ' · 국물 넉넉하게' : ''} · 계란 ${this.order.eggs}개${this.index === 2 ? ` (${this.egg + 1} / ${this.order.eggs})` : ''}</p><p class="muted">${step.prompt}</p>${this.bowl()}<div class="ramen-timing"><div class="rice-meter"><div class="rice-perfect" style="left:${(this.center - this.range) * 100}%;width:${this.range * 200}%"></div><div id="ramen-fill"></div><i id="ramen-needle"></i></div><div class="ramen-meter-labels"><span>${this.index === 0 ? '적게' : this.index === 1 ? '덜 익음' : '천천히'}</span><b>주황 칸 = PERFECT</b><span>${this.index === 0 ? '많이' : this.index === 1 ? '푹 익음' : '톡!'}</span></div></div><div id="ramen-feedback" class="mini-feedback" aria-live="polite">${this.index === 0 ? '마우스·터치 또는 스페이스·엔터를 꾹 눌러요.' : '주황 칸에 맞춰 눌러요. 놓쳐도 따뜻한 한 끼예요.'}</div><div id="ramen-controls"><button id="ramen-stop" class="primary">${step.button}</button></div>`);
        this.started = performance.now();
        if (this.index === 0) this.bindPour();
        else { on('ramen-stop', () => this.stop()); this.tick(); }
    }

    private bindPour() {
        const button = $('ramen-stop');
        const start = () => {
            if (this.resolved || this.finished || this.held) return;
            this.held = true; this.started = performance.now();
            button.classList.add('ramen-pouring');
            audio.note(220, .12, .02); this.tick();
        };
        const end = () => { if (this.held) this.stop(); };
        button.addEventListener('pointerdown', event => {
            if (event.button !== 0) return;
            event.preventDefault(); button.setPointerCapture(event.pointerId); start();
        });
        for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(event, end);
        button.addEventListener('keydown', event => {
            if (!['Space', 'Enter'].includes(event.code)) return;
            event.preventDefault(); if (!event.repeat) start();
        });
        button.addEventListener('keyup', event => {
            if (['Space', 'Enter'].includes(event.code)) { event.preventDefault(); end(); }
        });
        button.addEventListener('blur', end);
    }

    private tick = () => {
        if (this.resolved || this.finished) return;
        const elapsed = performance.now() - this.started;
        // Boiling is one-way; the egg action has a short, forgiving repeat window.
        if ((this.index !== 2 && this.progress >= 1) || (this.index === 2 && elapsed >= 6500)) {
            this.stop(true); return;
        }
        $('ramen-needle').style.left = `${this.progress * 100}%`;
        $('ramen-fill').style.width = `${this.index === 2 ? 0 : this.progress * 100}%`;
        $('panel').querySelector('.ramen-noodles')?.classList.toggle('soft', this.index === 1 && this.progress > .6);
        if (this.index === 0) $('panel').querySelector('.ramen-soup')?.setAttribute('style', `opacity:${.35 + this.progress * .65};transform:scaleX(${.55 + this.progress * .45})`);
        this.frame = requestAnimationFrame(this.tick);
    };

    private stop(timeout = false) {
        if (this.resolved || this.finished || this.showingResult) return;
        const step = steps[this.index];
        const score = timeout ? 0 : RamenManager.score(this.progress, this.center, this.range);
        this.resolved = true; this.held = false;
        cancelAnimationFrame(this.frame);
        $('panel').querySelector('.ramen-stage')?.classList.add('ramen-done');
        this.scores.push({ id: this.index === 2 ? `egg-${this.egg + 1}` : step.id, name: this.index === 2 ? `계란 ${this.egg + 1}` : step.name, score });
        if (this.index === 2) { this.egg++; $('panel').querySelectorAll('.ramen-egg').forEach((element, i) => element.classList.toggle('set', i < this.egg)); }
        if (score >= 90) audio.success(); else audio.note(score >= 60 ? 659 : 523, .24);
        const grade = CookingManager.scoreGrade(score);
        $('ramen-feedback').innerHTML = `<b>${grade.label} · ${score}점</b> ${timeout ? '조금 늦었지만 괜찮아요. 다음 손길을 준비해요.' : score >= 90 ? '손님의 부탁에 딱 맞췄어요!' : '조금 달라도 따뜻한 라면이 돼요.'}`;
        const next = this.index === 0 ? '면 넣고 익히기 →' : this.index === 1 ? '불을 줄이고 계란 넣기 →' : this.egg < this.order.eggs ? '두 번째 계란 준비하기 →' : '파 올리고 라면 완성하기 →';
        $('ramen-controls').innerHTML = `<button id="ramen-next" class="primary">${next}</button>`;
        on('ramen-next', () => {
            if (this.finished || !this.resolved || this.showingResult) return;
            if (this.index < 2) { this.index++; this.render(); }
            else if (this.egg < this.order.eggs) this.render();
            else this.results();
        });
    }

    private results() {
        this.showingResult = true;
        const result = RamenManager.result(this.scores, this.order);
        const grade = CookingManager.scoreGrade(result.score);
        $('panel').classList.add('ramen-results');
        panel(`<div class="eyebrow">${this.recipe.name} · 정성을 담은 한 그릇</div><div class="rice-result-title">${food('ramen')}<div><span class="quality ${result.score >= 90 ? 'q-perfect' : ''}">${grade.label}</span><h2>${result.score} / 100점</h2></div></div>${this.bowl()}<div class="rice-step-results">${this.scores.map(s => `<div><span>${s.name}</span><b>${s.score}점</b></div>`).join('')}</div><p class="muted">${this.order.texture}, 계란 ${this.order.eggs}개. 국물까지 따뜻하게 담았어요.</p><button id="ramen-finish" class="primary">음식 담아 주기 →</button>`);
        on('ramen-finish', () => {
            if (this.finished) return;
            this.finished = true;
            cancelAnimationFrame(this.frame);
            $('panel').classList.remove('minigame-panel', 'ramen-panel', 'ramen-results');
            $('interface').classList.remove('minigame-cooking');
            $('nav').classList.remove('locked');
            window.setTimeout(() => this.finish(result.quality, this.extra, result), 0);
        });
    }
}
