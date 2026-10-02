export type DongguPixel = [number, number, number, number, number];

// Named layers avoid depending on another character's rectangle indices.
const outline = 0x796354;
const fur = 0xfffcf7, soft = 0xf6ebdf, puff = 0xebdacc;
const innerEar = 0xf3c7c0, eye = 0x584b43, nose = 0x3f3936, blush = 0xf3d4c6;

/** A broad plume grows from the right hip and curls inward over the back. */
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

export function dongguEarPixels(right = false): DongguPixel[] {
    const x = right ? 29 : 9;
    return [
        [x+3,6,3,2,outline],[x+2,8,5,3,outline],[x,11,9,8,outline],
        [x+3,8,3,3,fur],[x+1,11,7,7,fur],
        [x+3,11,3,4,innerEar],[x+2,15,5,2,soft]
    ];
}

/** Cotton-ball Spitz: white dominates; warm ivory only defines folds and feet. */
export function dongguBodyPixels(blink = false): DongguPixel[] {
    return [
        // Short round body with broad stepped tufts, rather than thin legs.
        [12,30,25,3,outline],[8,33,33,7,outline],[10,40,29,5,outline],
        [10,33,29,8,fur],[12,40,25,4,fur],[8,35,5,4,fur],[37,35,5,4,fur],
        [12,42,10,5,outline],[26,42,10,5,outline],
        [13,42,8,5,fur],[27,42,8,5,fur],[15,45,5,1,soft],[29,45,5,1,soft],
        // Oversized ruff is wider than the face and merges into the belly.
        [8,28,32,4,outline],[4,32,40,5,outline],[7,37,34,3,outline],
        [11,40,26,3,outline],
        [9,29,30,5,fur],[5,33,38,3,fur],[8,36,32,3,fur],[12,39,24,3,fur],
        [8,34,5,3,soft],[35,34,5,3,soft],[15,38,5,3,soft],[29,38,5,3,soft],
        [20,40,9,3,soft],[21,40,7,2,fur],
        // Large round head, with scalloped cheeks and a short muzzle.
        [13,13,21,3,outline],[9,16,29,4,outline],[6,20,35,9,outline],
        [8,29,31,3,outline],[12,32,23,2,outline],
        [14,14,19,3,fur],[10,17,27,4,fur],[7,21,33,7,fur],
        [9,28,29,3,fur],[13,31,21,2,fur],
        [5,24,7,4,outline],[6,24,7,3,fur],[36,24,6,4,outline],[35,24,6,3,fur],
        [11,30,5,2,soft],[31,30,5,2,soft],
        [15,22,4,blink ? 1 : 4,eye],[29,22,4,blink ? 1 : 4,eye],
        ...(!blink ? [[16,22,1,1,fur],[30,22,1,1,fur]] as DongguPixel[] : []),
        [11,27,4,2,blush],[33,27,4,2,blush],
        [19,26,11,5,fur],[22,27,4,2,nose],[23,29,2,1,nose],
        [21,30,2,1,puff],[25,30,2,1,puff],[23,31,2,1,innerEar]
    ];
}

/** The book portrait and layered game sprite use exactly the same artwork. */
export function dongguPixels(blink = false): DongguPixel[] {
    return [...dongguTailPixels(), ...dongguEarPixels(), ...dongguEarPixels(true), ...dongguBodyPixels(blink)];
}
