// ======== بخش آغازین (داده، ابزارها، تاریخ شمسی) ========
const $ = (s) => document.querySelector(s), K = "nursing-app-v1", VER = "0.12";
const D0 = () => ({ sets: [], accts: [], tx: [], budgets: [], kits: [], services: [], staff: [], clients: [], missions: [], items: [], equip: [], loans: [], exp: [], chq: [], pays: [], rcpts: [], repairs: [], buys: [], plan: [], tscore: [], tpay: [], users: [], bons: [], rsv: [], hist: [], carry: { staff: {}, clients: {} }, cfg: { unit: "toman" } });
let db = D0();
try {
  Object.assign(db, JSON.parse(localStorage.getItem(K)) || {});
} catch (e) {
}
let AR = null, CUR = null, RS = null;
const save = () => {
  try {
    localStorage.setItem(AR ? K + "arch-" + AR : K, JSON.stringify(db));
  } catch (e) {
    alert("ذخیره نشد؛ بکاپ بگیرید");
  }
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5), fmt = (n) => (Math.round((+n || 0) * UF() * 1e3) / 1e3).toLocaleString("en-US", { maximumFractionDigits: 3 }), fn = (n) => Math.round(+n || 0).toLocaleString("en-US"), pad = (n) => String(n).padStart(2, "0");
function g2j(gy, gm, gd) {
  var g = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], y = gm > 2 ? gy + 1 : gy, d = 355666 + 365 * gy + Math.floor((y + 3) / 4) - Math.floor((y + 99) / 100) + Math.floor((y + 399) / 400) + gd + g[gm - 1], jy = -1595 + 33 * Math.floor(d / 12053);
  d %= 12053;
  jy += 4 * Math.floor(d / 1461);
  d %= 1461;
  if (d > 365) {
    jy += Math.floor((d - 1) / 365);
    d = (d - 1) % 365;
  }
  return [jy, d < 186 ? 1 + Math.floor(d / 31) : 7 + Math.floor((d - 186) / 30), 1 + (d < 186 ? d % 31 : (d - 186) % 30)];
}
function j2g(jy, jm, jd) {
  jy += 1595;
  var d = -355668 + 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186), gy = 400 * Math.floor(d / 146097);
  d %= 146097;
  if (d > 36524) {
    gy += 100 * Math.floor(--d / 36524);
    d %= 36524;
    if (d >= 365) d++;
  }
  gy += 4 * Math.floor(d / 1461);
  d %= 1461;
  if (d > 365) {
    gy += Math.floor((d - 1) / 365);
    d = (d - 1) % 365;
  }
  var gd = d + 1, s = [0, 31, gy % 4 == 0 && gy % 100 != 0 || gy % 400 == 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], gm;
  for (gm = 0; gm < 13 && gd > s[gm]; gm++) gd -= s[gm];
  return [gy, gm, gd];
}
const todayJ = () => {
  const d = /* @__PURE__ */ new Date(), j = g2j(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return j[0] + "/" + pad(j[1]) + "/" + pad(j[2]);
};
const pj = (s) => {
  const m = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/.exec(String(s || "").trim().replace(/[۰-۹]/g, (c) => "۰۱۲۳۴۵۶۷۸۹".indexOf(c)));
  return m ? [+m[1], +m[2], +m[3]] : null;
};
const nj = (s) => {
  const a = pj(s);
  return a ? a[0] + "/" + pad(a[1]) + "/" + pad(a[2]) : "";
}, dn = (s) => {
  const a = pj(s);
  if (!a) return NaN;
  const g = j2g(...a);
  return Date.UTC(g[0], g[1] - 1, g[2]) / 864e5;
};
const gs = (s) => {
  const a = pj(s);
  if (!a) return "";
  const g = j2g(...a);
  return g[0] + "-" + pad(g[1]) + "-" + pad(g[2]);
};
const nm = (l, id) => (db[l].find((x) => x.id == id) || {}).name || "—", CATS = ["اجاره", "حقوق ثابت", "تبلیغات", "خرید مصرفی", "خرید تجهیزات", "تعمیرات تجهیزات", "کارانه مسئولین فنی", "حمل‌ونقل", "بیمه", "قبوض", "کارمزد بانکی", "اشتراک خدمات", "سایر"];
const SO = () => db.staff.filter(isNurse).map((s) => [s.id, s.name]), CO = () => db.clients.map((s) => [s.id, s.name]), EO = () => db.equip.map((s) => [s.id, s.name]);
const Q = {}, CB = {}, esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
let SV = { s: "", m: "" };
const nz = (s) => String(s ?? "").replace(/[۰-۹]/g, (c) => "۰۱۲۳۴۵۶۷۸۹".indexOf(c)).replace(/[٠-٩]/g, (c) => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/\u200c/g, " ").toLowerCase().trim();
function fq() {
  document.querySelectorAll("table[data-l]").forEach((t) => {
    const w = nz(Q[t.dataset.l] || "").split(/\s+/).filter(Boolean);
    t.querySelectorAll("tr").forEach((r, i) => {
      if (i) r.style.display = w.every((x) => nz(r.textContent).includes(x)) ? "" : "none";
    });
  });
}
function cmb(id, o, val, fn2) {
  const cur = (o.find((x) => x[0] == val) || [, ""])[1];
  CB[id] = { o, fn: fn2, cur };
  return `<div class="cb"><input id="${id}" autocomplete="off" placeholder="🔍 جستجو و انتخاب..." value="${esc(cur)}" onfocus="cbo('${id}')" oninput="cbf('${id}')" onkeydown="cbk(event,'${id}')" onblur="cbx('${id}')"><div class="cl" id="${id}_l" onmousedown="event.preventDefault()"></div></div>`;
}
function cbl(id, q) {
  const c = CB[id], n = nz(q), r = c.o.map((x, i) => [x, i]).filter((x) => !n || nz(x[0][1]).includes(n)), l = $("#" + id + "_l");
  l.innerHTML = (r.length ? r.map((x) => `<button type="button" onmousedown="event.preventDefault();cbp('${id}',${x[1]})">${esc(x[0][1])}</button>`).join("") : '<span class="m" style="display:block;padding:6px">موردی پیدا نشد</span>') + (n ? "" : `<button type="button" class="m" onmousedown="event.preventDefault();cbp('${id}',-1)">— بدون انتخاب</button>`);
  l.style.display = "block";
  const r0 = $("#" + id).getBoundingClientRect(), H = Math.min(l.scrollHeight, 212), below = innerHeight - r0.bottom;
  Object.assign(l.style, { position: "fixed", right: "auto", left: r0.left + "px", width: r0.width + "px", maxHeight: "212px", overflowY: "auto", zIndex: "200" });
  if (below < H + 12 && r0.top > H + 12) {
    l.style.top = "auto";
    l.style.bottom = innerHeight - r0.top + "px";
  } else {
    l.style.bottom = "auto";
    l.style.top = r0.bottom + "px";
  }
}
const cbo = (id) => {
  $("#" + id).select();
  cbl(id, "");
}, cbf = (id) => cbl(id, $("#" + id).value), cbx = (id) => {
  const e = $("#" + id), l = $("#" + id + "_l");
  if (e && CB[id]) e.value = CB[id].cur;
  if (l) l.style.display = "none";
};
function cbp(id, i) {
  const c = CB[id];
  c.cur = i < 0 ? "" : c.o[i][1];
  $("#" + id).value = c.cur;
  $("#" + id + "_l").style.display = "none";
  c.fn(i < 0 ? "" : c.o[i][0]);
}
function cbk(ev, id) {
  if (ev.key == "Enter") {
    ev.preventDefault();
    const n = nz(ev.target.value), i = CB[id].o.findIndex((x) => nz(x[1]).includes(n));
    if (i >= 0) cbp(id, i);
  } else if (ev.key == "Escape") {
    ev.stopPropagation();
    cbx(id);
    ev.target.blur();
  }
}
function grid(l, cols, rc, flt) {
  let h = `<input class="sq" placeholder="🔍 جستجو در جدول..." value="${esc(Q[l] || "")}" oninput="Q['${l}']=this.value;fq()"><table data-l="${l}"><tr>` + cols.map((c) => `<th>${c.l}</th>`).join("") + "<th></th></tr>";
  db[l].forEach((r, i) => {
    if (flt && !flt(r)) return;
    h += "<tr" + (rc ? ` style="cursor:pointer" title="برای دیدن جزئیات کلیک کنید" onclick="if(!event.target.closest('button,input,select,a'))` + rc + "(" + i + ')"' : "") + ">" + cols.map((c) => {
      if (c.f) return `<td>${c.f(r)}</td>`;
      const v = r[c.k] ?? "";
      return `<td>${c.o ? (c.o().find((o) => o[0] == v) || [])[1] || "—" : c.t == "n" ? v ? MONEY[l] && MONEY[l].includes(c.k) ? fmt(v) : fn(v) : "—" : v || "—"}</td>`;
    }).join("") + `<td><button onclick="op('${l}',${i})">✎</button><button class="x" onclick="del('${l}',${i})">✕</button></td></tr>`;
  });
  return h + "</table>";
}
function del(l, i) {
  if (!canE(l)) return deny();
  if (!confirm("حذف شود؟")) return;
  if (l == "tx") db.exp = db.exp.filter((e) => e.txid != db.tx[i].id);
  if (l == "rcpts" && db.rcpts[i].txid) db.tx = db.tx.filter((t) => t.id != db.rcpts[i].txid);
  if (l == "repairs" && db.repairs[i].expId) db.exp = db.exp.filter((e) => e.id != db.repairs[i].expId);
  if (l == "buys" && db.buys[i].expId) db.exp = db.exp.filter((e) => e.id != db.buys[i].expId);
  if (l == "tpay" && db.tpay[i].txid) db.tx = db.tx.filter((t) => t.id != db.tpay[i].txid);
  if (l == "tpay" && db.tpay[i].expId) db.exp = db.exp.filter((e) => e.id != db.tpay[i].expId);
  if (l == "missions") consBack(db.missions[i].cons);
  if (l == "kits") db.kits[i].items.forEach((x) => {
    const it = db.items.find((y) => y.id == x.id);
    if (it) it.stock += x.q;
  });
  db[l].splice(i, 1);
  save();
  render();
}
const mt = (m) => m.lines ? sum(m.lines, (l) => l.p * l.q) : +m.tariff || 0, mv = (m) => m.lines ? sum(m.lines, (l) => l.v * l.q) : +m.travel || 0;
function mc(m) {
  const s = db.staff.find((x) => x.id == m.staff) || {}, p = (m.pct || s.pct || 60) / 100, cons = (m.cons || []).reduce((a, c) => a + c.q * c.p, 0), disc = +m.disc || 0, bonus = +m.bonus || 0, tax = bonus * 0.2, shB = mt(m) * p + mv(m) * 0.75, sh = shB + bonus - tax, tot = mt(m) + mv(m) + cons - disc + bonus;
  return { cons, sh, shB, co: tot - sh - tax, tot, disc, bonus, tax };
}
function ld(l) {
  const s = dn(l.start), e = l.end ? dn(l.end) : dn(todayJ()), d = isNaN(s) || isNaN(e) ? 0 : Math.max(1, e - s), eq = db.equip.find((x) => x.id == l.equip) || {};
  return { days: d, rent: d * (eq.day || 0) };
}
const svs = (m) => m.lines ? m.lines.map((l) => l.n + (l.q > 1 ? "×" + l.q : "")).join("، ") || "—" : sn(m.service), sn = (v) => (db.services.find((x) => x.id == v) || { name: v || "" }).name || "—", SVO = () => db.services.map((s) => [s.id, s.name]), ITO = () => db.items.map((s) => [s.id, s.name]);
