/** Integer pixel rectangles shared by Phaser textures and the two book portraits. */
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
export function characterPixels(id: 'nabi' | 'dubu', blink = false, bodyOnly = false): Pixel[] {
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
    if (id !== 'nabi' && id !== 'dubu') return;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" shape-rendering="crispEdges">${characterPixels(id).map(([x,y,w,h,c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#${c.toString(16).padStart(6,'0')}"/>`).join('')}</svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
export function drawPixels(g: { fillStyle(color: number): unknown; fillRect(x: number,y: number,w: number,h: number): unknown }, pixels: Pixel[]) {
    for (const [x,y,w,h,color] of pixels) { g.fillStyle(color); g.fillRect(x,y,w,h); }
}
