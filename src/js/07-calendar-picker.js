// ======== calendar picker ========
let CP = null;
const MN = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"], jl = (y) => {
  const g = j2g(y, 12, 30), j = g2j(g[0], g[1], g[2]);
  return j[1] == 12 && j[2] == 30;
}, jmd = (y, m) => m < 7 ? 31 : m < 12 ? 30 : jl(y) ? 30 : 29, cv = () => pj(CP.t == "m" ? M.d[CP.k] : CP.t == "p" ? PC[CP.k] : R[CP.k]);
function cpO(t, k) {
  CP = { t, k };
  const v = cv() || pj(todayJ());
  CP.y = v[0];
  CP.m = v[1];
  drawC();
}
const cpN = (x) => {
  CP.m += x;
  if (CP.m > 12) {
    CP.m = 1;
    CP.y++;
  }
  if (CP.m < 1) {
    CP.m = 12;
    CP.y--;
  }
  drawC();
}, cpS = (v, b) => {
  const f = () => {
    if (CP.t == "m") M.d[CP.k] = v;
    else if (CP.t == "p") PC[CP.k] = v;
    else R[CP.k] = v;
    CP = null;
    render();
  };
  if (b) {
    document.querySelectorAll(".cg .sel").forEach((x) => x.classList.remove("sel"));
    b.classList.add("sel");
    setTimeout(f, 180);
  } else f();
};
function drawC() {
  if (!CP) {
    $("#cp").innerHTML = "";
    return;
  }
  const y = CP.y, m = CP.m, cur = cv() || [], td = pj(todayJ()), off = (new Date(dn(y + "/" + m + "/1") * 864e5).getUTCDay() + 1) % 7;
  let c = ["ش", "ی", "د", "س", "چ", "پ", "ج"].map((x) => `<b class="m">${x}</b>`).join("") + "<i></i>".repeat(off);
  for (let k = 1; k <= jmd(y, m); k++) {
    const v = y + "/" + pad(m) + "/" + pad(k);
    c += `<button type="button" class="${cur[0] == y && cur[1] == m && cur[2] == k ? "sel" : td[0] == y && td[1] == m && td[2] == k ? "td" : ""}" onclick="cpS('${v}',this)">${k}</button>`;
  }
  $("#cp").innerHTML = `<div class="cpo" onclick="if(event.target==this){CP=null;drawC()}"><div class="cpb"><div style="display:flex;gap:4px;margin-bottom:8px"><button onclick="cpN(-1)">قبل</button><select onchange="CP.m=+this.value;drawC()" style="flex:1">${MN.map((x, i) => `<option value="${i + 1}" ${i + 1 == m ? "selected" : ""}>${x}</option>`).join("")}</select><input type="number" value="${y}" style="width:74px" onchange="CP.y=+this.value||CP.y;drawC()"><button onclick="cpN(1)">بعد</button></div><div class="cg">${c}</div><div style="margin-top:8px;display:flex;gap:6px"><button class="p" onclick="cpS(todayJ())">امروز</button><button onclick="cpS('')">پاک کردن</button><button onclick="CP=null;drawC()">بستن</button></div></div></div>`;
}
const ibn = (s) => {
  s = String(s).replace(/[۰-۹]/g, (c) => "۰۱۲۳۴۵۶۷۸۹".indexOf(c)).replace(/[\s\-]/g, "").toUpperCase();
  if (/^\d{24}$/.test(s)) s = "IR" + s;
  if (!/^IR\d{24}$/.test(s)) return "";
  let m = 0;
  for (const c of s.slice(4) + "1827" + s.slice(2, 4)) m = (m * 10 + +c) % 97;
  return m == 1 ? s : "";
};
function sv() {
  const d = M.d, l = M.l;
  if (!canE(l)) return deny();
  for (const f of FS[l]) {
    if (f.t == "n") d[f.k] = f.k == "pct" && d[f.k] === "" ? "" : +d[f.k] || 0;
    if (f.t == "d") {
      const n = nj(d[f.k]);
      if (d[f.k] && !n) return alert("تاریخ نامعتبر است: " + f.l + " (نمونه: 1405/01/15)");
      d[f.k] = n;
    }
  }
  if (d.pct) d.pct = Math.min(65, Math.max(55, d.pct));
  if (l == "staff" && !d.pct) d.pct = 60;
  if (REQ[l].some((k) => !d[k])) return alert("فیلدهای ضروری را کامل کنید");
  if (l == "sets" && !d.exp && d.sdate && d.days) d.exp = jdd(dn(d.sdate) + d.days);
  if (l == "tx" && (!d.from && !d.to || d.from == d.to)) return alert("مبدأ و مقصد را درست انتخاب کنید (حداقل یکی، و نباید یکسان باشند).");
  if (l == "budgets" && db.budgets.some((x, i) => x.cat == d.cat && i != M.i)) return alert("برای این دسته قبلاً بودجه تعریف شده است.");
  if (l == "staff" && d.iban) {
    const b = ibn(d.iban);
    if (!b) return alert("شماره شبا معتبر نیست (باید IR و ۲۴ رقم باشد و رقم کنترلی درست باشد).");
    d.iban = b;
  }
  if (l == "missions" && !d.lines.length) return alert("حداقل یک خدمت اضافه کنید");
  if (l == "loans" && M.i < 0 && inRep(d.equip)) return alert("این تجهیز در تعمیر است و قابل امانت دادن نیست.");
  if (l == "repairs") {
    const eq = d.cls == "equip" ? db.equip.find((x) => x.id == d.ref) : db.items.find((x) => x.id == d.ref);
    if (!eq) return alert("تجهیز را انتخاب کنید.");
    d.q = d.cls == "gear" ? Math.max(1, Math.round(+d.q || 1)) : 1;
    d.done = d.st == "open" ? "" : d.done || todayJ();
    const old = M.i >= 0 ? db.repairs[M.i] : null;
    if (old && old.expId) db.exp = db.exp.filter((e) => e.id != old.expId);
    d.expId = "";
    if (d.cost > 0) {
      d.expId = uid();
      db.exp.push({ id: d.expId, date: d.done || d.date, cat: "تعمیرات تجهیزات", desc: "تعمیر " + eq.name + (d.q > 1 ? " ×" + d.q : "") + (d.vendor ? " — " + d.vendor : ""), amt: d.cost, doc: "", acct: d.acct || "" });
    }
    old ? Object.assign(old, d) : db.repairs.push(Object.assign({ id: uid() }, d));
    db.repairs.sort((a, b) => dn(b.date) - dn(a.date));
    M = null;
    save();
    return render();
  }
  if (l == "buyE") {
    const q = Math.max(1, Math.round(+d.q || 1)), eid = uid();
    for (let i = 0; i < q; i++) db.equip.push({ id: uid(), name: q > 1 ? d.name + " " + (i + 1) : d.name, date: d.date, base: d.p, day: d.day || 0, dep: d.dep || 0 });
    db.exp.push({ id: eid, date: d.date, cat: "خرید تجهیزات", desc: d.name + " ×" + q + " (کرایه‌ای)", amt: q * d.p, doc: d.doc || "", acct: d.acct || "" });
    db.buys.push({ id: uid(), date: d.date, kind: "equip", name: d.name, q, p: d.p, tot: q * d.p, expId: eid });
    db.buys.sort((a, b) => dn(b.date) - dn(a.date));
    if (M.planId) db.plan = db.plan.filter((x) => x.id != M.planId);
    M = null;
    save();
    return render();
  }
  if (l == "purchase") {
    const n = String(d.name || "").trim() || nm("items", d.item);
    if (!n || n == "—") return alert("کالا را انتخاب کنید یا نام کالای جدید بنویسید");
    let it = db.items.find((x) => x.name == n);
    const old = it ? it.stock : 0;
    if (!it) {
      it = { id: uid(), name: n, kind: d.kind || "cons", stock: 0, buy: 0, sell: 0, exp: "", warn: "" };
      db.items.push(it);
    }
    const g = it.kind == "gear";
    it.stock += d.q;
    it.buy = d.p;
    if (!g) it.sell = Math.ceil(d.p * 130 / 5e5) * 5e3;
    if (d.exp) it.exp = !it.exp || old <= 0 || dn(d.exp) < dn(it.exp) ? d.exp : it.exp;
    if (d.warn) it.warn = d.warn;
    const eid = uid(), dd = d.date || todayJ();
    db.exp.push({ id: eid, date: dd, cat: g ? "خرید تجهیزات" : "خرید مصرفی", desc: n + " ×" + d.q, amt: d.q * d.p, doc: "" });
    db.buys.push({ id: uid(), date: dd, kind: it.kind, name: n, q: d.q, p: d.p, tot: d.q * d.p, expId: eid });
    db.buys.sort((a, b) => dn(b.date) - dn(a.date));
    if (M.planId) db.plan = db.plan.filter((x) => x.id != M.planId);
    M = null;
    save();
    return render();
  }
  if (l == "rcpts") {
    if (!(d.amt > 0)) return alert("مبلغ دریافت باید بیشتر از صفر باشد.");
    if (d.no && db.rcpts.some((x, i) => String(x.no) == String(d.no) && i != M.i)) return alert("این شماره‌ی رسید قبلاً استفاده شده است.");
    const mm = d.mission && db.missions.find((x) => x.id == d.mission);
    if (mm && mm.client != d.client) d.mission = "";
    const old = M.i >= 0 ? db.rcpts[M.i] : null;
    if (old && old.txid) db.tx = db.tx.filter((t) => t.id != old.txid);
    d.txid = "";
    if (d.acct) {
      d.txid = uid();
      db.tx.push({ id: d.txid, date: d.date, from: "", to: d.acct, amt: d.amt, fee: 0, desc: "دریافت از " + nm("clients", d.client) + (d.no ? " — رسید " + d.no : "") });
    }
    const nn = parseInt(nz(d.no).replace(/\D/g, ""));
    db.cfg = db.cfg || {};
    if (nn) db.cfg.rcN = Math.max(+db.cfg.rcN || 0, nn);
    old ? Object.assign(old, d) : db.rcpts.push(Object.assign({ id: uid() }, d));
    db.rcpts.sort((a, b) => dn(b.date) - dn(a.date));
    M = null;
    save();
    return render();
  }
  if (l == "tx") {
    if (d.fee && !d.from) return alert("کارمزد از حساب مبدأ کم می‌شود؛ «از حساب» را انتخاب کنید.");
    const id = M.i >= 0 ? db.tx[M.i].id : uid();
    db.exp = db.exp.filter((e) => e.txid != id);
    M.i >= 0 ? Object.assign(db.tx[M.i], d) : db.tx.push(Object.assign({ id }, d));
    if (d.fee > 0) db.exp.push({ id: uid(), date: d.date, cat: "کارمزد بانکی", desc: "کارمزد انتقال" + (d.desc ? " — " + d.desc : ""), amt: d.fee, doc: "", acct: d.from, txid: id });
    M = null;
    save();
    return render();
  }
  if (l == "missions") {
    const snap = JSON.stringify([db.items, db.kits]);
    consBack(M.i >= 0 ? db.missions[M.i].cons : []);
    const r = consTake(d.staff, d.date, d.cons);
    if (r) {
      [db.items, db.kits] = JSON.parse(snap);
      return alert(r);
    }
  }
  M.i >= 0 ? Object.assign(db[l][M.i], d) : db[l].push(Object.assign({ id: uid() }, d));
  if (l == "missions" && M.rsv) db.rsv = db.rsv.filter((x) => x.id != M.rsv);
  if (l == "rsv") db.rsv.sort((a, b) => (dn(a.date) || 1e9) - (dn(b.date) || 1e9));
  M = null;
  save();
  render();
}
function pl(a, b) {
  const I = (d) => {
    const x = dn(d);
    return x >= a && x <= b;
  }, ms = db.missions.filter((m) => I(m.date)), o = { n: ms.length, svc: sum(ms, (m) => mt(m) + mv(m) - (+m.disc || 0)), cons: sum(ms, (m) => mc(m).cons), rent: sum(db.loans.filter((l) => l.end && I(l.end)), (l) => ld(l).rent), sh: sum(ms, (m) => mc(m).shB) + sum(db.bons.filter((y) => I(y.date)), (y) => y.amt), ex: sum(db.exp.filter((e) => I(e.date)), (e) => e.amt) };
  o.net = o.svc + o.cons + o.rent - o.sh - o.ex;
  return o;
}
