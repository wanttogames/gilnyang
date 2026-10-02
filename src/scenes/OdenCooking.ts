import type { Recipe, Quality } from '../types/Recipe';
import { odenCooking } from '../data/cookingSteps';
import { CookingManager } from '../systems/CookingManager';
import { OdenManager, type OdenOrder, type OdenResult } from '../systems/OdenManager';
import { audio } from '../systems/AudioManager';
import { $, panel, on, food } from '../ui/UI';

const actionLabels: Record<string, string> = { raw: '아직 덜 익었어요', good: '건져도 좋아요', perfect: '지금 건져요!', late: '조금 더 익었어요', over: '퍼졌어요' };

export class OdenCooking {
    private frame = 0;
    private started = 0;
    private nextBubble = 0;
    private scores = new Map<string, number>();
    private tones = new Map<string, string>();
    private resolved = false;
    private finished = false;
    private selected: string[] = [];
    private mistakes = 0;
    private order: OdenOrder;
    private stage: 'select' | 'cook' | 'result' = 'select';

    constructor(private recipe: Recipe, private pot: boolean, private extra: string, private finish: (quality: Quality, extra: string, result?: OdenResult) => void, customer?: { id: string; name: string }) {
        this.order = OdenManager.order(customer?.id, customer?.name);
        $('interface').classList.add('minigame-cooking');
        $('panel').classList.add('minigame-panel', 'oden-panel');
        this.renderSelection();
    }

    private state(progress: number) {
        return CookingManager.odenState(progress, odenCooking.goodStart, this.order.center, odenCooking.perfectRange + (this.pot ? .01 : 0), odenCooking.lateGoodEnd);
    }

    private renderSelection() {
        panel(`<div class="eyebrow">따끈한 어묵 · 1 / 3 재료 고르기</div><h2>${this.order.customerName}의 꼬치 주문</h2><p class="muted">아래 순서대로 꼬치를 골라 주세요.</p><div class="oden-request">${this.order.ids.map((id, i) => `<span class="${i < this.selected.length ? 'done' : ''}"><b>${i + 1}</b> ${odenCooking.pieces.find(p => p.id === id)!.name}${i < this.selected.length ? ' ✓' : ''}</span>`).join('')}</div><div class="oden-selection">${odenCooking.pieces.map(p => `<button id="oden-pick-${p.id}" class="oden-piece" ${this.selected.includes(p.id) ? 'disabled' : ''}><span class="oden-piece-name">${p.name}</span><span class="oden-art oden-${p.shape}" aria-hidden="true"><i></i></span><small>${this.selected.includes(p.id) ? '담았어요 ✓' : '꼬치 담기'}</small></button>`).join('')}</div><p class="oden-texture">“${this.order.texture} 부탁해요.”</p><p id="oden-selection-feedback" class="mini-feedback" aria-live="polite">${this.selected.length} / 3 꼬치를 담았어요</p>${this.selected.length === 3 ? '<button id="oden-start" class="primary">국물에 넣고 익히기 →</button>' : '<p class="hint">틀리면 다시 고르면 돼요. 아직 시간은 흐르지 않아요.</p>'}`);
        for (const p of odenCooking.pieces) on('oden-pick-' + p.id, () => {
            if (this.stage !== 'select' || this.selected.includes(p.id)) return;
            if (p.id !== this.order.ids[this.selected.length]) {
                this.mistakes++;
                $('oden-selection-feedback').textContent = `다음은 ${odenCooking.pieces.find(p => p.id === this.order.ids[this.selected.length])!.name}이에요. 다시 골라 주세요.`;
                audio.note(262, .1, .015);
                return;
            }
            this.selected.push(p.id);
            audio.note(392 + this.selected.length * 65, .1);
            this.renderSelection();
        });
        on('oden-start', () => {
            if (this.stage !== 'select' || this.selected.length !== 3) return;
            this.stage = 'cook';
            this.render();
        });
    }

    private get pieces() { return this.order.ids.map(id => odenCooking.pieces.find(p => p.id === id)!); }

    private render() {
        const range = odenCooking.perfectRange + (this.pot ? .01 : 0);
        panel(`<div class="eyebrow">${this.recipe.name} · 2 / 3 익히고 건지기</div><h2>세 꼬치를 하나씩 건져요</h2><p class="muted">${this.order.texture} · 주황 칸에 오면 꼬치를 눌러요.</p><div class="oden-pot"><div class="oden-bubbles" aria-hidden="true"><i></i><i></i><i></i></div><div class="oden-pieces">${this.pieces.map(p => `<button id="oden-${p.id}" class="oden-piece tone-raw"><span class="oden-piece-name">${p.name}</span><span class="oden-art oden-${p.shape}" aria-hidden="true"><i></i></span><strong id="oden-state-${p.id}">아직 덜 익었어요</strong><span class="oden-progress" aria-hidden="true"><span class="oden-target" style="left:${(this.order.center - range) * 100}%;width:${range * 200}%"></span><i id="oden-progress-${p.id}"></i></span><small id="oden-hint-${p.id}">주황 칸 = PERFECT</small></button>`).join('')}</div></div><p id="oden-feedback" class="mini-feedback" aria-live="polite">3개 남았어요 · 사각이 먼저, 둥근 꼬치가 마지막에 익어요</p><div id="oden-controls"></div>`);
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
            if (progress >= 1) {
                this.lift(piece.id, true);
                if (this.resolved) return;
                continue;
            }
            const state = this.state(progress);
            $('oden-progress-' + piece.id).style.width = `${progress * 100}%`;
            if (this.tones.get(piece.id) !== state.tone) {
                this.tones.set(piece.id, state.tone);
                const button = $('oden-' + piece.id);
                button.className = 'oden-piece tone-' + state.tone;
                button.setAttribute('aria-label', `${piece.name} · ${actionLabels[state.tone]} · ${state.label} · 건지기`);
                $('oden-state-' + piece.id).textContent = actionLabels[state.tone];
                if (state.tone === 'perfect') button.classList.add('oden-ready');
            }
        }
        if (now >= this.nextBubble) {
            audio.note(140, .12, .009);
            this.nextBubble = now + 1300;
        }
        this.frame = requestAnimationFrame(this.tick);
    };

    private lift(id: string, automatic = false) {
        if (this.stage !== 'cook' || this.resolved || this.finished || this.scores.has(id)) return;
        const piece = odenCooking.pieces.find(p => p.id === id)!;
        const state = this.state(Math.min(1, (performance.now() - this.started) / piece.duration));
        this.scores.set(id, state.score);
        const button = $('oden-' + id) as HTMLButtonElement;
        button.disabled = true;
        button.classList.remove('oden-ready');
        button.classList.add('oden-lifted');
        button.dataset.grade = CookingManager.scoreGrade(state.score).label;
        button.setAttribute('aria-label', `건졌어요 · ${state.score}점`);
        $('oden-state-' + id).textContent = CookingManager.scoreGrade(state.score).label;
        $('oden-hint-' + id).textContent = `${automatic ? '늦었지만 건졌어요' : '건졌어요'} · ${state.score}점`;
        // Lift immediately; the skewer lands above the broth and stays there.
        // CSS supplies a static lifted pose when reduced motion is enabled.
        button.classList.add('oden-pluck');
        if (state.score >= 90) audio.success();
        else {
            audio.note(392, .09, .025);
            window.setTimeout(() => audio.note(state.score >= 60 ? 659 : 523, .22, .035), 75);
        }
        const remaining = odenCooking.pieces.length - this.scores.size;
        $('oden-feedback').textContent = remaining ? `${CookingManager.scoreGrade(state.score).label} · ${state.score}점! ${remaining}개 남았어요.` : '모두 건졌어요. 국물까지 따뜻하게 준비됐어요.';
        if (remaining === 0) {
            this.resolved = true;
            this.stage = 'result';
            cancelAnimationFrame(this.frame);
            $('oden-controls').innerHTML = '<button id="oden-result" class="primary">요리 결과 보기 →</button>';
            on('oden-result', () => this.results());
        }
    }

    private results() {
        if (this.stage !== 'result' || this.finished) return;
        const result = OdenManager.result(this.mistakes, [...this.scores.values()], this.order);
        const score = result.score;
        const grade = CookingManager.scoreGrade(score);
        $('panel').classList.add('oden-results');
        panel(`<div class="eyebrow">${this.recipe.name} · 3 / 3 따뜻하게 담기</div><div class="rice-result-title">${food(this.recipe.id)}<div><span class="quality q-${score >= 90 ? 'perfect' : 'good'}">${grade.label}</span><h2>${score} / 100점</h2></div></div><div class="oden-serving" aria-hidden="true">${this.pieces.map(p => `<span class="oden-art oden-${p.shape}"><i></i></span>`).join('')}<span class="oden-serving-steam">♨</span></div><div class="rice-step-results"><div><span>꼬치 주문 기억하기</span><b>${result.selectionScore}점</b></div>${this.pieces.map(p => `<div><span>${p.name}</span><b>${this.scores.get(p.id)}점</b></div>`).join('')}</div><p class="muted">${score >= 90 ? '탱글한 어묵, 따뜻한 국물. 알맞게 익었어요.' : '조금 일찍, 조금 늦게 건져도 따뜻한 한 끼예요.'}</p><button id="oden-finish" class="primary">음식 담아 주기 →</button>`);
        on('oden-finish', () => {
            if (this.finished) return;
            this.finished = true;
            cancelAnimationFrame(this.frame);
            $('panel').classList.remove('minigame-panel', 'oden-panel', 'oden-results');
            $('interface').classList.remove('minigame-cooking');
            $('nav').classList.remove('locked');
            window.setTimeout(() => this.finish(grade.quality, this.extra, result), 0);
        });
    }
}
