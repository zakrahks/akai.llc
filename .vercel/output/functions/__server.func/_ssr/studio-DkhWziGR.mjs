import { i as __toESM } from "../_runtime.mjs";
import { G as require_jsx_runtime, K as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/studio-DkhWziGR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TRACKS = {
	jellyfish: {
		title: "Jellyfish",
		src: "AUDIO/JELLYFISH-2026-10-04.M4A"
	},
	thinking: {
		title: "I'm Thinking",
		src: "AUDIO/IM-THINKING-2026-10-04.M4A"
	},
	deep: {
		title: "Deep Down",
		src: "AUDIO/DEEP-DOWN-2026-10-04.M4A"
	}
};
var shelfCtx = null;
var shelfAnalyser = null;
function bindShelfAudio(audio) {
	if (shelfAnalyser) return shelfAnalyser;
	try {
		const ctx = new AudioContext();
		const analyser = ctx.createAnalyser();
		analyser.fftSize = 256;
		analyser.smoothingTimeConstant = .62;
		ctx.createMediaElementSource(audio).connect(analyser);
		analyser.connect(ctx.destination);
		shelfCtx = ctx;
		shelfAnalyser = analyser;
		const shared = audio;
		shared._nerbousAnalyser = analyser;
		shared._nerbousCtx = ctx;
		return analyser;
	} catch {
		return null;
	}
}
function resumeShelfAudio() {
	if (shelfCtx && shelfCtx.state === "suspended") shelfCtx.resume();
}
var CLOTHS = [
	{
		id: "ink",
		label: "Ink",
		color: "#1c1e24",
		className: "swatch-ink"
	},
	{
		id: "bone",
		label: "Bone",
		color: "#e6dcc8",
		className: "swatch-bone"
	},
	{
		id: "brass",
		label: "Brass cloth",
		color: "#2a241c",
		className: "swatch-brass"
	},
	{
		id: "forest",
		label: "Forest",
		color: "#24302b",
		className: "swatch-forest"
	}
];
var EDGE = "#d7b16a";
var VOID = "#100e0c";
var MUSIC = [
	{
		label: "Spotify",
		href: "https://open.spotify.com/artist/3vtsh5m9iOXuh6obMyAHBf"
	},
	{
		label: "Apple Music",
		href: "https://music.apple.com/us/artist/nerbous/1578265521"
	},
	{
		label: "Deezer",
		href: "https://www.deezer.com/artist/140392202"
	},
	{
		label: "Tidal",
		href: "https://tidal.com/artist/27401006"
	},
	{
		label: "SoundCloud",
		href: "https://soundcloud.com/nerbous"
	},
	{
		label: "YouTube",
		href: "https://www.youtube.com/@Nerbous"
	}
];
var SOCIAL = [{
	label: "Instagram",
	href: "https://www.instagram.com/nerbous1"
}, {
	label: "TikTok",
	href: "https://www.tiktok.com/@nerbous"
}];
function StoreLink() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		className: "store",
		href: "",
		onClick: (event) => event.preventDefault(),
		children: "AKAi.LLC"
	});
}
function Garment({ cut, color }) {
	if (cut === "tee") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className: "breathe",
		viewBox: "0 0 320 420",
		"aria-label": "Tee on an invisible upper body",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "cloth",
				x1: "0",
				y1: "0",
				x2: "1",
				y2: "1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0",
						stopColor: color
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0.55",
						stopColor: color
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "1",
						stopColor: "#0a0908"
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "url(#cloth)",
				stroke: EDGE,
				strokeWidth: "0.6",
				strokeOpacity: "0.45",
				d: "M118 92 C128 70 150 62 160 62 C170 62 192 70 202 92 L246 112 L268 168 L236 184 L228 150 L214 158 L214 292 L106 292 L106 158 L92 150 L84 184 L52 168 L74 112 Z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "none",
				stroke: EDGE,
				strokeWidth: "0.8",
				strokeOpacity: "0.55",
				d: "M138 86 C146 108 174 108 182 86"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: VOID,
				d: "M142 78 C148 96 172 96 178 78 C170 70 150 70 142 78 Z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "none",
				stroke: EDGE,
				strokeOpacity: "0.2",
				d: "M160 108 V270"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className: "breathe",
		viewBox: "0 0 320 460",
		"aria-label": "Hoodie on an invisible upper body",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "cloth",
				x1: "0",
				y1: "0",
				x2: "0.2",
				y2: "1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0",
						stopColor: "#3a3530"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0.35",
						stopColor: color
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "1",
						stopColor: "#090807"
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "url(#cloth)",
				stroke: EDGE,
				strokeWidth: "0.6",
				strokeOpacity: "0.4",
				d: "M108 118 C96 78 124 42 160 40 C196 42 224 78 212 118 L248 132 L286 210 L246 230 L232 176 L220 188 L220 340 L100 340 L100 188 L88 176 L74 230 L34 210 L72 132 Z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "url(#cloth)",
				stroke: EDGE,
				strokeWidth: "0.5",
				strokeOpacity: "0.35",
				d: "M118 108 C112 70 132 36 160 28 C188 36 208 70 202 108 C190 92 170 86 160 86 C150 86 130 92 118 108 Z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: VOID,
				d: "M140 96 C148 118 172 118 180 96 C172 88 148 88 140 96 Z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "none",
				stroke: EDGE,
				strokeWidth: "0.8",
				strokeOpacity: "0.45",
				d: "M150 132 v46 M170 132 v46"
			})
		]
	});
}
function hueToHex(hue) {
	const h = (hue % 360 + 360) % 360;
	const s = .58;
	const l = .63;
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(h / 60 % 2 - 1));
	const m = l - c / 2;
	const sector = Math.floor(h / 60);
	return `#${([
		[
			c,
			x,
			0
		],
		[
			x,
			c,
			0
		],
		[
			0,
			c,
			x
		],
		[
			0,
			x,
			c
		],
		[
			x,
			0,
			c
		],
		[
			c,
			0,
			x
		]
	][sector] ?? [
		c,
		x,
		0
	]).map((channel) => Math.round((channel + m) * 255).toString(16).padStart(2, "0")).join("")}`;
}
function Studio() {
	const [cloth, setCloth] = (0, import_react.useState)("ink");
	const [pack, setPack] = (0, import_react.useState)("jellyfish");
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [track, setTrack] = (0, import_react.useState)("jellyfish");
	const audioRef = (0, import_react.useRef)(null);
	const videoRef = (0, import_react.useRef)(null);
	const vizRef = (0, import_react.useRef)(null);
	const tesserRef = (0, import_react.useRef)(null);
	const [followCube, setFollowCube] = (0, import_react.useState)(true);
	const [cubeOpen, setCubeOpen] = (0, import_react.useState)(false);
	const [cubeHue, setCubeHue] = (0, import_react.useState)(38);
	const [spin, setSpin] = (0, import_react.useState)({
		xz: 1,
		yw: 1,
		xy: 1,
		xw: 1,
		zw: 1
	});
	const playingRef = (0, import_react.useRef)(false);
	const hushRef = (0, import_react.useRef)(false);
	const offscreenRef = (0, import_react.useRef)(false);
	playingRef.current = playing;
	const color = CLOTHS.find((item) => item.id === cloth)?.color ?? CLOTHS[0].color;
	(0, import_react.useEffect)(() => {
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
			video.play();
		};
		const arm = () => {
			if (hushRef.current || plays >= 3 || !video.muted) return;
			video.currentTime = 0;
			video.muted = false;
			video.play();
		};
		video.addEventListener("ended", onEnded);
		window.addEventListener("pointerdown", arm);
		video.muted = false;
		video.play().catch(() => {
			video.muted = true;
			video.play();
		});
		return () => {
			video.removeEventListener("ended", onEnded);
			window.removeEventListener("pointerdown", arm);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const svg = vizRef.current;
		const audio = audioRef.current;
		if (!svg) return;
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const analyser = audio ? bindShelfAudio(audio) : null;
		const bins = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
		let hit = 0;
		let bassMemory = .2;
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
				phase: index * .7,
				attach: .04 + index / 13 * .92,
				sag: .18 + index % 4 * .08,
				amp: 10 + index % 5 * 4,
				speed: .7 + index % 3 * .35,
				w: 1.1 + index % 4 * .35,
				reach: .62 + index % 5 * .07,
				tip: 1.6 + index % 3 * .7
			};
		});
		let frame = 0;
		const draw = (t) => {
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
				const avg = (from, to) => {
					let sum = 0;
					const count = Math.max(1, to - from);
					for (let i = from; i < to; i += 1) sum += bins[i] ?? 0;
					return sum / count / 255;
				};
				bass = avg(1, 6);
				mid = avg(8, 18);
				high = avg(22, 48);
				bassMemory = bassMemory * .9 + bass * .1;
				if (bass > .55 && bass > bassMemory + .16) hit = 1;
			}
			hit *= .86;
			const logo = svg.parentElement?.querySelector(".viz-logo");
			const svgBox = svg.getBoundingClientRect();
			const logoBox = logo?.getBoundingClientRect();
			const headX = logoBox ? logoBox.left - svgBox.left + logoBox.width * .78 : width - 8;
			const headTop = logoBox ? logoBox.top - svgBox.top + logoBox.height * .3 : height * .3;
			const headSpan = logoBox ? logoBox.height * .46 : height * .46;
			for (const strand of strands) {
				const x0 = headX;
				const y0 = headTop + strand.attach * headSpan;
				const x1 = Math.max(8, headX - width * strand.reach * (live ? .94 + bass * .04 : .96));
				const drift = (Math.sin(t / 1400 + strand.phase) + 1) / 2;
				const ink = `rgba(${Math.min(255, Math.round(live ? 188 + high * 16 + hit * 10 : 176 + drift * 24))},${Math.min(255, Math.round(live ? 148 + mid * 18 + hit * 8 : 142 + drift * 18))},${Math.min(255, Math.round(live ? 72 + high * 28 + hit * 14 : 78 + drift * 16))},${Math.min(1, live ? .55 + mid * .08 + hit * .08 : .48).toFixed(2)})`;
				let d = "";
				let tipX = x0;
				let tipY = y0;
				const steps = 40;
				const flow = t * 62e-5 * strand.speed;
				const music = reduced ? 0 : live ? 1 + bass * .16 + hit * .1 : 1;
				for (let i = 0; i <= steps; i += 1) {
					const step = i / steps;
					const x = x0 + (x1 - x0) * step;
					const ease = Math.sin(step * Math.PI * .5);
					const droop = Math.sin(step * Math.PI) * strand.sag * height * .12;
					const sway = Math.sin(step * 1.25 - flow + strand.phase) * 46 * ease + Math.sin(flow * .4 + strand.phase) * 22 * ease;
					const rest = Math.sin(step * 2.1 + strand.phase) * 18 * ease;
					const y = y0 + droop + rest + sway * music;
					tipX = x;
					tipY = y;
					d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
				}
				const swell = live ? 1.05 + bass * .35 + hit * .55 : 1;
				strand.path.setAttribute("stroke", ink);
				strand.path.setAttribute("stroke-width", String(strand.w * swell));
				strand.path.setAttribute("d", d);
				strand.glow.setAttribute("stroke", ink);
				strand.glow.setAttribute("stroke-width", String(strand.w * (1.6 + swell)));
				strand.glow.setAttribute("opacity", live ? String(Math.min(.4, .14 + bass * .08 + hit * .1)) : "0.14");
				strand.glow.setAttribute("d", d);
				strand.dot.setAttribute("fill", ink);
				strand.dot.setAttribute("cx", tipX.toFixed(1));
				strand.dot.setAttribute("cy", tipY.toFixed(1));
				strand.dot.setAttribute("r", String(strand.tip * (live ? 1 + hit * .2 : 1)));
			}
			if (!reduced) frame = window.requestAnimationFrame(draw);
		};
		frame = window.requestAnimationFrame(draw);
		return () => {
			window.cancelAnimationFrame(frame);
			for (const strand of strands) strand.path.remove(), strand.glow.remove(), strand.dot.remove();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		if (!video || typeof IntersectionObserver === "undefined") return;
		const observer = new IntersectionObserver(([entry]) => {
			const gone = !entry || entry.intersectionRatio < .2;
			offscreenRef.current = gone;
			if (gone) video.pause();
		}, { threshold: [0, .2] });
		observer.observe(video);
		return () => observer.disconnect();
	}, []);
	(0, import_react.useEffect)(() => {
		for (const item of Object.values(TRACKS)) {
			const warm = new Audio();
			warm.preload = "auto";
			warm.src = item.src;
		}
	}, []);
	(0, import_react.useEffect)(() => {
		let handle = null;
		let cancelled = false;
		const boot = () => {
			const Tesser = window.Tesser;
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
				speed: .85,
				radius: .16
			});
			tesserRef.current = handle;
		};
		if (window.Tesser) boot();
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
	const loadedRef = (0, import_react.useRef)("jellyfish");
	const hushVideo = () => {
		hushRef.current = true;
		const video = videoRef.current;
		if (!video) return;
		video.muted = true;
		video.pause();
	};
	const playTrack = async (id) => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "studio-root",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "studio-top",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					className: "mark",
					href: "#stage",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "BRAND-LOGO-2026-10-04.JPG",
						alt: "Nerbous logo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nerbous" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "nav",
					"aria-label": "Page",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#stage",
							children: "Stage"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#listen",
							children: "Listen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#packs",
							children: "Packs"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#shelf",
							children: "Shelf"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "identity",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mast",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mast-name",
						children: "Nerbous"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mast-sub",
						children: "Holding desk · concept only"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "listen-band",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "out",
						id: "listen",
						"aria-label": "Music and social",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "Listen"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "out-row",
								children: MUSIC.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: item.href,
									target: "_blank",
									rel: "noreferrer",
									children: item.label
								}, item.label))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "Follow"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "out-row",
								children: SOCIAL.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: item.href,
									target: "_blank",
									rel: "noreferrer",
									children: item.label
								}, item.label))
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						ref: videoRef,
						className: "signal",
						src: "JELLYFISH-HOODIE-2026-10-04.MP4",
						autoPlay: true,
						playsInline: true,
						"aria-label": "The Jellyfish hoodie"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "stage-wrap",
				id: "stage",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "stage",
					"aria-label": "Garment stage",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "garment",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Garment, {
								cut: "hoodie",
								color
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "chest-print",
							"aria-hidden": "true",
							children: pack === "deep" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Deep Down" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Nerbous" })] }) : pack === "thinking" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "I'm Thinking" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Nerbous" })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Jellyfish" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Nerbous" })] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "stage-note",
							children: "Hoodie only. Tee sold separately."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "stage-controls",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "swatches",
						children: CLOTHS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: `swatch ${item.className}`,
							type: "button",
							"aria-label": item.label,
							"aria-pressed": cloth === item.id,
							onClick: () => setCloth(item.id)
						}, item.id))
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "packs",
				id: "packs",
				"aria-label": "Clothing",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "pack",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "pack-pick",
							type: "button",
							"aria-pressed": pack === "jellyfish",
							onClick: () => setPack("jellyfish"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								className: "pack-mark",
								src: "PRINT-JELLYFISH-2026-10-04.JPG",
								alt: "Jellyfish print"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "eyebrow",
									children: "Print and WAV"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Jellyfish" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "price",
									children: "$78"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "meta",
									children: "Hoodie. Tee sold separately. This print and the WAV come with the pack."
								})
							] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreLink, {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "pack",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "pack-pick",
							type: "button",
							"aria-pressed": pack === "thinking",
							onClick: () => setPack("thinking"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								className: "pack-mark",
								src: "PRINT-IM-THINKING-2026-10-04.JPG",
								alt: "I'm Thinking print"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "eyebrow",
									children: "Print and WAV"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "I'm Thinking" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "price",
									children: "$75"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "meta",
									children: "Hoodie. Tee sold separately. This print and the WAV come with the pack."
								})
							] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreLink, {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "pack",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "pack-pick",
							type: "button",
							"aria-pressed": pack === "deep",
							onClick: () => setPack("deep"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								className: "pack-mark",
								src: "PRINT-DEEP-DOWN-2026-10-04.JPG",
								alt: "Deep Down print"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "eyebrow",
									children: "Print and WAV"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Deep Down" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "price",
									children: "$72"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "meta",
									children: "Hoodie. Tee sold separately. This print and the WAV come with the pack."
								})
							] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreLink, {})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "shelf-zone",
				id: "shelf",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tentacles",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						className: "viz",
						ref: vizRef,
						"aria-hidden": "true"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						className: "viz-logo",
						src: "BRAND-LOGO-2026-10-04.JPG",
						alt: ""
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "shelf",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "shelf-head",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Shelf · Nerbous" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "Tentacles"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "release",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "play",
									type: "button",
									onClick: () => void playTrack("jellyfish"),
									children: playing && track === "jellyfish" ? "Pause" : "Play"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "release-copy",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										className: "cover",
										src: "PRINT-JELLYFISH-2026-10-04.JPG",
										alt: "Jellyfish print by Nerbous"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Jellyfish" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Print with the pack · 5:10" })] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "sample",
									children: "Sample"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "release",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "play",
									type: "button",
									onClick: () => void playTrack("thinking"),
									children: playing && track === "thinking" ? "Pause" : "Play"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "release-copy",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										className: "cover",
										src: "PRINT-IM-THINKING-2026-10-04.JPG",
										alt: "I'm Thinking print by Nerbous"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "I'm Thinking" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Print with the pack · 4:54" })] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "sample",
									children: "Sample"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "release",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "play",
									type: "button",
									onClick: () => void playTrack("deep"),
									children: playing && track === "deep" ? "Pause" : "Play"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "release-copy",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										className: "cover",
										src: "PRINT-DEEP-DOWN-2026-10-04.JPG",
										alt: "Deep Down print by Nerbous"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Deep Down" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Print with the pack · 4:33" })] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "sample",
									children: "Sample"
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `player${cubeOpen ? " open" : ""}`,
				"aria-label": "Hypercube controls",
				children: [cubeOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "player-panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "cube-toggle",
							role: "group",
							"aria-label": "Hypercube motion",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": followCube,
								onClick: () => {
									setFollowCube(true);
									tesserRef.current?.setFollow(true);
								},
								children: "Follow"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": !followCube,
								onClick: () => {
									setFollowCube(false);
									tesserRef.current?.setFollow(false);
								},
								children: "Drift"
							})]
						}),
						[
							["xz", "Yaw"],
							["yw", "Pitch"],
							["xy", "Roll"],
							["xw", "XW"],
							["zw", "ZW"]
						].map(([plane, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "spin",
							children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: -2,
								max: 2,
								step: .05,
								value: spin[plane],
								"aria-label": `${label} rotation`,
								onInput: (event) => {
									const value = Number(event.currentTarget.value);
									setSpin((current) => ({
										...current,
										[plane]: value
									}));
									tesserRef.current?.setSpin(plane, value);
								}
							})]
						}, plane)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "spin-reset",
							type: "button",
							onClick: () => {
								setSpin({
									xz: 1,
									yw: 1,
									xy: 1,
									xw: 1,
									zw: 1
								});
								tesserRef.current?.resetSpin();
							},
							children: "Reset"
						})
					]
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "player-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "cube-open",
						type: "button",
						"aria-expanded": cubeOpen,
						onClick: () => setCubeOpen((open) => !open),
						children: cubeOpen ? "Close" : "Hypercube"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "spin cube-hue",
						children: ["Color", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: 360,
							step: 1,
							value: cubeHue,
							"aria-label": "Hypercube color",
							style: { accentColor: `hsl(${cubeHue} 58% 63%)` },
							onInput: (event) => {
								const hue = Number(event.currentTarget.value);
								setCubeHue(hue);
								tesserRef.current?.setColor(hueToHex(hue));
							}
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
				ref: audioRef,
				preload: "auto",
				src: "AUDIO/JELLYFISH-2026-10-04.M4A",
				onEnded: () => setPlaying(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				id: "tesser-page",
				className: "tesser-page"
			})
		]
	});
}
//#endregion
export { Studio as t };
