#!/usr/bin/env node
// ساخت فایل تک‌صفحه‌ای از ماژول‌ها.  اجرا:  node build.js
// خروجی: docs/index.html (برای GitHub Pages و Firebase) و dist/nursing-app-<نسخه>.html
const fs = require("fs"), path = require("path");
const R = __dirname, rd = (p) => fs.readFileSync(path.join(R, p), "utf8");
const files = fs.readdirSync(path.join(R, "src/js")).filter((f) => f.endsWith(".js")).sort();
const js = files.map((f) => rd("src/js/" + f).replace(/\n+$/, "") + "\n\n").join("");
const ver = js.match(/VER = "([^"]+)"/)[1];
const out = rd("src/index.template.html").split("{{CSS}}").join(rd("src/css/style.css")).split("{{JS}}").join(js.replace(/\n+$/, "") + "\n").split("{{VER}}").join(ver);
fs.mkdirSync(path.join(R, "docs"), { recursive: true });
fs.mkdirSync(path.join(R, "dist"), { recursive: true });
for (const p of ["docs/index.html", "dist/nursing-app-" + ver + ".html"]) fs.writeFileSync(path.join(R, p), out);
console.log("ساخته شد: نسخه", ver, "-", files.length, "ماژول");
