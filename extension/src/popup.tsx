import { useMemo } from "react"
import { Logo, RightArrow } from "~components/icons"
import { usePort } from "@plasmohq/messaging/hook"
import { curDate } from "~utils/dates"
import { useStorage } from "@plasmohq/storage/hook"

import "~style.css"
import type { SiteTime } from "~tracker/types"

type RequestBody = {
    data: string
}

type ResponseBody = {
    message: string
    success: boolean
}

function IndexPopup() {

    // Storage handling
    const [allSitesTimes] = useStorage('allSitesTimes');

    const dailyTimeSpent = useMemo((): number => {
        if (!allSitesTimes || !allSitesTimes[curDate]) return 0;
        return Object.values(allSitesTimes[curDate])
            .reduce<number>((acc: number, site: SiteTime) => { return acc + site.totalMinutes }, 0)
    }, [allSitesTimes, curDate]);

    const renderDailyTotal = useMemo(() => {
        const dailyHoursSpent = Math.floor(dailyTimeSpent / 60);
        const dailyMinutesSpent = Math.trunc(dailyTimeSpent % 60);

        const TimeUnit = ({ value, unit }) => {
            if (value === 0) return null;

            return (
                <>
                    <span className="italic">{value}</span> {unit}{value !== 1 ? 's ' : ' '}
                </>
            )
        }

        return (
            <strong className="text-sm">
                Daily Total:{' '}
                <TimeUnit value={dailyHoursSpent} unit="hour" />
                <TimeUnit value={dailyMinutesSpent} unit="minute" />
            </strong>
        )

    }, [dailyTimeSpent]);

    // Port handling
    const optionsPort = usePort<RequestBody, ResponseBody>("openOptionsPage");

    const handleClick = async () => {
        // Send message to background sw to open up options.html
        optionsPort.send({ data: "alohomora" });
        return;
    }

    return (
        <div className="flex flex-col h-44 w-80 text-[#ffffff]">
            <div className="flex bg-container-outline">
                <div className="flex px-4 pt-2 w-full">
                    <div className="flex flex-col w-[80%]">
                        <strong className="text-primary font-bold text-xl">ZenSurf</strong>
                        <p className="italic text-muted">Stay focused, distraction free</p>
                    </div>
                    <div className="flex grow w-[20%] item-end justify-center">
                        <div>
                            <Logo className="my-auto h-16 w-16" />
                        </div>
                    </div>
                </div>
            </div>


            <div className="flex grow bg-background">
                <div className="flex flex-col px-4 pb-4">

                    <div className="flex flex-col grow justify-center text-secondary">
                        <div className="flex items-center">
                            <div className="w-4 transition-[padding] duration-300 ease-out">
                                <span className="w-1 h-1 rounded-full bg-secondary block animate-pulse-dot"></span>
                            </div>
                            {renderDailyTotal}
                        </div>
                    </div>


                    <div className="flex flex-col justify-end">
                        <div className="flex cursor-pointer h-9 p-2 items-center transition-all rounded-[4px]
                        focus-visible:outline focus-visible:outline-neutral-800
                        bg-primary-light hover:bg-primary active:scale-[98%] w-32" onClick={() => handleClick()}>

                            <span className="uppercase text-sm flex items-center">
                                <RightArrow className="h-5 w-5" />
                            </span>

                            <span className="uppercase text-sm flex items-center">
                                view more
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default IndexPopup
