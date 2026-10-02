import Phaser from 'phaser';
import { NabiView } from './NabiView';

/** Owns only one guest's movement/waiting. Scene phase remains the single flow state. */
export class CustomerVisit {
    static readonly seat = { x: 246, y: 733 };
    static readonly approach = { x: 224, y: 729 };
    static readonly entrance = { x: -65, y: 743 };
    private timers = new Set<Phaser.Time.TimerEvent>();
    private animations = new Set<Phaser.Tweens.Tween>();
    private effects = new Set<Phaser.GameObjects.Image>();
    private walkingTween?: Phaser.Tweens.Tween;
    private waiting = false;
    private cleaned = false;
    private departing = false;
    constructor(private scene: Phaser.Scene, private guest: Phaser.GameObjects.Image | NabiView,
        private dog: boolean, private canWait: () => boolean) {
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        guest.once(Phaser.GameObjects.Events.DESTROY, this.cleanup, this);
    }
    private later(ms: number, action: () => void) {
        const timer = this.scene.time.delayedCall(ms, () => { this.timers.delete(timer); if (!this.cleaned && this.guest.active) action(); });
        this.timers.add(timer); return timer;
    }
    private animate(config: Phaser.Types.Tweens.TweenBuilderConfig, done?: () => void) {
        const tween = this.scene.tweens.add({ ...config, onComplete: () => { this.animations.delete(tween); if (!this.cleaned && this.guest.active) done?.(); } });
        this.animations.add(tween); return tween;
    }
    private stop(tween?: Phaser.Tweens.Tween) {
        if (!tween) return;
        tween.stop(); tween.remove(); this.animations.delete(tween);
    }
    private clearActivity() {
        for (const timer of this.timers) timer.remove(false);
        for (const tween of this.animations) { tween.stop(); tween.remove(); }
        for (const effect of this.effects) effect.destroy();
        this.timers.clear(); this.animations.clear(); this.effects.clear();
    }
    private walk(x: number, y: number, duration: number, done: () => void) {
        this.guest.setAngle(0).setScale(2.5);
        if (this.guest instanceof NabiView) this.guest.walking();
        // Scale supplies small footsteps without competing with path x/y.
        this.walkingTween = this.animate({ targets: this.guest, scaleY: 2.46, duration: 140, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.animate({ targets: this.guest, x, y, duration, ease: 'Sine.easeInOut' }, () => {
            this.stop(this.walkingTween); this.guest.setScale(2.5); done();
        });
    }
    enter(seating: () => void, seated: () => void, ready: () => void) {
        this.walk(CustomerVisit.approach.x, CustomerVisit.approach.y, 1150, () => {
            seating();
            this.animate({ targets: this.guest, angle: this.dog ? -2 : 1.5, duration: 120, yoyo: true });
            this.later(270, () => this.animate({ targets: this.guest, ...CustomerVisit.seat, scaleY: 2.42, duration: 260, ease: 'Sine.easeOut' }, () => { seated(); this.later(240, ready); }));
        });
    }
    restoreSeat() { this.guest.setPosition(CustomerVisit.seat.x, CustomerVisit.seat.y).setAngle(0).setScale(2.5, 2.42); }
    wait() {
        if (this.cleaned || this.departing || this.waiting) return;
        this.waiting = true;
        this.restoreSeat();
        // Nabi already owns random eyes/ears/tail; do not add a second idle timer.
        if (this.guest instanceof NabiView) return;
        this.animate({ targets: this.guest, y: CustomerVisit.seat.y - 1, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        const blink = () => this.later(Phaser.Math.Between(2500, 5000), () => {
            if (!this.canWait()) { blink(); return; }
            const image = this.guest as Phaser.GameObjects.Image, key = image.texture.key.replace('-blink', '');
            image.setTexture(key + '-blink');
            this.later(110, () => { image.setTexture(key); blink(); });
        });
        blink();
        const action = () => this.later(Phaser.Math.Between(4000, 8000), () => {
            if (!this.canWait()) { action(); return; }
            // Dogs tilt towards the kitchen; cats give the table a tiny sniff.
            this.animate({ targets: this.guest, angle: this.dog ? -2 : 1, x: CustomerVisit.seat.x + (this.dog ? 0 : 1), duration: 220, yoyo: true }, action);
        });
        action();
    }
    pauseWaiting() {
        if (!this.waiting) return;
        this.waiting = false;
        this.clearActivity();
        this.restoreSeat();
        if (!(this.guest instanceof NabiView)) this.guest.setTexture(this.guest.texture.key.replace('-blink', ''));
    }
    leave(intimacy: number, completeStory: boolean, quiet: boolean,
        standing: () => void, farewell: () => void, leaving: () => void, finished: () => void) {
        if (this.cleaned || this.departing) return;
        this.pauseWaiting(); this.clearActivity(); this.departing = true;
        if (this.guest instanceof NabiView) this.guest.walking();
        standing();
        this.later(160, () => this.animate({ targets: this.guest, y: CustomerVisit.approach.y, scaleY: 2.5, duration: 260 }, () => {
            farewell();
            const familiar = intimacy >= 10, friend = intimacy >= 25;
            if (this.guest instanceof NabiView) this.guest.farewell(familiar, friend || completeStory, quiet);
            else if (friend && !quiet) {
                const spark = this.scene.add.image(this.guest.x + 28, this.guest.y - 42, 'nabi-spark').setScale(1.5).setDepth(3).setName('farewell-spark');
                this.effects.add(spark);
                this.animate({ targets: spark, y: spark.y - 12, alpha: 0, duration: 650 }, () => { this.effects.delete(spark); spark.destroy(); });
            }
            this.animate({ targets: this.guest, angle: familiar ? -2 : 2, duration: familiar ? 160 : 130, yoyo: true }, () => {
                this.later(familiar ? 160 : 80, () => {
                    leaving();
                    const exit = () => this.walk(CustomerVisit.entrance.x, CustomerVisit.entrance.y, completeStory ? 650 : 1000, () => { this.cleanup(); finished(); });
                    if (completeStory && this.guest instanceof NabiView) {
                        this.walk(160, 735, 320, () => {
                            (this.guest as NabiView).farewell(true, true, false, false);
                            this.animate({ targets: this.guest, angle: 2, duration: 150, yoyo: true });
                            this.later(350, exit);
                        });
                    } else exit();
                });
            });
        }));
    }
    cleanup() {
        if (this.cleaned) return;
        this.cleaned = true; this.waiting = false;
        this.clearActivity();
        this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.guest.off(Phaser.GameObjects.Events.DESTROY, this.cleanup, this);
    }
}
