export type DongguPixel = [number, number, number, number, number];

/**
 * Donggu: a snow-white Spitz with upright ears, a fluffy ruff and a curled plume tail.
 * Warm ivory shading avoids the grey muzzle effect that can make white fur look dirty.
 */
export function dongguPixels(blink = false): DongguPixel[] {
    const outline = 0x5a504b;
    const fur = 0xfff9ef;
    const warmShade = 0xf1dfcf;
    const deepShade = 0xd9c4b5;
    const innerEar = 0xefbeb7;
    const eye = 0x58473e;
    const nose = 0x3d3735;
    const blush = 0xe8a79f;
    return [
        // Curled plume tail carried over the back.
        [35,21,7,4,outline],[38,17,7,6,outline],[39,14,5,5,outline],
        [36,21,6,4,fur],[39,18,5,4,fur],[40,15,3,4,fur],
        [32,24,10,6,outline],[33,25,8,5,fur],[34,28,7,4,warmShade],
        // Compact fluffy body and paws.
        [10,30,29,15,outline],[12,31,25,13,fur],[15,33,19,9,warmShade],
        [13,42,9,5,outline],[14,43,7,4,fur],[27,42,9,5,outline],[28,43,7,4,fur],
        [9,34,7,6,fur],[34,34,6,6,fur],
        // Upright Spitz ears.
        [11,5,5,4,outline],[9,9,9,7,outline],[8,14,11,7,outline],
        [33,5,5,4,outline],[30,9,9,7,outline],[29,14,11,7,outline],
        [12,8,3,6,fur],[11,12,5,6,fur],[34,8,3,6,fur],[32,12,5,6,fur],
        [12,10,2,5,innerEar],[34,10,2,5,innerEar],
        // Round white face with warm cream ruff.
        [11,15,27,4,outline],[8,19,33,11,outline],[10,29,29,8,outline],
        [13,16,22,4,fur],[10,20,29,9,fur],[12,29,25,6,fur],
        [8,26,7,7,fur],[35,26,6,7,fur],[13,31,23,7,warmShade],
        [15,21,5,blink ? 1 : 4,eye],[29,21,5,blink ? 1 : 4,eye],
        ...(!blink ? [[16,22,1,1,fur],[30,22,1,1,fur]] as DongguPixel[] : []),
        [13,27,4,2,blush],[32,27,4,2,blush],
        [20,27,10,6,fur],[23,27,4,3,nose],[22,30,6,2,deepShade],[24,32,2,1,blush],
        // Extra ruff tufts keep the silhouette distinctly Spitz-like.
        [11,31,5,5,warmShade],[34,31,5,5,warmShade],[16,35,4,5,fur],[30,35,4,5,fur]
    ];
}
