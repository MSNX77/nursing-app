// ======== settings popup ========
let SG = false;
const os = () => {
  SG = true;
  drawS();
}, xs = () => {
  SG = false;
  drawS();
}, seg = (a, c, f) => `<div class="sgp">${a.map((x, i) => `<button class="${i == c ? "on" : ""}" onclick="${f}(${i})">${x[0]}</button>`).join("")}</div>`;
let STAB = "theme";
const stb = (t) => {
  STAB = t;
  drawS();
}, ui = () => Math.max(0, UNITS.findIndex((u) => u[0] == (db.cfg || {}).unit)), su = (i) => {
  if (!(isAdmin())) return deny();
  db.cfg = db.cfg || {};
  db.cfg.unit = UNITS[i][0];
  save();
  render();
};
function drawS() {
  const e = $("#sg"), old = e.querySelector(".mb"), sc = old ? old.scrollTop : 0;
  if (!SG) {
    e.innerHTML = "";
    return;
  }
  const mi = Math.max(0, MD.findIndex((x) => x[1] == vMode));
  let b;
  if (STAB == "theme") b = `<div class="sh" style="margin-top:0">حالت نمایش</div>${seg(MD, mi, "sm")}<div class="m" style="margin-top:6px">«ملایم» پس‌زمینه‌ی کرم و کم‌خیرگی دارد و برای چشم‌های حساس به نور مناسب‌تر است.</div>
<div class="sh">رنگ برنامه</div><div class="sw">${TH.map((t) => `<button title="${t[1]}" onclick="st('${t[0]}')" style="width:36px;height:36px;min-height:0;border-radius:50%;padding:0;background:${t[2]};border:${t[0] == th ? "3px solid var(--t)" : "2px solid var(--b)"}"></button>`).join("")}</div>
<div class="sh">فونت</div><select onchange="sf(this.value)" style="width:100%">${FN.map((f) => `<option value="${f[0]}" ${f[0] == fo ? "selected" : ""}>${f[0] == "custom" && ffN ? "فونت از فایل: " + esc(ffN) : f[1]}</option>`).join("")}</select>
<div class="m" style="margin-top:6px">اگر با انتخاب یک فونت «نیاز به نصب» تغییری نمی‌بینید، آن فونت روی این دستگاه نصب نیست.</div>
<div class="sh">اندازه‌ی نوشته</div>${seg(FZ, fz, "sz")}<div class="sh">ضخامت نوشته</div>${seg(FW, fw, "sw")}<div class="sh">فاصله‌ی خطوط</div>${seg(LH, lh, "sLH")}
<div class="pv">نمونه: پرستاری در منزل — مأموریت ۱۲۳۴ — ${fmt(567e3)} ${UN()} — Hello 2026</div>
<div class="sh">افزودن فونت دلخواه (مثلاً وزیرمتن)</div><label class="rb">📁 انتخاب فایل فونت<input type="file" accept=".ttf,.otf,.woff,.woff2" onchange="lf(this)" hidden></label>${ffN ? ` <button onclick="clf()">حذف فونت ذخیره‌شده</button>` : ""}
<div class="m" style="margin-top:6px">فایل فونت (ttf یا woff2، حداکثر ۲ مگابایت) را یک بار انتخاب کنید؛ داخل مرورگر ذخیره می‌شود و بدون اینترنت هم کار می‌کند. فونت‌های «متغیر» (Variable) همه‌ی ضخامت‌ها را پشتیبانی می‌کنند.</div>`;
  else if (STAB == "feat") b = `<div class="sh" style="margin-top:0">سمت‌ها و دسته‌بندی پرسنل</div><p class="m" style="margin-top:0">تیک «پرستار» یعنی این سمت در مأموریت‌ها، کیف‌ها و ست‌ها قابل انتخاب است.</p><table>${ROLES().map((r, i) => `<tr><td><input value="${esc(r.n)}" onchange="rRen(${i},this.value)" style="width:100%"></td><td><label style="white-space:nowrap"><input type="checkbox" ${r.nurse ? "checked" : ""} onchange="rNur(${i},this.checked)"> پرستار</label></td><td><button class="x" onclick="rDel(${i})">✕</button></td></tr>`).join("")}</table><div style="display:flex;gap:6px;margin-top:6px"><input id="rn" placeholder="سمت جدید (مثلاً حسابدار)" style="flex:1"><button class="p" onclick="rAdd()">+ افزودن</button></div>
<div class="sh">دسته‌بندی هزینه‌ها</div><table>${CATS.map((c, i) => `<tr><td><input value="${esc(c)}" ${SYSC.includes(c) ? 'disabled title="دسته‌ی سیستمی"' : ""} onchange="cRen(${i},this.value)" style="width:100%"></td><td>${SYSC.includes(c) ? '<span class="m">سیستمی</span>' : `<button class="x" onclick="cDel(${i})">✕</button>`}</td></tr>`).join("")}</table><div style="display:flex;gap:6px;margin-top:6px"><input id="cn" placeholder="دسته‌ی هزینه‌ی جدید" style="flex:1"><button class="p" onclick="cAdd()">+ افزودن</button></div><p class="m">تغییر نام یک دسته در هزینه‌ها و بودجه‌های قبلی هم اعمال می‌شود. دسته‌ای که استفاده شده قابل حذف نیست.</p>
<div class="sh">هشدار انقضای کالا</div><label>پیش‌فرض: چند روز قبل از انقضا در داشبورد هشدار بده <input type="number" min="0" value="${warnDays()}" onchange="setWarn(this.value)" style="width:100px"></label><p class="m">برای هر کالا در فرم کالا یا خرید می‌شود عدد جدا هم تعیین کرد.</p>
<div class="pv" style="text-align:center">🚧 امکانات بیشتر در دست ساخت و ساز</div>`;
  else if (STAB == "co") b = coTab();
  else if (STAB == "storage") b = stTab();
  else b = `<div class="sh" style="margin-top:0">واحد پولی</div>${seg(UNITS.map((u) => [u[1]]), ui(), "su")}
<p class="m">همه‌ی مبالغ داخل پایگاه داده به <b>تومان</b> ذخیره می‌شوند و فقط نمایش و ورود اعداد با واحد انتخابی انجام می‌شود (فرم‌ها، جدول‌ها، نمودارها، چاپ و اکسل). بنابراین اگر واحد پول کشور عوض شود یا چهار صفر از ریال حذف شود، لازم نیست هیچ داده‌ای دستکاری شود؛ فقط واحد را عوض کنید.</p>
<table><tr><th>واحد</th><th>معادل ۱٬۰۰۰٬۰۰۰ تومان</th></tr>${UNITS.map((u) => `<tr><td>${u[1]}</td><td>${(1e6 * u[2]).toLocaleString("en-US")}</td></tr>`).join("")}</table>
<p class="m">«ریال جدید» یعنی ریالی که از هر ۱۰٬۰۰۰ ریال فعلی چهار صفر حذف شده باشد (۱ ریال جدید = ۱٬۰۰۰ تومان).</p>`;
  e.innerHTML = `<div class="mo" style="z-index:50"><div class="mb"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h3 style="margin:0">⚙ تنظیمات</h3><button onclick="xs()">✕ بستن</button></div><div class="sgp" style="margin:12px 0">${settingsTabs([["theme", "تم"], ["feat", "شخصی‌سازی"], ["acc", "حسابداری"], ["co", "اطلاعات شرکت"], ["storage", "ذخیره‌سازی"]]).map((x) => `<button class="${x[0] == STAB ? "on" : ""}" onclick="stb('${x[0]}')">${x[1]}</button>`).join("")}</div>${b}</div></div>`;
  const n = e.querySelector(".mb");
  if (n) n.scrollTop = sc;
}
const st = (k) => {
  th = k;
  try {
    localStorage.setItem(K + "th", k);
  } catch (e) {
  }
  render();
};
try {
  matchMedia("(prefers-color-scheme:dark)").addEventListener("change", ap);
} catch (e) {
}
