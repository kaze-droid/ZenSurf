import "@plasmohq/messaging/background"
import { startHub } from "@plasmohq/messaging/pub-sub"

import { GlobalStore } from "~storage/global-storage"

import { curDate } from "~utils/dates"
import { BrowserTracker } from "~tracker/browser-tracker"
import type { BTConfig, SiteTime } from "~tracker/types"
import { SiteTimeTrackerImpl } from "~tracker/site-time-tracker"
import { productivityAndCodingSites, unproductiveSites } from "~contents/websites"

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
setInterval(async () => {
    const allTimes = tracker.getAllSiteTimes();
    for (const [url, siteTime] of allTimes) {
        console.info(`Time spent on ${url}: ${siteTime.totalMinutes.toFixed(2)} minutes`);
    }

    globalStore.setDailySitesTimes(curDate, allTimes);

    // get all sites times
    const allSitesTimes = await globalStore.getAllSitesTimes();
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = months[today.getMonth()];
    const todayYear = today.getFullYear();

    // get all sites times for today's date
    const todaySitesTimes = allSitesTimes[`${todayDate}-${todayMonth}-${todayYear}`];
    console.info("Today's sites times:", allSitesTimes, `${todayDate}-${todayMonth}-${todayYear}`);
    // Get today's goal, blocked topics, blocked sites, and wallet ID
    const [userGoal, blockedTopics, blockedSites, walletId, paidAmount] = await Promise.all([
        globalStore.getUserGoal(),
        globalStore.getBlockedTopics(),
        globalStore.getAllBlockedSites(),
        globalStore.getWalletId(),
        globalStore._store.getFromStorage('paidAmount')
    ]);

    // Get today's date in MM/DD/YYYY format
    const todayDateStr = today.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });

    // Extract amount if paidAmount exists and is from today
    const todaysPaidAmount = paidAmount ? (() => {
        const [amount, date] = paidAmount.split('|');
        return date === todayDateStr ? amount : null;
    })() : null;

    console.info("Today's date:", todaySitesTimes);
    console.info("Currently blocked topics:", blockedTopics);
    console.info("Currently blocked sites:", Array.from(blockedSites)); // Convert Set to Array for better logging
    console.info("Current wallet ID:", walletId);
    console.info("Today's paid amount:", todaysPaidAmount ? `$${todaysPaidAmount}` : "Not set");

    
    if (userGoal) {
        const [goalMinutes, goalDate] = userGoal.split(/(\d{2}\/\d{2}\/\d{4})/);
        const goalMins = parseInt(goalMinutes);
        
        // Calculate total minutes spent today, excluding idle time and unproductive sites
        const totalMinutes = Object.values(todaySitesTimes)
            .filter(site => {
                // Exclude idle time and unproductive sites
                if (site.url === "$idle") return false;
                
                // Extract domain from site url for comparison
                const domain = site.url.split('/')[0];
                return !unproductiveSites.includes(domain);
            })
            .reduce((total, site) => total + site.totalMinutes, 0);
            
        console.info(`Progress towards goal: ${totalMinutes.toFixed(2)}/${goalMins} minutes (excluding unproductive sites)`);

        // Send total minutes spent today to server
        const response = await fetch(`${process.env.PLASMO_PUBLIC_SERVER_URL}/new-record`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                wallet_id: walletId,
                duration_commit: totalMinutes,
                duration: goalMins,
                commit_price: todaysPaidAmount ? parseFloat(todaysPaidAmount) : 0.0
            })
        });
        
        if (!response.ok) {
            console.error("Failed to send record to server", response);
        } else {
            console.log("Record sent successfully");
        }
    }
    
}, config.storageBackupIntervalMinutes * 60000);

/*
All sites times Format
{
  "16-feb-2025": {
    "google.com": {
      "url": "google.com",
      "totalMinutes": 5.452866666666666,
      "lastActiveTime": 1739645148169
    },
    "$idle": {
      "url": "$idle",
      "totalMinutes": 11.71928333333333,
      "lastActiveTime": 1739645738892
    },
    "plasmodb.org": {
      "url": "plasmodb.org",
      "totalMinutes": 0.4021,
      "lastActiveTime": 1739640139471
    },
    "wikipedia.org": {
      "url": "wikipedia.org",
      "totalMinutes": 0.2727,
      "lastActiveTime": 1739640243145
    },
    "yes.my": {
      "url": "yes.my",
      "totalMinutes": 0.3644166666666667,
      "lastActiveTime": 1739644622391
    },
    "lichess.org": {
      "url": "lichess.org",
      "totalMinutes": 21.60958333333332,
      "lastActiveTime": 1739645107617
    },
    "247freepoker.com": {
      "url": "247freepoker.com",
      "totalMinutes": 0.06488333333333333,
      "lastActiveTime": 1739640457085
    },
    "interledger-test.dev": {
      "url": "interledger-test.dev",
      "totalMinutes": 33.865066666666664,
      "lastActiveTime": 1739643457802
    },
    "webtoons.com": {
      "url": "webtoons.com",
      "totalMinutes": 0.19158333333333333,
      "lastActiveTime": 1739643499701
    },

*/