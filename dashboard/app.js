/* Chatter dashboard — demo, all data is fake / editable. Everything is scoped to the current shift. */

function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const MODEL_NAME_POOL = ["Kira Storm", "Aria Vale", "Nova Sky", "Luna Rae", "Mia Chase", "Zoe Blake", "Ivy Rose", "Skye Ellis"];
const MODEL_PLATFORMS = ["OnlyFans", "Fansly", "OnlyFans / Fansly"];

/* ---------------- EDITABLE STATE (persisted to localStorage) ---------------- */
const STORAGE_KEY = "chatterDashboardState";

const DEFAULT_STATE = {
  name: "Marina Sokolova",
  telegram: "@marina_chat",
  wallet: "TXn9k...4f2A",
  timezone: "UTC+3 (Moscow)",

  // The dashboard always represents an already-finished shift.
  // shiftEndedAt is the moment that shift wrapped — everything below is derived from it.
  shiftEndedAt: Date.now(),
  shiftLengthHours: 6,

  earnedShift: 186,
  messagesShift: 94,
  ppvShift: 5,
  avgCheck: 34,

  paidMonth: 4820,
  processing: 640,
  pending: 180,
  rate: 15,

  rangeMin: 120,
  rangeMax: 260,
  tipsRatio: 0.41,
  offerRatio: 0.30,
  openRatio: 0.63,

  // Monthly earnings calendar: "YYYY-MM-DD" -> { earned, shifts }
  monthlyData: {},

  // Yearly earnings: "YYYY-MM" -> earned
  yearlyData: {},

  // Scouting: passive income from models you brought to the agency
  scoutRate: 13, // %
  scoutedModels: [], // { id, name, platform, dateScouted, monthlyEarnings, active }

  // Models you personally chat for — only count + weekly total are editable,
  // the per-model breakdown (modelsList) is always derived from those two.
  modelsCount: 3,
  modelsWeeklyEarned: 1240,
  modelsList: [], // { name, platform, messages, earned }

  theme: "dark", // "dark" | "light"
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

let state = loadState();
seedMonthlyDataIfEmpty();
seedScoutingDataIfEmpty();
seedModelsIfEmpty();
seedYearlyDataIfEmpty();

/* ---------------- THEME ---------------- */
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  document.querySelectorAll("#theme-switch .chip").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.themeChoice === state.theme);
  });
}
applyTheme();

document.querySelectorAll("#theme-switch .chip").forEach(btn => {
  btn.addEventListener("click", () => {
    if (state.theme === btn.dataset.themeChoice) return;
    state.theme = btn.dataset.themeChoice;
    saveState(state);
    applyTheme();
    applyChartDefaults();
    rebuildCharts();
    buildScoutingChart();
  });
});

function money(n) {
  return "$" + Number(n || 0).toLocaleString("en-US");
}

/* ---------------- SHIFT WINDOW (a completed shift ending at state.shiftEndedAt) ---------------- */
function getShiftInfo() {
  const lengthMs = Math.max(1, state.shiftLengthHours) * 3600000;
  return {
    lengthMs,
    start: state.shiftEndedAt - lengthMs,
    end: state.shiftEndedAt,
    agoMs: Math.max(0, Date.now() - state.shiftEndedAt),
  };
}

function fmtDuration(ms) {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function fmtAgo(ms) {
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 1) return "just now";
  if (totalMin < 60) return `${totalMin}m ago`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m ? `${h}h ${m}m ago` : `${h}h ago`;
}

function fmtClock(ts) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function fmtClockHour(ts) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric" });
}

function dateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function todayKey() {
  const d = new Date();
  return dateKey(d.getFullYear(), d.getMonth(), d.getDate());
}

/* ---------------- RENDER ---------------- */
function renderState() {
  const shift = getShiftInfo();

  const tipsAmt = Math.round(state.earnedShift * state.tipsRatio);
  const ppvAmt = state.earnedShift - tipsAmt;

  document.getElementById("kpi-earned-shift").textContent = money(state.earnedShift);
  document.getElementById("kpi-earned-split").textContent = `${money(tipsAmt)} tips · ${money(ppvAmt)} PPV`;

  document.getElementById("kpi-messages-shift").textContent = Number(state.messagesShift || 0).toLocaleString("en-US");
  document.getElementById("kpi-messages-pace").textContent = Math.round(state.messagesShift / state.shiftLengthHours) + " / h avg";

  document.getElementById("kpi-ppv-shift").textContent = state.ppvShift;
  document.getElementById("kpi-avg-check").textContent = money(state.avgCheck);

  document.getElementById("kpi-duration").textContent = state.shiftLengthHours + "h";
  document.getElementById("kpi-duration-sub").textContent = `${fmtClock(shift.start)} – ${fmtClock(shift.end)}`;
  document.getElementById("kpi-ended").textContent = fmtAgo(shift.agoMs);

  document.getElementById("kpi-paid-month").textContent = money(state.paidMonth);
  document.getElementById("kpi-processing").textContent = money(state.processing);
  document.getElementById("kpi-pending").textContent = money(state.pending);
  document.getElementById("kpi-rate").textContent = state.rate + "%";

  document.getElementById("user-name").textContent = state.name;
  document.getElementById("user-avatar").textContent = initials(state.name || "??");

  // sidebar shift widget
  document.getElementById("shift-range").textContent = `${fmtClock(shift.start)} – ${fmtClock(shift.end)}`;
  document.getElementById("shift-duration").textContent = state.shiftLengthHours + "h";

  // topbar shift pill
  document.getElementById("shift-pill-text").textContent = `Shift ended · ${fmtAgo(shift.agoMs)}`;

  // tips vs PPV split (this shift)
  document.getElementById("split-tips-pct").textContent = Math.round(state.tipsRatio * 100) + "%";
  document.getElementById("split-ppv-pct").textContent = Math.round((1 - state.tipsRatio) * 100) + "%";
  document.getElementById("split-tips-amt").textContent = money(tipsAmt);
  document.getElementById("split-ppv-amt").textContent = money(ppvAmt);

  // funnel (this shift) — bottom of the funnel matches the PPV-sold KPI
  const messages = Math.max(1, state.messagesShift);
  const offered = Math.min(messages, Math.max(1, Math.round(messages * state.offerRatio)));
  const purchased = Math.min(offered, state.ppvShift);
  const opened = Math.max(purchased, Math.round(offered * state.openRatio));
  const pct = n => Math.round((n / messages) * 100);
  document.getElementById("funnel-messages").textContent = messages.toLocaleString("en-US");
  document.getElementById("funnel-offered").textContent = `${offered.toLocaleString("en-US")} · ${pct(offered)}%`;
  document.getElementById("funnel-opened").textContent = `${opened.toLocaleString("en-US")} · ${pct(opened)}%`;
  document.getElementById("funnel-purchased").textContent = `${purchased.toLocaleString("en-US")} · ${pct(purchased)}%`;
  document.getElementById("funnel-bar-offered").style.width = pct(offered) + "%";
  document.getElementById("funnel-bar-opened").style.width = pct(opened) + "%";
  document.getElementById("funnel-bar-purchased").style.width = pct(purchased) + "%";
}

function updateDerivedPreview() {
  document.getElementById("derived-preview").textContent =
    `Derived: ${state.messagesShift.toLocaleString("en-US")} messages · ${state.ppvShift} PPV sold · ${money(state.avgCheck)} avg sale`;
}

function fillSettingsForm() {
  document.getElementById("input-name").value = state.name;
  document.getElementById("input-telegram").value = state.telegram;
  document.getElementById("input-wallet").value = state.wallet;
  document.getElementById("input-timezone").value = state.timezone;

  document.getElementById("input-earned-shift").value = state.earnedShift;
  document.getElementById("input-shift-length").value = state.shiftLengthHours;

  document.getElementById("input-paid-month").value = state.paidMonth;
  document.getElementById("input-processing").value = state.processing;
  document.getElementById("input-pending").value = state.pending;
  document.getElementById("input-rate").value = state.rate;

  document.getElementById("input-range-min").value = state.rangeMin;
  document.getElementById("input-range-max").value = state.rangeMax;

  document.getElementById("input-models-count").value = state.modelsCount;
  document.getElementById("input-models-weekly").value = state.modelsWeeklyEarned;

  updateDerivedPreview();
}

document.getElementById("save-profile-btn").addEventListener("click", () => {
  state = {
    ...state,
    name: document.getElementById("input-name").value.trim() || DEFAULT_STATE.name,
    telegram: document.getElementById("input-telegram").value.trim(),
    wallet: document.getElementById("input-wallet").value.trim(),
    timezone: document.getElementById("input-timezone").value.trim(),
  };
  saveState(state);
  renderState();
  flashStatus("save-profile-status", "Saved ✓");
});

document.getElementById("save-payouts-btn").addEventListener("click", () => {
  state = {
    ...state,
    paidMonth: Number(document.getElementById("input-paid-month").value) || 0,
    processing: Number(document.getElementById("input-processing").value) || 0,
    pending: Number(document.getElementById("input-pending").value) || 0,
    rate: Number(document.getElementById("input-rate").value) || 0,
  };
  saveState(state);
  renderState();
  flashStatus("save-payouts-status", "Saved ✓");
});

/* ---------------- DERIVE EVERYTHING FROM A SINGLE "EARNED THIS SHIFT" NUMBER ---------------- */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function applyEarnedShift(earnedShift, shiftLengthHours) {
  const ppvShift = randomInt(2, 9);
  const messagesShift = Math.round(shiftLengthHours * randomInt(35, 65));
  const avgCheck = Math.max(15, Math.round((earnedShift / ppvShift) * (0.7 + Math.random() * 0.4)));
  const monthlyEstimate = earnedShift * randomInt(18, 26); // rough "if every shift looked like this" projection
  const paidMonth = Math.round(monthlyEstimate * (0.75 + Math.random() * 0.15));
  const processing = Math.round(monthlyEstimate * (0.03 + Math.random() * 0.05));
  const pending = Math.round(earnedShift * (0.5 + Math.random() * 0.7));
  const tipsRatio = 0.32 + Math.random() * 0.2;
  const offerRatio = 0.22 + Math.random() * 0.16;
  const openRatio = 0.55 + Math.random() * 0.2;

  state = {
    ...state,
    shiftEndedAt: Date.now(),
    shiftLengthHours,
    earnedShift, messagesShift, ppvShift, avgCheck,
    paidMonth, processing, pending, tipsRatio, offerRatio, openRatio,
  };

  // keep today's cell on the monthly calendar in sync with this shift
  const key = todayKey();
  const existingShifts = state.monthlyData[key] ? state.monthlyData[key].shifts : 0;
  state.monthlyData = { ...state.monthlyData, [key]: { earned: earnedShift, shifts: Math.max(1, existingShifts) } };

  saveState(state);
  renderState();
  fillSettingsForm();
  rebuildCharts();
  renderMonthly();
}

document.getElementById("apply-earned-btn").addEventListener("click", () => {
  const earnedShift = Math.max(0, Number(document.getElementById("input-earned-shift").value) || 0);
  const shiftLengthHours = Math.min(12, Math.max(1, Number(document.getElementById("input-shift-length").value) || DEFAULT_STATE.shiftLengthHours));
  applyEarnedShift(earnedShift, shiftLengthHours);
  flashStatus("apply-status", "Applied ✓");
});

document.getElementById("randomize-btn").addEventListener("click", () => {
  let rangeMin = Number(document.getElementById("input-range-min").value) || DEFAULT_STATE.rangeMin;
  let rangeMax = Number(document.getElementById("input-range-max").value) || DEFAULT_STATE.rangeMax;
  if (rangeMax < rangeMin) [rangeMin, rangeMax] = [rangeMax, rangeMin];

  state = { ...state, rangeMin, rangeMax };
  applyEarnedShift(randomInt(rangeMin, rangeMax), state.shiftLengthHours);
  flashStatus("randomize-status", "Randomized 🎲");
});

function flashStatus(id, text) {
  const status = document.getElementById(id);
  status.textContent = text;
  status.classList.add("show");
  setTimeout(() => status.classList.remove("show"), 1800);
}

renderState();
fillSettingsForm();

// keeps "shift ended Xm ago" ticking without needing a reload — nothing else changes
setInterval(renderState, 30000);

/* ---------------- NAVIGATION ---------------- */
const titles = {
  overview: ["Overview", "Your stats after this shift"],
  chats: ["My Chats", "Chats from this shift"],
  stats: ["Statistics", "Breakdown of earnings and conversion this shift"],
  payouts: ["Payouts", "Your earnings and payout history"],
  monthly: ["Monthly", "Every day this month — click one to log it"],
  yearly: ["Yearly", "A year of growth — click a month to set what it earned"],
  scouting: ["Scouting", "Passive income from models you brought to the agency"],
  settings: ["Settings", "Profile and notifications"],
};

document.querySelectorAll(".nav-item[data-view]").forEach(btn => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});

function switchView(view) {
  document.querySelectorAll(".nav-item[data-view]").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + view));
  const [title, subtitle] = titles[view];
  document.getElementById("view-title").textContent = title;
  document.getElementById("view-subtitle").textContent = subtitle;
  // charts rebuilt while their tab was hidden measure a 0×0 canvas — force a resize now that it's visible
  [revenueChart, dailyChart, splitChart, scoutingChart, yearlyChart].forEach(c => c && c.resize());
  if (view === "monthly") renderMonthly();
  if (view === "yearly") renderYearly();
  if (view === "scouting") renderScouting();
}

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    chip.parentElement.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
  });
});

/* ---------------- CHART.JS DEFAULTS ---------------- */
Chart.defaults.font.family = "-apple-system, 'Segoe UI', Roboto, sans-serif";
Chart.defaults.font.size = 11;

const GREEN = "#22c55e";
const RED = "#ef4444";

function chartTheme() {
  return state.theme === "light"
    ? {
        text: "#5b6172", borderSoft: "#e7e9ee", grid: "#eceef2",
        tooltipBg: "#ffffff", tooltipBorder: "#e1e3e9",
        tooltipTitle: "#16181d", tooltipBody: "#5b6172",
        donutBorder: "#ffffff", accent: "#2563eb",
      }
    : {
        text: "#5c6274", borderSoft: "#1a1e29", grid: "#161a24",
        tooltipBg: "#181c26", tooltipBorder: "#232838",
        tooltipTitle: "#dfe2ea", tooltipBody: "#8a90a3",
        donutBorder: "#12151d", accent: "#3b82f6",
      };
}

function applyChartDefaults() {
  const ct = chartTheme();
  Chart.defaults.color = ct.text;
  Chart.defaults.borderColor = ct.borderSoft;
}
applyChartDefaults();

/* ---------------- CHART DATA: hour-by-hour across the completed shift ---------------- */

/* Splits state.earnedShift across every hour of the shift (random weights, all hours filled
   in since the shift is already over). */
function buildHourlyTotals() {
  const n = state.shiftLengthHours;
  const raws = Array.from({ length: n }, () => 0.5 + Math.random());
  const sumRaw = raws.reduce((a, b) => a + b, 0);
  const totals = raws.map(r => Math.round(state.earnedShift * (r / sumRaw)));
  const diff = state.earnedShift - totals.reduce((a, b) => a + b, 0);
  if (totals.length) totals[totals.length - 1] += diff;
  return totals;
}

function buildHourLabels() {
  const shift = getShiftInfo();
  return Array.from({ length: state.shiftLengthHours }, (_, i) => fmtClockHour(shift.start + i * 3600000));
}

let revenueChart = null;
let dailyChart = null;
let splitChart = null;
let scoutingChart = null;

function buildRevenueChart(labels, totals) {
  const ct = chartTheme();
  if (revenueChart) revenueChart.destroy();
  revenueChart = new Chart(document.getElementById("chart-revenue").getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        data: totals,
        borderWidth: 2,
        pointRadius: 2.5,
        pointBackgroundColor: ctx => {
          const i = ctx.dataIndex;
          if (i === 0 || totals[i - 1] == null) return GREEN;
          return totals[i] >= totals[i - 1] ? GREEN : RED;
        },
        pointBorderWidth: 0,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 0,
        tension: 0,
        fill: false,
        spanGaps: false,
        segment: {
          borderColor: ctx => ctx.p0.parsed.y <= ctx.p1.parsed.y ? GREEN : RED,
        },
        pointHoverBackgroundColor: ctx => {
          const i = ctx.dataIndex;
          if (i === 0 || totals[i - 1] == null) return GREEN;
          return totals[i] >= totals[i - 1] ? GREEN : RED;
        },
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, borderWidth: 1,
          padding: 8, titleColor: ct.tooltipTitle, bodyColor: ct.tooltipBody,
          callbacks: { label: (ctx) => "  $" + ctx.parsed.y }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: ct.grid }, ticks: { callback: v => "$" + v } }
      }
    }
  });
}

function buildDailyChart(labels, totals) {
  const ct = chartTheme();
  const tipsData = totals.map(t => (t == null ? null : Math.round(t * state.tipsRatio)));
  const ppvData = totals.map((t, i) => (t == null ? null : t - tipsData[i]));

  if (dailyChart) dailyChart.destroy();
  dailyChart = new Chart(document.getElementById("chart-messages").getContext("2d"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Tips", data: tipsData, backgroundColor: GREEN, borderRadius: 2, barPercentage: 0.55 },
        { label: "PPV", data: ppvData, backgroundColor: RED, borderRadius: 2, barPercentage: 0.55 },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, borderWidth: 1,
        padding: 8, titleColor: ct.tooltipTitle, bodyColor: ct.tooltipBody,
        callbacks: { label: ctx => `${ctx.dataset.label}: $${ctx.parsed.y}` }
      }},
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: ct.grid }, ticks: { callback: v => "$" + v } }
      }
    }
  });
}

function buildSplitChart() {
  const ct = chartTheme();
  const tipsPct = Math.round(state.tipsRatio * 100);
  const ppvPct = 100 - tipsPct;

  if (splitChart) splitChart.destroy();
  splitChart = new Chart(document.getElementById("chart-split").getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Tips", "PPV"],
      datasets: [{ data: [tipsPct, ppvPct], backgroundColor: [GREEN, RED], borderColor: ct.donutBorder, borderWidth: 3 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      cutout: "70%",
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, borderWidth: 1,
        padding: 8, titleColor: ct.tooltipTitle, bodyColor: ct.tooltipBody,
      }}
    }
  });
}

function rebuildCharts() {
  const labels = buildHourLabels();
  const totals = buildHourlyTotals();
  buildRevenueChart(labels, totals);
  buildDailyChart(labels, totals);
  buildSplitChart();
}

rebuildCharts();

/* ---------------- MODELS: count + weekly total drive the whole breakdown ---------------- */
function deriveModelsList(count, weeklyEarned) {
  const n = Math.min(MODEL_NAME_POOL.length, Math.max(1, count));
  const raws = Array.from({ length: n }, () => 0.5 + Math.random());
  const sumRaw = raws.reduce((a, b) => a + b, 0);
  const earnings = raws.map(r => Math.round(weeklyEarned * (r / sumRaw)));
  const diff = weeklyEarned - earnings.reduce((a, b) => a + b, 0);
  if (earnings.length) earnings[earnings.length - 1] += diff;

  return MODEL_NAME_POOL.slice(0, n).map((name, i) => ({
    name,
    platform: MODEL_PLATFORMS[i % MODEL_PLATFORMS.length],
    earned: earnings[i],
    messages: Math.max(15, Math.round(earnings[i] * (1.2 + Math.random()))),
  }));
}

function seedModelsIfEmpty() {
  if (state.modelsList.length > 0) return;
  state.modelsList = deriveModelsList(state.modelsCount, state.modelsWeeklyEarned);
  saveState(state);
}

function applyModelsSettings(count, weeklyEarned) {
  const n = Math.min(MODEL_NAME_POOL.length, Math.max(1, count));
  state.modelsCount = n;
  state.modelsWeeklyEarned = weeklyEarned;
  state.modelsList = deriveModelsList(n, weeklyEarned);
  saveState(state);
  renderModelsTable();
  fillSettingsForm();
}

function renderModelsTable() {
  document.getElementById("my-models-body").innerHTML = state.modelsList.map(m => `
    <tr>
      <td>${m.name}</td>
      <td>${m.platform}</td>
      <td>${m.messages}</td>
      <td><b>$${m.earned}</b></td>
    </tr>
  `).join("") || `<tr><td colspan="4" class="table-empty">No models yet — add some in Settings.</td></tr>`;

  document.getElementById("models-derived-preview").textContent =
    "Derived: " + state.modelsList.map(m => `${m.name} $${m.earned}`).join(" · ");
}

document.getElementById("apply-models-btn").addEventListener("click", () => {
  const count = Math.max(1, Number(document.getElementById("input-models-count").value) || 1);
  const weeklyEarned = Math.max(0, Number(document.getElementById("input-models-weekly").value) || 0);
  applyModelsSettings(count, weeklyEarned);
  flashStatus("apply-models-status", "Applied ✓");
});

renderModelsTable();

/* ---------------- DATA: RECENT EARNINGS FEED ---------------- */
const feedUsers = ["mike_92", "daniel.k", "shadow_x", "alex_vip", "johnny88", "kevin_b", "brandon99"];

function randomFeed(n) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    const isTip = Math.random() > 0.45;
    const user = feedUsers[Math.floor(Math.random() * feedUsers.length)];
    const model = state.modelsList[Math.floor(Math.random() * state.modelsList.length)].name;
    const amount = isTip ? Math.floor(Math.random() * 60) + 10 : Math.floor(Math.random() * 90) + 20;
    rows.push({
      text: `${isTip ? "Tip" : "PPV purchased"} · @${user} · ${model}`,
      amount, isTip,
      time: `${(i + 1) * 7} min ago`,
    });
  }
  return rows;
}

document.getElementById("activity-feed").innerHTML = randomFeed(8).map(f => `
  <div class="activity-row">
    <div>
      <div class="activity-text">${f.text}</div>
      <div class="activity-time">${f.time}</div>
    </div>
    <div class="activity-amount ${f.isTip ? "green" : "red"}">+$${f.amount}</div>
  </div>
`).join("");

/* ---------------- DATA: CHATS ---------------- */
const chatMessages = [
  "Hey! How was your weekend? 😘",
  "Sent you something new...",
  "Thanks for the gift, you're the best",
  "When are you posting new content?",
  "Haha I love messages like this",
  "I miss you, text me tonight",
  "Bought the PPV, waiting on you!",
  "That was amazing, want more",
];
const chatNames = ["mike_92", "daniel.k", "shadow_x", "peterR", "alex_vip", "johnny88", "kevin_b", "ryan_t", "chris_w", "brandon99", "tommy_l"];

function randomChats(n) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    const model = state.modelsList[Math.floor(Math.random() * state.modelsList.length)];
    const online = Math.random() > 0.35;
    const unread = Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : 0;
    const mins = Math.floor(Math.random() * 58) + 1;
    rows.push({
      user: chatNames[Math.floor(Math.random() * chatNames.length)] + Math.floor(Math.random() * 90),
      model, online, unread,
      msg: chatMessages[Math.floor(Math.random() * chatMessages.length)],
      time: `${mins} min ago`,
    });
  }
  return rows;
}

document.getElementById("chat-list").innerHTML = randomChats(11).map(r => `
  <div class="chat-row">
    <div class="chat-avatar">
      ${initials(r.user)}
      <span class="status-dot ${r.online ? "on" : "off"}"></span>
    </div>
    <div class="chat-mid">
      <div class="chat-mid-top">
        <strong>@${r.user}</strong>
        <span class="tag">${r.model.name}</span>
        ${r.unread ? `<span class="unread-badge">${r.unread}</span>` : ""}
      </div>
      <div class="chat-preview">${r.msg}</div>
    </div>
    <div class="chat-meta">${r.time}</div>
  </div>
`).join("");

/* ---------------- DATA: TOP SPENDERS (my clients, this shift) ---------------- */
const spenders = [
  { user: "mike_92", model: "Kira Storm", platform: "of", spent: 96, purchases: 3, last: "12m ago" },
  { user: "daniel.k", model: "Aria Vale", platform: "of", spent: 68, purchases: 2, last: "34m ago" },
  { user: "shadow_x", model: "Nova Sky", platform: "fansly", spent: 54, purchases: 2, last: "51m ago" },
  { user: "alex_vip", model: "Kira Storm", platform: "of", spent: 40, purchases: 1, last: "1h ago" },
  { user: "johnny88", model: "Aria Vale", platform: "of", spent: 32, purchases: 1, last: "1h ago" },
];

document.getElementById("spenders-body").innerHTML = spenders.map(s => `
  <tr>
    <td><div class="cell-user">
      <div class="cell-avatar">${initials(s.user)}</div>
      @${s.user}
    </div></td>
    <td>${s.model}</td>
    <td><span class="badge ${s.platform}">${s.platform === "of" ? "OnlyFans" : "Fansly"}</span></td>
    <td><b>$${s.spent}</b></td>
    <td>${s.purchases}</td>
    <td>${s.last}</td>
  </tr>
`).join("");

/* ---------------- DATA: MY PAYOUTS ---------------- */
const methods = ["Crypto (USDT)", "Bank transfer", "PayPal"];
const statuses = [
  { key: "paid", label: "Paid" },
  { key: "processing", label: "Processing" },
  { key: "pending", label: "Pending" },
];

function randomPayouts(n) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7 - Math.floor(Math.random() * 3));
    rows.push({
      id: "PO-" + (8820 + i),
      amount: Math.floor(Math.random() * 900) + 300,
      method: methods[Math.floor(Math.random() * methods.length)],
      status: i === 0 ? statuses[2] : (i === 1 ? statuses[1] : statuses[0]),
      date: d.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" }),
    });
  }
  return rows;
}

document.getElementById("payouts-body").innerHTML = randomPayouts(7).map((p, i) => `
  <tr>
    <td>${p.id}</td>
    <td>Week ${7 - i}</td>
    <td><b>$${p.amount}</b></td>
    <td>${p.method}</td>
    <td><span class="badge ${p.status.key}">${p.status.label}</span></td>
    <td>${p.date}</td>
  </tr>
`).join("");

/* ---------------- MONTHLY EARNINGS CALENDAR ---------------- */

/* First time ever loading: back-fill the current month up to today with plausible
   demo data so the calendar isn't empty, then leave it alone (never overwrite real edits). */
function seedMonthlyDataIfEmpty() {
  if (Object.keys(state.monthlyData).length > 0) return;
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
  const data = {};
  for (let day = 1; day < today; day++) {
    if (Math.random() < 0.15) {
      data[dateKey(y, m, day)] = { earned: 0, shifts: 0 };
    } else {
      const shifts = Math.random() < 0.25 ? 2 : 1;
      const earned = Math.round((120 + Math.random() * 160) * shifts * (0.7 + Math.random() * 0.3));
      data[dateKey(y, m, day)] = { earned, shifts };
    }
  }
  // today matches whatever "Earned this shift" already is, so Overview and the calendar agree
  data[dateKey(y, m, today)] = { earned: state.earnedShift, shifts: 1 };
  state.monthlyData = data;
  saveState(state);
}

let monthOffset = 0; // 0 = current real month, negative = past months

function renderMonthly() {
  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + monthOffset);
  const y = base.getFullYear(), m = base.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstDow = new Date(y, m, 1).getDay(); // 0=Sun..6=Sat
  const leadingBlanks = (firstDow + 6) % 7; // Monday-first offset

  document.getElementById("month-label").textContent = base.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  document.getElementById("month-next").disabled = monthOffset >= 0;

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === y && today.getMonth() === m;

  const records = [];
  for (let day = 1; day <= daysInMonth; day++) {
    records.push({ day, key: dateKey(y, m, day), rec: state.monthlyData[dateKey(y, m, day)] });
  }
  const maxEarned = Math.max(1, ...records.map(r => (r.rec && r.rec.shifts > 0) ? r.rec.earned : 0));

  let totalEarned = 0, totalShifts = 0, daysWorked = 0, daysOff = 0, best = null;

  let html = "";
  for (let i = 0; i < leadingBlanks; i++) html += `<div class="cal-cell empty"></div>`;

  records.forEach(({ day, key, rec }) => {
    const cellDate = new Date(y, m, day);
    const isToday = isCurrentMonth && day === today.getDate();
    const isFuture = cellDate > today && !isToday;
    let cls = "cal-cell";
    if (isToday) cls += " today";

    let inner = `<span class="cal-date">${day}</span>`;

    if (rec && rec.shifts > 0) {
      totalEarned += rec.earned;
      totalShifts += rec.shifts;
      daysWorked++;
      if (best === null || rec.earned > best.earned) best = { day, earned: rec.earned };
      const tier = rec.earned > maxEarned * 0.66 ? 3 : rec.earned > maxEarned * 0.33 ? 2 : 1;
      cls += ` green green-${tier}`;
      inner += `<span class="cal-amt">$${rec.earned}</span><span class="cal-shifts">${rec.shifts} sh</span>`;
    } else if (rec && rec.shifts === 0) {
      daysOff++;
      cls += " off";
      inner += `<span class="cal-amt">off</span>`;
    } else if (isFuture) {
      cls += " future";
      inner += `<span class="cal-amt">—</span>`;
    } else {
      cls += " off";
      inner += `<span class="cal-amt">—</span>`;
    }

    html += `<button type="button" class="${cls}" data-date="${key}">${inner}</button>`;
  });

  document.getElementById("cal-grid").innerHTML = html;
  document.querySelectorAll(".cal-cell[data-date]").forEach(cell => {
    cell.addEventListener("click", () => openDayEditor(cell.dataset.date));
  });

  document.getElementById("kpi-month-earned").textContent = money(totalEarned);
  document.getElementById("kpi-month-earned-sub").textContent = `${totalShifts} shift${totalShifts === 1 ? "" : "s"}`;
  document.getElementById("kpi-month-worked").textContent = `${daysWorked} / ${daysInMonth}`;
  document.getElementById("kpi-month-off").textContent = `${daysOff} day${daysOff === 1 ? "" : "s"} off`;
  document.getElementById("kpi-month-avg").textContent = totalShifts ? money(Math.round(totalEarned / totalShifts)) : "$0";
  document.getElementById("kpi-month-avgday").textContent = daysWorked ? money(Math.round(totalEarned / daysWorked)) : "$0";
  document.getElementById("kpi-month-best").textContent = best ? money(best.earned) : "$0";
  document.getElementById("kpi-month-best-sub").textContent = best
    ? base.toLocaleDateString("en-US", { month: "short" }) + " " + best.day
    : "—";
}

let editingDateKey = null;

function openDayEditor(key) {
  editingDateKey = key;
  const rec = state.monthlyData[key] || { earned: 0, shifts: 1 };
  const [y, m, d] = key.split("-").map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  document.getElementById("day-editor-title").textContent = label;
  document.getElementById("input-day-earned").value = rec.earned;
  document.getElementById("input-day-shifts").value = rec.shifts;
  const card = document.getElementById("day-editor-card");
  card.hidden = false;
  card.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

document.getElementById("save-day-btn").addEventListener("click", () => {
  if (!editingDateKey) return;
  const shifts = Number(document.getElementById("input-day-shifts").value) || 0;
  const earned = shifts > 0 ? Math.max(0, Number(document.getElementById("input-day-earned").value) || 0) : 0;
  state.monthlyData = { ...state.monthlyData, [editingDateKey]: { earned, shifts } };
  saveState(state);
  renderMonthly();
  flashStatus("day-status", "Saved ✓");
});

document.getElementById("clear-day-btn").addEventListener("click", () => {
  if (!editingDateKey) return;
  const data = { ...state.monthlyData };
  delete data[editingDateKey];
  state.monthlyData = data;
  saveState(state);
  renderMonthly();
  document.getElementById("day-editor-card").hidden = true;
  editingDateKey = null;
});

document.getElementById("month-prev").addEventListener("click", () => { monthOffset--; renderMonthly(); });
document.getElementById("month-next").addEventListener("click", () => { monthOffset = Math.min(0, monthOffset + 1); renderMonthly(); });
document.getElementById("month-today").addEventListener("click", () => { monthOffset = 0; renderMonthly(); });

renderMonthly();

/* ---------------- YEARLY: hockey-stick growth, editable per month ---------------- */
const YEAR_MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function yearMonthKey(y, m) {
  return `${y}-${String(m + 1).padStart(2, "0")}`;
}

/* Deterministic 0..1 "random" per day, so the daily bars don't jitter on every re-render. */
function seededDayFactor(y, m, day) {
  const seed = y * 10000 + (m + 1) * 100 + day;
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/* Sums the Monthly calendar's real day-by-day entries for one year-month, so Yearly always
   agrees with whatever was actually logged in the Monthly tab. */
function sumMonthlyDataForMonth(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let total = 0, hasData = false;
  for (let d = 1; d <= daysInMonth; d++) {
    const rec = state.monthlyData[dateKey(year, month, d)];
    if (rec) { hasData = true; total += rec.earned; }
  }
  return { total, hasData };
}

/* One bar per day of the year. Days that were actually logged in the Monthly calendar use
   their real value; months that only have a hand-typed yearly total (no daily breakdown)
   fall back to spreading that total across the month's days. */
function buildYearlyDailyBars(year, months) {
  const now = new Date();
  const days = [];
  for (let m = 0; m < 12; m++) {
    const mo = months[m];
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, m, d);
      const isFuture = date > now;
      const rec = state.monthlyData[dateKey(year, m, d)];
      let value = null;
      if (rec) {
        value = rec.earned;
      } else if (!isFuture && typeof mo.value === "number") {
        const avg = mo.value / daysInMonth;
        const factor = 0.3 + seededDayFactor(year, m, d) * 1.4;
        value = Math.max(0, Math.round(avg * factor));
      }
      days.push({ date, value, isFirstOfMonth: d === 1, monthIndex: m });
    }
  }
  return days;
}

/* Value (as a fraction of the target) at a given progress (0..1) through the ramp,
   LINEARLY interpolated between hand-placed keyframes — sharp corners at every
   keyframe on purpose, so the trend itself zigzags instead of arcing smoothly. */
function rampKeyframeValue(progress, keyframes) {
  for (let i = 0; i < keyframes.length - 1; i++) {
    const [p0, v0] = keyframes[i];
    const [p1, v1] = keyframes[i + 1];
    if (progress <= p1) {
      const local = p1 === p0 ? 1 : (progress - p0) / (p1 - p0);
      return v0 + (v1 - v0) * Math.max(0, Math.min(1, local));
    }
  }
  return keyframes[keyframes.length - 1][1];
}

/* Rebuilds every day from Jan 1 through today as a jagged, choppy ride: small, a
   spike, a crash back down, more rises and drops, and only near the end a real,
   sustained climb to today's actual "Earned this shift" value. Feeds the Monthly
   calendar directly, so Yearly's per-month totals and daily bars update
   automatically once they're derived from it. */
function generateHockeyStickHistory(flatMin, flatMax) {
  const now = new Date();
  const year = now.getFullYear();
  const jan1 = new Date(year, 0, 1);
  // calendar-day count only — subtracting Date objects directly would include today's
  // time-of-day, so anything after noon rounds up to an extra day and shifts "today"
  // (and its real earnings) one day forward in the generated data
  const utcJan1 = Date.UTC(jan1.getFullYear(), jan1.getMonth(), jan1.getDate());
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const totalDays = Math.round((utcNow - utcJan1) / 86400000) + 1;
  const rampStart = Math.floor(totalDays * (0.3 + Math.random() * 0.15));
  const target = Math.max(20, state.earnedShift);

  // [progress through the ramp, value as a fraction of target] — lots of short,
  // sharp rises and crashes, and only the last couple of keyframes really commit
  const keyframes = [
    [0, 0.02],
    [0.09, 0.10 * (0.6 + Math.random() * 0.8)],
    [0.16, 0.015],
    [0.24, 0.16 * (0.6 + Math.random() * 0.8)],
    [0.31, 0.02],
    [0.40, 0.22 * (0.6 + Math.random() * 0.8)],
    [0.47, 0.05],
    [0.56, 0.32 * (0.6 + Math.random() * 0.8)],
    [0.63, 0.10],
    [0.73, 0.55 * (0.6 + Math.random() * 0.8)],
    [0.80, 0.22],
    [0.90, 0.8],
    [1, 1],
  ];

  const generated = {};
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(jan1);
    d.setDate(d.getDate() + i);
    const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());

    if (i === totalDays - 1) {
      generated[key] = { earned: target, shifts: 1 }; // today matches "Earned this shift" exactly
      continue;
    }

    if (i < rampStart) {
      // occasional sharp $1-2 spike so the flat stretch isn't perfectly even either
      const spike = Math.random() < 0.08 ? randomInt(flatMax, flatMax * 3) : 0;
      generated[key] = Math.random() < 0.4
        ? { earned: 0, shifts: 0 }
        : { earned: randomInt(flatMin, flatMax) + spike, shifts: 1 };
    } else {
      const progress = (i - rampStart) / Math.max(1, totalDays - 1 - rampStart);
      const base = rampKeyframeValue(progress, keyframes) * target;
      if (Math.random() < 0.14) {
        generated[key] = { earned: 0, shifts: 0 }; // sharp crash to nothing
      } else if (Math.random() < 0.08) {
        const earned = Math.max(0, Math.round(base * (1.6 + Math.random() * 0.9))); // sudden spike day
        generated[key] = { earned, shifts: Math.random() < 0.3 ? 2 : 1 };
      } else {
        const earned = Math.max(0, Math.round(base * (0.5 + Math.random() * 0.9)));
        generated[key] = { earned, shifts: Math.random() < 0.15 ? 2 : 1 };
      }
    }
  }

  // keep anything outside Jan 1..today untouched (future-dated plans, other years)
  const preserved = {};
  for (const [key, rec] of Object.entries(state.monthlyData)) {
    const [ky, km, kd] = key.split("-").map(Number);
    const date = new Date(ky, km - 1, kd);
    if (date < jan1 || date > now) preserved[key] = rec;
  }
  state.monthlyData = { ...preserved, ...generated };

  // drop hand-typed yearly totals for the months we just filled with real daily data
  const clearedYearly = { ...state.yearlyData };
  for (let m = 0; m <= now.getMonth(); m++) delete clearedYearly[yearMonthKey(year, m)];
  state.yearlyData = clearedYearly;

  saveState(state);
  renderMonthly();
  renderYearly();
}

/* Seeds the current year (up to the current real month) with a "nothing, nothing,
   nothing... then it takes off" curve, like a channel that suddenly blows up. */
function seedYearlyDataIfEmpty() {
  if (Object.keys(state.yearlyData).length > 0) return;
  const now = new Date();
  const y = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const data = {};
  let value = 60 + Math.random() * 50;
  for (let m = 0; m <= currentMonth; m++) {
    const progress = currentMonth === 0 ? 1 : m / currentMonth;
    const factor = progress < 0.5 ? (0.92 + Math.random() * 0.28) : (1.45 + Math.random() * 0.45);
    value = Math.max(15, Math.round(value * factor));
    data[yearMonthKey(y, m)] = value;
  }
  state.yearlyData = data;
  saveState(state);
}

let yearOffset = 0;
let yearlyChart = null;

function renderYearly() {
  const ct = chartTheme();
  const now = new Date();
  const year = now.getFullYear() + yearOffset;
  const isCurrentYear = year === now.getFullYear();

  document.getElementById("year-label").textContent = String(year);
  document.getElementById("year-next").disabled = yearOffset >= 0;

  const months = Array.from({ length: 12 }, (_, m) => {
    const key = yearMonthKey(year, m);
    const isFuture = isCurrentYear ? m > now.getMonth() : year > now.getFullYear();
    const daySum = sumMonthlyDataForMonth(year, m);
    const value = daySum.hasData ? daySum.total : state.yearlyData[key];
    return { m, key, value, isFuture };
  });

  const tracked = months.filter(mo => typeof mo.value === "number");
  const total = tracked.reduce((sum, mo) => sum + mo.value, 0);
  const best = tracked.reduce((b, mo) => (!b || mo.value > b.value) ? mo : b, null);
  const maxValue = Math.max(1, ...tracked.map(mo => mo.value));

  document.getElementById("kpi-year-earned").textContent = money(total);
  document.getElementById("kpi-year-months").textContent = `${tracked.length} month${tracked.length === 1 ? "" : "s"} tracked`;
  document.getElementById("kpi-year-avg").textContent = tracked.length ? money(Math.round(total / tracked.length)) : "$0";
  document.getElementById("kpi-year-best").textContent = best ? money(best.value) : "$0";
  document.getElementById("kpi-year-best-sub").textContent = best ? YEAR_MONTH_LABELS[best.m] : "—";

  const growthEl = document.getElementById("kpi-year-growth");
  if (tracked.length >= 2 && tracked[0].value > 0) {
    const multiple = tracked[tracked.length - 1].value / tracked[0].value;
    growthEl.textContent = `${multiple.toFixed(1)}×`;
    growthEl.classList.toggle("up", multiple >= 1);
  } else {
    growthEl.textContent = "—";
    growthEl.classList.remove("up");
  }

  // month grid
  document.getElementById("year-grid").innerHTML = months.map(mo => {
    let cls = "cal-cell";
    let inner = `<span class="cal-date">${YEAR_MONTH_LABELS[mo.m]}</span>`;
    if (typeof mo.value === "number") {
      const tier = mo.value > maxValue * 0.66 ? 3 : mo.value > maxValue * 0.33 ? 2 : 1;
      cls += ` green green-${tier}`;
      inner += `<span class="cal-amt">$${mo.value}</span>`;
    } else if (mo.isFuture) {
      cls += " future";
      inner += `<span class="cal-amt">—</span>`;
    } else {
      cls += " off";
      inner += `<span class="cal-amt">—</span>`;
    }
    return `<button type="button" class="${cls}" data-month="${mo.key}">${inner}</button>`;
  }).join("");
  document.querySelectorAll("#year-grid .cal-cell[data-month]").forEach(cell => {
    cell.addEventListener("click", () => openMonthEditor(cell.dataset.month));
  });

  // one bar per day of the year, so the chart reads like a real analytics graph
  const dayData = buildYearlyDailyBars(year, months);
  const chartValues = dayData.map(d => d.value);
  const chartLabels = dayData.map(d => (d.isFirstOfMonth ? YEAR_MONTH_LABELS[d.monthIndex] : ""));

  if (yearlyChart) yearlyChart.destroy();
  yearlyChart = new Chart(document.getElementById("chart-yearly").getContext("2d"), {
    type: "bar",
    data: {
      labels: chartLabels,
      datasets: [{
        data: chartValues,
        backgroundColor: ct.accent,
        borderRadius: 1,
        barPercentage: 1,
        categoryPercentage: 0.85,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      // with 300+ hairline daily bars, hovering has to work anywhere along the chart —
      // not just when the cursor lands exactly on a 1-2px wide bar
      interaction: { mode: "index", intersect: false, axis: "x" },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, borderWidth: 1,
          padding: 8, titleColor: ct.tooltipTitle, bodyColor: ct.tooltipBody,
          callbacks: {
            title: ctx => dayData[ctx[0].dataIndex].date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
            label: ctx => (ctx.parsed.y == null ? "No data" : "Earned: $" + ctx.parsed.y),
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { autoSkip: false, maxRotation: 0, color: ct.text } },
        y: { grid: { color: ct.grid }, ticks: { callback: v => "$" + v } }
      }
    }
  });
}

let editingMonthKey = null;

function openMonthEditor(key) {
  editingMonthKey = key;
  const [y, m] = key.split("-").map(Number);
  const daySum = sumMonthlyDataForMonth(y, m - 1);
  const input = document.getElementById("input-month-earned");
  const hint = document.getElementById("month-editor-hint");
  const saveBtn = document.getElementById("save-month-btn");
  const clearBtn = document.getElementById("clear-month-btn");

  document.getElementById("month-editor-title").textContent = `Edit ${YEAR_MONTH_LABELS[m - 1]} ${y}`;

  if (daySum.hasData) {
    input.value = daySum.total;
    input.disabled = true;
    saveBtn.disabled = true;
    clearBtn.disabled = true;
    hint.textContent = "This month is calculated from your daily entries in Monthly — edit individual days there.";
  } else {
    const value = state.yearlyData[key];
    input.value = typeof value === "number" ? value : "";
    input.disabled = false;
    saveBtn.disabled = false;
    clearBtn.disabled = false;
    hint.textContent = "This only updates the yearly chart.";
  }

  const card = document.getElementById("month-editor-card");
  card.hidden = false;
  card.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

document.getElementById("save-month-btn").addEventListener("click", () => {
  if (!editingMonthKey) return;
  const value = Math.max(0, Number(document.getElementById("input-month-earned").value) || 0);
  state.yearlyData = { ...state.yearlyData, [editingMonthKey]: value };
  saveState(state);
  renderYearly();
  flashStatus("month-status", "Saved ✓");
});

document.getElementById("clear-month-btn").addEventListener("click", () => {
  if (!editingMonthKey) return;
  const data = { ...state.yearlyData };
  delete data[editingMonthKey];
  state.yearlyData = data;
  saveState(state);
  renderYearly();
  document.getElementById("month-editor-card").hidden = true;
  editingMonthKey = null;
});

document.getElementById("year-prev").addEventListener("click", () => { yearOffset--; renderYearly(); });
document.getElementById("year-next").addEventListener("click", () => { yearOffset = Math.min(0, yearOffset + 1); renderYearly(); });
document.getElementById("year-today").addEventListener("click", () => {
  yearOffset = 0;
  renderYearly();
  const panel = document.getElementById("generate-history-card");
  panel.hidden = !panel.hidden;
  if (!panel.hidden) panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

document.getElementById("generate-history-btn").addEventListener("click", () => {
  let flatMin = Math.max(0, Number(document.getElementById("input-flat-min").value) || 0);
  let flatMax = Math.max(0, Number(document.getElementById("input-flat-max").value) || 0);
  if (flatMax < flatMin) [flatMin, flatMax] = [flatMax, flatMin];

  const ok = confirm("This replaces your daily earnings from Jan 1 through today with a generated growth history. Continue?");
  if (!ok) return;
  generateHockeyStickHistory(flatMin, flatMax);
  flashStatus("generate-history-status", "Generated ✓");
});

renderYearly();

/* ---------------- SCOUTING: passive income from models you brought in ---------------- */

function isoDateMinusMonths(months) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

function seedScoutingDataIfEmpty() {
  if (state.scoutedModels.length > 0) return;
  state.scoutedModels = [
    { id: 1, name: "Lily Monroe", platform: "OnlyFans", dateScouted: isoDateMinusMonths(8), monthlyEarnings: 9200, active: true },
    { id: 2, name: "Ava Sinclair", platform: "OnlyFans / Fansly", dateScouted: isoDateMinusMonths(5), monthlyEarnings: 5400, active: true },
    { id: 3, name: "Ruby Chase", platform: "Fansly", dateScouted: isoDateMinusMonths(3), monthlyEarnings: 2600, active: true },
    { id: 4, name: "Nadia Frost", platform: "OnlyFans", dateScouted: isoDateMinusMonths(11), monthlyEarnings: 3100, active: false },
  ];
  saveState(state);
}

function scoutCut(model) {
  return Math.round(model.monthlyEarnings * (state.scoutRate / 100));
}

function monthsSince(dateStr) {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.max(1, (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth()) + 1);
}

function renderScouting() {
  const models = state.scoutedModels;
  const active = models.filter(m => m.active);
  const monthPassive = active.reduce((sum, m) => sum + scoutCut(m), 0);
  const grossMonthly = active.reduce((sum, m) => sum + m.monthlyEarnings, 0);
  // rough lifetime estimate: each model's current monthly cut × months scouted (a simplification, not a real ledger)
  const lifetime = models.reduce((sum, m) => sum + scoutCut(m) * monthsSince(m.dateScouted), 0);

  document.getElementById("kpi-scout-count").textContent = models.length;
  document.getElementById("kpi-scout-active").textContent = `${active.length} active`;
  document.getElementById("kpi-scout-month").textContent = money(monthPassive);
  document.getElementById("kpi-scout-rate-sub").textContent = `at ${state.scoutRate}% of earnings`;
  document.getElementById("kpi-scout-lifetime").textContent = money(lifetime);
  document.getElementById("kpi-scout-gross").textContent = money(grossMonthly);
  document.getElementById("kpi-scout-avg").textContent = active.length ? money(Math.round(monthPassive / active.length)) : "$0";

  document.getElementById("scouting-body").innerHTML = models.map(m => `
    <tr>
      <td>${m.name}</td>
      <td>${m.platform}</td>
      <td>${m.dateScouted}</td>
      <td>${money(m.monthlyEarnings)}</td>
      <td><b class="${m.active ? "" : "dimmed"}">${money(scoutCut(m))}</b></td>
      <td><span class="badge ${m.active ? "paid" : "offline"}">${m.active ? "Active" : "Inactive"}</span></td>
      <td class="table-actions">
        <button type="button" class="link-btn" data-scout-toggle="${m.id}">${m.active ? "Deactivate" : "Reactivate"}</button>
        <button type="button" class="link-btn" data-scout-remove="${m.id}">Remove</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="7" class="table-empty">No models scouted yet — add one above.</td></tr>`;

  document.querySelectorAll("[data-scout-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.scoutToggle);
      state.scoutedModels = state.scoutedModels.map(m => m.id === id ? { ...m, active: !m.active } : m);
      saveState(state);
      renderScouting();
      buildScoutingChart();
    });
  });
  document.querySelectorAll("[data-scout-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.scoutRemove);
      state.scoutedModels = state.scoutedModels.filter(m => m.id !== id);
      saveState(state);
      renderScouting();
      buildScoutingChart();
    });
  });
}

function buildScoutingChart() {
  const ct = chartTheme();
  const months = 6;
  const active = state.scoutedModels.filter(m => m.active);
  const currentTotal = active.reduce((sum, m) => sum + scoutCut(m), 0);
  const labels = [];
  const data = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    labels.push(d.toLocaleDateString("en-US", { month: "short" }));
    // fewer models were scouted the further back you go, so ramp up toward the current total
    const rampedModels = active.filter(m => monthsSince(m.dateScouted) >= i + 1);
    const total = rampedModels.reduce((sum, m) => sum + scoutCut(m), 0);
    data.push(i === 0 ? currentTotal : Math.round(total * (0.85 + Math.random() * 0.3)));
  }

  if (scoutingChart) scoutingChart.destroy();
  scoutingChart = new Chart(document.getElementById("chart-scouting").getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        data,
        borderWidth: 2,
        pointRadius: 2.5,
        pointBorderWidth: 0,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 0,
        tension: 0,
        fill: false,
        pointBackgroundColor: ctx => {
          const i = ctx.dataIndex;
          if (i === 0) return GREEN;
          return data[i] >= data[i - 1] ? GREEN : RED;
        },
        segment: { borderColor: ctx => ctx.p0.parsed.y <= ctx.p1.parsed.y ? GREEN : RED },
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, borderWidth: 1,
          padding: 8, titleColor: ct.tooltipTitle, bodyColor: ct.tooltipBody,
          callbacks: { label: ctx => "  $" + ctx.parsed.y }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: ct.grid }, ticks: { callback: v => "$" + v } }
      }
    }
  });
}

document.getElementById("add-scout-btn").addEventListener("click", () => {
  const name = document.getElementById("input-scout-name").value.trim();
  const platform = document.getElementById("input-scout-platform").value;
  const dateScouted = document.getElementById("input-scout-date").value || new Date().toISOString().slice(0, 10);
  const monthlyEarnings = Math.max(0, Number(document.getElementById("input-scout-earnings").value) || 0);

  if (!name) {
    flashStatus("add-scout-status", "Enter a name first");
    return;
  }

  const nextId = state.scoutedModels.reduce((max, m) => Math.max(max, m.id), 0) + 1;
  state.scoutedModels = [...state.scoutedModels, { id: nextId, name, platform, dateScouted, monthlyEarnings, active: true }];
  saveState(state);

  document.getElementById("input-scout-name").value = "";
  document.getElementById("input-scout-earnings").value = "";

  renderScouting();
  buildScoutingChart();
  flashStatus("add-scout-status", "Added ✓");
});

document.getElementById("input-scout-date").value = new Date().toISOString().slice(0, 10);

renderScouting();
buildScoutingChart();
