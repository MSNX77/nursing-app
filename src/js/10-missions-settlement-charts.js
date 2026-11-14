// ======== v0.8: mission details, nurse settlement, charts ========
const vmi = (i) => {
  M = { l: "missions", v: 2, i };
  drawM();
}, vp = (sid) => {
  M = { l: "pay", v: 3, sid, d: { date: todayJ(), amt: "", acct: "", note: "", bonus: "", touched: 0 } };
  drawM();
};
const pCar = (sid) => db.carry && db.carry.staff && db.carry.staff[sid] || 0, pEarn = (sid) => sum(db.missions.filter((m) => m.staff == sid), (m) => mc(m).sh) + sum(db.bons.filter((x) => x.staff == sid), (x) => x.amt) + pCar(sid), pPaid = (sid) => sum(db.pays.filter((p) => p.staff == sid), (p) => p.amt);
function pAlloc(sid) {
  let pd = pPaid(sid) - pCar(sid);
  return db.missions.filter((m) => m.staff == sid).sort((a, b) => dn(a.date) - dn(b.date)).map((m) => {
    const sh = mc(m).sh, x = Math.max(0, Math.min(sh, pd));
    pd -= x;
    return { m, sh, st: x >= sh - 0.5 ? ["پرداخت‌شده", "ok"] : x > 0 ? ["پرداخت جزئی", "warn"] : ["پرداخت‌نشده", "bad"] };
  });
}
function drawMD() {
  const m = db.missions[M.i] || {}, c = mc(m), st = db.staff.find((x) => x.id == m.staff) || {}, pc = m.pct || st.pct || 60, L = m.lines || [], C = m.cons || [], rw = (a, b) => `<tr><td class="m">${a}</td><td>${b}</td></tr>`;
  return `<div class="mo"><div class="mb" style="max-width:660px"><h3>جزئیات مأموریت</h3><table>${rw("تاریخ و ساعت", (m.date || "—") + (m.time ? " — " + m.time : ""))}${rw("شماره فاکتور", esc(m.invoice) || "—")}${rw("مشتری", esc(nm("clients", m.client)))}${rw("پرستار", esc(nm("staff", m.staff)))}${rw("درصد پرستار از تعرفه", pc + "٪" + (m.pct ? " (اختصاصی این مأموریت)" : ""))}</table>
<div class="sh">خدمات</div>${L.length ? `<table><tr><th>خدمت</th><th>تعداد</th><th>تعرفه</th><th>ایاب‌وذهاب</th></tr>${L.map((x) => `<tr><td>${esc(x.n)}</td><td>${x.q}</td><td>${fmt(x.p * x.q)}</td><td>${fmt(x.v * x.q)}</td></tr>`).join("")}</table>` : '<span class="m">—</span>'}
<div class="sh">مصرفی‌ها</div>${C.length ? `<table><tr><th>کالا</th><th>تعداد</th><th>قیمت واحد</th><th>جمع</th></tr>${C.map((x) => `<tr><td>${esc(x.n)}</td><td>${x.q}</td><td>${fmt(x.p)}</td><td>${fmt(x.p * x.q)}</td></tr>`).join("")}</table>` : '<span class="m">ندارد</span>'}
<div class="sh">محاسبه</div><table>${rw("جمع تعرفه", fmt(mt(m)))}${rw("جمع ایاب‌وذهاب", fmt(mv(m)))}${rw("جمع مصرفی", fmt(c.cons))}${rw("تخفیف", fmt(c.disc))}${rw("پاداش پرداختی مشتری به پرستار", fmt(c.bonus))}${rw("<b>جمع کل (پرداخت مشتری)</b>", "<b>" + fmt(c.tot) + "</b>")}${rw("مالیات ۲۰٪ پاداش (کسر از پاداش)", fmt(c.tax))}${rw("<b>سهم پرستار</b> (شامل خالص پاداش)", "<b>" + fmt(c.sh) + "</b>")}${rw("<b>سهم شرکت</b>", "<b>" + fmt(c.co) + "</b>")}${rw("قابل پرداخت به شرکت (بدون پاداش)", fmt(mOwe(m)))}${rw("وضعیت دریافت از مشتری", rcLine(m))}</table>
<div style="margin-top:14px"><button class="p" onclick="op('missions',${M.i})">✎ ویرایش</button> <button onclick="prInv('${m.id}')">🧾 چاپ فاکتور</button> <button onclick="xm()">بستن</button></div></div></div>`;
}
const pnT = (sid) => {
  const al = pAlloc(sid), ps = db.pays.filter((x) => x.staff == sid).sort((a, b) => dn(b.date) - dn(a.date)), bs = db.bons.filter((x) => x.staff == sid).sort((a, b) => dn(b.date) - dn(a.date));
  return { m: al.length ? `<div style="overflow-x:auto"><table><tr><th>تاریخ</th><th>فاکتور</th><th>مشتری</th><th>خدمات</th><th>جمع کل</th><th>سهم پرستار</th><th>وضعیت</th></tr>${al.map((x) => `<tr><td>${x.m.date}</td><td>${esc(x.m.invoice) || "—"}</td><td>${esc(nm("clients", x.m.client))}</td><td>${esc(svs(x.m))}</td><td>${fmt(mc(x.m).tot)}</td><td>${fmt(x.sh)}</td><td><b class="${x.st[1]}">${x.st[0]}</b></td></tr>`).join("")}</table></div>` : '<span class="m">مأموریتی ثبت نشده است.</span>', p: ps.length ? `<table><tr><th>تاریخ</th><th>مبلغ</th><th>از حساب</th><th>توضیح</th><th></th></tr>${ps.map((x) => `<tr><td>${x.date}</td><td>${fmt(x.amt)}</td><td>${x.acct ? esc(nm("accts", x.acct)) : "—"}</td><td>${esc(x.note) || "—"}</td><td><button class="x" onclick="pyDel('${x.id}')">✕</button></td></tr>`).join("")}</table>` : '<span class="m">هنوز پرداختی ثبت نشده است.</span>', b: bs.length ? `<table><tr><th>تاریخ</th><th>مبلغ</th><th>توضیح</th><th></th></tr>${bs.map((x) => `<tr><td>${x.date}</td><td>${fmt(x.amt)}</td><td>${esc(x.note) || "—"}</td><td><button class="x" onclick="bnDel('${x.id}')">✕</button></td></tr>`).join("")}</table>` : '<span class="m">پاداش شرکت ثبت نشده است.</span>' };
};
const pnS = (sid) => {
  const ms = db.missions.filter((m) => m.staff == sid), eP = sum(ms, (m) => mc(m).bonus - mc(m).tax), eM = sum(ms, (m) => mc(m).sh) - eP, eB = sum(db.bons.filter((x) => x.staff == sid), (x) => x.amt), eC = pCar(sid), e = eM + eP + eB + eC, p = pPaid(sid);
  return { eM, eP, eB, eC, e, p, r: e - p };
};
const pyRem = () => Math.max(0, Math.round(pnS(M.sid).r));
function pyUp() {
  if (M.d.touched) return;
  const x = $("#pyamt");
  if (x) x.value = dv(pyRem() + (+M.d.bonus || 0));
}
function pyAdd() {
  if (!(canE("pays"))) return deny();
  const d = M.d, dt = nj(d.date), bn = +d.bonus || 0, a = d.touched ? +d.amt || 0 : pyRem() + bn;
  if (!dt) return alert("تاریخ نامعتبر است (نمونه: 1405/01/15)");
  if (bn < 0 || a < 0) return alert("مبلغ نمی‌تواند منفی باشد");
  if (!bn && !(a > 0)) return alert("مبلغی برای ثبت وجود ندارد");
  if (bn > 0) db.bons.push({ id: uid(), staff: M.sid, date: dt, amt: bn, note: d.note || "" });
  if (a > 0) db.pays.push({ id: uid(), staff: M.sid, date: dt, amt: a, acct: d.acct || "", note: d.note || "" });
  M.d = { date: todayJ(), amt: "", acct: d.acct || "", note: "", bonus: "", touched: 0 };
  save();
  render();
}
const pyDel = (id) => {
  if (!(canE("pays"))) return deny();
  if (!confirm("این پرداخت حذف شود؟")) return;
  db.pays = db.pays.filter((x) => x.id != id);
  save();
  render();
}, bnDel = (id) => {
  if (!confirm("این پاداش حذف شود؟")) return;
  db.bons = db.bons.filter((x) => x.id != id);
  save();
  render();
};
function pnH(sid) {
  const t = db.staff.find((x) => x.id == sid) || {}, z = pnS(sid), T = pnT(sid);
  return `<table><tr><td>سهم مأموریت‌ها</td><td>${fmt(z.eM)}</td></tr><tr><td>پاداش مشتری (خالص بعد از ۲۰٪ مالیات)</td><td>${fmt(z.eP)}</td></tr><tr><td>پاداش شرکت</td><td>${fmt(z.eB)}</td></tr>${z.eC ? `<tr><td>مانده‌ی دوره‌ی قبل</td><td>${fmt(z.eC)}</td></tr>` : ""}<tr><td><b>جمع قابل دریافت</b></td><td><b>${fmt(z.e)}</b></td></tr><tr><td>پرداخت‌شده</td><td>${fmt(z.p)}</td></tr><tr><td><b>مانده‌ی پرداخت‌نشده</b></td><td><b>${fmt(z.r)}</b></td></tr></table><div class="sh">مأموریت‌ها</div>${T.m}<div class="sh">پرداخت‌ها</div>${T.p}<div class="sh">پاداش‌های شرکت</div>${T.b}`;
}
function xpN(sid) {
  const t = db.staff.find((x) => x.id == sid) || {}, z = pnS(sid);
  xl([["خلاصه", [["سهم مأموریت‌ها", cu(z.eM)], ["پاداش مشتری (خالص)", cu(z.eP)], ["پاداش شرکت", cu(z.eB)], ["مانده‌ی دوره‌ی قبل", cu(z.eC)], ["جمع قابل دریافت", cu(z.e)], ["پرداخت‌شده", cu(z.p)], ["مانده", cu(z.r)]]], ["مأموریت‌ها", [["تاریخ", "شماره فاکتور", "مشتری", "خدمات", "جمع کل", "سهم پرستار", "وضعیت پرداخت"], ...pAlloc(sid).map((x) => [x.m.date, x.m.invoice || "", nm("clients", x.m.client), svs(x.m), cu(mc(x.m).tot), cu(x.sh), x.st[0]])]], ["پرداخت‌ها", [["تاریخ", "مبلغ", "از حساب", "توضیح"], ...db.pays.filter((p) => p.staff == sid).map((p) => [p.date, cu(p.amt), p.acct ? nm("accts", p.acct) : "", p.note || ""])]], ["پاداش‌های شرکت", [["تاریخ", "مبلغ", "توضیح"], ...db.bons.filter((p) => p.staff == sid).map((p) => [p.date, cu(p.amt), p.note || ""])]]], "تسویه-" + (t.name || "پرستار") + "-" + todayJ().replace(/\//g, "-") + ".xlsx");
}
const prN = (sid) => prn("تسویه‌ی سهم پرستار — " + ((db.staff.find((x) => x.id == sid) || {}).name || ""), pnH(sid));
function drawMP() {
  const sid = M.sid, t = db.staff.find((x) => x.id == sid) || {}, z = pnS(sid), T = pnT(sid), d = M.d, si = db.staff.findIndex((x) => x.id == sid), amt = d.touched ? d.amt : pyRem() + (+d.bonus || 0);
  return `<div class="mo"><div class="mb" style="max-width:860px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0">تسویه با ${esc(t.name)}</h3><span><button onclick="prN('${sid}')">🖨 چاپ</button> <button onclick="xpN('${sid}')">⬇ اکسل</button> <button onclick="xm()">✕ بستن</button></span></div>
<div class="k" style="margin:12px 0 4px"><div>جمع قابل دریافت<b>${fmt(z.e)}</b></div><div>پرداخت‌شده<b class="ok">${fmt(z.p)}</b></div><div>مانده‌ی پرداخت‌نشده<b class="${z.r > 0 ? "warn" : ""}">${fmt(z.r)}</b></div></div>
<div class="m">سهم مأموریت‌ها ${fmt(z.eM)} + پاداش مشتری (خالص) ${fmt(z.eP)} + پاداش شرکت ${fmt(z.eB)}${z.eC ? ` + مانده‌ی دوره‌ی قبل ${fmt(z.eC)}` : ""}</div>
${t.iban ? `<p>شماره شبا: <span dir="ltr" style="user-select:all;font-family:Consolas,monospace">${t.iban}</span> <button onclick="cpy(db.staff[${si}].iban,this)">کپی</button></p>` : ""}
<div class="card" style="margin-top:12px;border:2px solid var(--p)"><b>ثبت پرداخت</b>
<div class="fg" style="margin:8px 0"><label>پاداش شرکت (اختیاری — صفر یا خالی = بدون پاداش)<input type="number" min="0" placeholder="0" value="${d.bonus === "" ? "" : dv(d.bonus)}" oninput="M.d.bonus=uv(this.value);pyUp()"></label><label>مبلغ پرداخت (خودکار = مانده + پاداش؛ قابل تغییر)<input id="pyamt" type="number" value="${amt === "" ? "" : dv(amt)}" oninput="M.d.amt=uv(this.value);M.d.touched=1"></label><label>از حساب / تنخواه (اختیاری)<select onchange="M.d.acct=this.value"><option value="">—</option>${sel(ACO(), d.acct)}</select></label><label>تاریخ<span style="display:flex;gap:4px"><input placeholder="1405/01/01" value="${esc(d.date)}" oninput="M.d.date=this.value"><button type="button" onclick="cpO('m','date')">📅</button></span></label><label>توضیح<input value="${esc(d.note)}" oninput="M.d.note=this.value"></label></div>
<button class="p" onclick="pyAdd()">✓ ثبت پرداخت</button> <span class="m">اگر مبلغ پیش‌فرض را می‌خواهید، فقط همین دکمه را بزنید.</span></div>
<details open><summary class="sh" style="cursor:pointer">گزارش مأموریت‌ها (پرداخت‌ها از قدیمی‌ترین مأموریت تخصیص داده می‌شود)</summary>${T.m}</details>
<details><summary class="sh" style="cursor:pointer">پرداخت‌های ثبت‌شده</summary>${T.p}</details>
<details><summary class="sh" style="cursor:pointer">پاداش‌های شرکت</summary>${T.b}</details></div></div>`;
}
const PAL = ["#0b7a75", "#d98a00", "#6d3fc0", "#c2255c", "#2e7d32", "#1d63c4", "#c75b0a", "#7a8791"];
const lgd = (a) => `<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:6px">${a.map((x) => `<span><i style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${x[1]};vertical-align:-1px;margin-left:5px"></i>${x[0]}</span>`).join("")}</div>`;
function bch(lb, sets) {
  const W = 640, H = 250, L = 8, Rr = 92, T = 12, B = 30, all = sets.flatMap((x) => x.v), mx = Math.max(0, ...all), mn = Math.min(0, ...all), rg = mx - mn || 1, y = (v) => T + (mx - v) / rg * (H - T - B), n = lb.length, gw = (W - L - Rr) / n, bw = Math.min(24, gw / (sets.length + 0.6));
  let o = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;direction:ltr" role="img">`;
  for (let i = 0; i <= 4; i++) {
    const v = mn + rg * i / 4, yy = y(v);
    o += `<line x1="${L}" x2="${W - Rr + 6}" y1="${yy}" y2="${yy}" stroke="var(--b)"/><text x="${W - Rr + 10}" y="${yy + 4}" style="fill:var(--m);font-size:11px">${shortN(v)}</text>`;
  }
  lb.forEach((t, i) => {
    const cx = W - Rr - (i + 0.5) * gw;
    sets.forEach((x, k) => {
      const v = x.v[i], bx = cx - sets.length * bw / 2 + k * bw, y0 = y(0), y1 = y(v);
      o += `<rect x="${bx}" y="${Math.min(y0, y1)}" width="${bw - 2}" height="${Math.max(1, Math.abs(y1 - y0))}" rx="3" fill="${x.c}"><title>${x.n}: ${fmt(v)}</title></rect>`;
    });
    o += `<text x="${cx}" y="${H - 10}" text-anchor="middle" style="fill:var(--m);font-size:12px">${t}</text>`;
  });
  return o + "</svg>";
}
function dnt(it) {
  const tot = sum(it, (x) => x[1]);
  if (!tot) return '<span class="m">داده‌ای نیست.</span>';
  const r = 42, C = 2 * Math.PI * r;
  let ac = 0, o = `<svg viewBox="0 0 120 120" style="width:170px;height:170px;flex:none"><circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--bg)" stroke-width="22"/>`;
  it.forEach((x, i) => {
    const l = x[1] / tot * C;
    o += `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${PAL[i % 8]}" stroke-width="22" stroke-dasharray="${l} ${C - l}" stroke-dashoffset="${-ac}" transform="rotate(-90 60 60)"><title>${esc(x[0])}: ${fmt(x[1])}</title></circle>`;
    ac += l;
  });
  return `<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">${o}</svg><div style="flex:1;min-width:170px">${it.map((x, i) => `<div style="display:flex;justify-content:space-between;gap:10px;padding:3px 0"><span><i style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${PAL[i % 8]};margin-left:6px"></i>${esc(x[0])}</span><b>${Math.round(x[1] / tot * 100)}٪</b></div>`).join("")}</div></div>`;
}
const nbr = (rows) => {
  const mx = Math.max(1, ...rows.map((r) => r[1]));
  return rows.map((r) => `<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;gap:10px"><span>${esc(r[0])}</span><b>${fmt(r[1])}</b></div><div style="display:flex;height:14px;border-radius:7px;overflow:hidden;background:var(--bg)"><div style="width:${r[2] / mx * 100}%;background:${PAL[0]}"></div><div style="width:${r[3] / mx * 100}%;background:${PAL[1]}"></div></div></div>`).join("");
};
function dc() {
  const td = pj(todayJ());
  let y = td[0], m = td[1];
  const ms = [];
  for (let i = 0; i < 6; i++) {
    ms.unshift([y, m]);
    m--;
    if (m < 1) {
      m = 12;
      y--;
    }
  }
  const D = ms.map((q) => pl(dn(q[0] + "/" + pad(q[1]) + "/01"), dn(q[0] + "/" + pad(q[1]) + "/" + pad(jmd(q[0], q[1]))))), lb = ms.map((q) => MN[q[1] - 1]), t = dn(todayJ()), a90 = t - 89, a30 = t - 29, ex = {};
  db.exp.filter((e) => {
    const x = dn(e.date);
    return x >= a90 && x <= t;
  }).forEach((e) => ex[e.cat || "سایر"] = (ex[e.cat || "سایر"] || 0) + e.amt);
  const ei = Object.entries(ex).sort((a, b) => b[1] - a[1]), top = ei.slice(0, 7), rest = sum(ei.slice(7), (x) => x[1]);
  if (rest) top.push(["سایر دسته‌ها", rest]);
  const nr = db.staff.map((t2) => {
    const a = db.missions.filter((x) => x.staff == t2.id && dn(x.date) >= a30 && dn(x.date) <= t);
    return [t2.name, sum(a, (x) => mc(x).tot), sum(a, (x) => mc(x).sh), Math.max(0, sum(a, (x) => mc(x).co))];
  }).filter((r) => r[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return `<div class="card"><h3>روند ۶ ماه اخیر (${UN()}، اعداد کوتاه‌شده)</h3>${lgd([["درآمد", PAL[0]], ["هزینه", PAL[1]], ["سود خالص", PAL[2]]])}${bch(lb, [{ n: "درآمد", c: PAL[0], v: D.map((p) => p.svc + p.cons + p.rent) }, { n: "هزینه", c: PAL[1], v: D.map((p) => p.ex) }, { n: "سود خالص", c: PAL[2], v: D.map((p) => p.net) }])}</div>
<div class="cgrid"><div class="card"><h3>هزینه‌ها به تفکیک دسته (۹۰ روز اخیر)</h3>${dnt(top)}</div><div class="card"><h3>درآمد به تفکیک پرستار (۳۰ روز اخیر)</h3>${lgd([["سهم پرستار", PAL[0]], ["سهم شرکت", PAL[1]]])}${nr.length ? nbr(nr) : '<span class="m">داده‌ای نیست.</span>'}</div></div>`;
}
