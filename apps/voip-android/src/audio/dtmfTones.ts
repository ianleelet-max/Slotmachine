// Synthesizer Web Audio API pour les fréquences DTMF standard (ITU-T Q.23)
const DTMF_FREQUENCIES: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477]
};

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playDtmfTone(key: string, durationMs: number = 140) {
  const freqs = DTMF_FREQUENCIES[key];
  if (!freqs) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freqs[0], now);
    osc2.frequency.setValueAtTime(freqs[1], now);

    // Enveloppe douce pour éviter les "pops" audio
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.015);
    gainNode.gain.setValueAtTime(0.18, now + (durationMs / 1000) - 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (durationMs / 1000));

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + (durationMs / 1000));
    osc2.stop(now + (durationMs / 1000));
  } catch (err) {
    console.warn('Audio DTMF non supporté ou bloqué:', err);
  }
}

export function playRingtone(): () => void {
  try {
    const ctx = getAudioContext();
    let isPlaying = true;

    const ringCycle = () => {
      if (!isPlaying) return;
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
      gain.gain.setValueAtTime(0.12, now + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.0);
      osc2.stop(now + 2.0);

      if (isPlaying) {
        setTimeout(ringCycle, 4000);
      }
    };

    ringCycle();
    return () => {
      isPlaying = false;
    };
  } catch {
    return () => {};
  }
}