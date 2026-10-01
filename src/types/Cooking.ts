export type RiceballStep =
    | { id: string; type: 'quantity' | 'wrap'; title: string; instruction: string; button: string; duration: number; perfectRange: number }
    | { id: string; type: 'shape'; title: string; instruction: string; beats: number; cooldown: number };

export interface CookingStepScore { id: string; name: string; score: number }
