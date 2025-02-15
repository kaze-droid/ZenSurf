import { getBrowserAPI } from '~utils/browser-api';
import { validateAndExtractDomain } from '~utils/extract-domain';
import type { DailySiteTimes, SiteTimeTracker, BTConfig, BrowserAPI } from './types';

export const IDLE_DOMAIN = "$idle";

export class BrowserTracker {
    private _sites: SiteTimeTracker;
    private _config: BTConfig;
    private _api: BrowserAPI;

    constructor(config: BTConfig, sites: SiteTimeTracker) {
        this._sites = sites;
        this._config = config;
        this._api = getBrowserAPI();

        this._initializeListeners();
        this._initializeAlarms();
    }

    private _initializeListeners() {
        // Tab Updates
        this._api.tabs.onUpdated.addListener(
            (_tabId: number, _changeInfo: chrome.tabs.TabChangeInfo | browser.tabs._OnUpdatedChangeInfo, _tab: chrome.tabs.Tab | browser.tabs.Tab) => {
                this._updateTimeWithCurrentTab();
            }
        )

        // Tab Activations
        this._api.tabs.onActivated.addListener(
            (activeInfo: chrome.tabs.TabActiveInfo) => {
                this._api.tabs.get(activeInfo.tabId, (tab: chrome.tabs.Tab | browser.tabs.Tab) => {
                    const domain = validateAndExtractDomain(tab.url).domain;
                    this._sites.setCurrentFocus(domain);
                });
            }
        );

        // Window focus events
        this._api.windows.onFocusChanged.addListener((windowId) => {
            if (windowId === this._api.windows.WINDOW_ID_NONE) {
                this._sites.setCurrentFocus(IDLE_DOMAIN);
                return;
            }
            this._updateTimeWithCurrentTab();
        });

        // Idle state handling
        this._api.idle.onStateChanged.addListener((state) => {
            if (state === 'active') {
                this._config.isUserIdle = false;
                this._updateTimeWithCurrentTab();
            } else {
                this._config.isUserIdle = true;
                this._sites.setCurrentFocus(IDLE_DOMAIN);
            }
        });
    }

    private _initializeAlarms() {
        this._api.alarms.create('updateTime', {
            periodInMinutes: this._config.activeTabUpdateIntervalMinutes
        });

        this._api.alarms.onAlarm.addListener(async (alarm: chrome.alarms.Alarm | browser.alarms.Alarm) => {
            if (alarm.name === 'updateTime') {
                try {
                    const idleState = await this._queryIdleState();
                    this._config.isUserIdle = idleState !== 'active';

                    if (this._config.isUserIdle) {
                        this._sites.setCurrentFocus(IDLE_DOMAIN);
                    } else {
                        await this._updateTimeWithCurrentTab();
                    }
                } catch (error) {
                    console.error('Error checking idle state:', error);
                }
            }
        });
    }

    private _queryIdleState(): Promise<chrome.idle.IdleState | browser.idle.IdleState> {
        return new Promise((resolve) => {
            // Checks if system is idle (in seconds)
            this._api.idle.queryState(this._config.idleThresholdMinutes * 60, resolve);
        });
    }

    private async _updateTimeWithCurrentTab(): Promise<void> {
        try {
            const tabs = await this._queryTabs();

            if (tabs.length === 1 && tabs[0].windowId) {
                const domain = validateAndExtractDomain(tabs[0].url).domain;
                this._sites.setCurrentFocus(domain);
            }
        } catch (error) {
            console.error('Error updating current tab:', error);
        }
    }

    private _queryTabs(): Promise<chrome.tabs.Tab[] | browser.tabs.Tab[]> {
        return new Promise((resolve) => {
            this._api.tabs.query({ active: true, lastFocusedWindow: true }, resolve);
        });
    }

    public getTimeForSite(url: string): number {
        return this._sites.getTotalTime(url);
    }

    public getAllSiteTimes(): DailySiteTimes {
        return this._sites.getAllSitesTimes();
    }
}
