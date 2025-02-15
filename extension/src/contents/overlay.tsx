import React from "react";
import { useAppSelector } from "~store";
import { productivityAndCodingSites, unproductiveSites } from "contents/websites";

import angryCapy from "data-base64:~assets/angry_capy.gif";
import confusedCapy from "data-base64:~assets/confused_capy.gif";
import loveCapy from "data-base64:~assets/love_capy.gif";
import questionCapy from "data-base64:~assets/question_capy.gif";
import shockCapy from "data-base64:~assets/shock_capy.gif";
import spaCapy from "data-base64:~assets/spa_capy.gif";
import chillCapy from "data-base64:~assets/chill_capy.gif";
import singingCapy from "data-base64:~assets/singing_capy.gif";

import money from "data-base64:~assets/money.gif";

const positiveCapyGifs = [loveCapy, spaCapy, chillCapy, singingCapy];
const negativeCapyGifs = [angryCapy, confusedCapy, questionCapy, shockCapy];

const PlasmoPricingExtra = ({ domain }) => {
    const [gifURLShow, setgifURLShow] = React.useState(loveCapy);
    const isFirstRender = React.useRef(true); // Track first render

    // Update GIF when the domain changes
    React.useEffect(() => {
        if (unproductiveSites.includes(domain)) {
            setgifURLShow(negativeCapyGifs[Math.floor(Math.random() * negativeCapyGifs.length)]);
        } else {
            setgifURLShow(positiveCapyGifs[Math.floor(Math.random() * positiveCapyGifs.length)]);
        }
    }, [domain]);

    const value = useAppSelector((state) => state.counter.mood);

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
