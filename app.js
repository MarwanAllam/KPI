// ======== STATE & STORAGE ========
const STORAGE_KEY = "retail_kpi_app_v1";

const defaultState = {
  days: [], // each: {date, gas, ocExisting, ocNew, pointsBase, postpaid, adsl, wireless, devices, rules:{}}
  settings: {
    monthDays: 31,
    targets: {
      gas: 0,
      ocExisting: 0,
      ocNew: 0,
      points: 0,
      postpaid: 0,
      homeInternet: 0,
      devices: 0
    },
    qualityScore: 100 // %
  }
};

let state = loadState();
renderAll();

// ======== LOAD / SAVE ========
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultState));
    return JSON.parse(raw);
  } catch {
    return JSON.parse(JSON.stringify(defaultState));
  }
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ======== UTIL ========
const num = (v) => (v === "" || v == null ? 0 : Number(v));

function upsertDay(day) {
  const idx = state.days.findIndex((d) => d.date === day.date);
  if (idx >= 0) state.days[idx] = day;
  else state.days.push(day);
  state.days.sort((a, b) => a.date.localeCompare(b.date));
  saveState();
}

function deleteDay(date) {
  state.days = state.days.filter((d) => d.date !== date);
  saveState();
}

function resetAll() {
  state = JSON.parse(JSON.stringify(defaultState));
  saveState();
}

// ======== DAILY FORM ========
const dailyForm = document.getElementById("daily-form");
const clearDayBtn = document.getElementById("clear-day");
const clearAllBtn = document.getElementById("clear-all");
const daysList = document.getElementById("days-list");

dailyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const day = {
    date: document.getElementById("date").value,
    gas: num(document.getElementById("gas").value),
    ocExisting: num(document.getElementById("ocExisting").value),
    ocNew: num(document.getElementById("ocNew").value),
    pointsBase: num(document.getElementById("pointsBase").value),
    postpaid: num(document.getElementById("postpaid").value),
    adsl: num(document.getElementById("adsl").value),
    wireless: num(document.getElementById("wireless").value),
    devices: num(document.getElementById("devices").value),
    rules: {
      freeMax70Plus: num(document.getElementById("freeMax70Plus").value),
      corpAccounts: num(document.getElementById("corpAccounts").value),
      extraMnpLines: num(document.getElementById("extraMnpLines").value),
      extraPremierLines: num(document.getElementById("extraPremierLines").value),
      sim3to4: num(document.getElementById("sim3to4").value),
      simToEsim: num(document.getElementById("simToEsim").value),
      unqualifiedMnp: num(document.getElementById("unqualifiedMnp").value),
      mnpNotRecharged: num(document.getElementById("mnpNotRecharged").value),
      otherExtraPoints: num(document.getElementById("otherExtraPoints").value)
    }
  };
  if (!day.date) {
    alert("Please choose date.");
    return;
  }
  upsertDay(day);
  renderAll();
  alert("Day saved ✅");
});

clearDayBtn.addEventListener("click", () => {
  const date = document.getElementById("date").value;
  if (!date) return;
  deleteDay(date);
  dailyForm.reset();
  renderAll();
});

clearAllBtn.addEventListener("click", () => {
  if (!confirm("Reset ALL data?")) return;
  resetAll();
  dailyForm.reset();
  renderAll();
});

// load day when clicking from list
function loadDayToForm(date) {
  const d = state.days.find((x) => x.date === date);
  if (!d) return;
  document.getElementById("date").value = d.date;
  document.getElementById("gas").value = d.gas;
  document.getElementById("ocExisting").value = d.ocExisting;
  document.getElementById("ocNew").value = d.ocNew;
  document.getElementById("pointsBase").value = d.pointsBase;
  document.getElementById("postpaid").value = d.postpaid;
  document.getElementById("adsl").value = d.adsl;
  document.getElementById("wireless").value = d.wireless;
  document.getElementById("devices").value = d.devices;

  document.getElementById("freeMax70Plus").value = d.rules.freeMax70Plus || 0;
  document.getElementById("corpAccounts").value = d.rules.corpAccounts || 0;
  document.getElementById("extraMnpLines").value = d.rules.extraMnpLines || 0;
  document.getElementById("extraPremierLines").value = d.rules.extraPremierLines || 0;
  document.getElementById("sim3to4").value = d.rules.sim3to4 || 0;
  document.getElementById("simToEsim").value = d.rules.simToEsim || 0;
  document.getElementById("unqualifiedMnp").value = d.rules.unqualifiedMnp || 0;
  document.getElementById("mnpNotRecharged").value = d.rules.mnpNotRecharged || 0;
  document.getElementById("otherExtraPoints").value = d.rules.otherExtraPoints || 0;
}

// ======== SETTINGS FORM ========
const settingsForm = document.getElementById("settings-form");
settingsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const s = state.settings;
  s.monthDays = num(document.getElementById("monthDays").value) || 31;
  s.targets.gas = num(document.getElementById("targetGas").value);
  s.targets.ocExisting = num(document.getElementById("targetOcExisting").value);
  s.targets.ocNew = num(document.getElementById("targetOcNew").value);
  s.targets.points = num(document.getElementById("targetPoints").value);
  s.targets.postpaid = num(document.getElementById("targetPostpaid").value);
  s.targets.homeInternet = num(document.getElementById("targetHomeInternet").value);
  s.targets.devices = num(document.getElementById("targetDevices").value);
  s.qualityScore = num(document.getElementById("qualityScore").value) || 0;
  saveState();
  renderAll();
  alert("Settings saved ✅");
});

// ======== AGGREGATION ========
function aggregate() {
  const totals = {
    gas: 0,
    ocExisting: 0,
    ocNew: 0,
    pointsBase: 0,
    pointsExtra: 0,
    postpaid: 0,
    adsl: 0,
    wireless: 0,
    devices: 0,

    freeMax70Plus: 0,
    corpAccounts: 0,
    extraMnpLines: 0,
    extraPremierLines: 0,
    sim3to4: 0,
    simToEsim: 0,
    unqualifiedMnp: 0,
    mnpNotRecharged: 0
  };

  state.days.forEach((d) => {
    totals.gas += d.gas;
    totals.ocExisting += d.ocExisting;
    totals.ocNew += d.ocNew;
    totals.postpaid += d.postpaid;
    totals.adsl += d.adsl;
    totals.wireless += d.wireless;
    totals.devices += d.devices;
    totals.pointsBase += d.pointsBase;

    const r = d.rules || {};
    totals.freeMax70Plus += r.freeMax70Plus || 0;
    totals.corpAccounts += r.corpAccounts || 0;
    totals.extraMnpLines += r.extraMnpLines || 0;
    totals.extraPremierLines += r.extraPremierLines || 0;
    totals.sim3to4 += r.sim3to4 || 0;
    totals.simToEsim += r.simToEsim || 0;
    totals.unqualifiedMnp += r.unqualifiedMnp || 0;
    totals.mnpNotRecharged += r.mnpNotRecharged || 0;

    let extraPoints = 0;
    extraPoints += (r.freeMax70Plus || 0) * 3;
    extraPoints += (r.corpAccounts || 0) * 12;
    extraPoints += (r.extraMnpLines || 0) * 10;
    extraPoints += (r.extraPremierLines || 0) * 30;
    extraPoints += (r.sim3to4 || 0) * 1.5;
    extraPoints += (r.simToEsim || 0) * 3;
    extraPoints += (r.otherExtraPoints || 0);
    totals.pointsExtra += extraPoints;
  });

  // adjust GAs with corporate lines and penalties
  totals.gas = totals.gas + totals.corpAccounts - totals.unqualifiedMnp - totals.mnpNotRecharged;
  totals.pointsTotal = totals.pointsBase + totals.pointsExtra;
  totals.homeInternet = totals.adsl + totals.wireless;
  return totals;
}

// ======== DASHBOARD RENDER ========
const kpiCardsContainer = document.getElementById("kpi-cards");
const scoreSummaryEl = document.getElementById("score-summary");
const rulesSummaryEl = document.getElementById("rules-summary");

function renderDashboard() {
  const totals = aggregate();
  const s = state.settings;
  const usedDays = state.days.length;
  const remainingDays = Math.max(s.monthDays - usedDays, 0);

  const KPIs = [
    {
      key: "gas",
      label: "GAs (Lines)",
      target: s.targets.gas,
      achieved: totals.gas,
      weight: 40
    },
    {
      key: "ocExisting",
      label: "OC Existing Wallets",
      target: s.targets.ocExisting,
      achieved: totals.ocExisting,
      weight: 10
    },
    {
      key: "ocNew",
      label: "OC New Wallets",
      target: s.targets.ocNew,
      achieved: totals.ocNew,
      weight: 0
    },
    {
      key: "points",
      label: "Points (Base + Extra)",
      target: s.targets.points,
      achieved: totals.pointsTotal,
      weight: 15
    },
    {
      key: "postpaid",
      label: "Postpaid Lines",
      target: s.targets.postpaid,
      achieved: totals.postpaid,
      weight: 10
    },
    {
      key: "homeInternet",
      label: "Home Internet (ADSL+Wireless)",
      target: s.targets.homeInternet,
      achieved: totals.homeInternet,
      weight: 12
    },
    {
      key: "devices",
      label: "Devices",
      target: s.targets.devices,
      achieved: totals.devices,
      weight: 5
    }
  ];

  kpiCardsContainer.innerHTML = "";
  let totalWeighted = 0;

  KPIs.forEach((kpi) => {
    const pct = kpi.target > 0 ? kpi.achieved / kpi.target : 0;
    const pctDisplay = (pct * 100).toFixed(1) + "%";
    const remaining = kpi.target - kpi.achieved;
    const needPerDay =
      remaining > 0 && remainingDays > 0 ? (remaining / remainingDays).toFixed(2) : 0;

    let statusClass = "status-below";
    let statusText = "Below Target";
    if (pct >= 1.1) {
      statusClass = "status-over";
      statusText = "Over Target";
    } else if (pct >= 1) {
      statusClass = "status-achieved";
      statusText = "Achieved";
    } else if (pct >= 0.8) {
      statusClass = "status-track";
      statusText = "On Track";
    }

    const weightedScore = pct * kpi.weight;
    totalWeighted += weightedScore;

    const card = document.createElement("div");
    card.className = "kpi-card";
    card.innerHTML = `
      <h4>${kpi.label}</h4>
      <div class="kpi-main">${kpi.achieved.toFixed(2)}</div>
      <div class="kpi-sub">
        Target: <span class="highlight">${kpi.target}</span> •
        Achieved: <span class="highlight">${pctDisplay}</span><br/>
        Remaining: ${remaining.toFixed(2)} • Need / day: ${needPerDay}
      </div>
      <div class="kpi-status ${statusClass}">${statusText}</div>
      <div class="kpi-sub small">Weighted Score: ${weightedScore.toFixed(2)} / ${kpi.weight}</div>
    `;
    kpiCardsContainer.appendChild(card);
  });

  // Quality KPI
  const qualityPct = state.settings.qualityScore / 100;
  const qualityWeight = 8;
  const qualityScore = qualityPct * qualityWeight;
  totalWeighted += qualityScore;

  // Clawbacks
  const postpaidPct =
    KPIs.find((k) => k.key === "postpaid").target > 0
      ? KPIs.find((k) => k.key === "postpaid").achieved /
        KPIs.find((k) => k.key === "postpaid").target
      : 0;
  const homePct =
    KPIs.find((k) => k.key === "homeInternet").target > 0
      ? KPIs.find((k) => k.key === "homeInternet").achieved /
        KPIs.find((k) => k.key === "homeInternet").target
      : 0;

  let clawback = 0;
  if (postpaidPct < 1) clawback += 0.05;
  if (homePct < 1) clawback += 0.05;
  if (state.settings.qualityScore < 92) clawback += 0.1;

  const finalScore = totalWeighted < 80 ? 0 : totalWeighted * (1 - clawback);

  let paymentNote = "Full Eligible";
  if (totalWeighted < 80) paymentNote = "Score < 80 → No Payment";
  else if (clawback > 0)
    paymentNote = `Clawback applied: ${(clawback * 100).toFixed(1)}%`;

  scoreSummaryEl.innerHTML = `
    <p>Total Weighted Score (before clawback): 
      <span class="highlight">${totalWeighted.toFixed(2)} / 100</span>
    </p>
    <p>Quality Score: <span class="highlight">${state.settings.qualityScore.toFixed(
      1
    )}%</span> (Weight 8% → ${qualityScore.toFixed(2)})</p>
    <p>Clawback %: <span class="highlight">${(clawback * 100).toFixed(1)}%</span></p>
    <p>Final Score (after clawback): 
      <span class="highlight">${finalScore.toFixed(2)}</span>
    </p>
    <p class="small">${paymentNote}</p>
    <p class="small">Used days: ${usedDays} • Remaining days: ${remainingDays}</p>
  `;

  // Rules summary
  rulesSummaryEl.innerHTML = `
    <p>Total extra points from rules: 
      <span class="highlight">${aggregate().pointsExtra.toFixed(2)}</span></p>
    <p>FREEmax 70+ lines: ${totals.freeMax70Plus}</p>
    <p>New Corporate Accounts: ${totals.corpAccounts} (also added to GAs)</p>
    <p>MNP lines after target: ${totals.extraMnpLines}</p>
    <p>Extra PREMIER lines over achievement: ${totals.extraPremierLines}</p>
    <p>SIM 3G→4G: ${totals.sim3to4} • SIM→eSIM: ${totals.simToEsim}</p>
    <p>Unqualified MNP: ${totals.unqualifiedMnp} (-GAs) • MNP not recharged: ${
    totals.mnpNotRecharged
  } (not counted in GAs)</p>
  `;
}

// ======== DAYS LIST RENDER ========
function renderDaysList() {
  daysList.innerHTML = "";
  state.days.forEach((d) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${d.date}</span>
      <span>
        GAs: ${d.gas} • Pts: ${(d.pointsBase || 0).toFixed(1)}
        <button data-date="${d.date}">Open</button>
      </span>
    `;
    daysList.appendChild(li);
  });

  daysList.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      loadDayToForm(btn.dataset.date);
      switchTab("daily");
    });
  });
}

// ======== SETTINGS RENDER ========
function renderSettingsForm() {
  const s = state.settings;
  document.getElementById("monthDays").value = s.monthDays;
  document.getElementById("targetGas").value = s.targets.gas;
  document.getElementById("targetOcExisting").value = s.targets.ocExisting;
  document.getElementById("targetOcNew").value = s.targets.ocNew;
  document.getElementById("targetPoints").value = s.targets.points;
  document.getElementById("targetPostpaid").value = s.targets.postpaid;
  document.getElementById("targetHomeInternet").value = s.targets.homeInternet;
  document.getElementById("targetDevices").value = s.targets.devices;
  document.getElementById("qualityScore").value = s.qualityScore;
}

// ======== TABS ========
const tabButtons = document.querySelectorAll(".tab-button");
const tabs = document.querySelectorAll(".tab");

tabButtons.forEach((btn) =>
  btn.addEventListener("click", () => switchTab(btn.dataset.tab))
);

function switchTab(name) {
  tabButtons.forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  tabs.forEach((t) => t.classList.toggle("active", t.id === `tab-${name}`));
}

// ======== MAIN RENDER ========
function renderAll() {
  renderDaysList();
  renderSettingsForm();
  renderDashboard();
}

// ======== PWA SERVICE WORKER ========
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").catch(() => {});
}
