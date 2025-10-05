/* ------------------ Unified drug database ------------------ */
const DRUGS = [
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

const DRUG_INDEX = Object.fromEntries(DRUGS.map((d) => [d.id, d]));

// Always show these totals in the UI
const CANON_TOTALS = [50, 100, 250, 500];

// Build URL synonym map dynamically from the unified DB
const SYNS = {};
for (const d of DRUGS) {
  (d.synonyms || []).forEach((s) => (SYNS[s.toLowerCase()] = d.id));
}

// We’re now 100% computed-prep; no legacy PREP_DATA required
const USE_COMPUTED_PREP = true;

/* ---------- i18n (English / Thai) ---------- */
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

    // NEW
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
    modeReverse: "mL/hr → mcg/kg/min (กดเพื่อเปลี่ยนโหมด)",

    // NEW
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

function localizePrepSection() {
  const D = dict();

  // Title inside the <summary>
  const prepTitleEl = document.querySelector("#prep summary strong");
  if (prepTitleEl) {
    prepTitleEl.textContent = D.prepTitle;
    setLangAttr(prepTitleEl, LANG);
  }

  // Three row labels (ordered): ampules, total, volumes
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

  // The two inner labels under "Volumes"
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

function ratioToMgPerMl(concStr) {
  if (!concStr) return null;
  const [mg, ml] = concStr.split(":").map(Number);
  if (!isFinite(mg) || !isFinite(ml) || ml === 0) return null;
  return mg / ml; // mg per mL
}

function computePrepOutputs(amp, concStr, totalMl) {
  const mgPerMl = ratioToMgPerMl(concStr);
  if (!amp || !isFinite(totalMl) || !mgPerMl) return null;
  const requiredMg = mgPerMl * totalMl; // mg needed in the bag
  const drugMl = requiredMg / amp.concMgPerMl; // mL to draw from ampule(s)
  const solventMl = totalMl - drugMl; // remainder
  return { drugMl, solventMl };
}

function chooseDefaultTotal(drug, conc) {
  const allowedArr = drug.prepVolumesByConc?.[conc] || [];
  const allowed = new Set(allowedArr);

  // Prefer the drug's defaultTotal if it's allowed for this conc
  if (drug.defaultTotal != null && allowed.has(drug.defaultTotal)) {
    return drug.defaultTotal;
  }
  // Otherwise pick the first canonical total that is allowed
  for (const t of CANON_TOTALS) {
    if (allowed.has(t)) return t;
  }
  // No allowed totals for this conc
  return null;
}

/* --- Prep DOM --- */
const ampuleGroup = document.getElementById("ampuleGroup");
const totalGroup = document.getElementById("totalGroup");
const outDrugMl = document.getElementById("outDrugMl");
const outSolventMl = document.getElementById("outSolventMl");
const prepNoteEl = document.getElementById("prepNote");

let mode = "forward";
let booting = true;
let prepState = { ampIndex: null, total: null };

function unique(list) {
  return [...new Set(list)];
}
function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function makeChip(value, isActive, onClick, disabled = false) {
  const b = document.createElement("button");
  b.type = "button";

  // Never show "active" for disabled chips
  let cls = "chipbtn";
  if (!disabled && isActive) cls += " active";
  b.className = cls;

  b.textContent = value;

  if (disabled) {
    b.disabled = true;
    b.setAttribute("aria-disabled", "true");
    // Remove pressed semantics & focusability for disabled
    b.removeAttribute("aria-pressed");
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

  // --- Computed path (the only path now) ---
  if (!d.ampules || !d.ampules.length) return;

  // Ampule chips
  if (prepState.ampIndex == null || !d.ampules[prepState.ampIndex]) {
    prepState.ampIndex = 0;
  }
  d.ampules.forEach((amp, ix) => {
    ampuleGroup.appendChild(
      makeChip(amp.name, ix === prepState.ampIndex, () => {
        prepState.ampIndex = ix;
        // keep total if still allowed; otherwise pick a default
        const allowed = new Set(d.prepVolumesByConc?.[conc] || []);
        if (!allowed.has(prepState.total)) {
          prepState.total = chooseDefaultTotal(d, conc);
        }
        refreshPrepUI(); // re-render to update active highlight
      })
    );
  });

  // Totals chips (always show full canonical list, disable when not allowed)
  const allowed = new Set((d.prepVolumesByConc || {})[conc] || []);
  if (!prepState.total || !allowed.has(prepState.total)) {
    prepState.total = chooseDefaultTotal(d, conc);
  }
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
    setLangAttr(prepNoteEl, LANG); // ← add this
  }

  // Outputs
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

function setLangAttr(el, lang) {
  if (el) el.setAttribute("lang", lang || "en");
}

/* ------------------ Core math ------------------ */
const computeQ = (B, A) => (0.06 * B) / A; // mL/hr per (mcg/kg/min)
const computeRate = (P, Q) => P * Q; // mL/hr
const computeP = (rate, Q) => rate / Q; // mcg/kg/min
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
  let path = "",
    qs = "";
  if (!raw) return { path: "", qs: "" };
  if (raw.startsWith("/")) {
    const ix = raw.indexOf("?");
    if (ix >= 0) {
      path = raw.slice(1, ix);
      qs = raw.slice(ix + 1);
    } else {
      path = raw.slice(1);
    }
  } else if (raw.startsWith("?")) {
    qs = raw.slice(1);
  } else if (raw.includes("=")) {
    qs = raw;
  } else {
    path = raw;
  }
  return { path, qs };
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

  // Fallback: hash
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

  // Fallback: path segment
  if (!drug) {
    const segs = (url.pathname || "").split("/").filter(Boolean);
    if (segs.length) {
      drug = normalizeSlug(segs[segs.length - 1]);
    }
  }

  const modeVal = (() => {
    const s = (modeRaw || "").toString().toLowerCase();
    if (["reverse", "rev", "r"].includes(s)) return "reverse";
    if (["1", "true", "yes", "on"].includes(s)) return "reverse";
    return "forward";
  })();

  const conc = concRaw ? concRaw.replace(/\s+/g, "") : null;
  const p = parseNum(pRaw);
  const b = parseNum(bRaw);
  const rate = parseNum(rateRaw);
  const lang = normalizeLang(langRaw || LANG);
  return { drug, mode: modeVal, conc, p, b, rate, lang };
}

/* ------------------ Build & write query URL ------------------ */
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
  const newUrl = buildURLWithParams();
  history.replaceState(null, "", newUrl);
}
function scheduleURLUpdate() {
  clearTimeout(urlTimer);
  urlTimer = setTimeout(writeURLFromState_query, URL_DEBOUNCE_MS);
}
function updateShareLink() {
  shareLink.value = buildURLWithParams();
}

/* ------------------ UI & state ------------------ */
function populateDrugOptions() {
  for (const d of DRUGS) {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.name;
    drugSel.appendChild(opt);
  }
}
function populateConcs() {
  const d = DRUG_INDEX[drugSel.value];
  concSel.innerHTML = "";
  d.conc.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    concSel.appendChild(opt);
  });
}
function updateChip() {
  const d = DRUG_INDEX[drugSel.value];
  drugChip.style.background = d ? d.color : "#444";
  drugChip.title = d ? d.name : "";
}
function parseA() {
  const [x, y] = concSel.value.split(":").map(Number);
  return x / y;
}
function showMode(newMode) {
  mode = newMode;
  forwardDiv.style.display = mode === "forward" ? "" : "none";
  reverseDiv.style.display = mode === "reverse" ? "" : "none";
  modeBtn.classList.toggle("active", mode === "reverse");
  const D = dict();
  modeBtn.textContent = mode === "forward" ? D.modeForward : D.modeReverse;
  setLangAttr(modeBtn, LANG); // ← add this
}

function setIfProvided(inputEl, val, fmt) {
  if (val == null || !isFinite(val)) return;
  inputEl.value = fmt ? fmt(val) : val;
}

/* --------- Apply per-drug defaults (dose + concentration) --------- */
function applyDrugDefaults(force = false) {
  const d = DRUG_INDEX[drugSel.value];
  if (!d) return;

  // concentration default if invalid/missing or forced
  const allowed = Array.from(concSel.options).map((o) => o.value);
  if (force || !concSel.value || !allowed.includes(concSel.value)) {
    if (d.defaultConc && allowed.includes(d.defaultConc)) {
      concSel.value = d.defaultConc;
    }
  }

  // forward-dose default if empty or forced (harmless in reverse)
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

/* ------------------ QR generation & download ------------------ */
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
    applyDrugDefaults(true); // switch to this drug’s defaults
    recalc();
    prepState = { ampIndex: null, total: null }; // reset selection when changing drug
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

/* ------------------ Hydration from URL ------------------ */
function hydrateFromURL() {
  const { drug, mode: m, conc, p, b, rate, lang } = getParamsFromURL();

  // Language (also set <html lang> for Thai font)
  LANG = normalizeLang(lang);
  //   document.documentElement.setAttribute("lang", LANG);
  localizePrepSection(); // <- add this line

  // Drug
  const dId = drug && DRUG_INDEX[drug] ? drug : DRUGS[0].id;
  drugSel.value = dId;
  populateConcs();
  updateChip();

  // Mode
  showMode(m);

  // Apply defaults (only if missing); then override with URL if present/valid
  applyDrugDefaults(false);

  if (conc && Array.from(concSel.options).some((o) => o.value === conc)) {
    concSel.value = conc;
  }

  // Values
  setIfProvided(B, b, to1); // single weight field used in both modes
  if (mode === "forward") {
    setIfProvided(P, p, to2);
    if (rate != null && isFinite(rate)) Rate.value = to2(rate);
  } else {
    setIfProvided(RateIn, rate, to2);
    if (p != null && isFinite(p)) Pout.value = to2(p);
  }
}

/* ------------------ Init ------------------ */
function init() {
  populateDrugOptions();
  attachEvents();
  hydrateFromURL();
  localizePrepSection(); // <- add this line
  booting = false;
  refreshPrepUI();
  recalc();
  updateShareLink();
}
init();
