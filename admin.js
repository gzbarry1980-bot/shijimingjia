const ROLE_LABELS = {
  super: "超级管理员",
  admin: "管理员",
  staff: "员工",
};

const ROLE_HELP = {
  super: "账号新建、密码修改、商品、订单和配置全部权限",
  admin: "商品上下架、改价库存、订单和基础配置",
  staff: "订单确认、发货流程和查看数据",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const state = {
  user: null,
  products: [],
  orders: [],
  users: [],
  settings: null,
  tasks: [],
};

const nodes = {
  productRows: $("#productRows"),
  orderRows: $("#orderRows"),
  userRows: $("#userRows"),
  statProducts: $("#statProducts"),
  statStock: $("#statStock"),
  statOrders: $("#statOrders"),
  statRevenue: $("#statRevenue"),
  reportDate: $("#reportDate"),
  todayOrders: $("#todayOrders"),
  todayRevenue: $("#todayRevenue"),
  yesterdayOrders: $("#yesterdayOrders"),
  avgOrderValue: $("#avgOrderValue"),
  dailyChart: $("#dailyChart"),
  statusChart: $("#statusChart"),
  productRanking: $("#productRanking"),
  stockAlerts: $("#stockAlerts"),
  addProductForm: $("#addProductForm"),
  loginScreen: $("#loginScreen"),
  loginForm: $("#loginForm"),
  loginMessage: $("#loginMessage"),
  passwordForm: $("#passwordForm"),
  passwordMessage: $("#passwordMessage"),
  userForm: $("#userForm"),
  userMessage: $("#userMessage"),
  paymentForm: $("#paymentForm"),
  paymentMessage: $("#paymentMessage"),
  shippingForm: $("#shippingForm"),
  shippingMessage: $("#shippingMessage"),
  contentForm: $("#contentForm"),
  contentMessage: $("#contentMessage"),
  contentTasks: $("#contentTasks"),
  currentUser: $("#currentUser"),
  adminShell: $(".admin-shell"),
};

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function productTitle(product) {
  return product.name?.zh || product.name?.en || product.id;
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function shortDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function orderDateKey(order) {
  return dateKey(new Date(order.createdAt));
}

function showMessage(node, text, type = "") {
  node.textContent = text;
  node.className = `form-message ${type}`;
}

function canManageProducts() {
  return state.user && ["super", "admin"].includes(state.user.role);
}

function canManageOrders() {
  return state.user && ["super", "admin", "staff"].includes(state.user.role);
}

function canManageUsers() {
  return state.user?.role === "super";
}

function canManageSettings() {
  return state.user && ["super", "admin"].includes(state.user.role);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.error || "请求失败。");
  }
  return data;
}

async function loadAdminData() {
  const requests = [
    api("/api/admin/products"),
    api("/api/admin/orders"),
    api("/api/admin/settings"),
    api("/api/admin/tasks"),
  ];
  if (canManageUsers()) requests.push(api("/api/admin/users"));
  const [products, orders, settings, tasks, users = []] = await Promise.all(requests);
  state.products = products;
  state.orders = orders;
  state.settings = settings;
  state.tasks = tasks;
  state.users = users;
}

function setAuthenticated(user) {
  state.user = user;
  nodes.adminShell.classList.toggle("locked", !user);
  nodes.loginScreen.classList.toggle("hidden", Boolean(user));
  if (!user) return;

  nodes.currentUser.innerHTML = `
    <strong>${user.username}</strong>
    <span>${ROLE_LABELS[user.role]} · ${ROLE_HELP[user.role]}</span>
  `;
  $$("[data-super-only]").forEach((node) => {
    node.hidden = !canManageUsers();
  });
  $("#products").classList.toggle("permission-muted", !canManageProducts());
  $("#payments").classList.toggle("permission-muted", !canManageSettings());
  $("#shipping").classList.toggle("permission-muted", !canManageSettings());
  $("#content").classList.toggle("permission-muted", !canManageSettings());
  $("#resetData").hidden = user.role !== "super";
  $("#seedOrder").hidden = user.role === "staff";
  nodes.addProductForm.hidden = !canManageProducts();

  nodes.paymentForm.querySelectorAll("input, select, button").forEach((node) => {
    node.disabled = !canManageSettings();
  });
  nodes.shippingForm.querySelectorAll("input, select, textarea, button").forEach((node) => {
    node.disabled = !canManageSettings();
  });
  nodes.contentForm.querySelectorAll("input, select, button").forEach((node) => {
    node.disabled = !canManageSettings();
  });
}

function renderStats() {
  const revenue = state.orders.reduce((sum, order) => sum + Number(order.subtotal || 0), 0);
  nodes.statProducts.textContent = state.products.length;
  nodes.statStock.textContent = state.products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  nodes.statOrders.textContent = state.orders.length;
  nodes.statRevenue.textContent = money(revenue);
}

function renderDashboard() {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const todayKey = dateKey(today);
  const yesterdayKey = dateKey(yesterday);
  const todayOrderList = state.orders.filter((order) => orderDateKey(order) === todayKey);
  const yesterdayOrderList = state.orders.filter((order) => orderDateKey(order) === yesterdayKey);
  const totalRevenue = state.orders.reduce((sum, order) => sum + Number(order.subtotal || 0), 0);

  nodes.reportDate.textContent = today.toLocaleDateString();
  nodes.todayOrders.textContent = todayOrderList.length;
  nodes.todayRevenue.textContent = money(todayOrderList.reduce((sum, order) => sum + Number(order.subtotal || 0), 0));
  nodes.yesterdayOrders.textContent = yesterdayOrderList.length;
  nodes.avgOrderValue.textContent = money(state.orders.length ? totalRevenue / state.orders.length : 0);

  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(today.getDate() - (6 - index));
    const key = dateKey(day);
    const dayOrders = state.orders.filter((order) => orderDateKey(order) === key);
    return { label: shortDate(day), count: dayOrders.length };
  });
  const maxCount = Math.max(...days.map((day) => day.count), 1);
  nodes.dailyChart.innerHTML = days.map((day) => `
    <div class="bar-item">
      <div class="bar-track"><span style="height: ${Math.max(8, (day.count / maxCount) * 100)}%"></span></div>
      <strong>${day.count}</strong>
      <small>${day.label}</small>
    </div>
  `).join("");

  const counts = state.orders.reduce((map, order) => {
    map[order.status] = (map[order.status] || 0) + 1;
    return map;
  }, {});
  const statuses = ["Pending payment", "Paid", "Packing", "Shipped", "Fulfilled", "Cancelled"];
  nodes.statusChart.innerHTML = statuses.map((status) => {
    const count = counts[status] || 0;
    const percent = state.orders.length ? Math.round((count / state.orders.length) * 100) : 0;
    return `
      <div class="status-row">
        <div><strong>${status}</strong><span>${count} 单</span></div>
        <div class="progress"><span style="width: ${percent}%"></span></div>
        <em>${percent}%</em>
      </div>
    `;
  }).join("");

  const sales = {};
  state.orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.productId || item.name;
      if (!sales[key]) sales[key] = { name: item.name, qty: 0, revenue: 0 };
      sales[key].qty += Number(item.qty || 0);
      sales[key].revenue += Number(item.price || 0) * Number(item.qty || 0);
    });
  });
  const ranked = Object.values(sales).sort((a, b) => b.qty - a.qty).slice(0, 5);
  nodes.productRanking.innerHTML = ranked.length ? ranked.map((item, index) => `
    <div class="rank-item">
      <span>${index + 1}</span>
      <div><strong>${item.name}</strong><small>${item.qty} 件 · ${money(item.revenue)}</small></div>
    </div>
  `).join("") : "<p class=\"empty-note\">还没有销售数据，生成订单后会自动排行。</p>";

  const lowStock = state.products
    .filter((product) => Number(product.stock || 0) < 30)
    .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
    .slice(0, 6);
  nodes.stockAlerts.innerHTML = lowStock.length ? lowStock.map((product) => `
    <div class="rank-item warning">
      <span>${product.stock}</span>
      <div><strong>${productTitle(product)}</strong><small>${product.sku}</small></div>
    </div>
  `).join("") : "<p class=\"empty-note\">当前没有低库存商品。</p>";
}

function renderProducts() {
  nodes.productRows.innerHTML = state.products.map((product) => `
    <tr>
      <td><strong>${product.sku}</strong></td>
      <td>${productTitle(product)}</td>
      <td><input type="number" min="0" step="0.01" value="${product.price}" data-field="price" data-id="${product.id}" ${canManageProducts() ? "" : "disabled"}></td>
      <td><input type="number" min="0" step="1" value="${product.stock}" data-field="stock" data-id="${product.id}" ${canManageProducts() ? "" : "disabled"}></td>
      <td>
        <select data-field="status" data-id="${product.id}" ${canManageProducts() ? "" : "disabled"}>
          <option value="active" ${product.status === "active" ? "selected" : ""}>上架</option>
          <option value="draft" ${product.status === "draft" ? "selected" : ""}>下架</option>
        </select>
      </td>
      <td><button type="button" data-save="${product.id}" ${canManageProducts() ? "" : "disabled"}>保存</button></td>
    </tr>
  `).join("");
}

function renderOrders() {
  if (!state.orders.length) {
    nodes.orderRows.innerHTML = "<tr><td colspan=\"6\">暂无订单。你可以在前台加入购物车并点击 PayPal 占位按钮，或由管理员生成测试订单。</td></tr>";
    return;
  }
  nodes.orderRows.innerHTML = state.orders.map((order) => `
    <tr>
      <td><strong>${order.id}</strong></td>
      <td>${new Date(order.createdAt).toLocaleString()}</td>
      <td>${order.items.map((item) => `${item.name} × ${item.qty}`).join("<br>")}</td>
      <td>${money(order.subtotal)}</td>
      <td><span class="status-pill ${order.status.includes("Pending") ? "pending" : ""}">${order.status}</span></td>
      <td>
        <select data-order-status="${order.id}" ${canManageOrders() ? "" : "disabled"}>
          <option ${order.status === "Pending payment" ? "selected" : ""}>Pending payment</option>
          <option ${order.status === "Paid" ? "selected" : ""}>Paid</option>
          <option ${order.status === "Packing" ? "selected" : ""}>Packing</option>
          <option ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
          <option ${order.status === "Fulfilled" ? "selected" : ""}>Fulfilled</option>
          <option ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
        </select>
      </td>
    </tr>
  `).join("");
}

function renderSettings() {
  nodes.paymentForm.elements.paypalClientId.value = state.settings?.payment?.paypalClientId || "";
  nodes.paymentForm.elements.checkoutMode.value = state.settings?.payment?.checkoutMode || "PayPal Smart Buttons";
  nodes.paymentForm.elements.currency.value = state.settings?.payment?.currency || "USD";
  nodes.shippingForm.elements.warehouse.value = state.settings?.shipping?.warehouse || "";
  nodes.shippingForm.elements.shippingRule.value = state.settings?.shipping?.shippingRule || "Free shipping over $59";
  nodes.shippingForm.elements.shippingNote.value = state.settings?.shipping?.shippingNote || "";
}

function renderTasks() {
  nodes.contentTasks.innerHTML = state.tasks.length ? state.tasks.map((task) => `
    <li>
      <strong>${task.done ? "已完成：" : ""}${task.title}</strong>
      <span>${task.type}</span>
      <button class="secondary" type="button" data-toggle-task="${task.id}" ${canManageSettings() ? "" : "disabled"}>${task.done ? "标记未完成" : "标记完成"}</button>
    </li>
  `).join("") : "<li><strong>暂无内容任务</strong><span>可由管理员新增 TikTok 内容计划。</span></li>";
}

function renderUsers() {
  if (!canManageUsers()) return;
  nodes.userRows.innerHTML = state.users.map((user) => {
    const isSelf = user.username === state.user.username;
    return `
      <tr>
        <td><strong>${user.username}</strong></td>
        <td>
          <select data-user-role="${user.username}" ${isSelf ? "disabled" : ""}>
            <option value="super" ${user.role === "super" ? "selected" : ""}>超级管理员</option>
            <option value="admin" ${user.role === "admin" ? "selected" : ""}>管理员</option>
            <option value="staff" ${user.role === "staff" ? "selected" : ""}>员工</option>
          </select>
        </td>
        <td>${user.active ? "启用" : "停用"}</td>
        <td><button class="secondary" type="button" data-toggle-user="${user.username}" ${isSelf ? "disabled" : ""}>${user.active ? "停用" : "启用"}</button></td>
      </tr>
    `;
  }).join("");
}

function renderAll() {
  renderStats();
  renderDashboard();
  renderProducts();
  renderOrders();
  renderSettings();
  renderTasks();
  renderUsers();
}

async function refresh() {
  await loadAdminData();
  renderAll();
}

nodes.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(nodes.loginForm);
  try {
    const result = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: form.get("username").toString().trim(),
        password: form.get("password").toString(),
      }),
    });
    nodes.loginForm.reset();
    setAuthenticated(result.user);
    await refresh();
  } catch (error) {
    showMessage(nodes.loginMessage, error.message, "error");
  }
});

$("#logoutButton").addEventListener("click", async () => {
  await api("/api/auth/logout", { method: "POST", body: "{}" }).catch(() => {});
  setAuthenticated(null);
});

$$(".sidebar nav a").forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    $$(".sidebar nav a").forEach((item) => item.classList.toggle("active", item === link));
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

nodes.productRows.addEventListener("click", async (event) => {
  const id = event.target.dataset.save;
  if (!id || !canManageProducts()) return;
  const row = event.target.closest("tr");
  await api(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      price: Number(row.querySelector('[data-field="price"]').value),
      stock: Number(row.querySelector('[data-field="stock"]').value),
      status: row.querySelector('[data-field="status"]').value,
    }),
  });
  await refresh();
});

nodes.orderRows.addEventListener("change", async (event) => {
  const id = event.target.dataset.orderStatus;
  if (!id || !canManageOrders()) return;
  await api(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: event.target.value }),
  });
  await refresh();
});

$("#seedOrder").addEventListener("click", async () => {
  if (!canManageProducts()) return;
  const product = state.products.find((item) => item.status === "active");
  if (!product) return;
  await api("/api/admin/orders", {
    method: "POST",
    body: JSON.stringify({
      subtotal: product.price,
      channel: "Admin test order",
      items: [{ productId: product.id, name: productTitle(product), price: product.price, qty: 1 }],
    }),
  });
  await refresh();
});

nodes.addProductForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canManageProducts()) return;
  const form = new FormData(nodes.addProductForm);
  const nameEn = form.get("nameEn").toString().trim();
  const nameZh = form.get("nameZh").toString().trim();
  await api("/api/admin/products", {
    method: "POST",
    body: JSON.stringify({
      sku: form.get("sku").toString().trim(),
      price: Number(form.get("price")),
      stock: Number(form.get("stock")),
      visual: "gift-box",
      object: "box",
      label: { en: "New Tea", zh: "新品茶", yue: "新品茶" },
      tag: { en: "Uploaded in admin", zh: "后台上传", yue: "後台上載" },
      name: { en: nameEn, zh: nameZh, yue: nameZh },
      desc: {
        en: "A newly uploaded product ready for storefront testing.",
        zh: "后台上传的测试商品，可在前台展示和加购。",
        yue: "後台上載嘅測試商品，可以喺前台展示同加購。",
      },
      details: {
        en: ["New product added from the admin backend.", "Add launch-ready selling points before publishing."],
        zh: ["后台上传的新品。", "上线前可继续补充产品卖点、图片和规格。"],
        yue: ["後台上載嘅新品。", "上線前可以繼續補充產品賣點、圖片同規格。"],
      },
    }),
  });
  nodes.addProductForm.reset();
  await refresh();
});

$("#resetData").addEventListener("click", async () => {
  if (state.user?.role !== "super") return;
  await api("/api/admin/reset-demo", { method: "POST", body: "{}" });
  await refresh();
});

nodes.paymentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canManageSettings()) return;
  const form = new FormData(nodes.paymentForm);
  state.settings.payment = {
    paypalClientId: form.get("paypalClientId").toString().trim(),
    checkoutMode: form.get("checkoutMode").toString(),
    currency: form.get("currency").toString(),
  };
  await api("/api/admin/settings", { method: "PATCH", body: JSON.stringify({ payment: state.settings.payment }) });
  showMessage(nodes.paymentMessage, "支付配置已保存。", "success");
});

nodes.shippingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canManageSettings()) return;
  const form = new FormData(nodes.shippingForm);
  state.settings.shipping = {
    warehouse: form.get("warehouse").toString().trim(),
    shippingRule: form.get("shippingRule").toString(),
    shippingNote: form.get("shippingNote").toString().trim(),
  };
  await api("/api/admin/settings", { method: "PATCH", body: JSON.stringify({ shipping: state.settings.shipping }) });
  showMessage(nodes.shippingMessage, "物流配置已保存。", "success");
});

nodes.contentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canManageSettings()) return;
  const form = new FormData(nodes.contentForm);
  const title = form.get("taskTitle").toString().trim();
  if (!title) return showMessage(nodes.contentMessage, "请先填写内容任务。", "error");
  await api("/api/admin/tasks", {
    method: "POST",
    body: JSON.stringify({ title, type: form.get("taskType").toString() }),
  });
  nodes.contentForm.reset();
  showMessage(nodes.contentMessage, "内容任务已新增。", "success");
  await refresh();
});

nodes.contentTasks.addEventListener("click", async (event) => {
  const id = event.target.dataset.toggleTask;
  if (!id || !canManageSettings()) return;
  const task = state.tasks.find((entry) => entry.id === id);
  await api(`/api/admin/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ done: !task.done }),
  });
  await refresh();
});

nodes.passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(nodes.passwordForm);
  const password = form.get("newPassword").toString();
  const confirmPassword = form.get("confirmPassword").toString();
  if (password !== confirmPassword) return showMessage(nodes.passwordMessage, "两次输入的新密码不一致。", "error");
  try {
    await api(`/api/admin/users/${encodeURIComponent(state.user.username)}`, {
      method: "PATCH",
      body: JSON.stringify({
        oldPassword: form.get("oldPassword").toString(),
        password,
      }),
    });
    nodes.passwordForm.reset();
    showMessage(nodes.passwordMessage, "密码已修改。", "success");
  } catch (error) {
    showMessage(nodes.passwordMessage, error.message, "error");
  }
});

nodes.userForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canManageUsers()) return;
  const form = new FormData(nodes.userForm);
  try {
    await api("/api/admin/users", {
      method: "POST",
      body: JSON.stringify({
        username: form.get("username").toString().trim(),
        password: form.get("password").toString(),
        role: form.get("role").toString(),
      }),
    });
    nodes.userForm.reset();
    showMessage(nodes.userMessage, "用户已新增。", "success");
    await refresh();
  } catch (error) {
    showMessage(nodes.userMessage, error.message, "error");
  }
});

nodes.userRows.addEventListener("change", async (event) => {
  const username = event.target.dataset.userRole;
  if (!username || !canManageUsers() || username === state.user.username) return;
  await api(`/api/admin/users/${encodeURIComponent(username)}`, {
    method: "PATCH",
    body: JSON.stringify({ role: event.target.value }),
  });
  await refresh();
});

nodes.userRows.addEventListener("click", async (event) => {
  const username = event.target.dataset.toggleUser;
  if (!username || !canManageUsers() || username === state.user.username) return;
  const target = state.users.find((user) => user.username === username);
  await api(`/api/admin/users/${encodeURIComponent(username)}`, {
    method: "PATCH",
    body: JSON.stringify({ active: !target.active }),
  });
  await refresh();
});

async function init() {
  try {
    const result = await api("/api/auth/me");
    setAuthenticated(result.user);
    if (result.user) await refresh();
  } catch (error) {
    setAuthenticated(null);
  }
}

init();
