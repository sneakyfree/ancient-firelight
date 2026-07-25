from playwright.sync_api import sync_playwright
import base64,os
FPS=24; DUR=45.5; N=int(FPS*DUR)
os.makedirs('/tmp/coldopen/frames',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':1280,'height':720})
    pg.goto('file:///tmp/coldopen/anim.html')
    pg.wait_for_function("window.ready===true",timeout=20000)
    pg.wait_for_timeout(400)
    for f in range(N):
        t=f/FPS
        d=pg.evaluate("window.frame(%f)"%t)
        open("/tmp/coldopen/frames/%05d.png"%f,"wb").write(base64.b64decode(d.split(',',1)[1]))
        if f%120==0: print("frame",f,"/",N,flush=True)
    b.close()
print("FRAMES_DONE",N)
