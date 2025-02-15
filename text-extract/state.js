function getGifFilename(state) {
    const gifMapping = {
        "happy": "happy.gif",
        "sad": "sad.gif",
        "excited": "excited.gif",
        "angry": "angry.gif",
        "confused": "confused.gif",
        "surprised": "surprised.gif",
        "tired": "tired.gif",
        "bored": "bored.gif",
        "neutral": "neutral.gif"
    };

    return gifMapping[state] || "default.gif";
}

// Example usage
console.log(getGifFilename("happy")); // Output: "happy.gif"
console.log(getGifFilename("angry")); // Output: "angry.gif"
console.log(getGifFilename("unknown")); // Output: "default.gif"