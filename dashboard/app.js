/* Кабинет чаттера — демо, все данные условные */

function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

/* ---------------- NAVIGATION ---------------- */
const titles = {
  overview: ["Обзор", "Твоя статистика за выбранный период"],
  chats: ["Мои чаты", "Диалоги, назначенные на тебя в эту смену"],
  stats: ["Статистика", "Разбивка заработка и конверсии"],
  payouts: ["Выплаты", "Твои начисления и история выплат"],
  settings: ["Настройки", "Профиль и уведомления"],
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
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
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

/* Донаты vs PPV bar chart — flat green / red */
const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
new Chart(document.getElementById("chart-messages").getContext("2d"), {
  type: "bar",
  data: {
    labels: days,
    datasets: [
      { label: "Донаты", data: [42, 58, 30, 66, 74, 96, 51], backgroundColor: GREEN, borderRadius: 2, barPercentage: 0.55 },
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

/* Донаты vs PPV donut — flat colors */
new Chart(document.getElementById("chart-split").getContext("2d"), {
  type: "doughnut",
  data: {
    labels: ["Донаты", "PPV"],
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
    const isDonate = Math.random() > 0.45;
    const user = feedUsers[Math.floor(Math.random() * feedUsers.length)];
    const model = feedModels[Math.floor(Math.random() * feedModels.length)];
    const amount = isDonate ? Math.floor(Math.random() * 60) + 10 : Math.floor(Math.random() * 90) + 20;
    rows.push({
      text: `${isDonate ? "Донат" : "PPV куплен"} · @${user} · ${model}`,
      amount, isDonate,
      time: `${(i + 1) * 7} мин назад`,
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
    <div class="activity-amount ${f.isDonate ? "green" : "red"}">+$${f.amount}</div>
  </div>
`).join("");

/* ---------------- DATA: CHATS ---------------- */
const chatMessages = [
  "Привет! Как твои выходные? 😘",
  "Отправила тебе кое-что новенькое...",
  "Спасибо за подарок, ты лучший",
  "Когда выложишь новый контент?",
  "Ахах, обожаю такие сообщения",
  "Я скучаю, напиши мне вечером",
  "Купил PPV, жду ответа!",
  "Это было потрясающе, хочу ещё",
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
      time: `${mins} мин назад`,
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
  { user: "mike_92", model: "Kira Storm", platform: "of", spent: 640, purchases: 9, last: "2 ч назад" },
  { user: "daniel.k", model: "Aria Vale", platform: "of", spent: 480, purchases: 7, last: "5 ч назад" },
  { user: "shadow_x", model: "Nova Sky", platform: "fansly", spent: 410, purchases: 6, last: "1 д назад" },
  { user: "alex_vip", model: "Kira Storm", platform: "of", spent: 310, purchases: 5, last: "3 ч назад" },
  { user: "johnny88", model: "Aria Vale", platform: "of", spent: 260, purchases: 4, last: "6 ч назад" },
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
const methods = ["Криптовалюта (USDT)", "Банковский перевод", "PayPal"];
const statuses = [
  { key: "paid", label: "Выплачено" },
  { key: "processing", label: "В обработке" },
  { key: "pending", label: "Ожидает" },
];

function randomPayouts(n) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    const st = statuses[Math.floor(Math.random() * statuses.length)];
    const d = new Date();
    d.setDate(d.getDate() - i * 7 - Math.floor(Math.random() * 3));
    rows.push({
      id: "PO-" + (8820 + i),
      amount: Math.floor(Math.random() * 900) + 300,
      method: methods[Math.floor(Math.random() * methods.length)],
      status: i === 0 ? statuses[2] : (i === 1 ? statuses[1] : statuses[0]),
      date: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }),
    });
  }
  return rows;
}

document.getElementById("payouts-body").innerHTML = randomPayouts(7).map((p, i) => `
  <tr>
    <td>${p.id}</td>
    <td>Неделя ${7 - i}</td>
    <td><b>$${p.amount}</b></td>
    <td>${p.method}</td>
    <td><span class="badge ${p.status.key}">${p.status.label}</span></td>
    <td>${p.date}</td>
  </tr>
`).join("");
