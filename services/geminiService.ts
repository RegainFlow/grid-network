import { AnomalyEvent, SensorMetric } from "../types";

// Mock analysis data generator - simulates custom ML model output for Industrial IoT
const mockAnalysisDatabase: Record<string, any> = {
  'Voltage Sag': {
    rootCause: "Transient load surge on Phase B detected at substation transformer. Likely caused by startup of large induction motor in Sector 4 without soft-start sequence.",
    recommendations: [
      "Inspect soft-starter contactors on Pump P-402",
      "Verify capacitor bank switching logic",
      "Monitor harmonics for increasing distortion"
    ],
    confidence: 0.87,
    modelVersion: "IndustrialNet-v4.1"
  },
  'Transformer Overheat': {
    rootCause: "Core temperature exceeding 90°C. Data correlation suggests dielectric oil circulation failure or cooling fan obstruction.",
    recommendations: [
      "Dispatch field crew for visual inspection of cooling fans",
      "Check oil pump vibration levels",
      "Reduce load on Transformer T-101 immediately"
    ],
    confidence: 0.92,
    modelVersion: "IndustrialNet-v4.1"
  },
  'Link Jitter': {
    rootCause: "SCADA network latency spike due to packet collisions on the control VLAN. Likely broadcast storm or faulty switch port.",
    recommendations: [
      "Check switch logs for port flapping on VLAN 100",
      "Verify unexpected traffic sources from IoT Gateway 3",
      "reset network interface on Controller C-05"
    ],
    confidence: 0.78,
    modelVersion: "IndustrialNet-v4.1"
  }
};

export const analyzeAnomaly = async (event: AnomalyEvent, recentTelemetry: SensorMetric[]): Promise<string> => {
  // Simulate processing delay for realism
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  // Get mock analysis based on anomaly type
  const analysis = mockAnalysisDatabase[event.type] || {
    rootCause: `Anomaly detected in ${event.type}. Analysis indicates deviation from ideal grid parameters based on recent sensor logs.`,
    recommendations: [
      "Continue monitoring sensor trends",
      "Cross-reference with maintenance schedule",
      "Dispatch inspection drone or ground crew"
    ],
    confidence: 0.65,
    modelVersion: "IndustrialNet-v4.1"
  };

  // Add telemetry context
  const avgVoltage = recentTelemetry.slice(-10).reduce((sum, t) => sum + t.voltage, 0) / 10;
  const avgTemp = recentTelemetry.slice(-10).reduce((sum, t) => sum + t.temperature, 0) / 10;

  return JSON.stringify({
    ...analysis,
    telemetryContext: {
      avgVoltage: avgVoltage.toFixed(2),
      avgTemperature: avgTemp.toFixed(1),
      samplesAnalyzed: recentTelemetry.length
    }
  });
};
