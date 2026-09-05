/* Chatter dashboard — demo, all data is fake / editable. Everything is scoped to the current shift. */

function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

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
  [revenueChart, dailyChart, splitChart].forEach(c => c && c.resize());
  if (view === "monthly") renderMonthly();
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
Chart.defaults.color = "#5c6274";
Chart.defaults.borderColor = "#1a1e29";

const GREEN = "#22c55e";
const RED = "#ef4444";

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

function buildRevenueChart(labels, totals) {
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
          backgroundColor: "#181c26", borderColor: "#232838", borderWidth: 1,
          padding: 8, titleColor: "#dfe2ea", bodyColor: "#8a90a3",
          callbacks: { label: (ctx) => "  $" + ctx.parsed.y }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "#161a24" }, ticks: { callback: v => "$" + v } }
      }
    }
  });
}

function buildDailyChart(labels, totals) {
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
        backgroundColor: "#181c26", borderColor: "#232838", borderWidth: 1,
        padding: 8, titleColor: "#dfe2ea", bodyColor: "#8a90a3",
        callbacks: { label: ctx => `${ctx.dataset.label}: $${ctx.parsed.y}` }
      }},
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "#161a24" }, ticks: { callback: v => "$" + v } }
      }
    }
  });
}

function buildSplitChart() {
  const tipsPct = Math.round(state.tipsRatio * 100);
  const ppvPct = 100 - tipsPct;

  if (splitChart) splitChart.destroy();
  splitChart = new Chart(document.getElementById("chart-split").getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Tips", "PPV"],
      datasets: [{ data: [tipsPct, ppvPct], backgroundColor: [GREEN, RED], borderColor: "#12151d", borderWidth: 3 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      cutout: "70%",
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: "#181c26", borderColor: "#232838", borderWidth: 1,
        padding: 8, titleColor: "#dfe2ea", bodyColor: "#8a90a3",
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

/* ---------------- DATA: MY MODELS TODAY ---------------- */
const myModels = [
  { name: "Kira Storm", platform: "OnlyFans", msgs: 210, earned: 92 },
  { name: "Aria Vale", platform: "OnlyFans / Fansly", msgs: 89, earned: 54 },
  { name: "Nova Sky", platform: "OnlyFans", msgs: 43, earned: 40 },
];

document.getElementById("my-models-body").innerHTML = myModels.map(m => `
  <tr>
    <td>${m.name}</td>
    <td>${m.platform}</td>
    <td>${m.msgs}</td>
    <td><b>$${m.earned}</b></td>
  </tr>
`).join("");

/* ---------------- DATA: RECENT EARNINGS FEED ---------------- */
const feedUsers = ["mike_92", "daniel.k", "shadow_x", "alex_vip", "johnny88", "kevin_b", "brandon99"];
const feedModels = ["Kira Storm", "Aria Vale", "Nova Sky"];

function randomFeed(n) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    const isTip = Math.random() > 0.45;
    const user = feedUsers[Math.floor(Math.random() * feedUsers.length)];
    const model = feedModels[Math.floor(Math.random() * feedModels.length)];
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
    const model = myModels[Math.floor(Math.random() * myModels.length)];
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
