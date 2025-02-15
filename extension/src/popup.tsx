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

    const isLockedInSite = (url: string) => {
        if (url === '$idle') return false;

        // TODO: Implement using Ram's code
        return true;
    }

    const dailyTimeSpent = useMemo((): number => {
        if (!allSitesTimes || !allSitesTimes[curDate]) return 0;
        return Object.values(allSitesTimes[curDate])
            .reduce<number>((acc: number, site: SiteTime) => { return acc + (isLockedInSite(site.url) ? 0 : site.totalMinutes) }, 0)
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
    const lockedInData = [
        {
            name: "Locked in time",
            value: dailyTimeSpent
        },
        {
            name: "Total Goal",
            value: 3 * 60
        },
    ]

    const lockedInColors = ['#DF3F17', '#878788'];

    return (
        <div className="flex flex-col h-44 w-80 text-[#ffffff]">

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
