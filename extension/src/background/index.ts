import "@plasmohq/messaging/background"
import { startHub } from "@plasmohq/messaging/pub-sub"

import { GlobalStore } from "~storage/global-storage"

import { curDate } from "~utils/dates"
import { BrowserTracker } from "~tracker/browser-tracker"
import type { BTConfig, SiteTime } from "~tracker/types"
import { SiteTimeTrackerImpl } from "~tracker/site-time-tracker"

export { }

// Get current date for storing daily usage

// Start hub for port messaging
console.info(`BGSW - Starting Hub`);
startHub()

// Set up secure storage
const globalStore: GlobalStore = new GlobalStore('allSitesTimes', 'blockedSites', 'accountDetails');

// Start browser tracker
const config: BTConfig = {
    // how frequently to check time spent per site
    activeTabUpdateIntervalMinutes: 0.5,
    // how frequently to store and update secure storage
    storageBackupIntervalMinutes: 0.5,
    // how long before user is considered idle
    idleThresholdMinutes: 5,
    isUserIdle: false
}

// Load previous site times from storage into siteTracker
const siteTracker: SiteTimeTrackerImpl = new SiteTimeTrackerImpl();
const loadFromStorage = async () => {
    const allSitesTimes = await globalStore.getAllSitesTimes();
    const prevAllSitesTimes = await globalStore.getDailySitesTimes(curDate);
    siteTracker.setAllSitesTimes(prevAllSitesTimes);
}
loadFromStorage();


const tracker: BrowserTracker = new BrowserTracker(config, siteTracker);

// Update the time spent on each site
setInterval(() => {
    const allTimes = tracker.getAllSiteTimes();
    for (const [url, siteTime] of allTimes) {
        console.info(`Time spent on ${url}: ${siteTime.totalMinutes.toFixed(2)} minutes`);
    }

    globalStore.setDailySitesTimes(curDate, allTimes);
}, config.storageBackupIntervalMinutes * 60000);
