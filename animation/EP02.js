/* Ancient Firelight — EP02 "The Hand"
   Master: voice/EP02_The_Hand_MASTER_TRIM.wav  (663.6s)
   Loaded AFTER engine.js, which provides the palette, easing, atmosphere,
   fire, figures, text and the Chauvet ghost compositor.

   Scene map (boundaries -> chapterBlink):
     A COLD OPEN   0   .. 96    the wall, the ochre, the blow, the stencil, 67,800, "the fingertips are wrong"
     B WHY         96  .. 188   why make one at all — useless, universal, an absence, the first self-portrait
     C UNIVERSAL   188 .. 245   the same gesture on every continent humans reached
     D DATING      245 .. 314   Muna, cave popcorn, 61,700 crust -> 67,800 floor
     E CLAWS       314 .. 409   the pointed finger, therianthropes, "they drew themselves with claws"
     F EUROPE      409 .. 534   the story this hand demolished — real estate, then the dates raced older
     G WHO         534 .. 597   which kind of human held it up? "we don't know yet"
     H CLOSE       597 .. 663   it was already old. "let this outlast me." It did.
*/

/* ---------- EP02-specific primitives ---------- */

// The hand, drawn as fills + round-capped capsules so it reads as a real splayed
// hand rather than a blocky glyph. Used BOTH to knock the negative out of the
// spray (via destination-out) and to draw the solid hand pressed to the rock —
// so set fillStyle AND strokeStyle before calling.
// clawT 0..1 = how far the fingertips are drawn out to points.
const HAND_F=[[-40,-0.46,86,10.5],[-14,-0.15,104,11.5],[13,0.15,99,11.5],[37,0.46,81,10.5]];
function digit(ctx,bx,by,ang,L,Wd,clawT){
  const ux=Math.sin(ang), uy=-Math.cos(ang), px=-uy, py=ux;
  const capL=L*(1-0.20*clawT);                 // capsule shortens as the claw grows
  ctx.lineWidth=Wd*2;
  ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+ux*capL,by+uy*capL);ctx.stroke();
  if(clawT>0.02){                              // filed point beyond the fingertip
    const tx=bx+ux*capL, ty=by+uy*capL, ext=L*0.34*clawT;
    ctx.beginPath();
    ctx.moveTo(tx-px*Wd*0.98,ty-py*Wd*0.98);
    ctx.lineTo(tx+px*Wd*0.98,ty+py*Wd*0.98);
    ctx.lineTo(tx+ux*ext,ty+uy*ext);
    ctx.closePath();ctx.fill();
  }
}
function handShape(ctx,cx,cy,s,clawT){
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  // palm + heel of the hand
  ctx.beginPath();ctx.ellipse(cx,cy+42*s,43*s,47*s,0,0,6.2832);ctx.fill();
  ctx.beginPath();ctx.ellipse(cx-2*s,cy+74*s,33*s,30*s,0,0,6.2832);ctx.fill();
  // wrist
  ctx.beginPath();ctx.ellipse(cx,cy+104*s,21*s,26*s,0,0,6.2832);ctx.fill();
  // four fingers, splayed
  for(const [dx,ang,len,wd] of HAND_F) digit(ctx,cx+dx*s,cy+16*s,ang,len*s,wd*s,clawT);
  // thumb, low and angled out
  digit(ctx,cx-40*s,cy+62*s,-1.16,70*s,12*s,clawT);
  ctx.restore();
}

// rock wall — mottled limestone that catches the firelight
function rockWall(ctx,t,lit){
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,mix('#0A0908','#2A1E17',lit*0.55));
  g.addColorStop(0.5,mix('#0C0A09','#3A2A1E',lit*0.62));
  g.addColorStop(1,mix('#080706','#241A13',lit*0.5));
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // stone mottling — static seeded blotches, so the wall doesn't crawl
  ctx.save();
  for(let i=0;i<150;i++){
    const x=rnd(i*1.7)*W, y=rnd(i*3.1)*H, r=18+rnd(i*5.3)*70;
    const a=lit*(0.020+0.045*rnd(i*2.9));
    ctx.fillStyle=rgba(rnd(i*7.1)>0.5?'#6B5442':'#141010',a);
    ctx.beginPath();ctx.ellipse(x,y,r,r*(0.5+rnd(i*4.3)*0.7),rnd(i)*3,0,6.2832);ctx.fill();
  }
  // a few cracks
  ctx.strokeStyle=rgba('#0A0807',lit*0.5);ctx.lineWidth=2;
  for(let i=0;i<9;i++){
    let x=rnd(i*11.3)*W, y=rnd(i*13.7)*H;
    ctx.beginPath();ctx.moveTo(x,y);
    for(let k=0;k<5;k++){x+=(rnd(i*3+k)-0.5)*120;y+=(rnd(i*5+k)-0.5)*90;ctx.lineTo(x,y);}
    ctx.stroke();
  }
  ctx.restore();
}

/* The signature image: red ochre sprayed AROUND a hand, leaving the negative.
   spray 0..1 grows the mist; lift 0..1 removes the hand itself, revealing the stencil. */
let _sc,_sx;
function stencil(ctx,cx,cy,s,spray,lift,al,clawT,t){
  if(al<=0.004)return;
  if(!_sc){_sc=document.createElement('canvas');_sc.width=W;_sc.height=H;_sx=_sc.getContext('2d');}
  _sx.setTransform(1,0,0,1,0,0);_sx.clearRect(0,0,W,H);
  // --- the sprayed field of ochre: a dense mist so the negative READS ---
  const cy2=cy+46*s, R=250*s;
  // soft base cloud first, so the field is continuous rather than a dot scatter
  const bg=_sx.createRadialGradient(cx,cy2,20*s,cx,cy2,R*1.05);
  bg.addColorStop(0,rgba('#A83C18',0.78*spray));
  bg.addColorStop(0.55,rgba('#8E2E12',0.52*spray));
  bg.addColorStop(1,'rgba(120,40,18,0)');
  _sx.fillStyle=bg;_sx.fillRect(0,0,W,H);
  // stippled ochre grain over the top — this is what makes it read as blown pigment
  const N=Math.floor(2600*spray);
  for(let i=0;i<N;i++){
    const a0=rnd(i)*6.2832;
    const rr=Math.sqrt(rnd(i*1.7))*R*(0.62+0.38*spray);
    const x=cx+Math.cos(a0)*rr*1.06, y=cy2+Math.sin(a0)*rr*1.12;
    const fall=1-clamp(rr/R,0,1);
    const a=al*spray*(0.16+0.62*fall)*(0.35+0.65*rnd(i*2.1));
    if(a<=0.01)continue;
    _sx.globalAlpha=a;
    _sx.fillStyle=(i%7===0)?'#B4491F':(i%3===0?'#A83C18':'#7E2810');
    _sx.beginPath();_sx.arc(x,y,rnd(i*3.1)*3.4*s+0.7,0,6.2832);_sx.fill();
  }
  _sx.globalAlpha=1;
  // --- knock the hand-shaped void out of the mist ---
  _sx.globalCompositeOperation='destination-out';
  _sx.fillStyle='#000';_sx.strokeStyle='#000';
  handShape(_sx,cx,cy,s,clawT);
  _sx.globalCompositeOperation='source-over';
  ctx.save();ctx.globalAlpha=al;ctx.drawImage(_sc,0,0);ctx.restore();
  // --- the physical hand still pressed to the rock (before it lifts) ---
  if(lift<0.999){
    const up=smooth(lift);
    ctx.save();
    ctx.globalAlpha=al*(1-up);
    ctx.translate(0,-up*46);                       // lifts away from the wall
    ctx.fillStyle=rgba('#080605',0.97);ctx.strokeStyle=rgba('#080605',0.97);
    handShape(ctx,cx,cy,s*(1+up*0.05),clawT);
    ctx.restore();ctx.globalAlpha=1;
  }
}

// crude world map — blob continents, deliberately rough (channel's hand-drawn register)
const LANDS=[
  // [cx,cy,rx,ry,rot] in fractions of W/H
  [0.17,0.42,0.075,0.135,0.1],  // N America
  [0.235,0.70,0.045,0.115,-0.25],// S America
  [0.475,0.36,0.055,0.075,0.0], // Europe
  [0.505,0.60,0.070,0.140,0.05],// Africa
  [0.655,0.36,0.130,0.115,0.0], // Asia
  [0.760,0.735,0.055,0.055,0.0],// Australia
];
function worldMap(ctx,al){
  if(al<=0.005)return;
  ctx.save();ctx.globalAlpha=al;
  for(const [x,y,rx,ry,rot] of LANDS){
    ctx.fillStyle=rgba('#26313B',0.85);
    ctx.strokeStyle=rgba(COOL,0.45);ctx.lineWidth=1.5;
    ctx.beginPath();ctx.ellipse(W*x,H*y,W*rx,H*ry,rot,0,6.2832);ctx.fill();ctx.stroke();
  }
  ctx.restore();ctx.globalAlpha=1;
}
// a site marker that blooms and leaves a small stencil mark
function site(ctx,fx,fy,a,label,side){
  if(a<=0.01)return;
  const x=W*fx,y=H*fy;
  ctx.save();ctx.globalAlpha=a;
  const pr=6+10*(1-a);
  ctx.fillStyle=rgba(EMBER2,0.95);ctx.beginPath();ctx.arc(x,y,6,0,6.2832);ctx.fill();
  ctx.strokeStyle=rgba(EMBER,0.55);ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(x,y,pr+8,0,6.2832);ctx.stroke();
  ctx.restore();
  line(ctx,label,x,y+(side==='up'?-28:30),21,CREAM,a,{italic:true});
}

/* ============================================================
   A — COLD OPEN (0 .. 96)
   ============================================================ */
function sceneOpen(ctx,t){
  // torch arrives at ~16 ("somebody has brought fire in")
  const lit=ramp(t,15.5,22.5)*0.85+0.15*ramp(t,3,12);
  rockWall(ctx,t,clamp(lit,0,1));
  const fx=W*0.30,fy=H*0.86;
  if(t>15){ fireGlow(ctx,fx,fy,0.55*ramp(t,15.5,23),t); }
  // the deep dark of the first 15s
  const dark=1-ramp(t,4,14);
  if(dark>0.01){ctx.fillStyle=rgba('#000000',dark*0.88);ctx.fillRect(0,0,W,H);}
  // …but not a dead black screen: someone is carrying fire toward us down the
  // passage. A warm glow swells from the left edge and finally arrives at ~16s.
  {
    const app=ramp(t,5.5,16.5);
    if(app>0.005){
      const flick=0.82+0.18*Math.sin(t*11)+0.08*Math.sin(t*27);
      const gx=-W*0.10+W*0.42*app, gy=H*0.72-H*0.06*app;
      const gr=(150+520*app)*flick;
      const g2=ctx.createRadialGradient(gx,gy,8,gx,gy,gr);
      g2.addColorStop(0,rgba(EMBER,(0.10+0.42*app)*flick));
      g2.addColorStop(0.45,rgba('#6E2C14',(0.05+0.20*app)));
      g2.addColorStop(1,'rgba(16,12,10,0)');
      ctx.fillStyle=g2;ctx.fillRect(0,0,W,H);
      emberDrift(ctx,t,20,0.30*app,gx,H*0.98);
    }
  }

  if(t<15.5){
    line(ctx,'Picture a wall of rock.',W*0.5,H*0.44,44,CREAM,env(t,1.2,2.6,5.2,6.6),{});
    line(ctx,'Somewhere warm. A very long time ago.',W*0.5,H*0.44+52,30,ASH,env(t,2.4,3.8,5.2,6.8),{italic:true});
    line(ctx,'The good kind of dark —',W*0.5,H*0.46,34,CREAM,env(t,7.0,8.4,13.2,14.6),{italic:true});
    line(ctx,'the kind that only exists deep inside stone.',W*0.5,H*0.46+46,28,ASH,env(t,9.2,10.6,13.2,14.6),{italic:true});
  }

  // ochre in the mouth (22 .. 31)
  if(t>=21&&t<32){
    const a=env(t,22.2,23.6,30.0,31.4);
    line(ctx,'ochre',W*0.5,H*0.30,52,EMBER2,a,{weight:700});
    line(ctx,'ground fine · mixed with spit',W*0.5,H*0.30+52,26,ASH,a,{italic:true});
    // a swirl of red pigment
    ctx.save();ctx.globalAlpha=a*0.85;
    for(let i=0;i<70;i++){
      const th=rnd(i)*6.2832+t*0.5, rr=30+rnd(i*2.3)*90;
      ctx.fillStyle=rgba(i%3?'#A83C18':'#C4451F',0.5*rnd(i*3.1));
      ctx.beginPath();ctx.arc(W*0.5+Math.cos(th)*rr,H*0.46+Math.sin(th)*rr*0.5,rnd(i*5.1)*4+1,0,6.2832);ctx.fill();
    }
    ctx.restore();ctx.globalAlpha=1;
  }

  // ---- the hand: pressed (31), sprayed (37-50), lifted (50-52) ----
  const hx=W*0.60, hy=H*0.40, hs=1.55;
  const press=ramp(t,30.6,34.5);
  const spray=ramp(t,37.2,47.5);
  const liftT=ramp(t,49.6,52.4);
  if(press>0.01){
    // clawT stays 0 here — the claw reveal is the later beat at 90
    stencil(ctx,hx,hy,hs,spray,liftT,press,0,t);
  }
  if(t>=30&&t<38) line(ctx,'flat against the rock. fingers wide.',W*0.5,H*0.86,28,ASH,env(t,31.2,32.6,36.4,37.8),{italic:true});
  if(t>=37&&t<43) line(ctx,'and you blow.',W*0.5,H*0.86,40,CREAM,env(t,38.2,39.2,41.6,42.8),{weight:700});
  if(t>=50&&t<58){
    line(ctx,'the shape of you',W*0.5,H*0.85,42,CREAM,env(t,50.4,51.6,56.2,57.6),{italic:true});
    line(ctx,'the exact negative of a hand, glowing in the firelight',W*0.5,H*0.85+44,24,ASH,env(t,53.0,54.4,56.2,57.6),{italic:true});
  }

  // ---- the date (58 .. 82) ----
  if(t>=58&&t<83){
    const a=env(t,59.0,60.4,80.6,82.4);
    line(ctx,'at least',W*0.5,H*0.24,26,ASH,env(t,61.0,62.2,80.6,82.4),{italic:true});
    const big=env(t,62.6,64.4,80.6,82.4);
    line(ctx,'67,800 years',W*0.5,H*0.335,104,CREAM,big,{weight:700});
    line(ctx,'The oldest art of any kind we have ever put a firm date on.',W*0.5,H*0.44,27,GOLD,env(t,76.8,78.4,80.6,82.4),{italic:true});
    citation(ctx,'Aubert M, Brumm A, Oktaviana AA, Joannes-Boyau R et al. 2026, Nature — Muna Island, Sulawesi',a);
  }

  // ---- "the fingertips are wrong. they come to points." (82 .. 96) ----
  if(t>=82){
    const a=env(t,83.4,84.8,94.6,96.0);
    line(ctx,'And when they looked closely at the fingers…',W*0.5,H*0.20,28,ASH,env(t,83.4,84.8,88.0,89.2),{italic:true});
    line(ctx,'The fingertips are wrong.',W*0.5,H*0.20,40,CREAM,env(t,88.6,89.8,94.6,96.0),{weight:700});
    // the stencil, re-drawn with the claw taper growing in
    const cl=ramp(t,91.4,94.6);
    stencil(ctx,W*0.5,H*0.50,1.85,1,1,a,cl,t);
    line(ctx,'They come to points.',W*0.5,H*0.90,38,EMBER2,env(t,92.0,93.2,94.8,96.0),{italic:true,weight:700});
  }

  vignette(ctx);grain(ctx,t);
}

/* ============================================================
   B — WHY MAKE ONE AT ALL (96 .. 188)
   ============================================================ */
function sceneWhy(ctx,t){
  baseBg(ctx,t,0.22);
  ghost(ctx,'hands',t,env(t,124,127,138,141)*0.11,0.6);
  kicker(ctx,'Part One · why would anyone do this?',env(t,98,99.5,116,118));

  if(t>=100&&t<106) line(ctx,'Why would anyone make a hand stencil?',W*0.5,H*0.42,40,CREAM,env(t,102.4,103.8,105.0,106.2),{});

  // the uselessness litany — each struck through as it's dismissed
  if(t>=107&&t<124){
    const items=[['It doesn’t feed you.',110.6],['It doesn’t warm you.',112.2],['It doesn’t scare off the leopard.',113.6]];
    line(ctx,'A hunter doesn’t need it.',W*0.5,H*0.26,32,ASH,env(t,108.4,109.6,121.6,123.4),{italic:true});
    for(let i=0;i<items.length;i++){
      const [txt,tw]=items[i];
      const a=env(t,tw-0.4,tw+0.8,121.6,123.4); if(a<0.01)continue;
      const y=H*0.40+i*54;
      line(ctx,txt,W*0.5,y,32,CREAM,a,{});
      const sw=ramp(t,tw+1.0,tw+2.0);
      if(sw>0.01){ctx.save();ctx.globalAlpha=a*0.9;ctx.strokeStyle=rgba(EMBER,0.9);ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(W*0.5-250,y);ctx.lineTo(W*0.5-250+500*sw,y);ctx.stroke();ctx.restore();}
    }
    line(ctx,'A complete waste of a perfectly good mouthful of ochre.',W*0.5,H*0.66,27,GOLD,env(t,117.6,119.0,121.6,123.4),{italic:true});
  }

  if(t>=123&&t<140){
    line(ctx,'And yet people made them.',W*0.5,H*0.34,42,CREAM,env(t,123.8,125.0,138.0,139.6),{weight:700});
    line(ctx,'Over and over. Across tens of thousands of years.',W*0.5,H*0.34+56,28,ASH,env(t,126.4,127.8,138.0,139.6),{italic:true});
    line(ctx,'On nearly every continent humans reached.',W*0.5,H*0.34+96,28,ASH,env(t,130.2,131.6,138.0,139.6),{italic:true});
    line(ctx,'One of the most stubbornly universal things our species has ever done.',W*0.5,H*0.62,26,GOLD,env(t,135.2,136.6,138.2,139.8),{italic:true});
  }

  // "a stencil isn't a picture of a hand — it's the ABSENCE of a hand"
  if(t>=140&&t<168){
    line(ctx,'Most early art is a picture of something.',W*0.5,H*0.22,30,ASH,env(t,142.8,144.2,148.0,149.2),{italic:true});
    const nb=env(t,149.6,151.0,165.4,167.0);
    if(nb>0.01){
      line(ctx,'A stencil isn’t a picture of a hand.',W*0.5,H*0.30,34,CREAM,nb,{});
      line(ctx,'It’s the absence of a hand.',W*0.5,H*0.30+50,44,EMBER2,env(t,152.2,153.4,165.4,167.0),{weight:700});
      line(ctx,'Wrapped in red.',W*0.5,H*0.30+104,30,GOLD,env(t,155.8,156.8,165.4,167.0),{italic:true});
      stencil(ctx,W*0.5,H*0.66,1.05,1,1,nb*0.9,0,t);
    }
    line(ctx,'The hand itself was the brush.',W*0.5,H*0.90,28,CREAM,env(t,158.6,160.0,165.4,167.0),{italic:true});
  }
  if(t>=167&&t<188){
    line(ctx,'The artist and the subject were the same object',W*0.5,H*0.24,30,CREAM,env(t,167.2,168.4,172.4,173.6),{italic:true});
    line(ctx,'for one held breath.',W*0.5,H*0.24+44,30,GOLD,env(t,168.6,169.8,172.4,173.6),{italic:true});
    line(ctx,'the first self-portrait',W*0.5,H*0.40,44,CREAM,env(t,169.8,171.2,186.2,187.8),{weight:700});
    line(ctx,'Not “here is what I look like.”  Something stranger:',W*0.5,H*0.52,27,ASH,env(t,174.4,175.8,186.2,187.8),{italic:true});
    line(ctx,'Here is proof that I was here.',W*0.5,H*0.61,40,EMBER2,env(t,179.0,180.2,186.2,187.8),{weight:700});
    line(ctx,'I pressed the fact of me into the world.',W*0.5,H*0.72,30,CREAM,env(t,182.4,183.6,186.2,187.8),{italic:true});
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   C — THE SAME GESTURE EVERYWHERE (188 .. 245)
   ============================================================ */
function sceneUniversal(ctx,t){
  baseBg(ctx,t,0.16);
  ghost(ctx,'hands',t,env(t,205,208,228,231)*0.12,2.4);
  kicker(ctx,'the same gesture, everywhere',env(t,190,191.5,204,206));
  const mapA=env(t,195.0,197.5,241.0,244.0);
  worldMap(ctx,mapA*0.9);
  // sites light up as he names them
  site(ctx,0.478,0.352,env(t,199.0,200.4,241.0,244.0),'France & Spain','up');
  site(ctx,0.242,0.760,env(t,202.4,203.8,241.0,244.0),'Argentina — Cueva de las Manos','down');
  site(ctx,0.762,0.742,env(t,210.6,212.0,241.0,244.0),'Australia','down');
  site(ctx,0.700,0.585,env(t,212.2,213.6,241.0,244.0),'Indonesia','down');

  if(t>=194&&t<199) line(ctx,'Hand stencils are almost eerie in how widespread they are.',W*0.5,H*0.14,27,ASH,env(t,194.6,196.0,197.8,199.0),{italic:true});
  if(t>=205&&t<211) line(ctx,'Hundreds of them. A stampede of red palms.',W*0.5,H*0.90,28,GOLD,env(t,205.8,207.0,209.8,211.0),{italic:true});
  if(t>=214&&t<228) line(ctx,'Different continents. Different peoples. Separated by oceans — and by tens of thousands of years.',W*0.5,H*0.90,24,ASH,env(t,215.0,216.4,226.4,227.8),{italic:true});
  if(t>=219&&t<233){
    line(ctx,'walked into a dark place · put up a hand · blew red around it',W*0.5,H*0.14,26,CREAM,env(t,220.4,221.8,230.4,232.0),{italic:true});
  }
  if(t>=227&&t<233) line(ctx,'As close to a universal human signature as anything we’ve got.',W*0.5,H*0.90,27,GOLD,env(t,228.2,229.4,231.6,232.8),{italic:true});
  if(t>=233){
    const a=env(t,234.2,235.6,243.4,244.8);
    ctx.save();ctx.globalAlpha=a*0.55;ctx.fillStyle=rgba('#000000',0.75);ctx.fillRect(0,0,W,H);ctx.restore();
    line(ctx,'When something shows up everywhere,',W*0.5,H*0.40,32,CREAM,a,{});
    line(ctx,'with no one teaching it to anyone —',W*0.5,H*0.40+46,32,CREAM,env(t,236.6,238.0,243.4,244.8),{});
    line(ctx,'you’re not looking at a custom.',W*0.5,H*0.56,30,ASH,env(t,239.4,240.6,243.4,244.8),{italic:true});
    line(ctx,'You’re looking at something wired deep.',W*0.5,H*0.64,36,EMBER2,env(t,241.0,242.2,243.6,245.0),{weight:700});
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   D — HOW WE KNOW: CAVE POPCORN (245 .. 314)
   ============================================================ */
function popcornDiagram(ctx,t){
  // stacked strata: rock / paint / crust — with the logic of the date
  const cx=W*0.5, top=H*0.34, bw=560, bh=64;
  const rockA=ramp(t,264.5,266.5);
  const paintA=ramp(t,266.5,268.5);
  const crustA=ramp(t,270.0,274.5);
  // rock
  ctx.save();ctx.globalAlpha=rockA;
  ctx.fillStyle=rgba('#3A2C22',0.95);ctx.fillRect(cx-bw/2,top+bh*2,bw,bh*1.5);
  ctx.restore();
  line(ctx,'limestone wall',cx,top+bh*2+bh*0.75,22,ASH,rockA,{italic:true});
  // paint
  ctx.save();ctx.globalAlpha=paintA;
  ctx.fillStyle=rgba('#A83C18',0.95);ctx.fillRect(cx-bw/2,top+bh,bw,bh);
  ctx.restore();
  line(ctx,'the ochre hand',cx,top+bh*1.5,24,CREAM,paintA,{weight:700});
  // crust (grows ON TOP, later)
  ctx.save();ctx.globalAlpha=crustA;
  ctx.fillStyle=rgba('#C9BDA8',0.85);ctx.fillRect(cx-bw/2,top,bw,bh);
  // popcorn nodules
  for(let i=0;i<34;i++){const x=cx-bw/2+rnd(i*3.1)*bw, y=top+8+rnd(i*5.3)*(bh-16);
    ctx.fillStyle=rgba('#E4DAC6',0.55);ctx.beginPath();ctx.arc(x,y,3+rnd(i*7.1)*6,0,6.2832);ctx.fill();}
  ctx.restore();
  line(ctx,'mineral crust — “cave popcorn”',cx,top+bh*0.5,24,SOOT==='x'?CREAM:'#2A2119',crustA,{weight:700});

  // the dates + the logic
  const d1=ramp(t,292.2,294.2);
  if(d1>0.01){
    line(ctx,'crust dated:  ~61,700 years',cx,top-56,30,GOLD,d1,{weight:700});
    arrow(ctx,cx+bw/2+26,top+bh*0.5,cx+bw/2-6,top+bh*0.5,d1,GOLD);
  }
  const d2=ramp(t,300.6,302.6);
  if(d2>0.01){
    line(ctx,'so the hand beneath it is older:  at least 67,800',cx,H*0.76,32,EMBER2,d2,{weight:700});
    arrow(ctx,cx-bw/2-26,top+bh*1.5,cx-bw/2+6,top+bh*1.5,d2,EMBER2);
  }
  const d3=ramp(t,306.4,308.4);
  if(d3>0.01) line(ctx,'A firm floor — it could be older still. We just can’t yet say how much.',cx,H*0.86,26,ASH,d3,{italic:true});
}
function sceneDating(ctx,t){
  baseBg(ctx,t,0.18);
  kicker(ctx,'how we know',env(t,247,248.5,262,264));
  if(t>=246&&t<262){
    line(ctx,'Muna Island',W*0.5,H*0.34,54,CREAM,env(t,247.2,248.6,259.8,261.4),{weight:700});
    line(ctx,'just off the southeast arm of Sulawesi, Indonesia',W*0.5,H*0.34+56,28,ASH,env(t,249.6,251.0,259.8,261.4),{italic:true});
    line(ctx,'a region that has been rewriting the whole story for a decade',W*0.5,H*0.56,27,GOLD,env(t,254.8,256.2,259.8,261.4),{italic:true});
    worldMap(ctx,env(t,248.0,250.0,259.8,261.4)*0.5);
    site(ctx,0.700,0.585,env(t,249.0,250.4,259.8,261.4),'Muna','down');
  }
  if(t>=262&&t<314){
    line(ctx,'You can’t carbon-date a smear of ochre.',W*0.5,H*0.16,28,ASH,env(t,264.2,265.6,276.0,277.4),{italic:true});
    popcornDiagram(ctx,t);
    if(t>=277&&t<284) line(ctx,'“cave popcorn” — the best name in all of geology',W*0.5,H*0.90,26,GOLD,env(t,278.2,279.6,282.6,284.0),{italic:true});
    citation(ctx,'uranium-series dating of overlying calcite · Nature, 21 Jan 2026',ramp(t,264,266));
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   E — THE CLAWS (314 .. 409)
   ============================================================ */
function therianthrope(ctx,x,baseY,s,col,beast){
  // human body, animal head — the Sulawesi figures
  ctx.save();ctx.fillStyle=col;
  // torso
  ctx.beginPath();ctx.ellipse(x,baseY-52*s,15*s,34*s,0,0,6.2832);ctx.fill();
  // legs
  ctx.lineWidth=6*s;ctx.strokeStyle=col;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x-4*s,baseY-22*s);ctx.lineTo(x-14*s,baseY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+4*s,baseY-22*s);ctx.lineTo(x+14*s,baseY);ctx.stroke();
  // arms — one raised, holding a line (spear/rope)
  ctx.beginPath();ctx.moveTo(x-10*s,baseY-72*s);ctx.lineTo(x-30*s,baseY-96*s);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+10*s,baseY-72*s);ctx.lineTo(x+28*s,baseY-52*s);ctx.stroke();
  // head — beast
  const hy=baseY-100*s;
  ctx.beginPath();ctx.ellipse(x+3*s,hy,13*s,10*s,0.2,0,6.2832);ctx.fill();
  if(beast==='bird'){ // long beak
    ctx.beginPath();ctx.moveTo(x+12*s,hy);ctx.lineTo(x+38*s,hy+5*s);ctx.lineTo(x+12*s,hy+7*s);ctx.closePath();ctx.fill();
  }else{ // muzzle + ears
    ctx.beginPath();ctx.ellipse(x+15*s,hy+3*s,9*s,6*s,0.1,0,6.2832);ctx.fill();
    ctx.beginPath();ctx.moveTo(x-4*s,hy-8*s);ctx.lineTo(x-9*s,hy-22*s);ctx.lineTo(x+2*s,hy-12*s);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(x+7*s,hy-9*s);ctx.lineTo(x+8*s,hy-24*s);ctx.lineTo(x+14*s,hy-11*s);ctx.closePath();ctx.fill();
  }
  ctx.restore();
}
function sceneClaws(ctx,t){
  baseBg(ctx,t,0.20);
  ghost(ctx,'lions',t,env(t,364,367,392,395)*0.12,1.9);
  kicker(ctx,'Part Two · the fingertips',env(t,316,317.5,330,332));

  // the claw taper drawn out, big, centre-left
  if(t>=314&&t<348){
    const a=env(t,315.4,317.0,345.0,347.0);
    const cl=ramp(t,317.6,323.4);
    stencil(ctx,W*0.34,H*0.50,1.55,1,1,a,cl,t);
    line(ctx,'the tip of at least one finger was',W*0.68,H*0.34,28,CREAM,env(t,317.0,318.4,331.0,332.6),{});
    line(ctx,'deliberately narrowed — pulled to a point',W*0.68,H*0.34+42,28,EMBER2,env(t,319.6,321.0,331.0,332.6),{weight:700});
    line(ctx,'by dabbing extra pigment,',W*0.68,H*0.50,25,ASH,env(t,328.4,329.8,334.4,335.8),{italic:true});
    line(ctx,'or moving the hand mid-spray',W*0.68,H*0.50+36,25,ASH,env(t,331.0,332.4,334.4,335.8),{italic:true});
    // the honesty beat
    if(t>=335){
      line(ctx,'Honestly:',W*0.68,H*0.44,30,GOLD,env(t,336.4,337.6,345.0,346.6),{weight:700});
      line(ctx,'what it means is not proven. It’s interpretation.',W*0.68,H*0.44+42,25,CREAM,env(t,341.2,342.6,345.0,346.6),{italic:true});
    }
  }
  if(t>=347&&t<362){
    line(ctx,'But it’s interpretation from the people',W*0.5,H*0.30,30,CREAM,env(t,348.0,349.2,360.0,361.4),{});
    line(ctx,'who spent their careers on these walls.',W*0.5,H*0.30+44,30,CREAM,env(t,349.8,351.0,360.0,361.4),{});
    line(ctx,'And here’s what they suspect:',W*0.5,H*0.48,28,ASH,env(t,352.8,354.0,360.0,361.4),{italic:true});
    line(ctx,'An animal claw.',W*0.5,H*0.58,50,EMBER2,env(t,355.0,356.2,360.2,361.6),{weight:700});
  }
  // therianthropes (362 .. 396)
  if(t>=362&&t<397){
    const a=env(t,363.4,365.4,394.0,396.0);
    line(ctx,'Another Sulawesi cave — a painted hunting scene, 44,000 years old',W*0.5,H*0.16,26,ASH,env(t,364.0,365.6,377.0,378.4),{italic:true});
    const figs=[[0.30,'beast'],[0.42,'bird'],[0.56,'beast'],[0.68,'bird'],[0.79,'beast']];
    for(let i=0;i<figs.length;i++){
      const fa=env(t,368.0+i*0.9,369.4+i*0.9,394.0,396.0);
      if(fa<0.01)continue;
      ctx.save();ctx.globalAlpha=fa;
      therianthrope(ctx,W*figs[i][0],H*0.72,1.5,rgba('#120B08',0.95),figs[i][1]);
      ctx.restore();ctx.globalAlpha=1;
    }
    if(t>=374) line(ctx,'Bodies of people.   Heads of beasts.',W*0.5,H*0.82,30,CREAM,env(t,375.0,376.2,394.0,396.0),{italic:true});
    if(t>=381) line(ctx,'therianthropes',W*0.5,H*0.30,46,EMBER2,env(t,382.0,383.2,394.0,396.0),{weight:700});
    if(t>=383) line(ctx,'human hybrids',W*0.5,H*0.30+50,26,GOLD,env(t,383.6,384.8,394.0,396.0),{italic:true});
    if(t>=386) line(ctx,'The oldest art we can date may be a picture of a person who is also somehow an animal.',W*0.5,H*0.90,24,ASH,env(t,387.0,388.6,394.0,396.0),{italic:true});
    citation(ctx,'Aubert M et al. 2019/2024, Nature — Leang Bulu’ Sipong 4, Sulawesi',a);
  }
  if(t>=396){
    const a=env(t,396.6,398.0,407.0,408.6);
    ctx.save();ctx.globalAlpha=a*0.6;ctx.fillStyle=rgba('#000000',0.8);ctx.fillRect(0,0,W,H);ctx.restore();
    line(ctx,'The very first time a human left a lasting image of themselves,',W*0.5,H*0.38,29,CREAM,a,{});
    line(ctx,'they may have drawn themselves with claws.',W*0.5,H*0.38+48,36,EMBER2,env(t,398.8,400.2,407.0,408.6),{weight:700});
    line(ctx,'A haunting thing to be the beginning of.',W*0.5,H*0.60,30,GOLD,env(t,403.4,404.8,407.0,408.6),{italic:true});
    stencil(ctx,W*0.5,H*0.50,1.2,1,1,a*0.30,1,t);
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   F — THE STORY THIS HAND DEMOLISHED (409 .. 534)
   ============================================================ */
function datesRace(ctx,t){
  // horizontal timeline; older = further right. Europe's "revolution" then the Indonesian dates.
  const x0=W*0.16, x1=W*0.90, y=H*0.60;
  const T0=35000, T1=72000;
  const px=v=>x0+(x1-x0)*clamp((v-T0)/(T1-T0),0,1);
  const axA=ramp(t,479.6,481.6);
  ctx.save();ctx.globalAlpha=axA;
  ctx.strokeStyle=rgba(ASH,0.55);ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();
  for(const v of [40000,50000,60000,70000]){
    ctx.beginPath();ctx.moveTo(px(v),y-7);ctx.lineTo(px(v),y+7);ctx.stroke();
    line(ctx,(v/1000)+'k',px(v),y+28,20,ASH,1,{font:MONO});
  }
  ctx.restore();
  line(ctx,'← younger        older →',W*0.5,y+62,20,ASH,axA*0.8,{italic:true,font:MONO});

  const marks=[
    [40000,'“the human revolution”',       'Europe · the old answer', 481.0, ASH,   -1],
    [45500,'warty pig — 45,500',            'Sulawesi',                485.4, GOLD,   1],
    [51200,'a narrative scene — 51,200',    'people and a pig',        497.4, GOLD,  -1],
    [67800,'THIS HAND — 67,800',            'Muna',                    500.2, EMBER2, 1],
  ];
  for(const [v,lab,sub,tw,col,side] of marks){
    const a=env(t,tw,tw+1.4,531.0,533.0); if(a<0.01)continue;
    const x=px(v), oy=side>0?-1:1;
    ctx.save();ctx.globalAlpha=a;
    ctx.strokeStyle=rgba(col,0.9);ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+oy*(side>0?92:74));ctx.stroke();
    ctx.fillStyle=rgba(col,0.95);ctx.beginPath();ctx.arc(x,y,7,0,6.2832);ctx.fill();
    ctx.restore();
    line(ctx,lab,x,y+oy*(side>0?118:100),(col===EMBER2)?26:23,col===EMBER2?CREAM:col,a,{weight:col===EMBER2?700:400});
    line(ctx,sub,x,y+oy*(side>0?142:122),19,ASH,a,{italic:true});
  }
}
function sceneEurope(ctx,t){
  baseBg(ctx,t,0.18);
  ghost(ctx,'lions', t,env(t,426,429,436,439)*0.11,0.9);
  ghost(ctx,'horses',t,env(t,427.5,430.5,437,440)*0.06,3.3);
  kicker(ctx,'Part Three · how we got the story wrong',env(t,411,413,418.4,419.8));

  if(t>=409&&t<419){
    line(ctx,'Now — the story this hand quietly demolished.',W*0.5,H*0.40,34,CREAM,env(t,410.2,411.6,417.4,418.8),{});
    line(ctx,'Because this is really an episode about how we got the story wrong.',W*0.5,H*0.40+48,27,GOLD,env(t,414.2,415.6,417.4,418.8),{italic:true});
  }
  if(t>=419&&t<441){
    line(ctx,'Ask where art began, and for a century the answer was:',W*0.5,H*0.245,28,ASH,env(t,419.8,421.2,436.0,437.4),{italic:true});
    line(ctx,'Europe.',W*0.5,H*0.335,54,CREAM,env(t,423.4,424.6,436.0,437.4),{weight:700});
    const names=[['Chauvet',426.4],['Lascaux',427.9],['El Castillo',429.4]];
    for(let i=0;i<names.length;i++){
      const a=env(t,names[i][1],names[i][1]+1.0,436.0,437.4);
      line(ctx,names[i][0],W*(0.28+i*0.22),H*0.48,34,GOLD,a,{italic:true});
    }
    line(ctx,'The great painted caves of France and Spain.',W*0.5,H*0.60,26,ASH,env(t,431.4,432.8,436.0,437.4),{italic:true});
  }
  if(t>=437&&t<458){
    line(ctx,'A whole theory was built on top of it,',W*0.5,H*0.22,28,ASH,env(t,437.6,438.8,455.6,457.0),{italic:true});
    line(ctx,'with a name that has not aged well:',W*0.5,H*0.22+40,28,ASH,env(t,438.6,439.8,455.6,457.0),{italic:true});
    line(ctx,'“the human revolution”',W*0.5,H*0.40,46,CREAM,env(t,439.8,441.2,455.6,457.0),{weight:700});
    line(ctx,'Something switched on in the modern brain ~40,000 years ago…',W*0.5,H*0.54,26,ASH,env(t,442.4,443.8,455.6,457.0),{italic:true});
    // the "click"
    const clk=env(t,449.6,450.3,455.6,457.0);
    if(clk>0.01){
      line(ctx,'click',W*0.5,H*0.64,40,EMBER2,clk,{italic:true,weight:700});
      line(ctx,'suddenly art, symbols, the works. Europe as the cradle of the mind.',W*0.5,H*0.74,25,CREAM,env(t,451.4,452.8,455.6,457.0),{italic:true});
    }
  }
  if(t>=457&&t<480){
    line(ctx,'It’s a tidy story.',W*0.5,H*0.26,36,CREAM,env(t,458.0,459.2,477.6,479.2),{});
    line(ctx,'It is also, it turns out, mostly a story about real estate.',W*0.5,H*0.26+52,32,EMBER2,env(t,460.0,461.4,477.6,479.2),{italic:true,weight:700});
    const why=[['Europe is where archaeology was invented.',464.6],
               ['Where the universities were.',467.4],
               ['Where the funding was.',469.2],
               ['Where 200 years of people with trowels went looking.',471.0]];
    for(let i=0;i<why.length;i++){
      const a=env(t,why[i][1],why[i][1]+1.1,477.6,479.2); if(a<0.01)continue;
      line(ctx,'—  '+why[i][0],W*0.5,H*0.48+i*42,26,ASH,a,{});
    }
    line(ctx,'Find art only where you dig, and you’ll conclude art began where you dug.',W*0.5,H*0.84,27,GOLD,env(t,475.0,476.4,477.8,479.4),{italic:true});
  }
  if(t>=480&&t<534){
    line(ctx,'Then the dates started coming out of Indonesia — and kept getting older.',W*0.5,H*0.16,27,CREAM,env(t,480.4,482.0,530.0,532.4),{italic:true});
    datesRace(ctx,t);
    if(t>=505&&t<513){
      line(ctx,'The oldest secure art on earth is not in Europe.',W*0.5,H*0.28,32,CREAM,env(t,505.6,507.0,511.4,512.8),{weight:700});
      line(ctx,'It’s on a small island most people have never heard of.',W*0.5,H*0.28+46,27,GOLD,env(t,508.8,510.0,511.4,512.8),{italic:true});
    }
    if(t>=513){
      const a=env(t,513.4,514.8,531.0,533.0);
      line(ctx,'Precision, because precision is the moat:',W*0.5,H*0.24,26,ASH,a,{italic:true});
      line(ctx,'oldest rock art we can firmly date  →  this hand, 67,800',W*0.5,H*0.31,25,CREAM,env(t,516.0,517.4,531.0,533.0),{});
      line(ctx,'oldest storytelling picture  →  still the 51,200 scene',W*0.5,H*0.31+36,25,CREAM,env(t,519.6,521.0,531.0,533.0),{});
      line(ctx,'Different records. Easy to blur — so I won’t.',W*0.5,H*0.31+80,25,GOLD,env(t,528.0,529.2,531.2,533.2),{italic:true});
    }
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   G — WHICH KIND OF HUMAN? (534 .. 597)
   ============================================================ */
function sceneWho(ctx,t){
  baseBg(ctx,t,0.22);
  kicker(ctx,'one more thread',env(t,536,537.5,548,550));
  if(t>=534&&t<552){
    line(ctx,'One more thread I refuse to tuck away —',W*0.5,H*0.34,32,CREAM,env(t,535.0,536.4,550.0,551.4),{});
    line(ctx,'because the argument is the content.',W*0.5,H*0.34+46,28,GOLD,env(t,536.8,538.2,550.0,551.4),{italic:true});
    line(ctx,'I’ve been saying “a person.” “A human.”',W*0.5,H*0.56,29,ASH,env(t,539.4,540.8,550.0,551.4),{italic:true});
    line(ctx,'We can’t be completely sure which kind of human held up that hand.',W*0.5,H*0.66,27,CREAM,env(t,546.8,548.2,550.2,551.6),{});
  }
  if(t>=551&&t<575){
    // three candidate silhouettes with a question mark over each
    const cands=[['our own species',552.0],['archaic populations',555.4],['maybe Denisovans',559.8]];
    for(let i=0;i<cands.length;i++){
      const a=env(t,cands[i][1],cands[i][1]+1.3,571.4,573.2); if(a<0.01)continue;
      const x=W*(0.25+i*0.25);
      ctx.save();ctx.globalAlpha=a*0.9;
      figure(ctx,x,H*0.62,1.15,rgba('#0E0A08',0.95));
      ctx.restore();ctx.globalAlpha=1;
      line(ctx,'?',x,H*0.40,58,EMBER2,a*0.8,{weight:700});
      line(ctx,cands[i][0],x,H*0.70,24,CREAM,a,{italic:true});
    }
    if(t>=564) line(ctx,'The paleoanthropologist John Hawks has made exactly this point:',W*0.5,H*0.18,26,ASH,env(t,565.0,566.4,571.4,573.2),{italic:true});
    if(t>=569){
      line(ctx,'the oldest, most careful assumption isn’t “modern human.”',W*0.5,H*0.83,27,CREAM,env(t,569.4,570.6,573.0,574.4),{});
      line(ctx,'It’s “we don’t know yet.”',W*0.5,H*0.90,30,GOLD,env(t,572.8,573.8,574.2,575.4),{italic:true,weight:700});
    }
  }
  if(t>=575){
    const a=env(t,576.0,577.4,595.0,596.6);
    line(ctx,'I find I don’t mind the uncertainty.',W*0.5,H*0.26,32,CREAM,a,{});
    line(ctx,'I find I love it.',W*0.5,H*0.26+46,32,EMBER2,env(t,579.4,580.6,595.0,596.6),{italic:true,weight:700});
    stencil(ctx,W*0.5,H*0.56,1.15,1,1,env(t,581.0,583.0,595.0,596.6)*0.85,1,t);
    line(ctx,'someone who wanted to say I was here —',W*0.5,H*0.86,27,CREAM,env(t,583.4,584.8,595.0,596.6),{italic:true});
    line(ctx,'and who looked at their own hand and thought it should have claws.',W*0.5,H*0.92,25,GOLD,env(t,585.6,587.0,595.0,596.6),{italic:true});
    if(t>=588) line(ctx,'Exactly us, or nearly us — the impulse is the same one flickering in you right now.',W*0.5,H*0.16,25,ASH,env(t,589.0,590.4,595.2,596.8),{italic:true});
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   H — CLOSE: IT WAS ALREADY OLD (597 .. 663)
   ============================================================ */
function sceneClose(ctx,t){
  // back into the cave; the wall, the fire, the hand — everything else falls away
  const lit=0.75*(1-ramp(t,650,660)*0.55);
  rockWall(ctx,t,lit);
  const fx=W*0.20,fy=H*0.92;
  fireGlow(ctx,fx,fy,0.45*(1-ramp(t,648,659)*0.7),t);
  emberDrift(ctx,t,26,0.4);

  if(t>=597&&t<611){
    line(ctx,'We imagine the mind switching on like a light.',W*0.5,H*0.30,32,CREAM,env(t,601.6,603.0,609.4,610.8),{});
    line(ctx,'One morning, somewhere, the first modern human wakes up and gets it.',W*0.5,H*0.30+46,26,ASH,env(t,604.8,606.2,609.4,610.8),{italic:true});
  }
  if(t>=610&&t<628){
    line(ctx,'But that’s not what the wall shows.',W*0.5,H*0.22,32,CREAM,env(t,610.8,612.0,626.0,627.4),{});
    line(ctx,'The wall shows a thing that already was.',W*0.5,H*0.22+46,34,EMBER2,env(t,613.0,614.4,626.0,627.4),{weight:700});
    const a=env(t,615.6,617.4,626.0,627.4);
    stencil(ctx,W*0.5,H*0.58,1.35,1,1,a,1,t);
    line(ctx,'fully formed · strange · self-aware enough to make a mark for no reason but to have it',W*0.5,H*0.92,23,ASH,env(t,618.4,620.0,626.0,627.4),{italic:true});
  }
  if(t>=627&&t<638){
    line(ctx,'That capacity didn’t switch on in a European cave 40,000 years ago.',W*0.5,H*0.34,29,CREAM,env(t,628.2,629.6,636.4,637.8),{});
    line(ctx,'It was already old.',W*0.5,H*0.34+50,42,GOLD,env(t,632.2,633.4,636.4,637.8),{weight:700});
    line(ctx,'Old and widespread — and doing something no animal does.',W*0.5,H*0.56,26,ASH,env(t,634.2,635.6,636.6,638.0),{italic:true});
  }
  // the final image: the hand alone, and the words
  if(t>=637){
    const a=ramp(t,638.0,640.0);
    stencil(ctx,W*0.5,H*0.48,1.7,1,1,a*(1-ramp(t,659.5,662.6)*0.25),1,t);
    line(ctx,'Pressing a hand to stone, thinking:',W*0.5,H*0.15,27,ASH,env(t,638.4,639.8,643.4,644.6),{italic:true});
    line(ctx,'let this outlast me.',W*0.5,H*0.15+40,34,CREAM,env(t,640.2,641.4,643.4,644.6),{italic:true,weight:700});
    if(t>=643) line(ctx,'It did.',W*0.5,H*0.20,46,EMBER2,env(t,643.4,644.2,648.4,649.6),{weight:700});
    if(t>=645) line(ctx,'It outlasted everyone who knew that hand’s owner — every language they spoke, every fire they sat beside.',W*0.5,H*0.90,22,ASH,env(t,645.6,647.0,652.4,653.6),{italic:true});
    if(t>=651.5) line(ctx,'67,000 years.',W*0.5,H*0.90,32,GOLD,env(t,652.0,653.0,655.4,656.4),{italic:true,weight:700});
    if(t>=654) line(ctx,'And the one thing that survived is the gesture.',W*0.5,H*0.16,27,CREAM,env(t,654.4,655.6,662.0,663.2),{italic:true});
    if(t>=656.6) line(ctx,'I was here.',W*0.5,H*0.885,54,CREAM,env(t,656.9,657.8,662.4,663.4),{weight:700});
    if(t>=658.4) line(ctx,'Here’s the proof it worked: they were trying to reach exactly this far.',W*0.5,H*0.955,23,GOLD,env(t,658.8,660.0,662.4,663.4),{italic:true});
  }
  vignette(ctx);grain(ctx,t);
}

/* ============================================================
   EPISODE
   ============================================================ */
window.EPISODE={
  duration:663.6,
  bounds:[96,188,245,314,409,534,597],
  ghostNames:['hands','lions','horses'],
  render:function(ctx,t){
    if(t<96)        sceneOpen(ctx,t);
    else if(t<188)  sceneWhy(ctx,t);
    else if(t<245)  sceneUniversal(ctx,t);
    else if(t<314)  sceneDating(ctx,t);
    else if(t<409)  sceneClaws(ctx,t);
    else if(t<534)  sceneEurope(ctx,t);
    else if(t<597)  sceneWho(ctx,t);
    else            sceneClose(ctx,t);
  }
};
