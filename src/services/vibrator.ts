import { db } from './db';

class VibratorService {
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
  }

  private canVibrate(): boolean {
    if (!this.isSupported) return false;
    const profile = db.getUserProfile();
    return profile.hapticEnabled;
  }

  public repBuzz() {
    if (!this.canVibrate()) return;
    try {
      navigator.vibrate(35); // quick tactile pulse
    } catch {
      // ignore
    }
  }

  public countdownTick() {
    if (!this.canVibrate()) return;
    try {
      navigator.vibrate(50);
    } catch {
      // ignore
    }
  }

  public setFinished() {
    if (!this.canVibrate()) return;
    try {
      navigator.vibrate([100, 50, 120]);
    } catch {
      // ignore
    }
  }

  public restFinished() {
    if (!this.canVibrate()) return;
    try {
      navigator.vibrate([200, 80, 200]);
    } catch {
      // ignore
    }
  }

  public victoryFanfare() {
    if (!this.canVibrate()) return;
    try {
      navigator.vibrate([120, 80, 120, 80, 300]);
    } catch {
      // ignore
    }
  }
}

export const vibrator = new VibratorService();
