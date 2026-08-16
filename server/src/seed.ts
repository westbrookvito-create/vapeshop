import { db, seedIfEmpty } from "./db.js";

const gradients = [
  "linear-gradient(135deg,#7b2ff7,#f107a3)",
  "linear-gradient(135deg,#00c6ff,#0072ff)",
  "linear-gradient(135deg,#11998e,#38ef7d)",
  "linear-gradient(135deg,#f857a6,#ff5858)",
  "linear-gradient(135deg,#7f00ff,#e100ff)",
  "linear-gradient(135deg,#00d2ff,#3a47d5)",
  "linear-gradient(135deg,#f7971e,#ffd200)",
  "linear-gradient(135deg,#ee0979,#ff6a00)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#0ba360,#3cba92)",
  "linear-gradient(135deg,#5f2c82,#49a09d)",
];

function seed() {
  if (!seedIfEmpty()) {
    console.log("DB already seeded, skipping.");
    return;
  }

  const insertCategory = db.prepare(
    "INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)"
  );
  const categories = [
    ["Одноразки", "🔥", 1],
    ["POD-системы", "🧊", 2],
    ["Жидкости", "🧪", 3],
    ["Солевой никотин", "🧂", 4],
    ["Картриджи", "🔋", 5],
    ["Аксессуары", "🛠", 6],
  ];
  const catIds: number[] = [];
  for (const [name, icon, order] of categories) {
    const r = insertCategory.run(name, icon, order);
    catIds.push(Number(r.lastInsertRowid));
  }
  const [disposables, pods, liquids, salts, cartridges, accessories] = catIds;

  const insertProduct = db.prepare(`
    INSERT INTO products
      (category_id, name, brand, description, price, old_price, stock, rating, reviews_count,
       nicotine, flavor, puffs, gradient, emoji, is_featured, is_new, is_active)
    VALUES (@category_id, @name, @brand, @description, @price, @old_price, @stock, @rating, @reviews_count,
       @nicotine, @flavor, @puffs, @gradient, @emoji, @is_featured, @is_new, @is_active)
  `);

  type P = {
    category_id: number; name: string; brand: string; description: string;
    price: number; old_price: number | null; stock: number; rating: number; reviews_count: number;
    nicotine: string; flavor: string; puffs: number | null; gradient: string; emoji: string;
    is_featured: number; is_new: number; is_active: number;
  };

  const products: P[] = [
    // Disposables
    { category_id: disposables, name: "Elf Bar BC5000", brand: "Elf Bar", description: "Одноразовое устройство на 5000 затяжек с насыщенным вкусом и стабильной подачей пара от первой до последней затяжки.", price: 1490, old_price: 1790, stock: 42, rating: 4.8, reviews_count: 231, nicotine: JSON.stringify([20, 50]), flavor: "Арбуз-лёд", puffs: 5000, gradient: gradients[0], emoji: "🍉", is_featured: 1, is_new: 0, is_active: 1 },
    { category_id: disposables, name: "HQD Cuvie Air", brand: "HQD", description: "Компактная одноразка с мягкой тягой, идеально для новичков. Яркий фруктовый вкус держится до конца заряда.", price: 990, old_price: null, stock: 65, rating: 4.6, reviews_count: 154, nicotine: JSON.stringify([20]), flavor: "Малина-лимонад", puffs: 3000, gradient: gradients[3], emoji: "🍓", is_featured: 1, is_new: 1, is_active: 1 },
    { category_id: disposables, name: "Lost Mary OS4000", brand: "Lost Mary", description: "Обновлённая линейка с сетчатым испарителем mesh coil, плотный пар и точная передача вкуса.", price: 1350, old_price: null, stock: 30, rating: 4.7, reviews_count: 189, nicotine: JSON.stringify([20, 50]), flavor: "Манго-маракуйя", puffs: 4000, gradient: gradients[7], emoji: "🥭", is_featured: 0, is_new: 1, is_active: 1 },
    { category_id: disposables, name: "Plonq Alpha", brand: "Plonq", description: "Российский бестселлер с богатой линейкой вкусов и увеличенным объёмом жидкости.", price: 890, old_price: 1050, stock: 88, rating: 4.5, reviews_count: 302, nicotine: JSON.stringify([20]), flavor: "Кола-лёд", puffs: 3500, gradient: gradients[1], emoji: "🥤", is_featured: 0, is_new: 0, is_active: 1 },
    { category_id: disposables, name: "IZI Mini 1500", brand: "IZI", description: "Лёгкая карманная одноразка на каждый день, мягкий вкус и компактный корпус.", price: 650, old_price: null, stock: 120, rating: 4.3, reviews_count: 98, nicotine: JSON.stringify([20]), flavor: "Черника-йогурт", puffs: 1500, gradient: gradients[9], emoji: "🫐", is_featured: 0, is_new: 0, is_active: 1 },
    { category_id: disposables, name: "Waka SoPro PA10000", brand: "Waka", description: "Флагманская одноразка с экраном заряда и увеличенным ресурсом до 10000 затяжек.", price: 2190, old_price: 2490, stock: 18, rating: 4.9, reviews_count: 76, nicotine: JSON.stringify([20, 50]), flavor: "Дыня-лёд", puffs: 10000, gradient: gradients[8], emoji: "🍈", is_featured: 1, is_new: 1, is_active: 1 },

    // POD systems
    { category_id: pods, name: "Voopoo Drag X2", brand: "Voopoo", description: "Мощная под-система с чипом GENE.TT, регулировкой мощности и ярким дисплеем.", price: 3990, old_price: 4490, stock: 24, rating: 4.8, reviews_count: 143, nicotine: JSON.stringify([0, 20, 50]), flavor: "—", puffs: null, gradient: gradients[5], emoji: "⚡️", is_featured: 1, is_new: 0, is_active: 1 },
    { category_id: pods, name: "Vaporesso XROS 4", brand: "Vaporesso", description: "Компактный под с автоматической и кнопочной затяжкой, регулировкой воздушного потока.", price: 2790, old_price: null, stock: 40, rating: 4.7, reviews_count: 210, nicotine: JSON.stringify([0, 20, 50]), flavor: "—", puffs: null, gradient: gradients[2], emoji: "💎", is_featured: 1, is_new: 1, is_active: 1 },
    { category_id: pods, name: "Uwell Caliburn G3", brand: "Uwell", description: "Легендарная серия Caliburn — минималистичный дизайн и точная передача вкуса.", price: 2450, old_price: null, stock: 33, rating: 4.9, reviews_count: 267, nicotine: JSON.stringify([0, 20, 50]), flavor: "—", puffs: null, gradient: gradients[6], emoji: "🔷", is_featured: 0, is_new: 0, is_active: 1 },
    { category_id: pods, name: "GeekVape Wenax S3", brand: "GeekVape", description: "Стильный под-мод с большим экраном и поддержкой сменных испарителей серии Z.", price: 2990, old_price: 3390, stock: 15, rating: 4.6, reviews_count: 88, nicotine: JSON.stringify([0, 20, 50]), flavor: "—", puffs: null, gradient: gradients[10], emoji: "🌀", is_featured: 0, is_new: 0, is_active: 1 },

    // Liquids
    { category_id: liquids, name: "Jam Monster 100ml", brand: "Jam Monster", description: "Культовая американская жидкость со вкусом джема и тоста. Плотный ПГ/ВГ баланс 30/70.", price: 1590, old_price: null, stock: 55, rating: 4.8, reviews_count: 176, nicotine: JSON.stringify([0, 3, 6]), flavor: "Клубничный джем", puffs: null, gradient: gradients[4], emoji: "🍓", is_featured: 0, is_new: 0, is_active: 1 },
    { category_id: liquids, name: "Cotton Candy Cloud 60ml", brand: "Cloud Nurdz", description: "Сладкая сахарная вата с лёгкой кислинкой на выдохе. Отличное облакогонство.", price: 1290, old_price: 1490, stock: 47, rating: 4.6, reviews_count: 120, nicotine: JSON.stringify([0, 3]), flavor: "Сахарная вата", puffs: null, gradient: gradients[9], emoji: "☁️", is_featured: 0, is_new: 1, is_active: 1 },
    { category_id: liquids, name: "Fruity Fuel Green Oil", brand: "Fruity Fuel", description: "Французская жидкость с ярким цитрусово-мятным вкусом, премиальный ПГ/ВГ баланс.", price: 1450, old_price: null, stock: 38, rating: 4.7, reviews_count: 94, nicotine: JSON.stringify([0, 3, 6]), flavor: "Цитрус-мята", puffs: null, gradient: gradients[2], emoji: "🍋", is_featured: 0, is_new: 0, is_active: 1 },

    // Salt nicotine
    { category_id: salts, name: "Skwezed Salt Peach", brand: "Skwezed", description: "Солевой никотин с натуральным персиковым вкусом, мягкая подача для pod-систем.", price: 890, old_price: null, stock: 70, rating: 4.5, reviews_count: 133, nicotine: JSON.stringify([20, 35, 50]), flavor: "Персик", puffs: null, gradient: gradients[7], emoji: "🍑", is_featured: 0, is_new: 0, is_active: 1 },
    { category_id: salts, name: "Rush Salt Cola Ice", brand: "Rush", description: "Освежающая кола со льдом на солевом никотине, быстрый приход и чистое послевкусие.", price: 790, old_price: 890, stock: 90, rating: 4.4, reviews_count: 205, nicotine: JSON.stringify([20, 50]), flavor: "Кола-лёд", puffs: null, gradient: gradients[1], emoji: "🧊", is_featured: 1, is_new: 0, is_active: 1 },
    { category_id: salts, name: "Nasty Salt Bad Blood", brand: "Nasty", description: "Микс лесных ягод с холодком, культовый вкус на солевом никотине.", price: 850, old_price: null, stock: 60, rating: 4.7, reviews_count: 167, nicotine: JSON.stringify([20, 35]), flavor: "Ягодный микс", puffs: null, gradient: gradients[0], emoji: "🫐", is_featured: 0, is_new: 1, is_active: 1 },

    // Cartridges
    { category_id: cartridges, name: "Caliburn G Картридж 2шт", brand: "Uwell", description: "Сменные картриджи 0.8 Ом для Caliburn G/G2, комплект 2 штуки.", price: 490, old_price: null, stock: 150, rating: 4.6, reviews_count: 88, nicotine: JSON.stringify([]), flavor: "—", puffs: null, gradient: gradients[6], emoji: "🔩", is_featured: 0, is_new: 0, is_active: 1 },
    { category_id: cartridges, name: "XROS Pod 0.6 Ом 2шт", brand: "Vaporesso", description: "Оригинальные поды для линейки XROS, сетчатый испаритель, комплект 2 штуки.", price: 550, old_price: null, stock: 130, rating: 4.7, reviews_count: 102, nicotine: JSON.stringify([]), flavor: "—", puffs: null, gradient: gradients[8], emoji: "🔩", is_featured: 0, is_new: 0, is_active: 1 },

    // Accessories
    { category_id: accessories, name: "Зарядное USB-C 20W", brand: "VapeTech", description: "Быстрая зарядка для под-систем и одноразок с USB-C, поддержка PD.", price: 690, old_price: null, stock: 200, rating: 4.5, reviews_count: 64, nicotine: JSON.stringify([]), flavor: "—", puffs: null, gradient: gradients[5], emoji: "🔌", is_featured: 0, is_new: 0, is_active: 1 },
    { category_id: accessories, name: "Чехол силиконовый универсальный", brand: "VapeTech", description: "Защитный силиконовый чехол для большинства под-систем, 6 цветов на выбор.", price: 390, old_price: null, stock: 300, rating: 4.3, reviews_count: 41, nicotine: JSON.stringify([]), flavor: "—", puffs: null, gradient: gradients[11], emoji: "🧷", is_featured: 0, is_new: 0, is_active: 1 },
    { category_id: accessories, name: "Ключ-тестер сопротивления", brand: "VapeTech", description: "Компактный тестер для проверки испарителей перед установкой.", price: 1190, old_price: null, stock: 25, rating: 4.6, reviews_count: 29, nicotine: JSON.stringify([]), flavor: "—", puffs: null, gradient: gradients[10], emoji: "🧰", is_featured: 0, is_new: 0, is_active: 1 },
  ];

  const insertMany = db.transaction((items: P[]) => {
    for (const p of items) insertProduct.run(p);
  });
  insertMany(products);

  // Promo codes
  const insertPromo = db.prepare(
    "INSERT INTO promo_codes (code, discount_percent, active, usage_limit, used_count) VALUES (?, ?, ?, ?, ?)"
  );
  insertPromo.run("VAPE10", 10, 1, 0, 34);
  insertPromo.run("FIRST15", 15, 1, 500, 212);
  insertPromo.run("CLOUD20", 20, 1, 100, 88);
  insertPromo.run("OLDONE5", 5, 0, 0, 12);

  // Demo users
  const insertUser = db.prepare(`
    INSERT INTO users (telegram_id, first_name, last_name, username, phone, bonus_points, is_banned, created_at)
    VALUES (@telegram_id, @first_name, @last_name, @username, @phone, @bonus_points, @is_banned, @created_at)
  `);
  const demoUsers = [
    { telegram_id: 100001, first_name: "Игорь", last_name: "Смирнов", username: "igorsmirnov", phone: "+7 900 111-22-33", bonus_points: 320, is_banned: 0, created_at: "2026-06-02 10:00:00" },
    { telegram_id: 100002, first_name: "Алина", last_name: "Ковалёва", username: "alina_k", phone: "+7 901 222-33-44", bonus_points: 150, is_banned: 0, created_at: "2026-06-10 12:30:00" },
    { telegram_id: 100003, first_name: "Дмитрий", last_name: "Петров", username: "dpetrov", phone: "+7 902 333-44-55", bonus_points: 40, is_banned: 0, created_at: "2026-07-01 09:15:00" },
    { telegram_id: 100004, first_name: "Мария", last_name: "Орлова", username: "morlova", phone: "+7 903 444-55-66", bonus_points: 780, is_banned: 0, created_at: "2026-05-20 18:45:00" },
    { telegram_id: 100005, first_name: "Спамер", last_name: "Бот", username: "spam_bot_1", phone: "", bonus_points: 0, is_banned: 1, created_at: "2026-07-28 08:00:00" },
    { telegram_id: 555000111, first_name: "Vitaliy", last_name: "Admin", username: "vito_admin", phone: "+7 999 000-00-00", bonus_points: 0, is_banned: 0, created_at: "2026-01-15 08:00:00" },
  ];
  for (const u of demoUsers) insertUser.run(u);

  // Demo orders
  const insertOrder = db.prepare(`
    INSERT INTO orders (user_id, user_name, user_username, items, subtotal, discount, total, status, delivery_method, address, payment_method, promo_code, comment, created_at)
    VALUES (@user_id, @user_name, @user_username, @items, @subtotal, @discount, @total, @status, @delivery_method, @address, @payment_method, @promo_code, @comment, @created_at)
  `);

  const sampleItems = (rows: { id: number; name: string; price: number; qty: number; flavor?: string }[]) =>
    JSON.stringify(rows);

  const demoOrders = [
    { user_id: 100001, user_name: "Игорь Смирнов", user_username: "igorsmirnov", items: sampleItems([{ id: 1, name: "Elf Bar BC5000", price: 1490, qty: 2, flavor: "Арбуз-лёд" }]), subtotal: 2980, discount: 0, total: 2980, status: "completed", delivery_method: "delivery", address: "г. Москва, ул. Ленина, 12, кв. 45", payment_method: "card", promo_code: "", comment: "", created_at: "2026-08-10 14:22:00" },
    { user_id: 100002, user_name: "Алина Ковалёва", user_username: "alina_k", items: sampleItems([{ id: 7, name: "Voopoo Drag X2", price: 3990, qty: 1 }, { id: 16, name: "Caliburn G Картридж 2шт", price: 490, qty: 2 }]), subtotal: 4970, discount: 497, total: 4473, status: "shipped", delivery_method: "delivery", address: "г. Санкт-Петербург, Невский пр-т, 88", payment_method: "card", promo_code: "VAPE10", comment: "Курьеру позвонить заранее", created_at: "2026-08-13 09:05:00" },
    { user_id: 100003, user_name: "Дмитрий Петров", user_username: "dpetrov", items: sampleItems([{ id: 2, name: "HQD Cuvie Air", price: 990, qty: 3, flavor: "Малина-лимонад" }]), subtotal: 2970, discount: 0, total: 2970, status: "processing", delivery_method: "pickup", address: "Самовывоз: ТЦ Галерея, точка №4", payment_method: "cash", promo_code: "", comment: "", created_at: "2026-08-15 17:40:00" },
    { user_id: 100004, user_name: "Мария Орлова", user_username: "morlova", items: sampleItems([{ id: 6, name: "Waka SoPro PA10000", price: 2190, qty: 1, flavor: "Дыня-лёд" }, { id: 12, name: "Cotton Candy Cloud 60ml", price: 1290, qty: 1, flavor: "Сахарная вата" }]), subtotal: 3480, discount: 696, total: 2784, status: "new", delivery_method: "delivery", address: "г. Казань, ул. Баумана, 3", payment_method: "card", promo_code: "CLOUD20", comment: "", created_at: "2026-08-16 08:12:00" },
    { user_id: 100001, user_name: "Игорь Смирнов", user_username: "igorsmirnov", items: sampleItems([{ id: 9, name: "Uwell Caliburn G3", price: 2450, qty: 1 }]), subtotal: 2450, discount: 0, total: 2450, status: "cancelled", delivery_method: "delivery", address: "г. Москва, ул. Ленина, 12, кв. 45", payment_method: "card", promo_code: "", comment: "Заказ отменён клиентом", created_at: "2026-08-05 11:00:00" },
    { user_id: 100002, user_name: "Алина Ковалёва", user_username: "alina_k", items: sampleItems([{ id: 15, name: "Rush Salt Cola Ice", price: 790, qty: 4, flavor: "Кола-лёд" }]), subtotal: 3160, discount: 0, total: 3160, status: "completed", delivery_method: "pickup", address: "Самовывоз: ТЦ Галерея, точка №4", payment_method: "cash", promo_code: "", comment: "", created_at: "2026-08-08 16:20:00" },
  ];
  for (const o of demoOrders) insertOrder.run(o);

  // Settings
  const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
  insertSetting.run("shop_name", "CloudBar Vape Shop");
  insertSetting.run("shop_description", "Премиальные вейпы, жидкости и аксессуары с доставкой по России");
  insertSetting.run("delivery_price", "300");
  insertSetting.run("free_delivery_from", "3000");
  insertSetting.run("support_username", "cloudbar_support");
  insertSetting.run("min_age", "18");

  console.log(`Seeded ${products.length} products in ${categories.length} categories, ${demoOrders.length} orders, ${demoUsers.length} users.`);
}

seed();
