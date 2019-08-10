export enum WaitingStatus {BASE, AFK, NEW, DOWN, UP}

export interface WaitlistUserInfo {
    name: string; //Discord.User.tag
    isAdmin: boolean;
    time: number;
    timeEffectiveSpeaking: number;
    waitingStatus: WaitingStatus;
}
