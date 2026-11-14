// ======== v0.8: units, reservations ========
const UNITS = [["toman", "تومان", 1], ["rial", "ریال", 10], ["rialN", "ریال جدید (۴ صفر حذف‌شده)", 1e-3]], MONEY = { repairs: ["cost"], buyE: ["p", "day", "dep"], plan: ["est"], rcpts: ["amt"], accts: ["open"], tx: ["amt", "fee"], budgets: ["amt"], services: ["price"], missions: ["disc", "bonus"], items: ["buy", "sell"], equip: ["base", "day", "dep"], loans: ["dep"], exp: ["amt"], chq: ["amt"], purchase: ["p"] };
function UF() {
  try {
    return (UNITS.find((u) => u[0] == db.cfg.unit) || UNITS[0])[2];
  } catch (e) {
    return 1;
  }
}
function UN() {
  try {
    return (UNITS.find((u) => u[0] == db.cfg.unit) || UNITS[0])[1].split(" (")[0];
  } catch (e) {
    return "تومان";
  }
}
const dv = (x) => Math.round((+x || 0) * UF() * 1e6) / 1e6, uv = (v) => v === "" || v == null ? "" : Math.round(+v / UF() * 1e6) / 1e6, cu = (x) => Math.round((+x || 0) * UF() * 1e3) / 1e3, ul = (t) => String(t).replace(/تومان/g, UN());
const shortN = (v) => {
  const x = v * UF(), a = Math.abs(x), r = (n, d) => (+(n / d).toFixed(1)).toLocaleString("en-US");
  return a >= 1e9 ? r(x, 1e9) + " میلیارد" : a >= 1e6 ? r(x, 1e6) + " میلیون" : a >= 1e3 ? r(x, 1e3) + " هزار" : (+x.toFixed(2)).toLocaleString("en-US");
};
function rsvGo(id) {
  const r = db.rsv.find((x) => x.id == id);
  if (!r) return;
  SV = { s: "", m: "" };
  const d = DEF.missions();
  Object.assign(d, { date: r.date || todayJ(), time: r.time || "", client: r.client, staff: r.staff || "", lines: JSON.parse(JSON.stringify(r.lines || [])), cons: [] });
  M = { l: "missions", i: -1, d, rsv: id };
  drawM();
}
