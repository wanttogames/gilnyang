import Phaser from 'phaser';
import { customerRender, customerShadowWidth } from './CharacterArt';
import { KkamangView } from './KkamangView';
import { DubuView } from './DubuView';
import { NabiView } from './NabiView';
import { AmbientCustomerView } from './AmbientCustomerView';

/** Owns only one guest's movement/waiting. Scene phase remains the single flow state. */
export class CustomerVisit {
    static readonly seat = { x: 246, y: 733 };
    static readonly approach = { x: 224, y: 729 };
    static readonly entrance = { x: -65, y: 743 };
    private timers = new Set<Phaser.Time.TimerEvent>();
    private animations = new Set<Phaser.Tweens.Tween>();
    private effects = new Set<Phaser.GameObjects.Image>();
    private shadow: Phaser.GameObjects.Ellipse;
    private walkingTween?: Phaser.Tweens.Tween;
    private waiting = false;
    private cleaned = false;
    private departing = false;
    constructor(private scene: Phaser.Scene, private guest: Phaser.GameObjects.Image | NabiView | DubuView | KkamangView | AmbientCustomerView,
        private dog: boolean, private canWait: () => boolean,
        private seat = CustomerVisit.seat) {
        const id = guest instanceof NabiView ? 'nabi' : guest.texture.key.replace('-blink', '');
        this.shadow = scene.add.ellipse(0, 0, customerShadowWidth(id), 9, 0x101626, .28)
            .setDepth(guest.depth - .1).setName('customer-ground-shadow');
        this.syncShadow();
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        guest.once(Phaser.GameObjects.Events.DESTROY, this.cleanup, this);
    }
    private syncShadow() {
        this.shadow.setPosition(this.guest.x, this.guest.y + (customerRender.footY - customerRender.centre) * this.guest.scaleY);
    }
    private later(ms: number, action: () => void) {
        const timer = this.scene.time.delayedCall(ms, () => { this.timers.delete(timer); if (!this.cleaned && this.guest.active) action(); });
        this.timers.add(timer); return timer;
    }
    private animate(config: Phaser.Types.Tweens.TweenBuilderConfig, done?: () => void) {
        const tween = this.scene.tweens.add({ ...config, onUpdate: () => this.syncShadow(), onComplete: () => { this.animations.delete(tween); if (!this.cleaned && this.guest.active) done?.(); } });
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
        this.guest.setAngle(0).setScale(customerRender.scale);
        if (this.guest instanceof NabiView) this.guest.walking();
        if (this.guest instanceof DubuView || this.guest instanceof KkamangView) this.guest.walking();
        // Scale supplies small footsteps without competing with path x/y.
        this.walkingTween = this.animate({ targets: this.guest, scaleY: customerRender.scale - (this.guest instanceof KkamangView ? .02 : this.guest instanceof DubuView && !this.guest.quietArrival ? .07 : .04), duration: 140, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.animate({ targets: this.guest, x, y, duration, ease: 'Sine.easeInOut' }, () => {
            this.stop(this.walkingTween); this.guest.setScale(customerRender.scale); done();
        });
    }
    enter(seating: () => void, seated: () => void, ready: () => void) {
        const dubu = this.guest instanceof DubuView ? this.guest : undefined;
        const arrive = () => {
            if (dubu && !dubu.quietArrival) this.animate({ targets: dubu, x: (this.seat.x - 22), angle: -3, duration: 170 }, seat);
            else seat();
        };
        const seat = () => {
            seating();
            if (this.guest instanceof KkamangView) this.guest.arrivalLook();
            this.animate({ targets: this.guest, angle: this.guest instanceof KkamangView ? .5 : this.dog ? -2 : 1.5, duration: 120, yoyo: true });
            this.later(this.guest instanceof KkamangView ? 360 : 270, () => this.animate({ targets: this.guest, ...this.seat, scaleY: customerRender.seatedScaleY, duration: 260, ease: 'Sine.easeOut' }, () => { seated(); this.later(dubu ? 330 : 240, ready); }));
        };
        this.walk((this.seat.x - 22) + (dubu && !dubu.quietArrival ? 4 : 0), (this.seat.y - 4), dubu ? dubu.quietArrival ? 1400 : 850 : this.guest instanceof KkamangView ? this.guest.quietArrival ? 1450 : 1300 : 1150, arrive);
    }
    restoreSeat() { this.guest.setPosition(this.seat.x, this.seat.y).setAngle(0).setScale(customerRender.scale, customerRender.seatedScaleY); this.syncShadow(); }
    wait() {
        if (this.cleaned || this.departing || this.waiting) return;
        this.waiting = true;
        this.restoreSeat();
        const guest = this.guest;
        // Main story guests own their own idle animation controller.
        if (guest instanceof NabiView) return;
        if (guest instanceof DubuView || guest instanceof KkamangView) { guest.wait(); return; }
        this.animate({ targets: guest, y: this.seat.y - 1, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        const id = guest.texture.key.replace('-blink', '');
        if (guest instanceof AmbientCustomerView) {
            const tailRange: Record<string, number> = {
                ambient_kkomi: 1.5, ambient_seol: 2.2, ambient_yeon: 3,
                ambient_boksil: 2.2, ambient_bamtol: 3.5, ambient_mungchi: 6,
                ambient_haru: 1.1,
            };
            const tailDuration: Record<string, number> = {
                ambient_kkomi: 1150, ambient_seol: 1050, ambient_yeon: 900,
                ambient_boksil: 1300, ambient_bamtol: 400, ambient_mungchi: 280,
                ambient_haru: 2200,
            };
            const range = tailRange[id] ?? (this.dog ? 4 : 2.5);
            this.animate({ targets: guest.tail, angle: -range, duration: tailDuration[id] ?? (this.dog ? 360 : 1000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        } else if (id === 'mongsil') {
            this.animate({ targets: guest, angle: -1.2, duration: 850, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        } else if (id === 'kong') {
            this.animate({ targets: guest, angle: -.6, duration: 1450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
        const blink = () => this.later(Phaser.Math.Between(2500, 5000), () => {
            if (!this.canWait()) { blink(); return; }
            const key = guest.texture.key.replace('-blink', '');
            guest.setTexture(key + '-blink');
            this.later(110, () => { guest.setTexture(key); blink(); });
        });
        blink();
        const action = () => this.later(Phaser.Math.Between(4000, 8000), () => {
            if (!this.canWait()) { action(); return; }
            const moves: Record<string, Phaser.Types.Tweens.TweenBuilderConfig> = {
                ambient_kkomi: { targets: guest, x: this.seat.x - 1, y: this.seat.y + 1, angle: -1.5, duration: 310, yoyo: true },
                ambient_seol: { targets: guest, angle: .9, y: this.seat.y - 1, duration: 420, yoyo: true },
                ambient_yeon: { targets: guest, x: this.seat.x + 1, angle: 2, duration: 250, yoyo: true },
                ambient_boksil: { targets: guest, scaleX: customerRender.scale + .07, y: this.seat.y - 1, duration: 350, yoyo: true },
                ambient_bamtol: { targets: guest, angle: 1.6, x: this.seat.x + 1, duration: 190, yoyo: true, repeat: 2 },
                ambient_mungchi: { targets: guest, angle: -3, x: this.seat.x + 2, y: this.seat.y + 1, duration: 230, yoyo: true, repeat: 1 },
                ambient_haru: { targets: guest, angle: .7, y: this.seat.y + .5, duration: 520, yoyo: true },
                kong: { targets: guest, x: this.seat.x + 1, angle: 1.4, duration: 310, yoyo: true },
                mongsil: { targets: guest, y: this.seat.y - 1.5, scaleY: customerRender.seatedScaleY + .04, duration: 190, yoyo: true, repeat: 1 },
            };
            const move = moves[id] ?? { targets: guest, angle: this.dog ? -2 : 1, x: this.seat.x + (this.dog ? 0 : 1), duration: 260, yoyo: true };
            this.animate({ ...move, ease: 'Sine.easeInOut' }, action);
        });
        action();
    }
    pauseWaiting() {
        if (!this.waiting) return;
        this.waiting = false;
        this.clearActivity();
        if (this.guest instanceof DubuView || this.guest instanceof KkamangView) this.guest.pause();
        this.restoreSeat();
        if (!(this.guest instanceof NabiView)) this.guest.setTexture(this.guest.texture.key.replace('-blink', ''));
    }
    leave(intimacy: number, completeStory: boolean, quiet: boolean,
        standing: () => void, farewell: () => void, leaving: () => void, finished: () => void) {
        if (this.cleaned || this.departing) return;
        this.pauseWaiting(); this.clearActivity(); this.departing = true;
        if (this.guest instanceof NabiView) this.guest.walking();
        standing();
        this.later(160, () => this.animate({ targets: this.guest, y: (this.seat.y - 4), scaleY: customerRender.scale, duration: 260 }, () => {
            farewell();
            const familiar = intimacy >= 10, friend = intimacy >= 25;
            if (this.guest instanceof NabiView) this.guest.farewell(familiar, friend || completeStory, quiet);
            else if (this.guest instanceof DubuView) this.guest.farewell(quiet);
            else if (this.guest instanceof KkamangView) this.guest.farewell(familiar);
            else if (friend && !quiet) {
                const spark = this.scene.add.image(this.guest.x + 28, this.guest.y - 42, 'nabi-spark').setScale(1.5).setDepth(3).setName('farewell-spark');
                this.effects.add(spark);
                this.animate({ targets: spark, y: spark.y - 12, alpha: 0, duration: 650 }, () => { this.effects.delete(spark); spark.destroy(); });
            }
            this.animate({ targets: this.guest, angle: this.guest instanceof KkamangView ? familiar ? -.5 : 0 : familiar ? -2 : 2, duration: familiar ? 160 : 130, yoyo: true }, () => {
                this.later(familiar ? 160 : 80, () => {
                    leaving();
                    const exit = () => this.walk(CustomerVisit.entrance.x, CustomerVisit.entrance.y, this.guest instanceof DubuView ? (quiet ? 1100 : 700) : this.guest instanceof KkamangView ? 1100 : completeStory ? 650 : 1000, () => { this.cleanup(); finished(); });
                    if (completeStory && this.guest instanceof NabiView) {
                        this.walk(160, 735, 320, () => {
                            (this.guest as NabiView).farewell(true, true, false, false);
                            this.animate({ targets: this.guest, angle: 2, duration: 150, yoyo: true });
                            this.later(350, exit);
                        });
                    } else if (this.guest instanceof DubuView && (completeStory || familiar) && !quiet) {
                        this.walk(160, 735, 280, () => {
                            (this.guest as DubuView).farewell(false);
                            this.animate({ targets: this.guest, angle: -3, duration: 150, yoyo: true });
                            this.later(350, exit);
                        });
                    } else if (completeStory && this.guest instanceof KkamangView) {
                        this.walk(160, 735, 400, () => {
                            (this.guest as KkamangView).lookBack();
                            this.later(520, exit);
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
        this.shadow.destroy();
        this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.guest.off(Phaser.GameObjects.Events.DESTROY, this.cleanup, this);
    }
}
