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
        <Card className="w-full max-w-4xl">
            <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Time Spent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex">
                    <div className="mr-2">
                        {weekdays.map((day, i) => (
                            <div key={day} className="h-6 text-sm text-gray-400 mb-1">
                                {i % 2 === 0 ? day : ''}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-1">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-1">
                                {week.map((day) => (
                                    <TooltipProvider key={day.date}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <div
                                                    className={`w-6 h-6 rounded ${getColor(day.timeSpent)}`}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-sm">{day.date}: {day.timeSpent || 0} minutes</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                    <span>Less</span>
                    <div className="w-6 h-6 bg-gray-100 rounded" />
                    <div className="w-6 h-6 bg-orange-100 rounded" />
                    <div className="w-6 h-6 bg-orange-200 rounded" />
                    <div className="w-6 h-6 bg-orange-300 rounded" />
                    <div className="w-6 h-6 bg-orange-400 rounded" />
                    <span>More</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default TimeSpentHeatmap;
