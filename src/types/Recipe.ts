export type Quality = '보통' | '맛있음' | '완벽';
export interface Recipe {
    id: string;
    name: string;
    subtitle: string;
    ingredients: string[];
    action: 'hold' | 'timing' | 'pour' | 'flip';
    duration: number;
    extraIngredientIds: string[];
    actionTitle: string;
    actionButton: string;
    unlock?: {
        customerId: string;
        visits: number;
        intimacy: number;
        reason: string;
    };
}
