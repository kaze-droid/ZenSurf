import type { SiteTimeTracker, SiteTime } from './types';

export class SiteTimeTrackerImpl implements SiteTimeTracker {
    private _currentUrl: string | null = null;
    private _lastUpdateTime: number = Date.now();
    private _allSitesTimes: Map<string, SiteTime> = new Map();

    // For some new unseen site
    public setCurrentFocus(url: string | null): void {
        const now = Date.now();

        // Update time for previous URL if it exists
        if (this.getCurrentUrl()) {
            this.updateTimeForUrl(this.getCurrentUrl(), now);
        }

        // Set new current URL and update timestamp
        this.setCurrentUrl(url);
        this.setLastUpdateTime();

        // Initialize new URL in tracking if needed
        const curListOfSites = this.getAllSitesTimes();
        if (url && !curListOfSites.has(url)) {
            const updateListOfSites = new Map(
                [
                    ...curListOfSites,
                    ...new Map([
                        [url, {
                            url,
                            totalMinutes: 0,
                            lastActiveTime: now
                        }]])
                ]);

            this.setAllSitesTimes(updateListOfSites);
        }
    }

    // Update time for previous site
    public updateTimeForUrl(url: string, now: number): void {
        const timeSpentMs = now - this.getLastUpdateTime();
        const timeSpentMinutes = timeSpentMs / (1000 * 60);

        const curListOfSites = this.getAllSitesTimes();

        const siteTime = curListOfSites.get(url);
        if (siteTime) {
            siteTime.totalMinutes += timeSpentMinutes;
            siteTime.lastActiveTime = now;
        }
    }

    public getTotalTime(url: string) {
        // If it is a current url, calculate using current session
        // and then stored
        if (url === this.getCurrentUrl()) {
            const now = Date.now();
            this.updateTimeForUrl(url, now);
            this.setLastUpdateTime();
        }

        return this.getAllSitesTimes().get(url)?.totalMinutes ?? 0;
    }

    // Getters and setters
    public setCurrentUrl(currentUrl: string | null) {
        this._currentUrl = currentUrl;
    }

    public getCurrentUrl() {
        return this._currentUrl;
    }
    public setLastUpdateTime() {
        this._lastUpdateTime = Date.now();
    }

    public getLastUpdateTime() {
        return this._lastUpdateTime;
    }

    public setAllSitesTimes(allSitesTimes: Map<string, SiteTime>) {
        this._allSitesTimes = allSitesTimes;
    }

    public getAllSitesTimes() {
        return this._allSitesTimes;
    }
}
