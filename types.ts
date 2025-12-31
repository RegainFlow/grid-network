export interface SensorMetric {
  timestamp: string;
  voltage: number;
  temperature: number;
  vibration: number;
  pressure: number;
  flow: number;
  signalStrength: number;
  isAnomaly: boolean;
}

export interface AnomalyEvent {
  id: string;
  nodeId: string;
  type: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  status: 'new' | 'investigating' | 'resolved';
}

export interface NodeStats {
  id: string;
  name: string;
  zone: string;
  health: number;
  status: 'nominal' | 'degraded' | 'critical';
  lastContact: string;
}
