import React from 'react';
import { PieChart, Pie, Cell, Label } from 'recharts';
import type { RechartProps } from './types';


interface LockedInChartProps extends RechartProps {
    width: number;
    height: number;
    centerText?: string
    onMouseEnterCallback: () => void;
}

export default function LockedInChart({ colors, data, centerText, width, height, onMouseEnterCallback, className }: LockedInChartProps) {
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
                    onMouseEnter={() => onMouseEnterCallback()}
                    stroke="none"
                >
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                </Pie>
            ))}

            {/* Centered Text */}
            <text x={Math.floor(width / 2)} y={Math.floor(height / 2)} textAnchor="middle" dominantBaseline="middle" fill='#fff' fontSize={12}>
                {centerText}
            </text>


        </PieChart>
    );
}
