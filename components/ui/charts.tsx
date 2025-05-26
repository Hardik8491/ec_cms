"use client";

import {
    BarChart as RechartsBarChart,
    Bar,
    LineChart as RechartsLineChart,
    Line,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function BarChart({
    data,
}: {
    data: { name: string; value: number }[];
}) {
    return (
        <ResponsiveContainer width='100%' height='100%'>
            <RechartsBarChart data={data}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='value' fill='#8884d8' />
            </RechartsBarChart>
        </ResponsiveContainer>
    );
}

export function LineChart({
    data,
}: {
    data: { name: string; value: number }[];
}) {
    return (
        <ResponsiveContainer width='100%' height='100%'>
            <RechartsLineChart data={data}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type='monotone' dataKey='value' stroke='#8884d8' />
            </RechartsLineChart>
        </ResponsiveContainer>
    );
}

export function PieChart({
    data,
}: {
    data: { name: string; value: number }[];
}) {
    return (
        <ResponsiveContainer width='100%' height='100%'>
            <RechartsPieChart>
                <Pie
                    data={data}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                    nameKey='name'
                    label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                        />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </RechartsPieChart>
        </ResponsiveContainer>
    );
}
