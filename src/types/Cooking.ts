export type RiceballStep =
    | { id: string; type: 'quantity' | 'wrap'; title: string; instruction: string; button: string; duration: number; perfectRange: number }
    | { id: string; type: 'shape'; title: string; instruction: string; beats: number; cooldown: number };

export interface CookingStepScore { id: string; name: string; score: number }

export interface OdenPiece { id: string; name: string; shape: 'square' | 'triangle' | 'round'; duration: number }
export interface OdenCookingConfig { pieces: OdenPiece[]; goodStart: number; perfectCenter: number; perfectRange: number; lateGoodEnd: number }
