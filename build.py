#!/usr/bin/env python3
"""ساخت فایل تک‌صفحه‌ای از ماژول‌ها.  اجرا:  python3 build.py
خروجی: docs/index.html (برای GitHub Pages و Firebase) و dist/nursing-app-<نسخه>.html"""
import glob, os, re
R = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(os.path.join(R, p), encoding="utf-8").read()
files = sorted(glob.glob(os.path.join(R, "src/js/*.js")))
js = "".join(open(f, encoding="utf-8").read().rstrip("\n") + "\n\n" for f in files)
ver = re.search(r'VER = "([^"]+)"', js).group(1)
out = rd("src/index.template.html").replace("{{CSS}}", rd("src/css/style.css")).replace("{{JS}}", js.rstrip("\n") + "\n").replace("{{VER}}", ver)
os.makedirs(os.path.join(R, "docs"), exist_ok=True)
os.makedirs(os.path.join(R, "dist"), exist_ok=True)
for p in ("docs/index.html", "dist/nursing-app-%s.html" % ver):
    open(os.path.join(R, p), "w", encoding="utf-8").write(out)
print("ساخته شد: نسخه", ver, "-", len(files), "ماژول")
