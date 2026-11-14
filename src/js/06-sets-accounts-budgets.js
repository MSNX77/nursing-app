// ======== sterile sets, accounts, budgets ========
const jdd = (n) => {
  const d = new Date(n * 864e5), j = g2j(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  return j[0] + "/" + pad(j[1]) + "/" + pad(j[2]);
};
const setSt = (r) => {
  if (r.st == "used") return ["استفاده‌شده", "m"];
  if (r.st == "re") return ["نیازمند استریل مجدد", "bad"];
  const e = dn(r.exp), t = dn(todayJ());
  if (!isNaN(e)) {
    if (e < t) return ["منقضی", "bad"];
    if (e - t <= 7) return ["نزدیک انقضا (" + (e - t) + " روز)", "warn"];
  }
  return ["آماده", "ok"];
};
const bal = (a) => (+a.open || 0) + sum(db.tx.filter((t) => t.to == a.id), (t) => t.amt) - sum(db.tx.filter((t) => t.from == a.id), (t) => t.amt) - sum(db.exp.filter((e) => e.acct == a.id), (e) => e.amt) - sum(db.pays.filter((p) => p.acct == a.id), (p) => p.amt);
let BM = pj(todayJ()).slice(0, 2);
const bms = (d) => {
  BM[1] += d;
  if (BM[1] > 12) {
    BM[1] = 1;
    BM[0]++;
  }
  if (BM[1] < 1) {
    BM[1] = 12;
    BM[0]--;
  }
  render();
};
