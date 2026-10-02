import type { Quality, Recipe } from '../types/Recipe';
import type { CookingStepScore } from '../types/Cooking';
import { CookingManager } from '../systems/CookingManager';
import { audio } from '../systems/AudioManager';
import { $, on, panel, food } from '../ui/UI';

const steps = [
    { id: 'noodle', name: '면 익히기', title: '면을 알맞게 익혀요', prompt: '면발이 탱글할 때 눌러 건져요.', button: '면 건지기', duration: 5000, perfectRange: .09 },
    { id: 'egg', name: '계란 넣기', title: '불을 줄이고 계란을 넣어요', prompt: '국물이 보글거릴 때 계란을 넣어 주세요.', button: '지금 계란 넣기', duration: 4600, perfectRange: .1 }
];

/** Ramen gets two gentle timing actions; ingredients, serving and rewards stay upstream. */
export class RamenCooking {
    private index = 0;
    private scores: CookingStepScore[] = [];
    private frame = 0;
    private started = 0;
    private progress = 0;
    private resolved = false;
    private finished = false;

    constructor(private recipe: Recipe, private pot: boolean, private extra: string, private finish: (quality: Quality, extra: string) => void) {
        $('interface').classList.add('minigame-cooking');
        $('panel').classList.add('minigame-panel', 'ramen-panel');
        this.render();
    }

    private render() {
        cancelAnimationFrame(this.frame);
        this.resolved = false;
        const step = steps[this.index];
        panel(`<div class="eyebrow">${this.recipe.name} · ${this.index + 1} / ${steps.length}</div><h2>${step.title}</h2><p class="muted">${step.prompt}</p><div class="ramen-stage ramen-${step.id}"><div class="ramen-steam" aria-hidden="true"><i></i><i></i><i></i></div><div class="ramen-bowl"><div class="ramen-soup"></div><div class="ramen-noodles"><i></i><i></i><i></i></div><div class="ramen-egg"><i></i></div></div></div><div class="ramen-timing"><div class="rice-meter"><div class="rice-good"></div><div class="rice-perfect" style="left:${(0.5 - step.perfectRange - (this.pot ? .015 : 0)) * 100}%;width:${(step.perfectRange + (this.pot ? .015 : 0)) * 200}%"></div><i id="ramen-needle"></i></div><div class="rice-meter-labels"><span>NORMAL</span><span>GOOD</span><b>PERFECT</b><span>GOOD</span><span>NORMAL</span></div></div><div id="ramen-feedback" class="mini-feedback" aria-live="polite">가운데 주황색 PERFECT 구간을 기다려요.</div><div id="ramen-controls"><button id="ramen-stop" class="primary">${step.button}</button></div>`);
        on('ramen-stop', () => this.stop());
        this.started = performance.now();
        this.tick();
    }

    private tick = () => {
        if (this.resolved || this.finished) return;
        const step = steps[this.index];
        const phase = ((performance.now() - this.started) % step.duration) / step.duration;
        this.progress = phase < .5 ? phase * 2 : (1 - phase) * 2;
        $('ramen-needle').style.left = `${this.progress * 100}%`;
        $('panel').querySelector('.ramen-noodles')?.classList.toggle('soft', this.progress > .35);
        $('panel').querySelector('.ramen-egg')?.classList.toggle('set', this.index === 1 && this.progress > .42);
        this.frame = requestAnimationFrame(this.tick);
    };

    private stop() {
        if (this.resolved || this.finished) return;
        const step = steps[this.index];
        const score = CookingManager.riceballTimingScore(this.progress, step.perfectRange + (this.pot ? .015 : 0));
        this.resolved = true;
        cancelAnimationFrame(this.frame);
        $('panel').querySelector('.ramen-stage')?.classList.add('ramen-done');
        this.scores.push({ id: step.id, name: step.name, score });
        audio.note(score >= 90 ? 784 : score >= 60 ? 659 : 523, .24);
        const grade = CookingManager.scoreGrade(score);
        $('ramen-feedback').innerHTML = `<b>${grade.label} · ${score}점</b> ${score >= 90 ? '면과 계란이 딱 알맞아요!' : score >= 60 ? '국물이 맛있게 우러났어요.' : '괜찮아요. 따뜻한 라면이 될 거예요.'}`;
        $('ramen-controls').innerHTML = `<button id="ramen-next" class="primary">${this.index === steps.length - 1 ? '라면 완성하기' : '계란 넣기 →'}</button>`;
        on('ramen-next', () => {
            if (this.finished || !this.resolved) return;
            if (this.index < steps.length - 1) {
                this.index++;
                this.render();
            } else this.results();
        });
    }

    private results() {
        const score = CookingManager.totalScore(this.scores.map(step => step.score));
        const grade = CookingManager.scoreGrade(score);
        panel(`<div class="eyebrow">${this.recipe.name} · 불을 두 번 맞춰요</div><div class="rice-result-title">${food('ramen')}<div><span class="quality ${score >= 90 ? 'q-perfect' : ''}">${grade.label}</span><h2>${score} / 100점</h2></div></div><div class="rice-step-results">${this.scores.map(step => `<div><span>${step.name}</span><b>${step.score}점</b></div>`).join('')}</div><p class="muted">${score >= 90 ? '탱글한 면과 반숙 계란, 완벽한 한 그릇이에요.' : '조금 달라도 국물은 따뜻하고 맛있어요.'}</p><button id="ramen-finish" class="primary">음식 담아 주기 →</button>`);
        on('ramen-finish', () => {
            if (this.finished) return;
            this.finished = true;
            cancelAnimationFrame(this.frame);
            $('panel').classList.remove('minigame-panel', 'ramen-panel');
            $('interface').classList.remove('minigame-cooking');
            $('nav').classList.remove('locked');
            window.setTimeout(() => this.finish(grade.quality, this.extra), 0);
        });
    }
}
