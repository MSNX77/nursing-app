// ======== reports ========
let R = { from: "", to: "", staff: "", client: "" };
const inR = (d) => {
  const a = dn(d);
  if (isNaN(a)) return !R.from && !R.to;
  return a >= (R.from ? dn(R.from) : -1 / 0) && a <= (R.to ? dn(R.to) : 1 / 0);
}, sum = (a, f) => a.reduce((s, x) => s + f(x), 0), sel = (o, v) => o.map((x) => `<option value="${x[0]}" ${x[0] == v ? "selected" : ""}>${x[1]}</option>`).join("");
function RP() {
  const ms = db.missions.filter((m) => inR(m.date)), f = ms.filter((m) => (!R.staff || m.staff == R.staff) && (!R.client || m.client == R.client)), ex = db.exp.filter((e) => inR(e.date)), bc = {};
  ex.forEach((e) => bc[e.cat || "سایر"] = (bc[e.cat || "سایر"] || 0) + e.amt);
  const inc = { t: sum(ms, (m) => mt(m)), v: sum(ms, (m) => mv(m)), c: sum(ms, (m) => mc(m).cons) }, rent = sum(db.loans.filter((l) => l.end && inR(l.end)), (l) => ld(l).rent), sh = sum(ms, (m) => mc(m).shB) + sum(db.bons.filter((y) => inR(y.date)), (y) => y.amt), exT = sum(ex, (e) => e.amt), dsc = sum(ms, (m) => +m.disc || 0), btx = sum(ms, (m) => mc(m).tax);
  return { ms, f, ex, bc, inc, rent, sh, exT, dsc, btx, net: inc.t + inc.v + inc.c + rent - dsc - sh - exT };
}
const GH = ["نام", "تعداد", "جمع کل", "سهم پرستار", "سهم شرکت"], grr = (ms, key, list) => {
  const g = {};
  ms.forEach((m) => (g[m[key]] = g[m[key]] || []).push(m));
  return Object.keys(g).map((k) => {
    const a = g[k];
    return [nm(list, k), a.length, sum(a, (m) => mc(m).tot), sum(a, (m) => mc(m).sh), sum(a, (m) => mc(m).co)];
  });
}, gt = (rows) => "<table><tr>" + GH.map((h) => `<th>${h}</th>`).join("") + "</tr>" + rows.map((r) => "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td>" + r.slice(2).map((v) => "<td>" + fmt(v) + "</td>").join("") + "</tr>").join("") + "</table>";
function xp() {
  const p = RP();
  xl([
    ["مأموریت‌ها", [["تاریخ", "ساعت", "شماره فاکتور", "مشتری", "پرستار", "خدمات", "تعرفه", "ایاب‌وذهاب", "مصرفی", "تخفیف", "پاداش", "جمع کل", "سهم پرستار", "سهم شرکت"], ...p.f.map((m) => {
      const c = mc(m);
      return [m.date, m.time || "", m.invoice || "", nm("clients", m.client), nm("staff", m.staff), svs(m), cu(mt(m)), cu(mv(m)), cu(c.cons), cu(c.disc), cu(c.bonus), cu(c.tot), cu(c.sh), cu(c.co)];
    })]],
    ["سود و زیان", [["واحد پولی", UN()], ["بازه", (R.from || "—") + " تا " + (R.to || "—")], ["درآمد خدمات", cu(p.inc.t + p.inc.v)], ["تخفیف‌ها", cu(p.dsc)], ["مالیات ۲۰٪ پاداش‌ها", cu(p.btx)], ["فروش مصرفی", cu(p.inc.c)], ["اجاره تجهیزات", cu(p.rent)], ["سهم پرستاران", cu(p.sh)], ["هزینه‌ها", cu(p.exT)], ["سود خالص", cu(p.net)], [], ["دسته‌ی هزینه", "مبلغ"], ...Object.keys(p.bc).map((k) => [k, cu(p.bc[k])]), [], ["تاریخ", "دسته", "شرح", "مبلغ", "شماره فاکتور/رسید"], ...p.ex.map((e) => [e.date, e.cat, e.desc, cu(e.amt), e.doc || ""])]],
    ["تسویه پرستاران", [["پرستار", "مأموریت‌ها", "سهم در بازه", "پرداخت در بازه", "مانده‌ی کل پرداخت‌نشده"], ...db.staff.map((t) => {
      const a = p.ms.filter((m) => m.staff == t.id);
      return [t.name, a.length, cu(sum(a, (m) => mc(m).sh) + sum(db.bons.filter((y) => y.staff == t.id && inR(y.date)), (y) => y.amt)), cu(sum(db.pays.filter((y) => y.staff == t.id && inR(y.date)), (y) => y.amt)), cu(pEarn(t.id) - pPaid(t.id))];
    })]],
    ["پرستاران", [GH, ...grr(p.ms, "staff", "staff").map((r) => [r[0], r[1], cu(r[2]), cu(r[3]), cu(r[4])])]],
    ["مشتریان", [GH, ...grr(p.ms, "client", "clients").map((r) => [r[0], r[1], cu(r[2]), cu(r[3]), cu(r[4])])]],
    ["دریافت از مشتریان", rcRows(p)]
  ], "گزارش-" + todayJ().replace(/\//g, "-") + ".xlsx");
}
