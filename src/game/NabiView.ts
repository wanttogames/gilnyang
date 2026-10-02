import Phaser from 'phaser';
import { customerRender, nabiTailLayout } from './CharacterArt';
import type { Quality } from '../types/Recipe';
import type { StoryLine, StoryEmotion } from '../types/CharacterStory';

/** Nabi only: arrival/departure move this container; expression moves its children. */
export class NabiView extends Phaser.GameObjects.Container {
    private bodyRoot: Phaser.GameObjects.Container;
    private bodyImage: Phaser.GameObjects.Image;
    private tail: Phaser.GameObjects.Image;
    private ears: Phaser.GameObjects.Image[];
    private timers = new Set<Phaser.Time.TimerEvent>();
    private animations = new Set<Phaser.Tweens.Tween>();
    private effects = new Set<Phaser.GameObjects.Image>();
    private tailTween?: Phaser.Tweens.Tween;
    private breathTween?: Phaser.Tweens.Tween;
    private reactionTimer?: Phaser.Time.TimerEvent;
    private affectionTimer?: Phaser.Time.TimerEvent;
    private storyEmotion?: StoryEmotion;
    private foodMood?: 'normal' | 'happy' | 'veryHappy';
    private affection = false;
    private blinking = false;
    private started = false;
    private eating = false;
    private cleaned = false;
    private intimacy = 0;
    private stage = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.setName('nabi-view');
        this.bodyRoot = scene.add.container(0, 0).setName('nabi-body-root');
        const tail = nabiTailLayout;
        this.tail = scene.add.image(tail.anchorX - customerRender.centre, tail.anchorY - customerRender.centre, 'nabi-tail')
            .setOrigin(tail.pivotX / tail.width, tail.pivotY / tail.height).setName('nabi-tail');
        this.bodyImage = scene.add.image(0, 0, 'nabi-body').setName('nabi-body');
        this.ears = [scene.add.image(-9.5, -5, 'nabi-ear'), scene.add.image(9.5, -5, 'nabi-ear-right')];
        this.ears.forEach((ear, i) => ear.setOrigin(.5, 1).setName('nabi-ear-' + i));
        this.bodyRoot.add([this.tail, this.bodyImage, ...this.ears]);
        this.add(this.bodyRoot);
        scene.add.existing(this);
        this.setScale(customerRender.scale).setDepth(2);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.once(Phaser.GameObjects.Events.DESTROY, this.cleanup, this);
    }
    settle(intimacy: number, stage: number) {
        if (this.cleaned) return;
        this.intimacy = intimacy; this.stage = stage;
        if (!this.started) { this.started = true; this.scheduleBlink(); this.scheduleEars(); }
        this.applyPose();
    }
    private get mood() {
        return this.storyEmotion === 'quiet' ? 'sad' : this.storyEmotion === 'smile' ? 'smile' : this.storyEmotion === 'shy' ? 'shy' : this.storyEmotion ? 'idle' : this.foodMood ?? (this.affection ? 'veryHappy' : 'idle');
    }
    private later(ms: number, action: () => void) {
        const timer = this.scene.time.delayedCall(ms, () => { this.timers.delete(timer); if (!this.cleaned) action(); });
        this.timers.add(timer);
        return timer;
    }
    private animate(config: Phaser.Types.Tweens.TweenBuilderConfig, done?: () => void) {
        const tween = this.scene.tweens.add({ ...config, onComplete: () => { this.animations.delete(tween); done?.(); }, onStop: () => this.animations.delete(tween) });
        this.animations.add(tween);
        return tween;
    }
    private stop(tween?: Phaser.Tweens.Tween) { if (tween) { tween.stop(); tween.remove(); this.animations.delete(tween); } }
    private stopTarget(target: Phaser.GameObjects.GameObject) { for (const tween of [...this.animations]) if (tween.hasTarget(target)) this.stop(tween); }
    private cancel(timer?: Phaser.Time.TimerEvent) { if (timer) { timer.remove(false); this.timers.delete(timer); } }
    private face() { this.bodyImage.setTexture(this.blinking || this.mood === 'smile' || this.mood === 'veryHappy' ? 'nabi-body-blink' : 'nabi-body'); }
    private applyPose() {
        if (!this.started || this.cleaned) return;
        this.stop(this.tailTween); this.stop(this.breathTween);
        const mood = this.mood, relaxed = this.stage >= 6 ? 5 : this.intimacy >= 10 || this.stage >= 2 ? 4 : 3;
        const range = mood === 'sad' ? .3 : mood === 'shy' ? 2 : mood === 'veryHappy' ? 9 : mood === 'happy' ? 6 : mood === 'smile' ? 6 : relaxed;
        const duration = mood === 'sad' ? 3000 : mood === 'veryHappy' ? 420 : mood === 'happy' ? 900 : 1800;
        this.tail.setAngle(-range);
        this.tailTween = this.animate({ targets: this.tail, angle: range, duration, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.bodyRoot.setY(mood === 'sad' ? 1 : 0).setAngle(mood === 'sad' ? -3 : mood === 'shy' ? -2 : 0);
        this.breathTween = this.animate({ targets: this.bodyRoot, y: mood === 'sad' ? .5 : -.6, duration: mood === 'sad' ? 2400 : 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.ears.forEach((ear, i) => { this.stopTarget(ear); ear.setAngle(mood === 'sad' ? (i ? 9 : -9) : 0); });
        if (this.eating) this.breathTween.pause();
        this.face();
    }
    /** Travel replaces idle; settle restarts the existing random eyes/ears afterwards. */
    walking() {
        if (this.cleaned) return;
        for (const timer of this.timers) timer.remove(false);
        this.timers.clear();
        for (const tween of [...this.animations]) this.stop(tween);
        this.clearEffects();
        this.started = false; this.eating = false; this.blinking = false;
        this.storyEmotion = undefined; this.foodMood = undefined; this.affection = false;
        this.bodyRoot.setPosition(0, 0).setAngle(0); this.ears.forEach(ear => ear.setAngle(0)); this.face();
        this.tail.setAngle(-2);
        this.tailTween = this.animate({ targets: this.tail, angle: 2, duration: 750, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    farewell(familiar: boolean, friend: boolean, quiet: boolean, sparkle = true) {
        if (this.cleaned) return;
        this.stop(this.tailTween);
        const range = quiet ? .5 : friend ? 6 : familiar ? 4 : 2;
        this.tail.setAngle(-range);
        this.tailTween = this.animate({ targets: this.tail, angle: range, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        if (familiar && !quiet) this.perkEars();
        this.bodyImage.setTexture(friend && !quiet ? 'nabi-body-blink' : 'nabi-body');
        if (friend && !quiet && sparkle) this.sparkles(1);
    }
    beginEating() { this.eating = true; this.breathTween?.pause(); }
    endEating() { this.eating = false; this.breathTween?.resume(); }
    private scheduleBlink() {
        this.later(Phaser.Math.Between(2500, 5000), () => {
            this.blinking = true; this.face();
            this.later(110, () => { this.blinking = false; this.face(); this.scheduleBlink(); });
        });
    }
    private scheduleEars() {
        this.later(Phaser.Math.Between(4000, 8000), () => {
            if (this.mood !== 'sad' && !this.eating) this.perkEars();
            this.scheduleEars();
        });
    }
    private perkEars() {
        if (this.cleaned || this.mood === 'sad') return;
        this.ears.forEach((ear, i) => {
            this.stopTarget(ear);
            ear.setAngle(0);
            this.animate({ targets: ear, angle: i ? 5 : -5, duration: 100, delay: i * 70, yoyo: true });
        });
    }
    beginStory() {
        this.cancel(this.reactionTimer); this.cancel(this.affectionTimer);
        this.foodMood = undefined; this.affection = false;
        this.clearEffects();
        this.storyEmotion = 'normal'; this.applyPose();
    }
    storyLine(line: StoryLine) {
        if (line.speaker !== 'guest' || this.cleaned) return;
        const previous = this.storyEmotion;
        this.storyEmotion = line.emotion ?? 'normal';
        this.applyPose();
        if (this.storyEmotion === 'shy' && previous !== 'shy') {
            this.perkEars();
            this.stop(this.breathTween);
            this.breathTween = this.animate({ targets: this.bodyRoot, y: -.8, duration: 110, yoyo: true }, () => this.applyPose());
        }
        if (this.storyEmotion === 'smile' && previous !== 'smile') this.sparkles(1);
        if (this.storyEmotion === 'quiet') this.clearEffects();
    }
    endStory(intimacy: number, stage: number) {
        this.storyEmotion = undefined;
        this.settle(intimacy, stage);
    }
    taste(quality: Quality, favorite: boolean, intimacy: number, stage: number) {
        if (this.cleaned || this.storyEmotion) return;
        this.intimacy = intimacy; this.stage = stage;
        this.cancel(this.reactionTimer);
        this.clearEffects();
        this.foodMood = quality === '완벽' ? 'veryHappy' : quality === '맛있음' || favorite ? 'happy' : 'normal';
        this.applyPose();
        // Small head nod or 2px lift. Child motion never competes with entrance/exit.
        this.stop(this.breathTween);
        const perfect = quality === '완벽';
        this.breathTween = this.animate({ targets: this.bodyRoot, y: perfect ? -.8 : .6, angle: perfect ? -2 : 2, duration: 150, yoyo: true, repeat: 1 }, () => { this.bodyRoot.setAngle(0); });
        if (quality !== '보통') this.sparkles(perfect ? 3 : 2);
        this.reactionTimer = this.later(perfect ? 1500 : this.foodMood === 'happy' ? 1300 : 500, () => { this.foodMood = undefined; this.applyPose(); });
    }
    affinity(intimacyGain: number, intimacy: number, stage: number) {
        if (this.cleaned || this.storyEmotion || intimacyGain <= 0) return;
        this.intimacy = intimacy; this.stage = stage;
        this.cancel(this.affectionTimer);
        this.affection = true;
        this.hearts(intimacyGain >= 3 ? 2 : 1);
        // Affection follows tasting without replaying the food's sparks or jump.
        this.affectionTimer = this.later(1100, () => { this.affection = false; if (!this.foodMood) this.applyPose(); });
    }
    private effect(texture: string, x: number, y: number, duration: number) {
        if (this.effects.size >= 5 || this.mood === 'sad') return;
        const effect = this.scene.add.image(x, y, texture).setScale(.75).setDepth(3).setName(texture);
        this.add(effect);
        this.effects.add(effect);
        this.animate({ targets: effect, y: y - 8, alpha: 0, scale: 1.05, duration, ease: 'Sine.easeOut' }, () => { this.effects.delete(effect); effect.destroy(); });
    }
    private hearts(count: number) { for (let i = 0; i < count; i++) this.effect('nabi-heart', -4 + i * 9, -28 - i * 3, 1000 + i * 100); }
    private sparkles(count: number) { const positions = [[-20, -17], [20, -21], [10, -30]]; for (let i = 0; i < count; i++) this.effect('nabi-spark', positions[i][0], positions[i][1], 650 + i * 100); }
    private clearEffects() {
        for (const effect of this.effects) { this.stopTarget(effect); effect.destroy(); }
        this.effects.clear();
    }
    /** Called before departure as well as on destroy/shutdown. Safe more than once. */
    cleanup() {
        if (this.cleaned) return;
        this.cleaned = true;
        for (const timer of this.timers) timer.remove(false);
        this.timers.clear();
        for (const tween of this.animations) { tween.stop(); tween.remove(); }
        this.animations.clear();
        this.clearEffects();
        this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    }
}
