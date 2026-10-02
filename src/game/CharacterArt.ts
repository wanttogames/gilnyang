/** Integer pixel rectangles shared by Phaser textures and matching book portraits. */
type Pixel = [number, number, number, number, number];
const white = 0xf7edda, orange = 0xda9152, ink = 0x36333c, pink = 0xd59a93;
const cream = 0xf4dfbc, tan = 0xc68b5d, brown = 0x694635;
export function nabiEar(right = false): Pixel[] {
    const fur = right ? ink : orange;
    return [[3,0,3,2,fur],[2,2,5,3,fur],[1,5,8,4,fur],[0,9,11,6,fur],
        [3,5,3,3,pink],[3,8,5,4,pink]];
}
export const nabiTail: Pixel[] = [[3,0,3,5,ink],[1,3,4,7,ink],[0,8,4,9,white],
    [1,15,4,5,orange],[2,19,5,5,orange]];
const move = (pixels: Pixel[], x: number, y: number): Pixel[] => pixels.map(([px,py,w,h,c]) => [px+x,py+y,w,h,c]);
export type RefinedCharacterId = 'nabi' | 'dubu' | 'kong' | 'kkamang' | 'mongsil';
export function hasCharacterArt(id: string): id is RefinedCharacterId {
    return ['nabi', 'dubu', 'kong', 'kkamang', 'mongsil'].includes(id);
}
export function characterPixels(id: RefinedCharacterId, blink = false, bodyOnly = false): Pixel[] {
    if (id === 'kong') {
        const fur = 0xa49b89, stripe = 0x55524e, light = 0xe1d5bb, shade = 0x837b6e;
        return [
            // Upright ringed tail and a stockier street-cat stance.
            [38,20,4,4,stripe],[39,24,5,17,fur],[36,39,7,5,fur],
            [39,25,5,3,stripe],[39,32,5,3,stripe],[37,40,6,3,stripe],
            [11,30,25,14,fur],[10,43,10,4,light],[27,43,10,4,light],
            [10,34,8,3,stripe],[29,37,7,3,stripe],[12,40,6,3,stripe],
            [10,5,3,3,stripe],[9,8,7,5,fur],[8,13,11,8,fur],
            [32,5,3,3,stripe],[29,8,7,5,fur],[28,13,11,8,fur],
            [11,11,3,5,pink],[32,11,3,5,pink],
            [12,15,23,5,fur],[8,20,31,10,fur],[11,30,25,4,fur],
            // Three bold forehead strokes make an M; sparse cheek/body bars.
            [15,16,3,6,stripe],[18,20,3,3,stripe],[21,17,3,5,stripe],
            [24,20,3,3,stripe],[27,16,3,6,stripe],
            [8,24,5,2,stripe],[34,24,5,2,stripe],[10,29,4,2,shade],[33,29,4,2,shade],
            [15,24,3,blink?1:4,ink],[29,24,3,blink?1:4,ink],
            [18,29,11,5,light],[22,29,3,2,brown],[23,31,1,2,brown],
            [21,33,5,1,brown],[19,35,9,6,light]
        ];
    }
    if (id === 'kkamang') {
        const fur = 0x363d4d, shadow = 0x222735, rim = 0x606b7a, gold = 0xe4c66c;
        return [
            // Close, slender hooked tail; lower head and a long narrow torso.
            [35,22,3,3,rim],[37,24,3,19,fur],[33,42,7,3,fur],[39,28,1,13,rim],
            [15,30,17,15,fur],[14,44,7,3,rim],[26,44,7,3,rim],
            [15,34,3,9,shadow],[30,33,2,10,shadow],[18,35,2,8,rim],
            [11,2,2,4,rim],[10,6,5,5,fur],[9,11,10,10,fur],
            [33,2,2,4,rim],[31,6,5,5,fur],[28,11,10,10,fur],
            [12,10,3,6,shadow],[32,10,3,6,shadow],
            [13,18,22,3,rim],[10,21,28,8,fur],[13,29,22,4,fur],[17,33,14,2,fur],
            [10,23,2,6,rim],[36,23,2,6,shadow],[14,31,4,2,rim],
            [15,24,5,blink?1:3,gold],[28,24,5,blink?1:3,gold],
            [17,24,1,blink?0:3,shadow],[30,24,1,blink?0:3,shadow],
            [22,29,3,2,rim],[23,32,2,1,shadow]
        ];
    }
    if (id === 'mongsil') {
        const fur = 0xe8bd83, light = 0xf7e6c6, shade = 0xc79b6c;
        return [
            // An oversized plume curls over the back, rather than a thin ring.
            [35,20,7,3,light],[32,23,13,5,light],[34,28,13,8,light],
            [36,36,9,4,fur],[33,25,4,7,shade],[41,29,6,5,fur],
            // Stepped tufts build a round ruff and rounded body.
            [13,28,22,3,fur],[9,31,29,5,fur],[7,36,32,5,fur],
            [10,41,27,3,fur],[14,44,8,3,light],[26,44,8,3,light],
            [11,32,26,4,light],[14,36,20,5,light],[18,41,11,3,light],
            // Small ears surrounded by cheek volume.
            [13,8,3,2,shade],[11,10,7,7,fur],[32,8,3,2,shade],[29,10,7,7,fur],
            [14,12,2,3,brown],[31,12,2,3,brown],
            [15,14,18,3,light],[10,17,28,4,fur],[7,21,34,5,fur],
            [5,26,38,4,fur],[8,30,32,3,fur],[12,33,24,3,light],
            [13,20,22,9,light],[16,29,16,4,light],
            [7,23,4,4,light],[37,23,4,4,light],[10,30,5,2,light],[34,30,4,2,light],
            [16,22,4,blink?1:5,brown],[28,22,4,blink?1:5,brown],
            [16,22,1,blink?0:1,white],[28,22,1,blink?0:1,white],
            [22,27,3,2,brown],[21,30,6,3,brown],[23,31,2,2,pink]
        ];
    }
    if (id === 'nabi') {
        const pixels: Pixel[] = bodyOnly ? [] : [...move(nabiTail,37,19)];
        pixels.push(
            [14,31,20,12,white],[12,36,5,8,orange],[29,34,5,9,ink],
            [13,43,8,4,white],[27,43,8,4,white],
            [12,14,24,4,white],[10,18,28,12,white],[12,30,24,4,white],[16,34,16,2,white],
            [12,14,10,4,orange],[10,18,11,10,orange],[12,28,7,3,orange],
            [28,14,8,4,ink],[28,18,10,11,ink],[32,29,4,2,ink],
            [16,22,3,blink?1:4,ink],[29,22,3,blink?1:4,white],
            [29,23,2,blink?0:2,ink],[22,28,3,2,pink],[23,30,1,2,ink],
            [20,32,3,1,pink],[24,32,3,1,pink],
            [8,28,4,1,ink],[7,31,5,1,ink],[36,28,4,1,ink],[36,31,5,1,ink],
            [18,36,10,7,white]);
        if (!bodyOnly) pixels.push(...move(nabiEar(),9,4), ...move(nabiEar(true),28,4));
        return pixels;
    }
    return [
        // A visible hollow curl, drawn behind the compact body.
        [36,27,8,3,brown],[33,30,14,3,brown],[32,33,4,8,brown],[43,33,4,8,brown],
        [35,39,9,4,brown],[36,29,7,3,cream],[34,32,4,7,cream],[42,32,3,7,cream],
        [37,38,6,3,cream],[37,34,4,3,tan],
        [10,31,27,13,tan],[12,42,10,5,cream],[27,42,10,5,cream],
        [17,33,15,10,cream],[19,31,11,4,cream],
        // Pointed upright ears and stepped fox cheeks.
        [9,3,4,3,brown],[8,6,8,4,brown],[7,10,11,8,brown],
        [34,3,4,3,brown],[31,6,8,4,brown],[29,10,11,8,brown],
        [10,7,4,5,tan],[9,12,7,6,tan],[33,7,4,5,tan],[31,12,7,6,tan],
        [12,14,24,5,tan],[8,19,32,9,tan],[10,28,28,4,tan],[14,32,20,3,tan],
        [12,21,5,2,cream],[30,21,5,2,cream],
        [15,24,3,blink?1:3,brown],[29,24,3,blink?1:3,brown],
        [11,28,9,3,cream],[28,28,9,3,cream],[15,30,18,4,cream],[19,27,10,7,cream],
        [22,28,4,3,brown],[23,31,2,2,brown],[19,32,3,1,brown],[26,32,3,1,brown],
        [20,33,8,1,brown],[11,38,5,4,tan],[32,38,5,4,tan]
    ];
}
export function characterPortrait(id: string): string | undefined {
    if (!hasCharacterArt(id)) return;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" shape-rendering="crispEdges">${characterPixels(id).map(([x,y,w,h,c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#${c.toString(16).padStart(6,'0')}"/>`).join('')}</svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
export function drawPixels(g: { fillStyle(color: number): unknown; fillRect(x: number,y: number,w: number,h: number): unknown }, pixels: Pixel[]) {
    for (const [x,y,w,h,color] of pixels) { g.fillStyle(color); g.fillRect(x,y,w,h); }
}
