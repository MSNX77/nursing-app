// ======== v0.8: expiry, gear, lists ========
const ROLES0 = [{ n: "پرستار", nurse: true }, { n: "منشی" }, { n: "دفتردار" }, { n: "اپراتور" }, { n: "مسئول فنی" }, { n: "سایر" }], SYSC = ["کارمزد بانکی", "خرید مصرفی", "خرید تجهیزات", "تعمیرات تجهیزات", "کارانه مسئولین فنی"];
const ROLES = () => db.cfg && db.cfg.roles || ROLES0, ensL = () => {
  db.cfg = db.cfg || {};
  if (!db.cfg.roles) db.cfg.roles = JSON.parse(JSON.stringify(ROLES0));
  if (!db.cfg.cats) db.cfg.cats = [...CATS];
}, syncL = () => {
  if (!AR && db.cfg) {
    if (!db.cfg.techRole) {
      db.cfg.techRole = 1;
      if (db.cfg.roles && !db.cfg.roles.some((r) => r.n == "مسئول فنی")) db.cfg.roles.splice(Math.max(0, db.cfg.roles.length - 1), 0, { n: "مسئول فنی" });
    }
    if (!db.cfg.techAcct) {
      db.cfg.techAcct = 1;
      if (!db.accts.some((a) => a.type == "tech")) db.accts.push({ id: uid(), name: "صندوق کارانه‌ی مسئولین فنی", type: "tech", holder: "", open: 0, note: "سهمی از سود که به مسئولین فنی اختصاص می‌یابد و بر اساس امتیاز بین آن‌ها پخش می‌شود." });
      save();
    }
  }
  if (db.cfg && db.cfg.cats) ["تعمیرات تجهیزات", "کارانه مسئولین فنی"].forEach((c) => {
    if (!db.cfg.cats.includes(c)) db.cfg.cats.push(c);
  });
  if (db.cfg && db.cfg.cats && db.cfg.cats.length) {
    CATS.length = 0;
    CATS.push(...db.cfg.cats);
  }
}, isNurse = (t) => {
  const r = ROLES().find((x) => x.n == t.role);
  return !t.role || (r ? !!r.nurse : t.role == "پرستار");
}, warnDays = () => {
  const w = db.cfg && db.cfg.warnDays;
  return w === void 0 || w === "" || isNaN(+w) ? 30 : +w;
}, expInfo = (it) => {
  if (!it.exp) return null;
  const d = dn(it.exp) - dn(todayJ()), w = it.warn !== "" && it.warn != null && !isNaN(+it.warn) ? +it.warn : warnDays();
  return { d, cls: d < 0 ? "bad" : d <= w ? "warn" : "ok", txt: d < 0 ? "منقضی شده (" + -d + " روز پیش)" : d + " روز مانده" };
}, expTxt = (it) => {
  const e = expInfo(it);
  return e ? `${it.exp} <span class="${e.cls}">— ${e.txt}</span>` : "—";
}, expList = () => db.items.filter((it) => it.stock > 0 && expInfo(it) && expInfo(it).cls != "ok").sort((a, b) => dn(a.exp) - dn(b.exp)), expCard = () => {
  const L = expList();
  return `<div class="card"><h3>هشدار انقضای کالا و تجهیزات</h3>${L.length ? `<table><tr><th>کالا</th><th>نوع</th><th>موجودی</th><th>تاریخ انقضا</th><th>وضعیت</th></tr>${L.map((it) => `<tr><td>${esc(it.name)}</td><td>${it.kind == "gear" ? "تجهیز" : "مصرفی"}</td><td>${fn(it.stock)}</td><td>${it.exp}</td><td><b class="${expInfo(it).cls}">${expInfo(it).txt}</b></td></tr>`).join("")}</table>` : '<span class="m">کالایی نزدیک انقضا یا منقضی نیست.</span>'}</div>`;
};
const opG = () => {
  op("purchase");
  M.d.kind = "gear";
  drawM();
}, opGN = () => {
  op("items");
  M.d.kind = "gear";
  drawM();
};
const rAdd = () => {
  if (!(isAdmin())) return deny();
  const n = $("#rn").value.trim();
  if (!n) return;
  ensL();
  if (db.cfg.roles.some((r) => r.n == n)) return alert("این سمت قبلاً هست");
  db.cfg.roles.push({ n, nurse: false });
  save();
  render();
}, rRen = (i, v) => {
  v = v.trim();
  ensL();
  const r = db.cfg.roles[i];
  if (!v || v == r.n) return render();
  if (db.cfg.roles.some((x) => x.n == v)) return alert("این نام تکراری است");
  db.staff.forEach((t) => {
    if (t.role == r.n) t.role = v;
  });
  r.n = v;
  save();
  render();
}, rNur = (i, c) => {
  ensL();
  db.cfg.roles[i].nurse = c;
  save();
  render();
}, rDel = (i) => {
  if (!(isAdmin())) return deny();
  ensL();
  const r = db.cfg.roles[i];
  if (db.staff.some((t) => t.role == r.n)) return alert("این سمت برای پرسنل استفاده شده؛ اول سمت آن‌ها را عوض کنید.");
  db.cfg.roles.splice(i, 1);
  save();
  render();
}, cAdd = () => {
  if (!(isAdmin())) return deny();
  const n = $("#cn").value.trim();
  if (!n) return;
  ensL();
  if (db.cfg.cats.includes(n)) return alert("این دسته قبلاً هست");
  db.cfg.cats.push(n);
  save();
  render();
}, cRen = (i, v) => {
  if (!(isAdmin())) return deny();
  v = v.trim();
  ensL();
  const o = db.cfg.cats[i];
  if (!v || v == o) return render();
  if (db.cfg.cats.includes(v)) return alert("این نام تکراری است");
  db.exp.forEach((e) => {
    if (e.cat == o) e.cat = v;
  });
  db.budgets.forEach((b) => {
    if (b.cat == o) b.cat = v;
  });
  db.cfg.cats[i] = v;
  save();
  render();
}, cDel = (i) => {
  if (!(isAdmin())) return deny();
  ensL();
  const o = db.cfg.cats[i];
  if (db.exp.some((e) => e.cat == o) || db.budgets.some((b) => b.cat == o)) return alert("این دسته در هزینه‌ها یا بودجه‌ها استفاده شده؛ حذفش ممکن نیست.");
  db.cfg.cats.splice(i, 1);
  save();
  render();
}, setWarn = (v) => {
  ensL();
  db.cfg.warnDays = Math.max(0, +v || 0);
  save();
  render();
};
document.addEventListener("scroll", (e) => {
  document.querySelectorAll(".cl").forEach((x) => {
    if (x.style.display == "block" && !x.contains(e.target)) x.style.display = "none";
  });
}, true);
function kRet() {
  if (!(canE("kits"))) return deny();
  const k = kf(), d = nj(R.kr), en = kEnt(k);
  if (!en) return alert("کیف به کسی تحویل داده نشده است");
  if (!d) return alert("تاریخ نامعتبر است");
  if (dn(d) < dn(en.date)) return alert("تاریخ بازگشت نمی‌تواند قبل از تاریخ تحویل باشد");
  en.ret = d;
  save();
  drawK();
}
