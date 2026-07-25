import sys, os
from playwright.sync_api import sync_playwright
html, outdir = sys.argv[1], sys.argv[2]
ids = sys.argv[3].split(",")
os.makedirs(outdir, exist_ok=True)
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--force-color-profile=srgb'])
    pg=b.new_page(viewport={'width':1280,'height':720})
    pg.on("pageerror", lambda e: errs.append("PAGEERROR: "+str(e)))
    pg.on("console", lambda m: errs.append("console."+m.type+": "+m.text) if m.type=="error" else None)
    pg.goto("file://"+html)
    pg.wait_for_function("window.ready===true", timeout=15000)
    pg.wait_for_timeout(500)
    for i in ids:
        pg.evaluate("window.thumb('%s')" % i)
        pg.screenshot(path="%s/%s.png" % (outdir, i))
    b.close()
print("ERRORS:", errs if errs else "none")
print("DONE", len(ids))
