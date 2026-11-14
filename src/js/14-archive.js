// ======== period closing / archive ========
let PC = { to: "", name: "", y: pj(todayJ())[0], m: pj(todayJ())[1] };
const arKey = (id) => K + "arch-" + id, KEEP = (t) => ({ missions: (m) => dn(m.date) <= t, exp: (e) => dn(e.date) <= t, tx: (x) => dn(x.date) <= t, pays: (x) => dn(x.date) <= t, bons: (x) => dn(x.date) <= t, rcpts: (x) => dn(x.date) <= t, tscore: (x) => dn(x.date) <= t, tpay: (x) => dn(x.date) <= t, buys: (x) => dn(x.date) <= t, repairs: (r) => r.st != "open" && dn(r.date) <= t, loans: (l) => l.end && dn(l.end) <= t, chq: (c) => c.st && c.st != "wait" && (!c.due || dn(c.due) <= t) }), arCnt = (to) => {
  const t = dn(to), k = KEEP(t), o = {};
  Object.keys(k).forEach((x) => o[x] = db[x].filter(k[x]).length);
  return o;
}, perSum = (a, b) => {
  const p = pl(dn(a), dn(b));
  return { n: p.n, inc: p.svc + p.cons + p.rent, sh: p.sh, ex: p.ex, net: p.net };
}, arUsed = () => {
  let u = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(K)) u += k.length + (localStorage.getItem(k) || "").length;
    }
  } catch (e) {
  }
  return u;
}, arSz = (id) => {
  try {
    return Math.round((localStorage.getItem(arKey(id)) || "").length / 1e3);
  } catch (e) {
    return 0;
  }
};
const arBanner = () => AR ? `<div class="arb">📁 محیط آرشیو: <b>${esc((db._arch || {}).name)}</b> (${(db._arch || {}).from} تا ${(db._arch || {}).to}) — اطلاعات این دوره جدا از دوره‌ی جاری است و تغییرها فقط همین‌جا ذخیره می‌شود. <button onclick="arBack()">↩ بازگشت به دوره‌ی جاری</button></div>` : "";
function pcEnd() {
  PC.to = PC.y + "/" + pad(PC.m) + "/" + pad(jmd(PC.y, PC.m));
  render();
}
function arDo() {
  if (!(isAdmin())) return deny();
  const to = nj(PC.to);
  if (!to) return alert("تاریخ پایان دوره را وارد کنید (نمونه: 1404/12/29)");
  const t = dn(to), H = db.hist || [], last = H.reduce((a, h) => Math.max(a, dn(h.to) || 0), 0);
  if (t <= last) return alert("تاریخ پایان باید بعد از پایان آخرین دوره‌ی بسته‌شده باشد.");
  if (t > dn(todayJ()) && !confirm("تاریخ پایان بعد از امروز است. ادامه می‌دهید؟")) return;
  if (!confirm("اطلاعات تا تاریخ " + to + " (مأموریت‌ها، پرداختی‌ها، هزینه‌ها، انتقال‌ها، چک‌های تعیین‌تکلیف‌شده و ...) از دوره‌ی جاری خارج و در یک آرشیو جدا ذخیره می‌شود. اشخاص، رزروها، کیف‌ها، موجودی‌ها و تعهدات باز به دوره‌ی بعد منتقل می‌شوند. قبل از شروع، یک بکاپ کامل هم دانلود می‌شود. ادامه می‌دهید؟")) return;
  bk();
  const live = db, arch = JSON.parse(JSON.stringify(live)), K2 = KEEP(t);
  Object.keys(K2).forEach((k) => {
    arch[k] = live[k].filter(K2[k]);
  });
  arch.rsv = [];
  arch.kits = [];
  arch.sets = [];
  let from = live.pstart || "";
  if (!from) {
    const ds = [...arch.missions, ...arch.exp, ...arch.tx, ...arch.pays].map((x) => x.date).filter(Boolean).sort((a, b) => dn(a) - dn(b));
    from = ds[0] || to;
  }
  const id = uid(), name = PC.name.trim() || "دوره‌ی " + from + " تا " + to;
  arch._arch = { id, name, from, to, closedAt: todayJ() };
  const bals = {}, car = {}, carC = {};
  let sm;
  db = arch;
  try {
    arch.accts.forEach((a) => bals[a.id] = bal(a));
    arch.staff.forEach((x) => {
      const r = Math.round(pEarn(x.id) - pPaid(x.id));
      if (r) car[x.id] = r;
    });
    arch.clients.forEach((x) => {
      const r = Math.round(cAlloc(x.id).bal);
      if (r) carC[x.id] = r;
    });
    sm = perSum(from, to);
  } finally {
    db = live;
  }
  try {
    localStorage.setItem(arKey(id), JSON.stringify(arch));
  } catch (e) {
    return alert("فضای ذخیره‌ی مرورگر برای آرشیو کافی نیست. چیزی تغییر نکرد. ابتدا آرشیوهای قدیمی را دانلود و از مرورگر حذف کنید.");
  }
  Object.keys(K2).forEach((k) => {
    live[k] = live[k].filter((x) => !K2[k](x));
  });
  live.accts.forEach((a) => {
    a.open = bals[a.id];
  });
  live.carry = { staff: car, clients: carC };
  live.pstart = jdd(t + 1);
  (live.hist = live.hist || []).push({ id, name, from, to, closedAt: todayJ(), sum: sm });
  PC = { to: "", name: "", y: PC.y, m: PC.m };
  save();
  render();
  alert("دوره بسته و آرشیو شد. فایل بکاپ کامل هم دانلود شد؛ آن را جای امنی نگه دارید.");
}
function arOpen(id) {
  const raw = localStorage.getItem(arKey(id));
  if (!raw) return alert("این آرشیو در این مرورگر نیست. از «بارگذاری آرشیو از فایل» استفاده کنید.");
  let d;
  try {
    d = JSON.parse(raw);
  } catch (e) {
    return alert("آرشیو خراب است");
  }
  save();
  CUR = db;
  RS = { from: R.from, to: R.to, staff: R.staff, client: R.client };
  db = Object.assign(D0(), d);
  db.cfg = Object.assign({}, db.cfg, { unit: CUR.cfg.unit });
  AR = id;
  R.from = (d._arch || {}).from || "";
  R.to = (d._arch || {}).to || "";
  R.staff = "";
  R.client = "";
  M = null;
  tab = "rep";
  render();
}
function arBack() {
  if (!AR) return;
  const id = AR, a = db._arch || {};
  let sm = null;
  try {
    sm = perSum(a.from, a.to);
  } catch (e) {
  }
  CUR.cfg.unit = db.cfg.unit;
  save();
  db = CUR;
  CUR = null;
  AR = null;
  const h = (db.hist || []).find((x) => x.id == id);
  if (h && sm) h.sum = sm;
  Object.assign(R, RS || {});
  save();
  M = null;
  tab = "periods";
  render();
}
function arDl(id) {
  const raw = localStorage.getItem(arKey(id));
  if (!raw) return alert("این آرشیو در مرورگر نیست.");
  const h = (db.hist || []).find((x) => x.id == id) || {}, a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
  a.download = "archive-" + String(h.from || "").replace(/\//g, "-") + "_" + String(h.to || "").replace(/\//g, "-") + ".json";
  a.click();
}
function arDel(id) {
  const has = !!localStorage.getItem(arKey(id));
  if (!confirm(has ? "آرشیو از حافظه‌ی مرورگر حذف شود؟ (فقط اگر فایلش را دانلود کرده‌اید؛ بعداً با «بارگذاری آرشیو از فایل» برمی‌گردد)" : "ردیف این دوره از لیست حذف شود؟")) return;
  if (has) localStorage.removeItem(arKey(id));
  else db.hist = db.hist.filter((x) => x.id != id);
  save();
  render();
}
function arImp(i) {
  const f = i.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result), a = d._arch;
      if (!a) return alert("این فایل، آرشیو دوره نیست.");
      localStorage.setItem(arKey(a.id), JSON.stringify(d));
      db.hist = db.hist || [];
      if (!db.hist.find((x) => x.id == a.id)) db.hist.push({ id: a.id, name: a.name, from: a.from, to: a.to, closedAt: a.closedAt, sum: null });
      save();
      render();
    } catch (e) {
      alert("فایل معتبر نیست یا فضای مرورگر کافی نیست");
    }
  };
  r.readAsText(f);
}
