/* Ancient Firelight — EP01 full-episode animation
   render(ctx,t): draws the entire 11.6-min episode as a function of time t (seconds),
   keyed to master narration segment times (EP01_narration_MASTER.wav, 695.1s).
   Coordinate space is logical 1280x720; frame() scales to 1920x1080 for 1080p output.
   Palette (STYLE BIBLE): soot #14100E, ember #C4451F/#D9552B, cream #EDE4D6,
   spark #E9783B, ash #6a5f52. EB Garamond ("EBG") is the book's typeface. */

const W=1280,H=720;
const SOOT='#14100E',EMBER='#C4451F',EMBER2='#D9552B',CREAM='#EDE4D6',SPARK='#E9783B',ASH='#6a5f52',GOLD='#E3A24B';
const SERIF='EBG,Georgia,serif', MONO='"DejaVu Sans Mono",Menlo,Consolas,monospace';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const ramp=(t,a,b)=>smooth((t-a)/(b-a));
// envelope: 0 -> up over [a,b] -> 1 -> down over [c,d] -> 0
const env=(t,a,b,c,d)=>ramp(t,a,b)*(1-ramp(t,c,d));
const rnd=s=>{const x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x);};
function hx(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function mix(a,b,t){t=clamp(t,0,1);const A=hx(a),B=hx(b);return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`;}
function rgba(hexOrArr,al){const c=Array.isArray(hexOrArr)?hexOrArr:hx(hexOrArr);return `rgba(${c[0]},${c[1]},${c[2]},${al})`;}

/* ---------- persistent atmosphere ---------- */
function baseBg(ctx,t,warm){
  // warm 0..1 = how "at the fire" we are; low warm = document/investigation mode
  let g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,mix('#0d0a08','#1c1109',warm*0.6));
  g.addColorStop(0.55,mix('#0a0807','#150d07',warm*0.4));
  g.addColorStop(1,'#070504');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // low ember glow at the very bottom edge — the fire is always in the room, even off-screen
  const gy=H+30, glowR=260+120*warm+30*Math.sin(t*3.1);
  const eg=ctx.createRadialGradient(W*0.5,gy,10,W*0.5,gy,glowR);
  const flick=0.85+0.15*Math.sin(t*13)+0.05*Math.sin(t*31);
  eg.addColorStop(0,rgba(EMBER,(0.12+0.30*warm)*flick));
  eg.addColorStop(0.5,rgba('#6e2c14',(0.06+0.14*warm)));
  eg.addColorStop(1,'rgba(20,16,14,0)');
  ctx.fillStyle=eg;ctx.fillRect(0,0,W,H);
}
function vignette(ctx){
  const v=ctx.createRadialGradient(W/2,H/2,H*0.33,W/2,H/2,H*0.9);
  v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,0.6)');
  ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
}
function grain(ctx,t){
  // faint warm flicker to keep flat frames alive
  const f=0.02+0.015*Math.sin(t*17)+0.01*Math.sin(t*7.3);
  ctx.fillStyle=rgba('#8a3a1a',f);ctx.fillRect(0,0,W,H);
}
function watermark(ctx,al){
  // small clawed hand, bottom-right brand mark
  ctx.save();ctx.globalAlpha=0.20*al;
  drawHand(ctx,W-70,H-58,0.22,1,EMBER2,false);
  ctx.restore();
}
function chapterBlink(ctx,t,bounds){
  // brief dip-to-dark at each scene boundary to hide the cut
  let dk=0;
  for(const b of bounds){dk=Math.max(dk, env(t,b-0.35,b-0.02,b+0.02,b+0.38));}
  if(dk>0.001){ctx.fillStyle=rgba('#000000',dk*0.92);ctx.fillRect(0,0,W,H);}
  return dk;
}

/* ---------- primitives ---------- */
function figure(ctx,x,baseY,s,color){
  ctx.fillStyle=color;
  ctx.beginPath();ctx.moveTo(x-34*s,baseY);
  ctx.quadraticCurveTo(x-30*s,baseY-70*s,x,baseY-78*s);
  ctx.quadraticCurveTo(x+30*s,baseY-70*s,x+34*s,baseY);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.arc(x,baseY-96*s,20*s,0,6.2832);ctx.fill();
  ctx.beginPath();ctx.ellipse(x+20*s,baseY-8*s,26*s,16*s,0,0,6.2832);ctx.fill();
}
function figureLying(ctx,x,baseY,s,color){
  ctx.fillStyle=color;
  ctx.beginPath();ctx.ellipse(x,baseY,60*s,20*s,0,0,6.2832);ctx.fill();
  ctx.beginPath();ctx.arc(x-58*s,baseY-6*s,17*s,0,6.2832);ctx.fill();
}
function flame(ctx,x,y,s,t){
  const fl=0.9+0.12*Math.sin(t*13)+0.05*Math.sin(t*29);
  const L=[['rgba(120,40,18,0.9)',1.0],['rgba(196,69,31,0.95)',0.66],['rgba(233,120,50,1)',0.4],['rgba(255,214,150,1)',0.18]];
  for(const [c,k] of L){const w=44*s*k*fl,h=120*s*k*fl;ctx.fillStyle=c;
    ctx.beginPath();ctx.moveTo(x,y-h);
    ctx.bezierCurveTo(x-w,y-h*0.55,x-w*0.7,y,x,y);
    ctx.bezierCurveTo(x+w*0.7,y,x+w,y-h*0.55,x,y-h);ctx.closePath();ctx.fill();}
  ctx.fillStyle=SPARK;
  for(let i=0;i<28;i++){const u=(rnd(i*2.3+Math.floor(t*8))+t*0.3)%1;
    const sx=x+(rnd(i)-0.5)*90*s,sy=y-40-u*260*s;
    ctx.globalAlpha=(1-u)*0.8*s;const r=(1-u)*2.4*s+0.4;
    ctx.beginPath();ctx.arc(sx,sy,r,0,6.2832);ctx.fill();}
  ctx.globalAlpha=1;
}
function drawClaw(ctx,bx,by,len,wd,ang){
  // finger from base (bx,by), direction ang (0 = straight up), tapering to a filed claw point
  const dx=Math.sin(ang), dy=-Math.cos(ang), px=-dy, py=dx;
  const tx=bx+dx*len, ty=by+dy*len;
  ctx.beginPath();ctx.arc(bx,by,wd,0,6.283);ctx.fill();               // knuckle base
  ctx.beginPath();
  ctx.moveTo(bx-px*wd,by-py*wd);ctx.lineTo(bx+px*wd,by+py*wd);ctx.lineTo(tx,ty);
  ctx.closePath();ctx.fill();                                          // taper to claw point
}
function drawHand(ctx,cx,cy,s,al,color,spray){
  // red hand stencil, fingertips filed to claw points — the channel mark
  ctx.save();ctx.globalAlpha=al;
  if(spray){ctx.fillStyle=rgba('#7a2f14',0.5);
    for(let i=0;i<180;i++){const a=rnd(i)*6.283,rr=(64+rnd(i*1.7)*105)*s;
      const pxr=cx+Math.cos(a)*rr, pyr=cy+Math.sin(a)*rr;
      ctx.globalAlpha=al*0.32*(1-rnd(i*2.1));
      ctx.beginPath();ctx.arc(pxr,pyr,rnd(i*3.1)*2.0*s+0.5,0,6.283);ctx.fill();}
    ctx.globalAlpha=al;}
  ctx.fillStyle=color;
  // palm + wrist
  ctx.beginPath();ctx.roundRect(cx-40*s,cy-4*s,80*s,80*s,[26*s,26*s,30*s,30*s]);ctx.fill();
  ctx.beginPath();ctx.roundRect(cx-24*s,cy+60*s,48*s,34*s,10*s);ctx.fill();
  // four fingers, slight fan, filed to points: [xOffset, angle, length, width]
  const F=[[-30,-0.15,102,14],[-10,-0.05,122,15],[12,0.05,116,15],[32,0.16,94,14]];
  for(const [dx,ang,len,wd] of F) drawClaw(ctx,cx+dx*s,cy-2*s,len*s,wd*s,ang);
  // thumb, lower-left, angled out
  drawClaw(ctx,cx-38*s,cy+42*s,78*s,15*s,-1.18);
  ctx.restore();
}
function fireGlow(ctx,fx,fy,strength,t){
  // large warm halo so silhouettes read against the dark — the fire fills the room
  const flick=0.85+0.15*Math.sin(t*13)+0.06*Math.sin(t*31), R=430*strength;
  const gg=ctx.createRadialGradient(fx,fy-40,10,fx,fy-40,R);
  gg.addColorStop(0,rgba(EMBER,0.52*strength*flick));
  gg.addColorStop(0.4,rgba('#6e2c14',0.26*strength));
  gg.addColorStop(1,'rgba(20,16,14,0)');
  ctx.fillStyle=gg;ctx.fillRect(0,0,W,H);
}

/* text helpers */
function line(ctx,txt,x,y,size,color,al,{italic=false,weight=400,font=SERIF,align='center'}={}){
  ctx.globalAlpha=al;ctx.fillStyle=color;
  ctx.font=`${italic?'italic ':''}${weight} ${size}px ${font}`;
  ctx.textAlign=align;ctx.textBaseline='middle';
  ctx.fillText(txt,x,y);ctx.globalAlpha=1;
}
function citation(ctx,txt,al){
  ctx.globalAlpha=0.62*al;ctx.fillStyle=ASH;
  ctx.font=`400 17px ${MONO}`;ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillText(txt,54,H-40);ctx.globalAlpha=1;
}
function kicker(ctx,txt,al){ // small ember label above a beat
  ctx.globalAlpha=0.9*al;ctx.fillStyle=EMBER2;
  ctx.font=`400 20px ${MONO}`;ctx.textAlign='center';ctx.textBaseline='middle';
  const tw=ctx.measureText(txt.toUpperCase()).width; // letter-spaced manually
  let x=W/2-tw/2*1.25; ctx.textAlign='left';
  for(const ch of txt.toUpperCase()){ctx.fillText(ch,x,140);x+=ctx.measureText(ch).width*1.25;}
  ctx.globalAlpha=1;
}

/* ============================================================
   SCENE A — COLD OPEN  (0 .. 67)
   ============================================================ */
function sceneColdOpen(ctx,t){
  const dusk=1-ramp(t,0,3.4);
  let g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,mix('#14100E','#3a1c10',dusk*0.9));
  g.addColorStop(0.5,mix('#0d0a08','#1a1109',dusk*0.5));
  g.addColorStop(1,'#080605');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  if(dusk>0.01){const sy=250+120*(1-dusk),r=60-30*(1-dusk);
    const sg=ctx.createRadialGradient(W*0.5,sy,4,W*0.5,sy,r*4);
    sg.addColorStop(0,`rgba(233,140,70,${0.5*dusk})`);
    sg.addColorStop(0.4,`rgba(196,69,31,${0.28*dusk})`);
    sg.addColorStop(1,'rgba(20,16,14,0)');ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);}
  const starA=ramp(t,4,10)*(1-ramp(t,34,39))*0.7;
  if(starA>0.01){for(let i=0;i<90;i++){const sx=rnd(i)*W,sy=rnd(i*3.7)*H*0.6;
    const tw=0.5+0.5*Math.sin(t*1.5+i);ctx.globalAlpha=starA*(0.3+0.6*rnd(i*1.3))*tw;
    ctx.fillStyle='#6a5f52';ctx.beginPath();ctx.arc(sx,sy,rnd(i*2.1)*1.3+0.3,0,6.2832);ctx.fill();}ctx.globalAlpha=1;}
  const fx=W*0.5,fy=H*0.76;
  const fire=ramp(t,37.2,40.6),lit=fire>0.02;
  if(lit){const glowR=60+500*fire,flick=0.85+0.15*Math.sin(t*13)+0.06*Math.sin(t*31);
    const gg=ctx.createRadialGradient(fx,fy-30*fire,10,fx,fy-30*fire,glowR);
    gg.addColorStop(0,`rgba(190,74,32,${0.55*fire*flick})`);
    gg.addColorStop(0.4,`rgba(110,44,20,${0.28*fire})`);
    gg.addColorStop(1,'rgba(20,16,14,0)');ctx.fillStyle=gg;ctx.fillRect(0,0,W,H);}
  const loneA=ramp(t,6,10)*(1-ramp(t,33,37))*0.42;
  if(loneA>0.01){ctx.globalAlpha=loneA;figure(ctx,W*0.5,H*0.73,0.85,'#0A0706');ctx.globalAlpha=1;}
  const figA=ramp(t,38.5,42);
  if(figA>0.01){ctx.globalAlpha=figA;
    figure(ctx,fx-100,fy+4,1.0,'#0A0706');figure(ctx,fx+100,fy+4,1.0,'#0A0706');
    const stand=ramp(t,43,44.6);figure(ctx,fx,fy-6-stand*12,1.05+stand*0.05,'#0A0706');ctx.globalAlpha=1;}
  if(lit)flame(ctx,fx,fy,fire,t);
  const spark=env(t,36.2,37.2,37.6,38.3);
  if(spark>0.01){ctx.fillStyle=SPARK;for(let i=0;i<30;i++){const u=rnd(i*5+7);
    ctx.globalAlpha=spark*(1-u);const sx=fx+(rnd(i)-0.5)*70,sy=fy-20-u*200*spark;
    ctx.beginPath();ctx.arc(sx,sy,(1-u)*2.2+0.4,0,6.2832);ctx.fill();}ctx.globalAlpha=1;}
  // "Half."
  const halfA=env(t,24.0,24.5,26.2,26.9);
  if(halfA>0.01)line(ctx,'Half.',W*0.5,H*0.48,150,CREAM,halfA,{weight:700});
  // "So what did you do?"
  const qA=env(t,27.0,27.6,29.2,30.0);
  if(qA>0.01)line(ctx,'So what did you do?',W*0.5,H*0.48,62,EMBER2,qA,{italic:true});
  // three claims -> two fall, one stands  (46.8 .. 66)
  if(t>=46 && t<66.5){
    const cy=H*0.30;
    const labels=['fire kept predators away','we sleep worse than they did','the fire is where stories began'];
    for(let i=0;i<3;i++){
      const ax=W*0.5+(i-1)*300, appear=ramp(t,46.8+i*0.5,47.6+i*0.5);
      if(appear<0.01)continue;
      // claims 0 and 1 die at "none" (~55.9); claim 2 (stories) stays
      const dies=(i<2)?ramp(t,55.4+i*0.3,56.6+i*0.3):0;
      const al=appear*(1-dies*0.78);
      ctx.globalAlpha=al;
      ctx.strokeStyle=(i<2)?rgba(ASH,1):rgba(GOLD,1);ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(ax,cy,7,0,6.283);
      ctx.fillStyle=(i<2)?rgba(ASH,0.25):rgba(EMBER2,0.9);ctx.fill();ctx.stroke();
      line(ctx,labels[i],ax,cy+34,20,(i<2)?ASH:CREAM,1,{italic:true,font:SERIF});
      if(dies>0.3){ // strike-through X
        ctx.globalAlpha=dies;ctx.strokeStyle=rgba(EMBER,0.9);ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(ax-13,cy-13);ctx.lineTo(ax+13,cy+13);
        ctx.moveTo(ax+13,cy-13);ctx.lineTo(ax-13,cy+13);ctx.stroke();
      }
      ctx.globalAlpha=1;
    }
    const noneA=env(t,55.6,56.2,57.0,58.0);
    if(noneA>0.01)line(ctx,'None.',W*0.5,H*0.60,72,EMBER,noneA,{weight:700});
  }
  vignette(ctx);
  if(lit){const flr=fire*(0.045+0.03*Math.sin(t*17));ctx.fillStyle=`rgba(150,60,25,${flr})`;ctx.fillRect(0,0,W,H);}
  // title-card flash going into Part One
  const ttl=env(t,65.6,66.2,67.4,68.2);
  if(ttl>0.01){ctx.fillStyle=rgba('#000000',ttl*0.86);ctx.fillRect(0,0,W,H);
    drawHand(ctx,W*0.5,H*0.44,0.6,ttl,EMBER,true);
    line(ctx,'ANCIENT FIRELIGHT',W*0.5,H*0.72,44,CREAM,ttl,{weight:400});}
}

/* ============================================================
   SCENE B — PART ONE: THE ANIMALS THAT WEREN'T THERE (67 .. 237)
   ============================================================ */
function searchBar(ctx,t){
  const bx=W*0.5-330,by=H*0.34,bw=660,bh=64;
  ctx.globalAlpha=1;ctx.strokeStyle=rgba(ASH,0.7);ctx.lineWidth=2;
  ctx.fillStyle=rgba('#100c0a',0.85);
  ctx.beginPath();ctx.roundRect(bx,by,bw,bh,10);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.arc(bx+34,by+bh/2,11,0,6.283);ctx.stroke();
  ctx.beginPath();ctx.moveTo(bx+42,by+bh/2+8);ctx.lineTo(bx+52,by+bh/2+18);ctx.stroke();
  const full='does fire keep predators away';
  const n=Math.floor(clamp((t-92)/ (96.5-92),0,1)*full.length);
  const typed=full.slice(0,n);
  line(ctx,typed+((Math.floor(t*2)%2)?'|':''),bx+66,by+bh/2,26,CREAM,1,{align:'left',font:MONO,italic:false});
  // zero results
  const zr=ramp(t,99.0,99.8);
  if(zr>0.01)line(ctx,'0 results',W*0.5,by+bh+58,40,EMBER,zr,{italic:true});
}
function moonBeat(ctx,t){
  // full moon -> darkening, attack-rate spike after
  const mx=W*0.32,my=H*0.36,mr=66;
  const phase=ramp(t,116,124); // full -> dark early
  ctx.globalAlpha=1;
  ctx.fillStyle=rgba('#d8c9a0',0.9);ctx.beginPath();ctx.arc(mx,my,mr,0,6.283);ctx.fill();
  // shadow creeps across as evening darkens early
  ctx.fillStyle=mix('#0a0807','#0a0807',1);ctx.save();
  ctx.beginPath();ctx.arc(mx,my,mr,0,6.283);ctx.clip();
  ctx.fillStyle=rgba('#0a0807',0.94);
  ctx.beginPath();ctx.arc(mx+mr*2*(phase)-mr*0.1,my,mr,0,6.283);ctx.fill();
  ctx.restore();
  line(ctx,'ten days after a full moon',mx,my+mr+40,22,ASH,ramp(t,116,118),{italic:true});
  // attack spike bars on the right
  const gx=W*0.62,gy=H*0.52,gw=300,gh=150;
  ctx.strokeStyle=rgba(ASH,0.5);ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx,gy-gh);ctx.moveTo(gx,gy);ctx.lineTo(gx+gw,gy);ctx.stroke();
  const spikeReveal=ramp(t,118.5,122.5);
  const bars=[0.18,0.22,0.9,0.75,0.6]; // baseline then spike after full moon
  for(let i=0;i<bars.length;i++){
    const h=gh*bars[i]*spikeReveal, bx=gx+18+i*54;
    ctx.fillStyle=(bars[i]>0.5)?rgba(EMBER,0.92):rgba(ASH,0.6);
    ctx.fillRect(bx,gy-h,36,h);
  }
  line(ctx,'attacks ×2–4',gx+gw*0.55,gy-gh-14,22,EMBER2,spikeReveal,{italic:true});
}
function abstractQuote(ctx,t){
  // the paper's own second sentence — highlight the damning clause
  const a=ramp(t,132.8,134.6);
  ctx.globalAlpha=1;
  const boxX=W*0.5-430,boxY=H*0.26,boxW=860;
  line(ctx,'From the paper’s own abstract:',W*0.5,boxY-6,22,ASH,a,{italic:true});
  const L1='“Nocturnal carnivores are widely believed to have';
  const L2='driven the need for the control of fire…';
  const L3='However, no empirical data are available';
  const L4='on the effects of darkness on predation in humans.”';
  line(ctx,L1,W*0.5,boxY+48,30,CREAM,a,{});
  line(ctx,L2,W*0.5,boxY+90,30,CREAM,a,{});
  const hl=ramp(t,139,141);
  // highlight the "no empirical data" clause in ember
  line(ctx,L3,W*0.5,boxY+150,34,mix(CREAM,EMBER2,hl),a,{weight:hl>0.5?700:400});
  line(ctx,L4,W*0.5,boxY+192,34,mix(CREAM,EMBER2,hl),a,{weight:hl>0.5?700:400});
  const mn=ramp(t,139.4,141.2);
  if(mn>0.01)line(ctx,'This study is about MOONLIGHT — zero fire data.',W*0.5,boxY+256,26,EMBER,mn,{italic:true});
  citation(ctx,'Packer C et al. 2011, PLoS ONE 6(7):e22285',a);
}
function citationDrift(ctx,t){
  // three papers, arrows, the hedge decaying into "a fact"
  ctx.globalAlpha=1;
  const y=H*0.42, xs=[W*0.20,W*0.50,W*0.80];
  const rev=[ramp(t,150.5,152.5),ramp(t,157,159),ramp(t,173.5,176)];
  const titles=[['Packer 2011','“nights are','dangerous” ✓'],
                ['a major review','“control of fire =','obvious possibility”'],
                ['the next paper','“protection from','predators”']];
  const cols=[ASH,GOLD,EMBER];
  for(let i=0;i<3;i++){
    if(rev[i]<0.01)continue;
    ctx.globalAlpha=rev[i];
    const px=xs[i],pw=190,ph=120;
    ctx.fillStyle=rgba('#120d0b',0.9);ctx.strokeStyle=rgba(cols[i],0.85);ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(px-pw/2,y-ph/2,pw,ph,8);ctx.fill();ctx.stroke();
    line(ctx,titles[i][0],px,y-ph/2+24,20,cols[i],1,{italic:true,font:MONO});
    line(ctx,titles[i][1],px,y+2,22,CREAM,1,{});
    line(ctx,titles[i][2],px,y+30,22,CREAM,1,{});
    if(i===2){ // little hat on the "fact"
      ctx.globalAlpha=rev[i]*ramp(t,176,177.6);
      ctx.fillStyle=rgba(EMBER2,1);
      ctx.beginPath();ctx.moveTo(px-26,y-ph/2-2);ctx.lineTo(px+26,y-ph/2-2);
      ctx.lineTo(px+16,y-ph/2-22);ctx.lineTo(px-16,y-ph/2-22);ctx.closePath();ctx.fill();
      ctx.fillRect(px-32,y-ph/2-2,64,5);
      ctx.globalAlpha=1;
    }
    ctx.globalAlpha=1;
  }
  // arrows + labels (labels sit above the boxes so they never collide)
  const ar1=ramp(t,157.5,159.5),ar2=ramp(t,171,173);
  if(ar1>0.01){arrow(ctx,xs[0]+100,y,xs[1]-100,y,ar1,GOLD);
    line(ctx,'“obvious possibility”',(xs[0]+xs[1])/2,y-84,16,GOLD,ar1,{italic:true,font:MONO});}
  if(ar2>0.01){arrow(ctx,xs[1]+100,y,xs[2]-100,y,ar2,EMBER);
    line(ctx,'…now, a fact',(xs[1]+xs[2])/2,y-84,16,EMBER,ar2,{italic:true,font:MONO});}
  const hedge=ramp(t,185.4,187.4);
  if(hedge>0.01)line(ctx,'Hedges don’t survive citation.',W*0.5,y+ph2(),30,CREAM,hedge,{italic:true});
}
function ph2(){return 150;}
function arrow(ctx,x1,y1,x2,y2,al,col){
  ctx.globalAlpha=al;ctx.strokeStyle=rgba(col,0.9);ctx.fillStyle=rgba(col,0.9);ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  const a=Math.atan2(y2-y1,x2-x1);
  ctx.beginPath();ctx.moveTo(x2,y2);
  ctx.lineTo(x2-14*Math.cos(a-0.4),y2-14*Math.sin(a-0.4));
  ctx.lineTo(x2-14*Math.cos(a+0.4),y2-14*Math.sin(a+0.4));ctx.closePath();ctx.fill();
  ctx.globalAlpha=1;
}
function hadzaFireGrid(ctx,t){
  // 436 nights; 295 ran a fire (ember), 141 did not (dark) -> 67%
  ctx.globalAlpha=1;
  const cols=28, rows=16, total=436, cell=26, gx=W*0.5-cols*cell/2+cell/2, gy=H*0.22;
  const reveal=ramp(t,196,205), litN=Math.floor(295*ramp(t,205,212));
  for(let i=0;i<total;i++){
    const c=i%cols, r=Math.floor(i/cols);
    if(ramp(t,196+ (i/total)*7,197+(i/total)*7)<0.01)continue;
    const x=gx+c*cell,y=gy+r*cell;
    const lit=i<litN;
    ctx.globalAlpha=reveal*(lit?1:0.9);
    ctx.fillStyle=lit?rgba(EMBER2,0.95):rgba(ASH,0.35);
    ctx.beginPath();ctx.arc(x,y,6,0,6.283);ctx.fill();
  }
  ctx.globalAlpha=1;
  const stat=ramp(t,207,209);
  if(stat>0.01){
    line(ctx,'295 of 436 nights',W*0.5,gy+rows*cell+34,40,CREAM,stat,{weight:700});
    line(ctx,'67% — one night in three, no fire. In lion country.',W*0.5,gy+rows*cell+78,26,EMBER2,ramp(t,209,211),{italic:true});
  }
  citation(ctx,'Samson DR et al. 2017, Am J Phys Anthropol (Hadza sleep)',reveal);
}
function eklundList(ctx,t){
  // modern anti-lion methods; fire conspicuously absent
  ctx.globalAlpha=1;
  line(ctx,'Every anti-lion method tried, 1990–2016:',W*0.5,H*0.22,28,ASH,ramp(t,224,226),{italic:true});
  const items=['Reinforced enclosures','Guard dogs','Shock collars','Flashing lights'];
  const times=[228.1,229.9,231.2,232.5];
  for(let i=0;i<items.length;i++){
    const a=ramp(t,times[i],times[i]+0.8);if(a<0.01)continue;
    const y=H*0.34+i*54;
    line(ctx,'—  '+items[i],W*0.5,y,32,CREAM,a,{align:'center'});
  }
  const fireX=ramp(t,234.3,235.6);
  if(fireX>0.01){
    const y=H*0.34+4*54;
    ctx.globalAlpha=fireX;line(ctx,'Fire',W*0.5,y,32,EMBER,1,{});
    ctx.strokeStyle=rgba(EMBER,0.95);ctx.lineWidth=3;
    const tw=140;ctx.beginPath();ctx.moveTo(W*0.5-tw/2,y);ctx.lineTo(W*0.5+tw/2,y);ctx.stroke();
    line(ctx,'not on the list',W*0.5,y+40,24,EMBER2,fireX,{italic:true});ctx.globalAlpha=1;
  }
  citation(ctx,'Eklund A et al. 2017, Sci Rep 7:2097',ramp(t,224,226));
}
function scenePredators(ctx,t){
  baseBg(ctx,t,0.18);
  kicker(ctx,'Part One · the animals that weren’t there',env(t,68,69.5,86,88));
  if(t<92)      { if(t>76&&t<86)line(ctx,'“…so we built fires to hold them off.”',W*0.5,H*0.42,34,CREAM,env(t,76.5,78,84.5,86),{italic:true}); }
  if(t>=91.5&&t<101) searchBar(ctx,t);
  if(t>=101&&t<116){ line(ctx,'A real study of lions and darkness.',W*0.5,H*0.30,32,CREAM,env(t,101.5,103,114,115.6),{});
                     citation(ctx,'>1,000 lion attacks · Tanzania · 21 years',env(t,105,107,114,115.6)); }
  if(t>=116&&t<131.5) moonBeat(ctx,t);
  if(t>=131.8&&t<146) abstractQuote(ctx,t);
  if(t>=146&&t<191) citationDrift(ctx,t);
  if(t>=191.5&&t<214) hadzaFireGrid(ctx,t);
  if(t>=214&&t<237) eklundList(ctx,t);
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   SCENE C — PART TWO: SLEEP (237 .. 386)
   ============================================================ */
function bigNumber(ctx,t,ta,tb,big,sub,col){
  const a=env(t,ta,ta+0.6,tb-0.5,tb);
  if(a<0.01)return;
  line(ctx,big,W*0.5,H*0.42,120,col||CREAM,a,{weight:700});
  if(sub)line(ctx,sub,W*0.5,H*0.42+96,28,ASH,a,{italic:true});
}
function insomniaBars(ctx,t){
  ctx.globalAlpha=1;
  const a=ramp(t,290,292);
  const gx=W*0.5-260,gy=H*0.62,gw=520,barMax=170;
  line(ctx,'Chronic insomnia',W*0.5,H*0.24,30,ASH,a,{italic:true});
  // industrial 10-30% vs forager 1.5-2.5%
  const ind=ramp(t,291,293)*0.7, forg=ramp(t,296,298)*0.06;
  const b1x=W*0.36,b2x=W*0.62,bw=120;
  ctx.fillStyle=rgba(EMBER,0.85);ctx.fillRect(b1x-bw/2,gy-barMax*ind,bw,barMax*ind);
  ctx.fillStyle=rgba(GOLD,0.9);ctx.fillRect(b2x-bw/2,gy-barMax*forg,bw,barMax*forg);
  ctx.strokeStyle=rgba(ASH,0.5);ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx+gw,gy);ctx.stroke();
  line(ctx,'industrial',b1x,gy+26,22,ASH,a,{});line(ctx,'10–30%',b1x,gy-barMax*ind-20,26,EMBER2,ind>0.1?1:0,{weight:700});
  line(ctx,'these groups',b2x,gy+26,22,ASH,a,{});line(ctx,'1.5–2.5%',b2x,gy-30,26,GOLD,forg>0.01?1:0,{weight:700});
  const noword=ramp(t,300.9,303);
  if(noword>0.01)line(ctx,'Two of their languages have no word for it.',W*0.5,H*0.80,26,CREAM,noword,{italic:true});
}
function conclusionQuote(ctx,t){
  const a=env(t,330.6,332,347,349);
  if(a<0.01)return;
  line(ctx,'The researchers’ own conclusion:',W*0.5,H*0.30,24,ASH,a,{italic:true});
  line(ctx,'“Sleep in industrial societies has not been',W*0.5,H*0.44,32,CREAM,a,{});
  line(ctx,'reduced below a level normal for most of',W*0.5,H*0.44+44,32,CREAM,a,{});
  line(ctx,'our species’ evolutionary history.”',W*0.5,H*0.44+88,32,CREAM,a,{});
  citation(ctx,'Yetish G et al. 2015, Current Biology 25(21):2862',a);
}
function twoClocks(ctx,t){
  ctx.globalAlpha=1;
  const a=ramp(t,366,368);
  const draw=(cx,label,split,rev)=>{
    const cy=H*0.44,r=96;
    ctx.strokeStyle=rgba(ASH,0.7);ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(cx,cy,r,0,6.283);ctx.stroke();
    // sleep arc(s) in ember
    ctx.strokeStyle=rgba(EMBER2,0.95);ctx.lineWidth=12;
    if(!split){ctx.beginPath();ctx.arc(cx,cy,r-8,Math.PI*0.55,Math.PI*1.45);ctx.stroke();}
    else{ctx.beginPath();ctx.arc(cx,cy,r-8,Math.PI*0.55,Math.PI*0.95);ctx.stroke();
         ctx.beginPath();ctx.arc(cx,cy,r-8,Math.PI*1.05,Math.PI*1.45);ctx.stroke();}
    line(ctx,label,cx,cy+r+40,26,CREAM,rev,{});
    line(ctx,split?'14h night → you split':'12h night → you sleep once',cx,cy+r+72,20,ASH,rev,{italic:true});
  };
  draw(W*0.30,'Equator',false,a);
  draw(W*0.70,'Europe (winter)',true,ramp(t,372,374));
  line(ctx,'Not a lost birthright. Just how much dark you were handed.',W*0.5,H*0.80,26,EMBER2,ramp(t,378,380),{italic:true});
  citation(ctx,'Ekirch 2001/2005 · Samson et al. 2017, Am J Hum Biol 29(4)',a);
}
function sceneSleep(ctx,t){
  baseBg(ctx,t,0.20);
  kicker(ctx,'Part Two · you are not tired because of electricity',env(t,238,240,256,258));
  if(t>=237&&t<253) line(ctx,'“Our ancestors slept long, deep, and whole —',W*0.5,H*0.40,30,CREAM,env(t,240,242,251,253),{italic:true}),
                     (t>246)&&line(ctx,'then the light bulb ruined us.”',W*0.5,H*0.40+42,30,CREAM,env(t,246,247.5,251,253),{italic:true});
  if(t>=253&&t<265){ line(ctx,'Hadza · San · Tsimané',W*0.5,H*0.34,34,CREAM,env(t,255,257,263,265),{});
                     line(ctx,'94 people · 1,165 nights',W*0.5,H*0.34+50,28,ASH,env(t,261,262.5,263.5,265),{italic:true}); }
  if(t>=265&&t<277) bigNumber(ctx,t,265.3,277,'5.7–7.1 h','...the amount of sleep you feel guilty about.',CREAM);
  if(t>=277&&t<284) line(ctx,'They wake in the night too — ~80 min.',W*0.5,H*0.44,34,CREAM,env(t,278,279.5,283,284.5),{italic:true});
  if(t>=284&&t<306) insomniaBars(ctx,t);
  if(t>=306&&t<314) line(ctx,'It isn’t that they sleep more.',W*0.5,H*0.40,36,CREAM,env(t,306.5,308,312.5,314),{}),
                     (t>309)&&line(ctx,'It’s that sleep isn’t a problem.',W*0.5,H*0.40+48,36,EMBER2,env(t,309.5,311,312.5,314),{italic:true});
  if(t>=314&&t<330) line(ctx,'Nobody there lies awake at 3 a.m.',W*0.5,H*0.38,32,CREAM,env(t,314.5,316,328,330),{}),
                     (t>318)&&line(ctx,'counting the hours before the alarm —',W*0.5,H*0.38+44,32,CREAM,env(t,318,319.5,328,330),{}),
                     (t>322)&&line(ctx,'the single most modern act there is.',W*0.5,H*0.38+88,32,ASH,env(t,322,323.5,328,330),{italic:true});
  if(t>=330&&t<349) conclusionQuote(ctx,t);
  if(t>=349&&t<366){ line(ctx,'“First sleep… wake an hour… second sleep.”',W*0.5,H*0.32,30,CREAM,env(t,349.5,351,364,366),{italic:true});
                     (t>355)&&line(ctx,'Real history (Ekirch). Equator doesn’t. Madagascar does.',W*0.5,H*0.32+48,26,ASH,env(t,355,356.5,364,366),{}); }
  if(t>=366&&t<386) twoClocks(ctx,t);
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   SCENE D — PART THREE: WHAT'S ACTUALLY THERE (386 .. 489)
   ============================================================ */
function talkBars(ctx,t){
  ctx.globalAlpha=1;
  // categories with day% and night%
  const cats=[{n:'Complaints',d:34,ni:7},{n:'Economics',d:31,ni:4},{n:'Jokes',d:16,ni:6},{n:'Stories',d:6,ni:81}];
  const gx=W*0.5-330,base=H*0.72,bw=110,gap=60,maxH=300;
  const dayPh=ramp(t,420,443);          // grow day bars (ash)
  const flip=ramp(t,449,454);            // morph to night (ember)
  for(let i=0;i<cats.length;i++){
    const c=cats[i], x=gx+i*(bw+gap);
    const pctDay=c.d*dayPh, pct=c.d+(c.ni-c.d)*flip;
    const val=(flip>0.01)?pct:pctDay;
    const h=maxH*(val/100)* (flip>0.01?1:1);
    const isStar=(c.n==='Stories');
    const col=(flip>0.5)?(isStar?EMBER2:rgba(ASH,0.5)):ASH;
    ctx.fillStyle=(flip>0.5&&isStar)?rgba(EMBER2,0.95):rgba(ASH,0.65);
    if(flip>0.5&&isStar)ctx.fillStyle=rgba(EMBER2,0.95);
    else if(flip>0.5)ctx.fillStyle=rgba(ASH,0.4);
    else ctx.fillStyle=rgba(ASH,0.65);
    ctx.fillRect(x,base-h,bw,h);
    line(ctx,c.n,x+bw/2,base+26,22,ASH,Math.max(dayPh,0.2),{});
    const showVal=Math.round(val);
    if(dayPh>0.3||flip>0.01)line(ctx,showVal+'%',x+bw/2,base-h-22,28,(flip>0.5&&isStar)?EMBER2:CREAM,Math.max(dayPh,flip),{weight:700});
  }
  line(ctx,(flip>0.5)?'NIGHT':'DAY',W*0.5,H*0.20,40,(flip>0.5)?EMBER2:ASH,Math.max(dayPh,flip),{weight:700});
  citation(ctx,'Wiessner PW 2014, PNAS 111(39):14027 · 174 conversations',Math.max(dayPh,flip));
}
function sceneStories(ctx,t){
  baseBg(ctx,t,0.20);
  kicker(ctx,'Part Three · what’s actually there',env(t,387,389,406,408));
  if(t>=386&&t<392) line(ctx,'The third claim: the stories.',W*0.5,H*0.40,38,CREAM,env(t,387,388.5,391,392.5),{}),
                     (t>389)&&line(ctx,'This one is real. And measured.',W*0.5,H*0.40+50,30,EMBER2,env(t,389.5,391,391,392.5),{italic:true});
  if(t>=392&&t<419){ line(ctx,'1974 — Polly Wiessner, the Ju/’hoansi, Botswana.',W*0.5,H*0.36,32,CREAM,env(t,393,395,417,419),{});
                     (t>405)&&line(ctx,'She wrote down what people talked about — day, and night.',W*0.5,H*0.36+46,26,ASH,env(t,406,408,417,419),{italic:true}); }
  if(t>=419&&t<456) talkBars(ctx,t);
  if(t>=456&&t<465){ line(ctx,'Same people. Same day. Same mouths.',W*0.5,H*0.40,36,CREAM,env(t,457,458.5,463,465),{});
                     (t>461)&&line(ctx,'They stop being colleagues and start being a culture.',W*0.5,H*0.40+50,28,EMBER2,env(t,461,462.5,463.5,465),{italic:true}); }
  if(t>=465&&t<489){ line(ctx,'Honestly — before anyone screams in the comments:',W*0.5,H*0.28,26,ASH,env(t,466,468,487,489),{italic:true});
                     (t>470)&&line(ctx,'The 81% is the long, big-group conversations.',W*0.5,H*0.40,28,CREAM,env(t,470,471.5,487,489),{});
                     (t>477)&&line(ctx,'Her fieldwork ran through a dry, hungry stretch.',W*0.5,H*0.40+44,28,CREAM,env(t,477,478.5,487,489),{});
                     (t>483)&&line(ctx,'She lists seven limitations. She flagged them.',W*0.5,H*0.40+88,28,GOLD,env(t,483,484.5,487,489),{italic:true}); }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   SCENE E — PAYLOAD: THE NIGHT WATCH NOBODY POSTED (489 .. 582)
   ============================================================ */
function nightBand(ctx,t){
  // 20 nights as a long band; someone awake 99.8% (ember); 18 dark slivers
  ctx.globalAlpha=1;
  const bx=W*0.12,bw=W*0.76,by=H*0.42,bh=90;
  const rev=ramp(t,502,510);
  ctx.fillStyle=rgba(EMBER2,0.85*rev);ctx.fillRect(bx,by,bw*ramp(t,502,509),bh);
  // 18 tiny dark slivers scattered
  const sliv=ramp(t,510,514);
  if(sliv>0.01){ctx.fillStyle=rgba('#0a0807',0.95*sliv);
    for(let i=0;i<18;i++){const sx=bx+8+rnd(i*3.3)*(bw-16);ctx.fillRect(sx,by,3,bh);}}
  line(ctx,'20 nights →',bx-4,by-24,22,ASH,rev,{align:'left',italic:true});
  const stat=ramp(t,512,514.5);
  if(stat>0.01){
    line(ctx,'18 minutes',W*0.5,by+bh+56,64,CREAM,stat,{weight:700});
    line(ctx,'…was the total time everyone was asleep at once.',W*0.5,by+bh+104,26,ASH,ramp(t,514,516),{italic:true});
  }
  const awake=ramp(t,517.5,519.5);
  if(awake>0.01)line(ctx,'Someone awake 99.8% of the time. Usually ~8 people.',W*0.5,H*0.20,28,EMBER2,awake,{italic:true});
  citation(ctx,'Samson DR et al. 2017, Proc R Soc B 284:20170967',rev);
}
function nightWatchGroup(ctx,t){
  // the group around the fire; most lying/sitting, the oldest upright, awake
  const fx=W*0.5,fy=H*0.70,rev=ramp(t,537,540),C='#0A0706';
  fireGlow(ctx,fx,fy,0.95,t);
  ctx.globalAlpha=rev;
  figureLying(ctx,fx-290,fy+38,0.9,C);
  figureLying(ctx,fx+285,fy+34,0.9,C);
  figure(ctx,fx+140,fy+12,0.85,C);              // young, slumped
  figure(ctx,fx+220,fy+16,0.8,C);
  figureLying(ctx,fx-165,fy+40,0.8,C);
  // the oldest — upright, awake, doing nothing (highlighted rim), left of the fire
  const gm=ramp(t,545,548), gxx=fx-125;
  ctx.globalAlpha=1;figure(ctx,gxx,fy+4,1.06,C);
  if(gm>0.01){ctx.globalAlpha=gm*0.6;ctx.strokeStyle=rgba(GOLD,0.85);ctx.lineWidth=2.5;
    ctx.beginPath();ctx.arc(gxx,fy+4-102,25,0,6.283);ctx.stroke();ctx.globalAlpha=1;}
  flame(ctx,fx,fy,0.95+0.08*Math.sin(t*2),t);
  const cap=ramp(t,551.5,553.5);
  if(cap>0.01){line(ctx,'Your grandmother isn’t a bad sleeper.',W*0.5,H*0.20,30,CREAM,cap,{});
    line(ctx,'She’s the night watch.',W*0.5,H*0.20+46,36,GOLD,ramp(t,553,555),{italic:true,weight:700});}
}
function scenePayload(ctx,t){
  baseBg(ctx,t,0.30);
  kicker(ctx,'The night watch nobody posted',env(t,490,492,502,504));
  if(t>=489&&t<502) line(ctx,'The fact that stopped me cold.',W*0.5,H*0.34,36,CREAM,env(t,490,491.5,500,502),{}),
                     (t>495)&&line(ctx,'33 people · 20 nights: how often is everyone asleep at once?',W*0.5,H*0.34+50,26,ASH,env(t,496,498,500,502),{italic:true});
  if(t>=502&&t<527) nightBand(ctx,t);
  if(t>=527&&t<537){ line(ctx,'Nobody organised it. No rota. No watch.',W*0.5,H*0.40,34,CREAM,env(t,527.5,529,535,537),{});
                     (t>531)&&line(ctx,'It happens because chronotype drifts with age.',W*0.5,H*0.40+46,28,EMBER2,env(t,531.5,533,535,537),{italic:true}); }
  if(t>=537&&t<556) nightWatchGroup(ctx,t);
  if(t>=556&&t<582){ line(ctx,'This is the shape of the whole channel.',W*0.5,H*0.30,34,CREAM,env(t,557,559,580,582),{});
                     (t>562)&&line(ctx,'No plan. No chief. No meeting.',W*0.5,H*0.30+48,30,ASH,env(t,562,563.5,580,582),{italic:true});
                     (t>570)&&line(ctx,'Ordinary bodies, slightly different clocks —',W*0.5,H*0.30+94,28,CREAM,env(t,570,571.5,580,582),{});
                     (t>574)&&line(ctx,'a solution better than one you’d have engineered.',W*0.5,H*0.30+134,28,GOLD,env(t,574,575.5,580,582),{italic:true}); }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   SCENE F — CLOSE (582 .. 695)
   ============================================================ */
function sceneClose(ctx,t){
  // return to the fire; let it shrink to one ember at the very end
  const shrink=ramp(t,681,692);
  baseBg(ctx,t,0.28*(1-shrink*0.7));
  const fx=W*0.5,fy=H*0.74,C='#0A0706';
  const fscale=(0.95-0.82*shrink);
  if(fscale>0.06)fireGlow(ctx,fx,fy,(1-shrink*0.8)*0.88,t);
  // silhouetted group, wide; one figure stands and begins to talk (~660)
  const grpA=ramp(t,584,588)*(1-ramp(t,676,682));
  if(grpA>0.01){ctx.globalAlpha=grpA;
    figureLying(ctx,fx-320,fy+34,0.85,C);figureLying(ctx,fx+320,fy+30,0.85,C);
    figure(ctx,fx-185,fy+12,0.8,C);figure(ctx,fx+180,fy+12,0.8,C);
    const stand=ramp(t,660,664);
    figure(ctx,fx-150,fy+10-stand*22,0.82+stand*0.1,C);ctx.globalAlpha=1;}
  if(fscale>0.06)flame(ctx,fx,fy,fscale+0.07*Math.sin(t*2.3),t);

  if(t>=582&&t<592) line(ctx,'So — what did ancient humans do at night?',W*0.5,H*0.22,34,CREAM,env(t,583,585,590,592),{italic:true});
  if(t>=592&&t<605) line(ctx,'What they did was talk.',W*0.5,H*0.24,40,CREAM,env(t,593,594.5,603,605),{weight:700}),
                     (t>598)&&line(ctx,'Somebody bothered to count. One place. 52 nights. 1974.',W*0.5,H*0.24+50,24,ASH,env(t,599,600.5,603,605),{italic:true});
  if(t>=605&&t<621){ line(ctx,'“Data from modern foragers cannot be',W*0.5,H*0.22,30,CREAM,env(t,606,608,619,621),{italic:true});
                     line(ctx,'projected back into the past.”  — Wiessner',W*0.5,H*0.22+42,30,CREAM,env(t,606,608,619,621),{italic:true}); }
  if(t>=621&&t<637) line(ctx,'I won’t tell you this is where the mind was born.',W*0.5,H*0.20,30,CREAM,env(t,622,623.5,635,637),{}),
                     (t>630)&&line(ctx,'But I’ll tell you what the night is. Not theory — geometry.',W*0.5,H*0.20+44,26,EMBER2,env(t,630,631.5,635,637),{italic:true});
  if(t>=637&&t<660) line(ctx,'The only stretch of the day you cannot work.',W*0.5,H*0.20,30,CREAM,env(t,638,639.5,658,660),{}),
                     (t>646)&&line(ctx,'The only time you’re no use to anybody.',W*0.5,H*0.20+44,30,CREAM,env(t,647,648.5,658,660),{italic:true});
  if(t>=660&&t<669){ line(ctx,'6%',W*0.38,H*0.36,80,ASH,env(t,661,662.5,667,669),{weight:700});
                     line(ctx,'→',W*0.5,H*0.36,60,CREAM,env(t,662,663.5,667,669),{});
                     line(ctx,'81%',W*0.62,H*0.36,80,EMBER2,env(t,662,663.5,667,669),{weight:700});
                     line(ctx,'you stop dealing with each other and start telling each other.',W*0.5,H*0.50,26,CREAM,env(t,663,664.5,667,669),{italic:true}); }
  if(t>=669&&t<676) line(ctx,'Two hundred thousand years of that.',W*0.5,H*0.32,38,CREAM,env(t,669.8,671,675,676.5),{italic:true,weight:700});
  if(t>=676&&t<688){ line(ctx,'Softer, stranger, more honest at 11 at night.',W*0.5,H*0.34,32,CREAM,env(t,677,678.5,686,688),{italic:true});
                     (t>681)&&line(ctx,'That’s not a modern problem. It’s the oldest room we have.',W*0.5,H*0.34+46,28,GOLD,env(t,681,682.5,686,688),{}); }

  vignette(ctx);
  if(t>=676)grain(ctx,t);

  // EP02 teaser over near-black
  const teaseBg=ramp(t,687.4,689.5);
  if(teaseBg>0.01){ctx.fillStyle=rgba('#000000',teaseBg*0.9);ctx.fillRect(0,0,W,H);}
  const hand=ramp(t,688.5,691);
  if(hand>0.01){drawHand(ctx,W*0.5,H*0.42,0.62,hand,EMBER,true);
    line(ctx,'NEXT — the hand pressed 67,800 years ago',W*0.5,H*0.70,30,CREAM,hand,{});
    line(ctx,'ancientfirelight.com',W*0.5,H*0.70+42,24,ASH,ramp(t,690,692),{font:MONO,italic:false});}
}

/* ============================================================
   MASTER TIMELINE
   ============================================================ */
const BOUNDS=[67,237,386,489,582];
function render(ctx,t){
  ctx.clearRect(0,0,W,H);
  if(t<67)            sceneColdOpen(ctx,t);
  else if(t<237)      scenePredators(ctx,t);
  else if(t<386)      sceneSleep(ctx,t);
  else if(t<489)      sceneStories(ctx,t);
  else if(t<582)      scenePayload(ctx,t);
  else                sceneClose(ctx,t);
  chapterBlink(ctx,t,BOUNDS);
}

/* ---- host wiring (1080p output) ---- */
window.__c=document.getElementById('c');
window.__x=window.__c.getContext('2d');
const DPR=window.__c.width/W; // 1920/1280 = 1.5
window.frame=function(t){
  const x=window.__x;
  x.setTransform(DPR,0,0,DPR,0,0);
  render(x,t);
  return null; // frames captured via page.screenshot, not toDataURL
};
window.frameURL=function(t){window.frame(t);return window.__c.toDataURL('image/png');};
// signal readiness only once the book typeface is available
window.ready=false;
(function(){
  const go=()=>{window.ready=true;};
  if(document.fonts&&document.fonts.load){
    Promise.all([document.fonts.load('700 100px EBG'),document.fonts.load('italic 400 40px EBG')])
      .then(go).catch(go);
    setTimeout(go,3000);
  } else go();
})();
