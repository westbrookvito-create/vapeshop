/* NovaChat CRM — демо-дэшборд, все данные фейковые */

const palette = ["#3b82f6", "#ec4899", "#a78bfa", "#fb923c", "#34d399", "#38bdf8"];

function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
function colorFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}
function avatarStyle(name) {
  const c = colorFor(name);
  return `background:linear-gradient(135deg, ${c}, ${c}99)`;
}

/* ---------------- NAVIGATION ---------------- */
const titles = {
  overview: ["Дашборд", "Сводка по всем моделям и чаттерам за выбранный период"],
  stats: ["Статистика", "Глубокая аналитика по платформам и продажам"],
  chats: ["Чаты", "Все диалоги команды чаттеров в реальном времени"],
  models: ["Модели", "Профили моделей и их показатели"],
  team: ["Чаттеры", "Команда, смены и KPI"],
  payouts: ["Выплаты", "Финансовые операции с моделями и чаттерами"],
  settings: ["Настройки", "Профиль агентства и уведомления"],
};

document.querySelectorAll(".nav-item[data-view]").forEach(btn => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});
document.querySelectorAll("[data-goto]").forEach(el => {
  el.addEventListener("click", (e) => { e.preventDefault(); switchView(el.dataset.goto); });
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
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = "#8d97c4";
Chart.defaults.borderColor = "rgba(148,168,255,0.08)";

/* Revenue area chart */
const revCtx = document.getElementById("chart-revenue").getContext("2d");
const revGradient = revCtx.createLinearGradient(0, 0, 0, 230);
revGradient.addColorStop(0, "rgba(59,130,246,0.45)");
revGradient.addColorStop(1, "rgba(59,130,246,0)");

const revLabels = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
});
const revData = [1820, 1950, 1720, 2100, 2430, 2280, 2600, 2510, 2890, 2750, 3120, 2980, 3340, 2340];

new Chart(revCtx, {
  type: "line",
  data: {
    labels: revLabels,
    datasets: [{
      data: revData,
      borderColor: "#3b82f6",
      backgroundColor: revGradient,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "#3b82f6",
      pointHoverBorderColor: "#fff",
      borderWidth: 2.5,
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: {
      backgroundColor: "#131d47", borderColor: "rgba(148,168,255,0.15)", borderWidth: 1,
      padding: 10, titleColor: "#eef1fc", bodyColor: "#8d97c4",
      callbacks: { label: (ctx) => "  $" + ctx.parsed.y.toLocaleString("ru-RU") }
    }},
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 7 } },
      y: { grid: { color: "rgba(148,168,255,0.06)" }, ticks: { callback: v => "$" + v } }
    }
  }
});

/* Messages vs PPV bar chart */
const msgCtx = document.getElementById("chart-messages").getContext("2d");
const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
new Chart(msgCtx, {
  type: "bar",
  data: {
    labels: days,
    datasets: [
      { label: "Сообщения", data: [1240, 1380, 1190, 1520, 1610, 1980, 1740], backgroundColor: "#38bdf8", borderRadius: 6, barPercentage: 0.55 },
      { label: "PPV продано", data: [86, 94, 78, 110, 132, 168, 141], backgroundColor: "#ec4899", borderRadius: 6, barPercentage: 0.55, yAxisID: "y1" },
    ]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: {
      backgroundColor: "#131d47", borderColor: "rgba(148,168,255,0.15)", borderWidth: 1,
      padding: 10, titleColor: "#eef1fc", bodyColor: "#8d97c4",
    }},
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "rgba(148,168,255,0.06)" }, position: "left" },
      y1: { display: false, position: "right" }
    }
  }
});

/* Platform donut */
const donCtx = document.getElementById("chart-platform").getContext("2d");
new Chart(donCtx, {
  type: "doughnut",
  data: {
    labels: ["OnlyFans", "Fansly"],
    datasets: [{ data: [68, 32], backgroundColor: ["#3b82f6", "#ec4899"], borderColor: "#0e1638", borderWidth: 4 }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: { legend: { display: false }, tooltip: {
      backgroundColor: "#131d47", borderColor: "rgba(148,168,255,0.15)", borderWidth: 1,
      padding: 10, titleColor: "#eef1fc", bodyColor: "#8d97c4",
    }}
  }
});

/* ---------------- DATA: TEAM (CHATTERS) ---------------- */
const chatters = [
  { name: "Анна Ковалёва", shift: "09:00–17:00", models: 4, mph: 62, conv: "28.4%", revenue: 12480, status: "online" },
  { name: "Игорь Петренко", shift: "17:00–01:00", models: 3, mph: 54, conv: "24.1%", revenue: 10250, status: "online" },
  { name: "Марина Соколова", shift: "01:00–09:00", models: 3, mph: 41, conv: "19.8%", revenue: 7120, status: "offline" },
  { name: "Дмитрий Руденко", shift: "09:00–17:00", models: 5, mph: 58, conv: "22.6%", revenue: 9840, status: "online" },
  { name: "Светлана Лис", shift: "17:00–01:00", models: 2, mph: 47, conv: "26.9%", revenue: 8760, status: "online" },
  { name: "Богдан Мельник", shift: "01:00–09:00", models: 3, mph: 39, conv: "17.4%", revenue: 5430, status: "offline" },
];

document.getElementById("team-body").innerHTML = chatters
  .sort((a, b) => b.revenue - a.revenue)
  .map(c => `
    <tr>
      <td><div class="cell-user">
        <div class="cell-avatar" style="${avatarStyle(c.name)}">${initials(c.name)}</div>
        ${c.name}
      </div></td>
      <td>${c.shift}</td>
      <td>${c.models}</td>
      <td>${c.mph}</td>
      <td>${c.conv}</td>
      <td><b>$${c.revenue.toLocaleString("ru-RU")}</b></td>
      <td><span class="badge ${c.status}">${c.status === "online" ? "На смене" : "Не в сети"}</span></td>
    </tr>
  `).join("");

/* Leaderboard (top 4 chatters) */
document.getElementById("leaderboard").innerHTML = chatters
  .slice()
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 5)
  .map((c, i) => `
    <div class="lb-row">
      <div class="lb-rank ${i === 0 ? "top" : ""}">${i + 1}</div>
      <div class="lb-avatar" style="${avatarStyle(c.name)}">${initials(c.name)}</div>
      <div class="lb-info">
        <strong>${c.name}</strong>
        <span>Конверсия ${c.conv} · ${c.models} модели</span>
      </div>
      <div class="lb-value">
        <strong>$${c.revenue.toLocaleString("ru-RU")}</strong>
        <span>за 7 дней</span>
      </div>
    </div>
  `).join("");

/* ---------------- DATA: MODELS ---------------- */
const models = [
  { name: "Kira Storm", platforms: ["of", "fansly"], subs: 4280, mrr: 18420, growth: 74 },
  { name: "Bella Nyx", platforms: ["of"], subs: 3120, mrr: 14980, growth: 61 },
  { name: "Luna Rae", platforms: ["fansly"], subs: 1860, mrr: 6540, growth: 38 },
  { name: "Aria Vale", platforms: ["of", "fansly"], subs: 2940, mrr: 11230, growth: 55 },
  { name: "Nova Sky", platforms: ["of"], subs: 2210, mrr: 8760, growth: 47 },
  { name: "Rin Kasumi", platforms: ["fansly"], subs: 980, mrr: 3120, growth: 22 },
];

document.getElementById("model-grid").innerHTML = models.map(m => `
  <div class="model-card">
    <div class="model-card-top">
      <div class="model-avatar" style="${avatarStyle(m.name)}">${initials(m.name)}</div>
      <div>
        <div class="model-name">${m.name}</div>
        <div class="model-tags">
          ${m.platforms.map(p => `<span class="badge ${p}">${p === "of" ? "OnlyFans" : "Fansly"}</span>`).join("")}
        </div>
      </div>
    </div>
    <div class="model-stats">
      <div class="model-stat"><span>Подписчики</span><strong>${m.subs.toLocaleString("ru-RU")}</strong></div>
      <div class="model-stat"><span>Доход/мес</span><strong>$${m.mrr.toLocaleString("ru-RU")}</strong></div>
    </div>
    <div class="model-progress">
      <div class="model-progress-top"><span>Цель месяца</span><span>${m.growth}%</span></div>
      <div class="model-bar"><span style="width:${m.growth}%"></span></div>
    </div>
  </div>
`).join("");

/* ---------------- DATA: CHATS ---------------- */
const chatMessages = [
  "Привет! Как твои выходные? 😘",
  "Отправила тебе кое-что новенькое...",
  "Спасибо за подарок 💙 ты лучший",
  "Когда выложишь новый контент?",
  "Ахах, обожаю такие сообщения",
  "Я скучаю, напиши мне вечером",
  "Купил PPV, жду ответа!",
  "Это было потрясающе, хочу ещё",
];
const chatNames = ["mike_92", "daniel.k", "shadow_x", "peterR", "alex_vip", "johnny88", "kevin_b", "ryan_t", "chris_w", "brandon99", "tommy_l", "eric_j"];

function randomChats(n) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    const model = models[Math.floor(Math.random() * models.length)];
    const chatter = chatters[Math.floor(Math.random() * chatters.length)];
    const online = Math.random() > 0.35;
    const unread = Math.random() > 0.5 ? Math.floor(Math.random() * 6) + 1 : 0;
    const mins = Math.floor(Math.random() * 58) + 1;
    rows.push({
      user: chatNames[Math.floor(Math.random() * chatNames.length)] + Math.floor(Math.random() * 90),
      model, chatter, online, unread,
      msg: chatMessages[Math.floor(Math.random() * chatMessages.length)],
      time: mins < 60 ? `${mins} мин назад` : "1 ч назад",
    });
  }
  return rows;
}

document.getElementById("chat-list").innerHTML = randomChats(12).map(r => `
  <div class="chat-row">
    <div class="chat-avatar" style="${avatarStyle(r.user)}">
      ${initials(r.user)}
      <span class="status-dot ${r.online ? "on" : "off"}"></span>
    </div>
    <div class="chat-mid">
      <div class="chat-mid-top">
        <strong>@${r.user}</strong>
        <span class="tag">${r.model.name}</span>
        ${r.unread ? `<span class="unread-badge">${r.unread}</span>` : ""}
      </div>
      <div class="chat-preview"><b>${r.online ? "онлайн" : "не в сети"}:</b> ${r.msg}</div>
    </div>
    <div class="chat-assign">${r.chatter.name.split(" ")[0]}<span>чаттер</span></div>
    <div class="chat-meta">${r.time}</div>
  </div>
`).join("");

/* ---------------- DATA: ACTIVITY FEED ---------------- */
const activityTemplates = [
  (c, m, u) => `<b>${c}</b> закрыл(а) PPV на <b>$${u}</b> для модели <b>${m}</b>`,
  (c, m, u) => `Новая подписка у <b>${m}</b> от @user${u}`,
  (c, m, u) => `<b>${c}</b> отправил(а) массовую рассылку по <b>${m}</b>`,
  (c, m, u) => `Выплата <b>$${u}</b> отправлена модели <b>${m}</b>`,
  (c, m, u) => `<b>${c}</b> начал(а) смену на модели <b>${m}</b>`,
];
const activityColor = ["#34d399", "#3b82f6", "#a78bfa", "#fbbf24", "#38bdf8"];

const feed = Array.from({ length: 8 }, (_, i) => {
  const t = Math.floor(Math.random() * activityTemplates.length);
  const c = chatters[Math.floor(Math.random() * chatters.length)].name.split(" ")[0];
  const m = models[Math.floor(Math.random() * models.length)].name;
  const u = t === 3 ? (Math.floor(Math.random() * 400) + 100) : (Math.floor(Math.random() * 90) + 15);
  return {
    text: activityTemplates[t](c, m, u),
    color: activityColor[t],
    time: `${(i + 1) * 4} мин назад`,
  };
});

document.getElementById("activity-feed").innerHTML = feed.map(a => `
  <div class="activity-row">
    <span class="activity-dot" style="background:${a.color}"></span>
    <div>
      <div class="activity-text">${a.text}</div>
      <div class="activity-time">${a.time}</div>
    </div>
  </div>
`).join("");

/* ---------------- DATA: TOP SPENDERS ---------------- */
const spenders = [
  { user: "mike_92", model: "Kira Storm", platform: "of", spent: 3240, purchases: 18, last: "2 ч назад" },
  { user: "daniel.k", model: "Bella Nyx", platform: "of", spent: 2860, purchases: 14, last: "5 ч назад" },
  { user: "shadow_x", model: "Aria Vale", platform: "fansly", spent: 2410, purchases: 11, last: "1 д назад" },
  { user: "alex_vip", model: "Kira Storm", platform: "of", spent: 1980, purchases: 9, last: "3 ч назад" },
  { user: "johnny88", model: "Nova Sky", platform: "of", spent: 1740, purchases: 8, last: "6 ч назад" },
  { user: "kevin_b", model: "Luna Rae", platform: "fansly", spent: 1320, purchases: 7, last: "2 д назад" },
];

document.getElementById("spenders-body").innerHTML = spenders.map(s => `
  <tr>
    <td><div class="cell-user">
      <div class="cell-avatar" style="${avatarStyle(s.user)}">${initials(s.user)}</div>
      @${s.user}
    </div></td>
    <td>${s.model}</td>
    <td><span class="badge ${s.platform}">${s.platform === "of" ? "OnlyFans" : "Fansly"}</span></td>
    <td><b>$${s.spent.toLocaleString("ru-RU")}</b></td>
    <td>${s.purchases}</td>
    <td>${s.last}</td>
  </tr>
`).join("");

/* ---------------- DATA: PAYOUTS ---------------- */
const payoutPeople = [...models.map(m => ({ name: m.name, role: "Модель" })), ...chatters.map(c => ({ name: c.name, role: "Чаттер" }))];
const methods = ["Банковский перевод", "Криптовалюта (USDT)", "PayPal", "Wise"];
const statuses = [
  { key: "paid", label: "Выплачено" },
  { key: "processing", label: "В обработке" },
  { key: "pending", label: "Ожидает" },
];

function randomPayouts(n) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    const p = payoutPeople[Math.floor(Math.random() * payoutPeople.length)];
    const st = statuses[Math.floor(Math.random() * statuses.length)];
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 25));
    rows.push({
      id: "PO-" + (10450 + i),
      person: p,
      amount: Math.floor(Math.random() * 4200) + 380,
      method: methods[Math.floor(Math.random() * methods.length)],
      status: st,
      date: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }),
    });
  }
  return rows.sort((a, b) => new Date(b.date.split(".").reverse().join("-")) - new Date(a.date.split(".").reverse().join("-")));
}

document.getElementById("payouts-body").innerHTML = randomPayouts(10).map(p => `
  <tr>
    <td>${p.id}</td>
    <td><div class="cell-user">
      <div class="cell-avatar" style="${avatarStyle(p.person.name)}">${initials(p.person.name)}</div>
      ${p.person.name}
    </div></td>
    <td>${p.person.role}</td>
    <td>Авг 2026</td>
    <td><b>$${p.amount.toLocaleString("ru-RU")}</b></td>
    <td>${p.method}</td>
    <td><span class="badge ${p.status.key}">${p.status.label}</span></td>
    <td>${p.date}</td>
  </tr>
`).join("");
