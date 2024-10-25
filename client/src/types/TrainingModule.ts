
export interface TrainingModule {
    id: number;
    name: string;
    quiz: JSON;
    reservationPrompt: string;
}
export interface AccessProgress {
    equipment: {
        id: number;
        name: string;
    };
    passedModules: {
        id: number;
        name: string;
    }[];
    availableModules: {
        id: number;
        name: string;
    }[];
    accessCheckDone: boolean;
}