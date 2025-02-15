import React from "react";
import { useAppSelector, useAppDispatch } from "~store";
import { neutralSites, productivityAndCodingSites, unproductiveSites, themes } from "~contents/websites";
import { useStorage } from "@plasmohq/storage/hook"

// import angryCapy from "data-base64:~assets/angry_capy.gif";
// import confusedCapy from "data-base64:~assets/confused_capy.gif";
// import loveCapy from "data-base64:~assets/love_capy.gif";
// import questionCapy from "data-base64:~assets/question_capy.gif";
// import shockCapy from "data-base64:~assets/shock_capy.gif";
// import spaCapy from "data-base64:~assets/spa_capy.gif";
// import chillCapy from "data-base64:~assets/chill_capy.gif";
// import singingCapy from "data-base64:~assets/singing_capy.gif";

import goodCapy from "data-base64:~assets/good.gif";
import badCapy from "data-base64:~assets/bad.gif";
import penaliseCapy from "data-base64:~assets/penalise.gif";
import rewardCapy from "data-base64:~assets/reward.gif";
import confusedCapy from "data-base64:~assets/confused.gif";
import neutralCapy from "data-base64:~assets/neutral.gif";
import idleCapy from "data-base64:~assets/idle.gif";
import streakCapy from "data-base64:~assets/streak.gif";
import chatBubble from "data-base64:~assets/chatBubble.png";

import { setBad, setNeutral, setConfused } from "~cat-slice";
import { setGood } from "~cat-slice";

// const positiveCapyGifs = [loveCapy, spaCapy, chillCapy, singingCapy];
// const negativeCapyGifs = [angryCapy, confusedCapy, questionCapy, shockCapy];

const gifURLs = {
    "good": goodCapy,
    "bad": badCapy,
    "penalise": penaliseCapy,
    "reward": rewardCapy,
    "confused": confusedCapy,
    "neutral": neutralCapy,
    "idle": idleCapy,
    "streak": streakCapy
}

const PlasmoPricingExtra = ({ domain }) => {
    const dispatch = useAppDispatch();
    const [gifURLShow, setgifURLShow] = React.useState(neutralCapy);
    const [avatarMsg, setAvatarMsg] = React.useState("");
    const isFirstRender = React.useRef(true); // Track first render
    const [blockedTopics, setBlockedTopics] = useStorage<string[]>('blockedTopics', (v) => v === undefined ? [] : v);
    // Update GIF when the domain changes
    React.useEffect(() => {
        // Only run the check if we have a domain
        if (!domain) return;

        // First check the unproductive and productive sites
        if (unproductiveSites.includes(domain)) {
            dispatch(setBad());
            setAvatarMsg("Hmmmmmm, what is this website doing here?");
            return;
        } 
        if (productivityAndCodingSites.includes(domain)) {
            dispatch(setGood());
            setAvatarMsg("Looking good!");
            return;
        } 

        // Check for blocked content in all other cases
        const pageHTML = document.documentElement.innerText;

        // Count occurrences of each theme's keywords
        const blockedThemes = Object.keys(themes).filter(theme => {
            // Count total occurrences of all keywords for this theme
            const occurrences = themes[theme].reduce((count, keyword) => {
                const regex = new RegExp(keyword, 'gi');
                const matches = pageHTML.match(regex);
                return count + (matches ? matches.length : 0);
            }, 0);
            
            // Theme is considered blocked if keywords appear at least 3 times
            return occurrences >= 3;
        });

        console.log('Blocked themes and their occurrences:', blockedThemes);
        if (blockedThemes.length > 0) {
            dispatch(setConfused());
            // specify what the blocked themes are
            setAvatarMsg(`I'm not sure about this website. It seems to be about ${blockedThemes.join(", ")}.`);
        } else {
            dispatch(setNeutral());
            setAvatarMsg("Looks like a normal website to me.");
        }
    }, [domain]); // Only depend on domain changes

    const value = useAppSelector((state) => state.counter.mood);

    React.useEffect(() => {
        setgifURLShow(gifURLs[value]);
    }, [value]);

    React.useEffect(() => {
        // only show for a few seconds
        if (avatarMsg !== "") {
            setTimeout(() => {
                setAvatarMsg("");
            }, 2000);
        }
    }, [avatarMsg]);

    return (
        <>
            <img
                id="catGif"
                src={gifURLShow}
                alt="Capybara GIF"
                style={{
                borderRadius: 8,
                position: "absolute",
                top: "10vh",
                left: "90vw",
                width: "10vw",
                height: "10vw",
                pointerEvents: "none"
            }}
            />
            {avatarMsg !== "" && (
                <>
                <img
                    id="chatBubble"
                    src={chatBubble}
                alt="Chat Bubble"
                style={{
                    borderRadius: 8,
                    position: "absolute",
                    top: "8vh",
                    left: "80vw",
                    width: "10vw",
                    height: "10vw",
                    pointerEvents: "none"
                }}
            />
            <div id="avatarMsg" style={{
                borderRadius: 8,
                position: "absolute",
                top: "10vh",
                left: "81vw",
                    width: "8vw",
                    height: "10vw",
                    pointerEvents: "none",
                    fontWeight: "bold",
                    textAlign: "center",
                    fontSize: "1vw",
                    color: "black",
                }}>{avatarMsg}</div>
            </>
            )}
        </>
    );
};


export default PlasmoPricingExtra;
