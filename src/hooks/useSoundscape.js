import { useEffect, useRef, useState } from 'react';

// Assumption: all soundscapes are synthesized in the browser via Web Audio
// (filtered noise) rather than shipping royalty-free audio files — keeps
// the build dependency-free and unambiguously copyright-safe. "rain" and
// "lofi" are both noise-based approximations, distinguished by filtering.
export function useSoundscape(kind) {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef(null);
  const nodesRef = useRef(null);

  useEffect(() => {
    return () => teardown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function teardown() {
    if (nodesRef.current) {
      nodesRef.current.source.stop();
      nodesRef.current.source.disconnect();
      nodesRef.current.filter.disconnect();
      nodesRef.current.gain.disconnect();
      nodesRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
  }

  function makeNoiseBuffer(ctx) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function play() {
    if (!kind || kind === 'none') return;
    teardown();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createBufferSource();
    source.buffer = makeNoiseBuffer(ctx);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    if (kind === 'rain') {
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 0.5;
    } else if (kind === 'lofi') {
      filter.type = 'lowpass';
      filter.frequency.value = 500;
    } else {
      filter.type = 'lowpass';
      filter.frequency.value = 8000; // white noise, gently rolled off
    }

    const gain = ctx.createGain();
    gain.gain.value = 0.06;

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();

    ctxRef.current = ctx;
    nodesRef.current = { source, filter, gain };
    setPlaying(true);
  }

  function stop() {
    teardown();
    setPlaying(false);
  }

  useEffect(() => {
    if (playing) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  return { playing, play, stop };
}
