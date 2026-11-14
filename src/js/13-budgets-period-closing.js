// ======== v0.8: budgets 2.0, period closing ========
let BV = "m";
const bRec = (c, y) => db.budgets.find((b) => b.cat == c && +b.year == y) || db.budgets.find((b) => b.cat == c && !b.year), bDef = (r) => r.type == "annual" ? (+r.amt || 0) / 12 : +r.amt || 0, bCap = (r, m) => !r ? 0 : r.ov && r.ov[m] != null && r.ov[m] !== "" ? +r.ov[m] : bDef(r), bYear = (r) => sum([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], (m) => bCap(r, m)), spC = (c, a, b) => sum(db.exp.filter((e) => e.cat == c && dn(e.date) >= a && dn(e.date) <= b), (e) => e.amt), mR = (y, m) => [dn(y + "/" + pad(m) + "/01"), dn(y + "/" + pad(m) + "/" + pad(jmd(y, m)))], bsp = (y, m) => {
  BM = [y, m];
  render();
}, bv = (v) => {
  BV = v;
  render();
}, bnow = () => {
  BM = pj(todayJ()).slice(0, 2);
  render();
};
function bEnsure(c, y) {
  let r = db.budgets.find((b) => b.cat == c && +b.year == y);
  if (r) return r;
  const f = db.budgets.find((b) => b.cat == c && !b.year) || {};
  r = { id: uid(), cat: c, year: y, type: f.type || "monthly", amt: f.amt || 0, ov: { ...f.ov || {} }, note: f.note || "" };
  db.budgets.push(r);
  return r;
}
function bsetm(c, y, m, v) {
  const r = bEnsure(c, y), x = uv(v);
  r.ov = r.ov || {};
  if (x === "" || isNaN(x) || Math.abs(x - bDef(r)) < 1e-6) delete r.ov[m];
  else r.ov[m] = x;
  save();
  render();
}
function bcp(f, t) {
  if (!(canE("budgets"))) return deny();
  const cs = [...new Set(db.budgets.map((x) => x.cat))];
  let n = 0;
  cs.forEach((c) => {
    const r = bRec(c, f);
    if (!r || db.budgets.find((b) => b.cat == c && +b.year == t)) return;
    db.budgets.push({ id: uid(), cat: c, year: t, type: r.type || "monthly", amt: r.amt, ov: { ...r.ov || {} }, note: r.note || "" });
    n++;
  });
  if (!n) return alert("چیزی برای کپی نبود (برای سال " + t + " از قبل بودجه ثبت شده یا سال " + f + " بودجه ندارد).");
  save();
  BM[0] = t;
  render();
}
function bed(id) {
  const b = id ? db.budgets.find((x) => x.id == id) : null;
  M = { l: "budgets", v: 5, id: id || "", d: b ? { cat: b.cat, year: b.year || 0, type: b.type || "monthly", amt: b.amt, note: b.note || "" } : { cat: CATS[0], year: BM[0], type: "monthly", amt: "", note: "" } };
  drawM();
}
function bdSave() {
  const d = M.d;
  if (!(+d.amt > 0)) return alert("مبلغ را وارد کنید");
  const y = +d.year || 0;
  if (db.budgets.find((b) => b.id != M.id && b.cat == d.cat && (+b.year || 0) == y)) return alert("برای این دسته و این سال قبلاً بودجه ثبت شده؛ همان را ویرایش کنید.");
  if (M.id) {
    Object.assign(db.budgets.find((b) => b.id == M.id), { cat: d.cat, year: y, type: d.type, amt: +d.amt, note: d.note });
  } else db.budgets.push({ id: uid(), cat: d.cat, year: y, type: d.type, amt: +d.amt, ov: {}, note: d.note });
  M = null;
  save();
  render();
}
function bdel(id) {
  if (!confirm("این بودجه حذف شود؟ (اگر «ثابت» باشد برای همه‌ی سال‌ها حذف می‌شود)")) return;
  db.budgets = db.budgets.filter((x) => x.id != id);
  save();
  render();
}
function drawBD() {
  const d = M.d, yrs = [];
  for (let i = BM[0] - 3; i <= BM[0] + 4; i++) yrs.push([i, i]);
  return `<div class="mo"><div class="mb" style="max-width:520px"><h3>${M.id ? "ویرایش بودجه" : "بودجه‌ی جدید"}</h3><div class="fg"><label>دسته‌ی هزینه<select onchange="M.d.cat=this.value">${sel(CATS.map((c) => [c, c]), d.cat)}</select></label><label>سال<select onchange="M.d.year=+this.value">${sel([[0, "همه‌ی سال‌ها (ثابت)"], ...yrs], d.year || 0)}</select></label><label>نوع بودجه<select onchange="M.d.type=this.value;drawM()">${sel([["monthly", "ثابت ماهانه (هر ماه همین سقف)"], ["annual", "سالیانه (هر ماه = سالیانه ÷ ۱۲)"]], d.type)}</select></label><label>${d.type == "annual" ? "بودجه‌ی سالیانه" : "سقف هر ماه"} (${UN()})<input type="number" step="any" value="${d.amt === "" ? "" : dv(d.amt)}" oninput="M.d.amt=uv(this.value)"></label><label>توضیح<input value="${esc(d.note)}" oninput="M.d.note=this.value"></label></div><p class="m">برای تغییر بودجه‌ی بعضی ماه‌ها، در صفحه‌ی بودجه‌بندی عدد همان ماه را عوض کنید.</p><div style="margin-top:12px"><button class="p" onclick="bdSave()">ثبت</button> <button onclick="xm()">انصراف</button></div></div></div>`;
}
