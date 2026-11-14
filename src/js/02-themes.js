// ======== themes ========
const TH = [["teal", "فیروزه‌ای", "#0b7a75", "#3cc2ba", "#f1f7f7"], ["blue", "آبی", "#1d63c4", "#6aa8ff", "#f1f5fb"], ["purple", "بنفش", "#6d3fc0", "#b190ff", "#f6f3fb"], ["green", "سبز", "#2e7d32", "#66c46b", "#f1f7f2"], ["orange", "نارنجی", "#c75b0a", "#ffa05a", "#fbf5ee"], ["rose", "سرخابی", "#c2255c", "#ff7fa6", "#fbf1f4"]];
let th = "teal";
try {
  th = localStorage.getItem(K + "th") || "teal";
} catch (e) {
}
const dk = () => vMode == "dark" || vMode == "auto" && matchMedia("(prefers-color-scheme:dark)").matches;
const FN = [
  ["tahoma", "تاهوما (ویندوز)", 'Tahoma,"Segoe UI",sans-serif'],
  ["segoe", "سگوئی (Segoe UI)", '"Segoe UI",Tahoma,sans-serif'],
  ["sys", "فونت پیش‌فرض سیستم", 'system-ui,"Segoe UI",Tahoma,sans-serif'],
  ["dubai", "دبی (Dubai) — ویندوز ۱۰ و ۱۱، نرم و گرد", '"Dubai","Segoe UI",Tahoma,sans-serif'],
  ["geeza", "گیزا پرو (Geeza Pro) — مک و آیفون", '"Geeza Pro","Noto Sans Arabic",Tahoma,sans-serif'],
  ["noto", "نوتو سنس عربی — اندروید/لینوکس", '"Noto Sans Arabic","Noto Sans",Tahoma,sans-serif'],
  ["vazir", "وزیرمتن (Vazirmatn) — نیاز به نصب", '"Vazirmatn","Vazir",Tahoma,sans-serif'],
  ["sahel", "ساحل (Sahel) — نیاز به نصب", '"Sahel",Tahoma,sans-serif'],
  ["samim", "صمیم (Samim) — نیاز به نصب", '"Samim",Tahoma,sans-serif'],
  ["shabnam", "شبنم (Shabnam) — نیاز به نصب", '"Shabnam",Tahoma,sans-serif'],
  ["iransans", "ایران‌سنس (IRANSans) — نیاز به نصب", '"IRANSans","IRANSansWeb",Tahoma,sans-serif'],
  ["yekan", "بی‌یکان (B Yekan) — نیاز به نصب", '"B Yekan","BYekan",Tahoma,sans-serif'],
  ["nazanin", "بی‌نازنین (B Nazanin) — نیاز به نصب", '"B Nazanin","BNazanin","Sakkal Majalla",serif'],
  ["naskh", "نوتو نسخ (Noto Naskh) — نیاز به نصب", '"Noto Naskh Arabic","Sakkal Majalla","Traditional Arabic",serif'],
  ["majalla", "سکل مجلّه (Sakkal Majalla) — ویندوز", '"Sakkal Majalla","Simplified Arabic",Tahoma,sans-serif'],
  ["arial", "آریال (Arial)", "Arial,Tahoma,sans-serif"],
  ["custom", "فونت از فایل (انتخاب شما)", '"NursingCustom",Tahoma,sans-serif']
], FZ = [["کوچک", "15px"], ["متوسط", "17px"], ["بزرگ", "19px"], ["خیلی بزرگ", "22px"]], FW = [["معمولی", "400"], ["متوسط", "500"], ["ضخیم", "600"], ["خیلی ضخیم", "700"]], LH = [["فشرده", "1.5"], ["معمولی", "1.7"], ["باز", "1.95"]], MD = [["خودکار", "auto"], ["روشن", "light"], ["تیره", "dark"], ["ملایم (کم‌خیرگی)", "soft"]];
let fo = "tahoma", fz = 1, fw = 1, lh = 1, vMode = "auto", ffN = "";
try {
  const g = (k) => localStorage.getItem(K + k), n = (k, d) => {
    const v = g(k);
    return v === null ? d : +v;
  };
  fo = g("fo") || "tahoma";
  fz = n("fz", 1);
  fw = n("fw", 1);
  lh = n("lh", 1);
  vMode = g("vMode") || "auto";
  ffN = g("ffn") || "";
  const u = g("ff");
  if (u) loadFF(u);
} catch (e) {
}
function loadFF(u) {
  try {
    const f = new FontFace("NursingCustom", "url(" + u + ")", { weight: "100 900" });
    f.load().then((x) => document.fonts.add(x)).catch(() => {
    });
  } catch (e) {
  }
}
function ap() {
  const t = TH.find((x) => x[0] == th) || TH[0], r = document.documentElement, s = r.style, d = dk();
  r.dataset.m = MD.some((x) => x[1] == vMode) ? vMode : "auto";
  s.setProperty("--p", d ? t[3] : t[2]);
  s.setProperty("--pt", d ? "#10181d" : "#fff");
  d || vMode == "soft" ? s.removeProperty("--bg") : s.setProperty("--bg", t[4]);
  s.setProperty("--f", (FN.find((x) => x[0] == fo) || FN[0])[2]);
  s.setProperty("--fs", (FZ[fz] || FZ[1])[1]);
  s.setProperty("--fw", (FW[fw] || FW[1])[1]);
  s.setProperty("--lh", (LH[lh] || LH[1])[1]);
}
const stSv = (k, v) => {
  try {
    localStorage.setItem(K + k, v);
  } catch (e) {
  }
}, sf = (v) => {
  fo = v;
  stSv("fo", v);
  render();
}, sz = (v) => {
  fz = v;
  stSv("fz", v);
  render();
}, sw = (v) => {
  fw = v;
  stSv("fw", v);
  render();
}, sLH = (v) => {
  lh = v;
  stSv("lh", v);
  render();
}, sm = (v) => {
  vMode = MD[v][1];
  stSv("vMode", vMode);
  render();
};
function lf(i) {
  const f = i.files[0];
  if (!f) return;
  if (f.size > 2e6) return alert("حجم فایل فونت بیش از ۲ مگابایت است؛ نسخه‌ی کم‌حجم‌تر (مثلاً woff2) را انتخاب کنید.");
  const r = new FileReader();
  r.onload = () => {
    const u = r.result;
    loadFF(u);
    let ok = 1;
    try {
      localStorage.setItem(K + "ff", u);
      localStorage.setItem(K + "ffn", f.name);
    } catch (e) {
      ok = 0;
    }
    ffN = f.name;
    fo = "custom";
    stSv("fo", "custom");
    if (!ok) alert("فونت فقط برای همین بار فعال شد و ذخیره نشد؛ حافظه‌ی مرورگر پر است.");
    setTimeout(render, 400);
  };
  r.readAsDataURL(f);
}
const clf = () => {
  try {
    localStorage.removeItem(K + "ff");
    localStorage.removeItem(K + "ffn");
  } catch (e) {
  }
  ffN = "";
  if (fo == "custom") {
    fo = "tahoma";
    stSv("fo", fo);
  }
  render();
};
