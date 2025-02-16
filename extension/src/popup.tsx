import { useMemo, useEffect, useState } from "react"
import { Logo, RightArrow } from "~components/icons"
import { usePort } from "@plasmohq/messaging/hook"
import { curDate } from "~utils/dates"
import { useStorage } from "@plasmohq/storage/hook"
import { Flame } from "lucide-react"
import axios from "axios"

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
    const [walletId] = useStorage<string>('walletId');

    const [currentStreak, setCurrentStreak] = useState(0);

    const isLockedInSite = (url: string) => {
        if (url === '$idle') return false;

        // TODO: Implement using Ram's code
        return true;
    }

    useEffect(() => {
        const getCurrentStreak = async () => {
            if (!walletId) {
                setCurrentStreak(0);
                return;
            }

            try {
                const response = await axios.get(`${process.env.PLASMO_PUBLIC_SERVER_URL}/get-streak/?wallet_id=${walletId}`);
                if (response) {
                    setCurrentStreak(response.data.streak_count);
                }
            } catch (error) {
                console.error("Error calculating streak:", error);
                setCurrentStreak(0);
            }
        };

        getCurrentStreak();
    }, [walletId]); // Add walletId as a dependency

    // Now currentStreak is 0 initially, and will be updated once the async function completes

    const dailyTimeSpent = useMemo((): number => {
        if (!allSitesTimes || !allSitesTimes[curDate]) return 0;
        return Object.values(allSitesTimes[curDate])
            .reduce<number>((acc: number, site: SiteTime) => { return acc + (isLockedInSite(site.url) ? site.totalMinutes : 0) }, 0)
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

            <div className="flex flex-col grow w-full bg-background">

                <div className="flex flex-col w-full pb-4">
                    <div className="flex bg-container-outline w-full">
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
                </div>

                <div className="flex flex-col w-full px-4 pb-4">

                    <div className="flex flex-col space-y-2 grow justify-center text-secondary">
                        <div className="flex items-center">
                            <div className="w-4 transition-[padding] duration-300 ease-out">
                                <span className="w-1 h-1 rounded-full bg-secondary block animate-pulse-dot"></span>
                            </div>
                            {renderDailyTotal}
                        </div>

                        <div className="flex items-center">
                            <Flame className="text-[#ec6453]" />
                            <span className="text-[#ec6453] font-serif text-base pt-[4px]">Current active streak: {currentStreak}</span>
                        </div>


                    </div>


                    <div className="flex flex-col pt-6 justify-end">
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
