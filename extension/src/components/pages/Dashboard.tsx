import React, { useState, useEffect, useMemo } from 'react'
import LockedInChart from '~components/ui/recharts/lockedInChart'
import { useStorage } from "@plasmohq/storage/hook"
import { curDate } from '~utils/dates';
import type { SiteTime } from '~tracker/types';
import TimeSpentHeatmap from '~components/ui/recharts/timeSpentHeatmap';
import { Flame } from 'lucide-react';
import axios from 'axios';
import ActiveShapePieChart from '~components/ui/recharts/activeShapePieChart';

export default function Dashboard() {
    const [allSitesTimes, setAllSitesTimes] = useStorage('allSitesTimes', (v) => v === undefined ? {} : v);
    const [walletId] = useStorage('walletId');
    const [currentStreak, setCurrentStreak] = useState(0);


    const [donutSplitData, setDonutSplitData] = useState([]);

    const isLockedInSite = (url: string) => {
        if (url === '$idle') return false;

        return true;
    }

    const dailyTimeSpent = useMemo((): number => {
        if (!allSitesTimes || !allSitesTimes[curDate]) return 0;
        return Object.values(allSitesTimes[curDate])
            .reduce<number>((acc: number, site: SiteTime) => { return acc + (isLockedInSite(site.url) ? site.totalMinutes : 0) }, 0)
    }, [allSitesTimes, curDate]);



    const getDailyTotalString = useMemo(() => {
        const dailyTimeLeftForStreak = Math.max((3 * 60) - dailyTimeSpent, 0);

        if (dailyTimeLeftForStreak == 0) {
            return `Daily Streak Completed!`;
        }
        const dailyHoursSpent = Math.floor(dailyTimeLeftForStreak / 60);
        const dailyMinutesSpent = Math.trunc(dailyTimeLeftForStreak % 60);

        const TimeUnit = (value: number, unit: string) => {
            if (value === 0) return '';

            return `${value} ${unit}${value !== 1 ? 's ' : ' '}`
        }

        return `Time left for streak: ${TimeUnit(dailyHoursSpent, "hour")}${TimeUnit(dailyMinutesSpent, "minute")}`
    }, [dailyTimeSpent]);

    const getDonutSplitData = async () => {
        if (!allSitesTimes || !allSitesTimes[curDate]) return [];

        const newArr = [];

        for (let urlTime of Object.values(allSitesTimes[curDate])) {
            const { url, totalMinutes } = urlTime as SiteTime;
            if (!url || !totalMinutes) continue;

            newArr.push({ name: url, value: totalMinutes });
        }

        return newArr;
    };


    useEffect(() => {
        getDonutSplitData()
            .then(data => setDonutSplitData(data))
            .catch(error => console.error("Error calculating distribution:", error));
    }, [curDate, allSitesTimes]); // Add appropriate dependencies

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

    const timeSpentData = useMemo(() => {
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 180);

        const allData = {};

        // Create a loop date that we'll increment
        const currentDate = new Date(startDate);

        // Loop while currentDate is less than or equal to endDate
        while (currentDate <= endDate) {
            // Format date as '14-feb-2025'
            const heatmapDate = currentDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).toLowerCase().replace(/ /g, '-');

            // Format date as '2025-02-14'
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + 1);
            const reformattedHeatmapDate = nextDate.toISOString().split('T')[0];

            if (!allSitesTimes || !allSitesTimes[heatmapDate]) {
                // Increment date by 1 day
                currentDate.setDate(currentDate.getDate() + 1);
                continue;
            }

            allData[reformattedHeatmapDate] = Math.floor(Object.values(allSitesTimes[heatmapDate])
                .reduce<number>((acc: number, site: SiteTime) => {
                    return acc + (isLockedInSite(site.url) ? site.totalMinutes : 0)
                }, 0));

            // Increment date by 1 day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return allData;
    }, [allSitesTimes]);

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
    return (
        <div className='space-y-3 flex flex-col w-full h-full'>
            <div className='flex space-x-3 w-full h-[50%]'>

                <div className='flex flex-col bg-container rounded-md border border-2 border-container-outline p-8 w-[70%] h-full'>
                    <TimeSpentHeatmap data={timeSpentData} />
                </div>

                <div className='flex flex-col bg-container rounded-md border border-2 border-container-outline p-8 w-[30%] h-full'>
                    <h2 className="text-3xl bold text-center">Money Earned: </h2>

                    <span className='bold text-green-300 h-full text-center text-7xl mt-[4rem]'>↑ 7.54€</span>
                </div>

            </div>


            <div className='flex space-x-3 w-full h-[50%]'>

                <div className='flex flex-col bg-container rounded-md border border-2 border-container-outline p-8 w-[33%] h-full justify-center items-center'>
                    <LockedInChart data={lockedInData} colors={lockedInColors} height={300} width={300} />
                    <div className='z-1 relative bottom-[3.25rem] text-muted font-mono'>{getDailyTotalString}</div>
                </div>

                <div className='flex flex-col bg-container rounded-md border border-2 border-container-outline p-8 pb-0 w-[33%] h-full items-center justify-center'>
                    <Flame fill="#ec6453" className="text-[#ec6453] h-36 w-36" />

                    <div className='z-1 relative text-muted font-mono mt-6'>Achieved <span className='bold text-lg'>{currentStreak}</span> day streak</div>
                </div>


                <div className='flex flex-col bg-container rounded-md border border-2 border-container-outline p-8 w-[33%] h-full items-center justify-center'>
                    <ActiveShapePieChart data={donutSplitData} height={300} width={350} />
                    <div className='z-1 relative bottom-[3.25rem] text-muted font-mono'>Time Spent Distribution</div>
                </div>

            </div>

        </div>
    )
}

