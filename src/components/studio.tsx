import { useEffect, useRef, useState } from "react";

type Cut = "hoodie" | "tee";
type PackId = "jellyfish" | "thinking" | "deep";
const TRACKS = {
  jellyfish: { title: "Jellyfish", src: "AUDIO/JELLYFISH-2026-10-04.M4A" },
  thinking: { title: "I'm Thinking", src: "AUDIO/IM-THINKING-2026-10-04.M4A" },
  deep: { title: "Deep Down", src: "AUDIO/DEEP-DOWN-2026-10-04.M4A" },
} as const;

let shelfCtx: AudioContext | null = null;
let shelfAnalyser: AnalyserNode | null = null;

function bindShelfAudio(audio: HTMLAudioElement) {
  if (shelfAnalyser) return shelfAnalyser;
  try {
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.62;
    const source = ctx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    shelfCtx = ctx;
    shelfAnalyser = analyser;
    const shared = audio as HTMLAudioElement & { _nerbousAnalyser?: AnalyserNode; _nerbousCtx?: AudioContext };
    shared._nerbousAnalyser = analyser;
    shared._nerbousCtx = ctx;
    return analyser;
  } catch {
    return null;
  }
}

function resumeShelfAudio() {
  if (shelfCtx && shelfCtx.state === "suspended") void shelfCtx.resume();
}

const CLOTHS = [
  { id: "ink", label: "Ink", color: "#1c1e24", className: "swatch-ink" },
  { id: "bone", label: "Bone", color: "#e6dcc8", className: "swatch-bone" },
  { id: "brass", label: "Brass cloth", color: "#2a241c", className: "swatch-brass" },
  { id: "forest", label: "Forest", color: "#24302b", className: "swatch-forest" },
] as const;

const EDGE = "#d7b16a";
const VOID = "#100e0c";

const MUSIC = [
  { label: "Spotify", href: "https://open.spotify.com/artist/3vtsh5m9iOXuh6obMyAHBf" },
  { label: "Apple Music", href: "https://music.apple.com/us/artist/nerbous/1578265521" },
  { label: "Deezer", href: "https://www.deezer.com/artist/140392202" },
  { label: "Tidal", href: "https://tidal.com/artist/27401006" },
  { label: "SoundCloud", href: "https://soundcloud.com/nerbous" },
  { label: "YouTube", href: "https://www.youtube.com/@Nerbous" },
] as const;

const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/nerbous1" },
  { label: "TikTok", href: "https://www.tiktok.com/@nerbous" },
] as const;

function StoreLink() {
  return (
    <a className="store" href="" onClick={(event) => event.preventDefault()}>
      AKAi.LLC
    </a>
  );
}

function Garment({ cut, color }: { cut: Cut; color: string }) {
  if (cut === "tee") {
    return (
      <svg className="breathe" viewBox="0 0 320 420" aria-label="Tee on an invisible upper body">
        <defs>
          <linearGradient id="cloth" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={color} />
            <stop offset="0.55" stopColor={color} />
            <stop offset="1" stopColor="#0a0908" />
          </linearGradient>
        </defs>
        <path
          fill="url(#cloth)"
          stroke={EDGE}
          strokeWidth="0.6"
          strokeOpacity="0.45"
          d="M118 92 C128 70 150 62 160 62 C170 62 192 70 202 92 L246 112 L268 168 L236 184 L228 150 L214 158 L214 292 L106 292 L106 158 L92 150 L84 184 L52 168 L74 112 Z"
        />
        <path
          fill="none"
          stroke={EDGE}
          strokeWidth="0.8"
          strokeOpacity="0.55"
          d="M138 86 C146 108 174 108 182 86"
        />
        <path fill={VOID} d="M142 78 C148 96 172 96 178 78 C170 70 150 70 142 78 Z" />
        <path fill="none" stroke={EDGE} strokeOpacity="0.2" d="M160 108 V270" />
      </svg>
    );
  }
  return (
    <svg className="breathe" viewBox="0 0 320 460" aria-label="Hoodie on an invisible upper body">
      <defs>
        <linearGradient id="cloth" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#3a3530" />
          <stop offset="0.35" stopColor={color} />
          <stop offset="1" stopColor="#090807" />
        </linearGradient>
      </defs>
      <path
        fill="url(#cloth)"
        stroke={EDGE}
        strokeWidth="0.6"
        strokeOpacity="0.4"
        d="M108 118 C96 78 124 42 160 40 C196 42 224 78 212 118 L248 132 L286 210 L246 230 L232 176 L220 188 L220 340 L100 340 L100 188 L88 176 L74 230 L34 210 L72 132 Z"
      />
      <path
        fill="url(#cloth)"
        stroke={EDGE}
        strokeWidth="0.5"
        strokeOpacity="0.35"
        d="M118 108 C112 70 132 36 160 28 C188 36 208 70 202 108 C190 92 170 86 160 86 C150 86 130 92 118 108 Z"
      />
      <path fill={VOID} d="M140 96 C148 118 172 118 180 96 C172 88 148 88 140 96 Z" />
      <path fill="none" stroke={EDGE} strokeWidth="0.8" strokeOpacity="0.45" d="M150 132 v46 M170 132 v46" />
    </svg>
  );
}

function hueToHex(hue: number) {
  const h = ((hue % 360) + 360) % 360;
  const s = 0.58;
  const l = 0.63;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const sector = Math.floor(h / 60);
  const rgb = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][sector] ?? [c, x, 0];
  const hex = rgb
    .map((channel) => Math.round((channel + m) * 255).toString(16).padStart(2, "0"))
    .join("");
  return `#${hex}`;
}

export function Studio() {
  const [cloth, setCloth] = useState<(typeof CLOTHS)[number]["id"]>("ink");
  const [pack, setPack] = useState<PackId>("jellyfish");
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState<TrackId>("jellyfish");
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const vizRef = useRef<SVGSVGElement>(null);
  const tesserRef = useRef<{
    setFollow: (on: boolean) => void;
    setSpin: (plane: string, value: number) => void;
    setColor: (color: string) => void;
    resetSpin: () => void;
    destroy: () => void;
  } | null>(null);
  const [followCube, setFollowCube] = useState(true);
  const [cubeOpen, setCubeOpen] = useState(false);
  const [cubeHue, setCubeHue] = useState(38);
  const [spin, setSpin] = useState({ xz: 1, yw: 1, xy: 1, xw: 1, zw: 1 });
  const playingRef = useRef(false);
  const hushRef = useRef(false);
  const offscreenRef = useRef(false);
  playingRef.current = playing;

  const color = CLOTHS.find((item) => item.id === cloth)?.color ?? CLOTHS[0].color;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let plays = 0;
    const onEnded = () => {
      if (offscreenRef.current || hushRef.current) return;
      if (!video.muted) plays += 1;
      if (plays >= 3) {
        hushRef.current = true;
        video.muted = true;
      }
      void video.play();
    };
    const arm = () => {
      if (hushRef.current || plays >= 3 || !video.muted) return;
      video.currentTime = 0;
      video.muted = false;
      void video.play();
    };
    video.addEventListener("ended", onEnded);
    window.addEventListener("pointerdown", arm);
    video.muted = false;
    void video.play().catch(() => {
      video.muted = true;
      void video.play();
    });
    return () => {
      video.removeEventListener("ended", onEnded);
      window.removeEventListener("pointerdown", arm);
    };
  }, []);

  useEffect(() => {
    const svg = vizRef.current;
    const audio = audioRef.current;
    if (!svg) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const analyser = audio ? bindShelfAudio(audio) : null;
    const bins = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    let hit = 0;
    let bassMemory = 0.2;
    const strands = Array.from({ length: 14 }, (_, index) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const glow = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linecap", "round");
      glow.setAttribute("fill", "none");
      glow.setAttribute("stroke-linecap", "round");
      svg.appendChild(glow);
      svg.appendChild(path);
      svg.appendChild(dot);
      return {
        path,
        glow,
        dot,
        phase: index * 0.7,
        attach: 0.04 + (index / 13) * 0.92,
        sag: 0.18 + (index % 4) * 0.08,
        amp: 10 + (index % 5) * 4,
        speed: 0.7 + (index % 3) * 0.35,
        w: 1.1 + (index % 4) * 0.35,
        reach: 0.62 + (index % 5) * 0.07,
        tip: 1.6 + (index % 3) * 0.7,
      };
    });
    let frame = 0;
    const draw = (t: number) => {
      const width = svg.clientWidth;
      const height = svg.clientHeight;
      if (width < 2 || height < 2) {
        frame = window.requestAnimationFrame(draw);
        return;
      }
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      const live = playingRef.current && audio && !audio.paused;
      if (live) resumeShelfAudio();
      let bass = 0;
      let mid = 0;
      let high = 0;
      if (live && analyser && bins) {
        analyser.getByteFrequencyData(bins);
        const avg = (from: number, to: number) => {
          let sum = 0;
          const count = Math.max(1, to - from);
          for (let i = from; i < to; i += 1) sum += bins[i] ?? 0;
          return sum / count / 255;
        };
        bass = avg(1, 6);
        mid = avg(8, 18);
        high = avg(22, 48);
        bassMemory = bassMemory * 0.9 + bass * 0.1;
        if (bass > 0.55 && bass > bassMemory + 0.16) hit = 1;
      }
      hit *= 0.86;
      const logo = svg.parentElement?.querySelector(".viz-logo");
      const svgBox = svg.getBoundingClientRect();
      const logoBox = logo?.getBoundingClientRect();
      const headX = logoBox ? logoBox.left - svgBox.left + logoBox.width * 0.78 : width - 8;
      const headTop = logoBox ? logoBox.top - svgBox.top + logoBox.height * 0.3 : height * 0.3;
      const headSpan = logoBox ? logoBox.height * 0.46 : height * 0.46;
      for (const strand of strands) {
        const x0 = headX;
        const y0 = headTop + strand.attach * headSpan;
        const x1 = Math.max(8, headX - width * strand.reach * (live ? 0.94 + bass * 0.04 : 0.96));
        const drift = (Math.sin(t / 1400 + strand.phase) + 1) / 2;
        const red = Math.min(255, Math.round(live ? 188 + high * 16 + hit * 10 : 176 + drift * 24));
        const green = Math.min(255, Math.round(live ? 148 + mid * 18 + hit * 8 : 142 + drift * 18));
        const blue = Math.min(255, Math.round(live ? 72 + high * 28 + hit * 14 : 78 + drift * 16));
        const alpha = Math.min(1, live ? 0.55 + mid * 0.08 + hit * 0.08 : 0.48);
        const ink = `rgba(${red},${green},${blue},${alpha.toFixed(2)})`;
        let d = "";
        let tipX = x0;
        let tipY = y0;
        const steps = 40;
        const flow = t * 0.00062 * strand.speed;
        const music = reduced ? 0 : live ? 1 + bass * 0.16 + hit * 0.1 : 1;
        for (let i = 0; i <= steps; i += 1) {
          const step = i / steps;
          const x = x0 + (x1 - x0) * step;
          const ease = Math.sin(step * Math.PI * 0.5);
          const droop = Math.sin(step * Math.PI) * strand.sag * height * 0.12;
          const sway =
            Math.sin(step * 1.25 - flow + strand.phase) * 46 * ease +
            Math.sin(flow * 0.4 + strand.phase) * 22 * ease;
          const rest = Math.sin(step * 2.1 + strand.phase) * 18 * ease;
          const y = y0 + droop + rest + sway * music;
          tipX = x;
          tipY = y;
          d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        const swell = live ? 1.05 + bass * 0.35 + hit * 0.55 : 1;
        strand.path.setAttribute("stroke", ink);
        strand.path.setAttribute("stroke-width", String(strand.w * swell));
        strand.path.setAttribute("d", d);
        strand.glow.setAttribute("stroke", ink);
        strand.glow.setAttribute("stroke-width", String(strand.w * (1.6 + swell)));
        strand.glow.setAttribute("opacity", live ? String(Math.min(0.4, 0.14 + bass * 0.08 + hit * 0.1)) : "0.14");
        strand.glow.setAttribute("d", d);
        strand.dot.setAttribute("fill", ink);
        strand.dot.setAttribute("cx", tipX.toFixed(1));
        strand.dot.setAttribute("cy", tipY.toFixed(1));
        strand.dot.setAttribute("r", String(strand.tip * (live ? 1 + hit * 0.2 : 1)));
      }
      if (!reduced) frame = window.requestAnimationFrame(draw);
    };
    frame = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(frame);
      for (const strand of strands) strand.path.remove(), strand.glow.remove(), strand.dot.remove();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const gone = !entry || entry.intersectionRatio < 0.2;
        offscreenRef.current = gone;
        if (gone) video.pause();
      },
      { threshold: [0, 0.2] },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    for (const item of Object.values(TRACKS)) {
      const warm = new Audio();
      warm.preload = "auto";
      warm.src = item.src;
    }
  }, []);

  useEffect(() => {
    let handle: {
      setFollow: (on: boolean) => void;
      setSpin: (plane: string, value: number) => void;
      setColor: (color: string) => void;
      resetSpin: () => void;
      destroy: () => void;
    } | null = null;
    let cancelled = false;
    const boot = () => {
      const Tesser = (window as unknown as {
        Tesser?: {
          mount: (sel: string, opts: object) => NonNullable<typeof handle>;
        };
      }).Tesser;
      if (cancelled || !Tesser || handle) return;
      handle = Tesser.mount("#tesser-page", {
        mode: "hyper",
        theme: "copper",
        color: "#d7b16a",
        transparent: true,
        follow: true,
        bounce: true,
        controls: false,
        title: false,
        adapt: false,
        sensitivity: 1.15,
        speed: 0.85,
        radius: 0.16,
      });
      tesserRef.current = handle;
    };
    if ((window as unknown as { Tesser?: unknown }).Tesser) boot();
    else {
      const script = document.createElement("script");
      script.src = "TESSER-2026-10-04.JS";
      script.onload = boot;
      document.body.appendChild(script);
    }
    return () => {
      cancelled = true;
      handle?.destroy();
      tesserRef.current = null;
    };
  }, []);

  const loadedRef = useRef<TrackId>("jellyfish");

  const hushVideo = () => {
    hushRef.current = true;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.pause();
  };

  const playTrack = async (id: TrackId) => {
    const audio = audioRef.current;
    if (!audio) return;
    hushVideo();
    resumeShelfAudio();
    if (loadedRef.current === id && !audio.paused) {
      audio.pause();
      setPlaying(false);
      return;
    }
    if (loadedRef.current !== id) {
      audio.src = TRACKS[id].src;
      loadedRef.current = id;
    }
    setTrack(id);
    await audio.play();
    setPlaying(true);
  };

  return (
    <div className="studio-root">
      <header className="studio-top">
        <a className="mark" href="#stage">
          <img src="BRAND-LOGO-2026-10-04.JPG" alt="Nerbous logo" />
          <span>Nerbous</span>
        </a>
        <nav className="nav" aria-label="Page">
          <a href="#stage">Stage</a>
          <a href="#listen">Listen</a>
          <a href="#packs">Packs</a>
          <a href="#shelf">Shelf</a>
        </nav>
      </header>

      <div className="identity">
        <div className="mast">
          <h1 className="mast-name">Nerbous</h1>
          <p className="mast-sub">Holding desk · concept only</p>
        </div>

        <div className="listen-band">
        <section className="out" id="listen" aria-label="Music and social">
        <p className="eyebrow">Listen</p>
        <div className="out-row">
          {MUSIC.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
              {item.label}
            </a>
          ))}
        </div>
        <p className="eyebrow">Follow</p>
        <div className="out-row">
          {SOCIAL.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
              {item.label}
            </a>
          ))}
        </div>
      </section>
        <video
          ref={videoRef}
          className="signal"
          src="JELLYFISH-HOODIE-2026-10-04.MP4"
          autoPlay
          playsInline
          aria-label="The Jellyfish hoodie"
        />
        </div>
      </div>

      <div className="stage-wrap" id="stage">
        <div className="stage" aria-label="Garment stage">
          <div className="garment">
            <Garment cut="hoodie" color={color} />
          </div>
          <p className="chest-print" aria-hidden="true">
            {pack === "deep" ? (
              <>
                <span>Deep Down</span>
                <small>Nerbous</small>
              </>
            ) : pack === "thinking" ? (
              <>
                <span>I'm Thinking</span>
                <small>Nerbous</small>
              </>
            ) : (
              <>
                <span>Jellyfish</span>
                <small>Nerbous</small>
              </>
            )}
          </p>
          <p className="stage-note">Hoodie only. Tee sold separately.</p>
        </div>
        <div className="stage-controls">
          <span className="swatches">
            {CLOTHS.map((item) => (
              <button
                key={item.id}
                className={`swatch ${item.className}`}
                type="button"
                aria-label={item.label}
                aria-pressed={cloth === item.id}
                onClick={() => setCloth(item.id)}
              />
            ))}
          </span>
        </div>
      </div>

      <section className="packs" id="packs" aria-label="Clothing">
        <article className="pack">
          <button className="pack-pick" type="button" aria-pressed={pack === "jellyfish"} onClick={() => setPack("jellyfish")}>
            <img className="pack-mark" src="PRINT-JELLYFISH-2026-10-04.JPG" alt="Jellyfish print" />
            <div>
              <p className="eyebrow">Print and WAV</p>
              <h2>Jellyfish</h2>
              <p className="price">$78</p>
              <p className="meta">Hoodie. Tee sold separately. This print and the WAV come with the pack.</p>
            </div>
          </button>
          <StoreLink />
        </article>
        <article className="pack">
          <button className="pack-pick" type="button" aria-pressed={pack === "thinking"} onClick={() => setPack("thinking")}>
            <img className="pack-mark" src="PRINT-IM-THINKING-2026-10-04.JPG" alt="I'm Thinking print" />
            <div>
              <p className="eyebrow">Print and WAV</p>
              <h2>I'm Thinking</h2>
              <p className="price">$75</p>
              <p className="meta">Hoodie. Tee sold separately. This print and the WAV come with the pack.</p>
            </div>
          </button>
          <StoreLink />
        </article>
        <article className="pack">
          <button className="pack-pick" type="button" aria-pressed={pack === "deep"} onClick={() => setPack("deep")}>
            <img className="pack-mark" src="PRINT-DEEP-DOWN-2026-10-04.JPG" alt="Deep Down print" />
            <div>
              <p className="eyebrow">Print and WAV</p>
              <h2>Deep Down</h2>
              <p className="price">$72</p>
              <p className="meta">Hoodie. Tee sold separately. This print and the WAV come with the pack.</p>
            </div>
          </button>
          <StoreLink />
        </article>
      </section>

      <section className="shelf-zone" id="shelf">
        <div className="tentacles">
          <svg className="viz" ref={vizRef} aria-hidden="true" />
          <img className="viz-logo" src="BRAND-LOGO-2026-10-04.JPG" alt="" />
        </div>
        <div className="shelf">
          <div className="shelf-head">
            <h2>Shelf · Nerbous</h2>
            <p className="eyebrow">Tentacles</p>
          </div>
          <article className="release">
            <button className="play" type="button" onClick={() => void playTrack("jellyfish")}>
              {playing && track === "jellyfish" ? "Pause" : "Play"}
            </button>
            <div className="release-copy">
              <img className="cover" src="PRINT-JELLYFISH-2026-10-04.JPG" alt="Jellyfish print by Nerbous" />
              <div>
                <h3>Jellyfish</h3>
                <p>Print with the pack · 5:10</p>
              </div>
            </div>
            <p className="sample">Sample</p>
          </article>
          <article className="release">
            <button className="play" type="button" onClick={() => void playTrack("thinking")}>
              {playing && track === "thinking" ? "Pause" : "Play"}
            </button>
            <div className="release-copy">
              <img className="cover" src="PRINT-IM-THINKING-2026-10-04.JPG" alt="I'm Thinking print by Nerbous" />
              <div>
                <h3>I'm Thinking</h3>
                <p>Print with the pack · 4:54</p>
              </div>
            </div>
            <p className="sample">Sample</p>
          </article>
          <article className="release">
            <button className="play" type="button" onClick={() => void playTrack("deep")}>
              {playing && track === "deep" ? "Pause" : "Play"}
            </button>
            <div className="release-copy">
              <img className="cover" src="PRINT-DEEP-DOWN-2026-10-04.JPG" alt="Deep Down print by Nerbous" />
              <div>
                <h3>Deep Down</h3>
                <p>Print with the pack · 4:33</p>
              </div>
            </div>
            <p className="sample">Sample</p>
          </article>
        </div>
      </section>

      <div className={`player${cubeOpen ? " open" : ""}`} aria-label="Hypercube controls">
        {cubeOpen ? (
          <div className="player-panel">
            <div className="cube-toggle" role="group" aria-label="Hypercube motion">
              <button
                type="button"
                aria-pressed={followCube}
                onClick={() => {
                  setFollowCube(true);
                  tesserRef.current?.setFollow(true);
                }}
              >
                Follow
              </button>
              <button
                type="button"
                aria-pressed={!followCube}
                onClick={() => {
                  setFollowCube(false);
                  tesserRef.current?.setFollow(false);
                }}
              >
                Drift
              </button>
            </div>
            {(
              [
                ["xz", "Yaw"],
                ["yw", "Pitch"],
                ["xy", "Roll"],
                ["xw", "XW"],
                ["zw", "ZW"],
              ] as const
            ).map(([plane, label]) => (
              <label className="spin" key={plane}>
                {label}
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.05}
                  value={spin[plane]}
                  aria-label={`${label} rotation`}
                  onInput={(event) => {
                    const value = Number(event.currentTarget.value);
                    setSpin((current) => ({ ...current, [plane]: value }));
                    tesserRef.current?.setSpin(plane, value);
                  }}
                />
              </label>
            ))}
            <button
              className="spin-reset"
              type="button"
              onClick={() => {
                setSpin({ xz: 1, yw: 1, xy: 1, xw: 1, zw: 1 });
                tesserRef.current?.resetSpin();
              }}
            >
              Reset
            </button>
          </div>
        ) : null}
        <div className="player-row">
          <button
            className="cube-open"
            type="button"
            aria-expanded={cubeOpen}
            onClick={() => setCubeOpen((open) => !open)}
          >
            {cubeOpen ? "Close" : "Hypercube"}
          </button>
          <label className="spin cube-hue">
            Color
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={cubeHue}
              aria-label="Hypercube color"
              style={{ accentColor: `hsl(${cubeHue} 58% 63%)` }}
              onInput={(event) => {
                const hue = Number(event.currentTarget.value);
                setCubeHue(hue);
                tesserRef.current?.setColor(hueToHex(hue));
              }}
            />
          </label>
        </div>
      </div>
      <audio
        ref={audioRef}
        preload="auto"
        src="AUDIO/JELLYFISH-2026-10-04.M4A"
        onEnded={() => setPlaying(false)}
      />
      <div id="tesser-page" className="tesser-page" />
    </div>
  );
}
