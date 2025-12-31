import React, { useState, useEffect } from 'react';
import { StatCard } from './components/StatCard';
import { TelemetryChart } from './components/TelemetryChart';
import { GridVisualizer } from './components/GridVisualizer';
import { SensorFilter, Sensor } from './components/SensorFilter';
import { NetworkNav } from './components/NetworkNav';
import { analyzeAnomaly } from './services/geminiService';
import { AnomalyEvent, SensorMetric, NodeStats } from './types';
import { Icons } from './components/Icons';

// --- MOCK DATA GENERATION ---
const generateSensorData = (points: number, sensor: Sensor, nodeId: string): SensorMetric[] => {
  const data: SensorMetric[] = [];
  const now = new Date();
  const [min, max] = sensor.normalRange;
  const range = max - min;

  // Use nodeId to create slight variations in data patterns
  const nodeModifier = nodeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;

  for (let i = points; i > 0; i--) {
    const time = new Date(now.getTime() - i * 1000 * 60);
    const isAnomaly = Math.random() > 0.98; // Rare historical anomalies
    const baseValue = min + range / 2;

    // Add some noise and variation based on node
    const noise = (Math.random() - 0.5) * (range * 0.05);
    const trend = Math.sin(i * 0.1 + nodeModifier) * (range * 0.15);

    data.push({
      timestamp: time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
      voltage: sensor.category === 'power' ? baseValue + trend + noise + (isAnomaly ? range * 0.3 : 0) : 120,
      temperature: sensor.category === 'thermal' ? baseValue + trend + noise + (isAnomaly ? range * 0.3 : 0) : 60,
      vibration: sensor.category === 'vibration' ? baseValue + trend + noise + (isAnomaly ? range * 0.5 : 0) : 0,
      pressure: sensor.category === 'pressure' ? baseValue + trend + noise + (isAnomaly ? range * 0.4 : 0) : 3000,
      flow: sensor.category === 'flow' ? baseValue + trend + noise + (isAnomaly ? range * 0.4 : 0) : 500,
      signalStrength: -40 + Math.random() * 5,
      isAnomaly: isAnomaly && Math.random() > 0.5
    });
  }
  return data;
};

// Mock sensors for Industrial IoT
const mockSensors: Sensor[] = [
  { id: 'PWR-MAINS-A', name: 'Main Bus Voltage A', category: 'power', unit: 'kV', normalRange: [11.8, 12.2] },
  { id: 'PWR-MAINS-B', name: 'Main Bus Voltage B', category: 'power', unit: 'kV', normalRange: [11.8, 12.2] },
  { id: 'THM-TR-01', name: 'Transformer Core Temp', category: 'thermal', unit: '°C', normalRange: [65, 85] },
  { id: 'THM-TR-02', name: 'Transformer Oil Temp', category: 'thermal', unit: '°C', normalRange: [50, 70] },
  { id: 'VIB-GEN-01', name: 'Turbine Vibration X', category: 'vibration', unit: 'mm/s', normalRange: [0, 4.5] },
  { id: 'VIB-GEN-02', name: 'Turbine Vibration Y', category: 'vibration', unit: 'mm/s', normalRange: [0, 4.5] },
  { id: 'PRS-HYD-01', name: 'Hydraulic Pressure', category: 'pressure', unit: 'psi', normalRange: [2800, 3100] },
  { id: 'PRS-LUBE-01', name: 'Lube Oil Pressure', category: 'pressure', unit: 'psi', normalRange: [40, 60] },
  { id: 'FLO-COOL-01', name: 'Coolant Flow Rate', category: 'flow', unit: 'L/min', normalRange: [450, 550] },
  { id: 'STA-LINK-01', name: 'Uplink Status', category: 'status', unit: '%', normalRange: [99, 100] },
];

// Mock Grid Nodes
const mockNodes: NodeStats[] = [
  { id: 'NODE-001', name: 'SUBSTATION-ALPHA', status: 'nominal', health: 98, zone: 'Zone A - Industrial', lastContact: '0ms' },
  { id: 'NODE-002', name: 'SUBSTATION-BETA', status: 'nominal', health: 99, zone: 'Zone A - Industrial', lastContact: '12ms' },
  { id: 'NODE-003', name: 'PLANT-GAMMA', status: 'degraded', health: 87, zone: 'Zone B - Manufacturing', lastContact: '45ms' },
  { id: 'NODE-004', name: 'GRID-DELTA', status: 'nominal', health: 96, zone: 'Zone C - Residential', lastContact: '8ms' },
  { id: 'NODE-005', name: 'CONTROL-EPSILON', status: 'critical', health: 62, zone: 'Zone D - Remote', lastContact: '150ms' },
];

// Initial mock anomalies database
const initialAnomalies: AnomalyEvent[] = [
  { id: '1', nodeId: 'NODE-001', type: 'Voltage Sag', timestamp: '10:42:15', severity: 'warning', description: 'Bus voltage drop > 5%', status: 'new' },
  { id: '2', nodeId: 'NODE-001', type: 'Transformer Overheat', timestamp: '09:15:00', severity: 'critical', description: 'Core temp > 90°C', status: 'investigating' },
  { id: '3', nodeId: 'NODE-001', type: 'Link Jitter', timestamp: '08:30:22', severity: 'info', description: 'Latency spike detected', status: 'resolved' },
  { id: '4', nodeId: 'NODE-003', type: 'Vibration Spike', timestamp: '11:20:05', severity: 'warning', description: 'Turbine imbalance detected', status: 'new' },
  { id: '5', nodeId: 'NODE-005', type: 'Pressure Loss', timestamp: '06:10:00', severity: 'critical', description: 'Hydraulic pressure drop', status: 'investigating' },
  { id: '6', nodeId: 'NODE-005', type: 'Coolant Leak', timestamp: '06:15:30', severity: 'critical', description: 'Flow rate critical low', status: 'new' },
  { id: '7', nodeId: 'NODE-005', type: 'Pump Failure', timestamp: '07:00:00', severity: 'warning', description: 'Feed pump trip', status: 'investigating' },
  { id: '8', nodeId: 'NODE-005', type: 'Controller Reset', timestamp: '07:45:12', severity: 'warning', description: 'Unexpected reboot', status: 'resolved' },
  { id: '9', nodeId: 'NODE-005', type: 'Memory Fault', timestamp: '08:00:00', severity: 'critical', description: 'PLC memory corruption', status: 'new' },
];

const App: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<NodeStats>(mockNodes[0]);
  const [selectedSensor, setSelectedSensor] = useState<Sensor>(mockSensors[0]);
  const [telemetry, setTelemetry] = useState<SensorMetric[]>([]);
  const [allAnomalies, setAllAnomalies] = useState<AnomalyEvent[]>(initialAnomalies);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyEvent | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [anomalyNotification, setAnomalyNotification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter anomalies for current node
  const currentAnomalies = allAnomalies.filter(a => a.nodeId === selectedNode.id);

  // Load data when node or sensor changes
  useEffect(() => {
    setIsLoading(true);
    // Simulate network delay for loading node data
    const timer = setTimeout(() => {
      setTelemetry(generateSensorData(30, selectedSensor, selectedNode.id));
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [selectedSensor, selectedNode.id]);

  // Simulate Live Data
  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      setTelemetry(prev => {
        if (prev.length === 0) return prev;

        const lastTime = new Date();
        const nextTime = lastTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
        const isAnomaly = Math.random() > 0.98;
        const [min, max] = selectedSensor.normalRange;
        const range = max - min;
        const baseValue = min + range / 2;

        // Add node-specific variation
        const nodeModifier = selectedNode.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;
        const trend = Math.sin(Date.now() / 10000 + nodeModifier) * (range * 0.15);

        const newVal = {
          timestamp: nextTime,
          voltage: selectedSensor.category === 'power' ? baseValue + trend + Math.random() * (isAnomaly ? range * 0.4 : range * 0.1) : 120,
          temperature: selectedSensor.category === 'thermal' ? baseValue + trend + Math.random() * (isAnomaly ? range * 0.4 : range * 0.1) : 60,
          vibration: selectedSensor.category === 'vibration' ? baseValue + trend + Math.random() * (isAnomaly ? range * 0.5 : range * 0.1) : 0,
          pressure: selectedSensor.category === 'pressure' ? baseValue + trend + Math.random() * (isAnomaly ? range * 0.4 : range * 0.1) : 3000,
          flow: selectedSensor.category === 'flow' ? baseValue + trend + Math.random() * (isAnomaly ? range * 0.4 : range * 0.1) : 500,
          signalStrength: -40 + Math.random() * 2,
          isAnomaly
        };
        return [...prev.slice(1), newVal];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedSensor, selectedNode.id, isLoading]);

  const handleAnalyze = async (event: AnomalyEvent) => {
    setAnalyzing(true);
    setAiAnalysis(null);

    try {
      const result = await analyzeAnomaly(event, telemetry);
      try {
        setAiAnalysis(JSON.parse(result));
      } catch (e) {
        setAiAnalysis({ rootCause: result, recommendations: [] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const injectAnomaly = () => {
    const anomalyTypes = ['voltage', 'temperature', 'vibration'];
    const type = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
    const [min, max] = selectedSensor.normalRange;
    const range = max - min;

    setTelemetry(prev => {
      const latest = prev[prev.length - 1];
      const anomalousData = {
        ...latest,
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
        voltage: type === 'voltage' && selectedSensor.category === 'power' ? max + range * 0.2 : latest.voltage,
        temperature: type === 'temperature' && selectedSensor.category === 'thermal' ? max + range * 0.3 : latest.temperature,
        isAnomaly: true
      };
      return [...prev.slice(1), anomalousData];
    });

    // Add to anomaly list
    const newAnomaly: AnomalyEvent = {
      id: `${Date.now()}`,
      nodeId: selectedNode.id,
      type: type === 'voltage' ? 'Voltage Spike' : (type === 'temperature' ? 'Overheat' : 'High Vibration'),
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      severity: 'warning',
      description: type === 'voltage'
        ? `${selectedSensor.name} exceeded threshold`
        : `${selectedSensor.name} critical limit`,
      status: 'new'
    };
    setAllAnomalies(prev => [newAnomaly, ...prev]);

    const notification = type === 'voltage' ? '⚡ Voltage Spike Detected!' : (type === 'temperature' ? '🔥 Thermal Anomaly!' : '⚠️ Vibration Alert!');
    setAnomalyNotification(notification);
    setTimeout(() => setAnomalyNotification(null), 3000);
  };

  return (
    <div className="min-h-screen font-sans text-gray-200 selection:bg-primary/30 pb-12">
      {/* HEADER - Increased z-index */}
      <header className="fixed top-0 w-full z-[60] glass-panel border-b border-white/5 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <NetworkNav
            nodes={mockNodes}
            selectedNode={selectedNode}
            onNodeChange={(node) => {
              setSelectedNode(node);
              setSelectedAnomaly(null); // Reset selection when switching nodes
              setAiAnalysis(null);
            }}
          />
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={injectAnomaly}
            className="hidden md:flex items-center gap-2 text-xs font-mono text-warning bg-warning/10 px-3 py-1.5 rounded-full border border-warning/30 hover:bg-warning/20 transition-all hover:scale-105"
          >
            <Icons.Zap size={14} />
            INJECT ANOMALY
          </button>
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-primary" />
            LIVE SENSOR STREAM
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
            <Icons.Bell size={20} />
            {currentAnomalies.filter(a => a.status === 'new').length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            )}
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-600 border border-white/20" />
        </div>
      </header>

      {/* Anomaly Notification */}
      {anomalyNotification && (
        <div className="fixed top-20 right-6 z-[70] animate-slide">
          <div className="glass-panel px-4 py-3 rounded-lg border-2 border-error shadow-neon-hover flex items-center gap-3">
            <Icons.Alert className="text-error" size={20} />
            <span className="font-semibold text-white">{anomalyNotification}</span>
          </div>
        </div>
      )}

      <main className="pt-24 px-6 max-w-[1600px] mx-auto space-y-6">

        {/* KPI ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Grid Health" value={`${selectedNode.health}%`} trend="0.1%" trendUp={true} icon="Activity" />
          <StatCard label="Active Anomalies" value={`${currentAnomalies.filter(a => a.status !== 'resolved').length}`} trend="1" trendUp={false} icon="Alert" alert={true} />
          <StatCard label="Network Load" value="452 MW" trend="Stable" trendUp={true} icon="Activity" />
          <StatCard label="Active Sensors" value={`${mockSensors.length * 12}/5247`} icon="Temp" />
        </div>

        {/* MAIN VISUALIZATION ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[450px]">
          {/* Chart Section */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <Icons.Activity className="text-primary" size={18} />
                Real-time Sensor Metrics
              </h2>
              <SensorFilter
                sensors={mockSensors}
                selectedSensor={selectedSensor}
                onSensorChange={setSelectedSensor}
              />
            </div>
            <div className="flex-1 w-full min-h-0 relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10 rounded-lg">
                  <div className="flex flex-col items-center gap-3">
                    <Icons.Activity className="animate-spin text-primary" size={32} />
                    <span className="text-xs font-mono text-primary">SYNCING SCADA...</span>
                  </div>
                </div>
              ) : (
                <TelemetryChart data={telemetry} sensorCategory={selectedSensor.category} unit={selectedSensor.unit} />
              )}
            </div>
          </div>

          {/* Node Status */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <h2 className="font-display font-semibold text-lg mb-4 z-10 relative">Node Status: {selectedNode.name}</h2>
            <div className="flex-1 rounded-xl bg-black/40 border border-white/5 overflow-hidden relative">
              <GridVisualizer />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 z-10">
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <span className="text-xs text-gray-400 block mb-1">MAINTENANCE</span>
                <span className="text-sm font-mono text-white">SCHEDULED</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <span className="text-xs text-gray-400 block mb-1">REDUNDANCY</span>
                <span className="text-sm font-mono text-success">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: FEED & ANALYSIS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Anomaly Feed */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-semibold text-lg">Detected Anomalies</h2>
              <button className="text-xs text-primary hover:text-white transition-colors">View Logs</button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {currentAnomalies.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Icons.Check size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No anomalies detected for {selectedNode.name}</p>
                </div>
              ) : (
                currentAnomalies.map(anomaly => (
                  <div
                    key={anomaly.id}
                    onClick={() => setSelectedAnomaly(anomaly)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 group
                      ${selectedAnomaly?.id === anomaly.id
                        ? 'bg-white/10 border-primary/50 shadow-neon'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full ${anomaly.severity === 'critical' ? 'bg-error shadow-[0_0_10px_#ef4444]' : 'bg-warning'}`} />
                        <div>
                          <h4 className="font-medium text-white group-hover:text-primary transition-colors">{anomaly.type}</h4>
                          <p className="text-sm text-gray-400 mt-1">{anomaly.description}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-gray-500">{anomaly.timestamp}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-black/30 text-gray-400 border border-white/5">
                        {anomaly.nodeId}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-white/5 ${anomaly.status === 'new' ? 'bg-blue-500/20 text-blue-400' : anomaly.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {anomaly.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <Icons.Cpu className="text-primary" size={18} />
                SCADA/ML Root Cause Analysis
              </h2>
            </div>

            {selectedAnomaly ? (
              <div className="flex-1 flex flex-col">
                <div className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="text-sm font-semibold text-primary mb-1">Analysing Event: {selectedAnomaly.type}</h3>
                  <p className="text-xs text-gray-400">Model: IndustrialNet-v4.1 | Context: Last 10m Logs</p>
                </div>

                {!aiAnalysis ? (
                  <div className="flex-1 flex items-center justify-center flex-col gap-4">
                    <p className="text-sm text-gray-400 text-center max-w-xs">
                      Run deep learning inference on this anomaly to detect root cause and get mitigation steps.
                    </p>
                    <button
                      onClick={() => handleAnalyze(selectedAnomaly)}
                      disabled={analyzing}
                      className="bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-6 rounded-lg shadow-neon transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {analyzing ? <Icons.Activity className="animate-spin" /> : <Icons.Zap size={18} fill="currentColor" />}
                      {analyzing ? 'Processing...' : 'Run Diagnostics'}
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 space-y-4 animate-slide overflow-y-auto">
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold">Root Cause</h4>
                      <p className="text-sm leading-relaxed text-white bg-black/20 p-3 rounded border border-white/10">
                        {aiAnalysis.rootCause || "Analysis complete."}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold">Recommended Actions</h4>
                      <ul className="space-y-2">
                        {aiAnalysis.recommendations?.map((rec: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <Icons.Check size={16} className="text-success mt-0.5 shrink-0" />
                            {rec}
                          </li>
                        )) || <li className="text-sm text-gray-400">No specific recommendations.</li>}
                      </ul>
                    </div>
                    {aiAnalysis.confidence && (
                      <div className="pt-2 border-t border-white/5">
                        <p className="text-xs text-gray-500">
                          Confidence: <span className="text-primary font-mono">{(aiAnalysis.confidence * 100).toFixed(0)}%</span>
                        </p>
                      </div>
                    )}
                    <div className="mt-auto pt-4 flex justify-end">
                      <button
                        onClick={() => setAiAnalysis(null)}
                        className="text-xs text-gray-400 hover:text-white underline"
                      >
                        Clear Analysis
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col text-gray-500">
                <Icons.Search size={48} className="opacity-20 mb-4" />
                <p>Select an anomaly from the feed to begin analysis.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
