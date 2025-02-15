function getGifFilename(state) {
    const gifMapping = {
        "good": "good.gif",
        "bad": "bad.gif",
        "penalise": "penalise.gif",
        "reward": "reward.gif",
        "confused": "confused.gif",
        "neutral": "neutral.gif",
        "idle": "idle.gif",
    };

    return gifMapping[state] || "neutral.gif";
}

console.log(getGifFilename("good")); // good.gif
