"use client";
// WebAudio playback for the Sound dialog: the real startup sound plus synthesized stand-ins for
// the other Windows event sounds, all routed through an analyser so meters can show live levels.

let ctx: AudioContext | null = null;
let startup: Promise<AudioBuffer> | null = null;

const audio = () => (ctx ??= new AudioContext());

export const STARTUP_FILE = "Windows Logon Sound.wav";

// Rough melodic shapes for the Windows 7 event sounds (freq Hz, start s, length s)
const TONES: Record<string, [number, number, number][]> = {
  "Windows Ding.wav":                 [[1318, 0, 0.5], [1760, 0.09, 0.6]],
  "Windows Background.wav":           [[880, 0, 0.35], [1175, 0.12, 0.45]],
  "Windows Foreground.wav":           [[587, 0, 0.3], [880, 0.1, 0.5]],
  "Windows Exclamation.wav":          [[1047, 0, 0.25], [784, 0.14, 0.5]],
  "Windows Critical Stop.wav":        [[440, 0, 0.3], [330, 0.15, 0.5]],
  "Windows Notify.wav":               [[988, 0, 0.3], [1319, 0.1, 0.3], [1568, 0.2, 0.5]],
  "Windows Balloon.wav":              [[1568, 0, 0.18], [2093, 0.08, 0.35]],
  "Windows Hardware Insert.wav":      [[659, 0, 0.18], [988, 0.12, 0.35]],
  "Windows Hardware Remove.wav":      [[988, 0, 0.18], [659, 0.12, 0.35]],
  "Windows Hardware Fail.wav":        [[523, 0, 0.18], [523, 0.2, 0.3]],
  "Windows Battery Low.wav":          [[784, 0, 0.2], [659, 0.15, 0.3]],
  "Windows Battery Critical.wav":     [[659, 0, 0.2], [523, 0.15, 0.2], [440, 0.3, 0.4]],
  "Windows Print complete.wav":       [[1175, 0, 0.2], [1568, 0.1, 0.4]],
  "Windows User Account Control.wav": [[740, 0, 0.3], [988, 0.12, 0.3], [1480, 0.24, 0.6]],
  "Windows Logoff Sound.wav":         [[1175, 0, 0.5], [880, 0.25, 0.5], [659, 0.5, 0.9]],
  "Windows Navigation Start.wav":     [[2637, 0, 0.05]],
  "Windows Pop-up Blocked.wav":       [[1319, 0, 0.12], [1319, 0.15, 0.2]],
  "Windows Error.wav":                [[392, 0, 0.25], [370, 0.12, 0.45]],
  "Windows Recycle.wav":              [[300, 0, 0.12], [220, 0.06, 0.25]],
  "Windows Information Bar.wav":      [[1760, 0, 0.12]],
};

export const SOUND_FILES = [STARTUP_FILE, ...Object.keys(TONES)];

export type Playback = { analyser: AnalyserNode; done: Promise<void>; stop: () => void };

/** Play a sound file name from SOUND_FILES at `volume` (0–1). */
export async function playSound(file: string, volume = 1): Promise<Playback> {
  const ac = audio();
  if (ac.state === "suspended") await ac.resume();
  const gain = ac.createGain();
  gain.gain.value = volume;
  const analyser = ac.createAnalyser();
  analyser.fftSize = 1024;
  gain.connect(analyser).connect(ac.destination);

  let stop = () => {};
  let done: Promise<void>;
  if (file === STARTUP_FILE) {
    startup ??= fetch("/Sounds/Start.mp3").then((r) => r.arrayBuffer()).then((b) => ac.decodeAudioData(b));
    const src = ac.createBufferSource();
    src.buffer = await startup;
    src.connect(gain);
    src.start();
    done = new Promise((r) => (src.onended = () => r()));
    stop = () => { try { src.stop(); } catch {} };
  } else {
    const t0 = ac.currentTime + 0.02;
    const notes = TONES[file] ?? TONES["Windows Ding.wav"];
    const oscs = notes.map(([f, at, len]) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0 + at);
      g.gain.linearRampToValueAtTime(0.35, t0 + at + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + at + len);
      o.connect(g).connect(gain);
      o.start(t0 + at);
      o.stop(t0 + at + len + 0.05);
      return o;
    });
    done = new Promise((r) => (oscs[oscs.length - 1].onended = () => r()));
    stop = () => oscs.forEach((o) => { try { o.stop(); } catch {} });
  }
  done.then(() => gain.disconnect());
  return { analyser, done, stop };
}

/** Current RMS level (0–1, boosted for display) of an analyser. */
export function levelOf(analyser: AnalyserNode, buf: Float32Array) {
  analyser.getFloatTimeDomainData(buf);
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
  return Math.min(1, Math.sqrt(sum / buf.length) * 4);
}
