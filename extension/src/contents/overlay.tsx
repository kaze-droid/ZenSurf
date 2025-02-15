import React from "react";
import { useAppSelector, useAppDispatch } from "~store";
import { productivityAndCodingSites, unproductiveSites } from "~contents/websites";
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

import money from "data-base64:~assets/money.gif";
import { setBad, setConfused } from "~cat-slice";
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
    const isFirstRender = React.useRef(true); // Track first render
    const [blockedTopics, setBlockedTopics] = useStorage<string[]>('blockedTopics', (v) => v === undefined ? [] : v);
    // Update GIF when the domain changes
    React.useEffect(() => {
        if (unproductiveSites.includes(domain)) {
            dispatch(setBad());
        } else if (productivityAndCodingSites.includes(domain)) {
            dispatch(setGood());
        } else {
            dispatch(setConfused());
        }
    }, [domain]);

    const value = useAppSelector((state) => state.counter.mood);

    React.useEffect(() => {
        setgifURLShow(gifURLs[value]);
    }, [value]);

    // Temporary money GIF effect, but not on first render
    React.useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false; // Set it to false after first render
            return;
        }

        let previousGif = gifURLShow;
        setgifURLShow(money);
        setTimeout(() => {
            setgifURLShow(previousGif);
        }, 1000);
    }, [value]);

    return (
        <img
            id="catGif"
            src={gifURLShow}
            alt="Capybara GIF"
            style={{
                borderRadius: 8,
                position: "absolute",
                top: "10vh",
                left: "90vw",
                width: 100,
                height: 100,
                pointerEvents: "none"
            }}
        />
    );
};


export default PlasmoPricingExtra;
