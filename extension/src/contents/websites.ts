
const productivityAndCodingSites = [
  // Project Management & Collaboration
  "notion.so",
  "trello.com",
  "asana.com",
  "monday.com",
  "clickup.com",
  "slack.com",
  "basecamp.com",
  "jira.com",
  "teamwork.com",
  "confluence.com",
  "proofhub.com",

  // Communication & Video Calls
  "zoom.us",
  "meet.google.com",
  "calendar.google.com",
  "skype.com",
  "webex.com",
  "whereby.com",
  "discord.com",
  "microsoftteams.com",

  // Cloud Storage & File Sharing
  "drive.google.com",
  "dropbox.com",
  "box.com",
  "onedrive.live.com",
  "mega.io",
  "pcloud.com",

  // Notes & Writing
  "docs.google.com",
  "sheets.google.com",
  "slides.google.com",
  "keep.google.com",
  "evernote.com",
  "workflowy.com",
  "bear.app",
  "simplenote.com",
  "goodnotes.com",
  "zotero.org",

  // Task & Time Management
  "todoist.com",
  "ticktick.com",
  "microsoft.com/en-us/microsoft-365/onenote",
  "pomofocus.io",
  "rescuetime.com",
  "focusmate.com",
  "clockify.me",
  "toggl.com",
  "forestapp.cc",

  // Learning & Research
  "coursera.org",
  "udemy.com",
  "khanacademy.org",
  "edx.org",
  "brilliant.org",
  "duolingo.com",
  "skillshare.com",
  "lynda.com",
  "mitopencourseware.org",
  "futurelearn.com",
  "openai.com/research",
  "arxiv.org",

  // AI & Research Tools
  "chat.openai.com",
  "chatgpt.com",
  "bard.google.com",
  "perplexity.ai",
  "phind.com",
  "wolframalpha.com",
  "deepl.com",
  "grammarly.com",
  "hemingwayapp.com",
  "huggingface.co",
  "replicate.com",
  "runpod.io",
  "forefront.ai",
  "together.ai",
  "playgroundai.com",
  "stablediffusionweb.com",
  "midjourney.com",
  "tensorboard.dev",

  // Coding & Developer Platforms
  "github.com",
  "gitlab.com",
  "bitbucket.org",
  "codepen.io",
  "jsfiddle.net",
  "replit.com",
  "stackblitz.com",
  "codesandbox.io",
  "glitch.com",
  "leetcode.com",
  "codewars.com",
  "hackerrank.com",
  "topcoder.com",
  "geeksforgeeks.org",
  "dev.to",
  "hashnode.com",
  "stackoverflow.com",
  "w3schools.com",
  "mdn.dev",
  "freecodecamp.org",
  "pluralsight.com",
  "github.dev",
  "github.com/codespaces",
  "rentry.co",
  "godbolt.org",
  "jupyter.org",

  // API & Documentation
  "postman.com",
  "rapidapi.com",
  "swagger.io",
  "devdocs.io",
  "jsonplaceholder.typicode.com",
  "mockaroo.com",
  "reqres.in",
  "openai.com/api",
  "huggingface.co/docs",
  "pypi.org",
  "npmjs.com",
  "pkg.go.dev",
  "rubygems.org",

  // Cloud & DevOps
  "aws.amazon.com",
  "cloud.google.com",
  "azure.microsoft.com",
  "netlify.com",
  "vercel.com",
  "heroku.com",
  "firebase.google.com",
  "render.com",
  "railway.app",
  "supabase.com",
  "digitalocean.com",
  "linode.com",
  "kubernetes.io",
  "docker.com",
  "grafana.com",
  "prometheus.io",
  "terraform.io",
  "ansible.com",

  // Miscellaneous Productivity
  "canva.com",
  "miro.com",
  "figma.com",
  "loom.com",
  "smallpdf.com",
  "pdfescape.com",
  "ilovepdf.com",
  "tinywow.com",
  "remove.bg",
  "unsplash.com",
  "pexels.com",
  "pixabay.com",
  "medium.com",
];


const unproductiveSites = [
    // Social Media & Microblogging
    "youtube.com",
    "x.com",
    "facebook.com",
    "instagram.com",
    "tiktok.com",
    "reddit.com",
    "pinterest.com",
    "snapchat.com",
    "tumblr.com",
    "discord.com",
    "twitch.tv",
    "telegram.org",
    "whatsapp.com",
    "threads.net",
    "weibo.com",
    "mastodon.social",
    "quora.com",
    "vk.com",
    "onlyfans.com",
  
    // Meme & Funny Content
    "9gag.com",
    "imgur.com",
    "ifunny.co",
    "memedroid.com",
    "knowyourmeme.com",
    "cheezburger.com",
    "thechive.com",
    "quickmeme.com",
    "funnyjunk.com",
  
    // Streaming & Video Content
    "netflix.com",
    "hulu.com",
    "disneyplus.com",
    "hbomax.com",
    "primevideo.com",
    "peacocktv.com",
    "crunchyroll.com",
    "funimation.com",
    "tubitv.com",
    "vimeo.com",
    "dailymotion.com",
    "bilibili.com",
  
    // Gaming & Game Streaming
    "roblox.com",
    "minecraft.net",
    "fortnite.com",
    "epicgames.com",
    "steampowered.com",
    "store.steampowered.com",
    "xbox.com",
    "playstation.com",
    "ea.com",
    "rockstargames.com",
    "ubisoft.com",
    "riotgames.com",
    "leagueoflegends.com",
    "chess.com",
    "lichess.org",
    "pogo.com",
    "miniclip.com",
    "addictinggames.com",
    "newgrounds.com",
    "kongregate.com",
    "armorgames.com",
  
    // Shopping & E-commerce
    "amazon.com",
    "ebay.com",
    "aliexpress.com",
    "temu.com",
    "etsy.com",
    "walmart.com",
    "target.com",
    "bestbuy.com",
    "newegg.com",
    "shein.com",
    "zalando.com",
    "stockx.com",
    "goat.com",
    "wish.com",
  
    // Gossip, Celebrities & News
    "tmz.com",
    "perezhilton.com",
    "buzzfeed.com",
    "huffpost.com",
    "dailymail.co.uk",
    "theonion.com",
    "uproxx.com",
    "eonline.com",
    "usmagazine.com",
    "vanityfair.com",
    "gawker.com",
  
    // Dating & Social Discovery
    "tinder.com",
    "bumble.com",
    "hinge.co",
    "okcupid.com",
    "plentyoffish.com",
    "match.com",
    "grindr.com",
    "coffeemeetsbagel.com",
    "happn.com",
  
    // Forums & Discussion Boards
    "4chan.org",
    "8kun.top",
    "f95zone.to",
    "gtaforums.com",
    "resetera.com",
    "neogaf.com",
    "slickdeals.net",
    "blackhatworld.com",
  
    // Random & Useless Websites
    "theuselessweb.com",
    "pointerpointer.com",
    "thisiswhyimbroke.com",
    "eelslap.com",
    "cat-bounce.com",
    "hackertyper.com",
    "corndog.io",
    "paper-io.com",
    "agar.io",
    "slither.io"
  ];
  
  const neutralSites = [
    // Search Engines
    // "google.com",
    "bing.com",
    "duckduckgo.com",
    "yahoo.com",
  
    // News & Information
    "bbc.com",
    "cnn.com",
    "reuters.com",
    "nytimes.com",
    "theguardian.com",
    "wsj.com",
  
    // Online Tools & Utilities
    "wolframalpha.com",
    "calculator.com",
    "weather.com",
    "timeanddate.com",
    "canva.com",
    "unsplash.com",
    "pexels.com",
    "pixabay.com",
  
    // Educational Resources
    "wikipedia.org",
    "britannica.com",
    "dictionary.com",
    "thesaurus.com",
  
    // Technology & Software
    "techcrunch.com",
    "github.com",
    "bitbucket.org",
    "gitlab.com",
  
    // Cloud Services
    "dropbox.com",
    "onedrive.live.com",
    "google.com/drive",
    "box.com",
  
    // Productivity
    "evernote.com",
    "workflowy.com",
    "simplenote.com",
    "notion.so",
    "trello.com",
    "asana.com",
    "monday.com",
    "slack.com",
  
    // Community & Collaboration
    "stackoverflow.com",
    "dev.to",
    "hashnode.com",
    "quora.com",
    "reddit.com",
    "medium.com",
  
    // Online Storage & File Sharing
    "drive.google.com",
    "dropbox.com",
    "box.com",
    "pcloud.com",
  
    // Photography & Design Tools
    "flickr.com",
    "500px.com",
    "pixlr.com",
    "canva.com",
  
    // Miscellaneous
    "archive.org",
    "imdb.com",
    "goodreads.com",
    "howstuffworks.com"
];

const themes = {
  anime: [
      "anime", "manga", "light novel", "visual novel", "otaku",
      "shonen", "shoujo", "seinen", "josei", "harem", "mecha", "slice of life",
      "ecchi", "doujin", "hentai", "yaoi", "yuri", "shoujo-ai", "shounen-ai",
      "seiyuu", "anime news", "anime reviews",
      "anime list", "anime streaming", "anime episode",
      "MyAnimeList", "Anilist", "Kitsu", "Crunchyroll", "Funimation",
      "HIDIVE", "VRV", "9anime", "Gogoanime", "AnimePlanet", "BakaBT",
      "AnimeUltima", "AnimeFLV", "AnimeHeaven", "AnimeLab",
      "Naruto", "Bleach", "One Piece", "Attack on Titan", "Demon Slayer", "Jujutsu Kaisen",
      "Chainsaw Man", "Tokyo Ghoul", "My Hero Academia", "Hunter x Hunter", "Sword Art Online",
      "Re:Zero", "Steins;Gate", "Death Note", "Fullmetal Alchemist", "Dragon Ball", 
      "Neon Genesis Evangelion", "Cowboy Bebop", "Ghost in the Shell", "Akira", 
      "Vivy", "Gintama", "Black Clover", "Fairy Tail",
      "manhwa", "webtoon", "korean comics", "manga scan", "manga raw", 
      "tower of god", "solo leveling", "the beginning after the end",
      "omniscient reader's viewpoint", "lookism",
      "true beauty", "the gamer", "god of high school", "noblesse", "bastard",
      "sweet home", "reborn rich", "manga scan", "manga raw", "isekai manhwa"
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

export {productivityAndCodingSites, unproductiveSites, neutralSites, themes}