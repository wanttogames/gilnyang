import type { AmbientCustomer } from '../data/ambientCustomers';
type Pixel = [number, number, number, number, number];
/** Same 48px canvas and paw baseline as regulars; large shapes survive a small viewport. */
export function ambientPixels(c: AmbientCustomer, blink: boolean): Pixel[] {
    const fur = c.color, light = c.accent, ink = 0x39343c, pink = 0xca9690;
    const kitten = c.look === 'kitten', round = c.look === 'round';
    const top = kitten ? 20 : c.look === 'corgi' ? 19 : 15;
    const width = round ? 34 : kitten ? 22 : 28, left = 24 - width / 2;
    const parts: Pixel[] = [
        // Tails stay behind the body. Corgi/elder have short tails; cats a clear upright tip.
        ...(c.dog ? [[37,34,7,c.look === 'corgi' ? 5 : 9,fur] as Pixel] : [[37,23,4,20,fur],[35,40,6,4,fur]] as Pixel[]),
        [left,top+8,width,18,fur],[left+3,35,width-6,10,fur],
        [left+2,43,8,4,light],[left+width-10,43,8,4,light],
    ];
    if (c.dog) {
        if (c.look === 'corgi') parts.push([7,8,8,20,fur],[33,8,8,20,fur],[10,13,3,9,pink],[35,13,3,9,pink]);
        else parts.push([5,top+2,9,20,c.look === 'beagle' ? 0x72513e : fur],[34,top+2,9,20,c.look === 'beagle' ? 0x72513e : fur]);
        parts.push([14,top+13,20,10,light],[19,36,10,8,light]);
        if (c.look === 'beagle') parts.push([11,34,7,8,0x55504b],[16,top+1,7,7,0x72513e]);
        if (c.look === 'elder') parts.push([13,top+10,7,3,light],[28,top+10,7,3,light]);
    } else {
        parts.push([left,top-10,8,15,fur],[left+width-8,top-10,8,15,fur],
            [left+2,top-6,4,6,pink],[left+width-6,top-6,4,6,pink],[17,top+17,14,6,light]);
        if (c.look === 'grey') parts.push([17,top,4,7,0x65727f],[27,top,4,7,0x65727f]);
        if (round) parts.push([left,top+13,5,3,0x8c6c53],[left+width-5,top+13,5,3,0x8c6c53]);
    }
    parts.push([16,top+10,3,blink ? 1 : c.look === 'elder' ? 2 : 4,ink],
        [29,top+10,3,blink ? 1 : c.look === 'elder' ? 2 : 4,ink],[22,top+16,4,2,c.dog ? ink : pink]);
    return parts;
}
