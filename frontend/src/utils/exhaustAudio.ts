/**
 * Exhaust & Engine Sound Synthesizer using Web Audio API.
 * Synthesizes realistic engine exhaust notes, revs, and EV futuristic hums
 * based on vehicle category and engine profile with zero external audio assets.
 */

class ExhaustSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted() {
    return this.isMuted;
  }

  /**
   * Play exhaust note for a specific vehicle category / model
   */
  public playExhaustRev(category: string, model: string): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const lowerCat = category.toLowerCase();
    const lowerMod = model.toLowerCase();

    if (lowerCat.includes('electric') || lowerMod.includes('tesla') || lowerMod.includes('rivian')) {
      this.playElectricWhoosh(ctx);
    } else if (lowerCat.includes('truck') || lowerMod.includes('f-150')) {
      this.playV8TruckRumble(ctx);
    } else if (lowerCat.includes('coupe') || lowerMod.includes('911') || lowerMod.includes('m4')) {
      this.playSportsCarExhaust(ctx);
    } else {
      this.playStandardRev(ctx);
    }
  }

  /**
   * High performance sports exhaust: Twin-turbo / Flat-6 high RPM rev with exhaust crackle
   */
  private playSportsCarExhaust(ctx: AudioContext) {
    const now = ctx.currentTime;
    const duration = 1.8;

    // Primary engine cylinder firing oscillator
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    subOsc.type = 'sawtooth';

    // Aggressive RPM rev pitch curve
    // Idle 80Hz -> Rev peak 420Hz -> Settle 120Hz
    osc1.frequency.setValueAtTime(85, now);
    osc1.frequency.exponentialRampToValueAtTime(390, now + 0.45);
    osc1.frequency.exponentialRampToValueAtTime(440, now + 0.65);
    osc1.frequency.exponentialRampToValueAtTime(140, now + 1.6);

    osc2.frequency.setValueAtTime(87, now);
    osc2.frequency.exponentialRampToValueAtTime(395, now + 0.45);
    osc2.frequency.exponentialRampToValueAtTime(445, now + 0.65);
    osc2.frequency.exponentialRampToValueAtTime(142, now + 1.6);

    subOsc.frequency.setValueAtTime(42, now);
    subOsc.frequency.exponentialRampToValueAtTime(210, now + 0.5);
    subOsc.frequency.exponentialRampToValueAtTime(70, now + 1.6);

    // Resonant exhaust chamber filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(800, now + 1.5);
    filter.Q.setValueAtTime(4, now);

    // Volume envelope (Throttle punch)
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.28, now + 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.35, now + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    subOsc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    subOsc.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
    subOsc.stop(now + duration);

    // Simulated exhaust overrun crackles / pops on throttle lift-off (0.9s - 1.4s)
    this.scheduleExhaustCrackles(ctx, now + 0.7);
  }

  /**
   * V8 Deep throaty low-RPM truck burble
   */
  private playV8TruckRumble(ctx: AudioContext) {
    const now = ctx.currentTime;
    const duration = 2.0;

    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    sub.type = 'triangle';

    osc.frequency.setValueAtTime(55, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.6);
    osc.frequency.exponentialRampToValueAtTime(75, now + 1.8);

    sub.frequency.setValueAtTime(32, now);
    sub.frequency.exponentialRampToValueAtTime(95, now + 0.6);
    sub.frequency.exponentialRampToValueAtTime(45, now + 1.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(1100, now + 0.6);
    filter.frequency.exponentialRampToValueAtTime(500, now + 1.8);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.32, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    sub.start(now);
    osc.stop(now + duration);
    sub.stop(now + duration);
  }

  /**
   * Futuristic dual-motor EV acceleration sound (Tesla / Rivian)
   */
  private playElectricWhoosh(ctx: AudioContext) {
    const now = ctx.currentTime;
    const duration = 1.6;

    const osc = ctx.createOscillator();
    const harmon = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    harmon.type = 'triangle';

    // Sleek high-pitch hyperdrive sweep
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.9);
    osc.frequency.exponentialRampToValueAtTime(620, now + 1.5);

    harmon.frequency.setValueAtTime(360, now);
    harmon.frequency.exponentialRampToValueAtTime(1960, now + 0.9);
    harmon.frequency.exponentialRampToValueAtTime(1240, now + 1.5);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    harmon.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    harmon.start(now);
    osc.stop(now + duration);
    harmon.stop(now + duration);
  }

  /**
   * Standard Sedan / Hatchback 4-cylinder engine tone
   */
  private playStandardRev(ctx: AudioContext) {
    const now = ctx.currentTime;
    const duration = 1.5;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(110, now + 1.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
    filter.frequency.exponentialRampToValueAtTime(600, now + 1.3);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * Realistic exhaust crackle / burble bursts
   */
  private scheduleExhaustCrackles(ctx: AudioContext, startTime: number) {
    const popsCount = 4;
    for (let i = 0; i < popsCount; i++) {
      const popTime = startTime + i * 0.11 + Math.random() * 0.04;
      const bufferSize = ctx.sampleRate * 0.05; // 50ms noise burst
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const popFilter = ctx.createBiquadFilter();
      popFilter.type = 'bandpass';
      popFilter.frequency.value = 350 + Math.random() * 200;
      popFilter.Q.value = 2;

      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0.18, popTime);
      popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.05);

      noise.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(ctx.destination);

      noise.start(popTime);
      noise.stop(popTime + 0.06);
    }
  }
}

export const exhaustSound = new ExhaustSoundEngine();
