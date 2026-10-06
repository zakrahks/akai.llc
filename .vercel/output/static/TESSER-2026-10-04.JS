/**
 * Tesser — a hypercube music visualizer you can drop on any site.
 *
 *   <div data-tesser data-mode="hyper" style="height:480px"></div>
 *   <script src="https://YOUR_HOST/tesser.js"></script>
 *
 *   Tesser.mount("#viz", {
 *     mode: "hyper",          // "hyper" | "bars" | "ring"
 *     theme: "glacier",       // or { bg, edge, core, hot }
 *     color: "#e3946a",       // brand edge color
 *     background: "#1c1917",  // or omit and it samples the host page
 *     src: "https://cdn.example.com/song.mp3",
 *     sensitivity: 1.15,
 *     follow: true,           // chase the pointer
 *     bounce: true,           // ricochet off the edges
 *     speed: 1,
 *     controls: true,
 *     adapt: true
 *   })
 *
 * Remote audio has to be served with CORS
 * (Access-Control-Allow-Origin). A file the visitor uploads always works.
 * Parent pages can also postMessage { type: "tesser", action, ... }.
 */
(function () {
  "use strict";

  var SCRIPT_SRC = document.currentScript && document.currentScript.src ? document.currentScript.src : "";
  var VERSION = "1.0.0";

  var PRESETS = [
    ["glacier", "Glacier", "#07080b", "#e7eef6", "#6eb6ff", "#ffffff"],
    ["copper", "Copper", "#0c0908", "#f6ebe4", "#e3946a", "#fff7f2"],
    ["signal", "Signal", "#07090d", "#e5eeff", "#3d8dff", "#f5f9ff"],
    ["canopy", "Canopy", "#080b09", "#e5f2e6", "#6fbf7a", "#f4fff5"],
    ["ink", "Ink", "#090909", "#f4f4f5", "#b7b7b7", "#ffffff"],
  ];

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function hexOf(value) {
    if (typeof value !== "string") return null;
    var v = value.trim();
    if (!v) return null;
    if (v.charAt(0) !== "#") v = "#" + v;
    if (/^#[0-9a-fA-F]{3}$/.test(v)) {
      v = "#" + v.charAt(1) + v.charAt(1) + v.charAt(2) + v.charAt(2) + v.charAt(3) + v.charAt(3);
    }
    return /^#[0-9a-fA-F]{6}$/.test(v) ? v.toLowerCase() : null;
  }

  function rgbOf(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
  }

  function rgbToHex(rgb) {
    return (
      "#" +
      rgb
        .map(function (n) {
          return clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
        })
        .join("")
    );
  }

  function mix(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }

  function rgba(rgb, a) {
    return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
  }

  function luminance(rgb) {
    function f(c) {
      var s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
  }

  function parseCssColor(value) {
    if (!value || value === "transparent") return null;
    var hex = hexOf(value);
    if (hex) return { hex: hex, rgb: rgbOf(hex), a: 1 };
    var m = String(value).match(
      /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/i,
    );
    if (!m) return null;
    var rgb = [Number(m[1]), Number(m[2]), Number(m[3])];
    var a = 1;
    if (m[4] !== undefined) {
      a = String(m[4]).indexOf("%") >= 0 ? Number(m[4]) / 100 : Number(m[4]);
    }
    if (rgb.some(function (n) { return !Number.isFinite(n); })) return null;
    return { hex: rgbToHex(rgb), rgb: rgb, a: a };
  }

  function makeTheme(id, name, bg, core, edge, hot) {
    return {
      id: id,
      name: name,
      bg: bg,
      core: core,
      edge: edge,
      hot: hot,
      bgRgb: rgbOf(bg),
      coreRgb: rgbOf(core),
      edgeRgb: rgbOf(edge),
      hotRgb: rgbOf(hot),
      light: luminance(rgbOf(bg)) > 0.62,
    };
  }

  var THEMES = PRESETS.map(function (row) {
    return makeTheme(row[0], row[1], row[2], row[3], row[4], row[5]);
  });

  function themeById(id) {
    var key = String(id || "").toLowerCase();
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === key) return THEMES[i];
    return null;
  }

  function themeFromEdge(edge, bg) {
    var e = hexOf(edge) || "#6eb6ff";
    var b = hexOf(bg) || "#07080b";
    var light = luminance(rgbOf(b)) > 0.62;
    var core = rgbToHex(mix(rgbOf(e), rgbOf(light ? "#16181d" : "#ffffff"), light ? 0.2 : 0.78));
    var hot = light ? rgbToHex(mix(rgbOf(e), rgbOf("#16181d"), 0.5)) : "#ffffff";
    return makeTheme("custom", "Custom", b, core, e, hot);
  }

  function withBackground(theme, bg) {
    var next = hexOf(bg);
    if (!next) return theme;
    return themeFromEdge(theme.edge, next);
  }

  var EDGES = [];
  var FACES = [];
  (function buildGeometry() {
    var i, bit, a, b, k, mask, fixed, base;
    for (i = 0; i < 16; i++) {
      for (bit = 0; bit < 4; bit++) {
        mask = 1 << bit;
        if ((i & mask) === 0) EDGES.push([i, i | mask, bit]);
      }
    }
    for (a = 0; a < 4; a++) {
      for (b = a + 1; b < 4; b++) {
        fixed = [];
        for (k = 0; k < 4; k++) if (k !== a && k !== b) fixed.push(k);
        for (mask = 0; mask < 4; mask++) {
          base = ((mask & 1) << fixed[0]) | (((mask >> 1) & 1) << fixed[1]);
          FACES.push([base, base | (1 << a), base | (1 << a) | (1 << b), base | (1 << b)]);
        }
      }
    }
  })();

  function Scene(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });
    if (this.ctx && !this.ctx.roundRect) {
      this.ctx.roundRect = function (x, y, w, h, r) {
        var radius = Math.min(r || 0, w / 2, h / 2);
        this.moveTo(x + radius, y);
        this.arcTo(x + w, y, x + w, y + h, radius);
        this.arcTo(x + w, y + h, x, y + h, radius);
        this.arcTo(x, y + h, x, y, radius);
        this.arcTo(x, y, x + w, y, radius);
        this.closePath();
      };
    }
    this.w = 0;
    this.h = 0;
    this.dpr = 1;
    this.x = 0;
    this.y = 0;
    this.vx = 1;
    this.vy = 0;
    this.heading = 0.55;
    this.radius = 120;
    this.placed = false;
    this.time = 0;
    this.xy = 0.4;
    this.xw = 0.2;
    this.yw = 0.8;
    this.zw = 0.15;
    this.xz = 0.3;
    this.spin = { xy: 1, xw: 1, yw: 1, zw: 1, xz: 1 };
    this.bass = 0;
    this.kick = 0;
    this.flash = { l: 0, r: 0, t: 0, b: 0 };
    this.sparks = [];
    this.lastBurst = 0;
    this.points = new Float32Array(64);
    this.ox = new Float32Array(16);
    this.oy = new Float32Array(16);
    this.oz = new Float32Array(16);
    this.ow = new Float32Array(16);
    this.px = new Float32Array(16);
    this.py = new Float32Array(16);
    this.edgeIdx = [];
    this.faceIdx = [];
    this.edgeZ = new Float32Array(EDGES.length);
    this.faceZ = new Float32Array(FACES.length);
    var n;
    for (n = 0; n < EDGES.length; n++) this.edgeIdx.push(n);
    for (n = 0; n < FACES.length; n++) this.faceIdx.push(n);
    this.transparent = false;
    this.themeStamp = "";
  }

  Scene.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = this.canvas.clientWidth;
    var h = this.canvas.clientHeight;
    if (w < 2 || h < 2) return;
    if (w * h * dpr * dpr > 3500000) dpr = Math.max(0.45, Math.sqrt(3500000 / (w * h)));
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    var bw = Math.floor(w * dpr);
    var bh = Math.floor(h * dpr);
    if (this.canvas.width !== bw || this.canvas.height !== bh) {
      this.canvas.width = bw;
      this.canvas.height = bh;
    }
    if (this.placed) {
      this.x = clamp(this.x, 8, w - 8);
      this.y = clamp(this.y, 8, h - 8);
    }
  };

  Scene.prototype.ensurePlaced = function () {
    if (this.placed || this.w < 2) return;
    this.x = this.w * 0.32;
    this.y = this.h * 0.42;
    this.heading = 0.55;
    this.placed = true;
  };

  Scene.prototype.rot = function (a, b, ang) {
    var p = this.points;
    var c = Math.cos(ang);
    var s = Math.sin(ang);
    var i, o, va, vb;
    for (i = 0; i < 16; i++) {
      o = i * 4;
      va = p[o + a];
      vb = p[o + b];
      p[o + a] = va * c - vb * s;
      p[o + b] = va * s + vb * c;
    }
  };

  Scene.prototype.orient = function () {
    var p = this.points;
    var i, o;
    for (i = 0; i < 16; i++) {
      o = i * 4;
      p[o] = i & 1 ? 1 : -1;
      p[o + 1] = i & 2 ? 1 : -1;
      p[o + 2] = i & 4 ? 1 : -1;
      p[o + 3] = i & 8 ? 1 : -1;
    }
    this.rot(0, 1, this.xy);
    this.rot(0, 3, this.xw);
    this.rot(1, 3, this.yw);
    this.rot(2, 3, this.zw);
    this.rot(0, 2, this.xz);
  };

  Scene.prototype.project = function (yaw, pitch) {
    var wCam = 3.6;
    var zCam = 4.4;
    var cy = Math.cos(yaw);
    var sy = Math.sin(yaw);
    var cp = Math.cos(pitch);
    var sp = Math.sin(pitch);
    var maxR = 0.0001;
    var i, o, w, sw, x, y, z, x1, z1, y1, sz, sx, sy2, r;
    for (i = 0; i < 16; i++) {
      o = i * 4;
      w = this.points[o + 3];
      sw = 1 / (wCam - w);
      x = this.points[o] * sw;
      y = this.points[o + 1] * sw;
      z = this.points[o + 2] * sw;
      x1 = x * cy + z * sy;
      z1 = -x * sy + z * cy;
      y1 = y * cp - z1 * sp;
      z1 = y * sp + z1 * cp;
      sz = 1 / (zCam - z1);
      sx = x1 * sz;
      sy2 = y1 * sz;
      this.ox[i] = sx;
      this.oy[i] = sy2;
      this.oz[i] = z1;
      this.ow[i] = w;
      r = Math.hypot(sx, sy2);
      if (r > maxR) maxR = r;
    }
    return maxR;
  };

  Scene.prototype.burst = function (x, y, nx, ny) {
    if (this.time - this.lastBurst < 0.08) return;
    this.lastBurst = this.time;
    var i, spread, speed;
    for (i = 0; i < 7; i++) {
      spread = (Math.random() - 0.5) * 260;
      speed = 90 + Math.random() * 240;
      this.sparks.push({
        x: x,
        y: y,
        vx: nx * speed - ny * spread,
        vy: ny * speed + nx * spread,
        life: 1,
      });
    }
    if (this.sparks.length > 80) this.sparks.splice(0, this.sparks.length - 80);
  };

  Scene.prototype.hit = function (side, x, y, nx, ny, allowFx) {
    this.flash[side] = 1;
    if (allowFx) this.burst(x, y, nx, ny);
  };

  Scene.prototype.bounceWalls = function (r, fx) {
    var hit = false;
    if (this.x < r) {
      this.x = r;
      this.vx = Math.abs(this.vx);
      this.hit("l", 2, this.y, 1, 0, fx);
      hit = true;
    } else if (this.x > this.w - r) {
      this.x = this.w - r;
      this.vx = -Math.abs(this.vx);
      this.hit("r", this.w - 2, this.y, -1, 0, fx);
      hit = true;
    }
    if (this.y < r) {
      this.y = r;
      this.vy = Math.abs(this.vy);
      this.hit("t", this.x, 2, 0, 1, fx);
      hit = true;
    } else if (this.y > this.h - r) {
      this.y = this.h - r;
      this.vy = -Math.abs(this.vy);
      this.hit("b", this.x, this.h - 2, 0, -1, fx);
      hit = true;
    }
    if (hit) this.heading = Math.atan2(this.vy, this.vx);
  };

  Scene.prototype.softContain = function (r) {
    var margin = r + 28;
    var outside =
      this.x < margin || this.x > this.w - margin || this.y < margin || this.y > this.h - margin;
    if (!outside) return;
    var desired = Math.atan2(this.h / 2 - this.y, this.w / 2 - this.x);
    this.heading = desired;
    this.x = clamp(this.x, r, this.w - r);
    this.y = clamp(this.y, r, this.h - r);
  };

  Scene.prototype.stepPhysics = function (dt, bands, view, pointer) {
    var minDim = Math.min(this.w, this.h);
    var speed = clamp(view.speed, 0.25, 3);
    var motion = view.reduce ? 0.4 : 1;
    this.bass += (bands.bass - this.bass) * (1 - Math.exp(-7 * dt));
    this.kick += bands.transient * 0.14;
    this.kick *= Math.exp(-4 * dt);
    var target =
      minDim * clamp(view.radius, 0.08, 0.4) * (1 + this.bass * 0.22) * (1 + Math.min(0.35, this.kick));
    this.radius = Math.min(target, minDim * 0.42);
    var spin = this.spin;
    this.xy += dt * motion * speed * (0.18 + bands.mid * 0.9) * spin.xy;
    this.xw += dt * motion * speed * (0.34 + bands.energy * 1.15) * spin.xw;
    this.yw += dt * motion * speed * (0.26 + bands.high * 0.75) * spin.yw;
    this.zw += dt * motion * speed * (0.15 + bands.bass * 0.85) * spin.zw;
    this.xz += dt * motion * speed * 0.08 * spin.xz;
    if (pointer.active && view.follow) {
      this.xw += (pointer.x / this.w - 0.5) * dt * 0.7;
      this.yw += (pointer.y / this.h - 0.5) * dt * 0.7;
    }
    var cruise = minDim * (0.36 + bands.energy * 0.3) * speed * motion;
    var roll = ((pointer.active && view.follow ? 0.5 : 0.34) + bands.energy * 0.5) * motion * speed;
    if (pointer.active && view.follow) {
      var dx = pointer.x - this.x;
      var dy = pointer.y - this.y;
      var dist = Math.hypot(dx, dy) || 1;
      if (dist > 72) {
        var desired = Math.atan2(dy, dx);
        var diff = desired - this.heading;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        var urgency = Math.min(1, dist / (minDim * 0.5));
        var maxTurn = (0.95 + urgency * 3.3) * dt * speed;
        this.heading += clamp(diff, -maxTurn, maxTurn);
      }
    }
    this.heading += roll * dt;
    this.vx = Math.cos(this.heading) * cruise;
    this.vy = Math.sin(this.heading) * cruise;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (view.bounce) this.bounceWalls(this.radius, !view.reduce);
    else this.softContain(this.radius);
    var decay = Math.exp(-3.4 * dt);
    this.flash.l *= decay;
    this.flash.r *= decay;
    this.flash.t *= decay;
    this.flash.b *= decay;
    var sparks = this.sparks;
    var w = 0;
    var s;
    for (var i = 0; i < sparks.length; i++) {
      s = sparks[i];
      s.life -= dt * 1.7;
      if (s.life <= 0) continue;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      sparks[w++] = s;
    }
    sparks.length = w;
  };

  Scene.prototype.drawHyper = function (ctx, bands, theme) {
    this.orient();
    var yaw = clamp(this.vx / 900, -0.4, 0.4);
    var pitch = clamp(this.vy / 900, -0.4, 0.4);
    var unit = this.project(yaw, pitch);
    var k = this.radius / unit;
    var i;
    for (i = 0; i < 16; i++) {
      this.px[i] = this.x + this.ox[i] * k;
      this.py[i] = this.y + this.oy[i] * k;
    }
    var glowR = this.radius * 1.7;
    var g = ctx.createRadialGradient(this.x, this.y, this.radius * 0.15, this.x, this.y, glowR);
    g.addColorStop(0, rgba(theme.edgeRgb, 0.1 + bands.energy * 0.16));
    g.addColorStop(1, rgba(theme.edgeRgb, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
    ctx.fill();

    var fi, face, fz, zMin = Infinity, zMax = -Infinity;
    for (fi = 0; fi < FACES.length; fi++) {
      face = FACES[fi];
      fz = (this.oz[face[0]] + this.oz[face[1]] + this.oz[face[2]] + this.oz[face[3]]) / 4;
      this.faceZ[fi] = fz;
      if (fz < zMin) zMin = fz;
      if (fz > zMax) zMax = fz;
    }
    var span = zMax - zMin || 1;
    this.faceIdx.sort(function (a, b) { return this.faceZ[a] - this.faceZ[b]; }.bind(this));
    for (fi = 0; fi < this.faceIdx.length; fi++) {
      var idx = this.faceIdx[fi];
      face = FACES[idx];
      var depth = (this.faceZ[idx] - zMin) / span;
      var alpha = 0.035 + depth * 0.09 + bands.energy * 0.04;
      ctx.beginPath();
      ctx.moveTo(this.px[face[0]], this.py[face[0]]);
      ctx.lineTo(this.px[face[1]], this.py[face[1]]);
      ctx.lineTo(this.px[face[2]], this.py[face[2]]);
      ctx.lineTo(this.px[face[3]], this.py[face[3]]);
      ctx.closePath();
      ctx.fillStyle = rgba(mix(theme.coreRgb, theme.edgeRgb, depth), alpha);
      ctx.fill();
    }

    var ei;
    for (ei = 0; ei < EDGES.length; ei++) {
      var e = EDGES[ei];
      this.edgeZ[ei] = (this.oz[e[0]] + this.oz[e[1]]) / 2;
    }
    this.edgeIdx.sort(function (a, b) { return this.edgeZ[a] - this.edgeZ[b]; }.bind(this));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (var pass = 0; pass < 2; pass++) {
      for (ei = 0; ei < this.edgeIdx.length; ei++) {
        var id = this.edgeIdx[ei];
        e = EDGES[id];
        var level = bands.bins.length ? bands.bins[id % bands.bins.length] : 0;
        if (e[2] === 3) level = Math.min(1, level + 0.28);
        var depthE = (this.edgeZ[id] - zMin) / span;
        var wMix = clamp((this.ow[e[0]] + this.ow[e[1]]) / 2 + 1.4, 0, 1) / 2.4;
        var color = mix(theme.coreRgb, theme.edgeRgb, e[2] === 3 ? 0.85 : 0.2 + wMix);
        color = mix(color, theme.hotRgb, level * 0.7);
        var alphaE = (0.45 + depthE * 0.55) * (0.55 + level * 0.45);
        ctx.beginPath();
        ctx.moveTo(this.px[e[0]], this.py[e[0]]);
        ctx.lineTo(this.px[e[1]], this.py[e[1]]);
        if (pass === 0) {
          ctx.strokeStyle = rgba(color, alphaE * 0.16);
          ctx.lineWidth = 6 + level * 7;
        } else {
          ctx.strokeStyle = rgba(color, alphaE);
          ctx.lineWidth = 1.15 + level * 1.8;
        }
        ctx.stroke();
      }
    }
    for (i = 0; i < 16; i++) {
      var lv = bands.bins.length ? bands.bins[(i * 3) % bands.bins.length] : 0;
      ctx.beginPath();
      ctx.arc(this.px[i], this.py[i], 1.4 + lv * 3.2, 0, Math.PI * 2);
      ctx.fillStyle = rgba(mix(theme.coreRgb, theme.hotRgb, lv), 0.75 + lv * 0.25);
      ctx.fill();
    }
  };

  Scene.prototype.drawBars = function (ctx, bands, theme) {
    var count = this.w < 560 ? 32 : 48;
    var gap = 4;
    var pad = 20;
    var usable = this.w - pad * 2;
    var bw = Math.max(2, (usable - gap * (count - 1)) / count);
    var base = this.h * 0.78;
    var maxH = this.h * 0.58;
    var i, idx, v, bh, x, y;
    ctx.fillStyle = rgba(theme.edgeRgb, 0.35);
    ctx.fillRect(pad, base, this.w - pad * 2, 1);
    for (i = 0; i < count; i++) {
      idx = Math.floor((i / count) * bands.bins.length);
      v = bands.bins[idx] || 0;
      if (bands.energy < 0.05) v = Math.max(v, 0.06 + 0.05 * Math.sin(this.time * 1.7 + i * 0.45));
      bh = Math.max(2, v * maxH);
      x = pad + i * (bw + gap);
      y = base - bh;
      var grad = ctx.createLinearGradient(0, y, 0, base);
      grad.addColorStop(0, rgba(theme.hotRgb, 0.95));
      grad.addColorStop(1, rgba(theme.edgeRgb, 0.9));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, bw, bh, Math.min(6, bw / 2));
      ctx.fill();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = rgba(theme.edgeRgb, 0.9);
      ctx.beginPath();
      ctx.roundRect(x, base + 2, bw, bh * 0.38, Math.min(6, bw / 2));
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  };

  Scene.prototype.drawRing = function (ctx, bands, theme) {
    var cx = this.w / 2;
    var cy = this.h / 2;
    var count = this.w < 560 ? 48 : 72;
    var inner = Math.min(this.w, this.h) * (0.16 + this.bass * 0.05);
    var reach = Math.min(this.w, this.h) * 0.3;
    var spin = this.time * (0.12 + bands.energy * 0.35);
    var i, a, v, len, c, s;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(spin);
    ctx.lineCap = "round";
    for (i = 0; i < count; i++) {
      a = (i / count) * Math.PI * 2;
      v = bands.bins[Math.floor((i / count) * bands.bins.length)] || 0;
      if (bands.energy < 0.05) v = Math.max(v, 0.08 + 0.07 * Math.sin(this.time * 1.5 + i * 0.4));
      len = 10 + v * reach;
      c = Math.cos(a);
      s = Math.sin(a);
      ctx.beginPath();
      ctx.moveTo(c * inner, s * inner);
      ctx.lineTo(c * (inner + len), s * (inner + len));
      ctx.strokeStyle = rgba(mix(theme.edgeRgb, theme.hotRgb, v), 0.45 + v * 0.55);
      ctx.lineWidth = 2 + v * 3;
      ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, inner * 0.72, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(theme.coreRgb, 0.45 + bands.bass * 0.4);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  Scene.prototype.drawWalls = function (ctx, theme) {
    var f = this.flash;
    var span = 72;
    if (f.l > 0.03) {
      var gl = ctx.createLinearGradient(0, 0, span, 0);
      gl.addColorStop(0, rgba(theme.edgeRgb, f.l * 0.4));
      gl.addColorStop(1, rgba(theme.edgeRgb, 0));
      ctx.fillStyle = gl;
      ctx.fillRect(0, 0, span, this.h);
    }
    if (f.r > 0.03) {
      var gr = ctx.createLinearGradient(this.w, 0, this.w - span, 0);
      gr.addColorStop(0, rgba(theme.edgeRgb, f.r * 0.4));
      gr.addColorStop(1, rgba(theme.edgeRgb, 0));
      ctx.fillStyle = gr;
      ctx.fillRect(this.w - span, 0, span, this.h);
    }
    if (f.t > 0.03) {
      var gt = ctx.createLinearGradient(0, 0, 0, span);
      gt.addColorStop(0, rgba(theme.edgeRgb, f.t * 0.4));
      gt.addColorStop(1, rgba(theme.edgeRgb, 0));
      ctx.fillStyle = gt;
      ctx.fillRect(0, 0, this.w, span);
    }
    if (f.b > 0.03) {
      var gb = ctx.createLinearGradient(0, this.h, 0, this.h - span);
      gb.addColorStop(0, rgba(theme.edgeRgb, f.b * 0.4));
      gb.addColorStop(1, rgba(theme.edgeRgb, 0));
      ctx.fillStyle = gb;
      ctx.fillRect(0, this.h - span, this.w, span);
    }
  };

  Scene.prototype.drawSparks = function (ctx, theme) {
    var i, s;
    ctx.lineCap = "round";
    ctx.lineWidth = 1.5;
    for (i = 0; i < this.sparks.length; i++) {
      s = this.sparks[i];
      ctx.strokeStyle = rgba(theme.hotRgb, s.life * 0.75);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 0.035, s.y - s.vy * 0.035);
      ctx.stroke();
    }
  };

  Scene.prototype.frame = function (dt, bands, view, pointer) {
    this.transparent = view.transparent;
    this.resize();
    if (this.w < 2 || this.h < 2 || !this.ctx) return;
    this.ensurePlaced();
    this.time += dt;
    this.stepPhysics(dt, bands, view, pointer);
    var ctx = this.ctx;
    var theme = view.theme;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    var stamp = theme.bg + (view.transparent ? ":t" : "");
    var fade = view.reduce ? 0.5 : 0.24;
    if (this.themeStamp !== stamp) {
      if (view.transparent) ctx.clearRect(0, 0, this.w, this.h);
      else {
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, this.w, this.h);
      }
      this.themeStamp = stamp;
    }
    if (view.transparent) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0," + fade + ")";
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.globalCompositeOperation = "source-over";
    } else {
      ctx.fillStyle = rgba(theme.bgRgb, fade);
      ctx.fillRect(0, 0, this.w, this.h);
    }
    if (view.mode === "bars") this.drawBars(ctx, bands, theme);
    else if (view.mode === "ring") this.drawRing(ctx, bands, theme);
    else {
      this.drawWalls(ctx, theme);
      this.drawHyper(ctx, bands, theme);
      this.drawSparks(ctx, theme);
    }
  };

  function AudioRig(audio) {
    this.audio = audio;
    this.ctx = null;
    this.analyser = null;
    this.freq = null;
    this.fileGain = null;
    this.silent = null;
    this.micNode = null;
    this.micStream = null;
    this.elementNode = null;
    this.objectUrl = null;
    this.mode = "none";
    this.bins = new Float32Array(64);
    this.prevEnergy = 0;
    this.bands = { bass: 0, mid: 0, high: 0, energy: 0, transient: 0, bins: this.bins };
    this.expecting = false;
  }

  AudioRig.prototype.ensure = function () {
    if (this.ctx) return;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new Ctx();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.82;
    this.freq = new Uint8Array(this.analyser.frequencyBinCount);
    this.fileGain = this.ctx.createGain();
    this.silent = this.ctx.createGain();
    this.silent.gain.value = 0;
    this.fileGain.connect(this.analyser);
    this.fileGain.connect(this.ctx.destination);
    this.analyser.connect(this.silent);
    this.silent.connect(this.ctx.destination);
  };

  AudioRig.prototype.resume = function () {
    this.ensure();
    if (this.ctx.state !== "running") return this.ctx.resume();
    return Promise.resolve();
  };

  AudioRig.prototype.ensureElement = function () {
    this.ensure();
    if (this.elementNode) return;
    this.elementNode = this.ctx.createMediaElementSource(this.audio);
    this.elementNode.connect(this.fileGain);
  };

  AudioRig.prototype.releaseMic = function () {
    if (this.micNode) this.micNode.disconnect();
    this.micNode = null;
    if (this.micStream) this.micStream.getTracks().forEach(function (t) { t.stop(); });
    this.micStream = null;
    if (this.mode === "mic") this.mode = this.audio.getAttribute("src") ? "file" : "none";
  };

  AudioRig.prototype.sample = function (sensitivity) {
    var bins = this.bins;
    var bands = this.bands;
    var page = document.querySelector("audio");
    var pageAnalyser = page && page._nerbousAnalyser;
    var pageLive = !!(pageAnalyser && !page.paused && !page.ended);
    var active = pageLive || (this.analyser && (this.mode === "mic" || (this.mode !== "none" && !this.audio.paused)));
    var i, start, end, k, sum, raw, shaped, freq;
    freq = null;
    if (pageLive) {
      if (!this.pageFreq || this.pageFreq.length !== pageAnalyser.frequencyBinCount) {
        this.pageFreq = new Uint8Array(pageAnalyser.frequencyBinCount);
      }
      pageAnalyser.getByteFrequencyData(this.pageFreq);
      freq = this.pageFreq;
    } else if (active && this.ctx && this.ctx.state === "running" && this.freq) {
      this.analyser.getByteFrequencyData(this.freq);
      freq = this.freq;
    }
    if (freq) {
      var len = freq.length;
      var n = bins.length;
      var sens = clamp(sensitivity, 0.2, 3);
      for (i = 0; i < n; i++) {
        start = Math.floor(Math.pow(i / n, 1.7) * (len - 1));
        end = Math.max(start + 1, Math.floor(Math.pow((i + 1) / n, 1.7) * (len - 1)));
        sum = 0;
        for (k = start; k < end; k++) sum += freq[k] || 0;
        raw = sum / ((end - start) * 255);
        if (raw < 0.035) raw = 0;
        shaped = Math.min(1, Math.pow(raw, 0.78) * sens);
        bins[i] += (shaped - bins[i]) * 0.34;
      }
    } else {
      for (i = 0; i < bins.length; i++) bins[i] *= 0.9;
    }
    function avg(a, b) {
      var s = 0;
      var e = Math.min(bins.length, b);
      var j;
      for (j = a; j < e; j++) s += bins[j];
      return s / Math.max(1, e - a);
    }
    bands.bass = avg(0, 5);
    bands.mid = avg(8, 24);
    bands.high = avg(40, 64);
    bands.energy = avg(0, 64);
    var jump = bands.energy - this.prevEnergy;
    this.prevEnergy = bands.energy;
    bands.transient = clamp(jump * 5.5, 0, 1);
    return bands;
  };

  function micMessage(err) {
    var name = err && err.name;
    if (name === "NotAllowedError" || name === "SecurityError") {
      return "Microphone blocked. Allow access, or drop in a track.";
    }
    if (name === "NotFoundError") return "No microphone found. Drop in a track instead.";
    return "Couldn’t open the microphone. Drop in a track instead.";
  }

  function safeUrl(value) {
    try {
      var url = new URL(value, window.location.href);
      if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
    } catch (e) {
      return "";
    }
    return "";
  }

  function isAudioFile(file) {
    if (!file) return false;
    if (file.type.indexOf("audio/") === 0) return true;
    return /\.(mp3|wav|ogg|m4a|aac|flac|webm|mp4|mpeg)$/i.test(file.name || "");
  }

  function fileLabel(url) {
    try {
      var u = new URL(url);
      var part = u.pathname.split("/").filter(Boolean).pop() || u.hostname;
      return decodeURIComponent(part);
    } catch (e) {
      return "Track";
    }
  }

  function scriptOrigin() {
    try {
      if (SCRIPT_SRC) return new URL(SCRIPT_SRC).origin;
    } catch (e) {}
    return window.location.origin;
  }

  function scriptUrl() {
    return SCRIPT_SRC || scriptOrigin() + "/tesser.js";
  }

  var ACCENT_VARS = ["--accent", "--color-accent", "--brand", "--primary", "--color-primary"];

  function readAccent(el) {
    if (!el) return null;
    var cs = getComputedStyle(el);
    for (var i = 0; i < ACCENT_VARS.length; i++) {
      var raw = cs.getPropertyValue(ACCENT_VARS[i]).trim();
      if (!raw) continue;
      var parsed = parseCssColor(raw);
      if (parsed && parsed.a > 0) return parsed.hex;
    }
    return null;
  }

  function paintedBackground(start) {
    var el = start;
    var i, parsed;
    for (i = 0; i < 6 && el; i++) {
      parsed = parseCssColor(getComputedStyle(el).backgroundColor);
      if (parsed && parsed.a > 0.55) return parsed.hex;
      el = el.parentElement;
    }
    return null;
  }

  function adaptFromHost(host) {
    var bg = paintedBackground(host.parentElement || host) || paintedBackground(document.body);
    var accent =
      readAccent(host) || readAccent(host.parentElement) || readAccent(document.documentElement);
    var parent = host.parentElement || document.body;
    var fg = parent ? parseCssColor(getComputedStyle(parent).color) : null;
    if (!bg && !accent) return null;
    var background = bg || "#07080b";
    var edge = accent;
    if (!edge && fg && fg.a > 0.4) {
      var bgLum = luminance(rgbOf(background));
      if (Math.abs(luminance(fg.rgb) - bgLum) > 0.25) edge = fg.hex;
    }
    if (!edge) edge = luminance(rgbOf(background)) > 0.62 ? "#1f6feb" : "#6eb6ff";
    return themeFromEdge(edge, background);
  }

  var CSS = [
    ":host{display:block;height:100%;color:#f3f4f6;font-family:inherit;line-height:1.4;}",
    ":host(:fullscreen){width:100%;height:100%;}",
    ".stage{position:absolute;inset:0;overflow:hidden;container-type:inline-size;pointer-events:none;",
    "--fg:#f3f4f6;--muted:#a3aab4;--bg:#07080b;--dock:rgb(20 22 28 / 90%);",
    "--line:rgb(243 244 246 / 14%);--line-strong:rgb(243 244 246 / 24%);--accent:#6eb6ff;",
    "color:var(--fg);user-select:none;touch-action:none;}",
    ".stage[data-light='true']{--fg:#16181d;--muted:#525866;--dock:rgb(255 255 255 / 92%);",
    "--line:rgb(20 22 28 / 14%);--line-strong:rgb(20 22 28 / 28%);}",
    ".stage *{box-sizing:border-box;}",
    "canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;}",
    ".chrome{position:absolute;inset:0;pointer-events:none;transition:opacity 250ms cubic-bezier(.22,1,.36,1),transform 250ms cubic-bezier(.22,1,.36,1);}",
    ".chrome[data-hidden='true']{opacity:0;transform:translateY(8px);}",
    ".chrome[data-hidden='true'] .bottom,.chrome[data-hidden='true'] .top{pointer-events:none;}",
    ".top,.bottom{pointer-events:auto;}",
    ".top{position:fixed;top:0;left:0;padding:max(16px,env(safe-area-inset-top)) 16px 16px max(16px,env(safe-area-inset-left));z-index:2;}",
    ".word{font-weight:600;letter-spacing:-.03em;font-size:1.5rem;line-height:1.1;text-shadow:0 1px 16px rgb(0 0 0 / 45%);}",
    ".sub,.detail,.keys,.note{color:var(--muted);font-size:.875rem;text-shadow:0 1px 16px rgb(0 0 0 / 45%);}",
    ".detail{margin:.25rem 0 0;max-width:18rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
    ".bottom{position:fixed;left:0;right:0;bottom:128px;display:flex;flex-direction:column;align-items:center;gap:8px;z-index:2;",
    "padding:16px;padding-bottom:max(16px,env(safe-area-inset-bottom));}",
    ".rot{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;width:min(920px,100%);background:var(--dock);border:1px solid var(--line);border-radius:20px;padding:8px 12px;}",
    ".rot label{display:flex;align-items:center;gap:6px;min-width:7.2rem;flex:1;color:var(--muted);font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;}",
    ".rot input{flex:1;min-width:4.5rem;}",
    ".dock,.urlrow{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;}",
    ".urlrow input{flex:1;min-width:0;height:44px;border:0;border-radius:12px;background:transparent;color:var(--fg);font:inherit;padding:0 12px;}",
    ".urlrow input:focus{outline:none;}",
    ".icon-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;min-width:44px;padding:0 10px;",
    "border:0;border-radius:12px;background:transparent;color:var(--fg);font:inherit;font-size:.875rem;font-weight:500;",
    "cursor:pointer;transition:background-color 150ms cubic-bezier(.22,1,.36,1),transform 150ms cubic-bezier(.22,1,.36,1);}",
    ".icon-btn:hover{background:color-mix(in srgb,var(--fg) 8%,transparent);}",
    ".icon-btn:active{transform:scale(.98);}",
    ".icon-btn[data-on='true']{background:var(--fg);color:var(--bg);}",
    ".icon-btn[data-on='true']:hover{background:var(--fg);}",
    ".icon-btn:disabled{opacity:.38;cursor:default;}",
    ".icon-btn:disabled:active{transform:none;}",
    ".icon-btn svg{width:18px;height:18px;display:block;}",
    ".swatch{width:14px;height:14px;border-radius:999px;display:block;}",
    ".gain{display:flex;align-items:center;gap:8px;height:44px;min-width:9rem;flex:1;padding:0 8px;color:var(--muted);font-size:.875rem;}",
    "input[type='range']{appearance:none;height:44px;margin:0;background:transparent;cursor:pointer;width:100%;}",
    "input[type='range']:focus{outline:none;}",
    "input[type='range']:focus-visible,.icon-btn:focus-visible,input[type='url']:focus-visible{outline:2px solid var(--fg);outline-offset:2px;}",
    "input[type='range']::-webkit-slider-runnable-track{height:2px;border-radius:999px;background:var(--line-strong);}",
    "input[type='range']::-webkit-slider-thumb{appearance:none;width:16px;height:16px;margin-top:-7px;border:0;border-radius:999px;background:var(--fg);}",
    "input[type='range']::-moz-range-track{height:2px;border:0;border-radius:999px;background:var(--line-strong);}",
    "input[type='range']::-moz-range-thumb{width:16px;height:16px;border:0;border-radius:999px;background:var(--fg);}",
    "input[type='color']{width:22px;height:22px;padding:0;border:0;background:transparent;cursor:pointer;}",
    "input[type='color']::-webkit-color-swatch-wrapper{padding:0;}",
    "input[type='color']::-webkit-color-swatch{border:0;border-radius:999px;}",
    ".error{margin:0;width:min(920px,100%);color:var(--fg);font-size:.875rem;text-align:center;}",
    ".panel{display:flex;flex-direction:column;gap:8px;max-height:46vh;overflow:auto;pointer-events:auto;touch-action:auto;}",
    ".panel p{margin:0;}",
    ".panel textarea{width:100%;min-height:4.5rem;resize:vertical;border:1px solid var(--line);border-radius:12px;background:transparent;color:var(--fg);font:inherit;font-size:.8125rem;padding:8px;}",
    ".row{display:flex;align-items:center;justify-content:space-between;gap:8px;}",
    ".keys{margin:0;}",
    ".meter{position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--accent);transform-origin:left center;pointer-events:none;}",
    ".sink{position:absolute;width:0;height:0;opacity:0;pointer-events:none;}",
    ".stage[data-drag='true']{box-shadow:inset 0 0 0 1px var(--fg);}",
    "[hidden]{display:none !important;}",
    "@container (max-width:720px){.label,.keys,.gain span{display:none;}}",
    "@media (prefers-reduced-motion:reduce){.chrome,.icon-btn{transition:none;}.chrome[data-hidden='true']{transform:none;}.icon-btn:active{transform:none;}}",
  ].join("");

  function svg(paths) {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      paths +
      "</svg>"
    );
  }

  var ICONS = {
    hyper: svg('<rect x="4" y="7" width="10" height="10"/><rect x="10" y="4" width="10" height="10"/><path d="M4 7 10 4M14 7 20 4M4 17 10 14M14 17 20 14"/>'),
    bars: svg('<path d="M5 19V10M12 19V5M19 19v-7"/>'),
    ring: svg('<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/>'),
    mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
    upload: svg('<path d="M12 16V5M8 8l4-4 4 4M5 19h14"/>'),
    play: svg('<path d="M8 5.5v13l11-6.5-11-6.5Z"/>'),
    pause: svg('<path d="M8 5v14M16 5v14"/>'),
    link: svg('<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/>'),
    full: svg('<path d="M8 4H4v4M16 4h4v4M4 16v4h4M20 16v4h-4"/>'),
    exit: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
    code: svg('<path d="M9 7 4 12l5 5M15 7l5 5-5 5"/>'),
  };

  function mount(target, options) {
    var host = typeof target === "string" ? document.querySelector(target) : target;
    if (!host) throw new Error("Tesser.mount: element not found");
    if (host.__tesser && host.__tesser.destroy) host.__tesser.destroy();
    options = options || {};
    var explicitTheme = options.theme !== undefined && options.theme !== null && options.theme !== "";
    var theme;
    if (explicitTheme && typeof options.theme === "object") {
      var input = options.theme;
      theme = themeFromEdge(input.edge || input.color || "#6eb6ff", input.bg || input.background || "#07080b");
      if (input.core && hexOf(input.core)) theme.core = hexOf(input.core);
      if (input.hot && hexOf(input.hot)) theme.hot = hexOf(input.hot);
      theme.coreRgb = rgbOf(theme.core);
      theme.hotRgb = rgbOf(theme.hot);
      theme.name = input.name || "Custom";
    } else if (explicitTheme) {
      theme = themeById(options.theme) || THEMES[0];
    } else if (options.adapt !== false) {
      theme = adaptFromHost(host) || THEMES[0];
    } else {
      theme = THEMES[0];
    }
    if (options.background) theme = withBackground(theme, options.background);
    if (options.color) theme = themeFromEdge(options.color, theme.bg);

    var view = {
      mode: options.mode === "bars" || options.mode === "ring" ? options.mode : "hyper",
      theme: theme,
      sensitivity: clamp(Number(options.sensitivity) || 1.15, 0.2, 3),
      follow: options.follow !== false,
      bounce: options.bounce !== false,
      speed: clamp(Number(options.speed) || 1, 0.25, 3),
      radius: clamp(Number(options.radius) || 0.19, 0.08, 0.4),
      transparent: options.transparent === true,
      reduce: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      controls: options.controls !== false,
      title: options.title !== false && options.title !== undefined ? options.title !== false : options.embed ? false : options.title !== false,
    };
    if (options.title === undefined) view.title = !options.embed;
    else view.title = options.title !== false;
    var showPanel = options.embedPanel !== undefined ? options.embedPanel !== false : !options.embed && view.title;
    var paintPage = options.paintPage === true;
    var exclusiveKeys = options.exclusiveKeys === true;
    var listen = options.listen !== false;

    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    if (host.clientHeight < 40) host.style.minHeight = paintPage ? "100dvh" : "480px";

    var shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
    shadow.innerHTML = "";
    var style = document.createElement("style");
    style.textContent = CSS;
    var stage = document.createElement("div");
    stage.className = "stage";
    var themeButtons = THEMES.map(function (item) {
      return (
        '<button type="button" class="icon-btn" data-theme="' +
        item.id +
        '" role="radio" aria-label="' +
        item.name +
        '"><span class="swatch" style="background:' +
        item.edge +
        '"></span></button>'
      );
    }).join("");
    stage.innerHTML =
      '<canvas aria-hidden="true"></canvas>' +
      '<audio class="sink" playsinline preload="auto"></audio>' +
      '<div class="chrome" data-hidden="false">' +
      '<div class="top"><div class="word">Tesser</div><div class="sub">Hypercube</div><p class="detail"></p></div>' +
      '<div class="bottom">' +
      '<p class="error" role="status" hidden></p>' +
      '<form class="urlrow" hidden novalidate><input type="url" placeholder="https://…/track.mp3" aria-label="Audio URL from another site" /><button type="submit" class="icon-btn">Load</button></form>' +
      '<div class="panel" hidden><div class="row"><p>Use on another site</p></div>' +
      '<p class="note">The same file adapts to a host page: pass theme, color, background, mode, follow, or bounce. A link only visualizes if that site sends CORS; an upload always works.</p>' +
      '<div class="row"><p>iframe</p><button type="button" class="icon-btn" data-copy="iframe">Copy</button></div><textarea readonly data-snippet="iframe"></textarea>' +
      '<div class="row"><p>script</p><button type="button" class="icon-btn" data-copy="script">Copy</button></div><textarea readonly data-snippet="script"></textarea></div>' +
      '<div class="dock">' +
      '<button type="button" class="icon-btn" data-act="mic" aria-label="Use microphone" aria-pressed="false">' + ICONS.mic + "</button>" +
      '<button type="button" class="icon-btn" data-act="link" aria-label="Play a file from another site" aria-expanded="false">' + ICONS.link + "</button>" +
      '<label class="icon-btn" aria-label="Upload track">' + ICONS.upload + '<input class="sink" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.webm" /></label>' +
      '<button type="button" class="icon-btn" data-act="play" aria-label="Play" disabled><span data-icon="play">' + ICONS.play + '</span><span data-icon="pause" hidden>' + ICONS.pause + "</span></button>" +
      '<div role="radiogroup" aria-label="Visualization" style="display:flex;gap:8px">' +
      '<button type="button" class="icon-btn" data-mode="hyper" role="radio" aria-label="Hypercube">' + ICONS.hyper + '<span class="label">Hypercube</span></button>' +
      '<button type="button" class="icon-btn" data-mode="bars" role="radio" aria-label="Bars">' + ICONS.bars + '<span class="label">Bars</span></button>' +
      '<button type="button" class="icon-btn" data-mode="ring" role="radio" aria-label="Ring">' + ICONS.ring + '<span class="label">Ring</span></button>' +
      "</div>" +
      '<label class="gain"><span>Sensitivity</span><input type="range" min="0.4" max="2.6" step="0.05" aria-label="Sensitivity" /></label>' +
      '<div role="radiogroup" aria-label="Color theme" style="display:flex;gap:4px">' + themeButtons +
      '<label class="icon-btn" aria-label="Custom color"><input type="color" aria-label="Custom color" /></label></div>' +
      (showPanel ? '<button type="button" class="icon-btn" data-act="embed" aria-label="Use on another site" aria-expanded="false">' + ICONS.code + "</button>" : "") +
      '<button type="button" class="icon-btn" data-act="full" aria-label="Enter fullscreen">' + ICONS.full + "</button>" +
      "</div>" +
      '<div class="rot" aria-label="Hypercube rotation">' +
      '<label>Yaw<input type="range" min="-2" max="2" step="0.05" value="1" data-plane="xz" aria-label="Yaw" /></label>' +
      '<label>Pitch<input type="range" min="-2" max="2" step="0.05" value="1" data-plane="yw" aria-label="Pitch" /></label>' +
      '<label>Roll<input type="range" min="-2" max="2" step="0.05" value="1" data-plane="xy" aria-label="Roll" /></label>' +
      '<label>XW<input type="range" min="-2" max="2" step="0.05" value="1" data-plane="xw" aria-label="XW rotation" /></label>' +
      '<label>ZW<input type="range" min="-2" max="2" step="0.05" value="1" data-plane="zw" aria-label="ZW rotation" /></label>' +
      '<button type="button" class="icon-btn" data-act="spinreset">Reset</button>' +
      "</div>" +
      '<p class="keys">Space plays · M mic · F fullscreen</p>' +
      "</div></div>" +
      '<div class="meter"></div>';

    shadow.append(style, stage);
    var canvas = stage.querySelector("canvas");
    var audio = stage.querySelector("audio");
    var scene = new Scene(canvas);
    var rig = new AudioRig(audio);
    var chrome = stage.querySelector(".chrome");
    var top = stage.querySelector(".top");
    var bottom = stage.querySelector(".bottom");
    var detail = stage.querySelector(".detail");
    var sub = stage.querySelector(".sub");
    var errorEl = stage.querySelector(".error");
    var urlRow = stage.querySelector(".urlrow");
    var urlInput = urlRow.querySelector("input");
    var panel = stage.querySelector(".panel");
    var meter = stage.querySelector(".meter");
    var range = stage.querySelector("input[type='range']");
    var colorInput = stage.querySelector("input[type='color']");
    var fileInput = stage.querySelector("input[type='file']");
    var playBtn = stage.querySelector("[data-act='play']");
    var micBtn = stage.querySelector("[data-act='mic']");
    var linkBtn = stage.querySelector("[data-act='link']");
    var fullBtn = stage.querySelector("[data-act='full']");
    var embedBtn = stage.querySelector("[data-act='embed']");
    var pointer = { x: 0, y: 0, active: false };
    var overDock = false;
    var hot = true;
    var hideTimer = 0;
    var dead = false;
    var raf = 0;
    var focused = false;
    var dragDepth = 0;
    var cleanups = [];
    var state = {
      source: "none",
      playing: false,
      fileName: "",
      error: "",
      urlOpen: false,
      embedOpen: false,
    };

    function on(target, type, fn, opts) {
      target.addEventListener(type, fn, opts);
      cleanups.push(function () { target.removeEventListener(type, fn, opts); });
    }

    function paintDocument() {
      if (!paintPage) return;
      var bg = view.transparent ? "transparent" : view.theme.bg;
      document.documentElement.style.background = bg;
      document.body.style.background = bg;
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta && !view.transparent) meta.setAttribute("content", view.theme.bg);
    }

    function modeName(mode) {
      if (mode === "bars") return "Bars";
      if (mode === "ring") return "Ring";
      return "Hypercube";
    }

    function detailText() {
      if (state.source === "mic") return "Microphone";
      if (state.fileName) return state.playing ? state.fileName : state.fileName + " · paused";
      if (view.mode === "hyper") return "Chases the cursor · bounces off the edges";
      if (view.mode === "bars") return "Frequency bars";
      return "Circular spectrum";
    }

    function snippet() {
      var q = new URLSearchParams();
      q.set("embed", "1");
      q.set("mode", view.mode);
      q.set("sensitivity", String(Math.round(view.sensitivity * 100) / 100));
      if (view.theme.id === "custom") {
        q.set("color", view.theme.edge.replace("#", ""));
        q.set("bg", view.theme.bg.replace("#", ""));
      } else q.set("theme", view.theme.id);
      if (!view.follow) q.set("follow", "0");
      if (!view.bounce) q.set("bounce", "0");
      if (view.speed !== 1) q.set("speed", String(view.speed));
      if (view.transparent) q.set("transparent", "1");
      var iframe =
        '<iframe src="' + scriptOrigin() + "/?" + q.toString() +
        '" title="Tesser hypercube visualizer" style="width:100%;height:480px;border:0;border-radius:12px" allow="microphone; autoplay; fullscreen"></iframe>';
      var attrs =
        ' data-mode="' + view.mode + '" data-sensitivity="' + (Math.round(view.sensitivity * 100) / 100) + '"';
      if (view.theme.id === "custom") {
        attrs += ' data-color="' + view.theme.edge + '" data-background="' + view.theme.bg + '" data-adapt="false"';
      } else attrs += ' data-theme="' + view.theme.id + '" data-adapt="false"';
      if (!view.follow) attrs += ' data-follow="false"';
      if (!view.bounce) attrs += ' data-bounce="false"';
      var script =
        '<div data-tesser' + attrs + ' style="width:100%;height:480px"></div>\n<script src="' + scriptUrl() + '"><\/script>';
      return { iframe: iframe, script: script };
    }

    function sync() {
      stage.dataset.light = view.theme.light ? "true" : "false";
      stage.style.setProperty("--accent", view.theme.edge);
      stage.style.setProperty("--bg", view.theme.bg);
      sub.textContent = modeName(view.mode);
      detail.textContent = detailText();
      errorEl.hidden = !state.error;
      errorEl.textContent = state.error;
      urlRow.hidden = !state.urlOpen;
      panel.hidden = !state.embedOpen;
      if (linkBtn) linkBtn.setAttribute("aria-expanded", state.urlOpen ? "true" : "false");
      if (embedBtn) embedBtn.setAttribute("aria-expanded", state.embedOpen ? "true" : "false");
      micBtn.dataset.on = state.source === "mic" ? "true" : "false";
      micBtn.setAttribute("aria-pressed", state.source === "mic" ? "true" : "false");
      var has = Boolean(audio.getAttribute("src"));
      playBtn.disabled = !has;
      playBtn.dataset.on = state.playing ? "true" : "false";
      playBtn.setAttribute("aria-label", state.playing ? "Pause" : "Play");
      playBtn.querySelector("[data-icon='play']").hidden = state.playing;
      playBtn.querySelector("[data-icon='pause']").hidden = !state.playing;
      stage.querySelectorAll("[data-mode]").forEach(function (btn) {
        var on = btn.getAttribute("data-mode") === view.mode;
        btn.dataset.on = on ? "true" : "false";
        btn.setAttribute("aria-checked", on ? "true" : "false");
      });
      stage.querySelectorAll("[data-theme]").forEach(function (btn) {
        var on = btn.getAttribute("data-theme") === view.theme.id;
        btn.dataset.on = on ? "true" : "false";
        btn.setAttribute("aria-checked", on ? "true" : "false");
      });
      range.value = String(view.sensitivity);
      if (document.activeElement !== colorInput) colorInput.value = view.theme.edge;
      var fs = document.fullscreenElement === host || document.webkitFullscreenElement === host;
      fullBtn.setAttribute("aria-label", fs ? "Exit fullscreen" : "Enter fullscreen");
      fullBtn.innerHTML = fs ? ICONS.exit : ICONS.full;
      top.hidden = !view.title;
      bottom.hidden = !view.controls;
      var text = snippet();
      stage.querySelector("[data-snippet='iframe']").value = text.iframe;
      stage.querySelector("[data-snippet='script']").value = text.script;
      paintDocument();
    }

    function showError(message) {
      state.error = message;
      hot = true;
      sync();
    }

    function clearError() {
      state.error = "";
    }

    function poke() {
      hot = true;
      chrome.dataset.hidden = "false";
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(function () {
        if (!overDock && !state.urlOpen && !state.embedOpen && !state.error) {
          hot = false;
          chrome.dataset.hidden = "true";
        }
      }, 2800);
    }

    function emit(event, extra) {
      var msg = { type: "tesser", event: event };
      if (extra) Object.keys(extra).forEach(function (key) { msg[key] = extra[key]; });
      try { window.parent.postMessage(msg, "*"); } catch (e) {}
    }

    function setMode(mode) {
      if (mode !== "hyper" && mode !== "bars" && mode !== "ring") return;
      view.mode = mode;
      sync();
      emit("mode", { mode: mode });
    }

    function setTheme(next) {
      if (next && typeof next === "object") {
        view.theme = themeFromEdge(next.edge || next.color || view.theme.edge, next.bg || next.background || view.theme.bg);
      } else {
        var found = themeById(next);
        if (found) view.theme = found;
      }
      scene.themeStamp = "";
      sync();
    }

    function setColor(color) {
      var hex = hexOf(color);
      if (!hex) return;
      view.theme = themeFromEdge(hex, view.theme.bg);
      scene.themeStamp = "";
      sync();
    }

    function setBackground(color) {
      view.theme = withBackground(view.theme, color);
      scene.themeStamp = "";
      sync();
    }

    async function loadUrl(url) {
      var clean = safeUrl(url);
      if (!clean) {
        showError("Use an http(s) link to an audio file.");
        return;
      }
      await rig.resume();
      rig.releaseMic();
      rig.ensureElement();
      rig.fileGain.gain.value = 1;
      rig.expecting = true;
      audio.crossOrigin = "anonymous";
      audio.src = clean;
      try {
        await audio.play();
      } catch (err) {
        showError("Couldn’t play that link. The other site has to allow cross-origin audio (CORS), or upload the file.");
        emit("error", { message: state.error });
        throw err;
      }
      state.source = "url";
      state.fileName = fileLabel(clean);
      state.playing = true;
      rig.mode = "file";
      clearError();
      sync();
      emit("play", { source: "url" });
    }

    async function loadFile(file) {
      if (!isAudioFile(file)) {
        showError("That file isn’t audio.");
        return;
      }
      await rig.resume();
      rig.releaseMic();
      rig.ensureElement();
      if (rig.objectUrl) URL.revokeObjectURL(rig.objectUrl);
      rig.objectUrl = URL.createObjectURL(file);
      rig.fileGain.gain.value = 1;
      rig.expecting = true;
      audio.crossOrigin = "anonymous";
      audio.src = rig.objectUrl;
      await audio.play();
      state.source = "file";
      state.fileName = file.name;
      state.playing = true;
      rig.mode = "file";
      clearError();
      sync();
      emit("play", { source: "file" });
    }

    async function play() {
      if (!audio.getAttribute("src")) return;
      await rig.resume();
      rig.releaseMic();
      rig.ensureElement();
      rig.fileGain.gain.value = 1;
      await audio.play();
      state.playing = true;
      state.source = state.source === "url" ? "url" : "file";
      rig.mode = "file";
      clearError();
      sync();
      emit("play", { source: state.source });
    }

    function pause() {
      audio.pause();
      state.playing = false;
      if (state.source === "mic") state.source = audio.getAttribute("src") ? "file" : "none";
      sync();
      emit("pause", {});
    }

    async function toggle() {
      if (!audio.getAttribute("src")) {
        await toggleMic();
        return;
      }
      if (state.playing) pause();
      else await play();
    }

    async function toggleMic() {
      if (rig.mode === "mic") {
        rig.releaseMic();
        state.source = audio.getAttribute("src") ? (state.playing ? "file" : "file") : "none";
        if (audio.getAttribute("src") && state.playing) {
          rig.fileGain.gain.value = 1;
          rig.mode = "file";
        }
        clearError();
        sync();
        return;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError("This browser has no microphone access.");
        return;
      }
      var wasPlaying = state.playing && Boolean(audio.getAttribute("src"));
      try {
        await rig.resume();
        audio.pause();
        state.playing = false;
        rig.releaseMic();
        var stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });
        rig.micStream = stream;
        rig.micNode = rig.ctx.createMediaStreamSource(stream);
        rig.micNode.connect(rig.analyser);
        if (rig.fileGain) rig.fileGain.gain.value = 0;
        rig.mode = "mic";
        state.source = "mic";
        clearError();
        sync();
        emit("mic", { live: true });
      } catch (err) {
        if (wasPlaying) {
          try { await play(); } catch (e) {}
        }
        showError(micMessage(err));
        emit("error", { message: state.error });
      }
    }

    function destroy() {
      if (dead) return;
      dead = true;
      window.clearTimeout(hideTimer);
      cancelAnimationFrame(raf);
      cleanups.forEach(function (fn) { fn(); });
      rig.releaseMic();
      audio.pause();
      if (rig.objectUrl) URL.revokeObjectURL(rig.objectUrl);
      if (rig.ctx && rig.ctx.state !== "closed") rig.ctx.close();
      shadow.innerHTML = "";
      if (host.__tesser === handle) host.__tesser = null;
    }

    var handle = {
      destroy: destroy,
      setMode: setMode,
      setTheme: setTheme,
      setSensitivity: function (value) {
        view.sensitivity = clamp(Number(value) || view.sensitivity, 0.2, 3);
        sync();
      },
      setColor: setColor,
      setBackground: setBackground,
      setFollow: function (on) { view.follow = Boolean(on); sync(); },
      setSpin: function (plane, value) {
        if (!scene.spin || !Object.prototype.hasOwnProperty.call(scene.spin, plane)) return;
        scene.spin[plane] = clamp(Number(value) || 0, -2, 2);
      },
      resetSpin: function () {
        scene.spin.xy = 1;
        scene.spin.xw = 1;
        scene.spin.yw = 1;
        scene.spin.zw = 1;
        scene.spin.xz = 1;
      },
      setBounce: function (on) { view.bounce = Boolean(on); sync(); },
      setSpeed: function (value) { view.speed = clamp(Number(value) || 1, 0.25, 3); },
      loadUrl: loadUrl,
      play: play,
      pause: pause,
      toggle: toggle,
      toggleMic: toggleMic,
      getState: function () {
        return {
          mode: view.mode,
          theme: view.theme.id,
          color: view.theme.edge,
          background: view.theme.bg,
          x: scene.x,
          y: scene.y,
          playing: state.playing,
          source: state.source,
          follow: view.follow,
          bounce: view.bounce,
          sensitivity: view.sensitivity,
        };
      },
    };
    host.__tesser = handle;

    top.hidden = !view.title;
    bottom.hidden = !view.controls;
    sync();
    poke();
    scene.resize();

    var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    on(reduceQuery, "change", function () { view.reduce = reduceQuery.matches; });

    function localPoint(event) {
      var rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    }
    on(window, "pointermove", function (event) {
      localPoint(event);
      pointer.active = true;
      focused = true;
      poke();
    });
    on(window, "pointerdown", function (event) {
      localPoint(event);
      pointer.active = true;
      focused = true;
      poke();
    });
    on(bottom, "pointerenter", function () { overDock = true; poke(); });
    on(bottom, "pointerleave", function () { overDock = false; poke(); });
    on(bottom, "focusin", function () { overDock = true; poke(); });
    on(bottom, "focusout", function (event) {
      if (!bottom.contains(event.relatedTarget)) {
        overDock = false;
        poke();
      }
    });

    on(stage, "dragenter", function (event) {
      event.preventDefault();
      dragDepth += 1;
      stage.dataset.drag = "true";
    });
    on(stage, "dragover", function (event) { event.preventDefault(); });
    on(stage, "dragleave", function () {
      dragDepth -= 1;
      if (dragDepth <= 0) {
        dragDepth = 0;
        stage.dataset.drag = "false";
      }
    });
    on(stage, "drop", function (event) {
      event.preventDefault();
      dragDepth = 0;
      stage.dataset.drag = "false";
      var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      if (file) loadFile(file).catch(function () { showError("Couldn’t read that file."); });
    });

    on(micBtn, "click", function () { toggleMic(); });
    on(linkBtn, "click", function () {
      state.urlOpen = !state.urlOpen;
      sync();
      if (state.urlOpen) urlInput.focus();
    });
    on(playBtn, "click", function () { toggle().catch(function () {}); });
    on(fileInput, "change", function () {
      var file = fileInput.files && fileInput.files[0];
      fileInput.value = "";
      if (file) loadFile(file).catch(function () { showError("Couldn’t play that file."); });
    });
    on(urlRow, "submit", function (event) {
      event.preventDefault();
      loadUrl(urlInput.value).catch(function () {});
    });
    stage.querySelectorAll("[data-mode]").forEach(function (btn) {
      on(btn, "click", function () { setMode(btn.getAttribute("data-mode")); });
    });
    stage.querySelectorAll("[data-theme]").forEach(function (btn) {
      on(btn, "click", function () { setTheme(btn.getAttribute("data-theme")); });
    });
    on(range, "input", function () { view.sensitivity = Number(range.value); });
    on(colorInput, "input", function () { setColor(colorInput.value); });
    on(fullBtn, "click", function () {
      var active = document.fullscreenElement || document.webkitFullscreenElement;
      var req = host.requestFullscreen || host.webkitRequestFullscreen;
      var exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (active) {
        if (exit) exit.call(document);
      } else if (req) {
        Promise.resolve(req.call(host)).catch(function () {
          showError("Fullscreen isn’t available here.");
        });
      } else showError("Fullscreen isn’t available here.");
    });
    if (embedBtn) {
      on(embedBtn, "click", function () {
        state.embedOpen = !state.embedOpen;
        sync();
      });
    }
    stage.querySelectorAll("[data-copy]").forEach(function (btn) {
      on(btn, "click", function () {
        var kind = btn.getAttribute("data-copy");
        var area = stage.querySelector("[data-snippet='" + kind + "']");
        var text = area ? area.value : "";
        var done = function () {
          var prev = btn.textContent;
          btn.textContent = "Copied";
          window.setTimeout(function () { btn.textContent = prev; }, 1200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () {
            area.focus();
            area.select();
          });
        } else {
          area.focus();
          area.select();
        }
      });
    });

    on(audio, "ended", function () {
      state.playing = false;
      rig.expecting = false;
      sync();
      emit("pause", {});
    });
    on(audio, "error", function () {
      if (!rig.expecting) return;
      rig.expecting = false;
      state.playing = false;
      showError("Couldn’t load that audio. Files from another site need CORS. Uploading the file always works.");
      emit("error", { message: state.error });
    });
    on(document, "fullscreenchange", function () { scene.resize(); sync(); });
    on(document, "webkitfullscreenchange", function () { scene.resize(); sync(); });

    on(window, "keydown", function (event) {
      if (!exclusiveKeys && !focused && !overDock) return;
      var path = event.composedPath ? event.composedPath() : [];
      var real = path[0];
      var tag = real && real.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.code === "Space") {
        event.preventDefault();
        toggle().catch(function () {});
      } else if (event.key === "f" || event.key === "F") {
        fullBtn.click();
      } else if (event.key === "m" || event.key === "M") {
        toggleMic();
      } else if (event.key === "1") setMode("hyper");
      else if (event.key === "2") setMode("bars");
      else if (event.key === "3") setMode("ring");
    });

    if (listen) {
      on(window, "message", function (event) {
        var data = event.data;
        if (!data || data.type !== "tesser" || typeof data.action !== "string") return;
        if (event.source !== window && event.source !== window.parent) return;
        var action = data.action;
        if (action === "setMode") setMode(data.mode);
        else if (action === "setTheme") setTheme(data.theme);
        else if (action === "setSensitivity") handle.setSensitivity(data.value);
        else if (action === "setColor") setColor(data.color);
        else if (action === "setBackground") setBackground(data.background || data.color);
        else if (action === "setFollow") handle.setFollow(data.value !== false && data.follow !== false);
        else if (action === "setBounce") handle.setBounce(data.value !== false && data.bounce !== false);
        else if (action === "setSpeed") handle.setSpeed(data.value);
        else if (action === "loadUrl" && data.url) loadUrl(data.url).catch(function () {});
        else if (action === "play") play().catch(function () {});
        else if (action === "pause") pause();
        else if (action === "toggle") toggle().catch(function () {});
        else if (action === "mic") toggleMic();
        else if (action === "stopMic") { if (rig.mode === "mic") toggleMic(); }
      });
    }

    var last = performance.now();
    function tick(now) {
      if (dead) return;
      if (!host.isConnected) {
        destroy();
        return;
      }
      var dt = Math.min(0.033, Math.max(0.001, (now - last) / 1000));
      last = now;
      var bands = rig.sample(view.sensitivity);
      scene.frame(dt, bands, view, pointer);
      meter.style.transform = "scaleX(" + Math.max(0, bands.energy) + ")";
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    if (options.src) {
      var boot = function () { loadUrl(options.src).catch(function () {}); };
      if (options.autoplay) {
        boot();
        on(host, "pointerdown", function once() {
          host.removeEventListener("pointerdown", once);
          if (!state.playing) boot();
        });
      }
    }

    emit("ready", { version: VERSION, mode: view.mode });
    return handle;
  }

  function optionsFromElement(el) {
    var d = el.dataset;
    var opt = {};
    if (d.mode) opt.mode = d.mode;
    if (d.theme) opt.theme = d.theme;
    if (d.src) opt.src = d.src;
    if (d.sensitivity) opt.sensitivity = Number(d.sensitivity);
    if (d.speed) opt.speed = Number(d.speed);
    if (d.radius) opt.radius = Number(d.radius);
    if (d.color) opt.color = d.color;
    if (d.background) opt.background = d.background;
    function boolAttr(name) {
      if (!(name in d)) return undefined;
      var value = d[name];
      if (value === "" || value === "true" || value === "1") return true;
      if (value === "false" || value === "0") return false;
      return undefined;
    }
    var controls = boolAttr("controls");
    var follow = boolAttr("follow");
    var bounce = boolAttr("bounce");
    var title = boolAttr("title");
    var autoplay = boolAttr("autoplay");
    var transparent = boolAttr("transparent");
    var adapt = boolAttr("adapt");
    var embed = boolAttr("embed");
    if (controls !== undefined) opt.controls = controls;
    if (follow !== undefined) opt.follow = follow;
    if (bounce !== undefined) opt.bounce = bounce;
    if (title !== undefined) opt.title = title;
    if (autoplay !== undefined) opt.autoplay = autoplay;
    if (transparent !== undefined) opt.transparent = transparent;
    if (adapt !== undefined) opt.adapt = adapt;
    if (embed !== undefined) opt.embed = embed;
    if (!("theme" in opt) && !("color" in opt) && adapt !== false) opt.adapt = true;
    return opt;
  }

  function autoMount(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var nodes = scope.querySelectorAll("[data-tesser]");
    Array.prototype.forEach.call(nodes, function (el) {
      if (el.__tesser) return;
      mount(el, optionsFromElement(el));
    });
  }

  window.Tesser = {
    version: VERSION,
    mount: mount,
    themes: THEMES.map(function (theme) {
      return { id: theme.id, name: theme.name, bg: theme.bg, edge: theme.edge };
    }),
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { autoMount(); });
  else autoMount();

  if (document.documentElement) {
    var mo = new MutationObserver(function () { autoMount(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
