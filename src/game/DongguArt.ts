export type DongguPixel = [number, number, number, number, number];

// Named layers keep Donggu independent of other characters' rectangle indices.
const outline = 0x796354;
const fur = 0xfffcf7, soft = 0xf6ebdf, puff = 0xebdacc;
const innerEar = 0xf3c7c0, eye = 0x493b32, nose = 0x302924, blush = 0xf3d4c6;
const tongue = 0xe6aaa6;

/** A soft plume curls over the back, behind the wide white coat. */
export function dongguTailPixels(): DongguPixel[] {
    return [
        [36,29,8,11,outline],[39,21,8,14,outline],
        [37,15,10,11,outline],[37,9,7,4,outline],[34,12,12,8,outline],[30,15,8,8,outline],
        [37,30,6,9,fur],[40,22,6,12,fur],[38,16,8,11,fur],
        [38,10,5,4,fur],[35,13,10,7,fur],[31,16,7,6,fur],
        [33,19,5,3,soft],[42,24,3,8,soft],[39,34,3,4,puff],
        [35,13,6,2,fur],[44,19,3,4,fur]
    ];
}

/** Small upright triangles with pale pink centres, like Donggu's reference photo. */
export function dongguEarPixels(right = false): DongguPixel[] {
    const x = right ? 29 : 9;
    return [
        [x+3,4,2,2,outline],[x+2,6,4,3,outline],[x+1,9,6,3,outline],[x,12,9,6,outline],
        [x+3,6,2,3,fur],[x+2,9,4,4,fur],[x+1,12,7,6,fur],
        [x+3,10,2,3,innerEar],[x+2,13,4,3,innerEar],[x+1,16,7,2,fur]
    ];
}

/** Photo-inspired smiling Spitz: a round face above an oversized, cascading mane. */
export function dongguBodyPixels(blink = false): DongguPixel[] {
    return [
        // White coat widens below the face and tapers toward two rounded front paws.
        [11,27,26,4,outline],[7,31,34,5,outline],[5,35,38,4,outline],
        [8,39,32,4,outline],[12,42,24,2,outline],
        [12,28,24,4,fur],[8,32,32,5,fur],[6,36,36,3,fur],
        [9,39,30,3,fur],[13,42,22,2,fur],
        // Broad tufts, rather than fine noisy fur lines.
        [6,29,8,4,outline],[7,29,8,3,fur],[35,29,8,4,outline],[34,29,8,3,fur],
        [4,33,7,3,outline],[5,33,7,2,fur],[37,33,7,3,outline],[36,33,7,2,fur],
        [8,37,4,3,soft],[36,37,4,3,soft],
        [14,34,3,5,soft],[31,34,3,5,soft],[17,39,3,3,soft],[28,39,3,3,soft],
        [21,42,6,2,soft],
        // Paws are a little more visible than the previous squat cotton-ball pose.
        [13,41,8,6,outline],[27,41,8,6,outline],
        [14,41,6,6,fur],[28,41,6,6,fur],[12,45,9,2,outline],[27,45,9,2,outline],
        [13,45,7,2,fur],[28,45,7,2,fur],[15,46,4,1,soft],[29,46,4,1,soft],
        // Round face sits inside the fan of cheek and neck fur.
        [14,11,20,3,outline],[10,14,28,4,outline],[8,18,32,7,outline],
        [10,25,28,4,outline],[14,29,20,2,outline],
        [15,12,18,3,fur],[11,15,26,4,fur],[9,19,30,6,fur],
        [11,25,26,3,fur],[15,28,18,3,fur],
        [6,21,7,4,outline],[7,21,7,3,fur],[35,21,7,4,outline],[34,21,7,3,fur],
        [9,26,7,3,fur],[32,26,7,3,fur],
        // Large soft eyes and tiny highlights preserve the cheerful expression.
        [15,18,4,blink ? 1 : 5,eye],[29,18,4,blink ? 1 : 5,eye],
        ...(!blink ? [[16,18,2,1,fur],[30,18,2,1,fur],[17,21,1,1,soft],[31,21,1,1,soft]] as DongguPixel[] : []),
        [11,24,3,1,blush],[34,24,3,1,blush],
        // Short white muzzle, dark button nose, open smile and a little pink tongue.
        [19,22,10,4,fur],[22,22,4,3,nose],[23,25,2,1,nose],
        [19,25,2,2,nose],[27,25,2,2,nose],[20,26,8,3,nose],[21,29,6,1,nose],
        [21,26,2,1,fur],[25,26,2,1,fur],[22,27,4,2,tongue],[23,27,2,1,innerEar],
        [20,31,8,2,fur]
    ];
}

/** The book portrait and layered game sprite share the same pose and palette. */
export function dongguPixels(blink = false): DongguPixel[] {
    return [...dongguTailPixels(), ...dongguEarPixels(), ...dongguEarPixels(true), ...dongguBodyPixels(blink)];
}
