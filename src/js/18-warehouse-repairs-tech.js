// ======== v0.11: انبار (۳ دسته)، تعمیرات، لیست خرید، هزینه‌ها، مسئولین فنی ========
const EQC = ["خرید تجهیزات", "تعمیرات تجهیزات"], ADC = ["تبلیغات", "اشتراک خدمات"];
const expGrp = (c) => EQC.includes(c) || /تجهیز|تعمیر/.test(c) ? "eq" : ADC.includes(c) || /تبلیغ|اشتراک/.test(c) ? "ad" : "ot";
const inRep = (id) => db.repairs.some((r) => r.cls == "equip" && r.ref == id && r.st == "open");
const inRepQ = (id) => sum(db.repairs.filter((r) => r.cls == "gear" && r.ref == id && r.st == "open"), (r) => r.q || 1);
const nRep = () => db.repairs.filter((r) => r.st == "open").length;
const repCost = (cls, id) => sum(db.repairs.filter((r) => r.cls == cls && r.ref == id), (r) => +r.cost || 0);
const eqSt = (e) => inRep(e.id) ? ["در تعمیر", "bad"] : db.loans.some((l) => l.equip == e.id && !l.end) ? ["نزد مشتری", "warn"] : ["آماده", "ok"];
const eqStB = (e) => {
  const x = eqSt(e);
  return `<b class="${x[1]}">${x[0]}</b>`;
};
const opRep = (cls, ref) => {
  op("repairs");
  M.d.cls = cls;
  M.d.ref = ref || "";
  drawM();
};
const opRepDone = (i) => {
  op("repairs", i);
  M.d.st = "done";
  if (!M.d.done) M.d.done = todayJ();
  drawM();
};
const planBuy = (id) => {
  const p = db.plan.find((x) => x.id == id);
  if (!p) return;
  if (p.kind == "equip") op("buyE");
  else {
    op("purchase");
    M.d.kind = p.kind;
  }
  M.d.name = p.name;
  M.d.q = p.q || 1;
  M.d.p = p.est || 0;
  M.planId = id;
  drawM();
};
const KN = { cons: "مصرفی", gear: "تجهیز دارایی شرکت", equip: "تجهیز کرایه‌ای" };
V.buys = () => `<div class="card adc"><button class="p" onclick="opG()">+ خرید تجهیز (دارایی شرکت)</button> <button onclick="op('buyE')">+ خرید تجهیز کرایه‌ای</button> <button onclick="op('purchase')">+ خرید مصرفی</button> <button onclick="op('plan')">+ افزودن به برنامه‌ی خرید</button> <span class="m">این صفحه جدا از موجودی انبار است: بالا چیزهایی که باید بخرید و پایین سوابق خرید. سوابق از نسخه‌ی ۰.۱۱ به بعد ثبت می‌شود؛ خریدهای قبلی را در هزینه‌ها ببینید.</span></div>
<div class="card"><h3>برنامه‌ی خرید (هنوز خریداری نشده)</h3><div class="m" style="margin-bottom:6px">${db.plan.length} مورد — برآورد جمع: <b>${fmt(sum(db.plan, (x) => (+x.q || 1) * (+x.est || 0)))}</b> ${UN()}</div>${grid("plan", [{ l: "مورد", k: "name" }, { l: "نوع", k: "kind", o: FS.plan[1].o }, { l: "تعداد", k: "q", t: "n" }, { l: "برآورد قیمت واحد", k: "est", t: "n" }, { l: "توضیح", k: "note" }, { l: "", f: (r) => `<button onclick="planBuy('${r.id}')">✓ خریداری شد</button>` }])}</div>
<div class="card"><h3>سوابق خرید</h3><div class="m" style="margin-bottom:6px">جمع: <b>${fmt(sum(db.buys, (x) => x.tot))}</b> ${UN()}</div><input class="sq" placeholder="🔍 جستجو در جدول..." value="${esc(Q.buys || "")}" oninput="Q['buys']=this.value;fq()"><table data-l="buys"><tr><th>تاریخ</th><th>نوع</th><th>مورد</th><th>تعداد</th><th>قیمت واحد</th><th>جمع</th><th></th></tr>${db.buys.map((x, i) => `<tr><td>${x.date}</td><td>${KN[x.kind] || "—"}</td><td>${esc(x.name)}</td><td>${fn(x.q)}</td><td>${fmt(x.p)}</td><td>${fmt(x.tot)}</td><td><button class="x" onclick="del('buys',${i})">✕</button></td></tr>`).join("") || '<tr><td class="m" colspan="7">هنوز خریدی ثبت نشده.</td></tr>'}</table><p class="m">حذف یک ردیف، هزینه‌ی مربوط به آن را هم حذف می‌کند ولی موجودی انبار را برنمی‌گرداند.</p></div>`;
V.repairs = () => {
  const op2 = db.repairs.filter((r) => r.st == "open"), stB = { open: ["در تعمیر", "bad"], done: ["تعمیر شد", "ok"], scrap: ["غیرقابل تعمیر", "warn"] };
  return `<div class="k" style="margin-bottom:12px"><div>در تعمیر<b class="${op2.length ? "warn" : ""}">${op2.length}</b></div><div>تعداد کل تعمیرات<b>${db.repairs.length}</b></div><div>هزینه‌ی کل تعمیرات<b>${fmt(sum(db.repairs, (r) => +r.cost || 0))}</b></div></div>` + addB("repairs", "ثبت تعمیر جدید", "برای هر دو دسته‌ی تجهیزات (دارایی شرکت و کرایه‌ای). هزینه‌ی تعمیر خودکار در هزینه‌ها (تجهیزات) ثبت می‌شود.") + `<div class="card">${grid("repairs", [{ l: "تاریخ ارسال", k: "date" }, { l: "تجهیز", f: (r) => esc(nm(r.cls == "equip" ? "equip" : "items", r.ref)) }, { l: "نوع", k: "cls", o: FS.repairs[1].o }, { l: "تعداد", f: (r) => r.q || 1 }, { l: "تعمیرکار", k: "vendor" }, { l: "عیب / شرح", k: "desc" }, { l: "وضعیت", f: (r) => `<b class="${stB[r.st][1]}">${stB[r.st][0]}</b>` }, { l: "بازگشت", k: "done" }, { l: "هزینه", k: "cost", t: "n" }, { l: "", f: (r) => r.st == "open" ? `<button onclick="opRepDone(${db.repairs.indexOf(r)})">✓ تعمیر شد</button>` : "" }])}</div>`;
};

// ---- مسئولین فنی و کارانه
const techStaff = () => db.staff.filter((s) => s.role == "مسئول فنی");
const techAcct = () => db.accts.find((a) => a.type == "tech");
let TP = null;
const tpInit = () => {
  if (!TP) {
    const [y, m] = pj(todayJ());
    TP = { from: y + "/" + pad(m) + "/01", to: y + "/" + pad(m) + "/" + pad(jmd(y, m)), pct: +(db.cfg && db.cfg.techPct) || 10, pool: null };
  }
  return TP;
};
const tPts = (from, to) => {
  const a = dn(from), b = dn(to), m = {};
  techStaff().forEach((s) => m[s.id] = 0);
  db.tscore.forEach((x) => {
    const d = dn(x.date);
    if (m[x.staff] !== void 0 && d >= a && d <= b) m[x.staff] += +x.pts || 0;
  });
  return m;
};
const tShares = (pool, pts) => {
  const ks = Object.keys(pts), pos = ks.filter((k) => pts[k] > 0), tot = sum(pos, (k) => pts[k]), r = {};
  ks.forEach((k) => r[k] = 0);
  if (tot > 0) pos.forEach((k) => r[k] = Math.floor(pool * pts[k] / tot));
  return r;
};
const numIn = (v) => +nz(v).replace(/[,٬]/g, "") || 0;
const tpSet = (k, v) => {
  const P = tpInit();
  if (k == "from" || k == "to") P[k] = nj(v);
  else if (k == "pct") {
    P.pct = numIn(v);
    db.cfg.techPct = P.pct;
    save();
  } else if (k == "pool") P.pool = nz(v) === "" ? null : uv(numIn(v));
  render();
};
const opTechIn = (amt) => {
  const ta = techAcct();
  if (!ta) return alert("حساب صندوق کارانه پیدا نشد.");
  op("tx");
  M.d.to = ta.id;
  const mn = db.accts.find((a) => a.type == "main");
  M.d.from = mn ? mn.id : "";
  M.d.amt = Math.round(amt);
  M.d.date = todayJ();
  M.d.desc = "سهم مسئولین فنی از سود " + TP.from + " تا " + TP.to;
  drawM();
};
function techPay() {
  if (!(canE("tscore"))) return deny();
  const P = tpInit(), ta = techAcct();
  if (!ta) return alert("حساب صندوق کارانه پیدا نشد.");
  const pts = tPts(P.from, P.to), fund = bal(ta), pool = P.pool != null ? +P.pool : Math.max(0, fund);
  if (!(pool > 0)) return alert("مبلغ قابل تقسیم را وارد کنید (یا ابتدا سهم سود را به صندوق منتقل کنید).");
  if (pool > fund + 0.5) return alert("مبلغ قابل تقسیم از موجودی صندوق کارانه بیشتر است. ابتدا سهم سود را به صندوق منتقل کنید.");
  const sh = tShares(pool, pts), rows = Object.keys(sh).filter((k) => sh[k] > 0);
  if (!rows.length) return alert("هیچ مسئول فنی‌ای در این بازه امتیاز مثبت ندارد.");
  if (db.tpay.some((x) => x.from == P.from && x.to == P.to) && !confirm("برای همین بازه قبلاً کارانه تقسیم شده است. دوباره ثبت شود؟")) return;
  if (!confirm("مجموع " + fmt(sum(rows, (k) => sh[k])) + " " + UN() + " بین " + rows.length + " نفر تقسیم و از صندوق پرداخت شود؟ این مبلغ به‌عنوان هزینه‌ی پرسنلی (دسته‌ی «کارانه مسئولین فنی») ثبت و از سود کم می‌شود.")) return;
  rows.forEach((k) => {
    const expId = uid();
    db.exp.push({ id: expId, date: todayJ(), cat: "کارانه مسئولین فنی", desc: "کارانه‌ی " + nm("staff", k) + " — " + P.from + " تا " + P.to, amt: sh[k], doc: "", acct: ta.id });
    db.tpay.push({ id: uid(), date: todayJ(), staff: k, amt: sh[k], pts: pts[k], from: P.from, to: P.to, expId });
  });
  P.pool = null;
  save();
  render();
}
V.tech = () => {
  const P = tpInit(), ta = techAcct(), ts = techStaff(), a = dn(P.from), b = dn(P.to), ok = !isNaN(a) && !isNaN(b);
  const net = ok ? pl(a, b).net : 0, sug = Math.max(0, Math.round(net * (+P.pct || 0) / 100)), fund = ta ? bal(ta) : 0, pool = P.pool != null ? +P.pool : Math.max(0, fund), pts = tPts(P.from, P.to), sh = tShares(pool, pts), tp = sum(Object.keys(pts).filter((k) => pts[k] > 0), (k) => pts[k]);
  return `<div class="k" style="margin-bottom:12px"><div>موجودی صندوق کارانه<b>${fmt(fund)}</b></div><div>مسئولین فنی<b>${ts.length}</b></div><div>مجموع امتیاز مثبت بازه<b>${fn(tp)}</b></div></div>${ts.length ? "" : '<div class="card"><b class="warn">هنوز مسئول فنی‌ای ثبت نشده.</b> از «اشخاص ← پرسنل» یک نفر را با نقش «مسئول فنی» اضافه کنید.</div>'}
<div class="card"><h3>بازه و سهم از سود</h3><p>از <input value="${P.from}" style="width:105px" onchange="tpSet('from',this.value)"> تا <input value="${P.to}" style="width:105px" onchange="tpSet('to',this.value)"></p><table><tr><td>سود خالص شرکت در بازه (کارانه‌های پرداخت‌شده در همین بازه کسر شده)</td><td><b class="${net >= 0 ? "ok" : "bad"}">${fmt(net)} ${UN()}</b></td></tr><tr><td>درصد اختصاص به مسئولین فنی</td><td><input value="${P.pct}" style="width:70px" onchange="tpSet('pct',this.value)"> ٪ ← <b>${fmt(sug)} ${UN()}</b></td></tr></table><p><button class="p" onclick="opTechIn(${sug})">انتقال این مبلغ به صندوق کارانه</button> <span class="m">یک انتقال معمولی بین حساب‌هاست (در فرم می‌توانید مبلغ و حساب مبدأ را عوض کنید) و سود شرکت را تغییر نمی‌دهد.</span></p></div>
<div class="card"><h3>امتیاز و سهم هر نفر در بازه</h3><p>مبلغ قابل تقسیم (${UN()}): <input value="${dv(pool)}" style="width:140px" onchange="tpSet('pool',this.value)"> <span class="m">پیش‌فرض: کل موجودی صندوق</span></p><table><tr><th>مسئول فنی</th><th>امتیاز بازه</th><th>درصد سهم</th><th>مبلغ سهم</th></tr>${ts.map((s) => `<tr><td>${esc(s.name)}</td><td>${fn(pts[s.id])}</td><td>${pts[s.id] > 0 && tp ? (pts[s.id] / tp * 100).toFixed(1) + "٪" : "—"}</td><td><b>${fmt(sh[s.id])}</b></td></tr>`).join("") || '<tr><td class="m" colspan="4">—</td></tr>'}</table><p><button class="p" onclick="techPay()">ثبت تقسیم و پرداخت از صندوق</button> <span class="m">فقط امتیاز مثبت سهم می‌گیرد؛ باقی‌مانده‌ی گرد کردن در صندوق می‌ماند. هر پرداخت به‌عنوان هزینه‌ی پرسنلی (دسته‌ی «کارانه مسئولین فنی») از همان صندوق ثبت می‌شود و از سود کم می‌شود.</span></p></div>`
    + addB("tscore", "ثبت امتیاز جدید", "ثبت امتیاز فعلاً دستی است؛ بعداً می‌توان آن را خودکار کرد.") + `<div class="card"><h3>امتیازهای ثبت‌شده در بازه</h3>${grid("tscore", [{ l: "تاریخ", k: "date" }, { l: "مسئول فنی", k: "staff", o: TSO }, { l: "امتیاز", k: "pts" }, { l: "دلیل / معیار", k: "reason" }], null, (r) => dn(r.date) >= a && dn(r.date) <= b)}</div>`
    + `<div class="card"><h3>سوابق تقسیم کارانه</h3><table><tr><th>تاریخ پرداخت</th><th>مسئول فنی</th><th>بازه</th><th>امتیاز</th><th>مبلغ</th><th></th></tr>${db.tpay.map((x, i) => `<tr><td>${x.date}</td><td>${esc(nm("staff", x.staff))}</td><td>${x.from} تا ${x.to}</td><td>${fn(x.pts)}</td><td>${fmt(x.amt)}</td><td><button class="x" onclick="del('tpay',${i})">✕</button></td></tr>`).join("") || '<tr><td class="m" colspan="6">هنوز کارانه‌ای تقسیم نشده.</td></tr>'}</table></div>`;
};
