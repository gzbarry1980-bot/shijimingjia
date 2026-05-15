import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_KEY = "db";
const STORE_NAME = "sjmj-db";
const SESSION_COOKIE = "sjmj_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const ADMIN_PATH = process.env.ADMIN_PATH || "/sjmj-admin-portal";
const loginAttempts = new Map();

function json(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

function loadSeedProducts() {
  const source = fs.readFileSync(path.join(__dirname, "../../data-store.js"), "utf8");
  const storage = new Map();
  const context = {
    localStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value),
    },
    window: { location: { protocol: "file:" } },
    console,
  };
  vm.createContext(context);
  vm.runInContext(`${source}; this.__products = Store.defaultProducts;`, context);
  return context.__products || [];
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), candidate);
}

function defaultDb() {
  return {
    products: loadSeedProducts(),
    orders: [],
    users: [
      {
        username: "admin",
        passwordHash: hashPassword("SJMJ@2026"),
        role: "super",
        active: true,
        createdAt: new Date().toISOString(),
      },
    ],
    settings: {
      payment: {
        paypalClientId: "",
        checkoutMode: "PayPal Smart Buttons",
        currency: "USD",
      },
      shipping: {
        warehouse: "China warehouse",
        shippingRule: "Free shipping over $59",
        shippingNote: "美国 7-12 天送达；其他国家和地区可按订单人工确认运费。",
      },
    },
    contentTasks: [
      { id: "task-1", title: "陈皮普洱是什么", type: "短视频脚本", done: false },
      { id: "task-2", title: "办公室杯泡演示", type: "拍摄清单", done: false },
      { id: "task-3", title: "围炉煮茶短视频", type: "短视频脚本", done: false },
      { id: "task-4", title: "春节/父母礼盒角度", type: "节日活动", done: false },
    ],
    sessions: {},
  };
}

async function readDb() {
  const store = getStore(STORE_NAME);
  const existing = await store.get(DB_KEY, { type: "json" });
  if (existing) return existing;
  const created = defaultDb();
  await store.setJSON(DB_KEY, created);
  return created;
}

async function writeDb(db) {
  const store = getStore(STORE_NAME);
  await store.setJSON(DB_KEY, db);
}

function publicUser(user) {
  if (!user) return null;
  return {
    username: user.username,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function parseCookies(event) {
  return Object.fromEntries(String(event.headers.cookie || event.headers.Cookie || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const index = part.indexOf("=");
      return [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))];
    }));
}

function cookieHeader(name, value, options = {}) {
  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
  ];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  parts.push("Secure");
  return parts.join("; ");
}

function currentUser(event, db) {
  const token = parseCookies(event)[SESSION_COOKIE];
  if (!token) return null;
  const session = db.sessions[token];
  if (!session || session.expiresAt < Date.now()) {
    delete db.sessions[token];
    return null;
  }
  return db.users.find((entry) => entry.username === session.username && entry.active) || null;
}

function hasRole(user, roles) {
  return Boolean(user && roles.includes(user.role));
}

function body(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
  return JSON.parse(raw);
}

function normalizedPath(event) {
  let pathname = event.path || "/";
  pathname = pathname.replace(/^\/\.netlify\/functions\/api/, "");
  pathname = pathname.replace(/^\/api/, "");
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  return pathname;
}

function rateLimited(event) {
  const ip = event.headers["x-nf-client-connection-ip"] || event.headers["client-ip"] || "unknown";
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (entry.resetAt < now) {
    entry.count = 0;
    entry.resetAt = now + 15 * 60 * 1000;
  }
  entry.count += 1;
  loginAttempts.set(ip, entry);
  return entry.count > 12;
}

export async function handler(event) {
  const method = event.httpMethod;
  const pathname = normalizedPath(event);
  const db = await readDb();

  try {
    if (pathname === "/products" && method === "GET") {
      return json(200, db.products.filter((product) => product.status === "active" || currentUser(event, db)));
    }

    if (pathname === "/orders" && method === "POST") {
      const payload = body(event);
      const order = {
        id: `SJMJ-${Date.now().toString().slice(-8)}`,
        createdAt: new Date().toISOString(),
        status: "Pending payment",
        channel: payload.channel || "Website checkout",
        subtotal: Number(payload.subtotal || 0),
        items: Array.isArray(payload.items) ? payload.items : [],
      };
      db.orders.unshift(order);
      await writeDb(db);
      return json(201, order);
    }

    if (pathname === "/auth/me" && method === "GET") {
      const user = currentUser(event, db);
      await writeDb(db);
      return json(200, { user: publicUser(user), adminPath: ADMIN_PATH });
    }

    if (pathname === "/auth/login" && method === "POST") {
      if (rateLimited(event)) return json(429, { error: "登录尝试过多，请稍后再试。" });
      const payload = body(event);
      const user = db.users.find((entry) => entry.username === payload.username && entry.active);
      if (!user || !verifyPassword(payload.password || "", user.passwordHash)) {
        return json(401, { error: "账号或密码不正确。" });
      }
      const token = crypto.randomBytes(32).toString("hex");
      db.sessions[token] = {
        username: user.username,
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_TTL_MS,
      };
      await writeDb(db);
      return json(200, { user: publicUser(user) }, {
        "Set-Cookie": cookieHeader(SESSION_COOKIE, token, { maxAge: SESSION_TTL_MS / 1000 }),
      });
    }

    if (pathname === "/auth/logout" && method === "POST") {
      const token = parseCookies(event)[SESSION_COOKIE];
      if (token) delete db.sessions[token];
      await writeDb(db);
      return json(200, { ok: true }, {
        "Set-Cookie": cookieHeader(SESSION_COOKIE, "", { maxAge: 0 }),
      });
    }

    const user = currentUser(event, db);
    if (!user) return json(401, { error: "未登录或登录已过期。" });

    if (pathname === "/admin/products" && method === "GET") return json(200, db.products);

    if (pathname === "/admin/products" && method === "POST") {
      if (!hasRole(user, ["super", "admin"])) return json(403, { error: "无商品管理权限。" });
      const product = body(event);
      const created = {
        id: `custom-${Date.now()}`,
        sku: product.sku,
        price: Number(product.price || 0),
        compareAt: Number(product.compareAt || 0),
        stock: Number(product.stock || 0),
        status: product.status || "active",
        visual: product.visual || "gift-box",
        object: product.object || "box",
        family: product.family || "daily",
        label: product.label || { en: "New Tea", zh: "新品茶", yue: "新品茶" },
        tag: product.tag || { en: "Uploaded in admin", zh: "后台上传", yue: "後台上載" },
        name: product.name,
        desc: product.desc,
        details: product.details,
      };
      db.products.unshift(created);
      await writeDb(db);
      return json(201, created);
    }

    const productMatch = pathname.match(/^\/admin\/products\/([^/]+)$/);
    if (productMatch && method === "PATCH") {
      if (!hasRole(user, ["super", "admin"])) return json(403, { error: "无商品管理权限。" });
      const patch = body(event);
      db.products = db.products.map((product) => product.id === decodeURIComponent(productMatch[1]) ? { ...product, ...patch } : product);
      await writeDb(db);
      return json(200, db.products.find((product) => product.id === decodeURIComponent(productMatch[1])));
    }

    if (pathname === "/admin/orders" && method === "GET") return json(200, db.orders);

    if (pathname === "/admin/orders" && method === "POST") {
      if (!hasRole(user, ["super", "admin"])) return json(403, { error: "无测试订单权限。" });
      const payload = body(event);
      const order = {
        id: `SJMJ-${Date.now().toString().slice(-8)}`,
        createdAt: new Date().toISOString(),
        status: "Pending payment",
        channel: payload.channel || "Admin test order",
        subtotal: Number(payload.subtotal || 0),
        items: payload.items || [],
      };
      db.orders.unshift(order);
      await writeDb(db);
      return json(201, order);
    }

    const orderMatch = pathname.match(/^\/admin\/orders\/([^/]+)$/);
    if (orderMatch && method === "PATCH") {
      if (!hasRole(user, ["super", "admin", "staff"])) return json(403, { error: "无订单管理权限。" });
      const patch = body(event);
      db.orders = db.orders.map((order) => order.id === decodeURIComponent(orderMatch[1]) ? { ...order, ...patch } : order);
      await writeDb(db);
      return json(200, db.orders.find((order) => order.id === decodeURIComponent(orderMatch[1])));
    }

    if (pathname === "/admin/settings" && method === "GET") return json(200, db.settings);

    if (pathname === "/admin/settings" && method === "PATCH") {
      if (!hasRole(user, ["super", "admin"])) return json(403, { error: "无配置管理权限。" });
      db.settings = { ...db.settings, ...body(event) };
      await writeDb(db);
      return json(200, db.settings);
    }

    if (pathname === "/admin/tasks" && method === "GET") return json(200, db.contentTasks);

    if (pathname === "/admin/tasks" && method === "POST") {
      if (!hasRole(user, ["super", "admin"])) return json(403, { error: "无内容管理权限。" });
      const payload = body(event);
      const task = { id: `task-${Date.now()}`, title: payload.title, type: payload.type, done: false };
      db.contentTasks.unshift(task);
      await writeDb(db);
      return json(201, task);
    }

    const taskMatch = pathname.match(/^\/admin\/tasks\/([^/]+)$/);
    if (taskMatch && method === "PATCH") {
      if (!hasRole(user, ["super", "admin"])) return json(403, { error: "无内容管理权限。" });
      const patch = body(event);
      db.contentTasks = db.contentTasks.map((task) => task.id === decodeURIComponent(taskMatch[1]) ? { ...task, ...patch } : task);
      await writeDb(db);
      return json(200, db.contentTasks.find((task) => task.id === decodeURIComponent(taskMatch[1])));
    }

    if (pathname === "/admin/users" && method === "GET") {
      if (!hasRole(user, ["super"])) return json(403, { error: "无用户管理权限。" });
      return json(200, db.users.map(publicUser));
    }

    if (pathname === "/admin/users" && method === "POST") {
      if (!hasRole(user, ["super"])) return json(403, { error: "无用户管理权限。" });
      const payload = body(event);
      if (db.users.some((entry) => entry.username === payload.username)) return json(409, { error: "账号已存在。" });
      const created = {
        username: payload.username,
        passwordHash: hashPassword(payload.password),
        role: payload.role || "staff",
        active: true,
        createdAt: new Date().toISOString(),
      };
      db.users.push(created);
      await writeDb(db);
      return json(201, publicUser(created));
    }

    const userMatch = pathname.match(/^\/admin\/users\/([^/]+)$/);
    if (userMatch && method === "PATCH") {
      const targetUsername = decodeURIComponent(userMatch[1]);
      const payload = body(event);
      if (payload.password) {
        if (targetUsername !== user.username) return json(403, { error: "只能修改当前账号密码。" });
        const target = db.users.find((entry) => entry.username === user.username);
        if (!verifyPassword(payload.oldPassword || "", target.passwordHash)) return json(400, { error: "当前密码不正确。" });
        target.passwordHash = hashPassword(payload.password);
        target.updatedAt = new Date().toISOString();
        await writeDb(db);
        return json(200, publicUser(target));
      }
      if (!hasRole(user, ["super"])) return json(403, { error: "无用户管理权限。" });
      if (targetUsername === user.username) return json(400, { error: "不能在用户管理里修改自己。" });
      db.users = db.users.map((entry) => entry.username === targetUsername ? { ...entry, ...payload, updatedAt: new Date().toISOString() } : entry);
      await writeDb(db);
      return json(200, publicUser(db.users.find((entry) => entry.username === targetUsername)));
    }

    if (pathname === "/admin/reset-demo" && method === "POST") {
      if (!hasRole(user, ["super"])) return json(403, { error: "无重置权限。" });
      db.products = loadSeedProducts();
      db.orders = [];
      await writeDb(db);
      return json(200, { ok: true });
    }

    return json(404, { error: "API not found" });
  } catch (error) {
    return json(400, { error: error.message || "请求处理失败。" });
  }
}
