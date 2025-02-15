export interface BTConfig {
    activeTabUpdateIntervalMinutes: number;
    storageBackupIntervalMinutes: number;
    idleThresholdMinutes: number;
    isUserIdle: boolean;
}

export type BrowserAPI = typeof chrome | typeof browser;

export interface SiteTime {
    url: string;
    totalMinutes: number;
    lastActiveTime: number;
}

export type DailySiteTimes = Map<string, SiteTime>;

export interface DateIndexedSiteTimes {
    [date: string]: DailySiteTimes;
}

export interface SiteTimeTracker {
    setCurrentFocus(url: string | null): void;
    getTotalTime(url: string): number;
    getAllSitesTimes(): DailySiteTimes;
    setAllSitesTimes(allSitesTimes: DailySiteTimes): void;
}
