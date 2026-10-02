import type { AmbientCustomer } from '../data/ambientCustomers';
type Pixel = [number, number, number, number, number];

const ink = 0x51463f, deepInk = 0x39343c, pink = 0xca9690;

/**
 * Hand-built 48px silhouettes for the walk-in friends. Keep each look explicit:
 * a few large, high-contrast shapes read better than tiny fur details on mobile.
 */
export function ambientPixels(c: AmbientCustomer, blink: boolean): Pixel[] {
    const fur = c.color, light = c.accent;
    const eye = (x: number, y: number, color = deepInk, height = blink ? 1 : 4): Pixel => [x, y, 3, height, color];

    switch (c.look) {
        case 'kitten': {
            // Kkomi: a kitten head dominates its tiny body; rounded, short kitten ears.
            return [
                [36,31,4,12,ink],[37,32,2,10,fur],[33,39,7,4,fur],
                [12,30,24,15,ink],[14,32,20,12,fur],[17,36,14,7,light],
                [15,42,7,5,ink],[16,43,5,3,light],[27,42,7,5,ink],[28,43,5,3,light],
                [8,17,32,22,ink],[10,18,28,19,fur],[13,32,22,5,light],
                [13,12,5,4,ink],[11,15,9,5,ink],[10,18,10,6,ink],[30,12,5,4,ink],[28,15,9,5,ink],[28,18,10,6,ink],
                [14,14,3,5,fur],[12,17,5,4,fur],[31,14,3,5,fur],[31,17,5,4,fur],
                [14,15,3,3,pink],[31,15,3,3,pink],
                [15,23,5,blink?1:6,deepInk],[29,23,5,blink?1:6,deepInk],
                [21,30,7,4,light],[23,31,3,2,pink],[21,34,7,2,ink],
            ];
        }
        case 'white': {
            // Seol: neat, slim white cat with compact triangular ears, a fine waist and long tail.
            return [
                [36,27,4,17,ink],[37,25,3,14,fur],[35,22,4,7,ink],[36,22,3,5,fur],
                [14,30,22,15,ink],[16,31,18,13,fur],[18,34,14,9,light],
                [17,43,7,4,ink],[18,43,5,3,fur],[28,43,7,4,ink],[29,43,5,3,fur],
                [9,15,30,23,ink],[11,16,26,20,fur],[13,31,22,5,light],
                [14,8,5,4,ink],[12,11,9,5,ink],[10,14,11,6,ink],[29,8,5,4,ink],[27,11,9,5,ink],[27,14,11,6,ink],
                [15,10,3,5,fur],[13,13,5,4,fur],[30,10,3,5,fur],[28,13,5,4,fur],
                [15,11,2,4,0xc5b9aa],[31,11,2,4,0xc5b9aa],
                [15,22,4,blink?1:4,0x65725e],[29,22,4,blink?1:4,0x65725e],
                [21,29,7,5,light],[23,30,3,2,pink],[21,33,7,2,ink],
                [13,17,5,3,0xe1d6c8],
            ];
        }
        case 'grey': {
            // Yeon: a lean grey alley cat, marked by broad tabby bars and a ringed tail.
            const stripe = 0x606c77;
            return [
                [37,20,5,25,ink],[38,21,3,5,light],[38,29,3,4,stripe],[38,37,3,4,stripe],[35,41,8,4,ink],
                [13,29,24,16,ink],[15,30,20,14,fur],[19,33,12,11,light],
                [16,43,7,4,ink],[17,43,5,3,light],[29,43,7,4,ink],[30,43,5,3,light],
                [9,14,30,24,ink],[11,15,26,21,fur],[13,30,22,5,light],
                [14,8,5,4,ink],[12,11,9,5,ink],[10,14,11,6,ink],[29,8,5,4,ink],[27,11,9,5,ink],[27,14,11,6,ink],
                [15,10,3,5,fur],[13,13,5,4,fur],[30,10,3,5,fur],[28,13,5,4,fur],
                [15,11,2,4,0xa5aaa9],[31,11,2,4,0xa5aaa9],
                [16,16,4,7,stripe],[22,14,4,5,stripe],[28,16,4,7,stripe],
                [14,23,4,blink?1:4,0x445446],[30,23,4,blink?1:4,0x445446],
                [10,29,5,2,stripe],[33,29,5,2,stripe],[21,30,7,4,light],[23,31,3,2,pink],[21,34,7,2,ink],
                [17,36,4,3,stripe],[28,36,4,3,stripe],
            ];
        }
        case 'round': {
            // Boksil: a broad, low, comfortably round cat with a short curled tail.
            const patch = 0x846a56;
            return [
                [37,33,6,8,ink],[39,29,6,7,ink],[40,30,4,5,fur],[37,35,4,7,fur],
                [7,29,36,18,ink],[9,31,32,15,fur],[13,35,24,11,light],
                [12,43,9,4,ink],[13,43,7,3,light],[27,43,9,4,ink],[28,43,7,3,light],
                [8,14,32,25,ink],[10,15,28,22,fur],[12,31,24,6,light],
                [13,7,6,4,ink],[10,11,11,5,ink],[9,15,12,7,ink],[29,7,6,4,ink],[27,11,11,5,ink],[27,15,12,7,ink],
                [14,10,4,7,fur],[12,15,6,5,fur],[30,10,4,7,fur],[30,15,6,5,fur],
                [14,11,3,5,patch],[31,11,3,5,patch],
                [14,22,4,blink?1:4,deepInk],[30,22,4,blink?1:4,deepInk],
                [9,25,6,3,patch],[33,25,6,3,patch],[20,29,8,5,light],[23,30,3,2,pink],[21,34,7,2,ink],
                [14,37,4,3,patch],[30,37,4,3,patch],
            ];
        }
        case 'corgi': {
            // Bamtol: Welsh corgi proportions—long low back, short legs, broad triangular ears.
            const rust = 0xb47745, cream = 0xf4dfbc;
            return [
                [5,28,7,7,ink],[7,29,5,5,rust], // small nub tail
                [7,28,35,18,ink],[9,29,31,15,rust],[13,35,23,9,cream],
                [10,41,8,7,ink],[11,42,6,5,cream],[31,41,8,7,ink],[32,42,6,5,cream],
                [24,13,22,23,ink],[26,15,18,20,rust],[27,26,16,10,cream],
                [28,8,5,4,ink],[26,11,9,5,ink],[25,14,10,6,ink],[37,8,5,4,ink],[35,11,9,5,ink],[35,14,10,6,ink],
                [29,10,3,4,rust],[27,13,6,4,rust],[38,10,3,4,rust],[36,13,6,4,rust],
                [29,21,4,blink?1:4,deepInk],[39,21,4,blink?1:4,deepInk],
                [34,25,9,7,cream],[36,27,5,3,ink],[35,30,7,2,ink],
                [20,33,5,7,cream],
            ];
        }
        case 'beagle': {
            // Mungchi: classic beagle tricolor, broad muzzle, floppy ears and white-tipped tail.
            const black = 0x463f3b, tan = 0xbf8c5d, white = 0xf3e5ce;
            return [
                [37,23,5,21,ink],[38,24,3,14,tan],[38,37,3,7,white],
                [11,29,28,17,ink],[13,31,24,14,tan],[14,35,23,10,white],
                [13,42,8,6,ink],[14,43,6,4,white],[29,42,8,6,ink],[30,43,6,4,white],
                [9,15,30,24,ink],[11,16,26,21,tan],[14,31,20,6,white],
                [5,18,11,18,ink],[7,20,7,14,black],[32,18,11,18,ink],[34,20,7,14,black],
                [19,14,10,19,white],[14,19,6,7,black],[28,19,6,7,black],
                [15,23,4,blink?1:4,deepInk],[29,23,4,blink?1:4,deepInk],
                [18,29,14,7,white],[21,29,8,5,white],[23,29,4,3,black],[22,33,8,2,ink],
                [10,36,6,3,black],
            ];
        }
        case 'elder': {
            // Haru: an older, soft-faced dog with a stooped back, grey coat and pale muzzle.
            const grey = 0x91877e, pale = 0xe8dfd1, shadow = 0x726d69;
            return [
                [38,31,5,13,ink],[39,33,3,8,grey],
                [13,31,28,15,ink],[15,32,24,13,grey],[19,36,17,9,pale],
                [15,42,8,5,ink],[16,43,6,3,pale],[31,42,8,5,ink],[32,43,6,3,pale],
                [10,16,30,23,ink],[12,17,26,20,grey],[15,31,20,6,pale],
                [5,16,12,20,ink],[7,18,8,15,shadow],[32,17,11,18,ink],[34,19,7,13,grey],
                [13,15,5,3,pale],[29,15,5,3,pale],
                [15,23,4,blink?1:3,deepInk],[29,23,4,blink?1:3,deepInk],
                [11,22,5,2,pale],[32,22,5,2,pale],[19,29,14,7,pale],[22,29,8,5,pale],
                [22,29,6,4,pale],[23,30,4,3,shadow],[21,34,8,2,shadow],[18,36,3,2,shadow],[29,36,3,2,shadow],
            ];
        }
    }
    return [];
}
