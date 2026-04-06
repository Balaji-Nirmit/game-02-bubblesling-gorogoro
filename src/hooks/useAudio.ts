import { useEffect, useRef } from 'react';

export const useAudio = () => {
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (audioCtx.current) {
        audioCtx.current.close();
      }
    };
  }, []);

  const init = async () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      await audioCtx.current.resume();
    }
  };

  const playPing = async (freq = 440, type: OscillatorType = 'sine', duration = 0.1) => {
    if (!audioCtx.current || audioCtx.current.state === 'suspended') await init();
    const ctx = audioCtx.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playThud = () => {
    playPing(150, 'triangle', 0.15);
  };

  const playSuccess = async () => {
    if (!audioCtx.current || audioCtx.current.state === 'suspended') await init();
    const ctx = audioCtx.current!;
    const now = ctx.currentTime;
    [440, 554.37, 659.25].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(f, now + i * 0.1);
      gain.gain.setValueAtTime(0.05, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  };

  return { playPing, playThud, playSuccess, init };
};
