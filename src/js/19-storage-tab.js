// ======== v0.12: تب ذخیره‌سازی (تنظیمات) ========
const ST_QUOTA = 5 * 1024 * 1024;
let ST_PROBE = null;
const fmtB = (n) => n < 1024 ? fn(n) + " بایت" : n < 1048576 ? (n / 1024).toFixed(1) + " کیلوبایت" : (n / 1048576).toFixed(2) + " مگابایت";
const lsInfo = () => {
  const items = [];
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i), v = localStorage.getItem(k) || "", b = (k.length + v.length) * 2;
      total += b;
      items.push({ k, b });
    }
  } catch (e) {
  }
  return { items, total };
};
const keyLabel = (k) => {
  if (k == K) return "اطلاعات اصلی برنامه (همه‌ی مأموریت‌ها، مالی، پرسنل و ...)";
  if (k.startsWith(K + "arch-")) {
    const h = ((CUR || db).hist || []).find((x) => k == arKey(x.id));
    return "آرشیو دوره" + (h ? ": " + (h.name || "") + " (" + h.from + " تا " + h.to + ")" : "");
  }
  if (k == K + "bk") return "زمان آخرین بکاپ";
  if (k.startsWith(K)) return "تنظیمات جانبی برنامه";
  return "داده‌ی سایت/برنامه‌ی دیگر روی همین آدرس";
};
function stProbe() {
  const k = K + "probe";
  let lo = 0, hi = 12 * 1024 * 1024, best = 0;
  try {
    localStorage.removeItem(k);
  } catch (e) {
  }
  while (hi - lo > 4096) {
    const mid = lo + hi >> 1;
    try {
      localStorage.setItem(k, "x".repeat(mid));
      best = mid;
      lo = mid;
    } catch (e) {
      hi = mid;
    }
  }
  try {
    localStorage.removeItem(k);
  } catch (e) {
  }
  ST_PROBE = { free: best * 2, at: todayJ() };
  stb("storage");
}
function stPersist() {
  if (!(navigator.storage && navigator.storage.persist)) return alert("این مرورگر درخواست ذخیره‌ی پایدار را پشتیبانی نمی‌کند.");
  navigator.storage.persist().then((ok) => {
    alert(ok ? "ذخیره‌ی پایدار فعال شد؛ مرورگر در کمبود فضا داده‌ی این سایت را خودکار پاک نمی‌کند." : "مرورگر درخواست را نپذیرفت (در بعضی مرورگرها فقط برای سایت‌های نصب‌شده یا پراستفاده فعال می‌شود).");
    stAsync();
  });
}
function stAsync() {
  const e = $("#stEst");
  if (!e || !(navigator.storage && navigator.storage.estimate)) return;
  const p = navigator.storage.persisted ? navigator.storage.persisted() : Promise.resolve(null);
  Promise.all([navigator.storage.estimate(), p]).then(([s, ps]) => {
    e.innerHTML = `مصرف کل این سایت در مرورگر (شامل حافظه‌ی موقت و سایر انواع ذخیره‌سازی): <b>${fmtB(s.usage || 0)}</b> از سهمیه‌ی کلی حدود <b>${fmtB(s.quota || 0)}</b>. ذخیره‌ی پایدار: <b>${ps === null ? "نامشخص" : ps ? "فعال" : "غیرفعال"}</b>`;
  }).catch(() => {
  });
}
const stTab = () => {
  const { items, total } = lsInfo(), pct = Math.min(100, total / ST_QUOTA * 100), cls = pct > 85 ? "bad" : pct > 60 ? "warn" : "ok", data = CUR || db;
  const cols = Object.keys(data).filter((k) => Array.isArray(data[k])).map((k) => ({ k, n: data[k].length, b: JSON.stringify(data[k]).length * 2 })).sort((a, b) => b.b - a.b);
  const ms = data.missions || [], avg = ms.length >= 5 ? JSON.stringify(ms).length * 2 / ms.length : 1500, left = Math.max(0, ST_QUOTA - total);
  const bk = (() => {
    try {
      return +localStorage.getItem(K + "bk") || 0;
    } catch (e) {
      return 0;
    }
  })(), bd = bk ? Math.floor((Date.now() - bk) / 864e5) : -1;
  setTimeout(stAsync, 0);
  return `<div class="sh" style="margin-top:0">مصرف حافظه‌ی مرورگر (localStorage)</div>
<p class="m" style="margin-top:0">اطلاعات برنامه فقط روی همین مرورگر و همین دستگاه و همین آدرس ذخیره می‌شود (نه روی اینترنت). فضای در دسترس معمولاً حدود ۵ مگابایت است (بسته به مرورگر ۵ تا ۱۰ مگابایت)؛ اندازه‌ها در اینجا تخمینی و بر اساس ۲ بایت برای هر نویسه‌اند.</p>
<div style="background:var(--b);border-radius:8px;height:14px;overflow:hidden"><div style="width:${pct.toFixed(1)}%;height:100%;background:var(--${cls == "bad" ? "r" : "p"})"></div></div>
<p><b class="${cls}">${fmtB(total)}</b> از حدود ${fmtB(ST_QUOTA)} (${pct.toFixed(1)}٪) — فضای باقی‌مانده‌ی تخمینی: <b>${fmtB(left)}</b></p>
<p class="m">با حجم فعلی هر مأموریت (حدود ${fmtB(avg)}) تقریباً جا برای <b>${fn(Math.floor(left / avg))}</b> مأموریت دیگر هست (بدون احتساب سایر بخش‌ها).${pct > 70 ? ' <b class="bad">فضا رو به اتمام است: دوره را ببندید، آرشیو و بکاپ را دانلود کنید و آرشیوهای قدیمی را از حافظه‌ی مرورگر حذف کنید.</b>' : ""}</p>
<div class="sh">چه چیزی چقدر جا گرفته (کل حافظه‌ی این آدرس)</div>
<table><tr><th>کلید</th><th>شرح</th><th>حجم</th></tr>${items.sort((a, b) => b.b - a.b).map((x) => `<tr><td style="direction:ltr;text-align:left">${esc(x.k)}</td><td>${esc(keyLabel(x.k))}</td><td>${fmtB(x.b)}</td></tr>`).join("") || '<tr><td colspan="3" class="m">چیزی ذخیره نشده.</td></tr>'}</table>
<div class="sh">سهم هر بخش از اطلاعات ${AR ? "این آرشیو" : "فعلی"}</div>
<table><tr><th>بخش</th><th>تعداد ردیف</th><th>حجم</th></tr>${cols.filter((c) => c.n).map((c) => `<tr><td>${esc(c.k)}</td><td>${fn(c.n)}</td><td>${fmtB(c.b)}</td></tr>`).join("") || '<tr><td colspan="3" class="m">هنوز ردیفی نیست.</td></tr>'}</table>
<div class="sh">اندازه‌گیری دقیق فضای آزاد</div>
<p class="m" style="margin-top:0">برنامه چند لحظه یک داده‌ی موقت می‌نویسد تا ببیند مرورگر شما واقعاً چقدر فضای آزاد دارد و بعد آن را پاک می‌کند (ممکن است یک ثانیه طول بکشد).</p>
<p><button onclick="stProbe()">📏 اندازه‌گیری</button> ${ST_PROBE ? `<b>فضای آزاد واقعی: حدود ${fmtB(ST_PROBE.free)}</b> <span class="m">(${ST_PROBE.at})</span>` : ""}</p>
<div class="sh">سهمیه‌ی کلی مرورگر و ذخیره‌ی پایدار</div>
<p id="stEst" class="m" style="margin-top:0">در حال خواندن...</p>
<p><button onclick="stPersist()">🔒 درخواست ذخیره‌ی پایدار</button></p>
<div class="sh">بکاپ</div>
<p>${bd < 0 ? '<b class="bad">هنوز بکاپ نگرفته‌اید.</b>' : bd > 7 ? `<b class="bad">آخرین بکاپ ${bd} روز پیش بوده است.</b>` : "آخرین بکاپ: " + (bd ? bd + " روز پیش" : "امروز")} <button onclick="bk()">⬇ بکاپ همین حالا</button></p>
<div class="sh">نکته‌های مهم</div>
<ul class="m" style="margin-top:0;line-height:1.9">
<li>اطلاعات هر آدرس جداست: اگر برنامه را از فایل روی کامپیوتر باز کنید و بعد از یک آدرس اینترنتی، دو مجموعه‌ی داده‌ی جدا می‌بینید. برای انتقال از بکاپ استفاده کنید.</li>
<li>پاک کردن «اطلاعات سایت/کوکی‌ها/حافظه‌ی مرورگر» یا بازنشانی مرورگر، همه‌ی اطلاعات را پاک می‌کند؛ پس بکاپ منظم بگیرید و فایل‌ها را جای دیگری هم نگه دارید.</li>
<li>در حالت ناشناس (Private) پس از بستن پنجره همه چیز پاک می‌شود، و در بعضی مرورگرها (مثل Safari) داده‌ی سایت‌هایی که مدتی باز نشده‌اند ممکن است خودکار پاک شود.</li>
<li>مرورگرهای دیگر و کامپیوتر دیگر داده‌ی شما را ندارند؛ برای کار چندنفره یا چنددستگاهی باید برنامه به سرور (مثل Firebase) وصل شود.</li>
<li>با بستن دوره، داده‌ی قدیمی به آرشیو می‌رود؛ آرشیو هم در همین حافظه‌ی مرورگر می‌ماند مگر بعد از دانلود فایلش از مرورگر حذف کنید.</li>
</ul>`;
};
