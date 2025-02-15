import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getBrowserAPI } from "~utils/browser-api"


const triggerOpenOptionsPage = async () => {
    const browserAPI = getBrowserAPI();
    return browserAPI.runtime.openOptionsPage();
}

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
    const { data } = req.body;

    if (data == "alohomora") {
        try {
            await triggerOpenOptionsPage();

            res.send({
                message: "Opened Options",
                success: true
            });
        } catch (err) {
            res.send({
                message: "Error detecting browser",
                success: true
            });

        }
    } else {
        res.send({
            message: "Incorrect Data",
            success: false
        });
    }
}

export default handler
