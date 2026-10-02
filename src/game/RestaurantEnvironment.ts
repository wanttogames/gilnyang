import Phaser from 'phaser';
import type { Weather } from '../types/Weather';

/** Small owned scene effects; no update loop or particle emitter. */
export class RestaurantEnvironment {
    private timers = new Set<Phaser.Time.TimerEvent>();
    private animations = new Set<Phaser.Tweens.Tween>();
    private effects = new Set<Phaser.GameObjects.Shape>();
    private rainEffects = new Set<Phaser.GameObjects.Shape>();
    private rainTimer?: Phaser.Time.TimerEvent;
    private weather: Weather = 'clear';
    private cleaned = false;
    constructor(private scene: Phaser.Scene, awning: Phaser.GameObjects.Graphics,
        sign: Phaser.GameObjects.Container, lamps: Phaser.GameObjects.Rectangle[]) {
        this.animate({ targets: awning, x: { from: 360, to: 361 }, angle: .3, duration: 3700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        lamps.forEach((lamp, i) => this.animate({ targets: lamp, alpha: .94, duration: 2800 + i * 550, delay: i * 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }));
        const sway = () => this.later(Phaser.Math.Between(5000, 9000), () => {
            this.animate({ targets: sign, angle: .8, duration: 650, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' }, sway);
        });
        sway();
        this.repeat(800, 1600, () => this.bubbles());
        this.repeat(1000, 1800, () => this.steam());
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    }
    private later(ms: number, action: () => void) {
        const timer = this.scene.time.delayedCall(ms, () => { this.timers.delete(timer); if (!this.cleaned) action(); });
        this.timers.add(timer); return timer;
    }
    private repeat(min: number, max: number, action: () => void) {
        const tick = () => this.later(Phaser.Math.Between(min, max), () => { action(); tick(); });
        tick();
    }
    private animate(config: Phaser.Types.Tweens.TweenBuilderConfig, done?: () => void) {
        const tween = this.scene.tweens.add({ ...config, onComplete: () => { this.animations.delete(tween); if (!this.cleaned) done?.(); } });
        this.animations.add(tween); return tween;
    }
    private effect(shape: Phaser.GameObjects.Shape, config: Omit<Phaser.Types.Tweens.TweenBuilderConfig, 'targets'>, rain = false) {
        if (this.effects.size >= 12) { shape.destroy(); return; }
        shape.setDepth(rain ? 1.1 : 1.5).setName(rain ? 'rain-environment' : 'pot-effect');
        this.effects.add(shape); if (rain) this.rainEffects.add(shape);
        this.animate({ ...config, targets: shape }, () => { this.effects.delete(shape); this.rainEffects.delete(shape); shape.destroy(); });
    }
    private bubbles() {
        for (let i = 0; i < 2; i++) {
            const bubble = this.scene.add.rectangle(Phaser.Math.Between(495, 538), 574, 3, 3, 0xffd89e, .65);
            this.effect(bubble, { y: 568, alpha: 0, scale: 1.4, duration: 550 + i * 120 });
        }
    }
    private steam() {
        const x = Phaser.Math.Between(495, 538);
        const steam = this.scene.add.rectangle(x, 567, 3, 8, 0xfbe5bf, this.weather === 'rain' ? .48 : .3);
        this.effect(steam, { y: 532, x: x + Phaser.Math.Between(-5, 5), alpha: 0, scaleY: 1.3, duration: 1300 });
    }
    setWeather(weather: Weather) {
        if (this.cleaned || this.weather === weather) return;
        this.weather = weather;
        if (this.rainTimer) { this.rainTimer.remove(false); this.timers.delete(this.rainTimer); }
        for (const effect of this.rainEffects) {
            for (const tween of [...this.animations]) if (tween.hasTarget(effect)) { tween.stop(); tween.remove(); this.animations.delete(tween); }
            this.effects.delete(effect); effect.destroy();
        }
        this.rainEffects.clear();
        if (weather !== 'rain') return;
        const rain = () => {
            this.rainTimer = this.later(Phaser.Math.Between(1100, 1900), () => {
                const x = Phaser.Math.Between(0, 1) ? 129 : 591;
                this.effect(this.scene.add.rectangle(x, 463, 2, 5, 0xb6ccdd, .5), { y: 540, alpha: 0, duration: 700 }, true);
                // Only ground outside the seating/table area and below weather shelter.
                const rx = Phaser.Math.Between(0, 1) ? Phaser.Math.Between(40, 120) : Phaser.Math.Between(610, 680);
                const ripple = this.scene.add.ellipse(rx, Phaser.Math.Between(803, 829), 22, 5).setStrokeStyle(1, 0xc9c1b5, .45).setScale(.4);
                this.effect(ripple, { scale: 1.2, alpha: 0, duration: 800 }, true);
                rain();
            });
        };
        rain();
    }
    cleanup() {
        if (this.cleaned) return;
        this.cleaned = true;
        for (const timer of this.timers) timer.remove(false);
        for (const tween of this.animations) { tween.stop(); tween.remove(); }
        for (const effect of this.effects) effect.destroy();
        this.timers.clear(); this.animations.clear(); this.effects.clear(); this.rainEffects.clear();
        this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    }
}
