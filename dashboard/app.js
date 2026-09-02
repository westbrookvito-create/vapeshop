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

  // shiftStart is a real timestamp — everything shift-related is computed live from it
  shiftStart: Date.now() - 2 * 3600 * 1000,
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

function money(n) {
  return "$" + Number(n || 0).toLocaleString("en-US");
}

/* ---------------- SHIFT CLOCK (real time) ---------------- */
function getShiftInfo() {
  const lengthMs = Math.max(1, state.shiftLengthHours) * 3600000;
  const elapsedMsRaw = Date.now() - state.shiftStart;
  const elapsedMs = Math.min(Math.max(elapsedMsRaw, 0), lengthMs);
  const remainingMs = Math.max(lengthMs - elapsedMsRaw, 0);
  return {
    lengthMs,
    elapsedMs,
    remainingMs,
    elapsedHours: elapsedMs / 3600000,
    progressPct: Math.min(100, (elapsedMs / lengthMs) * 100),
    ended: elapsedMsRaw >= lengthMs,
  };
}

function fmtDuration(ms) {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function fmtClock(ts) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function fmtClockHour(ts) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric" });
}

/* ---------------- RENDER ---------------- */
function renderState() {
  const shift = getShiftInfo();
  const paceHours = Math.max(shift.elapsedHours, 0.15); // avoid a huge number right at shift start

  document.getElementById("kpi-earned-shift").textContent = money(state.earnedShift);
  document.getElementById("kpi-earned-pace").textContent = money(Math.round(state.earnedShift / paceHours)) + " / h pace";

  document.getElementById("kpi-messages-shift").textContent = Number(state.messagesShift || 0).toLocaleString("en-US");
  document.getElementById("kpi-messages-pace").textContent = Math.round(state.messagesShift / paceHours) + " / h";

  document.getElementById("kpi-ppv-shift").textContent = state.ppvShift;
  document.getElementById("kpi-avg-check").textContent = money(state.avgCheck);

  document.getElementById("kpi-time-elapsed").textContent = fmtDuration(shift.elapsedMs);
  document.getElementById("kpi-time-elapsed-sub").textContent = `of ${state.shiftLengthHours}h shift`;
  document.getElementById("kpi-time-remaining").textContent = shift.ended ? "0h 00m" : fmtDuration(shift.remainingMs);
  document.getElementById("kpi-time-remaining-sub").textContent = shift.ended
    ? "shift ended"
    : `ends at ${fmtClock(state.shiftStart + shift.lengthMs)}`;

  document.getElementById("kpi-paid-month").textContent = money(state.paidMonth);
  document.getElementById("kpi-processing").textContent = money(state.processing);
  document.getElementById("kpi-pending").textContent = money(state.pending);
  document.getElementById("kpi-rate").textContent = state.rate + "%";

  document.getElementById("user-name").textContent = state.name;
  document.getElementById("user-avatar").textContent = initials(state.name || "??");

  // sidebar shift widget
  document.getElementById("shift-range").textContent = `${fmtClock(state.shiftStart)} – ${fmtClock(state.shiftStart + shift.lengthMs)}`;
  document.getElementById("shift-worked").textContent = fmtDuration(shift.elapsedMs);
  document.getElementById("shift-bar-fill").style.width = shift.progressPct + "%";

  // topbar shift pill
  const pill = document.getElementById("shift-pill");
  const pillText = document.getElementById("shift-pill-text");
  pill.classList.toggle("ended", shift.ended);
  pillText.textContent = shift.ended ? "Shift ended" : `On shift · ${fmtDuration(shift.remainingMs)} left`;

  // tips vs PPV split (this shift)
  const tipsAmt = Math.round(state.earnedShift * state.tipsRatio);
  const ppvAmt = state.earnedShift - tipsAmt;
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

function fillSettingsForm() {
  document.getElementById("input-name").value = state.name;
  document.getElementById("input-telegram").value = state.telegram;
  document.getElementById("input-wallet").value = state.wallet;
  document.getElementById("input-timezone").value = state.timezone;

  document.getElementById("input-earned-shift").value = state.earnedShift;
  document.getElementById("input-messages-shift").value = state.messagesShift;
  document.getElementById("input-ppv-shift").value = state.ppvShift;
  document.getElementById("input-avg-check").value = state.avgCheck;
  document.getElementById("input-shift-length").value = state.shiftLengthHours;

  document.getElementById("input-paid-month").value = state.paidMonth;
  document.getElementById("input-processing").value = state.processing;
  document.getElementById("input-pending").value = state.pending;
  document.getElementById("input-rate").value = state.rate;

  document.getElementById("input-range-min").value = state.rangeMin;
  document.getElementById("input-range-max").value = state.rangeMax;
}

document.getElementById("save-settings-btn").addEventListener("click", () => {
  state = {
    ...state,
    name: document.getElementById("input-name").value.trim() || DEFAULT_STATE.name,
    telegram: document.getElementById("input-telegram").value.trim(),
    wallet: document.getElementById("input-wallet").value.trim(),
    timezone: document.getElementById("input-timezone").value.trim(),

    earnedShift: Number(document.getElementById("input-earned-shift").value) || 0,
    messagesShift: Number(document.getElementById("input-messages-shift").value) || 0,
    ppvShift: Number(document.getElementById("input-ppv-shift").value) || 0,
    avgCheck: Number(document.getElementById("input-avg-check").value) || 0,
    shiftLengthHours: Math.min(12, Math.max(1, Number(document.getElementById("input-shift-length").value) || DEFAULT_STATE.shiftLengthHours)),

    paidMonth: Number(document.getElementById("input-paid-month").value) || 0,
    processing: Number(document.getElementById("input-processing").value) || 0,
    pending: Number(document.getElementById("input-pending").value) || 0,
    rate: Number(document.getElementById("input-rate").value) || 0,
  };
  saveState(state);
  renderState();
  rebuildCharts();
  flashStatus("save-status", "Saved ✓");
});

/* ---------------- RANDOMIZER ---------------- */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.getElementById("randomize-btn").addEventListener("click", () => {
  let rangeMin = Number(document.getElementById("input-range-min").value) || DEFAULT_STATE.rangeMin;
  let rangeMax = Number(document.getElementById("input-range-max").value) || DEFAULT_STATE.rangeMax;
  if (rangeMax < rangeMin) [rangeMin, rangeMax] = [rangeMax, rangeMin];

  const shift = getShiftInfo();
  const paceHours = Math.max(shift.elapsedHours, 0.3);

  const earnedShift = randomInt(rangeMin, rangeMax);
  const ppvShift = randomInt(2, 9);
  const messagesShift = Math.round(paceHours * randomInt(35, 65));
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
    rangeMin, rangeMax,
    earnedShift, messagesShift, ppvShift, avgCheck,
    paidMonth, processing, pending, tipsRatio, offerRatio, openRatio,
  };
  saveState(state);
  renderState();
  fillSettingsForm();
  rebuildCharts();
  flashStatus("randomize-status", "Randomized 🎲");
});

document.getElementById("new-shift-btn").addEventListener("click", () => {
  state = {
    ...state,
    shiftStart: Date.now(),
    earnedShift: randomInt(0, 14),
    messagesShift: randomInt(0, 18),
    ppvShift: 0,
  };
  saveState(state);
  renderState();
  fillSettingsForm();
  rebuildCharts();
  flashStatus("randomize-status", "New shift started ▶");
});

function flashStatus(id, text) {
  const status = document.getElementById(id);
  status.textContent = text;
  status.classList.add("show");
  setTimeout(() => status.classList.remove("show"), 1800);
}

renderState();
fillSettingsForm();

// live clock — keeps elapsed/remaining/pace ticking without needing a reload
setInterval(renderState, 30000);

/* ---------------- NAVIGATION ---------------- */
const titles = {
  overview: ["Overview", "Live stats for your current shift"],
  chats: ["My Chats", "Chats assigned to you this shift"],
  stats: ["Statistics", "Breakdown of earnings and conversion this shift"],
  payouts: ["Payouts", "Your earnings and payout history"],
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

/* ---------------- CHART DATA: hour-by-hour within the current shift ---------------- */

/* Splits state.earnedShift across the hours that have already started (random weights),
   leaving hours that haven't happened yet as null so they render empty. */
function buildHourlyTotals() {
  const shift = getShiftInfo();
  const n = state.shiftLengthHours;
  const activeSlots = Math.min(n, Math.max(1, Math.ceil(shift.elapsedHours - 0.02)));

  const raws = Array.from({ length: activeSlots }, () => 0.5 + Math.random());
  const sumRaw = raws.reduce((a, b) => a + b, 0);
  const totals = raws.map(r => Math.round(state.earnedShift * (r / sumRaw)));
  const diff = state.earnedShift - totals.reduce((a, b) => a + b, 0);
  if (totals.length) totals[totals.length - 1] += diff;

  while (totals.length < n) totals.push(null);
  return totals;
}

function buildHourLabels() {
  return Array.from({ length: state.shiftLengthHours }, (_, i) => fmtClockHour(state.shiftStart + i * 3600000));
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
