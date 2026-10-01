import type { Recipe, Quality } from '../types/Recipe';
import { odenCooking } from '../data/cookingSteps';
import { CookingManager } from '../systems/CookingManager';
import { audio } from '../systems/AudioManager';
import { $, panel, on, food } from '../ui/UI';

export class OdenCooking {
    private frame = 0;
    private started = 0;
    private nextBubble = 0;
    private scores = new Map<string, number>();
    private progress = new Map<string, number>();
    private tones = new Map<string, string>();
    private resolved = false;
    private finished = false;

    constructor(private recipe: Recipe, private pot: boolean, private extra: string, private finish: (quality: Quality, extra: string) => void) {
        $('interface').classList.add('minigame-cooking');
        $('panel').classList.add('minigame-panel', 'oden-panel');
        this.render();
    }

    private state(progress: number) {
        return CookingManager.odenState(progress, odenCooking.goodStart, odenCooking.perfectCenter, odenCooking.perfectRange + (this.pot ? .01 : 0));
    }

    private render() {
        panel(`<div class="eyebrow">${this.recipe.name} · 익힘과 건지기</div><h2>세 꼬치를 하나씩 건져요</h2><p class="muted">주황색 PERFECT에서 건져요. 조금 늦어도 괜찮아요.</p><div class="oden-pot"><div class="oden-bubbles" aria-hidden="true"><i></i><i></i><i></i></div><div class="oden-pieces">${odenCooking.pieces.map(p => `<button id="oden-${p.id}" class="oden-piece tone-raw"><span class="oden-piece-name">${p.name}</span><span class="oden-art oden-${p.shape}" aria-hidden="true"><i></i></span><strong id="oden-state-${p.id}">설익음</strong><span class="oden-progress" aria-hidden="true"><i id="oden-progress-${p.id}"></i></span><small id="oden-hint-${p.id}">눌러서 건지기</small></button>`).join('')}</div></div><p id="oden-feedback" class="mini-feedback" aria-live="polite">3개 남았어요 · 파랑 → 노랑 → 주황 → 빨강</p><div id="oden-controls"></div>`);
        for (const piece of odenCooking.pieces) on('oden-' + piece.id, () => this.lift(piece.id));
        this.started = performance.now();
        this.nextBubble = this.started + 1100;
        this.tick();
    }

    private tick = () => {
        if (this.resolved || this.finished) return;
        const now = performance.now();
        for (const piece of odenCooking.pieces) {
            if (this.scores.has(piece.id)) continue;
            const progress = Math.min(1, (now - this.started) / piece.duration);
            this.progress.set(piece.id, progress);
            const state = this.state(progress);
            $('oden-progress-' + piece.id).style.width = `${progress * 100}%`;
            if (this.tones.get(piece.id) !== state.tone) {
                this.tones.set(piece.id, state.tone);
                const button = $('oden-' + piece.id);
                button.className = 'oden-piece tone-' + state.tone;
                button.setAttribute('aria-label', `${piece.name} · ${state.label} · 건지기`);
                $('oden-state-' + piece.id).textContent = state.label;
            }
        }
        if (now >= this.nextBubble) {
            audio.note(140, .12, .009);
            this.nextBubble = now + 1300;
        }
        this.frame = requestAnimationFrame(this.tick);
    };

    private lift(id: string) {
        if (this.resolved || this.finished || this.scores.has(id)) return;
        const state = this.state(this.progress.get(id) ?? 0);
        this.scores.set(id, state.score);
        const button = $('oden-' + id) as HTMLButtonElement;
        button.disabled = true;
        button.classList.add('oden-lifted');
        button.setAttribute('aria-label', `건졌어요 · ${state.score}점`);
        $('oden-state-' + id).textContent = CookingManager.scoreGrade(state.score).label;
        $('oden-hint-' + id).textContent = `건졌어요 · ${state.score}점`;
        button.querySelector('.oden-art')?.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-12px)' }, { transform: 'translateY(0)' }], { duration: 320 });
        audio.note(state.score >= 90 ? 784 : state.score >= 60 ? 659 : 523, .2);
        const remaining = odenCooking.pieces.length - this.scores.size;
        $('oden-feedback').textContent = remaining ? `${remaining}개 남았어요 · 나머지 꼬치도 천천히 건져 주세요.` : '모두 건졌어요. 국물까지 따뜻하게 준비됐어요.';
        if (remaining === 0) {
            this.resolved = true;
            cancelAnimationFrame(this.frame);
            $('oden-controls').innerHTML = '<button id="oden-result" class="primary">요리 결과 보기 →</button>';
            on('oden-result', () => this.results());
        }
    }

    private results() {
        const score = CookingManager.totalScore([...this.scores.values()]);
        const grade = CookingManager.scoreGrade(score);
        panel(`<div class="eyebrow">${this.recipe.name} · 세 꼬치의 작은 정성</div><div class="rice-result-title">${food(this.recipe.id)}<div><span class="quality q-${score >= 90 ? 'perfect' : 'good'}">${grade.label}</span><h2>${score} / 100점</h2></div></div><div class="rice-step-results">${odenCooking.pieces.map(p => `<div><span>${p.name}</span><b>${this.scores.get(p.id)}점</b></div>`).join('')}</div><p class="muted">${score >= 90 ? '탱글한 어묵, 따뜻한 국물. 알맞게 익었어요.' : '조금 일찍, 조금 늦게 건져도 따뜻한 한 끼예요.'}</p><button id="oden-finish" class="primary">음식 담아 주기 →</button>`);
        on('oden-finish', () => {
            if (this.finished) return;
            this.finished = true;
            cancelAnimationFrame(this.frame);
            $('panel').classList.remove('minigame-panel', 'oden-panel');
            $('interface').classList.remove('minigame-cooking');
            $('nav').classList.remove('locked');
            window.setTimeout(() => this.finish(grade.quality, this.extra), 0);
        });
    }
}
