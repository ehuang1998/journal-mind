"use client"

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer
  } from 'recharts';
  
  interface MoodDataPoint {
    subject: string;
    value: number;
    fullMark: number;
  }
  
  interface MoodRadarChartProps {
    data: MoodDataPoint[];
  }
  
  export default function MoodRadarChart({ data }: MoodRadarChartProps) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Mood"
            dataKey="value"
            stroke="var(--color-primary)"
            fill="var(--color-primary)"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    );
  }