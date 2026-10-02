import { ambientPixels } from '../game/AmbientArt';
import { ambientById } from '../data/ambientCustomers';
import Phaser from 'phaser';
import { characterPixels, dubuPart, kkamangPart, drawPixels, hasCharacterArt, nabiEar, nabiTail, nabiTailLayout } from '../game/CharacterArt';
import { allCustomers } from '../data/customers';
export class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }
    create() {
        for (const c of [{ id: 'chef', color: 0xd6c6b6, accent: 0x918275, dog: false }, ...allCustomers]) {
            const ambient = ambientById(c.id);
            if (ambient) {
                for (const blink of [false, true]) {
                    const g = this.make.graphics({x:0,y:0});
                    drawPixels(g, ambientPixels(ambient, blink));
                    g.generateTexture(c.id + (blink ? '-blink' : ''),48,48); g.destroy();
                }
                continue;
            }
            if (hasCharacterArt(c.id)) {
                for (const layer of c.id === 'nabi' || c.id === 'dubu' || c.id === 'kkamang' ? ['', '-body'] : ['']) {
                    for (const blink of [false, true]) {
                        const g = this.make.graphics({ x: 0, y: 0 });
                        drawPixels(g, characterPixels(c.id, blink, layer === '-body'));
                        g.generateTexture(c.id + layer + (blink ? '-blink' : ''), 48, 48);
                        g.destroy();
                    }
                }
                continue;
            }
            for (const layer of c.id === 'nabi' || c.id === 'dubu' || c.id === 'kkamang' ? ['', '-body'] : ['']) {
                for (const blink of [false, true]) {
                    const g = this.make.graphics({ x: 0, y: 0 });
                    const rect = (x: number, y: number, w: number, h: number, color: number) => { g.fillStyle(color); g.fillRect(x, y, w, h); };
                    rect(9, 13, 29, 23, c.color);
                    rect(12, 33, 23, 11, c.color);
                    rect(6, 36, 6, 5, c.accent);
                    rect(13, 43, 8, 4, c.accent);
                    rect(28, 43, 8, 4, c.accent);
                    if (c.dog) {
                        rect(5, 10, 9, 20, c.accent);
                        rect(35, 10, 9, 20, c.accent);
                        rect(14, 26, 20, 11, 0xf6dfb7);
                    }
                    else {
                        if (layer !== '-body') {
                            rect(9, 4, 11, 15, c.color);
                            rect(28, 4, 10, 15, c.color);
                            rect(12, 7, 5, 8, 0xd38f89);
                            rect(30, 7, 5, 8, 0xd38f89);
                        }
                        rect(11, 16, 6, 4, c.accent);
                        rect(30, 16, 6, 4, c.accent);
                    }
                    rect(16, 23, 3, blink ? 1 : 4, 0x282534);
                    rect(29, 23, 3, blink ? 1 : 4, 0x282534);
                    rect(22, 29, 5, 3, 0xae776f);
                    rect(14, 29, 4, 2, 0xe7a493);
                    rect(31, 29, 4, 2, 0xe7a493);
                    if (c.id === 'chef') {
                        rect(12, 34, 24, 10, 0xb76458);
                        rect(20, 34, 7, 9, 0xf4dfb9);
                        rect(13, 4, 23, 6, 0xf4dfb9);
                        rect(17, 0, 15, 7, 0xf4dfb9);
                    }
                    g.generateTexture(c.id + layer + (blink ? '-blink' : ''), 48, 48);
                    g.destroy();
                }
            }
        }
        for (const part of ['tail-base', 'tail-tip', 'ear-left', 'ear-right'] as const) {
            const g = this.make.graphics({ x: 0, y: 0 });
            drawPixels(g, kkamangPart(part));
            g.generateTexture('kkamang-' + part, 48, 48); g.destroy();
        }
        for (const part of ['tail', 'ears'] as const) {
            const g = this.make.graphics({ x: 0, y: 0 });
            drawPixels(g, dubuPart(part));
            g.generateTexture('dubu-' + part, 48, 48); g.destroy();
        }
        for (const item of ['button', 'cap', 'stone']) {
            const g = this.make.graphics({ x: 0, y: 0 });
            const colour = item === 'button' ? 0xc7a278 : item === 'cap' ? 0x87a6ad : 0xb3a9cb;
            g.fillStyle(colour).fillRect(2, 0, 5, 2).fillRect(0, 2, 9, 5).fillRect(2, 7, 5, 2);
            g.fillStyle(0x655e71);
            if (item === 'button') g.fillRect(3, 3, 1, 1).fillRect(5, 5, 1, 1);
            else if (item === 'cap') g.fillRect(2, 2, 5, 1).fillRect(2, 6, 5, 1);
            else g.fillStyle(0xded7ec).fillRect(2, 2, 3, 2);
            g.generateTexture('dubu-item-' + item, 9, 9); g.destroy();
        }
        for (const right of [false, true]) {
            const ear = this.make.graphics({ x: 0, y: 0 });
            drawPixels(ear, nabiEar(right));
            ear.generateTexture(right ? 'nabi-ear-right' : 'nabi-ear', 11, 15);
            ear.destroy();
        }
        const tail = this.make.graphics({ x: 0, y: 0 });
        drawPixels(tail, nabiTail);
        tail.generateTexture('nabi-tail', nabiTailLayout.width, nabiTailLayout.height);
        tail.destroy();
        const heart = this.make.graphics({ x: 0, y: 0 });
        heart.fillStyle(0xce8e83).fillRect(1, 0, 3, 2).fillRect(6, 0, 3, 2).fillRect(0, 2, 10, 3).fillRect(1, 5, 8, 2).fillRect(3, 7, 4, 2).fillRect(4, 9, 2, 1);
        heart.generateTexture('nabi-heart', 10, 10);
        heart.destroy();
        const spark = this.make.graphics({ x: 0, y: 0 });
        spark.fillStyle(0xf3cf8d).fillRect(3, 0, 2, 8).fillRect(0, 3, 8, 2);
        spark.generateTexture('nabi-spark', 8, 8);
        spark.destroy();
        // Tiny food textures, replaceable with artwork without changing serving logic.
        for (const id of ['rice', 'oden', 'milk', 'ramen', 'ramen-two-eggs', 'bread']) {
            const g = this.make.graphics({ x: 0, y: 0 });
            const rect = (x: number, y: number, w: number, h: number, color: number) => { g.fillStyle(color).fillRect(x, y, w, h); };
            if (id === 'rice') {
                rect(7, 1, 6, 3, 0xf5e6c5); rect(4, 4, 12, 4, 0xf5e6c5); rect(2, 8, 16, 7, 0xf5e6c5); rect(7, 10, 6, 5, 0x496350);
            } else if (id === 'milk') {
                rect(4, 3, 11, 12, 0xe8d8b8); rect(6, 3, 7, 3, 0xf9edcf); rect(15, 6, 3, 6, 0xe8d8b8);
            } else if (id === 'bread') {
                rect(3, 5, 12, 7, 0xdca265); rect(1, 7, 3, 3, 0xdca265); rect(15, 3, 4, 11, 0xdca265); rect(5, 6, 2, 2, 0x775443);
            } else {
                rect(1, 7, 18, 3, 0xf0d9ad); rect(3, 10, 14, 5, 0xb87654); rect(3, 7, 14, 2, 0xc79454);
                if (id === 'oden') { rect(4, 4, 4, 5, 0xe1b36c); rect(10, 3, 5, 5, 0xe6c68b); }
                else { rect(5, 5, 10, 3, 0xefc988); rect(11, 4, 4, 4, 0xf2e1b7); rect(12, 5, 2, 2, 0xe3b452); }
            }
            if (id === 'ramen-two-eggs') {
                rect(4, 4, 5, 4, 0xf2e1b7); rect(5, 5, 2, 2, 0xe3b452);
                rect(11, 4, 5, 4, 0xf2e1b7); rect(12, 5, 2, 2, 0xe3b452);
            }
            g.generateTexture('meal-' + id, 20, 16); g.destroy();
        }
        this.scene.start('Title');
    }
}
