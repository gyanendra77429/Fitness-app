import { db } from './db';
import { vibrator } from './vibrator';
import { voiceCoach } from './voiceCoach';

export interface MotionDataPoint {
  time: number;
  accel: number;
  x: number;
  y: number;
  z: number;
}

export type SensorListener = (point: MotionDataPoint) => void;
export type RepDetectedListener = (repCount: number) => void;
export type StepDetectedListener = (totalSteps: number, cadence: number) => void;
export type PhoneStateListener = (isResting: boolean) => void;

class HardwareSensorManager {
  private isListening: boolean = false;
  private isSimulating: boolean = false;
  private simulationInterval: number | null = null;
  private motionHistory: MotionDataPoint[] = [];
  private maxHistoryLen: number = 60; // ~3-4 seconds window

  // Listeners
  private motionListeners: Set<SensorListener> = new Set();
  private repListeners: Set<RepDetectedListener> = new Set();
  private stepListeners: Set<StepDetectedListener> = new Set();
  private phoneStateListeners: Set<PhoneStateListener> = new Set();

  // Peak detection state for Reps
  private repCount: number = 0;
  private lastRepTime: number = 0;
  private isRepPeak: boolean = false;
  private repValley: number = 9.8;
  private repPeak: number = 9.8;

  // Step detection state
  private stepCount: number = 0;
  private lastStepTime: number = 0;
  private stepTimestamps: number[] = [];

  // Phone-down state
  private isPhoneResting: boolean = false;
  private stationaryStartTime: number = 0;
  private lastMotionAccel: number = 9.8;

  constructor() {
    this.handleDeviceMotion = this.handleDeviceMotion.bind(this);
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    // iOS 13+ DeviceMotionEvent permission
    const DME = window.DeviceMotionEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> };
    if (DME && typeof DME.requestPermission === 'function') {
      try {
        const response = await DME.requestPermission();
        return response === 'granted';
      } catch (err) {
        console.warn('DeviceMotion permission error:', err);
        return false;
      }
    }
    return true; // Android and standard browsers don't need explicit requestPermission prompt
  }

  public startListening() {
    if (this.isListening) return;
    this.isListening = true;

    if (typeof window !== 'undefined' && 'ondevicemotion' in window) {
      window.addEventListener('devicemotion', this.handleDeviceMotion, true);
    }
  }

  public stopListening() {
    if (!this.isListening) return;
    this.isListening = false;

    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.handleDeviceMotion, true);
    }
    this.stopSimulation();
  }

  private handleDeviceMotion(event: DeviceMotionEvent) {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 9.8;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    this.processMotionSample(x, y, z, magnitude);
  }

  public processMotionSample(x: number, y: number, z: number, magnitude: number) {
    const now = Date.now();
    const point: MotionDataPoint = {
      time: now,
      accel: magnitude,
      x,
      y,
      z,
    };

    this.motionHistory.push(point);
    if (this.motionHistory.length > this.maxHistoryLen) {
      this.motionHistory.shift();
    }

    // Notify raw listeners
    this.motionListeners.forEach(fn => fn(point));

    // Process Rep & Step algorithms
    this.detectReps(point);
    this.detectSteps(point);
    this.detectPhoneResting(point);
  }

  private detectReps(point: MotionDataPoint) {
    const profile = db.getUserProfile();
    let threshold = 2.4;
    if (profile.sensorSensitivity === 'high') threshold = 1.4;
    if (profile.sensorSensitivity === 'low') threshold = 3.6;

    const now = point.time;
    const deviation = Math.abs(point.accel - 9.8);

    // Peak detection with hysteresis & min 1100ms debounce
    if (deviation > threshold && !this.isRepPeak && now - this.lastRepTime > 1100) {
      this.isRepPeak = true;
      this.repPeak = point.accel;
    } else if (this.isRepPeak && deviation < threshold * 0.4) {
      // Rep completed (concentric phase finished)
      this.isRepPeak = false;
      this.repCount++;
      this.lastRepTime = now;

      // Haptic and Audio
      vibrator.repBuzz();
      voiceCoach.announceRep(this.repCount);

      this.repListeners.forEach(fn => fn(this.repCount));
    }
  }

  private detectSteps(point: MotionDataPoint) {
    const now = point.time;
    // Step vertical spike detection (~11.5 m/s² or higher, debounce 320ms)
    if (point.accel > 11.2 && now - this.lastStepTime > 320) {
      this.stepCount++;
      this.lastStepTime = now;
      this.stepTimestamps.push(now);

      // Clean timestamps older than 10 seconds for rolling cadence
      this.stepTimestamps = this.stepTimestamps.filter(t => now - t < 10000);
      const cadence = Math.round((this.stepTimestamps.length / 10) * 60);

      this.stepListeners.forEach(fn => fn(this.stepCount, cadence));
    }
  }

  private detectPhoneResting(point: MotionDataPoint) {
    const now = point.time;
    const isStationary = Math.abs(point.accel - 9.8) < 0.28 && Math.abs(point.x) < 0.35 && Math.abs(point.y) < 0.35;

    if (isStationary) {
      if (this.stationaryStartTime === 0) {
        this.stationaryStartTime = now;
      } else if (now - this.stationaryStartTime > 1800 && !this.isPhoneResting) {
        this.isPhoneResting = true;
        this.phoneStateListeners.forEach(fn => fn(true));
      }
    } else {
      if (this.isPhoneResting && Math.abs(point.accel - 9.8) > 1.2) {
        this.isPhoneResting = false;
        this.phoneStateListeners.forEach(fn => fn(false));
      }
      this.stationaryStartTime = 0;
    }
  }

  // Simulator for desktop browser preview
  public startSimulation(mode: 'pushup' | 'squat' | 'run' = 'pushup') {
    this.stopSimulation();
    this.isSimulating = true;
    let tick = 0;

    this.simulationInterval = window.setInterval(() => {
      tick += 0.2;
      let x = 0;
      let y = 0;
      let z = 9.8;
      let mag = 9.8;

      if (mode === 'pushup') {
        // sinusoidal oscillation: 2.5s cycle per rep
        const cycle = Math.sin(tick * 0.8);
        z = 9.8 + cycle * 2.8;
        mag = Math.sqrt(z * z);
      } else if (mode === 'squat') {
        const cycle = Math.sin(tick * 0.7);
        y = cycle * 1.5;
        z = 9.8 + cycle * 3.4;
        mag = Math.sqrt(y * y + z * z);
      } else if (mode === 'run') {
        // brisk 165 SPM running bounce
        const bounce = Math.abs(Math.sin(tick * 2.6));
        z = 9.8 + bounce * 4.2;
        x = (Math.random() - 0.5) * 1.5;
        mag = Math.sqrt(x * x + z * z);
      }

      this.processMotionSample(x, y, z, mag);
    }, 50); // 20Hz update
  }

  public stopSimulation() {
    this.isSimulating = false;
    if (this.simulationInterval !== null) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  public getIsSimulating(): boolean {
    return this.isSimulating;
  }

  // Subscriptions
  public onMotion(fn: SensorListener): () => void {
    this.motionListeners.add(fn);
    return () => this.motionListeners.delete(fn);
  }

  public onRep(fn: RepDetectedListener): () => void {
    this.repListeners.add(fn);
    return () => this.repListeners.delete(fn);
  }

  public onStep(fn: StepDetectedListener): () => void {
    this.stepListeners.add(fn);
    return () => this.stepListeners.delete(fn);
  }

  public onPhoneState(fn: PhoneStateListener): () => void {
    this.phoneStateListeners.add(fn);
    return () => this.phoneStateListeners.delete(fn);
  }

  public resetRepCount() {
    this.repCount = 0;
  }

  public getRepCount(): number {
    return this.repCount;
  }

  public resetStepCount() {
    this.stepCount = 0;
    this.stepTimestamps = [];
  }

  public getStepCount(): number {
    return this.stepCount;
  }

  public getRecentHistory(): MotionDataPoint[] {
    return [...this.motionHistory];
  }
}

export const sensorManager = new HardwareSensorManager();
