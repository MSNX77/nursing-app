// ======== v0.8: live total, print/excel, patient file ========
const ttH = () => {
  const d = M.d, c = mc(d);
  return `<span>تعرفه ${fmt(mt(d))}</span> · <span>ایاب‌وذهاب ${fmt(mv(d))}</span> · <span>مصرفی ${fmt(c.cons)}</span>${c.disc ? ` · <span>تخفیف −${fmt(c.disc)}</span>` : ""}${c.bonus ? ` · <span>پاداش +${fmt(c.bonus)}</span>` : ""}<div style="font-size:1.2em;margin-top:4px"><b>جمع کل مشتری: ${fmt(c.tot)} ${UN()}</b></div><div class="m">سهم پرستار ${fmt(c.sh)} · سهم شرکت ${fmt(c.co)}${c.tax ? " · مالیات پاداش " + fmt(c.tax) : ""}</div>`;
};
const ut = () => {
  const e = $("#tt");
  if (e && M && M.l == "missions") e.innerHTML = ttH();
};
function prn(title, html, hd) {
  const p = $("#prt");
  p.innerHTML = (hd || `<div class="ph"><h2 style="margin:0">${title}</h2><div>مدیریت شرکت پرستاری در منزل — تاریخ چاپ: ${todayJ()}</div></div>`) + html;
  window.onafterprint = () => {
    p.innerHTML = "";
  };
  setTimeout(() => window.print(), 60);
}
function prPage() {
  const a = $("#app").cloneNode(true);
  a.querySelectorAll(".ptr,.adc,input,select,textarea").forEach((x) => x.remove());
  a.querySelectorAll("button").forEach((b) => b.classList.contains("lk") ? b.replaceWith(document.createTextNode(b.textContent)) : b.remove());
  prn(pgT(), (tab == "rep" ? `<div>بازه: ${R.from || "—"} تا ${R.to || "—"}</div>` : "") + a.innerHTML);
}
function xpg() {
  const out = [], used = {};
  $("#app").querySelectorAll("table").forEach((tb) => {
    const h = tb.closest(".card") && tb.closest(".card").querySelector("h3"), n0 = (h && h.textContent || pgT()).replace(/[\\\/\?\*\[\]:]/g, " ").trim().slice(0, 26);
    let n = n0, k = 2;
    while (used[n]) n = n0 + " " + k++;
    used[n] = 1;
    out.push([n, [...tb.rows].map((r) => [...r.cells].map((c) => {
      const x = c.cloneNode(true);
      x.querySelectorAll("button,input,select").forEach((e) => e.classList.contains("lk") ? e.replaceWith(e.textContent) : e.remove());
      const t = x.textContent.trim().replace(/\s+/g, " ");
      return /^-?[\d,]+(\.\d+)?$/.test(t) ? +t.replace(/,/g, "") : t;
    }))]);
  });
  if (!out.length) return alert("جدولی در این صفحه نیست");
  xl(out, pgT().replace(/[\\\/\?\*:\[\]]/g, "") + "-" + todayJ().replace(/\//g, "-") + ".xlsx");
}
const SUB = {
  par: { t: "کارهای پاراکلینیک انجام‌شده", k: "date", f: [["date", "تاریخ", "d"], ["type", "نوع (آزمایش، سونوگرافی، رادیولوژی، نوار قلب، ...)"], ["res", "نتیجه / توضیح"]] },
  med: { t: "داروهای مصرفی", k: "date", f: [["name", "نام دارو"], ["dose", "دوز و نحوه‌ی مصرف"], ["doc", "پزشک تجویزکننده"], ["date", "تاریخ شروع", "d"], ["end", "تاریخ پایان (خالی = ادامه دارد)", "d"]] },
  adm: { t: "سوابق بستری", k: "start", f: [["start", "تاریخ بستری", "d"], ["end", "تاریخ ترخیص", "d"], ["hos", "بیمارستان / مرکز"], ["why", "علت بستری"]] },
  ins: { t: "بیمه‌ها", k: "exp", f: [["kind", "نوع", "s"], ["name", "نام بیمه"], ["no", "شماره بیمه‌نامه / دفترچه"], ["exp", "تاریخ انقضا", "d"]] },
  vit: { t: "علائم حیاتی", k: "date", f: [["date", "تاریخ", "d"], ["bp", "فشارخون"], ["hr", "ضربان"], ["tp", "دما"], ["sp", "SpO₂"], ["bs", "قند خون"]] },
  nts: { t: "یادداشت‌های پرستاری", k: "date", f: [["date", "تاریخ", "d"], ["txt", "یادداشت"]] }
}, KIND = [["base", "بیمه‌ی پایه"], ["supp", "بیمه‌ی تکمیلی"]], PT = [["sum", "خلاصه‌ی پرونده"], ["info", "مشخصات"], ["par", "پاراکلینیک"], ["med", "داروها"], ["adm", "بستری‌ها"], ["ins", "بیمه‌ها"], ["vit", "علائم حیاتی"], ["mis", "مأموریت‌ها"], ["nts", "یادداشت‌ها"]];
const pft = (t) => {
  M.tab = t;
  drawM();
}, vci = (i) => {
  M = { l: "clients", v: 4, i, tab: "sum", d: {} };
  drawM();
}, prnC = (i) => {
  const c = db.clients[i];
  prn("خلاصه‌ی پرونده — " + c.name, pfSum(c));
};
const pfVal = (f, v) => f[2] == "s" ? (KIND.find((k) => k[0] == v) || [0, v])[1] || "—" : v || "—";
function psAdd(sec) {
  if (!(canE("clients"))) return deny();
  const c = db.clients[M.i], r = { id: uid() };
  let any = 0;
  for (const f of SUB[sec].f) {
    let v = String(M.d[sec + "_" + f[0]] || "").trim();
    if (f[2] == "d" && v) {
      const n = nj(v);
      if (!n) return alert("تاریخ نامعتبر است (نمونه: 1405/01/15)");
      v = n;
    }
    if (f[2] == "s" && !v) v = "base";
    r[f[0]] = v;
    if (v && f[2] != "s" && !((f[0] == "date" || f[0] == "start") && v == todayJ())) any = 1;
  }
  if (!any) return alert("حداقل یک فیلد را پر کنید");
  (c[sec] = c[sec] || []).push(r);
  SUB[sec].f.forEach((f) => delete M.d[sec + "_" + f[0]]);
  save();
  render();
}
const psDel = (sec, id) => {
  if (!(canE("clients"))) return deny();
  if (!confirm("این مورد حذف شود؟")) return;
  const c = db.clients[M.i];
  c[sec] = c[sec].filter((x) => x.id != id);
  save();
  render();
};
const pfSort = (L, k) => [...L || []].sort((a, b) => (dn(b[k] || "") || 0) - (dn(a[k] || "") || 0));
function pfSub(sec, c) {
  const S = SUB[sec], L = pfSort(c[sec], S.k);
  return (L.length ? `<div style="overflow-x:auto"><table><tr>${S.f.map((f) => `<th>${f[1].split(" (")[0]}</th>`).join("")}<th></th></tr>${L.map((x) => `<tr>${S.f.map((f) => `<td>${esc(String(pfVal(f, x[f[0]])))}</td>`).join("")}<td><button class="x" onclick="psDel('${sec}','${x.id}')">✕</button></td></tr>`).join("")}</table></div>` : '<span class="m">موردی ثبت نشده است.</span>') + `<div class="card" style="margin-top:10px"><b>+ افزودن</b><div class="fg" style="margin:8px 0">${S.f.map((f) => {
    const k = sec + "_" + f[0];
    if (M.d[k] === void 0 && (f[0] == "date" || f[0] == "start")) M.d[k] = todayJ();
    const v = esc(String(M.d[k] || ""));
    return `<label>${f[1]}${f[2] == "s" ? `<select onchange="M.d['${k}']=this.value">${sel(KIND, M.d[k] || "base")}</select>` : f[2] == "d" ? `<span style="display:flex;gap:4px"><input placeholder="1405/01/01" value="${v}" oninput="M.d['${k}']=this.value"><button type="button" onclick="cpO('m','${k}')">📅</button></span>` : `<input value="${v}" oninput="M.d['${k}']=this.value">`}</label>`;
  }).join("")}</div><button class="p" onclick="psAdd('${sec}')">ثبت</button></div>`;
}
const pfTb = (h, rows) => rows.length ? `<table><tr>${h.map((x) => `<th>${x}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((v) => `<td>${esc(v == null || v === "" ? "—" : String(v))}</td>`).join("")}</tr>`).join("")}</table>` : '<span class="m">ثبت نشده</span>';
const pfMsn = (c) => db.missions.filter((m) => m.client == c.id).sort((a, b) => dn(b.date) - dn(a.date));
const pfv = (c, f) => f.o ? (f.o().find((x) => x[0] == c[f.k]) || [0, ""])[1] || "—" : c[f.k] || "—";
function pfMis(c) {
  const L = pfMsn(c);
  return `<h3>مأموریت‌های انجام‌شده برای بیمار (${L.length} مورد — جمع ${fmt(sum(L, (m) => mc(m).tot))} ${UN()})</h3>` + pfTb(["تاریخ", "پرستار", "خدمات", "مصرفی‌ها", "جمع کل"], L.map((m) => [m.date + (m.time ? " — " + m.time : ""), nm("staff", m.staff), svs(m), (m.cons || []).map((x) => x.n + "×" + x.q).join("، ") || "—", fmt(mc(m).tot)])) + '<p class="m">مأموریت‌ها از بخش «مأموریت‌ها» ثبت می‌شوند و خودکار اینجا می‌آیند.</p>';
}
function pfSum(c) {
  const t = dn(todayJ()), L = pfMsn(c), act = pfSort((c.med || []).filter((x) => !x.end || dn(x.end) >= t), "date"), ag = c.birth ? pj(todayJ())[0] - pj(c.birth)[0] + " سال" : "—", g = c.gender == "m" ? "مرد" : c.gender == "f" ? "زن" : "—";
  return `<div class="sh" style="margin-top:0">مشخصات</div><table><tr><td class="m">نام</td><td><b>${esc(c.name)}</b></td><td class="m">سن / جنسیت</td><td>${ag} / ${g}</td></tr><tr><td class="m">کد ملی</td><td>${esc(c.nid) || "—"}</td><td class="m">تاریخ تولد</td><td>${c.birth || "—"}</td></tr><tr><td class="m">تلفن</td><td>${esc(c.phone) || "—"}</td><td class="m">تماس اضطراری</td><td>${esc(c.emerg) || "—"}</td></tr><tr><td class="m">آدرس</td><td colspan="3">${esc(c.address) || "—"}</td></tr></table>
<div class="sh">تشخیص و حساسیت‌ها</div><table><tr><td class="m">تشخیص / بیماری‌های زمینه‌ای</td><td>${esc(c.diag) || "—"}</td></tr><tr><td class="m">حساسیت‌ها</td><td><b class="${c.allergy ? "bad" : ""}">${esc(c.allergy) || "—"}</b></td></tr></table>
<div class="sh">بیمه‌ها</div>${pfTb(["نوع", "نام بیمه", "شماره", "انقضا"], (c.ins || []).map((x) => [pfVal(["kind", "", "s"], x.kind), x.name, x.no, x.exp]))}
<div class="sh">داروهای فعلی</div>${pfTb(["دارو", "دوز و نحوه‌ی مصرف", "پزشک تجویزکننده", "از تاریخ"], act.map((x) => [x.name, x.dose, x.doc, x.date]))}
<div class="sh">آخرین کارهای پاراکلینیک</div>${pfTb(["تاریخ", "نوع", "نتیجه"], pfSort(c.par, "date").slice(0, 6).map((x) => [x.date, x.type, x.res]))}
<div class="sh">سوابق بستری</div>${pfTb(["بستری", "ترخیص", "مرکز", "علت"], pfSort(c.adm, "start").slice(0, 6).map((x) => [x.start, x.end, x.hos, x.why]))}
<div class="sh">آخرین علائم حیاتی</div>${pfTb(["تاریخ", "فشارخون", "ضربان", "دما", "SpO₂", "قند"], pfSort(c.vit, "date").slice(0, 4).map((x) => [x.date, x.bp, x.hr, x.tp, x.sp, x.bs]))}
<div class="sh">مأموریت‌های پرستاری (${L.length} مورد${L.length ? " — از " + L[L.length - 1].date + " تا " + L[0].date : ""})</div>${pfTb(["تاریخ", "پرستار", "خدمات"], L.slice(0, 6).map((m) => [m.date, nm("staff", m.staff), svs(m)]))}
${(c.nts || []).length || c.note ? `<div class="sh">یادداشت‌ها</div>${c.note ? `<p>${esc(c.note)}</p>` : ""}${pfTb(["تاریخ", "یادداشت"], pfSort(c.nts, "date").slice(0, 4).map((x) => [x.date, x.txt]))}` : ""}`;
}
function drawPF() {
  const c = db.clients[M.i] || {}, tb = M.tab || "sum";
  let body;
  if (tb == "sum") body = pfSum(c);
  else if (tb == "info") body = `<table>${FS.clients.map((f) => `<tr><td class="m">${f.l}</td><td>${esc(String(pfv(c, f)))}</td></tr>`).join("")}</table><button class="p" style="margin-top:10px" onclick="op('clients',${M.i})">✎ ویرایش مشخصات</button>`;
  else if (tb == "mis") body = pfMis(c);
  else body = `<h3>${SUB[tb].t}</h3>` + pfSub(tb, c);
  return `<div class="mo"><div class="mb" style="max-width:980px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0">پرونده‌ی دیجیتال: ${esc(c.name)}</h3><span><button onclick="prnC(${M.i})">🖨 چاپ خلاصه‌ی پرونده</button> <button onclick="xm()">✕ بستن</button></span></div><div class="sgp" style="margin:12px 0">${PT.map((x) => `<button class="${x[0] == tb ? "on" : ""}" onclick="pft('${x[0]}')">${x[1]}</button>`).join("")}</div>${body}</div></div>`;
}
