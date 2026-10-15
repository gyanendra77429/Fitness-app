import { db } from './db';

class VoiceCoachService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  public speak(text: string, priority: boolean = false) {
    if (!this.isSupported || !this.synth) return;

    const profile = db.getUserProfile();
    if (!profile.ttsEnabled) return;

    if (priority) {
      this.synth.cancel(); // cancel ongoing speech for urgent alerts
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = profile.ttsRate || 1.0;
    utterance.pitch = profile.ttsPitch || 1.0;

    // Pick voice if specified
    if (profile.ttsVoiceURI && this.voices.length > 0) {
      const selected = this.voices.find(v => v.voiceURI === profile.ttsVoiceURI);
      if (selected) utterance.voice = selected;
    } else {
      // Default to crisp English voice
      const enVoice = this.voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Samantha')));
      if (enVoice) utterance.voice = enVoice;
    }

    this.synth.speak(utterance);
  }

  public cancel() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // Common coaching prompts
  public announceExerciseStart(exerciseName: string, setNumber: number, reps: number, weightKg: number) {
    let msg = `Set ${setNumber}: ${exerciseName}. Target: ${reps} reps`;
    if (weightKg > 0) {
      msg += ` at ${weightKg} kilos.`;
    } else {
      msg += `. Focus on form!`;
    }
    this.speak(msg, true);
  }

  public announceRep(count: number) {
    this.speak(`${count}`, false);
  }

  public announceSetComplete(completedSet: number, restSeconds: number) {
    const praises = ['Great set!', 'Solid effort!', 'Nice work!', 'Power through!'];
    const praise = praises[Math.floor(Math.random() * praises.length)];
    this.speak(`${praise} Set ${completedSet} finished. Rest for ${restSeconds} seconds.`, true);
  }

  public announceCountdown(num: number) {
    if (num <= 3 && num > 0) {
      this.speak(`${num}`, true);
    } else if (num === 0) {
      this.speak('Go! Next set!', true);
    }
  }

  public announceRestCheckpoint(remainingSeconds: number) {
    if (remainingSeconds === 30) {
      this.speak('30 seconds of rest remaining.', true);
    } else if (remainingSeconds === 10) {
      this.speak('10 seconds. Get ready!', true);
    }
  }

  public announceWorkoutComplete(totalExercises: number, durationMinutes: number) {
    this.speak(`Workout completed! You crushed ${totalExercises} exercises in ${durationMinutes} minutes. Fantastic effort!`, true);
  }

  public announceCardioMilestone(km: number, paceMin: number) {
    this.speak(`${km} kilometer completed. Current pace: ${paceMin.toFixed(1)} minutes per kilometer.`, true);
  }
}

export const voiceCoach = new VoiceCoachService();
