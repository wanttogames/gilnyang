import type Phaser from 'phaser';
import { DecorationManager as M } from '../systems/DecorationManager';
import { cssColor } from '../data/decorations';
import type { SaveData } from '../types/SaveData';
/** Repaint existing animated parts; rebuild only one owned overlay. */
export class RestaurantDecorView {
    private overlay?: Phaser.GameObjects.Graphics;
    constructor(private scene: Phaser.Scene, private awning: Phaser.GameObjects.Graphics, private board: Phaser.GameObjects.Graphics, private title: Phaser.GameObjects.Text, private lamps: Phaser.GameObjects.Rectangle[]) {}
    apply(s: SaveData) {
        this.overlay?.destroy();
        const g = this.overlay = this.scene.add.graphics().setDepth(1.4).setName('restaurant-decor-overlay');
        const awning = M.style(s,'awning'), lamp = M.style(s,'lamp'), seat = M.style(s,'seat'), sign = M.style(s,'sign');
        this.awning.clear();
        for (let i=0;i<10;i++) {
            this.awning.fillStyle(awning.colors[i%2]).fillRect(-235+i*47,0,47,44);
            this.awning.fillStyle(awning.colors[i%2],.85).fillRect(-235+i*47,44,47,10);
            if (awning.id==='awning-night') this.awning.fillStyle(0xf0ddb0).fillRect(-214+i*47,14,5,5).fillRect(-212+i*47,12,1,9);
        }
        this.lamps.forEach((l,i) => {
            l.setFillStyle(lamp.id==='lamp-basic' && s.upgrades.lamp ? 0xffd69a : lamp.colors[0]);
            if (lamp.id==='lamp-basic') return;
            const x=i===0?185:540;
            g.fillStyle(lamp.colors[1]).fillRect(x-20,472,40,5).fillRect(x-20,514,40,6);
            if(lamp.id==='lamp-moon') { g.fillStyle(0xffe8b5).fillCircle(x,492,8); g.fillStyle(lamp.colors[0]).fillCircle(x+4,489,7); }
            else { g.fillStyle(0xffead3); for(const [dx,dy] of [[-4,0],[4,0],[0,-4],[0,4]])g.fillCircle(x+dx,493+dy,4); g.fillStyle(0xd7a36e).fillCircle(x,493,3); }
        });
        this.board.clear().fillStyle(sign.colors[1]).fillRect(-92,-28,184,59).fillStyle(sign.colors[0]).fillRect(-86,-22,172,47);
        if(sign.id==='sign-paw') {
            this.board.fillStyle(sign.colors[1]);
            for(const x of [-72,72]) { this.board.fillCircle(x,5,5); for(const dx of [-6,0,6])this.board.fillCircle(x+dx,-3,2); }
        }
        this.title.setFontSize(sign.id==='sign-basic' ? (s.upgrades.sign ? 22 : 26) : 22).setText(sign.id==='sign-basic' && s.upgrades.sign ? '길냥이 식당 · 夜' : '길냥이 식당').setColor(sign.id==='sign-basic' ? '#654439' : cssColor(sign.colors[1]));
        for(const x of [240,520]) {
            if(seat.id==='seat-basic') { if(s.upgrades.chair)g.fillStyle(0xb16f66).fillRect(x-29,738,58,8); continue; }
            g.fillStyle(seat.colors[0]).fillRect(x-30,733,60,13).fillStyle(seat.colors[1]);
            if(seat.id==='seat-flower') for(const dx of [-16,0,16])g.fillCircle(x+dx,738,3);
            else for(let dx=-24;dx<25;dx+=8)g.fillRect(x+dx,737,4,2);
        }
    }
    destroy() { this.overlay?.destroy(); this.overlay=undefined; }
}
