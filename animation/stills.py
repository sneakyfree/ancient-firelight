import sys, os
from playwright.sync_api import sync_playwright
html, outdir = sys.argv[1], sys.argv[2]
times = [float(x) for x in sys.argv[3].split(",")]
os.makedirs(outdir, exist_ok=True)
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--force-color-profile=srgb'])
    pg=b.new_page(viewport={'width':1920,'height':1080})
    pg.on("pageerror", lambda e: errs.append("PAGEERROR: "+str(e)))
    pg.on("console", lambda m: errs.append("console."+m.type+": "+m.text) if m.type=="error" else None)
    pg.goto("file://"+html)
    pg.wait_for_function("window.ready===true",timeout=20000)
    pg.wait_for_timeout(400)
    for t in times:
        pg.evaluate("window.frame(%f)"%t)
        pg.screenshot(path="%s/t%07.1f.png"%(outdir,t))
    b.close()
print("ERRORS:", errs if errs else "none")
print("STILLS_DONE", len(times))
