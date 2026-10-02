import Phaser from 'phaser';
import type { AlleyEvent, AlleyEventChoice } from '../types/AlleyEvent';
import { $, panel, on } from '../ui/UI';
import { audio } from '../systems/AudioManager';
/** Temporary visual layer and the existing restaurant panel, with one guarded choice. */
export class AlleyEventView {
    private timers = new Set<Phaser.Time.TimerEvent>();
    private tweens = new Set<Phaser.Tweens.Tween>();
    private objects = new Set<Phaser.GameObjects.GameObject>();
    private releaseSign?: () => void;
    private phase: 'prompt' | 'animating' | 'result' | 'closed' = 'prompt';
    private cleaned=false;
    constructor(private scene: Phaser.Scene, private event: AlleyEvent,
        private resolve: (choiceId: string) => AlleyEventChoice | undefined,
        private finished: () => void, savedChoice?: string, private holdSign?: () => () => void) {
        $('panel').classList.add('alley-event-panel');
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN,this.cleanup,this);
        if (savedChoice) { this.choose(savedChoice); return; }
        panel(`<div class="eyebrow">골목의 작은 사건</div><h2>${event.title}</h2><p class="alley-description">${event.description}</p><div class="alley-choices">${event.choices ? event.choices.map(c=>`<button id="alley-${c.id}" class="primary">${c.label}</button>`).join('') : '<button id="alley-observe" class="primary">잠깐 바라보기 →</button>'}</div>`);
        if (event.choices) event.choices.forEach(c=>on('alley-'+c.id,()=>this.choose(c.id)));
        else { on('alley-observe',()=>this.choose('observe')); this.later(1200,()=>this.choose('observe')); }
        const marker=this.own(scene.add.text(88,672,event.visual==='blackout' ? '…' : event.type==='TROUBLE' ? '!' : '…',{fontFamily:'Alley Sans',fontSize:'26px',color:'#e5c6a1'}).setOrigin(.5).setName('alley-marker'));
        this.animate({targets:marker,alpha:.35,duration:700,yoyo:true,repeat:-1});
    }
    private own<T extends Phaser.GameObjects.GameObject>(object:T): T {
        (object as unknown as Phaser.GameObjects.Components.Depth).setDepth(4);
        this.objects.add(object); return object;
    }
    private later(ms:number,fn:()=>void) {
        const timer=this.scene.time.delayedCall(ms,()=>{this.timers.delete(timer);if(!this.cleaned)fn();});this.timers.add(timer);return timer;
    }
    private animate(config:Phaser.Types.Tweens.TweenBuilderConfig) {
        const tween=this.scene.tweens.add({...config,onUpdate:()=>{
            const targets=Array.isArray(config.targets)?config.targets:[config.targets];
            for(const target of targets){const image=target as Phaser.GameObjects.Image;const shadow=image?.getData?.('alley-shadow') as Phaser.GameObjects.Ellipse | undefined;if(shadow?.active)shadow.setPosition(image.x,image.y+23*image.scaleY).setAlpha(.3*image.alpha);}
        },onComplete:()=>this.tweens.delete(tween)});this.tweens.add(tween);return tween;
    }
    private actor(id:string,x=88,y=717,scale=1.8) {
        const shadow=this.own(this.scene.add.ellipse(x,y+23*scale,38,7,0x101626,.3).setName('alley-shadow'));
        return this.own(this.scene.add.image(x,y,id).setScale(scale).setName('alley-actor')).setData('alley-shadow',shadow);
    }
    private choose(id:string) {
        if(this.cleaned || this.phase!=='prompt')return;
        const choice=this.resolve(id);if(!choice)return;
        this.phase='animating';
        $('panel').querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=true);
        for(const timer of this.timers)timer.remove(false);this.timers.clear();
        panel(`<div class="eyebrow">골목의 작은 사건</div><h2>${this.event.title}</h2><p class="alley-description">${this.event.description}</p><p class="muted">잠깐, 골목에 귀를 기울여요.</p><div class="waiting"><i></i><i></i><i></i></div>`);
        audio.note(this.event.visual==='tin'?146:196,.15,.02);
        this.draw(choice.id);
        this.later(this.event.visual==='blackout'?4600:2800,()=>{
            this.phase='result';
            panel(`<div class="eyebrow">골목의 작은 사건 · 한 장면</div><h2>${this.event.title}</h2><p class="alley-result">${choice.resultText}</p>${choice.gold?`<p class="alley-gift">작은 감사 · +${choice.gold} G</p>`:''}<button id="alley-return" class="primary">식당으로 돌아가기 →</button>`);
            on('alley-return',()=>{if(this.phase!=='result')return;this.phase='closed';this.cleanup();this.finished();});
        });
    }
    private draw(choice:string) {
        const scene=this.scene, visual=this.event.visual;
        if(visual==='blackout') {
            const dark=this.own(scene.add.rectangle(360,450,720,900,0x101725,0).setName('alley-blackout'));
            const glow=this.own(scene.add.ellipse(185,494,88,104,0xffd18a,0).setName('alley-last-light')).setDepth(5);
            const lamp=this.own(scene.add.rectangle(185,494,28,36,0xeabb7e,0)).setDepth(5);
            this.animate({targets:dark,alpha:.78,duration:650});
            this.animate({targets:[glow,lamp],alpha:.5,duration:700});
            this.later(2600,()=>{this.animate({targets:dark,alpha:0,duration:1500});this.animate({targets:[glow,lamp],alpha:0,duration:1500});});
        } else if(visual==='sign') {
            const sign=scene.children.getByName('restaurant-sign') as Phaser.GameObjects.Container;
            this.releaseSign=this.holdSign?.();
            this.animate({targets:sign,angle:choice==='fix'?1.6:3,duration:350,yoyo:true,repeat:choice==='fix'?1:3});
            if(choice==='fix')this.later(1600,()=>this.animate({targets:sign,angle:0,duration:600}));
        } else if(visual==='tin') {
            const tin=this.own(scene.add.rectangle(58,737,24,31,0x98a3a6).setStrokeStyle(3,0x5a6574).setName('alley-tin'));
            this.animate({targets:tin,x:108,angle:35,duration:1600,ease:'Sine.easeOut'});
            if(choice==='look')this.own(scene.add.image(126,755,'dubu-item-cap').setScale(1.8));
        } else if(visual==='kitten') {
            const kitten=this.actor('ambient_kkomi');
            if(choice==='towel') {
                const towel=this.own(scene.add.rectangle(90,745,32,17,0xdac6ab).setStrokeStyle(2,0xb5a68b));
                this.animate({targets:kitten,angle:-2,duration:350,yoyo:true,repeat:2});
                this.animate({targets:towel,y:740,duration:400,yoyo:true});
            } else this.animate({targets:kitten,x:145,y:705,duration:1400});
        } else if(visual==='dig') {
            const dubu=this.actor('dubu');
            this.animate({targets:dubu,angle:3,y:720,duration:200,yoyo:true,repeat:4});
            for(let i=0;i<3;i++){
                const dirt=this.own(scene.add.rectangle(100+i*6,755,3,3,0xac9373));
                this.animate({targets:dirt,y:746,x:95+i*10,alpha:0,duration:450,delay:i*160});
            }
            if(choice==='help')this.later(1300,()=>this.own(scene.add.image(107,749,'dubu-item-cap').setScale(2)));
            else this.later(1300,()=>this.animate({targets:dubu,x:155,duration:1300}));
        } else if(visual==='watch') {
            const cat=this.actor('kkamang',636,716);
            this.own(scene.add.rectangle(633,370,74,220,0x7d8b9b,.09));
            this.later(1000,()=>this.animate({targets:cat,x:705,alpha:0,duration:1700}));
        } else if(visual==='wait') {
            const nabi=this.actor('nabi');nabi.setAngle(-1);
            this.later(1100,()=>{nabi.setTexture('nabi-blink');this.later(130,()=>nabi.setTexture('nabi'));});
            this.later(1900,()=>this.animate({targets:nabi,x:44,alpha:.5,duration:800}));
        } else if(visual==='menu') {
            const board=this.own(scene.add.rectangle(164,710,28,36,0xead4b0).setStrokeStyle(2,0x8b6851));
            this.animate({targets:board,x:80,y:724,angle:45,duration:900});
            if(choice==='stay')this.later(1100,()=>{
                const dog=this.actor('ambient_mungchi',-40,713);
                const carried=this.own(scene.add.rectangle(-25,738,25,32,0xead4b0));
                this.animate({targets:dog,x:90,duration:1200});this.animate({targets:carried,x:105,duration:1200});board.setVisible(false);
            });
        } else if(visual==='cats') {
            const a=this.actor('ambient_seol',75,314,1.25),b=this.actor('ambient_yeon',136,314,1.25);
            this.later(1100,()=>{a.setTexture('ambient_seol-blink');this.animate({targets:a,angle:-3,duration:200,yoyo:true});});
            this.later(1700,()=>this.animate({targets:b,x:194,alpha:0,duration:900}));
        } else {
            const parcel=this.own(scene.add.rectangle(98,737,27,24,0xe5d8b6).setStrokeStyle(2,0x968166));
            this.own(scene.add.rectangle(98,737,4,24,0xaebd9b));
            this.animate({targets:parcel,y:733,duration:750,yoyo:true});
        }
    }
    cleanup() {
        if(this.cleaned)return;this.cleaned=true;
        for(const timer of this.timers)timer.remove(false);
        for(const tween of this.tweens){tween.stop();tween.remove();}
        for(const object of this.objects)object.destroy();
        this.timers.clear();this.tweens.clear();this.objects.clear();
        this.releaseSign?.();this.releaseSign=undefined;
        if($('panel').classList.contains('alley-event-panel')) { panel(''); $('panel').classList.remove('alley-event-panel'); }
        this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN,this.cleanup,this);
    }
}
