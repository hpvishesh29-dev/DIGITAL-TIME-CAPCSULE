// Web Audio API Ambient Synthesizer for CHRONA
// Interaction sounds (hover/click) removed — ambient only
//
// SoundEngine manages a single lazily-created AudioContext and an ambient
// drone built from a small set of detuned oscillators. It exposes volume
// control, smooth fade in/out, and guards against overlapping start/stop
// calls so rapid toggling can't leave dangling oscillators or audio glitches.

const DEFAULT_VOLUME = 0.08; // target gain for the ambient bed at full volume
const MIN_GAIN = 0.0001; // exponentialRamp can never target exactly 0
const FADE_IN_SECONDS = 3;
const FADE_OUT_SECONDS = 1;

const AMBIENT_FREQS = [110, 164.81, 220, 329.63];

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null; // overall volume control, independent of fades
    this.ambientGain = null; // fade envelope for the ambient bed
    this.filter = null;
    this.oscillators = [];
    this.oscGains = [];

    this.volume = DEFAULT_VOLUME;
    this.muted = false;

    // 'idle' | 'starting' | 'playing' | 'stopping'
    this.ambientState = 'idle';
    this._stopTimeoutId = null;

    this.isSupported = typeof window !== 'undefined' &&
      !!(window.AudioContext || window.webkitAudioContext);
  }

  // ── Context lifecycle ──────────────────────────────────────────────────

  init() {
    if (!this.isSupported) {
      console.warn('SoundEngine: Web Audio API is not supported in this browser.');
      return false;
    }
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this._applyVolumeToMasterGain();
      }
      if (this.ctx.state === 'suspended') {
        // Modern browsers require a user gesture to resume; calling this
        // from a click/tap handler (e.g. toggleAmbient) satisfies that.
        this.ctx.resume().catch((e) => {
          console.warn('SoundEngine: failed to resume AudioContext:', e);
        });
      }
      return true;
    } catch (e) {
      console.warn('SoundEngine: failed to initialize AudioContext:', e);
      this.ctx = null;
      return false;
    }
  }

  /** Fully tears down the engine and releases the AudioContext. */
  dispose() {
    this._clearStopTimeout();
    this._hardStopOscillators();
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {
        // Already closed or unsupported — safe to ignore.
      }
    }
    this.ctx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.filter = null;
    this.oscillators = [];
    this.oscGains = [];
    this.ambientState = 'idle';
  }

  // ── Volume control ─────────────────────────────────────────────────────

  /** Sets master volume, 0–1. Applies immediately without affecting fades. */
  setVolume(value) {
    this.volume = Math.min(1, Math.max(0, Number(value) || 0));
    this._applyVolumeToMasterGain();
    return this.volume;
  }

  getVolume() {
    return this.volume;
  }

  setMuted(muted) {
    this.muted = !!muted;
    this._applyVolumeToMasterGain();
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  _applyVolumeToMasterGain() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const target = this.muted ? 0 : this.volume;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(target, now, 0.05);
    } catch (e) {
      console.warn('SoundEngine: failed to apply volume:', e);
    }
  }

  // ── Ambient bed ─────────────────────────────────────────────────────────

  toggleAmbient(enable) {
    if (!this.init()) return;
    if (enable) {
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
  }

  startAmbient() {
    if (!this.ctx) return;

    // Already playing or mid-fade-in: nothing to do.
    if (this.ambientState === 'playing' || this.ambientState === 'starting') return;

    // A stop was in progress — cancel it and reuse the still-live graph
    // instead of tearing down and rebuilding oscillators.
    if (this.ambientState === 'stopping') {
      this._clearStopTimeout();
      this._fadeAmbientGain(DEFAULT_VOLUME, FADE_IN_SECONDS);
      this.ambientState = 'playing';
      return;
    }

    try {
      const now = this.ctx.currentTime;
      this.ambientState = 'starting';

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(MIN_GAIN, now);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(320, now);

      this.oscillators = [];
      this.oscGains = [];

      AMBIENT_FREQS.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((i - 1.5) * 6, now);

        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0.25, now);

        osc.connect(oscGain);
        oscGain.connect(this.filter);
        osc.start(now);

        this.oscillators.push(osc);
        this.oscGains.push(oscGain);
      });

      this.filter.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain || this.ctx.destination);

      this._fadeAmbientGain(DEFAULT_VOLUME, FADE_IN_SECONDS);
      this.ambientState = 'playing';
    } catch (e) {
      console.warn('SoundEngine: failed to start ambient sound:', e);
      this._hardStopOscillators();
      this.ambientState = 'idle';
    }
  }

  stopAmbient() {
    if (!this.ctx || this.ambientState === 'idle' || this.ambientState === 'stopping') return;

    try {
      this.ambientState = 'stopping';
      this._fadeAmbientGain(MIN_GAIN, FADE_OUT_SECONDS);

      this._clearStopTimeout();
      this._stopTimeoutId = setTimeout(() => {
        // Only tear down if nothing re-started ambient in the meantime.
        if (this.ambientState === 'stopping') {
          this._hardStopOscillators();
          this.ambientState = 'idle';
        }
        this._stopTimeoutId = null;
      }, FADE_OUT_SECONDS * 1000 + 50);
    } catch (e) {
      console.warn('SoundEngine: failed to stop ambient sound cleanly:', e);
      this._hardStopOscillators();
      this.ambientState = 'idle';
    }
  }

  isAmbientPlaying() {
    return this.ambientState === 'playing' || this.ambientState === 'starting';
  }

  // ── Internal helpers ────────────────────────────────────────────────────

  _fadeAmbientGain(targetValue, durationSeconds) {
    if (!this.ctx || !this.ambientGain) return;
    const now = this.ctx.currentTime;
    const gainParam = this.ambientGain.gain;
    // Cancel any in-flight ramp so overlapping fade calls don't stack or
    // fight each other, then ramp smoothly from the current value.
    const currentValue = Math.max(gainParam.value, MIN_GAIN);
    gainParam.cancelScheduledValues(now);
    gainParam.setValueAtTime(currentValue, now);
    gainParam.exponentialRampToValueAtTime(Math.max(targetValue, MIN_GAIN), now + durationSeconds);
  }

  _clearStopTimeout() {
    if (this._stopTimeoutId) {
      clearTimeout(this._stopTimeoutId);
      this._stopTimeoutId = null;
    }
  }

  _hardStopOscillators() {
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped — ignore.
      }
      try {
        osc.disconnect();
      } catch (e) {
        // Ignore.
      }
    });
    this.oscGains.forEach((g) => {
      try {
        g.disconnect();
      } catch (e) {
        // Ignore.
      }
    });
    if (this.filter) {
      try {
        this.filter.disconnect();
      } catch (e) {
        // Ignore.
      }
    }
    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect();
      } catch (e) {
        // Ignore.
      }
    }
    this.oscillators = [];
    this.oscGains = [];
    this.filter = null;
    this.ambientGain = null;
  }

  // No-op stubs — interaction sounds removed, kept for API compatibility.
  playGlassHover() {}
  playCardClick() {}
  playSealSuccess() {}
}

export const soundEngine = new SoundEngine();