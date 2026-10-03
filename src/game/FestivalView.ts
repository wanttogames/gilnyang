import type Phaser from 'phaser';
import type { SaveData } from '../types/SaveData';
export class FestivalView {
    private art?: Phaser.GameObjects.Graphics;
    private glow?: Phaser.Tweens.Tween;
    constructor(private scene: Phaser.Scene) {}
    apply(s: SaveData) {
        this.destroy();const f=s.festival;if(!f || !['celebrating','complete'].includes(f.stage))return;
        const g=this.art=this.scene.add.graphics().setDepth(1.45).setName('festival-decor');
        if(f.stage==='complete') { g.fillStyle(0xd6ac67).fillRect(602,459,3,54);g.fillStyle(0xd2957e).fillTriangle(605,462,629,473,605,485);g.fillStyle(0xf9e4b5).fillCircle(613,473,3);return; }
        g.lineStyle(2,0xb6977b).beginPath().moveTo(116,458).lineTo(360,472).lineTo(603,458).strokePath();
        for(let i=0;i<9;i++){const x=128+i*54,y=459+Math.min(i,8-i)*3;g.fillStyle(i%2?0xead397:0xc99081).fillTriangle(x,y,x+22,y+2,x+11,y+24);g.fillStyle(0xffe4a2,.14).fillCircle(x+10,y+32,18);g.fillStyle(0xffd18c).fillRect(x+5,y+26,11,14);}
        this.glow=this.scene.tweens.add({targets:g,alpha:.78,duration:1800,yoyo:true,repeat:-1});
    }
    destroy(){this.glow?.stop();this.glow?.remove();this.glow=undefined;this.art?.destroy();this.art=undefined;}
}
