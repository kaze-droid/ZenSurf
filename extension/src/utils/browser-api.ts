export const getBrowserAPI = () => {
    if (typeof chrome !== "undefined") {
        if (chrome.runtime) {
            return chrome;
        }
    }
    if (typeof browser !== "undefined") {
        return browser;
    }
    throw new Error("No browser API available");
}
