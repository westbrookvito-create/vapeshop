/* Chatter dashboard — demo, all data is fake / editable */

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
  earnedToday: 186,
  earnedWeek: 1240,
  earnedMonth: 5380,
  messagesToday: 342,
  ppvToday: 7,
  avgCheck: 38,
  paidMonth: 4820,
  processing: 640,
  pending: 180,
  rate: 15,
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

function renderState() {
  document.getElementById("kpi-earned-today").textContent = money(state.earnedToday);
  document.getElementById("kpi-earned-week").textContent = money(state.earnedWeek);
  document.getElementById("kpi-earned-month").textContent = money(state.earnedMonth);
  document.getElementById("kpi-messages-today").textContent = Number(state.messagesToday || 0).toLocaleString("en-US");
  document.getElementById("kpi-ppv-today").textContent = state.ppvToday;
  document.getElementById("kpi-avg-check").textContent = money(state.avgCheck);

  document.getElementById("kpi-paid-month").textContent = money(state.paidMonth);
  document.getElementById("kpi-processing").textContent = money(state.processing);
  document.getElementById("kpi-pending").textContent = money(state.pending);
  document.getElementById("kpi-rate").textContent = state.rate + "%";

  document.getElementById("user-name").textContent = state.name;
  document.getElementById("user-avatar").textContent = initials(state.name || "??");
}

function fillSettingsForm() {
  document.getElementById("input-name").value = state.name;
  document.getElementById("input-telegram").value = state.telegram;
  document.getElementById("input-wallet").value = state.wallet;
  document.getElementById("input-timezone").value = state.timezone;
  document.getElementById("input-earned-today").value = state.earnedToday;
  document.getElementById("input-earned-week").value = state.earnedWeek;
  document.getElementById("input-earned-month").value = state.earnedMonth;
  document.getElementById("input-messages-today").value = state.messagesToday;
  document.getElementById("input-ppv-today").value = state.ppvToday;
  document.getElementById("input-avg-check").value = state.avgCheck;
  document.getElementById("input-paid-month").value = state.paidMonth;
  document.getElementById("input-processing").value = state.processing;
  document.getElementById("input-pending").value = state.pending;
  document.getElementById("input-rate").value = state.rate;
}

document.getElementById("save-settings-btn").addEventListener("click", () => {
  state = {
    name: document.getElementById("input-name").value.trim() || DEFAULT_STATE.name,
    telegram: document.getElementById("input-telegram").value.trim(),
    wallet: document.getElementById("input-wallet").value.trim(),
    timezone: document.getElementById("input-timezone").value.trim(),
    earnedToday: Number(document.getElementById("input-earned-today").value) || 0,
    earnedWeek: Number(document.getElementById("input-earned-week").value) || 0,
    earnedMonth: Number(document.getElementById("input-earned-month").value) || 0,
    messagesToday: Number(document.getElementById("input-messages-today").value) || 0,
    ppvToday: Number(document.getElementById("input-ppv-today").value) || 0,
    avgCheck: Number(document.getElementById("input-avg-check").value) || 0,
    paidMonth: Number(document.getElementById("input-paid-month").value) || 0,
    processing: Number(document.getElementById("input-processing").value) || 0,
    pending: Number(document.getElementById("input-pending").value) || 0,
    rate: Number(document.getElementById("input-rate").value) || 0,
  };
  saveState(state);
  renderState();
  const status = document.getElementById("save-status");
  status.textContent = "Saved ✓";
  status.classList.add("show");
  setTimeout(() => status.classList.remove("show"), 1800);
});

renderState();
fillSettingsForm();

/* ---------------- NAVIGATION ---------------- */
const titles = {
  overview: ["Overview", "Your stats for the selected period"],
  chats: ["My Chats", "Chats assigned to you this shift"],
  stats: ["Statistics", "Breakdown of earnings and conversion"],
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
}

document.querySelectorAll(".range-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".range-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

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

/* Earnings line chart — sharp straight segments, green up / red down */
const revLabels = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" });
});
const revData = [142, 168, 121, 195, 176, 210, 158, 224, 201, 245, 189, 260, 232, 186];

new Chart(document.getElementById("chart-revenue").getContext("2d"), {
  type: "line",
  data: {
    labels: revLabels,
    datasets: [{
      data: revData,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBorderWidth: 0,
      tension: 0,
      fill: false,
      segment: {
        borderColor: ctx => ctx.p0.parsed.y <= ctx.p1.parsed.y ? GREEN : RED,
      },
      pointHoverBackgroundColor: ctx => {
        const i = ctx.dataIndex;
        if (i === 0) return GREEN;
        return revData[i] >= revData[i - 1] ? GREEN : RED;
      },
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#181c26", borderColor: "#232838", borderWidth: 1,
        padding: 8, titleColor: "#dfe2ea", bodyColor: "#8a90a3",
        callbacks: { label: (ctx) => "  $" + ctx.parsed.y }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 7 } },
      y: { grid: { color: "#161a24" }, ticks: { callback: v => "$" + v } }
    }
  }
});

/* Tips vs PPV bar chart — flat green / red */
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
new Chart(document.getElementById("chart-messages").getContext("2d"), {
  type: "bar",
  data: {
    labels: days,
    datasets: [
      { label: "Tips", data: [42, 58, 30, 66, 74, 96, 51], backgroundColor: GREEN, borderRadius: 2, barPercentage: 0.55 },
      { label: "PPV", data: [80, 64, 96, 58, 112, 140, 90], backgroundColor: RED, borderRadius: 2, barPercentage: 0.55 },
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
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

/* Tips vs PPV donut — flat colors */
new Chart(document.getElementById("chart-split").getContext("2d"), {
  type: "doughnut",
  data: {
    labels: ["Tips", "PPV"],
    datasets: [{ data: [41, 59], backgroundColor: [GREEN, RED], borderColor: "#12151d", borderWidth: 3 }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: { legend: { display: false }, tooltip: {
      backgroundColor: "#181c26", borderColor: "#232838", borderWidth: 1,
      padding: 8, titleColor: "#dfe2ea", bodyColor: "#8a90a3",
    }}
  }
});

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

/* ---------------- DATA: TOP SPENDERS (my clients) ---------------- */
const spenders = [
  { user: "mike_92", model: "Kira Storm", platform: "of", spent: 640, purchases: 9, last: "2h ago" },
  { user: "daniel.k", model: "Aria Vale", platform: "of", spent: 480, purchases: 7, last: "5h ago" },
  { user: "shadow_x", model: "Nova Sky", platform: "fansly", spent: 410, purchases: 6, last: "1d ago" },
  { user: "alex_vip", model: "Kira Storm", platform: "of", spent: 310, purchases: 5, last: "3h ago" },
  { user: "johnny88", model: "Aria Vale", platform: "of", spent: 260, purchases: 4, last: "6h ago" },
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
