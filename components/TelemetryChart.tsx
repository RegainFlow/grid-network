import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { SensorMetric } from '../types';

interface TelemetryChartProps {
  data: SensorMetric[];
  sensorCategory: string; // 'power', 'thermal', etc.
  unit: string;
}

const categoryColors: Record<string, string> = {
  power: '#00d6cb', // primary
  thermal: '#a855f7', // purple
  vibration: '#3b82f6', // blue
  pressure: '#f97316', // orange
  flow: '#06b6d4', // cyan
  status: '#10b981', // green
};

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 rounded-lg border border-primary/20 shadow-xl">
        <p className="font-mono text-xs text-gray-400 mb-1">{label}</p>
        <p className="font-bold text-sm" style={{ color: payload[0].stroke }}>
          Value: {payload[0].value.toFixed(2)} {unit}
        </p>
      </div>
    );
  }
  return null;
};

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ data, sensorCategory, unit }) => {
  // Determine which data key to plot based on category
  // If category matches a key in SensorMetric, use it; otherwise default to voltage (fallback)
  // SensorMetric keys: voltage, temperature, vibration, pressure, flow
  const validKeys = ['voltage', 'temperature', 'vibration', 'pressure', 'flow'];
  const dataKey = validKeys.includes(sensorCategory) ? sensorCategory : 'voltage';

  const color = categoryColors[sensorCategory] || '#00d6cb';

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`color${sensorCategory}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
            width={40}
            tickFormatter={(value) => value.toFixed(0)}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#color${sensorCategory})`}
          />
          {data.map((entry, index) => (
            entry.isAnomaly && <ReferenceLine key={index} x={entry.timestamp} stroke="#ef4444" strokeDasharray="3 3" />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
