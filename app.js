/* ======================= Instant UI + JSON DB (no GViz) ======================= */
"use strict";

/* ------------------ Built-in default DB (used at boot) ------------------ */
const DEFAULT_DRUGS = [
  {
    id: "dopamine",
    name: "Dopamine",
    color: "#6cc866",
    pMin: 1,
    pMax: 50,
    conc: ["1:1", "2:1"],
    defaultP: 1.0,
    defaultConc: "2:1",
    defaultTotal: 100,
    synonyms: ["dopa"],
    ampules: [{ name: "250 mg/10 mL (25 mg/mL)", sizeMl: 10, concMgPerMl: 25 }],
    prepVolumesByConc: { "1:1": [100, 250, 500], "2:1": [100, 250, 500] },
    prepNote: {
      en: "Diluted in NSS, D5W or D5S",
      th: "ผสมใน NSS, D5W หรือ D5S",
      critical: false,
    },
  },
  {
    id: "dobutamine",
    name: "Dobutamine",
    color: "#f8d761",
    pMin: 1,
    pMax: 40,
    conc: ["1:1", "2:1"],
    defaultP: 1.0,
    defaultConc: "1:1",
    defaultTotal: 100,
    synonyms: ["dobu"],
    ampules: [
      { name: "250 mg/20 mL (12.5 mg/mL)", sizeMl: 20, concMgPerMl: 12.5 },
    ],
    prepVolumesByConc: { "1:1": [100, 250, 500], "2:1": [100, 250, 500] },
    prepNote: {
      en: "Diluted in NSS, D5W or D5S",
      th: "ผสมใน NSS, D5W หรือ D5S",
      critical: false,
    },
  },
  {
    id: "adrenaline",
    name: "Adrenaline",
    color: "#feb1dc",
    pMin: 0.01,
    pMax: null,
    conc: ["1:10"],
    defaultP: 0.1,
    defaultConc: "1:10",
    defaultTotal: 100,
    synonyms: ["epinephrine", "adr"],
    ampules: [{ name: "1 mg/mL (1:1000) 1 mL", sizeMl: 1, concMgPerMl: 1 }],
    prepVolumesByConc: { "1:10": [100, 250, 500] },
    prepNote: {
      en: "Diluted in NSS, D5W or D5S",
      th: "ผสมใน NSS, D5W หรือ D5S",
      critical: false,
    },
  },
  {
    id: "levophed",
    name: "Levophed (Norepinephrine)",
    color: "#751be3",
    pMin: 0.01,
    pMax: 3,
    conc: ["8:100", "4:100", "4:250"],
    defaultP: 0.1,
    defaultConc: "4:100",
    defaultTotal: 100,
    synonyms: ["norepi", "norepinephrine", "noradrenaline"],
    ampules: [{ name: "4 mg/4 mL (1 mg/mL)", sizeMl: 4, concMgPerMl: 1 }],
    prepVolumesByConc: { "4:100": [100], "8:100": [100], "4:250": [250, 500] },
    prepNote: {
      en: "Must be diluted in D5W or D5S only",
      th: "ผสมใน D5W หรือ D5S เท่านั้น",
      critical: true,
    },
  },
  {
    id: "primacor",
    name: "Primacor (Milrinone)",
    color: "#d088f7",
    pMin: 0.01,
    pMax: null,
    conc: ["1:5"],
    defaultP: 0.1,
    defaultConc: "1:5",
    defaultTotal: 100,
    synonyms: ["milrinone"],
    ampules: [{ name: "10 mg/10 mL (1 mg/mL)", sizeMl: 10, concMgPerMl: 1 }],
    prepVolumesByConc: { "1:5": [50, 100] },
    prepNote: {
      en: "Diluted in NSS, D5W or D5S",
      th: "ผสมใน NSS, D5W หรือ D5S",
      critical: false,
    },
  },
  {
    id: "ntg",
    name: "NTG (Nitroglycerine)",
    color: "#e87c1e",
    pMin: 1,
    pMax: null,
    conc: ["1:1", "2:1"],
    defaultP: 1.0,
    defaultConc: "1:1",
    defaultTotal: 100,
    synonyms: ["nitroglycerin", "nitroglycerine"],
    ampules: [{ name: "50 mg/10 mL (5 mg/mL)", sizeMl: 10, concMgPerMl: 5 }],
    prepVolumesByConc: { "1:1": [100, 250, 500] /* 2:1 omitted on purpose */ },
    prepNote: {
      en: "Diluted in NSS, D5W or D5S",
      th: "ผสมใน NSS, D5W หรือ D5S",
      critical: false,
    },
  },
];

/* ------------------ Runtime DB state ------------------ */
let DRUGS = DEFAULT_DRUGS.slice();
let DRUG_INDEX = Object.fromEntries(DRUGS.map((d) => [d.id, d]));
const SYNS = {};
for (const d of DRUGS)
  (d.synonyms || []).forEach((s) => (SYNS[s.toLowerCase()] = d.id));
const CANON_TOTALS = [50, 100, 250, 500];

/* ------------------ i18n ------------------ */
let LANG = "en";
const I18N = {
  en: {
    below: "Below min",
    within: "Within range",
    above: "Above max",
    range(min, max, drug) {
      return ` • Range: <b>${min}</b> to <b>${max}</b> mcg/kg/min for ${drug}.`;
    },
    limits(b, conc, pMax, maxRate) {
      return `For weight <b>${b} kg</b> and concentration <b>${conc}</b>, max dose is <b>${pMax} mcg/kg/min</b> → max infusion <b>${maxRate} mL/hr</b>.`;
    },
    noMax(drug) {
      return `No specified maximum dose in table for ${drug}.`;
    },
    modeForward: "mcg/kg/min → mL/hr (Tap to change mode)",
    modeReverse: "mL/hr → mcg/kg/min (Tap to change mode)",
    prepTitle: "Preparation guide",
    ampulesLabel: "Available Portions",
    totalLabel: "Total Solution (mL)",
    volumesLabel: "Volumes",
    drugNeeded: "Drug needed (mL)",
    solventNeeded: "Solvent needed (mL)",
  },
  th: {
    below: "ต่ำกว่าเกณฑ์",
    within: "อยู่ในเกณฑ์",
    above: "สูงกว่าเกณฑ์",
    range(min, max, drug) {
      return ` • ขนาดที่กำหนด: <b>${min}</b> ถึง <b>${max} mcg/kg/min</b> สำหรับ <b>${drug}</b>.`;
    },
    limits(b, conc, pMax, maxRate) {
      return `สำหรับน้ำหนัก <b>${b} kg</b> และความเข้มข้น <b>${conc}</b>, Dose สูงสุดคือ <b>${pMax} mcg/kg/min</b> → Infusion rate สูงสุด <b>${maxRate} mL/hr</b>.`;
    },
    noMax(drug) {
      return `ไม่มีการระบุขนาดยาสูงสุดในตารางสำหรับ ${drug}.`;
    },
    modeForward: "mcg/kg/min → mL/hr (กดเพื่อเปลี่ยนโหมด)",
    modeReverse: "mL/hr → mcg/kg/นาที (กดเพื่อเปลี่ยนโหมด)",
    prepTitle: "วิธีการเตรียมยา",
    ampulesLabel: "เลือกขนาดยา",
    totalLabel: "ปริมาตรเต็ม (mL)",
    volumesLabel: "ปริมาตรที่คำนวณได้",
    drugNeeded: "ปริมาตรยาที่ใช้ (mL)",
    solventNeeded: "ปริมาตรสารละลายที่ใช้ (mL)",
  },
};
const dict = () => (LANG === "th" ? I18N.th : I18N.en);
const normalizeLang = (s) =>
  ["th", "thai", "th-th"].includes((s || "").toLowerCase()) ? "th" : "en";

/* ------------------ DB fetch (Apps Script JSON) ------------------ */
const DB_URL =
  "https://script.google.com/macros/s/AKfycbx-Hj2g-8aeN72dM6XJtbOnwyZ9MivBXGBlVEF70XKtkT7O14KfBEAetHIHrCOLRp1ayA/exec";

const SHEET_PUBLIC_URL =
  "https://docs.google.com/spreadsheets/d/1FlAeLOLXkIFDQg41GQ4WKPD_IaIx_nYZb28lPL4ttrA";

async function fetchDbJson() {
  const res = await fetch(DB_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch DB failed: ${res.status}`);
  const data = await res.json();
  if (!data || !Array.isArray(data.drugs)) throw new Error("Bad DB payload");
  return data; // { schemaVersion, dataVersion, drugs }
}

/* ------------------ Tiny DB status + refresh UI ------------------ */
let DB_META = { source: "builtin", lastUpdated: null, version: null };
let DB_STATUS_STATE = "local";
let dbLoading = false;

function formatStamp(isoLike) {
  try {
    const d = new Date(isoLike);
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (sec < 10) return "just now";
    if (sec < 60) return `${sec}s ago`;
    const mins = Math.floor(sec / 60);
    if (mins < 60) return mins === 1 ? "1 min ago" : `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs === 1 ? "1 hour ago" : `${hrs} hours ago`;
    const days = Math.floor(hrs / 24);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  } catch {
    return String(isoLike);
  }
}

function setDbStatus(state, detail) {
  DB_STATUS_STATE = state;

  const dot = document.getElementById("dbDot");
  const txt = document.getElementById("dbText");
  const btn = document.getElementById("dbRefreshBtn");
  if (!dot || !txt || !btn) return;

  if (state === "loading") {
    dot.className = "dot local";
    txt.textContent = "Loading database…";
    btn.disabled = true;
  } else if (state === "live") {
    dot.className = "dot live";
    const when = DB_META.lastUpdated
      ? formatStamp(DB_META.lastUpdated)
      : "just now";
    txt.textContent = `Live • updated ${when}`;
    btn.disabled = false;
  } else if (state === "local") {
    dot.className = "dot local";
    txt.textContent = "Offline • using built-in data";
    btn.disabled = false;
  } else if (state === "error") {
    dot.className = "dot err";
    txt.textContent = detail || "Failed to load DB";
    btn.disabled = false;
  }
}

function initDbBar() {
  const btn = document.getElementById("dbRefreshBtn");
  if (btn) btn.addEventListener("click", () => refreshDatabase(true));

  // NEW: make the left side clickable (and keyboard accessible)
  const left = document.querySelector("#dbBar .dbbar-left");
  if (left && !left._wired) {
    const openSheet = (e) => {
      // Open the public Google Sheet in a new tab, safely
      window.open(SHEET_PUBLIC_URL, "_blank", "noopener,noreferrer");
      e.preventDefault();
    };
    left.addEventListener("click", openSheet);
    left.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") openSheet(e);
    });
    left.setAttribute("role", "link");
    left.setAttribute("tabindex", "0");
    left.setAttribute("title", "Open the public Google Sheet");
    left.style.cursor = "pointer";
    left._wired = true;
  }

  setDbStatus("local");
  // keep “updated X ago” fresh while live
  setInterval(() => {
    if (DB_STATUS_STATE === "live") setDbStatus("live");
  }, 30_000);
}

/* ------------------ DOM helpers ------------------ */
const $ = (id) => document.getElementById(id);
const drugSel = $("drug"),
  concSel = $("conc"),
  drugChip = $("drugChip");
const modeBtn = $("modeBtn");
const forwardDiv = $("forward"),
  reverseDiv = $("reverse");
const P = $("P"),
  B = $("B"),
  Qf = $("Qf"),
  Rate = $("Rate");
const RateIn = $("RateIn"),
  Qr = $("Qr"),
  Pout = $("Pout");
const resTitle = $("resTitle"),
  resValue = $("resValue"),
  limits = $("limits"),
  rangeNote = $("rangeNote");
const shareLink = $("shareLink"),
  copyBtn = $("copyBtn"),
  qrBtn = $("qrBtn");
const qrContainer = $("qrcode");
const ampuleGroup = $("ampuleGroup");
const totalGroup = $("totalGroup");
const outDrugMl = $("outDrugMl");
const outSolventMl = $("outSolventMl");
const prepNoteEl = $("prepNote");

function setLangAttr(el, lang) {
  if (el) el.setAttribute("lang", lang || "en");
}

/* ------------------ Prep UI + helpers ------------------ */
let mode = "forward";
let booting = true;
let prepState = { ampIndex: null, total: null };

function ratioToMgPerMl(concStr) {
  if (!concStr) return null;
  const [mg, ml] = concStr.split(":").map(Number);
  if (!isFinite(mg) || !isFinite(ml) || ml === 0) return null;
  return mg / ml;
}
function computePrepOutputs(amp, concStr, totalMl) {
  const mgPerMl = ratioToMgPerMl(concStr);
  if (!amp || !isFinite(totalMl) || !mgPerMl) return null;
  const requiredMg = mgPerMl * totalMl;
  const drugMl = requiredMg / amp.concMgPerMl;
  const solventMl = totalMl - drugMl;
  return { drugMl, solventMl };
}
function chooseDefaultTotal(drug, conc) {
  const allowedArr = drug.prepVolumesByConc?.[conc] || [];
  const allowed = new Set(allowedArr);
  if (drug.defaultTotal != null && allowed.has(drug.defaultTotal))
    return drug.defaultTotal;
  for (const t of CANON_TOTALS) if (allowed.has(t)) return t;
  return null;
}
function clear(el) {
  while (el && el.firstChild) el.removeChild(el.firstChild);
}
function makeChip(value, isActive, onClick, disabled = false) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chipbtn" + (!disabled && isActive ? " active" : "");
  b.textContent = value;
  if (disabled) {
    b.disabled = true;
    b.setAttribute("aria-disabled", "true");
    b.tabIndex = -1;
    b.title = "Not available for this concentration";
  } else {
    b.setAttribute("aria-pressed", isActive ? "true" : "false");
    b.addEventListener("click", onClick);
  }
  return b;
}
function refreshPrepUI() {
  clear(ampuleGroup);
  clear(totalGroup);
  outDrugMl.value = "";
  outSolventMl.value = "";

  const d = DRUG_INDEX[drugSel.value];
  const conc = concSel.value;
  if (!d) return;
  if (!d.ampules || !d.ampules.length) return;

  if (prepState.ampIndex == null || !d.ampules[prepState.ampIndex])
    prepState.ampIndex = 0;

  d.ampules.forEach((amp, ix) => {
    ampuleGroup.appendChild(
      makeChip(amp.name, ix === prepState.ampIndex, () => {
        prepState.ampIndex = ix;
        const allowed = new Set(d.prepVolumesByConc?.[conc] || []);
        if (!allowed.has(prepState.total))
          prepState.total = chooseDefaultTotal(d, conc);
        refreshPrepUI();
      })
    );
  });

  const allowed = new Set((d.prepVolumesByConc || {})[conc] || []);
  if (!prepState.total || !allowed.has(prepState.total))
    prepState.total = chooseDefaultTotal(d, conc);

  CANON_TOTALS.forEach((t) => {
    const isAllowed = allowed.has(t);
    totalGroup.appendChild(
      makeChip(
        String(t),
        t === prepState.total,
        () => {
          if (!isAllowed) return;
          prepState.total = t;
          refreshPrepUI();
        },
        !isAllowed
      )
    );
  });

  if (prepNoteEl) {
    const note = d.prepNote
      ? LANG === "th"
        ? d.prepNote.th
        : d.prepNote.en
      : "";
    prepNoteEl.textContent = note || "";
    prepNoteEl.classList.toggle(
      "critical",
      !!(d.prepNote && d.prepNote.critical)
    );
    setLangAttr(prepNoteEl, LANG);
  }

  writeComputedOutputs(d);
}
function writeComputedOutputs(drug) {
  outDrugMl.value = "";
  outSolventMl.value = "";
  const conc = concSel.value;
  const total = prepState.total;
  const amp = drug.ampules?.[prepState.ampIndex];
  const res = computePrepOutputs(amp, conc, total);
  if (!res) return;
  outDrugMl.value = to1(res.drugMl);
  outSolventMl.value = to1(res.solventMl);
}

/* ------------------ Utils ------------------ */
const to2 = (x) => (Number.isFinite(+x) ? (+x).toFixed(2) : "");
const to1 = (x) => (Number.isFinite(+x) ? (+x).toFixed(1) : "");
const to3 = (x) => (Number.isFinite(+x) ? (+x).toFixed(3) : "");
const parseNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/* ------------------ Core math ------------------ */
const computeQ = (B, A) => (0.06 * B) / A;
const computeRate = (P, Q) => P * Q;
const computeP = (rate, Q) => rate / Q;
function pWithinRange(p, d) {
  if (p == null || !isFinite(p)) return null;
  if (d.pMax == null) return p >= d.pMin ? "ok" : "low";
  if (p < d.pMin) return "low";
  if (p > d.pMax) return "high";
  return "ok";
}

/* ------------------ URL parsing ------------------ */
function normalizeSlug(s) {
  if (!s) return null;
  s = s.trim().toLowerCase();
  if (SYNS[s]) s = SYNS[s];
  return s;
}
function parseHashParts() {
  const raw = (location.hash || "").replace(/^#/, "");
  if (!raw) return { path: "", qs: "" };
  if (raw.startsWith("/")) {
    const ix = raw.indexOf("?");
    return ix >= 0
      ? { path: raw.slice(1, ix), qs: raw.slice(ix + 1) }
      : { path: raw.slice(1), qs: "" };
  }
  if (raw.startsWith("?")) return { path: "", qs: raw.slice(1) };
  if (raw.includes("=")) return { path: "", qs: raw };
  return { path: raw, qs: "" };
}
function getParamsFromURL() {
  const url = new URL(location.href);
  let drug = normalizeSlug(
    url.searchParams.get("drug") ||
      url.searchParams.get("med") ||
      url.searchParams.get("medicine")
  );
  let modeRaw =
    url.searchParams.get("mode") ||
    url.searchParams.get("m") ||
    url.searchParams.get("reverse") ||
    url.searchParams.get("rev");
  let concRaw =
    url.searchParams.get("conc") ||
    url.searchParams.get("concentration") ||
    url.searchParams.get("a");
  let pRaw = url.searchParams.get("p") || url.searchParams.get("dose");
  let bRaw =
    url.searchParams.get("b") ||
    url.searchParams.get("wt") ||
    url.searchParams.get("weight");
  let rateRaw =
    url.searchParams.get("rate") ||
    url.searchParams.get("mlhr") ||
    url.searchParams.get("mlh") ||
    url.searchParams.get("r");
  let langRaw =
    url.searchParams.get("lang") ||
    url.searchParams.get("language") ||
    url.searchParams.get("locale");

  const { path, qs } = parseHashParts();
  const hashParams = new URLSearchParams(qs || "");
  if (!drug)
    drug =
      normalizeSlug(path) ||
      normalizeSlug(
        hashParams.get("drug") ||
          hashParams.get("med") ||
          hashParams.get("medicine")
      );
  if (modeRaw == null)
    modeRaw =
      hashParams.get("mode") ||
      hashParams.get("m") ||
      hashParams.get("reverse") ||
      hashParams.get("rev");
  if (concRaw == null)
    concRaw =
      hashParams.get("conc") ||
      hashParams.get("concentration") ||
      hashParams.get("a");
  if (pRaw == null) pRaw = hashParams.get("p") || hashParams.get("dose");
  if (bRaw == null)
    bRaw =
      hashParams.get("b") || hashParams.get("wt") || hashParams.get("weight");
  if (rateRaw == null)
    rateRaw =
      hashParams.get("rate") ||
      hashParams.get("mlhr") ||
      hashParams.get("mlh") ||
      hashParams.get("r");
  if (langRaw == null)
    langRaw =
      hashParams.get("lang") ||
      hashParams.get("language") ||
      hashParams.get("locale");

  if (!drug) {
    const segs = (url.pathname || "").split("/").filter(Boolean);
    if (segs.length) drug = normalizeSlug(segs[segs.length - 1]);
  }
  const modeVal = (() => {
    const s = (modeRaw || "").toString().toLowerCase();
    if (["reverse", "rev", "r", "1", "true", "yes", "on"].includes(s))
      return "reverse";
    return "forward";
  })();

  const conc = concRaw ? concRaw.replace(/\s+/g, "") : null;
  const p = parseNum(pRaw);
  const b = parseNum(bRaw);
  const rate = parseNum(rateRaw);
  const lang = normalizeLang(langRaw || LANG);
  return { drug, mode: modeVal, conc, p, b, rate, lang };
}

/* ------------------ Share URL ------------------ */
function buildShareParams() {
  const params = new URLSearchParams();
  params.set("drug", drugSel.value);
  params.set("mode", mode);
  params.set("lang", LANG);
  if (concSel.value) params.set("conc", concSel.value);
  if (mode === "forward") {
    if (P.value) params.set("p", to2(P.value));
    if (B.value) params.set("b", to1(B.value));
    if (Rate.value) params.set("rate", to2(Rate.value));
  } else {
    if (RateIn.value) params.set("rate", to2(RateIn.value));
    if (B.value) params.set("b", to1(B.value));
    if (Pout.value) params.set("p", to2(Pout.value));
  }
  return params;
}
function buildURLWithParams() {
  const url = new URL(location.href);
  url.search = buildShareParams().toString();
  url.hash = "";
  return url.toString();
}
let urlTimer = null;
const URL_DEBOUNCE_MS = 250;
function writeURLFromState_query() {
  history.replaceState(null, "", buildURLWithParams());
}
function scheduleURLUpdate() {
  clearTimeout(urlTimer);
  urlTimer = setTimeout(writeURLFromState_query, URL_DEBOUNCE_MS);
}
function updateShareLink() {
  if (shareLink) shareLink.value = buildURLWithParams();
}

/* ------------------ UI & state ------------------ */
function populateConcs() {
  const d = DRUG_INDEX[drugSel.value];
  concSel.innerHTML = "";
  const fromDrug = Array.isArray(d?.conc) ? d.conc : [];
  const fromPrep = Object.keys(d?.prepVolumesByConc || {});
  Array.from(new Set([...fromDrug, ...fromPrep])).forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    concSel.appendChild(opt);
  });
}
function populateDrugOptions() {
  drugSel.innerHTML = "";
  for (const d of DRUGS) {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.name;
    drugSel.appendChild(opt);
  }
}
function updateChip() {
  const d = DRUG_INDEX[drugSel.value];
  if (drugChip) {
    drugChip.style.background = d ? d.color : "#444";
    drugChip.title = d ? d.name : "";
  }
}
function parseA() {
  const [x, y] = (concSel.value || "1:1").split(":").map(Number);
  return x / y;
}
function showMode(newMode) {
  mode = newMode;
  forwardDiv.style.display = mode === "forward" ? "" : "none";
  reverseDiv.style.display = mode === "reverse" ? "" : "none";
  modeBtn.classList.toggle("active", mode === "reverse");
  const D = dict();
  modeBtn.textContent = mode === "forward" ? D.modeForward : D.modeReverse;
  setLangAttr(modeBtn, LANG);
}
function setIfProvided(inputEl, val, fmt) {
  if (val == null || !isFinite(val)) return;
  inputEl.value = fmt ? fmt(val) : val;
}

/* --------- Apply per-drug defaults (dose + concentration) --------- */
function applyDrugDefaults(force = false) {
  const d = DRUG_INDEX[drugSel.value];
  if (!d) return;
  const allowed = Array.from(concSel.options).map((o) => o.value);
  if (force || !concSel.value || !allowed.includes(concSel.value)) {
    if (d.defaultConc && allowed.includes(d.defaultConc))
      concSel.value = d.defaultConc;
  }
  if (force || !P.value) {
    if (d.defaultP != null) P.value = to2(d.defaultP);
  }
}

/* ------------------ Recalc ------------------ */
function recalc() {
  const d = DRUG_INDEX[drugSel.value];
  const A = parseA();
  const D = dict();

  const b = Number(B.value);
  const Q = computeQ(b, A);

  if (mode === "forward") {
    const p = Number(P.value);
    Qf.value = isFinite(Q) ? to3(Q) : "";
    const rate = computeRate(p, Q);
    Rate.value = isFinite(rate) ? to2(rate) : "";
    resTitle.textContent = "Infusion rate (mL/hr)";
    resValue.textContent = isFinite(rate) ? `${to2(rate)} mL/hr` : "—";
    if (d.pMax != null && isFinite(Q)) {
      const maxRate = computeRate(d.pMax, Q);
      limits.innerHTML = D.limits(
        isFinite(b) ? to1(b) : "—",
        concSel.value,
        d.pMax.toFixed(2),
        to2(maxRate)
      );
    } else {
      limits.textContent = D.noMax(d.name);
    }
    const status = pWithinRange(p, d);
    rangeNote.innerHTML = rangeLine(d, status);
  } else {
    const rateIn = Number(RateIn.value);
    Qr.value = isFinite(Q) ? to3(Q) : "";
    const p = computeP(rateIn, Q);
    Pout.value = isFinite(p) ? to2(p) : "";
    resTitle.textContent = "Required Dose (mcg/kg/min)";
    resValue.textContent = isFinite(p) ? `${to2(p)} mcg/kg/min` : "—";
    if (d.pMax != null && isFinite(Q)) {
      const maxRate = computeRate(d.pMax, Q);
      limits.innerHTML = D.limits(
        isFinite(b) ? to1(b) : "—",
        concSel.value,
        d.pMax.toFixed(2),
        to2(maxRate)
      );
    } else {
      limits.textContent = D.noMax(d.name);
    }
    const status = pWithinRange(p, d);
    rangeNote.innerHTML = rangeLine(d, status);
  }
  setLangAttr(rangeNote, LANG);
  setLangAttr(limits, LANG);

  if (!booting) {
    updateShareLink();
    scheduleURLUpdate();
  }
}
function rangeLine(d, status) {
  const D = dict();
  const minTxt = d.pMin != null ? d.pMin.toFixed(2) : "—";
  const maxTxt = d.pMax != null ? d.pMax.toFixed(2) : "no max";
  const cls = status === "high" ? "bad" : status === "low" ? "warn" : "ok";
  const label =
    status === "high" ? D.above : status === "low" ? D.below : D.within;
  return `<span class="${cls}">${label}</span>${D.range(
    minTxt,
    maxTxt,
    d.name
  )}`;
}

/* ------------------ QR generation ------------------ */
function downloadQRForCurrentLink() {
  const urlToEncode = buildURLWithParams();
  if (!window.QRCode) {
    alert("QR generator not loaded.");
    return;
  }
  qrContainer.innerHTML = "";
  const qr = new QRCode(qrContainer, {
    text: urlToEncode,
    width: 512,
    height: 512,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
  setTimeout(() => {
    let dataUrl = "";
    const canvas = qrContainer.querySelector("canvas");
    if (canvas && canvas.toDataURL) dataUrl = canvas.toDataURL("image/png");
    else {
      const img = qrContainer.querySelector("img");
      if (img && img.src) dataUrl = img.src;
    }
    if (!dataUrl) {
      alert("Failed to generate QR image.");
      return;
    }
    const fname = `infusion-qr_${drugSel.value}_${mode}.png`;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = fname;
    if (typeof a.download === "undefined") window.open(dataUrl, "_blank");
    else {
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, 0);
}

/* ------------------ Events ------------------ */
function attachEvents() {
  [drugSel, concSel, P, RateIn, B].forEach((el) =>
    el.addEventListener("input", recalc)
  );

  modeBtn.addEventListener("click", () => {
    showMode(mode === "forward" ? "reverse" : "forward");
    recalc();
  });

  drugSel.addEventListener("change", () => {
    populateConcs();
    updateChip();
    applyDrugDefaults(true);
    recalc();
    prepState = { ampIndex: null, total: null };
    refreshPrepUI();
  });

  concSel.addEventListener("input", () => {
    recalc();
    refreshPrepUI();
  });

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(shareLink.value);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy link"), 1200);
    } catch {
      shareLink.select();
      document.execCommand && document.execCommand("copy");
    }
  });

  qrBtn.addEventListener("click", downloadQRForCurrentLink);

  window.addEventListener("popstate", () => {
    booting = true;
    hydrateFromURL();
    booting = false;
    recalc();
    refreshPrepUI();
  });
  window.addEventListener("hashchange", () => {
    booting = true;
    hydrateFromURL();
    booting = false;
    recalc();
    refreshPrepUI();
  });
}

/* ------------------ Hydration + i18n text ------------------ */
function localizePrepSection() {
  const D = dict();
  const prepTitleEl = document.querySelector("#prep summary strong");
  if (prepTitleEl) {
    prepTitleEl.textContent = D.prepTitle;
    setLangAttr(prepTitleEl, LANG);
  }
  const rowLabels = document.querySelectorAll("#prep .prep-row .row-label");
  if (rowLabels[0]) {
    rowLabels[0].textContent = D.ampulesLabel;
    setLangAttr(rowLabels[0], LANG);
  }
  if (rowLabels[1]) {
    rowLabels[1].textContent = D.totalLabel;
    setLangAttr(rowLabels[1], LANG);
  }
  if (rowLabels[2]) {
    rowLabels[2].textContent = D.volumesLabel;
    setLangAttr(rowLabels[2], LANG);
  }
  const volLabels = document.querySelectorAll(".prep-outputs label");
  if (volLabels[0]) {
    volLabels[0].textContent = D.drugNeeded;
    setLangAttr(volLabels[0], LANG);
  }
  if (volLabels[1]) {
    volLabels[1].textContent = D.solventNeeded;
    setLangAttr(volLabels[1], LANG);
  }
}
function hydrateFromURL() {
  const { drug, mode: m, conc, p, b, rate, lang } = getParamsFromURL();
  LANG = normalizeLang(lang);
  localizePrepSection();

  const dId = drug && DRUG_INDEX[drug] ? drug : DRUGS[0].id;
  drugSel.value = dId;
  populateConcs();
  updateChip();

  showMode(m);
  applyDrugDefaults(false);
  if (conc && Array.from(concSel.options).some((o) => o.value === conc))
    concSel.value = conc;

  setIfProvided(B, b, to1);
  if (mode === "forward") {
    setIfProvided(P, p, to2);
    if (rate != null && isFinite(rate)) Rate.value = to2(rate);
  } else {
    setIfProvided(RateIn, rate, to2);
    if (p != null && isFinite(p)) Pout.value = to2(p);
  }
}

/* ------------------ Swap DB (preserve selection) ------------------ */
function rebuildSyns() {
  for (const k of Object.keys(SYNS)) delete SYNS[k];
  for (const d of DRUGS)
    (d.synonyms || []).forEach((s) => (SYNS[s.toLowerCase()] = d.id));
}
function swapDbAndRefresh(newDrugs) {
  const prevDrug = drugSel.value;
  const prevConc = concSel.value;

  DRUGS = newDrugs.slice();
  DRUG_INDEX = Object.fromEntries(DRUGS.map((d) => [d.id, d]));
  rebuildSyns();

  populateDrugOptions();
  drugSel.value = DRUG_INDEX[prevDrug] ? prevDrug : DRUGS[0]?.id || "";
  populateConcs();
  if (Array.from(concSel.options).some((o) => o.value === prevConc))
    concSel.value = prevConc;
  updateChip();
  applyDrugDefaults(false);
  refreshPrepUI();
  recalc();
}

/* ------------------ JSON DB validation (log-only) ------------------ */
function validateDB(drugs) {
  const problems = [];
  const ids = new Set();
  for (const d of drugs) {
    if (!d.id) problems.push(`Drug missing id`);
    if (ids.has(d.id)) problems.push(`Duplicate id: ${d.id}`);
    ids.add(d.id);
    if (d.pMax === 0)
      problems.push(`Suspicious pMax=0 for ${d.id}. Leave blank for "no max".`);
    for (const c of d.conc || []) {
      if (!/^\d+(\.\d+)?:\d+(\.\d+)?$/.test(c))
        problems.push(`Bad conc "${c}" in ${d.id}`);
    }
    for (const c of Object.keys(d.prepVolumesByConc || {})) {
      if (!/^\d+(\.\d+)?:\d+(\.\d+)?$/.test(c))
        problems.push(`Bad prep conc "${c}" in ${d.id}`);
      const totals = d.prepVolumesByConc[c] || [];
      if (totals.some((t) => !(Number.isInteger(t) && t > 0))) {
        problems.push(
          `Bad totals for ${d.id} @ ${c}: ${JSON.stringify(totals)}`
        );
      }
    }
    if (
      Object.keys(d.prepVolumesByConc || {}).length &&
      (!d.ampules || !d.ampules.length)
    ) {
      problems.push(`No ampules for ${d.id} but prep totals exist.`);
    }
  }
  if (problems.length)
    console.warn(
      `[schema] ${problems.length} issues:\n - ` + problems.join("\n - ")
    );
  return problems.length === 0;
}

/* ------------------ Refresh flow ------------------ */
async function refreshDatabase(manual = false) {
  if (dbLoading) return;
  dbLoading = true;
  setDbStatus("loading");

  try {
    const data = await fetchDbJson();
    if (validateDB(data.drugs)) {
      swapDbAndRefresh(data.drugs);
      DB_META = {
        source: "remote",
        lastUpdated: data.dataVersion || new Date().toISOString(),
        version: data.schemaVersion ?? null,
      };
      setDbStatus("live");
    } else {
      console.warn("DB validation problems; keeping current data.");
      setDbStatus("error", "Validation issues (see console)");
    }
  } catch (e) {
    console.warn("DB refresh failed:", e);
    if (manual) alert("Failed to refresh database.\nUsing built-in data.");
    if (DRUGS === DEFAULT_DRUGS) setDbStatus("local");
    else setDbStatus("error", "Refresh failed");
  } finally {
    dbLoading = false;
  }
}

/* ------------------ Init (instant UI, then upgrade DB) ------------------ */
function initInstantUI() {
  // Start with built-in data so UI is responsive immediately
  DRUGS = DEFAULT_DRUGS.slice();
  DRUG_INDEX = Object.fromEntries(DRUGS.map((d) => [d.id, d]));

  initDbBar(); // in-card status bar (requires HTML snippet)
  populateDrugOptions();
  attachEvents();
  hydrateFromURL();
  localizePrepSection();
  booting = false;
  refreshPrepUI();
  recalc();
  updateShareLink();
}

async function init() {
  initInstantUI(); // render instantly with built-in data
  refreshDatabase(); // then upgrade asynchronously to the live DB
}

init();
