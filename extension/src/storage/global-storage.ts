import { SecureStore } from "./secure-storage";
import { Store } from "./storage";
import type { DailySiteTimes, DateIndexedSiteTimes, SiteTime } from "~tracker/types";
import { dateRegex, monthMap } from "~utils/dates";

export class GlobalStore {
    private _allSitesTimes: string;
    private _allBlockedSites: string;
    private _accountDetails: string;
    private _userGoal: string;
    private _tmrGoal: string;
    private _blockedTopics: string = "blockedTopics";

    private _store: Store;
    private _secureStore: SecureStore;

    constructor(allSitesTimesKey: string, allBlockedSitesKey: string, accountDetailsKey: string) {
        this._allSitesTimes = allSitesTimesKey;
        this._allBlockedSites = allBlockedSitesKey;
        this._accountDetails = accountDetailsKey;
        this._userGoal = "userGoal";
        this._tmrGoal = "tmrGoal";

        this._store = new Store();
        this._secureStore = new SecureStore();
    }

    // Storage type validators
    private _isSiteTime(value: unknown): value is SiteTime {
        if (!value || typeof value !== 'object') return false;
        return (
            'url' in value &&
            typeof (value as SiteTime).url === 'string' &&
            'totalMinutes' in value &&
            typeof (value as SiteTime).totalMinutes === 'number' &&
            'lastActiveTime' in value &&
            typeof (value as SiteTime).lastActiveTime === 'number'
        );
    }

    private _isDailySiteTimes(value: unknown): value is DailySiteTimes {
        if (!(value instanceof Map)) {
            try {
                value = new Map(Object.entries(value));
                if (!(value instanceof Map)) return false;
            } catch (err) {
                return false;
            }
        }

        for (const [key, val] of value.entries()) {
            if (typeof key !== 'string') return false;
            if (!this._isSiteTime(val)) return false;
        }

        return true;
    }

    // Ensures that the date str is in the format of '16-feb-2025'
    private _isDateStr(value: unknown): value is string {
        if (typeof value !== 'string') return false;

        if (!dateRegex.test(value)) return false;

        const [day, month, year] = value.split('-');

        const monthNum = monthMap[month.toLowerCase()];
        if (monthNum === undefined) return false;

        const testDate = new Date(parseInt(year), monthNum, parseInt(day));
        return (
            testDate.getDate() === parseInt(day) ||
            testDate.getMonth() === monthNum ||
            testDate.getFullYear() === parseInt(year)
        );
    }

    private _isDateIndexedSiteTimes(value: unknown): value is DateIndexedSiteTimes {
        if (!value || typeof value !== 'object') return false;

        // Convert value to a regular object if needed
        const obj = value as { [key: string]: unknown };

        for (const [dateStr, siteTimes] of Object.entries((obj))) {
            if (!this._isDateStr(dateStr)) return false;

            if (!this._isDailySiteTimes(siteTimes)) return false;
        }

        return true;
    }

    // List of getters and setters


    // For all site times
    public async getAllSitesTimes(): Promise<DateIndexedSiteTimes> {
        // allSitesTimes should be in JSON format
        const allSitesTimes = await this._store.getFromStorage(this._allSitesTimes);

        if (this._isDateIndexedSiteTimes(allSitesTimes)) {
            // Create properly typed object to store the converted Maps
            const newObj: DateIndexedSiteTimes = {};

            // Convert each daily site times object to a Map
            for (const [dateStr, siteTimes] of Object.entries(allSitesTimes)) {
                // Actually returns it as an object instead of a map
                newObj[dateStr] = siteTimes;
            }

            return newObj;
        }

        return {};
    }

    public async setAllSitesTimes(allSitesTimes: DateIndexedSiteTimes): Promise<void> {
        if (this._isDateIndexedSiteTimes(allSitesTimes)) {
            // Convert any Map values to plain objects before storage
            const storageObject = Object.fromEntries(
                Object.entries(allSitesTimes).map(([date, siteTimesMap]) => [
                    date,
                    siteTimesMap instanceof Map ? Object.fromEntries(siteTimesMap) : siteTimesMap
                ])
            );

            await this._store.setInStorage(this._allSitesTimes, storageObject);
        }
    }

    // For a specific day
    public async getDailySitesTimes(dateStr: string): Promise<DailySiteTimes> {
        const allSitesTimes = await this.getAllSitesTimes();
        const tmp = allSitesTimes[dateStr];

        if (this._isDateStr(dateStr) && this._isDateIndexedSiteTimes(allSitesTimes) && allSitesTimes[dateStr]) {
            return new Map(Object.entries(allSitesTimes[dateStr]));
        }

        return new Map<string, SiteTime>();
    }

    public async setDailySitesTimes(dateStr: string, dailySiteTimes: DailySiteTimes): Promise<void> {
        if (this._isDateStr(dateStr) && this._isDailySiteTimes(dailySiteTimes)) {
            const allSitesTimes = await this.getAllSitesTimes();
            allSitesTimes[dateStr] = dailySiteTimes;

            await this.setAllSitesTimes(allSitesTimes);
        }
    }

    public async getAllBlockedSites(): Promise<Set<string>> {
        const allBlockedSites = await this._store.getFromStorage(this._allBlockedSites);

        // If it's already a Set, return it
        if (allBlockedSites instanceof Set) {
            return allBlockedSites;
        }

        // If it's an array, convert to Set
        if (Array.isArray(allBlockedSites) && allBlockedSites.every(site => typeof site === 'string')) {
            return new Set(allBlockedSites);
        }

        return new Set<string>();
    }

    public async setAllBlockedSites(allBlockedSites: Set<string> | string[]): Promise<void> {
        const sitesSet = allBlockedSites instanceof Set ? allBlockedSites : new Set(allBlockedSites);
        await this._store.setInStorage(this._allBlockedSites, sitesSet);
    }

    public async addBlockedSites(blockedSites: string | string[]): Promise<void> {
        const currentSites = await this.getAllBlockedSites();

        if (typeof blockedSites === 'string') {
            currentSites.add(blockedSites);
        } else if (Array.isArray(blockedSites)) {
            blockedSites.forEach(site => currentSites.add(site));
        }

        await this._store.setInStorage(this._allBlockedSites, currentSites);
    }

    public async removeBlockedSites(blockedSites: string | string[]): Promise<void> {
        const currentSites = await this.getAllBlockedSites();

        if (typeof blockedSites === 'string') {
            currentSites.delete(blockedSites);
        } else if (Array.isArray(blockedSites)) {
            blockedSites.forEach(site => currentSites.delete(site));
        }

        await this._store.setInStorage(this._allBlockedSites, currentSites);
    }

    // Goal related methods
    public async getUserGoal(): Promise<string | null> {
        return await this._store.getFromStorage(this._userGoal) || null;
    }

    public async setUserGoal(goal: string): Promise<void> {
        await this._store.setInStorage(this._userGoal, goal);
    }

    public async getTmrGoal(): Promise<string | null> {
        return await this._store.getFromStorage(this._tmrGoal) || null;
    }

    public async setTmrGoal(goal: string): Promise<void> {
        await this._store.setInStorage(this._tmrGoal, goal);
    }

    public async removeTmrGoal(): Promise<void> {
        await this._store.removeFromStorage(this._tmrGoal);
    }

    public async getBlockedTopics(): Promise<string[]> {
        const topics = await this._store.getFromStorage(this._blockedTopics);
        return Array.isArray(topics) ? topics : [];
    }

    // TODO: Add validation and getters and setters for each of the other methods

}
