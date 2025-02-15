const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio'); // HTML parser

function detectThemesFromFile(htmlFilePath) {
    // Define themes with expanded anime, manga, and web comics keywords
    const themes = {
        anime: [
            "anime", "manga", "light novel", "visual novel", "otaku",
            "shonen", "shoujo", "seinen", "josei", "harem", "mecha", "slice of life",
            "ecchi", "doujin", "hentai", "yaoi", "yuri", "shoujo-ai", "shounen-ai",
            "OVA", "ONA", "OP", "ED", "OST", "seiyuu", "anime news", "anime reviews",
            "anime list", "anime streaming", "anime episode",
            "MyAnimeList", "MAL", "Anilist", "Kitsu", "Crunchyroll", "Funimation",
            "HIDIVE", "VRV", "9anime", "Gogoanime", "AnimePlanet", "Nyaa", "BakaBT",
            "AnimeUltima", "AnimeFLV", "AnimeHeaven", "AnimeLab",
            "Naruto", "Bleach", "One Piece", "Attack on Titan", "Demon Slayer", "Jujutsu Kaisen",
            "Chainsaw Man", "Tokyo Ghoul", "My Hero Academia", "Hunter x Hunter", "Sword Art Online",
            "Re:Zero", "Steins;Gate", "Death Note", "Fullmetal Alchemist", "Dragon Ball", 
            "Neon Genesis Evangelion", "Cowboy Bebop", "Ghost in the Shell", "Akira", 
            "Vivy", "Gintama", "Black Clover", "Fairy Tail",
            "manhwa", "webtoon", "korean comics", "manga scan", "manga raw", 
            "tower of god", "solo leveling", "the beginning after the end",
            "omniscient reader’s viewpoint", "eleceed", "unholy blood", "lookism",
            "true beauty", "the gamer", "god of high school", "noblesse", "bastard",
            "sweet home", "reborn rich", "survival story of a sword king in a fantasy world",
            "tomb raider king", "return of the mad demon", "legend of the northern blade",
            "web comic", "manga scan", "manga raw", "isekai manhwa"
        ],
        gaming: [
            "gaming", "esports", "video game", "playstation", "xbox", "nintendo",
            "steam", "gameplay", "twitch", "epic games", "e-sports", "gamer", 
            "fps", "rpg", "moba", "battle royale", "speedrun", "gaming news"
        ],
        entertainment: [
            "movies", "tv shows", "netflix", "disney+", "hulu", "prime video", 
            "cinema", "celebrity", "hollywood", "hbo max", "film", "box office", 
            "streaming", "drama", "comedy", "action movie"
        ],
        reels: [
            "shorts", "tiktok", "\\breel\\b", "instagram", "viral", "trending", "snapchat", 
            "reel trends", "youtube shorts", "social media", "facebook", "reel"
        ],
        gambling: [
            "casino", "bet", "betting", "wager", "odds", "payout", "jackpot", "roulette", "blackjack", 
            "poker", "slot", "baccarat", "sportsbook", "parlay", "bookmaker", "bookie", "winnings", 
            "stake", "lottery", "scratchcard", "keno", "bingo", "highroller", "spins", "free spins", 
            "no deposit", "bonus", "vip program", "rakeback", "progressive jackpot", "live dealer", 
            "real money", "cashout", "bet slip", "fixed odds", "handicap", "spread", "over under", 
            "moneyline", "prop bet", "esports betting", "crypto casino", "gambling site", 
            "online betting", "sports betting", "betting odds", "risk-free bet", "playthrough", 
            "rollover", "gambling addiction", "responsible gaming", "self-exclusion", 
            "gambling regulation", "licensed casino"
        ]

    };

    // Read the HTML file content
    const rawHtml = fs.readFileSync(path.resolve(htmlFilePath), 'utf8');

    // Load HTML content using Cheerio
    const $ = cheerio.load(rawHtml);

    // Extract page title
    const pageTitle = $('title').text().trim() || "Untitled Page";

    // Remove unwanted elements (navigation, links, scripts, styles)
    $('header, footer, nav, script, style, aside, noscript, meta, link, a').remove();

    // Extract visible text only from paragraphs, headings, spans, and divs
    let textContent = $('body')
        .find('p, h1, h2, h3, h4, h5, h6, span, div') // Extract meaningful text
        .text()
        .toLowerCase()
        .replace(/\s+/g, ' '); // Normalize spaces

    // Include title in the extracted text
    textContent = `${pageTitle} ${textContent}`;

    // Detect themes
    const detectedThemes = Object.keys(themes).filter(theme =>
        themes[theme].some(keyword => new RegExp(`\\b${keyword}\\b`, 'gi').test(textContent))
    );

    return detectedThemes;
}

// Example usage:
const fileName = 'gambling.html'; // Replace with the actual file path
console.log(detectThemesFromFile(fileName));
