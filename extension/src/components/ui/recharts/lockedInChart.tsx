import React from 'react';
import { PieChart, Pie, Cell, Label } from 'recharts';
import type { RechartProps } from './types';


interface LockedInChartProps extends RechartProps {
    width: number;
    height: number;
}

export default function LockedInChart({ colors, data, width, height, className }: LockedInChartProps) {
    if (data[0].value > data[1].value) {
        data[1].value = data[0].value
    }
    return (
        <PieChart width={width} height={height} className={className}>
            {data.map((entry, index) => (
                <Pie
                    key={`pie-${index}`}
                    data={[entry]}
                    cx={Math.floor(width / 2)}
                    cy={Math.floor(height / 2)}
                    innerRadius={index === 0 ? 70 : 75}
                    outerRadius={index === 0 ? 85 : 80}
                    startAngle={index === 0 ? 0 : ((data[0].value) / data[1].value) * 360}
                    endAngle={index === 0 ? ((data[0].value) / data[1].value) * 360 : 360}
                    fill="#8884d8"
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                >
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                </Pie>
            ))}

            {/* Centered Text */}
            <text x={Math.floor(width / 2) + 4} y={Math.floor(height / 2) + 7} textAnchor="middle" dominantBaseline="middle" fill='#fff' fontSize={30}>
                {Math.min(Math.floor((data[0].value / data[1].value) * 100), 100)}%
            </text>


        </PieChart>
    );
}
