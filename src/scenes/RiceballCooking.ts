import type { Quality, Recipe } from '../types/Recipe';
import type { CookingStepScore, RiceballStep } from '../types/Cooking';
import { riceballSteps } from '../data/cookingSteps';
import { CookingManager } from '../systems/CookingManager';
import { audio } from '../systems/AudioManager';
import { $, panel, on, food } from '../ui/UI';

/** Only the riceball's cooking action changes. Ingredients, preferences and rewards stay upstream. */
export class RiceballCooking {
    private index = 0;
    private scores: CookingStepScore[] = [];
    private frame = 0;
    private progress = 0;
    private resolved = false;
    private finished = false;
    private beat = 0;
    private mistakes = 0;
    private lastPress = 0;

    constructor(private recipe: Recipe, private pot: boolean, private extra: string, private finish: (quality: Quality, extra: string) => void) {
        $('interface').classList.add('minigame-cooking');
        $('panel').classList.add('minigame-panel');
        this.render();
    }

    private render() {
        cancelAnimationFrame(this.frame);
        this.resolved = false;
        const step = riceballSteps[this.index];
        panel(`<div class="eyebrow">${this.recipe.name} · ${this.index + 1} / ${riceballSteps.length}</div><h2>${step.title}</h2><p class="muted">${step.instruction}</p><div class="riceball-stage stage-${step.type}"><span id="riceball-art" class="riceball-art shape-${step.type === 'quantity' ? '0' : step.type === 'wrap' ? '4' : '0'}"><i></i><b></b></span>${step.type === 'wrap' ? '<span id="seaweed-strip" class="seaweed-strip"></span><span class="wrap-guide"></span>' : ''}</div><div id="mini-controls"></div><p id="mini-feedback" class="mini-feedback" aria-live="polite">${step.type === 'shape' ? '왼쪽 → 오른쪽 → 왼쪽 → 오른쪽' : '좋은 구간을 놓쳐도 다시 돌아와요.'}</p>`);
        if (step.type === 'shape') this.shape(step);
        else this.timing(step);
    }

    private timing(step: Extract<RiceballStep, { type: 'quantity' | 'wrap' }>) {
        const perfect = step.perfectRange + (this.pot ? .01 : 0);
        $('mini-controls').innerHTML = `<div class="rice-meter"><div class="rice-good"></div><div class="rice-perfect" style="left:${(0.5 - perfect) * 100}%;width:${perfect * 200}%"></div><i id="rice-needle"></i></div><div class="rice-meter-labels"><span>NORMAL</span><span>GOOD</span><b>PERFECT</b><span>GOOD</span><span>NORMAL</span></div><button id="rice-stop" class="primary">${step.button}</button>`;
        const started = performance.now();
        const tick = () => {
            if (this.resolved || this.finished) return;
            const phase = ((performance.now() - started) % step.duration) / step.duration;
            this.progress = phase < .5 ? phase * 2 : (1 - phase) * 2;
            $('rice-needle').style.left = `${this.progress * 100}%`;
            if (step.type === 'quantity') $('riceball-art').style.transform = `scale(${.65 + this.progress * .55})`;
            else $('seaweed-strip').style.left = `${12 + this.progress * 76}%`;
            this.frame = requestAnimationFrame(tick);
        };
        on('rice-stop', () => {
            if (this.resolved) return;
            const score = CookingManager.riceballTimingScore(this.progress, perfect);
            if (step.type === 'wrap') {
                $('seaweed-strip').classList.add('wrapped');
                $('riceball-art').classList.add('with-seaweed');
                $('riceball-art').animate([{ transform: 'scale(1)' }, { transform: 'scale(1.09)' }, { transform: 'scale(1)' }], { duration: 280 });
            }
            this.completeStep(step, score);
        });
        tick();
    }

    private shape(step: Extract<RiceballStep, { type: 'shape' }>) {
        this.beat = 0; this.mistakes = 0; this.lastPress = 0;
        $('mini-controls').innerHTML = `<div class="shape-progress">${Array.from({ length: step.beats }, (_, i) => `<i id="beat-${i}"></i>`).join('')}</div><div class="paw-controls"><button id="shape-left" class="secondary">왼쪽<br><small>꼭</small></button><button id="shape-right" class="secondary">오른쪽<br><small>꼭</small></button></div>`;
        const press = (side: number) => {
            if (this.resolved || performance.now() - this.lastPress < step.cooldown) return;
            if (side !== this.beat % 2) {
                this.mistakes++;
                $('mini-feedback').textContent = `${this.beat % 2 === 0 ? '왼쪽' : '오른쪽'} 차례예요. 천천히 다시 눌러 주세요.`;
                audio.note(262, .1, .025);
                return;
            }
            this.lastPress = performance.now();
            $('beat-' + this.beat).classList.add('done');
            this.beat++;
            const art = $('riceball-art');
            art.className = `riceball-art shape-${this.beat}`;
            art.animate([{ transform: 'scale(1)' }, { transform: 'scale(.88,1.08)' }, { transform: 'scale(1)' }], { duration: 230 });
            audio.note(392 + this.beat * 65, .12);
            if (this.beat >= step.beats) { this.completeStep(step, Math.max(0, 100 - this.mistakes * 15)); return; }
            $('mini-feedback').textContent = `좋아요! 이번에는 ${this.beat % 2 === 0 ? '왼쪽' : '오른쪽'}이에요.`;
            const buttons = document.querySelectorAll<HTMLButtonElement>('.paw-controls button');
            buttons.forEach(b => b.disabled = true);
            const wait = () => {
                if (this.resolved || this.finished) return;
                if (performance.now() - this.lastPress >= step.cooldown) buttons.forEach(b => b.disabled = false);
                else this.frame = requestAnimationFrame(wait);
            };
            this.frame = requestAnimationFrame(wait);
        };
        on('shape-left', () => press(0)); on('shape-right', () => press(1));
        // Arrow keys work while focus stays within the cooking panel; touch needs no keyboard.
        $('panel').onkeydown = event => {
            if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
                event.preventDefault(); press(event.code === 'ArrowLeft' ? 0 : 1);
            }
        };
    }

    private completeStep(step: RiceballStep, score: number) {
        if (this.resolved) return;
        this.resolved = true;
        cancelAnimationFrame(this.frame);
        $('panel').onkeydown = null;
        this.scores.push({ id: step.id, name: step.title, score });
        audio.note(score >= 90 ? 784 : score >= 60 ? 659 : 523, .25);
        const grade = CookingManager.scoreGrade(score);
        $('mini-feedback').innerHTML = `<b>${grade.label} · ${score}점</b> ${score >= 90 ? '정성이 딱 맞았어요!' : score >= 60 ? '맛있는 모양이에요.' : '괜찮아요. 따뜻한 한 끼가 될 거예요.'}`;
        const last = this.index === riceballSteps.length - 1;
        $('mini-controls').innerHTML = `<button id="rice-next" class="primary">${last ? '요리 결과 보기' : '다음 손길'} →</button>`;
        on('rice-next', () => { if (last) this.results(); else { this.index++; this.render(); } });
    }

    private results() {
        const score = CookingManager.totalScore(this.scores.map(s => s.score));
        const grade = CookingManager.scoreGrade(score);
        panel(`<div class="eyebrow">참치 주먹밥 · 세 번의 작은 정성</div><div class="rice-result-title">${food('rice')}<div><span class="quality q-${score >= 90 ? 'perfect' : 'good'}">${grade.label}</span><h2>${score} / 100점</h2></div></div><div class="rice-step-results">${this.scores.map((s, i) => `<div><span>${i + 1}. ${i === 0 ? '밥 양' : i === 1 ? '모양 만들기' : '김 감기'}</span><b>${s.score}점</b></div>`).join('')}</div><p class="muted">${score >= 90 ? '바삭한 김, 꼭 맞는 모양. 맛있는 한 끼가 준비됐어요.' : '모양이 조금 달라도, 따뜻한 마음은 그대로예요.'}</p><button id="rice-finish" class="primary">음식 담아 주기 →</button>`);
        on('rice-finish', () => {
            if (this.finished) return;
            this.finished = true;
            cancelAnimationFrame(this.frame);
            $('panel').onkeydown = null;
            $('panel').classList.remove('minigame-panel');
            $('interface').classList.remove('minigame-cooking');
            $('nav').classList.remove('locked');
            // Let the input finish before displaying the existing serving button.
            window.setTimeout(() => this.finish(grade.quality, this.extra), 0);
        });
    }
}
