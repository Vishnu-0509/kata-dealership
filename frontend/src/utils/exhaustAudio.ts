/**
 * Advanced Vehicle Exhaust Sound Simulator & Real Audio Player
 * Features distinct acoustic profiles for each specific vehicle model:
 * - Porsche 911 (Flat-6 Twin-Turbo + 8k RPM scream + exhaust backfire pops)
 * - BMW M4 Competition (Raspy Straight-6 + DCT dual-clutch shift burble)
 * - Ford F-150 (Deep 5.0L Coyote V8 Muscle lope & thunderous low-end roar)
 * - Honda Civic Sport (Tuned VTEC crossover + turbo blow-off valve hiss)
 * - Tesla Model 3 (High-voltage cyber electromagnetic stator torque sweep)
 * - Rivian R1S (Heavy quad-motor planetary gear off-road tone)
 * - Toyota RAV4 Hybrid (Atkinson-cycle synergy engine tone)
 * - Volkswagen ID. Buzz (Acoustic electric cruiser chime)
 * Also supports playing real audio recordings from custom URLs!
 */

class ExhaustSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeAudio: HTMLAudioElement | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    if (muted && this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio = null;
    }
  }

  public getIsMuted() {
    return this.isMuted;
  }

  /**
   * Play real audio recording if URL is provided, or route to vehicle-specific sound profile
   */
  public playVehicleExhaust(params: {
    make: string;
    model: string;
    category: string;
    audioUrl?: string | null;
  }): void {
    if (this.isMuted) return;

    // 1. If custom real audio URL is specified, attempt real audio playback
    if (params.audioUrl && params.audioUrl.trim() !== '') {
      try {
        if (this.activeAudio) {
          this.activeAudio.pause();
          this.activeAudio = null;
        }
        const audio = new Audio(params.audioUrl);
        audio.volume = 0.85;
        this.activeAudio = audio;
        audio.play().catch(() => {
          // If browser blocks or URL fails, fallback to synthesizer
          this.synthesizeEngineSound(params.make, params.model, params.category);
        });
        return;
      } catch {
        // Fallback
      }
    }

    // 2. Synthesize distinct, model-specific exhaust acoustics
    this.synthesizeEngineSound(params.make, params.model, params.category);
  }

  public playExhaustRev(category: string, modelStr: string): void {
    this.playVehicleExhaust({
      make: '',
      model: modelStr,
      category,
    });
  }

  private synthesizeEngineSound(make: string, model: string, category: string) {
    const ctx = this.getContext();
    if (!ctx) return;

    const fullStr = `${make} ${model} ${category}`.toLowerCase();

    if (fullStr.includes('911') || fullStr.includes('porsche')) {
      this.playPorscheFlat6(ctx);
    } else if (fullStr.includes('m4') || fullStr.includes('bmw')) {
      this.playBmwStraight6(ctx);
    } else if (fullStr.includes('f-150') || fullStr.includes('truck') || fullStr.includes('coyote')) {
      this.playV8CoyoteThunder(ctx);
    } else if (fullStr.includes('civic') || fullStr.includes('honda')) {
      this.playHondaVtecTurbo(ctx);
    } else if (fullStr.includes('tesla') || (fullStr.includes('electric') && fullStr.includes('model 3'))) {
      this.playTeslaHyperStator(ctx);
    } else if (fullStr.includes('rivian') || fullStr.includes('r1s')) {
      this.playRivianQuadMotor(ctx);
    } else if (fullStr.includes('buzz') || fullStr.includes('volkswagen') || fullStr.includes('van')) {
      this.playVwElectricCruiser(ctx);
    } else if (fullStr.includes('rav4') || fullStr.includes('hybrid') || fullStr.includes('toyota')) {
      this.playToyotaHybridSynergy(ctx);
    } else if (fullStr.includes('electric')) {
      this.playTeslaHyperStator(ctx);
    } else {
      this.playPorscheFlat6(ctx);
    }
  }

  /**
   * 1. Porsche 911 Flat-6 Boxer: Metallic high-pitch whine with rapid exhaust overrun crackle
   */
  private playPorscheFlat6(ctx: AudioContext) {
    const now = ctx.currentTime;
    const dur = 2.0;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    subOsc.type = 'sawtooth';

    // High revving curve up to 480Hz
    osc1.frequency.setValueAtTime(110, now);
    osc1.frequency.exponentialRampToValueAtTime(460, now + 0.5);
    osc1.frequency.exponentialRampToValueAtTime(510, now + 0.7);
    osc1.frequency.exponentialRampToValueAtTime(130, now + 1.8);

    osc2.frequency.setValueAtTime(112, now);
    osc2.frequency.exponentialRampToValueAtTime(464, now + 0.5);
    osc2.frequency.exponentialRampToValueAtTime(514, now + 0.7);
    osc2.frequency.exponentialRampToValueAtTime(132, now + 1.8);

    subOsc.frequency.setValueAtTime(55, now);
    subOsc.frequency.exponentialRampToValueAtTime(230, now + 0.5);
    subOsc.frequency.exponentialRampToValueAtTime(65, now + 1.8);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(2800, now + 0.55);
    filter.frequency.exponentialRampToValueAtTime(850, now + 1.7);
    filter.Q.value = 3.5;

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.65);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    subOsc.start(now);
    osc1.stop(now + dur);
    osc2.stop(now + dur);
    subOsc.stop(now + dur);

    // Overrun crackles on deceleration
    this.scheduleBackfirePops(ctx, now + 0.75, 6);
  }

  /**
   * 2. BMW M4 Twin-Turbo Straight-6: Deep raspy rasp with dual-clutch shift burble
   */
  private playBmwStraight6(ctx: AudioContext) {
    const now = ctx.currentTime;
    const dur = 2.1;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const distortion = ctx.createWaveShaper();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    // BMW S58 growl: 95Hz -> 380Hz with a mid-rev DCT gear shift interruption at 0.55s!
    osc1.frequency.setValueAtTime(95, now);
    osc1.frequency.exponentialRampToValueAtTime(360, now + 0.45);
    osc1.frequency.setValueAtTime(260, now + 0.55); // DCT Upshift dip
    osc1.frequency.exponentialRampToValueAtTime(440, now + 0.9);
    osc1.frequency.exponentialRampToValueAtTime(115, now + 1.9);

    osc2.frequency.setValueAtTime(96, now);
    osc2.frequency.exponentialRampToValueAtTime(362, now + 0.45);
    osc2.frequency.setValueAtTime(262, now + 0.55);
    osc2.frequency.exponentialRampToValueAtTime(442, now + 0.9);
    osc2.frequency.exponentialRampToValueAtTime(116, now + 1.9);

    distortion.curve = this.makeDistortionCurve(18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(650, now + 1.8);
    filter.Q.value = 2.0;

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.26, now + 0.15);
    // Gear shift acoustic dip
    gain.gain.setValueAtTime(0.12, now + 0.52);
    gain.gain.setValueAtTime(0.32, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc1.connect(distortion);
    osc2.connect(distortion);
    distortion.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur);
    osc2.stop(now + dur);

    // DCT exhaust burble
    this.scheduleBackfirePops(ctx, now + 0.54, 3);
    this.scheduleBackfirePops(ctx, now + 1.05, 4);
  }

  /**
   * 3. Ford F-150 Coyote 5.0L V8: Heavy lumpy cam idle & thunderous muscle roar
   */
  private playV8CoyoteThunder(ctx: AudioContext) {
    const now = ctx.currentTime;
    const dur = 2.4;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    subOsc.type = 'triangle';

    // Deep V8 lope frequencies: 48Hz -> 190Hz with heavy low-end power
    osc1.frequency.setValueAtTime(52, now);
    osc1.frequency.exponentialRampToValueAtTime(210, now + 0.7);
    osc1.frequency.exponentialRampToValueAtTime(68, now + 2.1);

    osc2.frequency.setValueAtTime(54, now);
    osc2.frequency.exponentialRampToValueAtTime(215, now + 0.7);
    osc2.frequency.exponentialRampToValueAtTime(70, now + 2.1);

    subOsc.frequency.setValueAtTime(26, now);
    subOsc.frequency.exponentialRampToValueAtTime(105, now + 0.7);
    subOsc.frequency.exponentialRampToValueAtTime(34, now + 2.1);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.7);
    filter.frequency.exponentialRampToValueAtTime(420, now + 2.0);
    filter.Q.value = 4.0;

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.38, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.38, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    subOsc.start(now);
    osc1.stop(now + dur);
    osc2.stop(now + dur);
    subOsc.stop(now + dur);
  }

  /**
   * 4. Honda Civic Sport: High-revving VTEC + Turbo Blow-Off Valve 'pssshh' hiss
   */
  private playHondaVtecTurbo(ctx: AudioContext) {
    const now = ctx.currentTime;
    const dur = 2.0;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // VTEC crossover at 0.5s with sudden pitch slope jump
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.45);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.8); // VTEC screaming
    osc.frequency.exponentialRampToValueAtTime(140, now + 1.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.8);
    filter.frequency.exponentialRampToValueAtTime(700, now + 1.8);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
    gain.gain.setValueAtTime(0.32, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + dur);

    // Turbo blow-off valve release hiss at 0.85s (throttle lift)
    this.playBlowOffValveHiss(ctx, now + 0.85);
  }

  /**
   * 5. Tesla Model 3 Performance: Cyber dual-motor high-frequency stator launch
   */
  private playTeslaHyperStator(ctx: AudioContext) {
    const now = ctx.currentTime;
    const dur = 1.8;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // High velocity stator pitch sweep
    osc1.frequency.setValueAtTime(180, now);
    osc1.frequency.exponentialRampToValueAtTime(1100, now + 0.8);
    osc1.frequency.exponentialRampToValueAtTime(640, now + 1.6);

    osc2.frequency.setValueAtTime(360, now);
    osc2.frequency.exponentialRampToValueAtTime(2200, now + 0.8);
    osc2.frequency.exponentialRampToValueAtTime(1280, now + 1.6);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur);
    osc2.stop(now + dur);
  }

  /**
   * 6. Rivian R1S Adventure: Deep quad-motor planetary gear torque
   */
  private playRivianQuadMotor(ctx: AudioContext) {
    const now = ctx.currentTime;
    const dur = 2.0;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sawtooth';
    sub.type = 'triangle';

    osc1.frequency.setValueAtTime(90, now);
    osc1.frequency.exponentialRampToValueAtTime(620, now + 0.9);
    osc1.frequency.exponentialRampToValueAtTime(380, now + 1.8);

    osc2.frequency.setValueAtTime(180, now);
    osc2.frequency.exponentialRampToValueAtTime(840, now + 0.9);
    osc2.frequency.exponentialRampToValueAtTime(420, now + 1.8);

    sub.frequency.setValueAtTime(45, now);
    sub.frequency.exponentialRampToValueAtTime(210, now + 0.9);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 950;

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    sub.start(now);
    osc1.stop(now + dur);
    osc2.stop(now + dur);
    sub.stop(now + dur);
  }

  /**
   * 7. Toyota RAV4 Hybrid: Atkinson cycle + e-CVT synergy motor
   */
  private playToyotaHybridSynergy(ctx: AudioContext) {
    const now = ctx.currentTime;
    const dur = 1.7;

    const engineOsc = ctx.createOscillator();
    const hybridOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    engineOsc.type = 'sawtooth';
    hybridOsc.type = 'sine';

    engineOsc.frequency.setValueAtTime(85, now);
    engineOsc.frequency.exponentialRampToValueAtTime(240, now + 0.5);
    engineOsc.frequency.exponentialRampToValueAtTime(120, now + 1.5);

    hybridOsc.frequency.setValueAtTime(240, now);
    hybridOsc.frequency.exponentialRampToValueAtTime(680, now + 0.6);
    hybridOsc.frequency.exponentialRampToValueAtTime(320, now + 1.5);

    filter.type = 'lowpass';
    filter.frequency.value = 1100;

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    engineOsc.connect(filter);
    hybridOsc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    engineOsc.start(now);
    hybridOsc.start(now);
    engineOsc.stop(now + dur);
    hybridOsc.stop(now + dur);
  }

  /**
   * 8. Volkswagen ID. Buzz: Acoustic Vehicle Alerting space cruiser chime
   */
  private playVwElectricCruiser(ctx: AudioContext) {
    const now = ctx.currentTime;
    const dur = 2.0;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    // Harmonic musical chord 330Hz (E4) & 440Hz (A4)
    osc1.frequency.setValueAtTime(330, now);
    osc1.frequency.linearRampToValueAtTime(495, now + 0.8);
    osc1.frequency.linearRampToValueAtTime(330, now + 1.8);

    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.linearRampToValueAtTime(660, now + 0.8);
    osc2.frequency.linearRampToValueAtTime(440, now + 1.8);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur);
    osc2.stop(now + dur);
  }

  /**
   * Turbo blow-off valve compressed air release hiss: 'pssshhh'
   */
  private playBlowOffValveHiss(ctx: AudioContext, startTime: number) {
    const dur = 0.35;
    const bufSize = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.25));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3400, startTime);
    filter.frequency.exponentialRampToValueAtTime(1800, startTime + dur);
    filter.Q.value = 3;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(startTime);
    noise.stop(startTime + dur);
  }

  /**
   * Rapid overrun backfire pops
   */
  private scheduleBackfirePops(ctx: AudioContext, startTime: number, count: number = 4) {
    for (let i = 0; i < count; i++) {
      const popTime = startTime + i * 0.09 + Math.random() * 0.03;
      const bufferSize = Math.floor(ctx.sampleRate * 0.04);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.2));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const popFilter = ctx.createBiquadFilter();
      popFilter.type = 'bandpass';
      popFilter.frequency.value = 380 + Math.random() * 250;
      popFilter.Q.value = 2.5;

      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0.25, popTime);
      popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.045);

      noise.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(ctx.destination);

      noise.start(popTime);
      noise.stop(popTime + 0.05);
    }
  }

  private makeDistortionCurve(amount: number = 20) {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
}

export const exhaustSound = new ExhaustSoundEngine();
