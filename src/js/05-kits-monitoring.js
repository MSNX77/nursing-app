// ======== kits (monitoring) ========
const kEnt = (k, date) => {
  const t = dn(date || todayJ());
  let b = null, bd = -1 / 0;
  (k.hist || []).forEach((h) => {
    const x = dn(h.date);
    if (x <= t && x >= bd) {
      bd = x;
      b = h;
    }
  });
  return b;
}, kHold = (k, date) => {
  const e = kEnt(k, date);
  return e && !(e.ret && dn(e.ret) <= dn(date || todayJ())) ? e.staff : "";
};
function consBack(cons) {
  (cons || []).forEach((c) => {
    let r = c.q;
    (c.kt || []).forEach((t) => {
      const k = db.kits.find((x) => x.id == t.k);
      if (k) {
        const x = k.items.find((y) => y.id == c.id);
        x ? x.q += t.q : k.items.push({ id: c.id, q: t.q });
        r -= t.q;
      }
    });
    const it = db.items.find((x) => x.id == c.id);
    if (it) it.stock += r;
  });
}
function consTake(staff, date, cons) {
  const ks = staff ? db.kits.filter((k) => kHold(k, date) == staff) : [];
  for (const c of cons) {
    c.kt = [];
    let need = c.q;
    for (const k of ks) {
      const x = k.items.find((y) => y.id == c.id);
      if (!x || !need) continue;
      const t = Math.min(x.q, need);
      x.q -= t;
      need -= t;
      if (t) c.kt.push({ k: k.id, q: t });
    }
    const it = db.items.find((x) => x.id == c.id);
    if (need > 0) {
      if (!it || need > it.stock) return "موجودی کافی نیست: " + c.n + " (کیف + انبار)";
      it.stock -= need;
    }
  }
  return "";
}
let KV = null, KS = {};
const kf = () => db.kits.find((x) => x.id == KV);
function kv(id) {
  KV = id;
  KS = { staff: "", eq: "", it: "" };
  R.kd = todayJ();
  R.kr = todayJ();
  drawK();
}
const xk = () => {
  KV = null;
  drawK();
};
function kAs() {
  if (!(canE("kits"))) return deny();
  const k = kf(), d = nj(R.kd);
  if (!KS.staff) return alert("پرستار را انتخاب کنید");
  if (!d) return alert("تاریخ نامعتبر است");
  k.hist.push({ staff: KS.staff, date: d });
  save();
  drawK();
}
function kHd(j) {
  if (!(canE("kits"))) return deny();
  if (!confirm("این ردیف از سابقه حذف شود؟")) return;
  kf().hist.splice(j, 1);
  save();
  drawK();
}
function kAe() {
  if (!(canE("kits"))) return deny();
  const k = kf(), e = db.equip.find((x) => x.id == KS.eq);
  if (!e) return alert("تجهیز را انتخاب کنید");
  const o = db.kits.find((x) => (x.equip || []).includes(e.id));
  if (o) return alert("این تجهیز در کیف «" + o.name + "» است");
  k.equip.push(e.id);
  KS.eq = "";
  save();
  drawK();
}
const kRe = (id) => {
  if (!(canE("kits"))) return deny();
  const k = kf();
  k.equip = k.equip.filter((x) => x != id);
  save();
  drawK();
};
function kAi() {
  if (!(canE("kits"))) return deny();
  const k = kf(), it = db.items.find((x2) => x2.id == KS.it), q = +$("#kq").value;
  if (!it || !(q > 0)) return alert("کالا را انتخاب و تعداد را وارد کنید");
  if (q > it.stock) return alert("موجودی انبار کافی نیست (" + it.stock + ")");
  it.stock -= q;
  const x = k.items.find((y) => y.id == it.id);
  x ? x.q += q : k.items.push({ id: it.id, q });
  save();
  drawK();
}
function kRi(j) {
  if (!(canE("kits"))) return deny();
  const k = kf(), x = k.items[j], it = db.items.find((y) => y.id == x.id);
  if (it) it.stock += x.q;
  k.items.splice(j, 1);
  save();
  drawK();
}
const kLog = (k) => {
  const r = [];
  db.missions.forEach((m) => (m.cons || []).forEach((c) => (c.kt || []).forEach((t) => {
    if (t.k == k.id) r.push([m.date, nm("clients", m.client), nm("staff", m.staff), c.n, t.q]);
  })));
  return r.sort((a, b) => dn(b[0]) - dn(a[0])).slice(0, 30);
};
function drawK() {
  const e = $("#kw"), k = KV && kf();
  if (!k) {
    KV = null;
    e.innerHTML = "";
    return;
  }
  const hs = k.hist.map((h, i) => [h, i]).sort((a, b) => dn(b[0].date) - dn(a[0].date) || b[1] - a[1]), en = kEnt(k), lg = kLog(k), eqo = db.equip.filter((x) => !db.kits.some((y) => (y.equip || []).includes(x.id))).map((x) => [x.id, x.name]);
  e.innerHTML = `<div class="mo"><div class="mb" style="max-width:780px"><h3>کیف: ${esc(k.name)}</h3>${k.note ? `<p class="m">${esc(k.note)}</p>` : ""}
<div class="card"><b>تحویل کیف به پرسنل</b><p>${en ? en.ret && dn(en.ret) <= dn(todayJ()) ? "آخرین تحویل: <b>" + esc(nm("staff", en.staff)) + "</b> از " + en.date + " تا " + en.ret + " — کیف بازگشته است." : "در اختیار: <b>" + esc(nm("staff", en.staff)) + "</b> — از تاریخ " + en.date : "هنوز به کسی تحویل داده نشده است."}</p><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><div style="min-width:180px;flex:1">${cmb("ks", SO(), KS.staff, (v) => {
    KS.staff = v;
  })}</div><input value="${esc(R.kd)}" oninput="R.kd=this.value" style="width:110px" placeholder="1405/01/01"><button onclick="cpO('r','kd')">📅</button><button class="p" onclick="kAs()">ثبت تحویل</button></div>
${en && !en.ret ? `<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px"><span>ثبت بازگشت کیف:</span><input value="${esc(R.kr)}" oninput="R.kr=this.value" style="width:110px" placeholder="1405/01/01"><button onclick="cpO('r','kr')">📅</button><button class="p" onclick="kRet()">ثبت بازگشت</button></div>` : ""}
${hs.length ? `<table style="margin-top:8px"><tr><th>تاریخ تحویل</th><th>پرستار</th><th>تاریخ بازگشت</th><th></th></tr>${hs.map((x) => `<tr><td>${x[0].date}</td><td>${esc(nm("staff", x[0].staff))}</td><td>${x[0].ret || '<span class="m">—</span>'}</td><td><button class="x" onclick="kHd(${x[1]})">✕</button></td></tr>`).join("")}</table>` : ""}</div>
<div class="card"><b>تجهیزات ثابت</b><div>${(k.equip || []).map((id) => `<span class="ch">${esc(nm("equip", id))} <button class="x" onclick="kRe('${id}')">✕</button></span>`).join("") || '<span class="m">—</span>'}</div><div style="display:flex;gap:6px;margin-top:6px"><div style="flex:1">${cmb("ke", eqo, KS.eq, (v) => {
    KS.eq = v;
  })}</div><button onclick="kAe()">+ افزودن تجهیز</button></div></div>
<div class="card"><b>وسایل و تجهیزات تعدادی داخل کیف</b><div style="display:flex;gap:6px;margin:8px 0;flex-wrap:wrap"><div style="flex:1;min-width:180px">${cmb("ki", db.items.map((o) => [o.id, o.name + (o.kind == "gear" ? " [تجهیز]" : "") + " (انبار " + o.stock + ")"]), KS.it, (v) => {
    KS.it = v;
  })}</div><input id="kq" type="number" min="1" value="1" style="width:70px"><button onclick="kAi()">+ انتقال از انبار به کیف</button></div>${k.items.length ? `<table><tr><th>کالا</th><th>در کیف</th><th>موجودی انبار</th><th>تاریخ انقضا</th><th></th></tr>${k.items.map((x, j) => {
    const it = db.items.find((y) => y.id == x.id) || {};
    return `<tr><td>${esc(it.name || "—")}${it.kind == "gear" ? ' <span class="m">[تجهیز]</span>' : ""}</td><td>${x.q}</td><td>${it.stock ?? "—"}</td><td>${expTxt(it)}</td><td><button onclick="kRi(${j})">بازگشت به انبار</button></td></tr>`;
  }).join("")}</table>` : '<p class="m">خالی است.</p>'}<p class="m">مصرفی‌های مأموریت‌های پرستاری که کیف دارد اول از موجودی کیف کم می‌شود و اگر کم بود، باقی‌مانده از انبار.</p></div>
<div class="card"><b>مصرف از این کیف در مأموریت‌ها (۳۰ مورد آخر)</b>${lg.length ? `<table><tr><th>تاریخ</th><th>مشتری</th><th>پرستار</th><th>کالا</th><th>تعداد</th></tr>${lg.map((r) => "<tr>" + r.map((v) => `<td>${esc(v)}</td>`).join("") + "</tr>").join("")}</table>` : '<p class="m">هنوز مصرفی ثبت نشده است.</p>'}</div>
<button onclick="xk()">بستن</button></div></div>`;
}
