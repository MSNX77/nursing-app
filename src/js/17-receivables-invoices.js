// ======== v0.10: طلب از مشتری، فاکتور، رسید، صورت‌حساب ========
let CAC = {};
const cA = (cid) => CAC[(AR || "") + "|" + cid] || (CAC[(AR || "") + "|" + cid] = cAlloc(cid));
const mOwe = (m) => {
  const c = mc(m);
  return c.tot - c.bonus;
};
function cAlloc(cid) {
  const car = db.carry && db.carry.clients && +db.carry.clients[cid] || 0, ch = [];
  db.missions.filter((m) => m.client == cid).forEach((m) => ch.push({ k: "m", id: m.id, date: m.date, amt: mOwe(m), m }));
  db.loans.filter((l) => l.client == cid && l.end).forEach((l) => {
    const r = ld(l).rent;
    if (r > 0) ch.push({ k: "l", id: l.id, date: l.end, amt: r, l });
  });
  ch.sort((a, b) => (dn(a.date) || 0) - (dn(b.date) || 0));
  if (car > 0) ch.unshift({ k: "c", id: "carry", date: "", amt: car });
  const rc = db.rcpts.filter((r) => r.client == cid), paid = {};
  ch.forEach((c) => paid[c.id] = 0);
  let free = car < 0 ? -car : 0;
  rc.forEach((r) => {
    let a = +r.amt || 0;
    const c = r.mission && ch.find((x) => x.k == "m" && x.id == r.mission);
    if (c) {
      const t = Math.max(0, Math.min(a, c.amt - paid[c.id]));
      paid[c.id] += t;
      a -= t;
    }
    free += a;
  });
  ch.forEach((c) => {
    const t = Math.max(0, Math.min(c.amt - paid[c.id], free));
    paid[c.id] += t;
    free -= t;
  });
  const rows = ch.map((c) => {
    const p = paid[c.id], rem = c.amt - p;
    return { c, paid: p, rem, st: rem <= 0.5 ? ["تسویه", "ok"] : p > 0.5 ? ["جزئی", "warn"] : ["باز", "bad"] };
  }), open = rows.filter((x) => x.rem > 0.5), owe = sum(open, (x) => x.rem);
  return { rows, credit: free, owe, chg: sum(ch, (c) => c.amt), got: sum(rc, (r) => +r.amt || 0), bal: owe - free, old: open.length ? open[0].c : null, car };
}
const mSt = (m) => cA(m.client).rows.find((r) => r.c.id == m.id) || null;
const mStB = (m) => {
  const x = mSt(m);
  return x ? `<b class="${x.st[1]}">${x.st[0]}</b>` : "—";
};
const remOf = (cid, mid) => {
  const a = cA(cid);
  if (!mid) return a.owe;
  const x = a.rows.find((r) => r.c.id == mid);
  return x ? x.rem : 0;
};
const rcLine = (m) => {
  const x = mSt(m);
  return x ? `<b class="${x.st[1]}">${x.st[0]}</b> — دریافت‌شده ${fmt(x.paid)} از ${fmt(x.c.amt)} (مانده ${fmt(x.rem)})${x.rem > 0.5 ? ` <button onclick="opR('${m.client}','${m.id}')">+ ثبت دریافت</button>` : ""}` : "—";
};
const pmN = (v) => (PMO().find((x) => x[0] == v) || [0, "—"])[1];
const nextNo = (l, k, start, ck) => {
  let mx = db.cfg && +db.cfg[ck] || 0;
  db[l].forEach((x) => {
    const n = parseInt(nz(x[k]).replace(/\D/g, ""));
    if (n > mx) mx = n;
  });
  return mx ? mx + 1 : start;
};
const opR = (cid, mid) => {
  op("rcpts");
  M.d.client = cid || "";
  M.d.mission = mid || "";
  const r = remOf(M.d.client, M.d.mission);
  if (r > 0) M.d.amt = Math.round(r);
  drawM();
};
const cAll = () => db.clients.map((c) => ({ c, a: cA(c.id) }));
const cTotal = () => {
  const td = dn(todayJ());
  let owe = 0, n = 0, old = 0;
  cAll().forEach((x) => {
    owe += x.a.owe;
    if (x.a.owe > 0.5) n++;
    x.a.rows.forEach((r) => {
      if (r.rem > 0.5 && (r.c.k == "c" || td - dn(r.c.date) > 30)) old += r.rem;
    });
  });
  return { owe, n, old, r30: sum(db.rcpts.filter((r) => td - dn(r.date) <= 30 && td - dn(r.date) >= 0), (r) => +r.amt || 0) };
};
const oldTxt = (a) => a.old ? a.old.k == "c" ? "دوره‌ی قبل" : a.old.date : "—";

// ---- مبلغ به حروف
const n2w = (n) => {
  const U = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه", "ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"], T = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"], H = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"], S = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];
  if (n === 0) return "صفر";
  const t3 = (x) => {
    const p = [];
    if (x >= 100) p.push(H[Math.floor(x / 100)]);
    x %= 100;
    if (x >= 20) {
      p.push(T[Math.floor(x / 10)]);
      if (x % 10) p.push(U[x % 10]);
    } else if (x) p.push(U[x]);
    return p.join(" و ");
  }, g = [];
  let i = 0;
  while (n > 0 && i < S.length) {
    const x = n % 1000;
    if (x) g.unshift(t3(x) + (S[i] ? " " + S[i] : ""));
    n = Math.floor(n / 1000);
    i++;
  }
  return g.join(" و ");
};

// ---- اطلاعات شرکت (سربرگ چاپ)
const coI = () => db.cfg && db.cfg.co || {};
const coSet = (k, v) => {
  if (!(isAdmin())) return deny();
  db.cfg = db.cfg || {};
  db.cfg.co = db.cfg.co || {};
  db.cfg.co[k] = v;
  save();
};
const coTab = () => {
  const c = coI(), f = (k, l, ph) => `<label style="display:block;margin-bottom:8px">${l}<input style="width:100%" value="${esc(c[k])}" placeholder="${ph || ""}" onchange="coSet('${k}',this.value)"></label>`;
  return `<p class="m" style="margin-top:0">این اطلاعات بالای فاکتور، رسید و صورت‌حساب چاپی نمایش داده می‌شود. هر تغییر خودکار ذخیره می‌شود.</p>${f("name", "نام شرکت", "مثلاً پرستاری در منزل ...")}${f("phone", "تلفن")}${f("addr", "آدرس")}${f("eco", "شناسه‌ی ملی / کد اقتصادی (اختیاری)")}${f("note", "متن پایین فاکتور (مثلاً شماره کارت یا شبا برای واریز)")}`;
};
const coHd = (title, no, date) => {
  const c = coI();
  return `<div class="ph" style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><h2 style="margin:0">${esc(c.name || "مدیریت شرکت پرستاری در منزل")}</h2><div>${esc([c.addr, c.phone && "تلفن: " + c.phone, c.eco && "شناسه: " + c.eco].filter(Boolean).join(" — "))}</div></div><div style="text-align:left"><b style="font-size:15px">${title}</b>${no ? `<div>شماره: ${esc(no)}</div>` : ""}<div>تاریخ: ${date}</div></div></div>`;
};
const sigBox = (a, b) => `<table style="margin-top:28px"><tr><td style="height:70px;vertical-align:top;width:50%">${a}</td><td style="vertical-align:top">${b}</td></tr></table>`;

// ---- فاکتور
const invAssign = (m) => {
  if (m.invoice) return m.invoice;
  const n = nextNo("missions", "invoice", 1001, "invN");
  if (!confirm("این مأموریت شماره‌ی فاکتور ندارد. شماره‌ی " + n + " به آن اختصاص داده شود؟")) return "";
  m.invoice = String(n);
  db.cfg = db.cfg || {};
  db.cfg.invN = n;
  save();
  render();
  return m.invoice;
};
function prInv(id) {
  const m = db.missions.find((x) => x.id == id);
  if (!m) return;
  const inv = invAssign(m), c = mc(m), cl = db.clients.find((x) => x.id == m.client) || {}, x = mSt(m), L = m.lines || [], C = m.cons || [], co = coI();
  let n = 0;
  const row = (t, q, p, tot) => `<tr><td>${++n}</td><td>${esc(t)}</td><td>${q}</td><td>${fmt(p)}</td><td>${fmt(tot)}</td></tr>`, tr = (a, b, bold) => `<tr><td>${bold ? "<b>" + a + "</b>" : a}</td><td style="width:35%">${bold ? "<b>" + b + "</b>" : b}</td></tr>`;
  const rows = L.map((l) => (l.p || !l.v ? row(l.n, l.q, l.p, l.p * l.q) : "") + (l.v ? row(l.p ? "ایاب‌وذهاب — " + l.n : l.n, l.q, l.v, l.v * l.q) : "")).join("") + C.map((k) => row("مصرفی: " + k.n, k.q, k.p, k.p * k.q)).join("");
  const html = `<table style="margin-bottom:10px"><tr><td>مشتری / بیمار</td><td><b>${esc(cl.name || "—")}</b></td><td>تلفن</td><td>${esc(cl.phone || "—")}</td></tr><tr><td>آدرس</td><td colspan="3">${esc(cl.address || "—")}</td></tr><tr><td>تاریخ مأموریت</td><td>${m.date}${m.time ? " — " + m.time : ""}</td><td>پرستار</td><td>${esc(nm("staff", m.staff))}</td></tr></table>
<table><tr><th>ردیف</th><th>شرح</th><th>تعداد</th><th>مبلغ واحد (${UN()})</th><th>مبلغ (${UN()})</th></tr>${rows}</table>
<table style="width:55%">${tr("جمع خدمات و ایاب‌وذهاب", fmt(mt(m) + mv(m)))}${c.cons ? tr("جمع مصرفی‌ها", fmt(c.cons)) : ""}${c.disc ? tr("تخفیف", "−" + fmt(c.disc)) : ""}${tr("مبلغ قابل پرداخت (" + UN() + ")", fmt(mOwe(m)), 1)}${x ? tr("دریافت‌شده تا امروز", fmt(x.paid)) + tr("مانده", fmt(x.rem), 1) : ""}</table>
${c.bonus ? `<p style="font-size:11px">* مبلغ ${fmt(c.bonus)} ${UN()} پاداش اختیاری است که مشتری مستقیماً به پرستار پرداخته و جزو این فاکتور نیست.</p>` : ""}
${co.note ? `<p>${esc(co.note)}</p>` : ""}${sigBox("امضا و مهر شرکت", "امضای مشتری")}`;
  prn("فاکتور", html, coHd("فاکتور خدمات پرستاری", inv, m.date));
}

// ---- رسید دریافت
function prRc(id) {
  const r = db.rcpts.find((x) => x.id == id);
  if (!r) return;
  const cl = db.clients.find((x) => x.id == r.client) || {}, m = r.mission && db.missions.find((x) => x.id == r.mission), a = cA(r.client), u = dv(r.amt), w = Number.isInteger(u) && u > 0 && u < 1e15 ? n2w(u) + " " + UN() : "", co = coI();
  const bl = a.bal > 0.5 ? fmt(a.bal) + " " + UN() + " بدهکار" : a.bal < -0.5 ? fmt(-a.bal) + " " + UN() + " پیش‌دریافت" : "تسویه";
  const html = `<table><tr><td style="width:28%">دریافت از</td><td><b>${esc(cl.name || "—")}</b></td></tr><tr><td>مبلغ</td><td><b style="font-size:14px">${fmt(r.amt)} ${UN()}</b>${w ? `<div>(${w})</div>` : ""}</td></tr><tr><td>بابت</td><td>${m ? "فاکتور " + esc(m.invoice || "بدون شماره") + " — " + m.date : "تسویه‌ی حساب / علی‌الحساب"}</td></tr><tr><td>روش پرداخت</td><td>${pmN(r.method)}${r.ref ? " — " + esc(r.ref) : ""}</td></tr>${r.acct ? `<tr><td>واریز به</td><td>${esc(nm("accts", r.acct))}</td></tr>` : ""}${r.note ? `<tr><td>توضیح</td><td>${esc(r.note)}</td></tr>` : ""}<tr><td>مانده‌ی حساب مشتری (تا زمان چاپ)</td><td>${bl}</td></tr></table>${co.note ? `<p>${esc(co.note)}</p>` : ""}${sigBox("امضا و مهر شرکت", "امضای تحویل‌دهنده")}`;
  prn("رسید", html, coHd("رسید دریافت وجه", r.no, r.date));
}

// ---- صورت‌حساب مشتری
const vcs = (cid) => {
  M = { l: "rcpts", v: 6, cid };
  drawM();
};
const wt = (c) => c.k == "c" ? "مانده‌ی دوره‌ی قبل" : c.k == "l" ? "اجاره‌ی تجهیز: " + nm("equip", c.l.equip) : "مأموریت" + (c.m.invoice ? " — فاکتور " + c.m.invoice : "") + ": " + svs(c.m);
function csBody(cid, p) {
  const a = cA(cid), rc = db.rcpts.filter((r) => r.client == cid).sort((x, y) => dn(y.date) - dn(x.date));
  return `<div class="k" style="margin:12px 0 4px"><div>جمع بدهی<b>${fmt(a.chg)}</b></div><div>دریافت‌شده<b class="ok">${fmt(a.got)}</b></div><div>${a.bal < -0.5 ? "پیش‌دریافت" : "مانده‌ی طلب"}<b class="${a.bal > 0.5 ? "warn" : ""}">${fmt(Math.abs(a.bal))}</b></div></div>${a.car ? `<div class="m">شامل مانده‌ی دوره‌ی قبل: ${fmt(a.car)}</div>` : ""}
<div class="sh">طلب‌ها (دریافت‌ها از قدیمی‌ترین طلب کم می‌شوند، مگر برای فاکتور مشخصی ثبت شده باشند)</div>${a.rows.length ? `<div style="overflow-x:auto"><table><tr><th>تاریخ</th><th>شرح</th><th>مبلغ</th><th>دریافت‌شده</th><th>مانده</th><th>وضعیت</th>${p ? "" : "<th></th>"}</tr>${a.rows.map((x) => `<tr><td>${x.c.date || "—"}</td><td>${esc(wt(x.c))}</td><td>${fmt(x.c.amt)}</td><td>${fmt(x.paid)}</td><td>${fmt(x.rem)}</td><td><b class="${x.st[1]}">${x.st[0]}</b></td>${p ? "" : `<td>${x.c.k == "m" ? `<button onclick="prInv('${x.c.id}')">🧾 فاکتور</button>` : ""}${x.rem > 0.5 && x.c.k == "m" ? ` <button onclick="opR('${cid}','${x.c.id}')">+ دریافت</button>` : ""}</td>`}</tr>`).join("")}</table></div>` : '<span class="m">طلبی ثبت نشده است.</span>'}
<div class="sh">دریافت‌ها</div>${rc.length ? `<table><tr><th>تاریخ</th><th>شماره رسید</th><th>مبلغ</th><th>روش</th><th>بابت</th>${p ? "" : "<th></th>"}</tr>${rc.map((r) => {
    const mm = r.mission && db.missions.find((x) => x.id == r.mission);
    return `<tr><td>${r.date}</td><td>${esc(r.no) || "—"}</td><td>${fmt(r.amt)}</td><td>${pmN(r.method)}${r.ref ? " — " + esc(r.ref) : ""}</td><td>${mm ? "فاکتور " + esc(mm.invoice || "بدون شماره") : "تسویه‌ی کلی"}</td>${p ? "" : `<td><button onclick="prRc('${r.id}')">🖨 رسید</button></td>`}</tr>`;
  }).join("")}</table>` : '<span class="m">دریافتی ثبت نشده است.</span>'}`;
}
function drawCS() {
  const cl = db.clients.find((x) => x.id == M.cid) || {};
  return `<div class="mo"><div class="mb" style="max-width:920px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0">صورت‌حساب — ${esc(cl.name)}</h3><span><button class="p" onclick="opR('${M.cid}')">+ ثبت دریافت</button> <button onclick="prCS('${M.cid}')">🖨 چاپ</button> <button onclick="xpCS('${M.cid}')">⬇ اکسل</button> <button onclick="xm()">✕ بستن</button></span></div>${csBody(M.cid, 0)}</div></div>`;
}
const prCS = (cid) => prn("صورت‌حساب مشتری — " + nm("clients", cid), `<p><b>${esc(nm("clients", cid))}</b></p>` + csBody(cid, 1), coHd("صورت‌حساب مشتری", "", todayJ()));
function xpCS(cid) {
  const a = cA(cid), nmc = nm("clients", cid);
  xl([["خلاصه", [["مشتری", nmc], ["واحد پولی", UN()], ["جمع بدهی", cu(a.chg)], ["دریافت‌شده", cu(a.got)], ["مانده (منفی = پیش‌دریافت)", cu(a.bal)]]], ["طلب‌ها", [["تاریخ", "شرح", "مبلغ", "دریافت‌شده", "مانده", "وضعیت"], ...a.rows.map((x) => [x.c.date || "", wt(x.c), cu(x.c.amt), cu(x.paid), cu(x.rem), x.st[0]])]], ["دریافت‌ها", [["تاریخ", "شماره رسید", "مبلغ", "روش", "شماره پیگیری", "بابت"], ...db.rcpts.filter((r) => r.client == cid).map((r) => {
    const mm = r.mission && db.missions.find((x) => x.id == r.mission);
    return [r.date, r.no || "", cu(r.amt), pmN(r.method), r.ref || "", mm ? "فاکتور " + (mm.invoice || "") : "تسویه‌ی کلی"];
  })]]], "صورت‌حساب-" + nmc + "-" + todayJ().replace(/\//g, "-") + ".xlsx");
}

// ---- گزارش و داشبورد
const rcRows = (p) => {
  const ids = [...new Set([...p.ms.map((m) => m.client), ...db.rcpts.filter((r) => inR(r.date)).map((r) => r.client)])].filter((c) => c && (!R.client || c == R.client));
  return [["مشتری", "فاکتور شده در بازه", "دریافت در بازه", "مانده‌ی کل طلب"], ...ids.map((id) => [nm("clients", id), cu(sum(p.ms.filter((m) => m.client == id), mOwe)), cu(sum(db.rcpts.filter((r) => r.client == id && inR(r.date)), (r) => +r.amt || 0)), cu(cA(id).bal)])];
};
const rcRep = (p) => {
  const R2 = rcRows(p);
  return `<div class="card"><h3>دریافت از مشتریان (بازه‌ی تاریخ)</h3><table><tr>${R2[0].map((h) => `<th>${h}</th>`).join("")}</tr>${R2.slice(1).map((r) => `<tr><td>${esc(r[0])}</td><td>${fn(r[1])}</td><td>${fn(r[2])}</td><td><b class="${r[3] > 0 ? "warn" : ""}">${fn(r[3])}</b></td></tr>`).join("") || '<tr><td class="m">موردی نیست.</td></tr>'}</table><p class="m">«فاکتور شده» بدون پاداش مستقیم مشتری به پرستار حساب می‌شود. مانده‌ی کل طلب به بازه‌ی تاریخ بستگی ندارد.</p></div>`;
};
const rcDash = () => {
  const A = cAll().filter((x) => x.a.owe > 0.5).sort((x, y) => y.a.owe - x.a.owe).slice(0, 5);
  return `<div class="card" style="margin-top:12px"><h3>طلب از مشتریان</h3>${A.length ? `<table><tr><th>مشتری</th><th>مانده</th><th>قدیمی‌ترین طلب</th></tr>${A.map((x) => `<tr style="cursor:pointer" onclick="vcs('${x.c.id}')"><td>${esc(x.c.name)}</td><td><b class="warn">${fmt(x.a.owe)}</b></td><td>${oldTxt(x.a)}</td></tr>`).join("")}</table><p><button onclick="go('recv')">همه‌ی طلب‌ها ›</button></p>` : '<span class="m">طلب بازی وجود ندارد.</span>'}</div>`;
};
V.recv = () => {
  const t = cTotal(), td = dn(todayJ()), rows = cAll().filter((x) => Math.abs(x.a.bal) > 0.5).sort((x, y) => y.a.bal - x.a.bal);
  return `<div class="k" style="margin-bottom:12px"><div>کل طلب از مشتریان<b class="${t.owe > 0 ? "warn" : ""}">${fmt(t.owe)}</b></div><div>مشتریان بدهکار<b>${t.n}</b></div><div>طلب قدیمی‌تر از ۳۰ روز<b class="${t.old > 0 ? "bad" : ""}">${fmt(t.old)}</b></div><div>دریافتی ۳۰ روز اخیر<b class="ok">${fmt(t.r30)}</b></div></div>`
    + addB("rcpts", "ثبت دریافت جدید", "برای دیدن صورت‌حساب، فاکتورها و رسیدهای هر مشتری روی ردیف او کلیک کنید. فاکتور از جزئیات هر مأموریت چاپ می‌شود.")
    + `<div class="card"><h3>مانده‌ی حساب مشتریان</h3><input class="sq" placeholder="🔍 جستجو در جدول..." value="${esc(Q.recv || "")}" oninput="Q['recv']=this.value;fq()"><table data-l="recv"><tr><th>مشتری</th><th>جمع بدهی</th><th>دریافت‌شده</th><th>مانده</th><th>قدیمی‌ترین طلب</th><th>روز</th><th></th></tr>${rows.map((x) => `<tr style="cursor:pointer" onclick="if(!event.target.closest('button'))vcs('${x.c.id}')"><td><b>${esc(x.c.name)}</b></td><td>${fmt(x.a.chg)}</td><td>${fmt(x.a.got)}</td><td><b class="${x.a.bal > 0.5 ? "warn" : "ok"}">${x.a.bal < -0.5 ? "پیش‌دریافت " + fmt(-x.a.bal) : fmt(x.a.bal)}</b></td><td>${oldTxt(x.a)}</td><td>${x.a.old && x.a.old.date ? td - dn(x.a.old.date) : "—"}</td><td><button onclick="opR('${x.c.id}')">+ دریافت</button></td></tr>`).join("") || '<tr><td class="m">مشتری بدهکار یا بستانکاری نیست.</td></tr>'}</table></div>`
    + `<div class="card"><h3>دریافت‌ها</h3>${grid("rcpts", [{ l: "تاریخ", k: "date" }, { l: "شماره رسید", k: "no" }, { l: "مشتری", k: "client", o: CO }, { l: "مبلغ", k: "amt", t: "n" }, { l: "روش", k: "method", o: PMO }, { l: "بابت", f: (r) => {
      const mm = r.mission && db.missions.find((x) => x.id == r.mission);
      return mm ? "فاکتور " + esc(mm.invoice || "بدون شماره") : "تسویه‌ی کلی";
    } }, { l: "حساب", k: "acct", o: ACO }, { l: "", f: (r) => `<button onclick="prRc('${r.id}')">🖨 رسید</button>` }])}</div>`;
};
