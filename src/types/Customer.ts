export interface Customer {
    id: string;
    name: string;
    species: string;
    personality: string;
    favoriteFoodIds: string[];
    favoriteIngredients: string[];
    color: number;
    accent: number;
    dog?: boolean;
    unlockNight: number;
}
export interface CustomerProgress {
    intimacy: number;
    visitCount: number;
    storyStage: number;
    unlocked: boolean;
    preferenceFound: boolean;
}
