// ======== views ========
const addB = (l, t, h) => `<div class="card adc"><button class="p" onclick="op('${l}')">+ ${t}</button> <span class="m">${h || ""}</span></div>`;
const V = {
  periods: () => {
    if (AR) {
      const a = db._arch || {};
      return `<div class="card"><p>شما در محیط آرشیو «${esc(a.name)}» هستید. برای بستن دوره یا دیدن بقیه‌ی دوره‌ها اول به دوره‌ی جاری برگردید.</p><button class="p" onclick="arBack()">↩ بازگشت به دوره‌ی جاری</button></div>`;
    }
    const to = nj(PC.to), cn = to ? arCnt(to) : null, H = [...db.hist || []].sort((a, b) => dn(a.to) - dn(b.to)), used = arUsed(), y0 = pj(todayJ())[0], ys = [];
    for (let i = y0 - 6; i <= y0 + 1; i++) ys.push([i, i]);
    const cl = { missions: "مأموریت‌ها", exp: "هزینه‌ها", tx: "انتقال‌های حساب", pays: "پرداخت به پرسنل", bons: "پاداش‌های شرکت", rcpts: "دریافت‌های مشتریان", tscore: "امتیازهای مسئولین فنی", tpay: "کارانه‌های پرداخت‌شده", buys: "سوابق خرید تجهیزات", repairs: "تعمیرات تعیین‌تکلیف‌شده", loans: "امانت‌های تجهیزات بازگشته", chq: "چک‌های تعیین‌تکلیف‌شده" }, T0 = H.reduce((a, h) => ({ n: a.n + ((h.sum || {}).n || 0), inc: a.inc + ((h.sum || {}).inc || 0), ex: a.ex + ((h.sum || {}).ex || 0), net: a.net + ((h.sum || {}).net || 0) }), { n: 0, inc: 0, ex: 0, net: 0 });
    return `<div class="card"><h3>دوره‌ی جاری</h3><table><tr><td class="m">شروع دوره</td><td>${db.pstart || "از ابتدا"}</td><td class="m">مأموریت‌ها</td><td>${db.missions.length}</td><td class="m">هزینه‌ها</td><td>${db.exp.length}</td></tr><tr><td class="m">رزروها</td><td>${db.rsv.length}</td><td class="m">بیماران / پرسنل</td><td>${db.clients.length} / ${db.staff.length}</td><td class="m">پر بودن حافظه‌ی مرورگر</td><td><b class="${used > 35e5 ? "bad" : used > 25e5 ? "warn" : ""}">حدود ${Math.round(used / 5e4)}٪</b></td></tr></table></div>
<div class="card"><h3>بستن دوره</h3><p class="m" style="margin-top:0">تا تاریخی که انتخاب می‌کنید، اطلاعات ثبت‌شده آرشیو می‌شود و از دوره‌ی جاری خارج می‌شود تا برنامه سبک بماند. اشخاص (پرسنل، بیماران و پرونده‌هاشان)، رزروها، کیف‌ها، ست‌ها، موجودی کالا، تجهیزات، امانت‌های باز، چک‌های در جریان و بودجه‌ها به دوره‌ی بعد می‌روند. موجودی حساب‌ها و مانده‌ی تسویه‌ی هر پرسنل هم به‌عنوان «مانده‌ی اول دوره» منتقل می‌شود.</p>
<div class="fg"><label>تاریخ پایان دوره (شمسی)<span style="display:flex;gap:4px"><input value="${esc(PC.to)}" placeholder="1404/12/29" onchange="PC.to=nj(this.value)||this.value;render()"><button type="button" onclick="cpO('p','to')">📅</button></span></label><label>یا انتخاب سریع پایان ماه<span style="display:flex;gap:4px"><select onchange="PC.y=+this.value">${sel(ys, PC.y)}</select><select onchange="PC.m=+this.value">${sel(MN.map((n, i) => [i + 1, n]), PC.m)}</select><button type="button" onclick="pcEnd()">اعمال</button></span></label><label>نام دوره (اختیاری)<input value="${esc(PC.name)}" placeholder="مثلاً سال ۱۴۰۴" onchange="PC.name=this.value"></label></div>
${cn ? `<div class="sh">پیش‌نمایش: این موارد آرشیو می‌شوند</div><table><tr>${Object.keys(cl).map((k) => `<th>${cl[k]}</th>`).join("")}</tr><tr>${Object.keys(cl).map((k) => `<td>${cn[k]}</td>`).join("")}</tr></table>` : '<p class="m">تاریخ پایان را وارد کنید تا پیش‌نمایش دیده شود.</p>'}
<div style="margin-top:12px"><button class="p" onclick="arDo()">🔒 بستن دوره و آرشیو</button> <span class="m">قبل از بستن، بکاپ کامل خودکار دانلود می‌شود.</span></div></div>
<div class="card"><h3>دوره‌های بسته‌شده</h3>${H.length ? `<div style="overflow-x:auto"><table><tr><th>دوره</th><th>بازه</th><th>مأموریت‌ها</th><th>درآمد</th><th>هزینه‌ها</th><th>سود خالص</th><th>حجم (KB)</th><th></th></tr>${H.map((h) => {
      const sm = h.sum, av = !!localStorage.getItem(arKey(h.id));
      return `<tr><td><b>${esc(h.name)}</b></td><td>${h.from} تا ${h.to}</td><td>${sm ? sm.n : "—"}</td><td>${sm ? fmt(sm.inc) : "—"}</td><td>${sm ? fmt(sm.ex) : "—"}</td><td>${sm ? `<b class="${sm.net < 0 ? "bad" : ""}">${fmt(sm.net)}</b>` : "—"}</td><td>${av ? arSz(h.id) : '<span class="warn">در مرورگر نیست</span>'}</td><td>${av ? `<button class="p" onclick="arOpen('${h.id}')">📂 باز کردن</button> <button onclick="arDl('${h.id}')">⬇ فایل</button> ` : ""}<button class="x" onclick="arDel('${h.id}')" title="${av ? "حذف از مرورگر" : "حذف ردیف"}">🗑</button></td></tr>`;
    }).join("")}<tr><th>جمع دوره‌های بسته‌شده</th><th></th><th>${T0.n}</th><th>${fmt(T0.inc)}</th><th>${fmt(T0.ex)}</th><th>${fmt(T0.net)}</th><th></th><th></th></tr></table></div>` : '<span class="m">هنوز دوره‌ای بسته نشده است.</span>'}
<div style="margin-top:12px"><label class="rb">📁 بارگذاری آرشیو از فایل<input type="file" accept=".json" onchange="arImp(this)" hidden></label></div></div>
<div class="card"><h3>راهنما</h3><p>«📂 باز کردن» آرشیو را در یک محیط جدا باز می‌کند: همه‌ی بخش‌ها (گزارش‌ها، مالی، تسویه‌ها و ...) با اطلاعات همان دوره کار می‌کنند و هر ویرایشی فقط در همان آرشیو ذخیره می‌شود. بالای صفحه یک نوار نارنجی دیده می‌شود و با «بازگشت» به دوره‌ی جاری برمی‌گردید.</p><p>پیشنهاد: هر سال (آخر اسفند) دوره را ببندید، فایل آرشیو را دانلود و در جای امن نگه دارید و اگر حافظه‌ی مرورگر پر شد، آرشیو را از مرورگر حذف کنید؛ هر وقت لازم شد از فایل برمی‌گردد. داشبورد و گزارش‌ها فقط دوره‌ی جاری را نشان می‌دهند و سود و زیان دوره‌های قبلی در جدول بالا ثبت می‌ماند.</p></div>`;
  },
  rsv: () => addB("rsv", "رزرو جدید", "مأموریت‌های آینده را اینجا نگه دارید؛ زمان و پرستار را بعداً مشخص کنید و وقتی آماده شد با «ثبت مأموریت» آن را به مأموریت واقعی تبدیل کنید.") + `<div class="card">${grid("rsv", [{ l: "بیمار / مشتری", k: "client", o: CO }, { l: "خدمات", f: svs }, { l: "تاریخ", f: (r) => r.date || '<span class="m">تعیین نشده</span>' }, { l: "ساعت", f: (r) => r.time || "—" }, { l: "پرستار", f: (r) => r.staff ? esc(nm("staff", r.staff)) : '<span class="m">تعیین نشده</span>' }, { l: "توضیح", k: "note" }, { l: "وضعیت", f: (r) => r.date && r.staff ? '<b class="ok">آماده‌ی اجرا</b>' : '<b class="warn">نیازمند تعیین ' + (!r.date && !r.staff ? "زمان و پرستار" : !r.date ? "زمان" : "پرستار") + "</b>" }, { l: "", f: (r) => `<button class="p" onclick="rsvGo('${r.id}')">✔ ثبت مأموریت</button>` }])}</div>`,
  pay: () => {
    const tot = sum(db.staff, (x) => pEarn(x.id)), pd = sum(db.staff, (x) => pPaid(x.id));
    return `<div class="k" style="margin-bottom:12px"><div>کل سهم پرستاران<b>${fmt(tot)}</b></div><div>پرداخت‌شده<b class="ok">${fmt(pd)}</b></div><div>پرداخت‌نشده<b class="${tot - pd > 0 ? "warn" : ""}">${fmt(tot - pd)}</b></div></div><div class="card"><p class="m" style="margin-top:0">برای دیدن گزارش کامل مأموریت‌ها و ثبت پرداخت، روی ردیف هر پرستار کلیک کنید.</p><table><tr><th>پرستار</th><th>مأموریت‌ها</th><th>کل سهم</th><th>پرداخت‌شده</th><th>پرداخت‌نشده</th></tr>${db.staff.map((x, i) => {
      const e = pEarn(x.id), p = pPaid(x.id);
      return `<tr style="cursor:pointer" onclick="vp('${x.id}')"><td><b>${esc(x.name)}</b></td><td>${db.missions.filter((m) => m.staff == x.id).length}</td><td>${fmt(e)}</td><td class="ok">${fmt(p)}</td><td><b class="${e - p > 0 ? "warn" : ""}">${fmt(e - p)}</b></td></tr>`;
    }).join("") || '<tr><td class="m">پرستاری ثبت نشده است.</td></tr>'}</table></div>`;
  },
  dash: () => {
    const t = dn(todayJ()), y = pj(todayJ())[0], H = ["۳۰ روز اخیر", "۹۰ روز اخیر", "امسال", "سال قبل"], P = [pl(t - 29, t), pl(t - 89, t), pl(dn(y + "/01/01"), t), pl(dn(y - 1 + "/01/01"), dn(y + "/01/01") - 1)], row = (l, f, b) => `<tr><td>${b ? "<b>" + l + "</b>" : l}</td>${P.map((p) => `<td>${b ? "<b>" : ""}${f(p)}${b ? "</b>" : ""}</td>`).join("")}</tr>`, due = db.chq.filter((c) => c.st == "wait" && dn(c.due) <= t + 7).sort((a, b) => dn(a.due) - dn(b.due)), out = db.loans.filter((l) => !l.end).length;
    return `<div class="card"><h3>خلاصه‌ی مالی (${UN()}) — امروز ${todayJ()}</h3><table><tr><th></th>${H.map((h) => `<th>${h}</th>`).join("")}</tr>${row("تعداد مأموریت", (p) => p.n)}${row("درآمد خدمات", (p) => fmt(p.svc))}${row("فروش مصرفی", (p) => fmt(p.cons))}${row("اجاره تجهیزات", (p) => fmt(p.rent))}${row("سهم پرستاران", (p) => fmt(p.sh))}${row("هزینه‌ها", (p) => fmt(p.ex))}${row("سود خالص", (p) => fmt(p.net), 1)}</table></div>
<div class="k"><div>طلب از مشتریان<b class="${cTotal().owe > 0 ? "warn" : ""}">${fmt(cTotal().owe)}</b></div><div>پرسنل<b>${db.staff.length}</b></div><div>مشتریان<b>${db.clients.length}</b></div><div>خدمات<b>${db.services.length}</b></div><div>مأموریت‌های رزرو<b>${db.rsv.length}</b></div><div>هشدار انقضای کالا<b class="${expList().length ? "bad" : ""}">${expList().length}</b></div><div>تجهیزات نزد مشتری<b>${out}</b></div><div>تجهیزات در تعمیر<b class="${nRep() ? "warn" : ""}">${nRep()}</b></div><div>ست‌های استریل نیازمند توجه<b class="${db.sets.some((r) => ["bad", "warn"].includes(setSt(r)[1])) ? "bad" : ""}">${db.sets.filter((r) => ["bad", "warn"].includes(setSt(r)[1])).length}</b></div></div>
${dc()}${expCard()}${rcDash()}<div class="card" style="margin-top:12px"><h3>چک‌های در جریان تا ۷ روز آینده (یا عقب‌افتاده)</h3>${due.length ? "<table><tr><th>نوع</th><th>شماره</th><th>طرف حساب</th><th>مبلغ</th><th>سررسید</th></tr>" + due.map((c) => `<tr class="${dn(c.due) < t ? "bad" : ""}"><td>${c.type == "recv" ? "دریافتی" : "پرداختی"}</td><td>${c.num}</td><td>${c.party}</td><td>${fmt(c.amt)}</td><td>${c.due}</td></tr>`).join("") + "</table>" : '<span class="m">موردی نیست.</span>'}</div>`;
  },
  missions: () => addB("missions", "مأموریت جدید", "برای دیدن جزئیات (درصد، ایاب‌وذهاب، مصرفی‌ها، تخفیف و پاداش) روی هر ردیف کلیک کنید.") + `<div class="card fit">${grid("missions", [{ l: "تاریخ و ساعت", f: (r) => r.date + (r.time ? " — " + r.time : "") }, { l: "شماره فاکتور", k: "invoice" }, { l: "مشتری", k: "client", o: CO }, { l: "پرستار", k: "staff", o: SO }, { l: "خدمات", f: svs }, { l: "جمع کل", f: (r) => fmt(mc(r).tot) }, { l: "سهم پرستار", f: (r) => fmt(mc(r).sh) }, { l: "سهم شرکت", f: (r) => fmt(mc(r).co) }, { l: "وضعیت دریافت", f: (r) => mStB(r) }], "vmi")}</div>`,
  staff: () => addB("staff", "پرسنل جدید", "پرستار، منشی، دفتردار، اپراتور و ... را از اینجا اضافه کنید (نقش را در فرم انتخاب کنید). برای دیدن اطلاعات کامل (از جمله شماره شبا) روی نام کلیک کنید.") + `<div class="card">${grid("staff", [{ l: "نام", f: (r) => `<button class="lk" onclick="vw('${r.id}')">${r.name}</button>` }, { l: "کد پرسنلی", k: "code" }, { l: "جنسیت", k: "gender", o: FS.staff[1].o }, { l: "نقش", k: "role" }, { l: "تلفن", k: "phone" }, { l: "درصد از تعرفه", k: "pct", t: "n" }])}</div>`,
  clients: () => addB("clients", "بیمار / مشتری جدید", "برای دیدن پرونده‌ی دیجیتال کامل بیمار (پاراکلینیک، دارو، بستری، بیمه، مأموریت‌ها و خلاصه‌ی قابل چاپ) روی نام یا ردیف بیمار کلیک کنید.") + `<div class="card">${grid("clients", [{ l: "نام", f: (r) => `<button class="lk" onclick="vci(${db.clients.indexOf(r)})">${esc(r.name)}</button>` }, { l: "تلفن", k: "phone" }, { l: "تشخیص / بیماری زمینه‌ای", k: "diag" }, { l: "آدرس", k: "address" }, { l: "پیگیری بعدی", k: "followup" }, { l: "تعداد مأموریت", f: (r) => db.missions.filter((m) => m.client == r.id).length }], "vci")}</div>`,
  services: () => addB("services", "خدمت جدید", "ایاب‌وذهاب را هم همین‌جا به‌صورت یک خدمت جدا (نوع: ایاب‌وذهاب) تعریف کنید تا هنگام ثبت مأموریت انتخاب شود.") + `<div class="card">${grid("services", [{ l: "خدمت", k: "name" }, { l: "تعرفه", k: "price", t: "n" }, { l: "نوع", k: "kind", o: FS.services[1].o }])}</div>`,
  items: () => addB("purchase", "ثبت خرید مصرفی جدید", "قیمت فروش = قیمت خرید + ۳۰٪ گرد به بالا (مضرب " + fmt(5e3) + " " + UN() + ")؛ در خرید می‌توانید تاریخ انقضا و مدت هشدار هم ثبت کنید.") + `<div class="card">${grid("items", [{ l: "کالا", k: "name" }, { l: "موجودی انبار", k: "stock", t: "n" }, { l: "در کیف‌ها", f: (r) => fn(sum(db.kits, (k) => (k.items.find((x) => x.id == r.id) || { q: 0 }).q)) }, { l: "قیمت خرید", k: "buy", t: "n" }, { l: "قیمت فروش", k: "sell", t: "n" }, { l: "تاریخ انقضا", f: expTxt }], null, (r) => r.kind != "gear")}</div>`,
  gear: () => `<div class="card adc"><button class="p" onclick="opG()">+ خرید تجهیزات</button> <button onclick="opGN()">+ تجهیز جدید (بدون خرید)</button> <button onclick="opRep('gear','')">🔧 ثبت تعمیر</button> <span class="m">دارایی‌های شرکت که قابل امانت نیستند و تعدادی نگهداری می‌شوند (مثل گلوکومتر و دستگاه فشارخون). مثل کالا موجودی دارند، به کیف‌ها منتقل می‌شوند، تعمیر دارند و خریدشان در هزینه‌ها و «لیست خرید» ثبت می‌شود.</span></div><div class="card">${grid("items", [{ l: "تجهیز", k: "name" }, { l: "موجودی انبار", k: "stock", t: "n" }, { l: "در کیف‌ها", f: (r) => fn(sum(db.kits, (k) => (k.items.find((x) => x.id == r.id) || { q: 0 }).q)) }, { l: "در تعمیر", f: (r) => inRepQ(r.id) ? `<b class="warn">${inRepQ(r.id)}</b>` : "—" }, { l: "هزینه‌ی تعمیرات", f: (r) => fmt(repCost("gear", r.id)) }, { l: "آخرین قیمت خرید", k: "buy", t: "n" }, { l: "تاریخ انقضا", f: expTxt }, { l: "", f: (r) => `<button onclick="opRep('gear','${r.id}')">🔧 تعمیر</button>` }], null, (r) => r.kind == "gear")}</div>`,
  equip: () => `<div class="card adc"><button class="p" onclick="op('buyE')">+ خرید تجهیز کرایه‌ای</button> <button onclick="op('equip')">+ ثبت تجهیز موجود (بدون خرید)</button> <button onclick="opRep('equip','')">🔧 ثبت تعمیر</button> <span class="m">تخت، ساکشن و ...؛ تجهیزاتی که به مشتری امانت/کرایه داده می‌شود و تعمیر هم دارد. تجهیزی که در تعمیر است امانت داده نمی‌شود.</span></div><div class="card"><h3>تجهیزات</h3>${grid("equip", [{ l: "نام", k: "name" }, { l: "وضعیت", f: eqStB }, { l: "تاریخ خرید (شمسی)", k: "date" }, { l: "قیمت اصل", k: "base", t: "n" }, { l: "اجاره روزانه", k: "day", t: "n" }, { l: "ودیعه", k: "dep", t: "n" }, { l: "هزینه‌ی تعمیرات", f: (r) => fmt(repCost("equip", r.id)) }, { l: "", f: (r) => `<button onclick="opRep('equip','${r.id}')">🔧 تعمیر</button>` }])}</div>` + addB("loans", "امانت جدید") + `<div class="card"><h3>امانت‌ها</h3>${grid("loans", [{ l: "تجهیز", k: "equip", o: EO }, { l: "مشتری", k: "client", o: CO }, { l: "تحویل (شمسی)", k: "start" }, { l: "میلادی", f: (r) => gs(r.start) || "—" }, { l: "بازگشت (شمسی)", k: "end" }, { l: "میلادی", f: (r) => gs(r.end) || "—" }, { l: "روز", f: (r) => ld(r).days }, { l: "اجاره", f: (r) => fmt(ld(r).rent) }, { l: "ودیعه", k: "dep", t: "n" }])}<p class="m">تعداد روز = فاصله‌ی دو تاریخ (حداقل ۱ روز).</p></div>`,
  exp: () => addB("exp", "هزینه جدید", "برای دفاع مالیاتی: شرح و شماره‌ی فاکتور را حتماً پر کنید. هزینه‌ها در سه فهرست جدا نمایش داده می‌شوند.") + [["eq", "هزینه‌های تجهیزات (خرید و تعمیر)"], ["ad", "تبلیغات و اشتراک‌ها"], ["ot", "سایر هزینه‌ها"]].map((g) => `<div class="card"><h3>${g[1]}</h3><div class="m" style="margin-bottom:6px">جمع: <b>${fmt(sum(db.exp.filter((e) => expGrp(e.cat) == g[0]), (e) => e.amt))}</b> ${UN()}</div>${grid("exp", [{ l: "تاریخ", k: "date" }, { l: "دسته", k: "cat" }, { l: "شرح", k: "desc" }, { l: "مبلغ", k: "amt", t: "n" }, { l: "شماره فاکتور/رسید", k: "doc" }, { l: "حساب", k: "acct", o: ACO }], null, (r) => expGrp(r.cat) == g[0])}</div>`).join(""),
  chq: () => {
    const w = (t) => sum(db.chq.filter((c) => c.type == t && c.st == "wait"), (c) => c.amt);
    return addB("chq", "چک جدید") + `<div class="k" style="margin-bottom:12px"><div>دریافتی در جریان<b>${fmt(w("recv"))}</b></div><div>پرداختی در جریان<b>${fmt(w("pay"))}</b></div></div><div class="card">${grid("chq", [{ l: "نوع", k: "type", o: FS.chq[0].o }, { l: "شماره چک", k: "num" }, { l: "بانک", k: "bank" }, { l: "طرف حساب", k: "party" }, { l: "مبلغ", k: "amt", t: "n" }, { l: "تاریخ وصول", k: "due" }, { l: "وضعیت", k: "st", o: FS.chq[6].o }])}</div>`;
  },
  sets: () => {
    const c = (k) => db.sets.filter((r) => setSt(r)[1] == k).length;
    return addB("sets", "ست استریل جدید", "هر ست را با تاریخ استریل و انقضا ثبت کنید؛ وضعیت (آماده، نزدیک انقضا، منقضی) خودکار محاسبه می‌شود.") + `<div class="k" style="margin-bottom:12px"><div>آماده<b class="ok">${c("ok")}</b></div><div>نزدیک انقضا (تا ۷ روز)<b class="warn">${c("warn")}</b></div><div>منقضی / نیازمند استریل<b class="bad">${c("bad")}</b></div><div>استفاده‌شده<b>${c("m")}</b></div></div><div class="card">${grid("sets", [{ l: "نام ست", k: "name" }, { l: "کد", k: "code" }, { l: "تاریخ استریل", k: "sdate" }, { l: "انقضا", k: "exp" }, { l: "وضعیت", f: (r) => {
      const x = setSt(r);
      return `<b class="${x[1]}">${x[0]}</b>`;
    } }, { l: "در اختیار", k: "holder", o: SO }, { l: "توضیح", k: "note" }])}</div>`;
  },
  accts: () => {
    const t0 = (ty) => sum(db.accts.filter((a) => a.type == ty), bal);
    return addB("accts", "حساب / تنخواه جدید", "حساب‌های اصلی شرکت و تنخواه‌ها را جدا تعریف کنید. موجودی فعلی = موجودی اولیه + واریزها − برداشت‌ها − هزینه‌هایی که از این حساب پرداخت شده‌اند.") + `<div class="k" style="margin-bottom:12px"><div>مجموع حساب‌های اصلی<b>${fmt(t0("main"))}</b></div><div>مجموع تنخواه‌ها<b>${fmt(t0("petty"))}</b></div><div>صندوق کارانه‌ی مسئولین فنی<b>${fmt(t0("tech"))}</b></div><div>سایر<b>${fmt(t0("other"))}</b></div></div><div class="card">${grid("accts", [{ l: "نام", k: "name" }, { l: "نوع", k: "type", o: FS.accts[1].o }, { l: "مسئول / دارنده", k: "holder" }, { l: "موجودی اولیه", k: "open", t: "n" }, { l: "موجودی فعلی", f: (r) => `<b class="${bal(r) < 0 ? "bad" : ""}">${fmt(bal(r))}</b>` }, { l: "توضیح", k: "note" }])}</div>` + addB("tx", "انتقال / واریز / برداشت جدید", "برای شارژ تنخواه از حساب اصلی، هر دو حساب را انتخاب کنید.") + `<div class="card"><h3>تراکنش‌ها</h3>${grid("tx", [{ l: "تاریخ", k: "date" }, { l: "از حساب", f: (r) => r.from ? nm("accts", r.from) : "خارج از شرکت" }, { l: "به حساب", f: (r) => r.to ? nm("accts", r.to) : "خارج از شرکت" }, { l: "مبلغ", k: "amt", t: "n" }, { l: "کارمزد", k: "fee", t: "n" }, { l: "شرح", k: "desc" }])}</div>`;
  },
  budgets: () => {
    const y = BM[0], m = BM[1], yr = BV == "y", [a, b] = yr ? [dn(y + "/01/01"), dn(y + "/12/" + pad(jmd(y, 12)))] : mR(y, m), cs = [...new Set(db.budgets.map((x) => x.cat))], rows = cs.map((c) => {
      const r = bRec(c, y);
      return { c, r, cap: yr ? bYear(r) : bCap(r, m), sp: spC(c, a, b) };
    }), tot = sum(rows, (x) => x.cap), tsp = sum(rows, (x) => x.sp), all = sum(db.exp.filter((e) => dn(e.date) >= a && dn(e.date) <= b), (e) => e.amt), ys = [];
    for (let i = y - 3; i <= y + 4; i++) ys.push(i);
    const bar = (p) => `<div style="min-width:110px;background:var(--bg);border-radius:6px;overflow:hidden"><div style="width:${Math.max(Math.min(p, 100), 14)}%;background:${p > 100 ? "var(--r)" : p > 80 ? "#d98a00" : "var(--p)"};color:#fff;padding:1px 6px;white-space:nowrap">${p}٪</div></div>`, tg2 = (r) => r ? r.year ? `<span class="m">${r.year}</span>` : '<span class="m">ثابت</span>' : "", ed = (x) => x.r ? `<button onclick="bed('${x.r.id}')">✎</button> <button class="x" onclick="bdel('${x.r.id}')">✕</button>` : "";
    let tb;
    if (!yr) tb = `<table><tr><th>دسته</th><th>سقف ${MN[m - 1]} (قابل ویرایش)</th><th>هزینه‌ی این ماه</th><th>باقی‌مانده</th><th>درصد مصرف</th><th>نوع</th><th></th></tr>${rows.map((x) => {
      const p = x.cap ? Math.round(x.sp / x.cap * 100) : 0, o = x.r && x.r.ov && x.r.ov[m] != null && x.r.ov[m] !== "";
      return `<tr><td>${esc(x.c)}</td><td><input type="number" step="any" style="width:140px;direction:ltr" value="${dv(x.cap)}" onchange="bsetm('${x.c}',${y},${m},this.value)">${o ? ' <span title="این ماه تغییر داده شده">★</span>' : ""}</td><td>${fmt(x.sp)}</td><td><span class="${x.cap - x.sp < 0 ? "bad" : ""}">${fmt(x.cap - x.sp)}</span></td><td>${bar(p)}</td><td>${x.r && x.r.type == "annual" ? "سالیانه" : "ماهانه"} ${tg2(x.r)}</td><td>${ed(x)}</td></tr>`;
    }).join("") || '<tr><td class="m">بودجه‌ای ثبت نشده است.</td></tr>'}</table>`;
    else tb = `<div style="overflow-x:auto"><table><tr><th>دسته</th><th>بودجه‌ی سالیانه</th>${MN.map((n) => `<th>${n}</th>`).join("")}<th>جمع تخصیص</th><th>هزینه‌ی سال</th><th>باقی‌مانده</th><th>درصد</th><th></th></tr>${rows.map((x) => {
      const r = x.r, an = r && r.type == "annual" ? +r.amt : x.cap, p = an ? Math.round(x.sp / an * 100) : 0;
      return `<tr><td>${esc(x.c)} ${tg2(r)}</td><td>${fmt(an)}</td>${MN.map((n, i) => {
        const o = r && r.ov && r.ov[i + 1] != null && r.ov[i + 1] !== "";
        return `<td><input type="number" step="any" style="width:120px;direction:ltr${o ? ";border-color:var(--p)" : ""}" value="${dv(bCap(r, i + 1))}" onchange="bsetm('${x.c}',${y},${i + 1},this.value)"></td>`;
      }).join("")}<td><span class="${r && r.type == "annual" && Math.abs(x.cap - an) > 1 ? "warn" : ""}">${fmt(x.cap)}</span></td><td>${fmt(x.sp)}</td><td><span class="${an - x.sp < 0 ? "bad" : ""}">${fmt(an - x.sp)}</span></td><td>${bar(p)}</td><td>${ed(x)}</td></tr>`;
    }).join("") || '<tr><td class="m">بودجه‌ای ثبت نشده است.</td></tr>'}</table></div><p class="m">عدد هر ماه را عوض کنید تا فقط برای همان ماه (و فقط برای سال ${y}) تغییر کند؛ خانه‌های تغییرکرده کادر رنگی دارند. اگر عدد یک ماه را پاک کنید، به مقدار پیش‌فرض برمی‌گردد.</p>`;
    return `<div class="card adc"><button class="p" onclick="bed()">+ بودجه‌ی جدید</button> <span class="m">هر دسته می‌تواند «ثابت ماهانه» یا «سالیانه» باشد؛ برای هر سال جدا (مثلاً بودجه‌ی سال بعد) یا برای همه‌ی سال‌ها تعریف کنید.</span></div>
<div class="card np"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><button onclick="bsp(${y - 1},${m})">‹</button><select onchange="bsp(+this.value,${m})">${sel(ys.map((v) => [v, v]), y)}</select><button onclick="bsp(${y + 1},${m})">›</button><span class="sgp" style="flex:none">${[["m", "ماهانه"], ["y", "سالیانه"]].map((x) => `<button class="${x[0] == BV ? "on" : ""}" onclick="bv('${x[0]}')">${x[1]}</button>`).join("")}</span><button onclick="bnow()">امروز</button><button onclick="bcp(${y},${y + 1})">📋 کپی سال ${y} به ${y + 1}</button><button onclick="bcp(${y - 1},${y})">📋 کپی از سال ${y - 1}</button></div>${yr ? "" : `<div class="sgp" style="margin-top:10px">${MN.map((n, i) => `<button class="${i + 1 == m ? "on" : ""}" onclick="bsp(${y},${i + 1})">${n}</button>`).join("")}</div>`}</div>
<div class="k" style="margin-bottom:12px"><div>جمع بودجه‌ها (${yr ? "سال " + y : MN[m - 1] + " " + y})<b>${fmt(tot)}</b></div><div>هزینه‌ی دسته‌های بودجه‌دار<b>${fmt(tsp)}</b></div><div>باقی‌مانده<b class="${tot - tsp < 0 ? "bad" : ""}">${fmt(tot - tsp)}</b></div><div>هزینه‌ی دسته‌های بدون بودجه<b>${fmt(all - tsp)}</b></div></div><div class="card">${tb}</div>`;
  },
  kits: () => addB("kits", "کیف جدید", "هر کیف را تعریف کنید و با کلیک روی نامش پنجره‌ی کیف را باز کنید تا تحویل به پرستار و محتویات را مدیریت کنید.") + `<div class="card">${grid("kits", [{ l: "نام کیف (برای باز کردن کلیک کنید)", f: (r) => `<button class="lk" onclick="kv('${r.id}')">${esc(r.name)}</button>` }, { l: "در اختیار", f: (r) => nm("staff", kHold(r)) }, { l: "از تاریخ", f: (r) => kHold(r) ? (kEnt(r) || {}).date : "—" }, { l: "تجهیزات ثابت", f: (r) => (r.equip || []).length }, { l: "اقلام مصرفی", f: (r) => (r.items || []).length }, { l: "توضیح", k: "note" }])}</div>`,
  rep: () => {
    const p = RP();
    return `<div class="card np"><b>فیلتر:</b> از <input value="${R.from}" placeholder="1405/01/01" style="width:105px" onchange="R.from=nj(this.value);render()"><button onclick="cpO('r','from')">📅</button> تا <input value="${R.to}" placeholder="1405/12/29" style="width:105px" onchange="R.to=nj(this.value);render()"><button onclick="cpO('r','to')">📅</button> پرستار ${cmb("rs", [["", "همه"], ...SO()], R.staff, (v) => {
      R.staff = v;
      render();
    })} مشتری ${cmb("rc", [["", "همه"], ...CO()], R.client, (v) => {
      R.client = v;
      render();
    })} <button class="p" onclick="xp()">⬇ خروجی اکسل</button> <button onclick="print()">🖨 چاپ</button></div>
<div class="card"><h3>گزارش مأموریت‌ها (${p.f.length})</h3><table><tr><th>تاریخ</th><th>شماره فاکتور</th><th>مشتری</th><th>پرستار</th><th>خدمات</th><th>تعرفه</th><th>ایاب‌وذهاب</th><th>مصرفی</th><th>جمع</th><th>سهم پرستار</th><th>سهم شرکت</th></tr>${p.f.map((m) => {
      const c = mc(m);
      return `<tr><td>${m.date}${m.time ? " " + m.time : ""}</td><td>${m.invoice || "—"}</td><td>${nm("clients", m.client)}</td><td>${nm("staff", m.staff)}</td><td>${svs(m)}</td><td>${fmt(mt(m))}</td><td>${fmt(mv(m))}</td><td>${fmt(c.cons)}</td><td>${fmt(c.tot)}</td><td>${fmt(c.sh)}</td><td>${fmt(c.co)}</td></tr>`;
    }).join("")}<tr><th>جمع</th><th></th><th></th><th></th><th></th><th>${fmt(sum(p.f, (m) => mt(m)))}</th><th>${fmt(sum(p.f, (m) => mv(m)))}</th><th>${fmt(sum(p.f, (m) => mc(m).cons))}</th><th>${fmt(sum(p.f, (m) => mc(m).tot))}</th><th>${fmt(sum(p.f, (m) => mc(m).sh))}</th><th>${fmt(sum(p.f, (m) => mc(m).co))}</th></tr></table></div>
<div class="card"><h3>به تفکیک پرستار (بازه‌ی تاریخ)</h3>${gt(grr(p.ms, "staff", "staff"))}</div><div class="card"><h3>به تفکیک مشتری (بازه‌ی تاریخ)</h3>${gt(grr(p.ms, "client", "clients"))}</div>
<div class="card"><h3>تسویه پرستاران (بازه‌ی تاریخ)</h3><table><tr><th>پرستار</th><th>مأموریت‌ها</th><th>سهم در بازه</th><th>پرداخت در بازه</th><th>مانده‌ی کل پرداخت‌نشده</th></tr>${db.staff.map((t) => {
      const a = p.ms.filter((m) => m.staff == t.id);
      return `<tr><td><button class="lk" onclick="vp('${t.id}')">${esc(t.name)}</button></td><td>${a.length}</td><td>${fmt(sum(a, (m) => mc(m).sh) + sum(db.bons.filter((y) => y.staff == t.id && inR(y.date)), (y) => y.amt))}</td><td>${fmt(sum(db.pays.filter((y) => y.staff == t.id && inR(y.date)), (y) => y.amt))}</td><td><b class="${pEarn(t.id) - pPaid(t.id) > 0 ? "warn" : ""}">${fmt(pEarn(t.id) - pPaid(t.id))}</b></td></tr>`;
    }).join("")}</table></div>${rcRep(p)}<div class="card"><h3>سود و زیان (کل بازه‌ی تاریخ)</h3><div class="k"><div>درآمد خدمات (تعرفه+ایاب‌وذهاب)<b>${fmt(p.inc.t + p.inc.v)}</b></div><div>تخفیف‌ها<b>${fmt(p.dsc)}</b></div><div>مالیات ۲۰٪ پاداش‌ها (بدهی مالیاتی، جزو سود نیست)<b>${fmt(p.btx)}</b></div><div>فروش مصرفی<b>${fmt(p.inc.c)}</b></div><div>اجاره‌ی تجهیزات (بازگشته)<b>${fmt(p.rent)}</b></div><div>سهم پرستاران<b>${fmt(p.sh)}</b></div><div>هزینه‌ها<b>${fmt(p.exT)}</b></div><div>سود خالص<b class="${p.net < 0 ? "bad" : ""}">${fmt(p.net)}</b></div></div><table style="margin-top:10px"><tr><th>هزینه به تفکیک دسته</th><th>مبلغ</th></tr>${Object.keys(p.bc).map((k) => `<tr><td>${k}</td><td>${fmt(p.bc[k])}</td></tr>`).join("")}</table><p class="m">سود خالص = درآمد خدمات + فروش مصرفی + اجاره − تخفیف‌ها − سهم پرستاران − هزینه‌ها. ودیعه درآمد حساب نمی‌شود.</p></div>`;
  }
};
const T = [["dash", "داشبورد"], ["gM", "مأموریت‌ها", [["missions", "ثبت مأموریت جدید"], ["rsv", "مأموریت‌های رزرو"]]], ["services", "خدمات"], ["g1", "اشخاص", [["staff", "پرسنل"], ["clients", "بیماران و مشتریان"]]], ["g2", "انبار", [["items", "وسایل مصرفی"], ["gear", "تجهیزات دارایی شرکت (غیرکرایه‌ای)"], ["equip", "تجهیزات کرایه‌ای (امانت)"], ["buys", "لیست خرید"], ["repairs", "تعمیرات تجهیزات"]]], ["g3", "مالی", [["exp", "هزینه‌ها"], ["recv", "طلب از مشتریان"], ["chq", "چک‌ها"], ["accts", "حساب‌ها و تنخواه"], ["budgets", "بودجه‌بندی"], ["pay", "تسویه سهم پرستاران"], ["tech", "مسئولین فنی و کارانه"]]], ["g4", "مانیتورینگ", [["kits", "کیف‌های تجهیزات"], ["sets", "ست‌های استریل"]]], ["rep", "گزارش‌ها"], ["periods", "بستن دوره و آرشیو"], ["users", "کاربران و دسترسی‌ها"]];
let tab = "dash", OG = {};
const pgT = () => {
  for (const t of T) {
    if (t[0] == tab) return t[1];
    if (t[2]) {
      const c = t[2].find((x) => x[0] == tab);
      if (c) return t[1] + " / " + c[1];
    }
  }
  return "";
};
const gOn = (t) => OG[t[0]] === void 0 ? t[2].some((c) => c[0] == tab) : OG[t[0]], tgg = (g) => {
  OG[g] = !gOn(T.find((t) => t[0] == g));
  render();
}, navT = () => navTree().map((t) => t[2] ? `<button class="${t[2].some((c) => c[0] == tab) ? "on" : ""}" onclick="tgg('${t[0]}')">${gOn(t) ? "▾" : "◂"} ${t[1]}</button>` + (gOn(t) ? t[2].map((c) => `<button class="${c[0] == tab ? "on" : ""}" style="margin-right:18px" onclick="go('${c[0]}')">${c[1]}</button>`).join("") : "") : `<button class="${t[0] == tab ? "on" : ""}" onclick="go('${t[0]}')">${t[1]}</button>`).join("");
const tg = (x) => {
  const o = x === void 0 ? !$("#nav").classList.contains("o") : x;
  $("#nav").classList.toggle("o", !!o);
  $("#ov").classList.toggle("o", !!o);
}, go = (k) => {
  if (k != "users" && lvl(k) < 1) return deny();
  T.forEach((t) => {
    if (t[2] && t[2].some((c) => c[0] == k)) delete OG[t[0]];
  });
  tab = k;
  tg(0);
  render();
  scrollTo(0, 0);
};
document.addEventListener("keydown", (e) => {
  if (e.key == "Escape") {
    if (CP) {
      CP = null;
      drawC();
    } else if (KV) xk();
    else if (M) xm();
    else if (SG) xs();
    else tg(0);
  }
});
function bk() {
  if (!(isAdmin())) return deny();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(db)], { type: "application/json" }));
  a.download = (AR ? "archive-" : "backup-") + todayJ().replace(/\//g, "-") + "_" + pad((/* @__PURE__ */ new Date()).getHours()) + "-" + pad((/* @__PURE__ */ new Date()).getMinutes()) + ".json";
  a.click();
  try {
    localStorage.setItem(K + "bk", Date.now());
  } catch (e) {
  }
  render();
}
function rs(f) {
  if (!(isAdmin())) return deny();
  if (AR) return alert("در محیط آرشیو بازیابی بکاپ غیرفعال است.");
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!confirm("اطلاعات فعلی با بکاپ جایگزین شود؟")) return;
      db = Object.assign(D0(), d);
      save();
      render();
    } catch (e) {
      alert("فایل معتبر نیست");
    }
  };
  r.readAsText(f.files[0]);
}
function render() {
  CAC = {};
  if (authGate()) return;
  syncL();
  ap();
  document.body.classList.toggle("arm", !!AR);
  $("#nav").innerHTML = navT() + `<div class="nvf"><button onclick="tg(0);os()" style="width:100%">⚙ تنظیمات</button><div class="m" style="margin-top:8px;text-align:center">نسخه‌ی ${VER}</div></div>`;
  let b = 0;
  try {
    b = +localStorage.getItem(K + "bk") || 0;
  } catch (e) {
  }
  const d = b ? Math.floor((Date.now() - b) / 864e5) : -1;
  $("#bs").innerHTML = d < 0 ? '<span class="bad">هنوز بکاپ نگرفته‌اید</span>' : d > 7 ? `<span class="bad">آخرین بکاپ ${d} روز پیش</span>` : "بکاپ: " + (d ? d + " روز پیش" : "امروز");
  const y = window.scrollY;
  $("#app").innerHTML = arBanner() + `<div class="ptr"><h2 class="pt">${pgT()}</h2><span class="ptb"><button onclick="prPage()">🖨 چاپ / PDF</button><button onclick="xpg()">⬇ اکسل</button></span></div>` + V[tab]();
  scrollTo(0, y);
  $("#app").classList.toggle("ro", lvl(tab) == 1);
  whoUp();
  drawM();
  drawK();
  drawS();
  fq();
}
