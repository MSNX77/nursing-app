// ======== v0.12: کاربران، ورود و سطح دسترسی ========
const PGS = [["dash", "داشبورد"], ["missions", "ثبت مأموریت"], ["rsv", "مأموریت‌های رزرو"], ["services", "خدمات"], ["staff", "پرسنل"], ["clients", "بیماران و مشتریان"], ["items", "وسایل مصرفی"], ["gear", "تجهیزات دارایی شرکت"], ["equip", "تجهیزات کرایه‌ای و امانت"], ["buys", "لیست خرید"], ["repairs", "تعمیرات تجهیزات"], ["exp", "هزینه‌ها"], ["recv", "طلب از مشتریان"], ["chq", "چک‌ها"], ["accts", "حساب‌ها و تنخواه"], ["budgets", "بودجه‌بندی"], ["pay", "تسویه سهم پرستاران"], ["tech", "مسئولین فنی و کارانه"], ["kits", "کیف‌های تجهیزات"], ["sets", "ست‌های استریل"], ["rep", "گزارش‌ها"], ["periods", "بستن دوره و آرشیو"]];
const COLL = { missions: "missions", rsv: "rsv", services: "services", staff: "staff", clients: "clients", items: ["items", "gear"], purchase: ["items", "gear"], equip: "equip", loans: "equip", buyE: "equip", repairs: "repairs", plan: "buys", buys: "buys", exp: "exp", chq: "chq", accts: "accts", tx: "accts", budgets: "budgets", rcpts: "recv", tscore: "tech", tpay: "tech", sets: "sets", kits: "kits", pays: "pay", bons: "pay" };
const LV = () => AR && CUR ? CUR : db;
const users = () => LV().users || [];
const authOn = () => users().length > 0;
const sess = () => {
  try {
    return sessionStorage.getItem(K + "sess");
  } catch (e) {
    return null;
  }
};
const setSess = (v) => {
  try {
    v ? sessionStorage.setItem(K + "sess", v) : sessionStorage.removeItem(K + "sess");
  } catch (e) {
  }
};
const me = () => authOn() ? users().find((u) => u.id == sess() && u.active !== false) || null : { id: "", name: "", role: "admin", open: true };
const isAdmin = () => {
  const u = me();
  return !!u && u.role == "admin";
};
const lvl = (p) => {
  const u = me();
  if (!u) return 0;
  return u.role == "admin" ? 2 : +(u.perms || {})[p] || 0;
};
const canE = (l) => {
  const p = COLL[l];
  if (p === void 0) return isAdmin();
  return (Array.isArray(p) ? p : [p]).some((x) => lvl(x) >= 2);
};
const deny = () => {
  alert("دسترسی انجام این کار را ندارید.");
  return false;
};
const firstTab = () => {
  const p = PGS.find((x) => lvl(x[0]) >= 1);
  return p ? p[0] : "users";
};
const navTree = () => T.map((t) => t[2] ? [t[0], t[1], t[2].filter((c) => lvl(c[0]) >= 1)] : t[0] == "users" ? [t[0], authOn() ? isAdmin() ? "کاربران و دسترسی‌ها" : "حساب کاربری من" : "ورود و کاربران"] : t).filter((t) => t[2] ? t[2].length : t[0] == "users" || lvl(t[0]) >= 1);
const settingsTabs = (all) => isAdmin() ? all : all.filter((t) => t[0] == "theme");
const whoUp = () => {
  const u = me(), e = $("#who"), adm = isAdmin();
  if (e) e.innerHTML = authOn() && u ? `👤 ${esc(u.name || u.user)} (${u.role == "admin" ? "مدیر" : "کارمند"}) <button onclick="logout()">خروج</button>` : "";
  ["bkb", "rbl"].forEach((id) => {
    const x = $("#" + id);
    if (x) x.style.display = adm ? "" : "none";
  });
};
const logout = () => {
  setSess(null);
  render();
};

// ---- هش رمز (PBKDF2 با WebCrypto، و جایگزین SHA-256 در صورت نبود WebCrypto)
function sha256(msg) {
  const K2 = new Uint32Array([1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298]);
  const data = new TextEncoder().encode(msg), l = data.length, nb = l + 9 + 63 >> 6 << 6, buf = new Uint8Array(nb);
  buf.set(data);
  buf[l] = 128;
  const dv2 = new DataView(buf.buffer);
  dv2.setUint32(nb - 4, l * 8 >>> 0);
  dv2.setUint32(nb - 8, Math.floor(l * 8 / 4294967296));
  let h = new Uint32Array([1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]);
  const w = new Uint32Array(64), rr = (x, n) => x >>> n | x << 32 - n;
  for (let o = 0; o < nb; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv2.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ w[i - 15] >>> 3, s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ w[i - 2] >>> 10;
      w[i] = w[i - 16] + s0 + w[i - 7] + s1 >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25), ch = e & f ^ ~e & g, t1 = hh + S1 + ch + K2[i] + w[i] >>> 0, S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22), mj = a & b ^ a & c ^ b & c, t2 = S0 + mj >>> 0;
      hh = g;
      g = f;
      f = e;
      e = d + t1 >>> 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 >>> 0;
    }
    const v = [a, b, c, d, e, f, g, hh];
    h = h.map((x, i) => x + v[i] >>> 0);
  }
  return [...h].map((x) => x.toString(16).padStart(8, "0")).join("");
}
const hasSub = () => typeof crypto !== "undefined" && crypto.subtle && typeof crypto.subtle.deriveBits == "function";
async function pwHash(pw, salt, algo) {
  if (algo == "p1") {
    if (!hasSub()) throw new Error("nosub");
    const enc = new TextEncoder(), key = await crypto.subtle.importKey("raw", enc.encode(String(pw)), "PBKDF2", false, ["deriveBits"]), bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 120000, hash: "SHA-256" }, key, 256);
    return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = sha256(salt + pw);
  for (let i = 0; i < 5000; i++) h = sha256(h + salt + pw);
  return h;
}
async function pwNew(pw) {
  const salt = uid() + uid(), algo = hasSub() ? "p1" : "j1";
  return { salt, algo, hash: await pwHash(pw, salt, algo) };
}
async function pwCheck(u, pw) {
  try {
    return await pwHash(pw, u.salt, u.algo) === u.hash;
  } catch (e) {
    return false;
  }
}

// ---- صفحه‌ی ورود
let LG = { n: 0, until: 0 };
function authGate() {
  let el = document.getElementById("lg");
  if (!el) {
    el = document.createElement("div");
    el.id = "lg";
    el.innerHTML = `<div class="lgb"><h3>ورود به نرم‌افزار</h3><input id="lgu" placeholder="نام کاربری" autocomplete="username"><input id="lgp" type="password" placeholder="رمز عبور" autocomplete="current-password" onkeydown="if(event.key=='Enter')doLogin()"><button class="p" onclick="doLogin()">ورود</button><div id="lge" class="bad"></div></div>`;
    document.body.appendChild(el);
  }
  if (authOn() && !me()) {
    el.classList.add("o");
    return true;
  }
  el.classList.remove("o");
  if (tab != "users" && lvl(tab) < 1) tab = firstTab();
  return false;
}
async function doLogin() {
  const e = $("#lge"), now = Date.now();
  if (now < LG.until) {
    e.textContent = "چند بار رمز اشتباه وارد شد؛ " + Math.ceil((LG.until - now) / 1e3) + " ثانیه صبر کنید.";
    return;
  }
  const un = nz($("#lgu").value), pw = $("#lgp").value, u = users().find((x) => nz(x.user) == un && x.active !== false);
  if (!(u && await pwCheck(u, pw))) {
    if (++LG.n >= 5) {
      LG.n = 0;
      LG.until = Date.now() + 3e4;
    }
    e.textContent = "نام کاربری یا رمز اشتباه است.";
    return;
  }
  LG.n = 0;
  e.textContent = "";
  $("#lgp").value = "";
  setSess(u.id);
  render();
}

// ---- صفحه‌ی کاربران
const gv = (id) => (document.getElementById(id) || { value: "" }).value;
const adminsLeft = (exId) => users().filter((u) => u.role == "admin" && u.active !== false && u.id != exId).length;
async function setupAdmin() {
  const name = gv("su_name").trim(), user = gv("su_user").trim(), pw = gv("su_pw"), pw2 = gv("su_pw2");
  if (!user || pw.length < 6) return alert("نام کاربری و رمز (حداقل ۶ نویسه) را وارد کنید.");
  if (pw != pw2) return alert("تکرار رمز با رمز یکی نیست.");
  const u = Object.assign({ id: uid(), name: name || user, user, role: "admin", active: true, perms: {}, created: todayJ() }, await pwNew(pw));
  db.users = [u];
  setSess(u.id);
  save();
  render();
}
async function userAdd() {
  if (!isAdmin()) return deny();
  const name = gv("nu_name").trim(), user = gv("nu_user").trim(), pw = gv("nu_pw"), role = gv("nu_role") || "staff";
  if (!user || pw.length < 6) return alert("نام کاربری و رمز (حداقل ۶ نویسه) را وارد کنید.");
  if (users().some((x) => nz(x.user) == nz(user))) return alert("این نام کاربری قبلاً هست.");
  LV().users.push(Object.assign({ id: uid(), name: name || user, user, role, active: true, perms: {}, created: todayJ() }, await pwNew(pw)));
  save();
  render();
  if (role != "admin") upOpen(LV().users[LV().users.length - 1].id);
}
async function userReset(id) {
  if (!isAdmin()) return deny();
  const u = users().find((x) => x.id == id), pw = prompt("رمز جدید برای «" + (u.name || u.user) + "» (حداقل ۶ نویسه):");
  if (pw === null) return;
  if (pw.length < 6) return alert("رمز کوتاه است.");
  Object.assign(u, await pwNew(pw));
  save();
  alert("رمز تغییر کرد.");
}
function userDel(id) {
  if (!isAdmin()) return deny();
  const u = users().find((x) => x.id == id);
  if (u.role == "admin" && !adminsLeft(id)) return alert("آخرین مدیر را نمی‌توان حذف کرد.");
  if (!confirm("کاربر «" + (u.name || u.user) + "» حذف شود؟")) return;
  LV().users = users().filter((x) => x.id != id);
  if (id == sess()) setSess(null);
  save();
  render();
}
function userToggle(id) {
  if (!isAdmin()) return deny();
  const u = users().find((x) => x.id == id);
  if (u.active !== false && u.role == "admin" && !adminsLeft(id)) return alert("آخرین مدیر را نمی‌توان غیرفعال کرد.");
  u.active = u.active === false;
  save();
  render();
}
async function pwSelf() {
  const u = me(), o = gv("pw_old"), n1 = gv("pw_new"), n2 = gv("pw_new2");
  if (!u || u.open) return;
  if (!await pwCheck(u, o)) return alert("رمز فعلی درست نیست.");
  if (n1.length < 6) return alert("رمز جدید حداقل ۶ نویسه باشد.");
  if (n1 != n2) return alert("تکرار رمز جدید یکی نیست.");
  Object.assign(u, await pwNew(n1));
  save();
  ["pw_old", "pw_new", "pw_new2"].forEach((i) => {
    const x = document.getElementById(i);
    if (x) x.value = "";
  });
  alert("رمز تغییر کرد.");
}
const PRESETS = { view: () => Object.fromEntries(PGS.map((p) => [p[0], 1])), edit: () => Object.fromEntries(PGS.map((p) => [p[0], 2])), none: () => ({}), sec: () => ({ dash: 1, missions: 2, rsv: 2, clients: 2, services: 1, recv: 2, staff: 1 }) };
function upOpen(id) {
  if (!isAdmin()) return deny();
  const u = users().find((x) => x.id == id);
  M = { l: "users", v: 7, uid: id, d: { role: u.role, active: u.active !== false, perms: Object.assign({}, u.perms || {}) } };
  drawM();
}
const upSet = (p, v) => {
  M.d.perms[p] = +v;
};
const upRole = (v) => {
  M.d.role = v;
  drawM();
};
const upPreset = (k) => {
  M.d.perms = PRESETS[k]();
  drawM();
};
function upSave() {
  if (!isAdmin()) return deny();
  const u = users().find((x) => x.id == M.uid), d = M.d;
  if ((d.role != "admin" || !d.active) && u.role == "admin" && !adminsLeft(u.id)) return alert("باید دست‌کم یک مدیر فعال بماند.");
  u.role = d.role;
  u.active = d.active;
  u.perms = d.perms;
  M = null;
  save();
  render();
}
function drawUP() {
  const u = users().find((x) => x.id == M.uid);
  if (!u) return "";
  const d = M.d, sel = (p, v) => `<option value="${v}" ${(d.perms[p] || 0) == v ? "selected" : ""}>${["بدون دسترسی", "فقط مشاهده", "مشاهده و ویرایش"][v]}</option>`;
  return `<div class="mo"><div class="mb" style="max-width:640px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0">دسترسی‌های ${esc(u.name || u.user)}</h3><span><button class="p" onclick="upSave()">ذخیره</button> <button onclick="xm()">✕ بستن</button></span></div>
<p>نقش: <select onchange="upRole(this.value)"><option value="staff" ${d.role == "staff" ? "selected" : ""}>کارمند</option><option value="admin" ${d.role == "admin" ? "selected" : ""}>مدیر (دسترسی کامل)</option></select> <label><input type="checkbox" ${d.active ? "checked" : ""} onchange="M.d.active=this.checked"> فعال</label></p>
${d.role == "admin" ? '<p class="m">مدیر به همه‌ی بخش‌ها، تنظیمات، بکاپ و مدیریت کاربران دسترسی دارد.</p>' : `<p>الگوی آماده: <button onclick="upPreset('sec')">منشی</button> <button onclick="upPreset('view')">همه فقط مشاهده</button> <button onclick="upPreset('edit')">همه ویرایش</button> <button onclick="upPreset('none')">هیچ</button></p><table><tr><th>بخش</th><th>دسترسی</th></tr>${PGS.map((p) => `<tr><td>${p[1]}</td><td><select onchange="upSet('${p[0]}',this.value)">${sel(p[0], 0)}${sel(p[0], 1)}${sel(p[0], 2)}</select></td></tr>`).join("")}</table><p class="m">«فقط مشاهده» دکمه‌های افزودن، ویرایش و حذف را برای او پنهان می‌کند. تنظیمات، بکاپ/بازیابی و مدیریت کاربران فقط برای مدیر است.</p>`}</div></div>`;
}
const AUTH_NOTE = '<div class="card"><h3>یادآوری امنیتی</h3><p class="m" style="margin:0">این ورود جلوی استفاده‌ی عادی دیگران از برنامه را می‌گیرد، اما اطلاعات روی همین مرورگر ذخیره می‌شوند و کسی که به خود کامپیوتر/مرورگر دسترسی کامل دارد می‌تواند آن را دور بزند یا از بکاپ بخواند. امنیت واقعی و کار چندنفره از چند دستگاه نیاز به سرور (مثل Firebase Authentication و Firestore) دارد. رمزها هرگز به‌صورت متن ذخیره نمی‌شوند، ولی در صورت فراموشی رمز مدیر، تنها راه برگشت، بازیابی از بکاپ قبل از فعال‌سازی ورود است.</p></div>';
V.users = () => {
  if (!authOn()) return `<div class="card"><h3>فعال‌سازی ورود با نام کاربری</h3><p class="m" style="margin-top:0">تا وقتی کاربری نساخته‌اید، برنامه بدون ورود کار می‌کند. با ساخت مدیر، ورود برای همه الزامی می‌شود؛ بعداً کارمند اضافه و دسترسی هر بخش را تنظیم کنید.</p><p><input id="su_name" placeholder="نام نمایشی (مثلاً مدیر)"> <input id="su_user" placeholder="نام کاربری" autocomplete="username"></p><p><input id="su_pw" type="password" placeholder="رمز (حداقل ۶ نویسه)" autocomplete="new-password"> <input id="su_pw2" type="password" placeholder="تکرار رمز" autocomplete="new-password"></p><button class="p" onclick="setupAdmin()">ساخت مدیر و فعال‌سازی ورود</button></div>` + AUTH_NOTE;
  const u = me(), adm = isAdmin();
  return `<div class="card"><h3>تغییر رمز من</h3><p><input id="pw_old" type="password" placeholder="رمز فعلی" autocomplete="current-password"> <input id="pw_new" type="password" placeholder="رمز جدید" autocomplete="new-password"> <input id="pw_new2" type="password" placeholder="تکرار رمز جدید" autocomplete="new-password"></p><button class="p" onclick="pwSelf()">تغییر رمز</button></div>`
    + (adm ? `<div class="card"><h3>کاربران</h3><table><tr><th>نام</th><th>نام کاربری</th><th>نقش</th><th>وضعیت</th><th></th></tr>${users().map((x) => `<tr><td>${esc(x.name)}</td><td style="direction:ltr;text-align:left">${esc(x.user)}</td><td>${x.role == "admin" ? "مدیر" : "کارمند"}</td><td>${x.active === false ? '<b class="bad">غیرفعال</b>' : '<b class="ok">فعال</b>'}</td><td><button onclick="upOpen('${x.id}')">✎ دسترسی</button> <button onclick="userReset('${x.id}')">🔑 رمز جدید</button> <button onclick="userToggle('${x.id}')">${x.active === false ? "فعال‌سازی" : "غیرفعال"}</button> ${x.id == u.id ? "" : `<button class="x" onclick="userDel('${x.id}')">✕</button>`}</td></tr>`).join("")}</table></div>
<div class="card"><h3>کاربر جدید</h3><p><input id="nu_name" placeholder="نام نمایشی"> <input id="nu_user" placeholder="نام کاربری" autocomplete="off"> <input id="nu_pw" type="password" placeholder="رمز (حداقل ۶ نویسه)" autocomplete="new-password"> <select id="nu_role"><option value="staff">کارمند</option><option value="admin">مدیر</option></select></p><button class="p" onclick="userAdd()">افزودن</button> <span class="m">بعد از افزودن کارمند، پنجره‌ی تنظیم دسترسی‌ها باز می‌شود.</span></div>` : "") + AUTH_NOTE;
};
{
  const d0 = V.dash;
  V.dash = () => (authOn() ? "" : '<div class="card"><b class="warn">ورود با نام کاربری هنوز فعال نیست.</b> برای محافظت از اطلاعات، مدیر بسازید و دسترسی کارمندان را تنظیم کنید. <button onclick="go(\'users\')">فعال‌سازی</button></div>') + d0();
}
