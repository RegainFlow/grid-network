import React from 'react';
import { Icons } from './Icons';

export interface Sensor {
    id: string;
    name: string;
    category: 'power' | 'thermal' | 'vibration' | 'pressure' | 'flow' | 'status';
    unit: string;
    normalRange: [number, number];
}

interface SensorFilterProps {
    sensors: Sensor[];
    selectedSensor: Sensor;
    onSensorChange: (sensor: Sensor) => void;
    totalSensors?: number;
}

const categoryIcons: Record<string, any> = {
    power: Icons.Zap,
    thermal: Icons.Temp,
    vibration: Icons.Activity,
    pressure: Icons.Gauge,
    flow: Icons.Droplets,
    status: Icons.Check
};

const categoryColors: Record<string, string> = {
    power: 'text-primary',
    thermal: 'text-purple-400',
    vibration: 'text-blue-400',
    pressure: 'text-orange-400',
    flow: 'text-cyan-400',
    status: 'text-green-400'
};

export const SensorFilter: React.FC<SensorFilterProps> = ({
    sensors,
    selectedSensor,
    onSensorChange,
    totalSensors = 5247
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterCategory, setFilterCategory] = React.useState<string>('all');

    const filteredSensors = sensors.filter(sensor => {
        const matchesSearch = sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sensor.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || sensor.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...Array.from(new Set(sensors.map(s => s.category)))];
    const Icon = categoryIcons[selectedSensor.category];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="glass-panel px-4 py-2 rounded-lg border border-white/10 hover:border-primary/30 transition-all flex items-center gap-3 min-w-[280px]"
            >
                <Icon size={18} className={categoryColors[selectedSensor.category]} />
                <div className="flex-1 text-left">
                    <div className="text-xs text-gray-400">Sensor</div>
                    <div className="text-sm font-semibold text-white">{selectedSensor.name}</div>
                </div>
                <div className="text-xs text-gray-500 font-mono">{selectedSensor.id}</div>
                <Icons.ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full mt-2 left-0 right-0 bg-[#121213] border border-white/10 rounded-lg shadow-xl z-[100] max-h-[400px] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-3 border-b border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-400">SELECT SENSOR</span>
                                <span className="text-xs text-primary font-mono">{totalSensors.toLocaleString()}+ Available</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Search sensors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="px-3 py-2 border-b border-white/10 flex gap-2 overflow-x-auto">
                            {categories.map((cat: string) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`text-xs px-2 py-1 rounded transition-all whitespace-nowrap ${filterCategory === cat
                                        ? 'bg-primary/20 text-primary border border-primary/40'
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {cat.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {/* Sensor List */}
                        <div className="overflow-y-auto flex-1">
                            {filteredSensors.map(sensor => {
                                const SensorIcon = categoryIcons[sensor.category];
                                return (
                                    <button
                                        key={sensor.id}
                                        onClick={() => {
                                            onSensorChange(sensor);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-white/5 transition-colors ${selectedSensor.id === sensor.id ? 'bg-primary/10' : ''
                                            }`}
                                    >
                                        <SensorIcon size={16} className={categoryColors[sensor.category]} />
                                        <div className="flex-1 text-left">
                                            <div className="text-sm text-white">{sensor.name}</div>
                                            <div className="text-xs text-gray-500">{sensor.category} • {sensor.unit}</div>
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono">{sensor.id}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
