import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

const TimeSpentHeatmap = ({ data }) => {
    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const getColor = (timeSpent) => {
        if (!timeSpent) return 'bg-gray-100';
        if (timeSpent < 1 * 60) return 'bg-orange-100';
        if (timeSpent < 2 * 60) return 'bg-orange-200';
        if (timeSpent < 4 * 60) return 'bg-orange-300';
        return 'bg-orange-400';
    };

    const generateCalendarData = () => {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 180);

        const weeks = [];
        let currentWeek = [];
        let currentDate = getStartOfWeek(startDate);

        while (currentDate <= today) {
            if (currentDate.getDay() === 0 && currentWeek.length > 0) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            currentWeek.push({
                date: formatDate(currentDate),
                timeSpent: data[formatDate(currentDate)] || 0
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    };

    const weeks = generateCalendarData();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Time Spent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex">
                    <div className="mr-1">
                        {weekdays.map((day, i) => (
                            <div key={day} className="h-3 text-xs text-gray-400 mb-[2px]">
                                {i % 2 === 0 ? day[0] : ''}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-[2px]">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-[2px]">
                                {week.map((day) => (
                                    <TooltipProvider key={day.date}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <div
                                                    className={`w-3 h-3 rounded-sm ${getColor(day.timeSpent)}`}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">{day.date}: {day.timeSpent || 0} minutes</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs">
                    <span>Less</span>
                    <div className="w-3 h-3 bg-gray-100 rounded-sm" />
                    <div className="w-3 h-3 bg-orange-100 rounded-sm" />
                    <div className="w-3 h-3 bg-orange-200 rounded-sm" />
                    <div className="w-3 h-3 bg-orange-300 rounded-sm" />
                    <div className="w-3 h-3 bg-orange-400 rounded-sm" />
                    <span>More</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default TimeSpentHeatmap;
