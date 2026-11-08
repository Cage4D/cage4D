// Draws every panel of the profile README as a self-contained SVG that
// follows the viewer's light/dark preference. Run:  node scripts/build.mjs
// With GITHUB_TOKEN set it also fetches live stats; without it, it keeps
// the last fetched numbers (assets/stats.json) or draws a "no signal" state.

import { createHash } from "node:crypto";
import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets");
mkdirSync(OUT, { recursive: true });

const USER = "cage4D";
const W = 840;

// ---- editable content -------------------------------------------------------

const LINES = [
  "observing quietly.",
  "building things that hum.",
  "some of them even compile.",
  "listening for faint signals.",
  "drafting in the dark.",
  "occasionally, on purpose.",
  "testing things best left untested.",
  "surfing the cosmos.",
  "refactoring the void.",
];

const STACK = [
  ["core", "typescript · node · nestjs · postgresql · python"],
  ["surface", "react · next.js · three.js · html · css"],
  ["chain", "solidity · foundry"],
  ["low-level", "c++"],
];

// Projects in the "experiments that escaped the lab" dropdown, in display order.
// Add a new one by appending an entry, then run the build. A field set to null
// is printed as TODO and flagged in the build output.
const PROJECTS = [
  {
    name: "generative-music-studio",
    status: "stable",
    stack: "next.js · nestjs · prisma · postgresql · zod · tone.js",
    purpose: "a browser studio that turns a seed and a handful of settings into short loops (melody, arpeggio, bass, drums, pads, texture) you can shape, play back and share by link. no accounts, no presets. tweak and listen.",
  },
  {
    name: "dev-overflow",
    status: "stable",
    stack: "next.js · typescript · mongodb · mongoose · better auth",
    purpose: "a stack overflow-style q&a platform: ask, answer, vote and tag. built to learn the next.js app router end to end.",
  },
  {
    name: "wave-play",
    status: "stable",
    stack: "react · typescript · vite · tailwind css · react router · radix ui",
    purpose: "a small dark music player for the browser. browse by genre, keep what you like, and the music follows you from page to page. built to get the small interactions right.",
  },
  {
    name: "transaction-queue",
    status: "stable",
    stack: "typescript · node · postgresql · vitest · docker",
    purpose: "a job queue that lives inside postgres. jobs enqueue in the same transaction as your data, workers claim them without colliding, failures back off and retry. no broker. if you have postgres, you have the queue.",
  },
];

const PROJECTS_LABEL = "experiments that escaped the lab";

// Role line above the header panel (assets/role.svg, written between the role markers).
const ROLE = "Full-stack & Smart contract engineer";

// ---- palette ----------------------------------------------------------------

const THEMES = {
  dark:  { ink: "#ededed", mu: "#6e7681", ln: "#c9d1d9", dim: "#30363d" },
  light: { ink: "#1f2328", mu: "#8c959f", ln: "#57606a", dim: "#d0d7de" },
};

const FONT = `'JetBrains Mono','SFMono-Regular',Menlo,Consolas,'Liberation Mono',monospace`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const svg = (h, label, t, body, extraCss = "", w = W) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">
<style>
svg{--ink:${THEMES.light.ink};--mu:${THEMES.light.mu};--ln:${THEMES.light.ln};--dim:${THEMES.light.dim}}
@media (prefers-color-scheme:dark){svg{--ink:${THEMES.dark.ink};--mu:${THEMES.dark.mu};--ln:${THEMES.dark.ln};--dim:${THEMES.dark.dim}}}
text{font-family:${FONT}}
.ink{fill:${t.ink}}.mu{fill:${t.mu}}
.ln{stroke:${t.ln};fill:none}.lm{stroke:${t.mu};fill:none}.ld{stroke:${t.dim};fill:none}
.blink{animation:blink 1.1s steps(1) infinite}
.pulse{animation:pulse 3.2s ease-in-out infinite}
@keyframes blink{50%{opacity:0}}
@keyframes pulse{50%{opacity:.25}}
${extraCss}
</style>
${body}
</svg>
`;

const brackets = (h, inset = 14, len = 16) =>
  `<path class="lm" stroke-width="1" d="M${inset} ${inset + len} V${inset} H${inset + len} M${W - inset - len} ${inset} H${W - inset} V${inset + len} M${inset} ${h - inset - len} V${h - inset} H${inset + len} M${W - inset - len} ${h - inset} H${W - inset} V${h - inset - len}"/>`;

// ---- header: reticle --------------------------------------------------------

function header(t) {
  const css = `.r1{transform-origin:420px 120px;animation:spin 24s linear infinite}
.r2{transform-origin:420px 120px;animation:spin 40s linear infinite reverse}
.orb{transform-origin:420px 120px;animation:spin 9s linear infinite}
.t{font-size:15px;letter-spacing:1px}.s{font-size:12px}
@keyframes spin{to{transform:rotate(360deg)}}`;
  const body = `${brackets(240)}
<path class="lm" stroke-width="1" stroke-dasharray="1 5" d="M250 120 H362 M478 120 H590 M420 20 V62 M420 178 V220"/>
<g class="r1"><circle class="ln" stroke-width="1" cx="420" cy="120" r="82" stroke-dasharray="2 7"/>
<path class="ln" stroke-width="1.2" d="M420 32 V46 M420 194 V208 M332 120 H346 M494 120 H508"/></g>
<g class="r2"><circle class="ln" stroke-width="1" cx="420" cy="120" r="62" stroke-dasharray="46 16"/></g>
<g class="orb"><circle class="ink" cx="420" cy="48" r="2"/></g>
<circle class="ln" stroke-width="1" cx="420" cy="120" r="36"/>
<text class="ink t" x="420" y="125" text-anchor="middle">cage4D</text>
<text class="mu s" x="40" y="44">obj. 4D-0417</text>
<text class="mu s" x="40" y="64">origin: unlisted</text>
<text class="mu s" x="800" y="44" text-anchor="end">signal: faint</text>
<text class="mu s" x="800" y="64" text-anchor="end">intent: unclear</text>
<text class="ink s" x="40" y="204">&gt; tracking<tspan class="blink">_</tspan></text>
<text class="mu s" x="800" y="204" text-anchor="end">scan 04 / ∞ <tspan class="pulse">●</tspan></text>`;
  return svg(240, "cage4D", t, body, css);
}

// ---- role line -------------------------------------------------------------
// A small label above the header: muted, semi-bold, centered.

function role(t) {
  const CW = 8.1, H = 22;
  const w = Math.ceil(ROLE.length * CW) + 4;
  const body = `<text class="mu" x="${w / 2}" y="16" font-size="13" font-weight="600" text-anchor="middle">${esc(ROLE)}</text>`;
  return svg(H, ROLE, t, body, "", w);
}

function writeRole(t) {
  const roleSvg = role(t);
  writeFileSync(join(OUT, "role.svg"), roleSvg);
  // Content hash in the URL, so GitHub's CDN and browsers never show a stale copy.
  const v = createHash("sha1").update(roleSvg).digest("hex").slice(0, 8);
  const file = join(ROOT, "README.md");
  if (!existsSync(file)) return;
  const START = "<!-- role:start -->", END = "<!-- role:end -->";
  const block = `<p align="center">
  <img src="./assets/role.svg?v=${v}" alt="${esc(ROLE)}" height="22">
</p>`;
  let md = readFileSync(file, "utf8");
  const a = md.indexOf(START), b = md.indexOf(END);
  // Markers missing: put them at the very top.
  if (a < 0 || b < a) md = `${START}\n${END}\n\n` + md.replace(/^\s+/, "");
  const i = md.indexOf(START), j = md.indexOf(END);
  writeFileSync(file, md.slice(0, i + START.length) + "\n" + block + "\n" + md.slice(j));
}

// ---- typing line ------------------------------------------------------------
// Pure CSS (no SMIL), so it plays in every viewer. Each line is forced to an
// exact width with textLength, so a clip that grows in character-sized steps
// "types" it, and the cursor steps along with the clip.

function signal(t) {
  const CW = 8.4, FS = 14, Y = 35;
  const TYPE = 0.07, HOLD = 1.9, ERASE = 0.03, GAP = 0.4;
  const segs = LINES.map((l) => {
    const n = l.length, type = n * TYPE, erase = n * ERASE;
    return { l, n, type, erase, dur: type + HOLD + erase + GAP };
  });
  const T = segs.reduce((a, s) => a + s.dur, 0);
  const pc = (x) => ((x / T) * 100).toFixed(3) + "%";
  const pcm = (x) => ((Math.max(0, x / T - 0.00002)) * 100).toFixed(3) + "%";
  const maxLen = Math.max(...LINES.map((l) => l.length));
  const x0 = Math.round(W / 2 - ((maxLen + 2) * CW) / 2);
  const tx = x0 + 2 * CW;

  let css = "", defs = "", lines = "", start = 0;
  segs.forEach(({ l, n, type, erase, dur }, i) => {
    const t1 = start + type, t2 = t1 + HOLD, t3 = t2 + erase;
    const wpx = (n * CW).toFixed(1);
    const vis = `@keyframes v${i}{0%{opacity:0}${start > 0 ? `${pcm(start)}{opacity:0}` : ""}${pc(start)}{opacity:1}${pc(t3)}{opacity:1}${pc(t3 + 0.0001 * T > T ? T : t3 + 0.01)}{opacity:0}100%{opacity:0}}`;
    const grow = (prop, full) => `0%{${prop}(0)}${start > 0 ? `${pc(start)}{${prop}(0);animation-timing-function:steps(${n},end)}` : ""}${pc(t1)}{${prop}(${full});animation-timing-function:linear}${pc(t2)}{${prop}(${full});animation-timing-function:steps(${n},end)}${pc(t3)}{${prop}(0)}100%{${prop}(0)}`;
    const firstTf = start === 0 ? `;animation-timing-function:steps(${n},end)` : "";
    css += `${vis}
@keyframes c${i}{${grow("transform:scaleX", 1).replace("0%{transform:scaleX(0)}", `0%{transform:scaleX(0)${firstTf}}`)}}
@keyframes k${i}{${grow("transform:translateX", wpx + "px").replace("0%{transform:translateX(0)}", `0%{transform:translateX(0)${firstTf}}`)}}
.v${i}{opacity:0;animation:v${i} ${T.toFixed(2)}s linear infinite}
.c${i}{transform-origin:${tx}px 0;animation:c${i} ${T.toFixed(2)}s linear infinite}
.k${i}{animation:k${i} ${T.toFixed(2)}s linear infinite}
`;
    defs += `<clipPath id="cp${i}"><rect class="c${i}" x="${tx}" y="${Y - 16}" width="${wpx}" height="22"/></clipPath>`;
    lines += `<g class="v${i}"><text class="mu" x="${tx}" y="${Y}" font-size="${FS}" textLength="${wpx}" lengthAdjust="spacingAndGlyphs" clip-path="url(#cp${i})" xml:space="preserve">${esc(l)}</text>
<g class="k${i}"><text class="ink blink" x="${tx}" y="${Y}" font-size="${FS}">_</text></g></g>`;
    start += dur;
  });

  const body = `<defs>${defs}</defs>
<path class="ld" stroke-width="1" d="M40 30 H${x0 - 24} M${W - x0 + 24} 30 H800"/>
<text class="mu" x="${x0}" y="${Y}" font-size="${FS}">&gt;</text>
${lines}`;
  return svg(60, LINES.join(" / "), t, body, css);
}

// ---- composition: branching signal ------------------------------------------
// The four layers fan out from a core node (top-left, top-right, bottom-left,
// bottom-right, in STACK order). Each tool is a leaf; a pulse travels from the
// core to every leaf and pings when it arrives.

function composition(t) {
  const H = 300, CX = 420, CY = 150, R = 24;
  const QUAD = [
    { side: -1, mid: 88 },   // core
    { side: 1, mid: 88 },    // surface
    { side: -1, mid: 220 },  // chain
    { side: 1, mid: 220 },   // low-level
  ];
  const GAP = 22;
  const rnd = (i) => ((Math.sin(i * 91.7) + 1) / 2); // stable pseudo-random
  let statics = "", pulses = "", labels = "", branchCss = "", leafCount = 0;

  STACK.forEach(([layer, tools], gi) => {
    const q = QUAD[gi % 4];
    const leaves = tools.split("·").map((s) => s.trim());
    const ys = leaves.map((_, i) => q.mid - ((leaves.length - 1) * GAP) / 2 + i * GAP);
    const mid = (ys[0] + ys[ys.length - 1]) / 2;
    const jx = CX + q.side * 104;     // where the trunk turns horizontal
    const bus = CX + q.side * 196;    // vertical bus the leaves hang off
    const lx = CX + q.side * 214;     // leaf dot
    const ang = Math.atan2(mid - CY, jx - CX);
    const sx = CX + Math.cos(ang) * (R + 2), sy = CY + Math.sin(ang) * (R + 2);
    const trunk = `M${sx.toFixed(1)} ${sy.toFixed(1)} L${jx} ${mid} H${bus}`;
    const trunkLen = Math.hypot(jx - sx, mid - sy) + Math.abs(bus - jx);

    statics += `<path class="ld" stroke-width="1" d="${trunk}"/>`;
    if (ys.length > 1) statics += `<path class="ld" stroke-width="1" d="M${bus} ${ys[0]} V${ys[ys.length - 1]}"/>`;
    labels += `<text class="mu" x="${(jx + bus) / 2}" y="${mid - 7}" font-size="11" text-anchor="middle">${esc(layer)}</text>`;

    leaves.forEach((name, i) => {
      const y = ys[i];
      const d = `${trunk} V${y} H${lx}`;
      const len = trunkLen + Math.abs(y - mid) + Math.abs(lx - bus);
      const dur = (6.5 + rnd(leafCount + 1) * 4).toFixed(2);
      const begin = (-rnd(leafCount + 7) * 9).toFixed(2);
      statics += `<path class="ld" stroke-width="1" d="M${bus} ${y} H${lx}"/><circle class="ln" stroke-width="1" cx="${lx}" cy="${y}" r="2"/>`;
      const id = `b${leafCount}`;
      branchCss += `@keyframes ${id}{0%{stroke-dashoffset:10px}60%{stroke-dashoffset:${(-len).toFixed(1)}px}100%{stroke-dashoffset:${(-len).toFixed(1)}px}}
.${id}{animation:${id} ${dur}s linear ${begin}s infinite}.${id}p{animation:ping ${dur}s linear ${begin}s infinite}
`;
      pulses += `<path class="pl ${id}" stroke-width="1.6" stroke-linecap="round" d="${d}" stroke-dasharray="10 ${Math.ceil(len + 40)}" stroke-dashoffset="10"/>
<circle class="png ${id}p" cx="${lx}" cy="${y}" r="2" stroke-width="1"/>`;
      const tx = lx + q.side * 10;
      labels += `<text class="ink" x="${tx}" y="${y + 4}" font-size="12" text-anchor="${q.side < 0 ? "end" : "start"}">${esc(name)}</text>`;
      leafCount++;
    });
  });

  const css = branchCss + `.pl{stroke:var(--ink);fill:none}.png{stroke:var(--ink);fill:none;opacity:0;transform-box:fill-box;transform-origin:center}
@keyframes ping{0%{opacity:0;transform:scale(1)}59%{opacity:0;transform:scale(1)}60%{opacity:.9;transform:scale(1)}85%{opacity:0;transform:scale(4.5)}100%{opacity:0;transform:scale(4.5)}}
.core{transform-origin:${CX}px ${CY}px;animation:spin 30s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}`;
  const body = `${brackets(H)}
<text class="mu" x="40" y="${H - 34}" font-size="12">composition</text>
<text class="mu" x="800" y="${H - 34}" font-size="12" text-anchor="end">branches: ${leafCount} <tspan class="pulse">●</tspan></text>
${statics}
${pulses}
<g class="core"><circle class="lm" stroke-width="1" cx="${CX}" cy="${CY}" r="${R + 8}" stroke-dasharray="1 4"/></g>
<circle class="ln" stroke-width="1" cx="${CX}" cy="${CY}" r="${R}"/>
<text class="ink" x="${CX}" y="${CY + 4}" font-size="12" text-anchor="middle">c4D</text>
${labels}`;
  return svg(H, "stack: " + STACK.map((s) => s[1]).join(" · "), t, body, css);
}

// ---- stats ------------------------------------------------------------------

async function fetchStats() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  const q = `query($l:String!){user(login:$l){
    contributionsCollection{totalCommitContributions totalPullRequestContributions}
    repositories(first:100,ownerAffiliations:OWNER,isFork:false,privacy:PUBLIC){totalCount nodes{stargazerCount
      languages(first:10,orderBy:{field:SIZE,direction:DESC}){edges{size node{name}}}}}
    recent:repositories(first:6,ownerAffiliations:OWNER,isFork:false,privacy:PUBLIC,orderBy:{field:PUSHED_AT,direction:DESC}){nodes{name pushedAt}}}}`;
  const r = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": "cage4D-readme" },
    body: JSON.stringify({ query: q, variables: { l: USER } }),
  });
  const j = await r.json();
  if (!j.data?.user) throw new Error("stats fetch failed: " + JSON.stringify(j.errors ?? j));
  const u = j.data.user;
  const langs = {};
  let stars = 0;
  for (const n of u.repositories.nodes) {
    stars += n.stargazerCount;
    for (const e of n.languages.edges) langs[e.node.name] = (langs[e.node.name] ?? 0) + e.size;
  }
  const sum = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
  const top = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, s]) => ({ name: name.toLowerCase(), pct: Math.round((s / sum) * 1000) / 10 }));
  return {
    commits: u.contributionsCollection.totalCommitContributions,
    prs: u.contributionsCollection.totalPullRequestContributions,
    repos: u.repositories.totalCount,
    stars,
    langs: top,
    // The profile repo is skipped: the readout Action pushes to it daily.
    recent: u.recent.nodes.filter((n) => n.name.toLowerCase() !== USER.toLowerCase()).slice(0, 5)
      .map((n) => ({ name: n.name.toLowerCase(), pushedAt: n.pushedAt })),
    at: new Date().toISOString().slice(0, 10),
  };
}

// ---- stats panel: radar scope + activity log --------------------------------

const metrics = (d) => [
  ["commits / yr", d ? d.commits : "—"],
  ["pull requests", d ? d.prs : "—"],
  ["public repos", d ? d.repos : "—"],
  ["stars", d ? d.stars : "—"],
];
// Optional extra rows from the LANG_EXTRA environment variable ("name:pct,name:pct").
const EXTRA_LANGS = (process.env.LANG_EXTRA ?? "").split(",").map((s) => s.trim()).filter(Boolean)
  .map((s) => { const i = s.lastIndexOf(":"); return { name: s.slice(0, i).trim().toLowerCase(), pct: Number(s.slice(i + 1)) }; })
  .filter((l) => l.name && Number.isFinite(l.pct) && l.pct > 0);
const langsOf = (d) => {
  if (!d?.langs?.length) return [];
  // The fetched languages share whatever the extra rows leave, so the rows add up to 100%.
  const extra = new Set(EXTRA_LANGS.map((l) => l.name));
  const rest = d.langs.filter((l) => !extra.has(l.name));
  const room = 100 - EXTRA_LANGS.reduce((a, l) => a + l.pct, 0);
  const total = rest.reduce((a, l) => a + l.pct, 0) || 1;
  const scaled = rest.map((l) => ({ name: l.name, pct: Math.round((l.pct / total) * room * 10) / 10 }));
  // Put any rounding leftover on the largest row so the total is exactly 100.
  if (scaled.length) scaled[0].pct = Math.round((scaled[0].pct + room - scaled.reduce((a, l) => a + l.pct, 0)) * 10) / 10;
  return [...scaled, ...EXTRA_LANGS].sort((a, b) => b.pct - a.pct);
};

// Language bars in the log: a thin dim track, a brighter fill and an end tick.
// The fill grows in just after its log line prints.
const BX = 600, BW = 150;
function bar(pct, y, delay) {
  const fw = (BW * Math.max(0, Math.min(100, pct))) / 100;
  let out = `<path class="ld" stroke-width="2" d="M${BX} ${y - 4} H${BX + BW}"/>`;
  if (fw > 0) out += `<g class="gr" style="animation-delay:${delay}s"><path class="ln" stroke-width="2" d="M${BX} ${y - 4} H${(BX + fw).toFixed(1)}"/><path style="stroke:var(--ink)" stroke-width="1" d="M${(BX + fw).toFixed(1)} ${y - 8} V${y}"/></g>`;
  return out;
}

// Recently pushed repos for the radar. Older stats.json files have none.
const recentOf = (d) => (d?.recent?.length ? d.recent : []);
const NOW = Date.now();
const ageHours = (iso) => Math.max(0, (NOW - Date.parse(iso)) / 3.6e6);
function ago(iso) {
  const h = ageHours(iso), days = h / 24;
  if (h < 1) return "just now";
  if (h < 24) return `${Math.floor(h)}h ago`;
  if (days < 30) return `${Math.floor(days)}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// Radar on the left, boot log on the right. Each blip is a recently pushed
// repo: the newer the push, the closer to the centre. Its log line carries a
// dot that lights up when the sweep passes the blip.
function stats(t, d) {
  const L = langsOf(d);
  const RP = recentOf(d);
  const ROW = 19, Y0 = 72;
  const rowsN = 1 + 4 + Math.max(L.length, 1) + Math.max(RP.length, 1) + 1;
  const R = 92, P = 6, CX = 176;
  const H = Math.max(Y0 + rowsN * ROW + 26, 2 * R + 96);
  const CY = Math.round((Y0 - 14 + H - 26) / 2);
  const LX = 372, NX = 476, VX = 800;

  let css = `.sw{transform-origin:${CX}px ${CY}px;animation:spin ${P}s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes hit{0%{opacity:1}70%{opacity:.15}100%{opacity:.15}}
.lg{opacity:0;animation:appear .01s linear forwards}
.gr{transform-box:fill-box;transform-origin:0 50%;transform:scaleX(0);animation:grow .7s ease-out forwards}
@keyframes grow{to{transform:scaleX(1)}}
@keyframes appear{to{opacity:1}}`;

  // radar
  let blips = "";
  const hitDelay = (deg) => ((deg / 360) * P - P).toFixed(2);
  // Distance grows with the log of the push age: minutes old sits near the
  // centre, a year or more sits at the outer edge.
  const R0 = 16, R1 = R - 12, YEAR_H = 24 * 365;
  const CW = 6.1, EDGE_L = 24, EDGE_R = 332; // label limits: panel edge and log column
  RP.forEach((p, i) => {
    const f = Math.min(1, Math.log1p(ageHours(p.pushedAt)) / Math.log1p(YEAR_H));
    const deg = 30 + i * 67, rad = ((deg - 90) * Math.PI) / 180, r = R0 + f * (R1 - R0);
    const x = CX + Math.cos(rad) * r, y = CY + Math.sin(rad) * r;
    // Label on the outward side of the blip, cut short so it stays in the radar's area.
    const right = Math.cos(rad) >= 0;
    const lx = right ? x + 7 : x - 7;
    const room = Math.floor((right ? EDGE_R - lx : lx - EDGE_L) / CW);
    const label = p.name.length > room ? p.name.slice(0, Math.max(1, room - 1)) + "…" : p.name;
    css += `\n.sh${i}{animation:hit ${P}s linear ${hitDelay(deg)}s infinite}`;
    blips += `<g class="sh${i}"><circle class="ink" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(3 - f * 1.4).toFixed(1)}"/>
<text class="mu" x="${lx.toFixed(1)}" y="${(y + 4).toFixed(1)}" font-size="10"${right ? "" : ' text-anchor="end"'}>${esc(label)}</text></g>`;
  });

  // log
  let out = "", y = Y0, i = 0;
  const stamp = (n) => `[00:00:${String(n).padStart(2, "0")}]`;
  const line = (inner) => {
    css += `\n.sa${i}{animation-delay:${(0.35 + i * 0.3).toFixed(2)}s}`;
    out += `<g class="lg sa${i}"><text class="mu" x="${LX}" y="${y}" font-size="12">${stamp(i + 1)}</text>${inner(y)}</g>`;
    y += ROW; i++;
  };
  const kv = (k, v) => (y) => `<text class="ink" x="${NX}" y="${y}" font-size="12">${esc(k)}</text>
<path class="ld" stroke-width="1" stroke-dasharray="1 4" d="M${NX + 8 + k.length * 7.2} ${y - 4} H${VX - 10 - String(v).length * 7.2}"/>
<text class="ink" x="${VX}" y="${y}" font-size="12" text-anchor="end">${esc(v)}</text>`;
  line(kv("boot", "ok"));
  metrics(d).forEach(([k, v]) => line(kv(k, v)));
  (L.length ? L : [{ name: "no signal", pct: 0 }]).forEach((l) => line((y) => {
    const at = (0.45 + i * 0.3).toFixed(2);
    return `<text class="ink" x="${NX}" y="${y}" font-size="12">${esc(l.name)}</text>
${bar(l.pct, y, at)}
<text class="ink" x="${VX}" y="${y}" font-size="12" text-anchor="end">${d ? l.pct.toFixed(1) + "%" : "—"}</text>`;
  }));
  // One line per radar blip; its dot flashes with the blip.
  if (RP.length) RP.forEach((p, pi) => line((y) => `<g class="sh${pi}"><circle class="ink" cx="${NX - 10}" cy="${y - 4}" r="2"/></g>
${kv(p.name, ago(p.pushedAt))(y)}`));
  else line(kv("recent pushes", "no signal"));
  line((y) => `<text class="ink" x="${NX}" y="${y}" font-size="12">readout complete<tspan class="blink">_</tspan></text>`);

  const body = `${brackets(H)}
<text class="mu" x="40" y="44" font-size="12">scope</text>
<text class="mu" x="${LX}" y="44" font-size="12">activity log</text>
<text class="mu" x="${VX}" y="44" font-size="12" text-anchor="end">${d ? "sampled " + d.at : "awaiting first sample"} <tspan class="pulse">●</tspan></text>
<path class="ld" stroke-width="1" d="M340 ${Y0 - 16} V${y - ROW + 6}"/>
<g class="ld" stroke-width="1"><circle cx="${CX}" cy="${CY}" r="${R}" fill="none"/><circle cx="${CX}" cy="${CY}" r="${R * 0.66}" fill="none"/><circle cx="${CX}" cy="${CY}" r="${R * 0.33}" fill="none"/>
<path d="M${CX - R} ${CY} H${CX + R} M${CX} ${CY - R} V${CY + R}"/></g>
<g class="sw"><path d="M${CX} ${CY} L${CX} ${CY - R} A${R} ${R} 0 0 0 ${(CX - Math.sin(Math.PI / 7) * R).toFixed(1)} ${(CY - Math.cos(Math.PI / 7) * R).toFixed(1)} Z" style="fill:var(--ink)" opacity=".07"/>
<path class="ln" stroke-width="1" d="M${CX} ${CY} V${CY - R}"/></g>
${blips}
<circle class="ink" cx="${CX}" cy="${CY}" r="2"/>
${out}`;
  return svg(H, "github stats for " + USER, t, body, css);
}

function transmit(t) {
  const body = `<text class="mu" x="420" y="26" font-size="13" text-anchor="middle">$ <tspan class="ink">./establish-contact</tspan><tspan class="ink blink">_</tspan></text>
<text class="mu" x="420" y="48" font-size="11" text-anchor="middle">the line is open. tap to transmit.</text>`;
  return svg(62, "establish contact: email", t, body);
}

// ---- projects dropdown (markdown, written into README.md) -------------------

function wrap(text, width) {
  const words = String(text).split(/\s+/);
  const lines = [""];
  for (const w of words) {
    const cur = lines[lines.length - 1];
    if (cur && (cur + " " + w).length > width) lines.push(w);
    else lines[lines.length - 1] = cur ? cur + " " + w : w;
  }
  return lines;
}

// The dropdown label and every project card are SVGs in the same style as the
// panels, so GitHub's own code-block styling never shows.

// The profile shows a single link (lab.svg) to LAB.md, which holds the cards.
// A link instead of a <details> dropdown, because GitHub's dropdown arrow
// can't be styled or hidden.
const BRANCH = "main";
const LAB_URL = `https://github.com/${USER}/${USER}/blob/${BRANCH}/LAB.md`;

function labLink(t) {
  const text = PROJECTS_LABEL + " →";
  const w = Math.ceil(text.length * 7.3) + 4;
  const body = `<text class="mu" x="2" y="15" font-size="12">${esc(PROJECTS_LABEL)} <tspan class="ink">→</tspan></text>`;
  return svg(22, PROJECTS_LABEL, t, body, "", w);
}

function labHeader(t) {
  const H = 96;
  const body = `${brackets(H, 14, 12)}
<text class="mu" x="40" y="42" font-size="12">archive</text>
<text class="ink" x="40" y="66" font-size="14">${esc(PROJECTS_LABEL)}</text>
<text class="mu" x="800" y="42" font-size="12" text-anchor="end">containment: partial <tspan class="pulse">●</tspan></text>
<text class="mu" x="800" y="66" font-size="12" text-anchor="end">click a specimen to inspect its source</text>`;
  return svg(H, PROJECTS_LABEL, t, body);
}

function backLink(t) {
  const text = "← return to signal";
  const w = Math.ceil(text.length * 7.3) + 4;
  const body = `<text class="mu" x="2" y="15" font-size="12"><tspan class="ink">←</tspan> return to signal</text>`;
  return svg(22, "return to profile", t, body, "", w);
}

function artifactCard(t, p, i, todo) {
  const val = (k) => {
    const v = p[k];
    if (v == null || v === "") { todo.push(`${p.name}.${k}`); return "TODO"; }
    return v;
  };
  const n = String(i + 1).padStart(2, "0");
  const LX = 40, VX = 170, ROW = 19;
  const purpose = wrap(val("purpose"), 84);
  const H = 70 + ROW + purpose.length * ROW + 30;
  const leader = (label, y) => `<text class="mu" x="${LX}" y="${y}" font-size="12">${label}</text>
<path class="ld" stroke-width="1" stroke-dasharray="1 4" d="M${LX + 8 + label.length * 7.2} ${y - 4} H${VX - 12}"/>`;
  let y = 70;
  let body = `${brackets(H, 14, 12)}
<text class="mu" x="${LX}" y="40" font-size="12">artifact ${n}</text>
<text class="ink" x="${VX}" y="40" font-size="13">${esc(p.name)}</text>
<text class="mu" x="800" y="40" font-size="12" text-anchor="end">${esc(val("status"))} <tspan class="pulse">●</tspan></text>
${leader("stack", y)}<text class="ink" x="${VX}" y="${y}" font-size="12">${esc(val("stack"))}</text>`;
  y += ROW + 6;
  body += leader("purpose", y);
  purpose.forEach((line, k) => { body += `<text class="mu" x="${VX}" y="${y + k * ROW}" font-size="12">${esc(line)}</text>`; });
  body += `<text class="mu" x="800" y="${H - 22}" font-size="11" text-anchor="end">→ <tspan class="ink">source</tspan></text>`;
  return svg(H, `${p.name}: ${p.purpose ?? ""}`, t, body);
}

function writeProjects(t) {
  const todo = [];
  for (const f of readdirSync(OUT)) if (/^artifact-\d+\.svg$/.test(f)) unlinkSync(join(OUT, f));
  writeFileSync(join(OUT, "lab.svg"), labLink(t));
  writeFileSync(join(OUT, "lab-header.svg"), labHeader(t));
  writeFileSync(join(OUT, "back.svg"), backLink(t));
  const cards = PROJECTS.map((p, i) => {
    const file = `artifact-${String(i + 1).padStart(2, "0")}.svg`;
    writeFileSync(join(OUT, file), artifactCard(t, p, i, todo));
    return `<a href="https://github.com/${USER}/${p.name}"><img src="./assets/${file}" alt="${esc(p.name)}" width="100%"></a>`;
  });
  if (todo.length) console.warn("projects still marked TODO:", todo.join(", "));

  const back = `<p align="left">
  <a href="https://github.com/${USER}"><img src="./assets/back.svg" alt="return to profile" height="22"></a>
</p>`;
  writeFileSync(join(ROOT, "LAB.md"), `<!-- generated by scripts/build.mjs; edit PROJECTS there, not this file -->
${back}

<p align="center">
  <img src="./assets/lab-header.svg" alt="${PROJECTS_LABEL}" width="100%">
</p>

<p align="center">
${cards.map((c) => "  " + c).join("\n")}
</p>

${back}
`);

  const file = join(ROOT, "README.md");
  if (!existsSync(file)) return;
  const START = "<!-- artifacts:start -->", END = "<!-- artifacts:end -->";
  const md = readFileSync(file, "utf8");
  const a = md.indexOf(START), b = md.indexOf(END);
  if (a < 0 || b < a) { console.warn("README.md has no artifacts markers; lab link not written"); return; }
  const block = `<p align="center">
  <a href="${LAB_URL}"><img src="./assets/lab.svg" alt="${PROJECTS_LABEL}" height="22"></a>
</p>`;
  writeFileSync(file, md.slice(0, a + START.length) + "\n" + block + "\n" + md.slice(b));
}

// ---- write ------------------------------------------------------------------

const statsFile = join(OUT, "stats.json");
let data = null;
try { data = await fetchStats(); } catch (e) { console.error(e.message); }
if (data) writeFileSync(statsFile, JSON.stringify(data, null, 2) + "\n");
else if (existsSync(statsFile)) data = JSON.parse(readFileSync(statsFile, "utf8"));

// One file per panel; colours switch inside the SVG with prefers-color-scheme.
const t = { ink: "var(--ink)", mu: "var(--mu)", ln: "var(--ln)", dim: "var(--dim)" };
writeFileSync(join(OUT, "header.svg"), header(t));
writeFileSync(join(OUT, "signal.svg"), signal(t));
writeFileSync(join(OUT, "composition.svg"), composition(t));
writeFileSync(join(OUT, "stats.svg"), stats(t, data));
writeFileSync(join(OUT, "transmit.svg"), transmit(t));
writeProjects(t);
writeRole(t);
console.log("built", data ? "with stats" : "without stats");
