// ======== excel (xlsx) ========
const crcT = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc = (u) => {
  let c = -1;
  for (let i = 0; i < u.length; i++) c = crcT[(c ^ u[i]) & 255] ^ c >>> 8;
  return (c ^ -1) >>> 0;
};
function zip(files) {
  const te = new TextEncoder(), parts = [], cd = [], w2 = (n2) => [n2 & 255, n2 >> 8 & 255], w4 = (n2) => [n2 & 255, n2 >> 8 & 255, n2 >> 16 & 255, n2 >>> 24 & 255];
  let off = 0;
  files.forEach(([name, txt]) => {
    const nb = te.encode(name), d = te.encode(txt), c = crc(d), h = new Uint8Array([80, 75, 3, 4, 20, 0, 0, 8, 0, 0, 0, 0, 33, 0, ...w4(c), ...w4(d.length), ...w4(d.length), ...w2(nb.length), 0, 0]);
    parts.push(h, nb, d);
    cd.push(new Uint8Array([80, 75, 1, 2, 20, 0, 20, 0, 0, 8, 0, 0, 0, 0, 33, 0, ...w4(c), ...w4(d.length), ...w4(d.length), ...w2(nb.length), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...w4(off)]), nb);
    off += h.length + nb.length + d.length;
  });
  const cs = cd.reduce((a, x) => a + x.length, 0), n = files.length;
  return new Blob([...parts, ...cd, new Uint8Array([80, 75, 5, 6, 0, 0, 0, 0, ...w2(n), ...w2(n), ...w4(cs), ...w4(off), 0, 0])], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
const cn = (i) => {
  let s = "";
  i++;
  while (i > 0) {
    const m = (i - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}, ex = (t) => String(t).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]);
function xl(sh, fn) {
  const X = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', R1 = "http://schemas.openxmlformats.org/officeDocument/2006/relationships", rows = (r) => r.map((a2, y) => `<row r="${y + 1}">${a2.map((v, x) => v === "" || v == null ? "" : typeof v == "number" ? `<c r="${cn(x)}${y + 1}"><v>${v}</v></c>` : `<c r="${cn(x)}${y + 1}" t="inlineStr"><is><t>${ex(v)}</t></is></c>`).join("")}</row>`).join(""), F = [
    ["[Content_Types].xml", X + `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sh.map((s, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`],
    ["_rels/.rels", X + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${R1}/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ["xl/workbook.xml", X + `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${R1}"><sheets>${sh.map((s, i) => `<sheet name="${ex(s[0])}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>`],
    ["xl/_rels/workbook.xml.rels", X + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sh.map((s, i) => `<Relationship Id="rId${i + 1}" Type="${R1}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}</Relationships>`],
    ...sh.map((s, i) => [`xl/worksheets/sheet${i + 1}.xml`, X + `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView rightToLeft="1" workbookViewId="0"/></sheetViews><cols><col min="1" max="14" width="18" customWidth="1"/></cols><sheetData>${rows(s[1])}</sheetData></worksheet>`])
  ];
  const a = document.createElement("a");
  a.href = URL.createObjectURL(zip(F));
  a.download = fn;
  a.click();
}
