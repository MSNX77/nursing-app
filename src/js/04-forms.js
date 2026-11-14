// ======== forms ========
const ACO = () => db.accts.map((a) => [a.id, a.name]);
const RFO = () => M && M.d && M.d.cls == "equip" ? db.equip.map((e) => [e.id, e.name]) : db.items.filter((i) => i.kind == "gear").map((i) => [i.id, i.name]);
const TSO = () => techStaff().map((s) => [s.id, s.name]);
const PMO = () => [["cash", "نقد"], ["card", "کارتخوان / کارت‌به‌کارت"], ["bank", "واریز / حواله / پایا"], ["chq", "چک"], ["other", "سایر"]];
const MIO = () => {
  const cid = M && M.d && M.d.client;
  if (!cid) return [];
  const cur = M.d.mission;
  return cA(cid).rows.filter((x) => x.c.k == "m" && (x.rem > 0.5 || x.c.id == cur)).map((x) => [x.c.id, (x.c.m.invoice ? "فاکتور " + x.c.m.invoice : "بدون شماره") + " — " + x.c.date + " — مانده " + fmt(x.rem) + " " + UN()]);
};

let M = null;
const TT = { sets: "ست استریل", accts: "حساب / تنخواه", tx: "تراکنش / انتقال", budgets: "بودجه", kits: "کیف", staff: "پرسنل", clients: "بیمار / مشتری", missions: "مأموریت", rsv: "مأموریت رزرو", services: "خدمت", items: "کالا", equip: "تجهیز", loans: "امانت تجهیز", exp: "هزینه", chq: "چک", purchase: "خرید کالا", rcpts: "دریافت از مشتری", repairs: "تعمیر تجهیز", buyE: "خرید تجهیز کرایه‌ای", plan: "مورد برنامه‌ی خرید", tscore: "امتیاز مسئول فنی" }, HT = { repairs: "هزینه‌ی تعمیر (اگر وارد شود) خودکار در هزینه‌ها با دسته‌ی «تعمیرات تجهیزات» ثبت می‌شود. تجهیز کرایه‌ای که در تعمیر است امانت داده نمی‌شود.", buyE: "برای هر دستگاه یک ردیف در تجهیزات کرایه‌ای ساخته می‌شود و خرید در هزینه‌ها (خرید تجهیزات) و لیست خرید ثبت می‌شود.", tscore: "امتیاز فعلاً دستی ثبت می‌شود. سهم هر نفر از کارانه نسبت به مجموع امتیازهای مثبت او در بازه است.", rcpts: "اگر دریافت برای یک فاکتور مشخص است آن را انتخاب کنید؛ در غیر این صورت مبلغ خودکار از قدیمی‌ترین طلب مشتری کم می‌شود. اگر «واریز به حساب» را انتخاب کنید، یک واریز هم در همان حساب ثبت می‌شود. دریافت، درآمد حساب نمی‌شود (درآمد از روی مأموریت‌ها محاسبه می‌شود) و فقط مانده‌ی طلب و موجودی حساب را تغییر می‌دهد. اگر با چک گرفته‌اید، چک را هم در بخش چک‌ها ثبت کنید.", rsv: "برای مأموریت‌های آینده. تاریخ، ساعت و پرسنل اختیاری‌اند و بعداً هم می‌شود تعیینشان کرد. وقتی آماده شد، در لیست دکمه‌ی «ثبت مأموریت» را بزنید.", tx: "اگر «از حساب» خالی باشد یعنی واریز از خارج شرکت (مثلاً درآمد)، و اگر «به حساب» خالی باشد یعنی برداشت یا پرداخت از شرکت. کارمزد (اختیاری) از حساب مبدأ کم می‌شود ولی به مقصد نمی‌رسد و خودکار در «هزینه‌ها» (دسته‌ی کارمزد بانکی) ثبت می‌شود.", sets: "اگر تاریخ انقضا را خالی بگذارید و مدت اعتبار (روز) را بنویسید، انقضا از روی تاریخ استریل محاسبه می‌شود.", budgets: "سقف ماهانه برای یک دسته‌ی هزینه؛ مصرف از بخش «هزینه‌ها» محاسبه می‌شود.", get purchase() {
  return "قیمت فروش = قیمت خرید جدید + ۳۰٪، گرد به بالا به مضرب " + fmt(5e3) + " " + UN() + ". موجودی زیاد می‌شود و خرید در هزینه‌ها هم ثبت می‌شود. بعداً می‌توانید قیمت فروش را از ✎ کالا دستی تغییر دهید.";
}, loans: "ودیعه با انتخاب تجهیز پر می‌شود و قابل تغییر است. تاریخ بازگشت را خالی بگذارید تا تجهیز «نزد مشتری» بماند.", missions: "تخفیف از مبلغ کل کم می‌شود و از سهم شرکت می‌رود. پاداش را مشتری مستقیم به پرستار می‌دهد: به مبلغ کل مشتری اضافه می‌شود، ۲۰٪ مالیات از آن کسر می‌شود و بقیه جزو دریافتی پرستار است (درآمد شرکت نیست)." }, FS = {
  repairs: [{ k: "date", l: "تاریخ ارسال به تعمیر (شمسی)", t: "d" }, { k: "cls", l: "نوع تجهیز", o: () => [["gear", "تجهیز دارایی شرکت (غیرکرایه‌ای)"], ["equip", "تجهیز کرایه‌ای (امانت)"]] }, { k: "ref", l: "تجهیز", o: RFO }, { k: "q", l: "تعداد (فقط برای تجهیز تعدادی)", t: "n" }, { k: "vendor", l: "تعمیرکار / مرکز تعمیر" }, { k: "desc", l: "عیب / شرح" }, { k: "st", l: "وضعیت", o: () => [["open", "در تعمیر"], ["done", "تعمیر شد"], ["scrap", "غیرقابل تعمیر"]] }, { k: "done", l: "تاریخ بازگشت (شمسی)", t: "d" }, { k: "cost", l: "هزینه‌ی تعمیر (تومان) — در هزینه‌ها ثبت می‌شود", t: "n" }, { k: "acct", l: "پرداخت از حساب / تنخواه (اختیاری)", o: ACO }],
  buyE: [{ k: "name", l: "نام تجهیز" }, { k: "date", l: "تاریخ خرید (شمسی)", t: "d" }, { k: "q", l: "تعداد (هر دستگاه یک ردیف جدا ثبت می‌شود)", t: "n" }, { k: "p", l: "قیمت خرید هر دستگاه (تومان)", t: "n" }, { k: "day", l: "اجاره‌ی روزانه", t: "n" }, { k: "dep", l: "ودیعه", t: "n" }, { k: "doc", l: "شماره فاکتور / رسید" }, { k: "acct", l: "پرداخت از حساب / تنخواه (اختیاری)", o: ACO }],
  plan: [{ k: "name", l: "مورد نیاز برای خرید" }, { k: "kind", l: "نوع", o: () => [["cons", "مصرفی"], ["gear", "تجهیز دارایی شرکت"], ["equip", "تجهیز کرایه‌ای"]] }, { k: "q", l: "تعداد", t: "n" }, { k: "est", l: "برآورد قیمت هر واحد (تومان)", t: "n" }, { k: "note", l: "توضیح / اولویت" }],
  tscore: [{ k: "date", l: "تاریخ (شمسی)", t: "d" }, { k: "staff", l: "مسئول فنی", o: TSO }, { k: "pts", l: "امتیاز (می‌تواند منفی باشد)", t: "n" }, { k: "reason", l: "دلیل / معیار" }],
  rcpts: [{ k: "date", l: "تاریخ دریافت (شمسی)", t: "d" }, { k: "client", l: "مشتری", o: CO }, { k: "mission", l: "بابت فاکتور / مأموریت (اختیاری — خالی = تسویه‌ی کلی حساب)", o: MIO }, { k: "amt", l: "مبلغ دریافتی (تومان)", t: "n" }, { k: "method", l: "روش پرداخت", o: PMO }, { k: "ref", l: "شماره پیگیری / شماره چک" }, { k: "acct", l: "واریز به حساب / تنخواه (اختیاری)", o: ACO }, { k: "no", l: "شماره رسید" }, { k: "note", l: "توضیح" }],
  rsv: [{ k: "client", l: "بیمار / مشتری", o: CO }, { k: "date", l: "تاریخ مورد نظر (اختیاری)", t: "d" }, { k: "time", l: "ساعت (اختیاری)", t: "t" }, { k: "staff", l: "پرستار (اختیاری — بعداً مشخص می‌شود)", o: SO }, { k: "note", l: "توضیح" }],
  sets: [{ k: "name", l: "نام ست" }, { k: "code", l: "کد / شماره ست" }, { k: "sdate", l: "تاریخ استریل (شمسی)", t: "d" }, { k: "days", l: "مدت اعتبار (روز)", t: "n" }, { k: "exp", l: "تاریخ انقضا (شمسی)", t: "d" }, { k: "st", l: "وضعیت", o: () => [["ready", "آماده / استریل"], ["used", "استفاده‌شده"], ["re", "نیازمند استریل مجدد"]] }, { k: "holder", l: "در اختیار (پرستار)", o: SO }, { k: "note", l: "توضیح" }],
  accts: [{ k: "name", l: "نام حساب / تنخواه" }, { k: "type", l: "نوع", o: () => [["main", "حساب اصلی شرکت"], ["petty", "تنخواه"], ["tech", "صندوق کارانه‌ی مسئولین فنی"], ["other", "سایر"]] }, { k: "holder", l: "مسئول / دارنده" }, { k: "open", l: "موجودی اولیه (تومان)", t: "n" }, { k: "note", l: "توضیح" }],
  tx: [{ k: "date", l: "تاریخ (شمسی)", t: "d" }, { k: "from", l: "از حساب", o: ACO }, { k: "to", l: "به حساب", o: ACO }, { k: "amt", l: "مبلغ (تومان)", t: "n" }, { k: "fee", l: "کارمزد (اختیاری)", t: "n" }, { k: "desc", l: "شرح" }],
  budgets: [{ k: "cat", l: "دسته‌ی هزینه", o: () => CATS.map((c) => [c, c]) }, { k: "amt", l: "سقف ماهانه (تومان)", t: "n" }, { k: "note", l: "توضیح" }],
  kits: [{ k: "name", l: "نام کیف" }, { k: "note", l: "توضیح" }],
  staff: [{ k: "name", l: "نام و نام خانوادگی" }, { k: "gender", l: "جنسیت", o: () => [["m", "مرد"], ["f", "زن"]] }, { k: "code", l: "کد پرسنلی" }, { k: "role", l: "سمت", o: () => ROLES().map((r) => [r.n, r.n]) }, { k: "phone", l: "تلفن" }, { k: "pct", l: "درصد از تعرفه (۵۵–۶۵)", t: "n" }, { k: "iban", l: "شماره شبا (IR + ۲۴ رقم)" }],
  clients: [{ k: "name", l: "نام و نام خانوادگی" }, { k: "gender", l: "جنسیت", o: () => [["m", "مرد"], ["f", "زن"]] }, { k: "birth", l: "تاریخ تولد (شمسی)", t: "d" }, { k: "nid", l: "کد ملی" }, { k: "phone", l: "تلفن" }, { k: "emerg", l: "تماس اضطراری (نام و شماره)" }, { k: "address", l: "آدرس" }, { k: "diag", l: "تشخیص / بیماری‌های زمینه‌ای" }, { k: "allergy", l: "حساسیت‌ها (دارویی / غذایی)" }, { k: "note", l: "یادداشت کلی" }, { k: "followup", l: "پیگیری بعدی (تاریخ شمسی)", t: "d" }],
  services: [{ k: "name", l: "نام خدمت" }, { k: "kind", l: "نوع", o: () => [["svc", "خدمت"], ["travel", "ایاب‌وذهاب"]] }, { k: "price", l: "تعرفه / مبلغ (تومان)", t: "n" }],
  missions: [{ k: "date", l: "تاریخ (شمسی)", t: "d" }, { k: "time", l: "ساعت", t: "t" }, { k: "invoice", l: "شماره فاکتور" }, { k: "client", l: "مشتری", o: CO }, { k: "staff", l: "پرستار", o: SO }, { k: "pct", l: "درصد این مأموریت (خالی = پیش‌فرض پرستار)", t: "n" }, { k: "disc", l: "تخفیف (تومان)", t: "n" }, { k: "bonus", l: "پاداش مشتری به پرستار (تومان، ۲۰٪ مالیات کسر می‌شود)", t: "n" }],
  items: [{ k: "name", l: "نام کالا" }, { k: "kind", l: "نوع", o: () => [["cons", "مصرفی"], ["gear", "تجهیز تعدادی (غیرکرایه‌ای)"]] }, { k: "stock", l: "موجودی", t: "n" }, { k: "buy", l: "قیمت خرید", t: "n" }, { k: "sell", l: "قیمت فروش (قابل ویرایش)", t: "n" }, { k: "exp", l: "تاریخ انقضا (شمسی)", t: "d" }, { k: "warn", l: "هشدار چند روز قبل از انقضا (خالی = پیش‌فرض تنظیمات)", t: "n" }],
  equip: [{ k: "name", l: "نام تجهیز" }, { k: "date", l: "تاریخ خرید (شمسی)", t: "d" }, { k: "base", l: "قیمت اصل (قابل بروزرسانی)", t: "n" }, { k: "day", l: "اجاره‌ی روزانه", t: "n" }, { k: "dep", l: "ودیعه", t: "n" }],
  loans: [{ k: "equip", l: "تجهیز", o: EO }, { k: "client", l: "مشتری", o: CO }, { k: "start", l: "تاریخ تحویل (شمسی)", t: "d" }, { k: "end", l: "تاریخ بازگشت (شمسی)", t: "d" }, { k: "dep", l: "ودیعه", t: "n" }],
  exp: [{ k: "date", l: "تاریخ (شمسی)", t: "d" }, { k: "cat", l: "دسته", o: () => CATS.map((c) => [c, c]) }, { k: "desc", l: "شرح" }, { k: "amt", l: "مبلغ (تومان)", t: "n" }, { k: "doc", l: "شماره فاکتور / رسید" }, { k: "acct", l: "پرداخت از حساب / تنخواه (اختیاری)", o: ACO }],
  chq: [{ k: "type", l: "نوع", o: () => [["recv", "دریافتی"], ["pay", "پرداختی"]] }, { k: "num", l: "شماره چک" }, { k: "bank", l: "بانک" }, { k: "party", l: "طرف حساب" }, { k: "amt", l: "مبلغ (تومان)", t: "n" }, { k: "due", l: "تاریخ وصول (شمسی)", t: "d" }, { k: "st", l: "وضعیت", o: () => [["wait", "در جریان"], ["ok", "وصول/پاس شده"], ["bad", "برگشتی"]] }],
  purchase: [{ k: "item", l: "کالای موجود", o: ITO }, { k: "name", l: "یا نام کالای جدید" }, { k: "kind", l: "نوع (برای کالای جدید)", o: () => [["cons", "مصرفی"], ["gear", "تجهیز تعدادی (غیرکرایه‌ای)"]] }, { k: "q", l: "تعداد", t: "n" }, { k: "p", l: "قیمت خرید هر واحد (تومان)", t: "n" }, { k: "date", l: "تاریخ خرید (شمسی)", t: "d" }, { k: "exp", l: "تاریخ انقضا (اختیاری)", t: "d" }, { k: "warn", l: "هشدار چند روز قبل از انقضا (اختیاری)", t: "n" }]
}, DEF = { repairs: () => ({ date: todayJ(), cls: "gear", ref: "", q: 1, vendor: "", desc: "", st: "open", done: "", cost: 0, acct: "" }), buyE: () => ({ name: "", date: todayJ(), q: 1, p: 0, day: 0, dep: 0, doc: "", acct: "" }), plan: () => ({ name: "", kind: "gear", q: 1, est: 0, note: "" }), tscore: () => ({ date: todayJ(), staff: "", pts: 0, reason: "" }), rcpts: () => ({ date: todayJ(), client: "", mission: "", amt: 0, method: "cash", ref: "", acct: "", no: String(nextNo("rcpts", "no", 1, "rcN")), note: "" }), rsv: () => ({ client: "", date: "", time: "", staff: "", note: "", lines: [] }), sets: () => ({ name: "", code: "", sdate: todayJ(), days: 0, exp: "", st: "ready", holder: "", note: "" }), accts: () => ({ name: "", type: "main", holder: "", open: 0, note: "" }), tx: () => ({ date: todayJ(), from: "", to: "", amt: 0, fee: 0, desc: "" }), budgets: () => ({ cat: "", amt: 0, note: "" }), kits: () => ({ name: "", note: "", hist: [], equip: [], items: [] }), staff: () => ({ name: "", gender: "", code: "", role: "پرستار", pct: 60, phone: "", iban: "" }), clients: () => ({ name: "", gender: "", birth: "", nid: "", phone: "", emerg: "", address: "", diag: "", allergy: "", note: "", followup: "" }), services: () => ({ name: "", kind: "svc", price: 0 }), missions: () => ({ date: todayJ(), time: "", invoice: "", client: "", staff: "", pct: "", lines: [], cons: [], disc: 0, bonus: 0 }), items: () => ({ name: "", stock: 0, buy: 0, sell: 0, kind: "cons", exp: "", warn: "" }), equip: () => ({ name: "", date: todayJ(), base: 0, day: 0, dep: 0 }), loans: () => ({ equip: "", client: "", start: todayJ(), end: "", dep: 0 }), exp: () => ({ date: todayJ(), cat: "سایر", desc: "", amt: 0, doc: "" }), chq: () => ({ type: "recv", num: "", bank: "", party: "", amt: 0, due: "", st: "wait" }), purchase: () => ({ item: "", name: "", q: 0, p: 0, date: todayJ(), kind: "cons", exp: "", warn: "" }) }, REQ = { repairs: ["date", "ref"], buyE: ["name", "date", "p"], plan: ["name"], tscore: ["date", "staff", "pts"], rcpts: ["date", "client", "amt"], rsv: ["client"], sets: ["name"], accts: ["name"], tx: ["date", "amt"], budgets: ["cat", "amt"], kits: ["name"], staff: ["name"], clients: ["name"], services: ["name"], items: ["name"], equip: ["name"], missions: ["date", "client", "staff"], loans: ["equip", "client", "start"], exp: ["date", "amt"], chq: ["num", "amt", "due"], purchase: ["q", "p"] };
function op(l, i = -1) {
  if (!canE(l)) return deny();
  SV = { s: "", m: "" };
  M = { l, i, d: i < 0 ? DEF[l]() : JSON.parse(JSON.stringify(db[l][i])) };
  if (l == "missions") {
    const d = M.d;
    d.cons = d.cons || [];
    if (!d.lines) {
      const n = d.service && sn(d.service) != "—" ? sn(d.service) : "خدمت (ثبت‌شده در نسخه‌ی قبل)";
      d.lines = +d.tariff || +d.travel ? [{ id: "", n, p: +d.tariff || 0, v: +d.travel || 0, q: 1 }] : [];
    }
  }
  drawM();
}
const xm = () => {
  M = null;
  drawM();
};
function fc(k, v) {
  M.d[k] = v;
  if (M.l == "repairs" && k == "cls") {
    M.d.ref = "";
    drawM();
  }
  if (M.l == "rcpts" && (k == "client" || k == "mission")) {
    if (k == "client") M.d.mission = "";
    if (M.i < 0) {
      const r = remOf(M.d.client, M.d.mission);
      M.d.amt = r > 0 ? Math.round(r) : 0;
    }
    drawM();
  }
  if (M.l == "missions" && k == "staff") drawM();
  if (M.l == "loans" && k == "equip") {
    const e = db.equip.find((x) => x.id == v);
    if (e) M.d.dep = e.dep;
    drawM();
  }
}
const ma = () => {
  const it = db.items.find((x) => x.id == SV.m), q = +$("#mq").value;
  if (!it || !q) return;
  M.d.cons.push({ id: it.id, n: it.name, q, p: it.sell, cost: it.buy });
  drawM();
}, mr = (j) => {
  M.d.cons.splice(j, 1);
  drawM();
};
const ce = () => {
  const ks = M.d.staff ? db.kits.filter((k) => kHold(k, M.d.date) == M.d.staff) : [], kq = (id) => sum(ks, (k) => (k.items.find((x) => x.id == id) || { q: 0 }).q);
  return `<div style="margin-top:10px"><b>مصرفی‌ها</b><div>${M.d.cons.map((x, j) => `<span class="ch">${x.n}×${x.q} (${fmt(x.p)}) <button class="x" onclick="mr(${j})">✕</button></span>`).join("") || '<span class="m">—</span>'}</div>${cmb("mi", db.items.filter((o) => o.kind != "gear").map((o) => [o.id, o.name + " (انبار " + o.stock + (kq(o.id) ? " / کیف " + kq(o.id) : "") + ")"]), SV.m, (v) => {
    SV.m = v;
  })} <input id="mq" type="number" value="1" style="width:60px"> <button onclick="ma()">+ افزودن</button><p class="m">${ks.length ? "مصرفی‌ها اول از موجودی کیف «" + ks.map((k) => k.name).join("، ") + "» کم می‌شوند و باقی‌مانده از انبار." : "این پرستار (در این تاریخ) کیفی ندارد؛ مصرفی‌ها از موجودی انبار کم می‌شوند."}</p></div>`;
};
const sl = () => {
  const L = M.d.lines;
  return `<div style="margin-top:10px"><b>خدمات این مأموریت</b><div>${L.map((x, j) => `<span class="ch">${x.n}${x.q > 1 ? "×" + x.q : ""} (${x.p || !x.v ? fmt(x.p * x.q) : ""}${x.v ? (x.p ? " + ایاب‌وذهاب " : "ایاب‌وذهاب ") + fmt(x.v * x.q) : ""}) <button class="x" onclick="lr(${j})">✕</button></span>`).join("") || '<span class="m">—</span>'}</div>${cmb("si", SVO(), SV.s, (v) => {
    SV.s = v;
  })} <input id="sq" type="number" value="1" min="1" style="width:60px"> <button onclick="la()">+ افزودن خدمت</button><p class="m">جمع تعرفه: ${fmt(sum(L, (x) => x.p * x.q))} — جمع ایاب‌وذهاب: ${fmt(sum(L, (x) => x.v * x.q))}</p></div>`;
};
const la = () => {
  const s = db.services.find((x) => x.id == SV.s), q = +$("#sq").value || 1;
  if (!s) return alert("خدمت را از لیست انتخاب کنید (اگر لیست خالی است، ابتدا در تب «خدمات» تعریف کنید)");
  const tv = s.kind == "travel";
  M.d.lines.push({ id: s.id, n: s.name, p: tv ? 0 : s.price || 0, v: tv ? s.price || 0 : 0, q });
  drawM();
}, lr = (j) => {
  M.d.lines.splice(j, 1);
  drawM();
};
const dfield = (f, d) => MONEY[M.l] && MONEY[M.l].includes(f.k) ? `<input type="number" step="any" value="${d[f.k] === "" || d[f.k] == null ? "" : dv(d[f.k])}" oninput="M.d['${f.k}']=uv(this.value);ut()">` : dfield0(f, d), dfield0 = (f, d) => f.o && [CO, SO, EO, ITO, ACO, MIO, RFO, TSO].includes(f.o) ? cmb("f_" + f.k, f.o(), d[f.k], (v) => fc(f.k, v)) : f.o ? `<select onchange="fc('${f.k}',this.value)"><option value="">—</option>${sel(f.o(), d[f.k])}</select>` : f.t == "d" ? `<span style="display:flex;gap:4px"><input placeholder="1405/01/01" value="${d[f.k] || ""}" oninput="M.d['${f.k}']=this.value;ut()"><button type="button" onclick="cpO('m','${f.k}')">📅</button></span>` : `<input ${f.t == "n" ? 'type="number" step="any"' : f.t == "t" ? 'type="time"' : ""} value="${String(d[f.k] ?? "").replace(/"/g, "&quot;")}" oninput="M.d['${f.k}']=this.value;ut()">`;
const vw = (id) => {
  M = { l: "staff", v: 1, i: db.staff.findIndex((x) => x.id == id) };
  drawM();
};
function cpy(t, b) {
  const ok = () => {
    b.textContent = "✓ کپی شد";
  }, fb = () => {
    const x = document.createElement("textarea");
    x.value = t;
    document.body.appendChild(x);
    x.select();
    try {
      document.execCommand("copy");
      ok();
    } catch (e) {
      alert("کپی نشد؛ متن را انتخاب و Ctrl+C بزنید");
    }
    x.remove();
  };
  try {
    navigator.clipboard.writeText(t).then(ok, fb);
  } catch (e) {
    fb();
  }
}
function drawV() {
  if (M.v == 2) return drawMD();
  if (M.v == 3) return drawMP();
  if (M.v == 4) return drawPF();
  if (M.v == 5) return drawBD();
  if (M.v == 6) return drawCS();
  if (M.v == 7) return drawUP();
  const r = db.staff[M.i] || {}, g = { m: "مرد", f: "زن" }[r.gender] || "—";
  return `<div class="mo"><div class="mb"><h3>اطلاعات پرسنل</h3><table>${[["نام", r.name], ["جنسیت", g], ["کد پرسنلی", r.code], ["نقش", r.role], ["تلفن", r.phone], ["درصد از تعرفه", r.pct ? r.pct + "٪" : ""]].map((x) => `<tr><td class="m">${x[0]}</td><td>${x[1] || "—"}</td></tr>`).join("")}<tr><td class="m">شماره شبا</td><td>${r.iban ? `<span dir="ltr" style="user-select:all;font-family:Consolas,monospace">${r.iban}</span> <button onclick="cpy(db.staff[${M.i}].iban,this)">کپی</button>` : "—"}</td></tr></table><div style="margin-top:14px"><button class="p" onclick="op('staff',${M.i})">✎ ویرایش</button> <button onclick="xm()">بستن</button></div></div></div>`;
}
function drawM() {
  if (!M) {
    $("#md").innerHTML = "";
    return;
  }
  if (M.v) {
    $("#md").innerHTML = drawV();
    return;
  }
  const d = M.d;
  $("#md").innerHTML = `<div class="mo"><div class="mb"><h3>${M.l == "purchase" ? "ثبت" : M.i < 0 ? "افزودن" : "ویرایش"} ${TT[M.l]}</h3><div class="fg">${FS[M.l].map((f) => `<label>${ul(f.l)}${dfield(f, d)}</label>`).join("")}</div>${M.l == "missions" ? sl() + ce() : M.l == "rsv" ? sl() : ""}${HT[M.l] ? `<p class="m">${HT[M.l]}</p>` : ""}${M.l == "missions" ? `<div class="stk"><div id="tt">${ttH()}</div><div style="margin-top:8px"><button class="p" onclick="sv()">ثبت</button> <button onclick="xm()">انصراف</button></div></div>` : `<div style="margin-top:14px"><button class="p" onclick="sv()">ثبت</button> <button onclick="xm()">انصراف</button></div>`}</div></div>`;
}
