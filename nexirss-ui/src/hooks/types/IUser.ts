export interface IFeedSubscription {
    feed: string;
    notifications: boolean;
}

export interface AiAnalysisSetting {
    _id: string;
    prompt: string;
    notifications: boolean;
    highlight: boolean;
}

export interface IUser {
    _id: string;
    email: string;
    username: string;
    name: string;
    family_name: string;
    given_name: string;
    email_verified: boolean;
    picture: string;
    feedSubscriptions: IFeedSubscription[];
    openaiApiKey?: string;
    aiAnalysisSettings: AiAnalysisSetting[];
    feeds: string[];
    isDebugger: boolean
}
