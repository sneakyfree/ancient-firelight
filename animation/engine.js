/* Ancient Firelight — SHARED RENDER ENGINE
   Extracted verbatim from the approved EP01 (anim_full.js) so every episode shares
   one hardened core: palette, easing, painterly atmosphere, fire, figures, text,
   the Chauvet ghost compositor, and the 1080p host wiring.

   An episode file loaded AFTER this one defines:
     window.EPISODE = {
       duration : <seconds>,              // narration master length
       bounds   : [t1,t2,...],            // scene-boundary times (chapterBlink dip-to-dark)
       ghostNames : ['lions','bear',...], // PNG basenames in ./ghosts_glow/ to preload
       render   : function(ctx,t){ ... }  // draws the whole episode at time t
     }
   Coordinate space is logical 1280x720; frame() scales to 1920x1080 for 1080p output. */

const W=1280,H=720;
// palette — ember warmth sits against real cold, so the fire reads as fire
const SOOT='#14100E',EMBER='#C4451F',EMBER2='#E0602F',CREAM='#F7F1E8',SPARK='#F0904A',ASH='#8A7E6E',GOLD='#F0B45C';
const NIGHT='#0E1620',NIGHT2='#1B2C3A',MOON='#A8BECD',COOL='#5A7C93';
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
  // warm 0..1 = how "at the fire" we are; low warm = cold night / investigation mode
  let g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,mix(NIGHT,'#23150C',warm*0.55));
  g.addColorStop(0.55,mix('#0B1219','#150D07',warm*0.5));
  g.addColorStop(1,mix('#070A0E','#0C0705',warm*0.6));
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // painterly swirl: cold strokes up high, warm strokes down low
  strokes(ctx,t,120,[NIGHT2,COOL,'#132030'],0.14+0.04*warm,0,H*0.74,1.0);
  strokes(ctx,t,55,['#3A1E12',EMBER,'#5A2A15'],0.09+0.17*warm,H*0.44,H,1.3);
  // low ember glow at the bottom edge — the fire is always in the room, even off-screen
  const gy=H+30, glowR=260+120*warm+30*Math.sin(t*3.1);
  const eg=ctx.createRadialGradient(W*0.5,gy,10,W*0.5,gy,glowR);
  const flick=0.85+0.15*Math.sin(t*13)+0.05*Math.sin(t*31);
  eg.addColorStop(0,rgba(EMBER,(0.13+0.32*warm)*flick));
  eg.addColorStop(0.5,rgba('#6e2c14',(0.06+0.15*warm)));
  eg.addColorStop(1,'rgba(20,16,14,0)');
  ctx.fillStyle=eg;ctx.fillRect(0,0,W,H);
  emberDrift(ctx,t,34,0.45+0.45*warm);
}
function vignette(ctx){
  const v=ctx.createRadialGradient(W/2,H/2,H*0.40,W/2,H/2,H*0.95);
  v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,0.40)');
  ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
}
function grain(ctx,t){
  const f=0.010+0.008*Math.sin(t*17)+0.006*Math.sin(t*7.3);
  ctx.fillStyle=rgba('#8a3a1a',f);ctx.fillRect(0,0,W,H);
}
function watermark(ctx,al){
  ctx.save();ctx.globalAlpha=0.20*al;
  drawHand(ctx,W-70,H-58,0.22,1,EMBER2,false);
  ctx.restore();
}
/* GHOST layer — real Chauvet cave art (re-rendered to ember glow, on transparent) surfacing
   faintly behind the firelight, keyed to the words. This is the "mystical background" pass. */
const GHOSTS={};
let _gc,_gx;
function ghost(ctx,name,t,a,seed){
  const img=GHOSTS[name];
  if(!img||!img.complete||!img.naturalWidth||a<=0.004)return;
  const iw=img.naturalWidth,ih=img.naturalHeight;
  if(!_gc){_gc=document.createElement('canvas');_gc.width=W;_gc.height=H;_gx=_gc.getContext('2d');}
  _gx.setTransform(1,0,0,1,0,0);_gx.clearRect(0,0,W,H);
  // COVER-fit (fills frame, no rectangular edges); the radial iris keeps it a centred apparition
  const zoom=1.02+0.03*Math.sin(t*0.04+seed);
  const s=Math.max(W/iw,H/ih)*zoom, dw=iw*s, dh=ih*s;
  const px=(W-dw)/2+Math.sin(t*0.03+seed)*22, py=(H-dh)/2+Math.cos(t*0.025+seed*1.7)*14;
  _gx.drawImage(img,px,py,dw,dh);
  // radial iris: strong in the centre, dissolves at the edges -> apparition, not wallpaper
  _gx.globalCompositeOperation='destination-in';
  const rg=_gx.createRadialGradient(W/2,H*0.48,H*0.10,W/2,H*0.48,H*0.70);
  rg.addColorStop(0,'rgba(0,0,0,1)');rg.addColorStop(0.7,'rgba(0,0,0,0.75)');rg.addColorStop(1,'rgba(0,0,0,0)');
  _gx.fillStyle=rg;_gx.fillRect(0,0,W,H);
  _gx.globalCompositeOperation='source-over';
  ctx.save();ctx.globalAlpha=a;ctx.globalCompositeOperation='screen';
  ctx.drawImage(_gc,0,0);
  ctx.restore();ctx.globalAlpha=1;
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
  const dx=Math.sin(ang), dy=-Math.cos(ang), px=-dy, py=dx;
  const tx=bx+dx*len, ty=by+dy*len;
  ctx.beginPath();ctx.arc(bx,by,wd,0,6.283);ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bx-px*wd,by-py*wd);ctx.lineTo(bx+px*wd,by+py*wd);ctx.lineTo(tx,ty);
  ctx.closePath();ctx.fill();
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
  ctx.beginPath();ctx.roundRect(cx-40*s,cy-4*s,80*s,80*s,[26*s,26*s,30*s,30*s]);ctx.fill();
  ctx.beginPath();ctx.roundRect(cx-24*s,cy+60*s,48*s,34*s,10*s);ctx.fill();
  const F=[[-30,-0.15,102,14],[-10,-0.05,122,15],[12,0.05,116,15],[32,0.16,94,14]];
  for(const [dx,ang,len,wd] of F) drawClaw(ctx,cx+dx*s,cy-2*s,len*s,wd*s,ang);
  drawClaw(ctx,cx-38*s,cy+42*s,78*s,15*s,-1.18);
  ctx.restore();
}
function fireGlow(ctx,fx,fy,strength,t){
  const flick=0.85+0.15*Math.sin(t*13)+0.06*Math.sin(t*31), R=430*strength;
  const gg=ctx.createRadialGradient(fx,fy-40,10,fx,fy-40,R);
  gg.addColorStop(0,rgba(EMBER,0.52*strength*flick));
  gg.addColorStop(0.4,rgba('#6e2c14',0.26*strength));
  gg.addColorStop(1,'rgba(20,16,14,0)');
  ctx.fillStyle=gg;ctx.fillRect(0,0,W,H);
}

/* text — every line gets a dark halo so it stays legible over ANY background. */
function line(ctx,txt,x,y,size,color,al,{italic=false,weight=400,font=SERIF,align='center'}={}){
  ctx.save();
  ctx.globalAlpha=al;
  ctx.font=`${italic?'italic ':''}${weight} ${size}px ${font}`;
  ctx.textAlign=align;ctx.textBaseline='middle';
  ctx.fillStyle=color;
  ctx.shadowColor='rgba(0,0,0,0.92)';ctx.shadowBlur=Math.max(14,size*0.42);ctx.shadowOffsetY=1;
  ctx.fillText(txt,x,y);
  ctx.shadowBlur=Math.max(5,size*0.14);
  ctx.fillText(txt,x,y);
  ctx.shadowColor='transparent';ctx.shadowBlur=0;
  ctx.fillText(txt,x,y);
  ctx.restore();ctx.globalAlpha=1;
}
/* Van Gogh pass — swirling directional strokes that give the frame texture and motion. */
function strokes(ctx,t,count,cols,alpha,yTop,yBot,flow){
  ctx.save();ctx.lineCap='round';
  const span=yBot-yTop;
  for(let i=0;i<count;i++){
    const bx=rnd(i*1.7)*W*1.1-W*0.05, by=yTop+rnd(i*3.1)*span;
    const sw=(flow||1);
    const fx=bx+Math.sin(by*0.011+t*0.22+i)*26*sw;
    const fy=by+Math.cos(bx*0.009+t*0.17)*15*sw;
    const ang=Math.sin(fx*0.0055+fy*0.0042+t*0.13)*2.4;
    const len=13+rnd(i*5.3)*28, wd=1.6+rnd(i*7.1)*2.8;
    ctx.strokeStyle=rgba(cols[i%cols.length],alpha*(0.18+0.62*rnd(i*2.9)));
    ctx.lineWidth=wd;
    const mx=fx+Math.cos(ang)*len*0.5-Math.sin(ang)*9, my=fy+Math.sin(ang)*len*0.5+Math.cos(ang)*9;
    ctx.beginPath();ctx.moveTo(fx,fy);
    ctx.quadraticCurveTo(mx,my,fx+Math.cos(ang)*len,fy+Math.sin(ang)*len);
    ctx.stroke();
  }
  ctx.restore();
}
/* drifting embers — persistent life in the air so no frame is ever bare */
function emberDrift(ctx,t,count,alpha,fx,fy){
  ctx.save();
  for(let i=0;i<count;i++){
    const seed=i*3.77, cyc=(t*0.055+rnd(seed))%1;
    const x=(fx!==undefined?fx:W*0.5)+(rnd(seed*1.3)-0.5)*(fx!==undefined?520:W*1.05)+Math.sin(t*0.5+i)*22;
    const y=(fy!==undefined?fy:H)-cyc*(H*0.92);
    const a=alpha*(1-cyc)*(0.35+0.65*rnd(seed*2.1))*(0.6+0.4*Math.sin(t*3+i));
    if(a<=0.01)continue;
    ctx.globalAlpha=a;ctx.fillStyle=(i%4===0)?GOLD:SPARK;
    ctx.beginPath();ctx.arc(x,y,(1-cyc)*2.3*rnd(seed*4.1)+0.5,0,6.283);ctx.fill();
  }
  ctx.restore();ctx.globalAlpha=1;
}
/* soft smoke columns rising off the fire */
function smoke(ctx,t,fx,fy,scale,alpha){
  ctx.save();
  for(let i=0;i<26;i++){
    const seed=i*2.61, cyc=(t*0.07+rnd(seed))%1;
    const y=fy-60*scale-cyc*430*scale;
    const x=fx+Math.sin(cyc*3.4+i*0.7+t*0.3)*(52+cyc*120)*scale;
    const r=(20+cyc*95)*scale;
    const a=alpha*(1-cyc)*0.16;
    if(a<=0.005)continue;
    const g=ctx.createRadialGradient(x,y,1,x,y,r);
    g.addColorStop(0,rgba('#6b5c50',a));
    g.addColorStop(1,'rgba(80,70,62,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();
  }
  ctx.restore();
}
/* crude glyph icons (channel's stick-vocabulary) */
function glyph(ctx,kind,x,y,s,al,col){
  ctx.save();ctx.globalAlpha=al;ctx.strokeStyle=col;ctx.fillStyle=col;
  ctx.lineWidth=3.2*s;ctx.lineCap='round';ctx.lineJoin='round';
  if(kind==='work'){ ctx.beginPath();ctx.moveTo(x-16*s,y+18*s);ctx.lineTo(x+10*s,y-14*s);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+2*s,y-20*s);ctx.lineTo(x+20*s,y-6*s);ctx.stroke(); }
  else if(kind==='forage'){ ctx.beginPath();ctx.moveTo(x,y+20*s);ctx.quadraticCurveTo(x,y-4*s,x-2*s,y-16*s);ctx.stroke();
    for(const[dx,dy] of [[-12,-6],[12,-10],[-9,4]]){ctx.beginPath();ctx.arc(x+dx*s,y+dy*s,5*s,0,6.283);ctx.fill();} }
  else if(kind==='hunt'){ ctx.beginPath();ctx.moveTo(x-14*s,y+20*s);ctx.lineTo(x+12*s,y-18*s);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+12*s,y-20*s);ctx.lineTo(x+5*s,y-8*s);ctx.lineTo(x+17*s,y-9*s);ctx.closePath();ctx.fill(); }
  else if(kind==='dig'){ ctx.beginPath();ctx.moveTo(x-6*s,y-20*s);ctx.lineTo(x+2*s,y+8*s);ctx.stroke();
    ctx.beginPath();ctx.ellipse(x,y+18*s,20*s,7*s,0,0,6.283);ctx.fill(); }
  else if(kind==='walk'){ for(let i=0;i<3;i++){const px=x-16*s+i*16*s, py=y+12*s-i*11*s;
      ctx.beginPath();ctx.ellipse(px,py,5*s,8*s,0.3,0,6.283);ctx.fill();} }
  else if(kind==='hand'){ drawHand(ctx,x,y-14*s,0.20*s,al,col,false); }
  ctx.restore();ctx.globalAlpha=1;
}
function citation(ctx,txt,al){
  ctx.globalAlpha=0.82*al;ctx.fillStyle=ASH;
  ctx.font=`400 18px ${MONO}`;ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillText(txt,54,H-40);ctx.globalAlpha=1;
}
function kicker(ctx,txt,al){ // small ember label above a beat
  ctx.globalAlpha=0.9*al;ctx.fillStyle=EMBER2;
  ctx.font=`400 20px ${MONO}`;ctx.textAlign='center';ctx.textBaseline='middle';
  const tw=ctx.measureText(txt.toUpperCase()).width;
  let x=W/2-tw/2*1.25; ctx.textAlign='left';
  for(const ch of txt.toUpperCase()){ctx.fillText(ch,x,140);x+=ctx.measureText(ch).width*1.25;}
  ctx.globalAlpha=1;
}
function arrow(ctx,x1,y1,x2,y2,al,col){
  ctx.globalAlpha=al;ctx.strokeStyle=rgba(col,0.9);ctx.fillStyle=rgba(col,0.9);ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  const a=Math.atan2(y2-y1,x2-x1);
  ctx.beginPath();ctx.moveTo(x2,y2);
  ctx.lineTo(x2-14*Math.cos(a-0.4),y2-14*Math.sin(a-0.4));
  ctx.lineTo(x2-14*Math.cos(a+0.4),y2-14*Math.sin(a+0.4));ctx.closePath();ctx.fill();
  ctx.globalAlpha=1;
}
/* big centred number with subtitle (generic payload beat) */
function bigNumber(ctx,t,ta,tb,big,sub,col){
  const a=env(t,ta,ta+0.6,tb-0.5,tb);
  if(a<0.01)return;
  line(ctx,big,W*0.5,H*0.42,120,col||CREAM,a,{weight:700});
  if(sub)line(ctx,sub,W*0.5,H*0.42+96,28,ASH,a,{italic:true});
}

/* ---- host wiring (1080p output) — reads window.EPISODE ---- */
window.__c=document.getElementById('c');
window.__x=window.__c.getContext('2d');
const DPR=window.__c.width/W; // 1920/1280 = 1.5
window.frame=function(t){
  const x=window.__x;
  x.setTransform(DPR,0,0,DPR,0,0);
  x.clearRect(0,0,W,H);
  const EP=window.EPISODE;
  EP.render(x,t);
  chapterBlink(x,t,EP.bounds||[]);
  return null; // frames captured via page.screenshot, not toDataURL
};
window.frameURL=function(t){window.frame(t);return window.__c.toDataURL('image/png');};
// signal readiness only once the typeface AND the episode's ghost images are available.
// Deferred to a macrotask so the episode file (loaded after engine.js) has defined
// window.EPISODE before we read its ghostNames.
window.ready=false;
setTimeout(function(){
  const names=(window.EPISODE&&window.EPISODE.ghostNames)||[];
  const imgs=names.map(n=>{const im=new Image();im.src='./ghosts_glow/'+n+'.png';GHOSTS[n]=im;return im;});
  const fontsP=(document.fonts&&document.fonts.load)
    ? Promise.all([document.fonts.load('700 100px EBG'),document.fonts.load('italic 400 40px EBG')]).catch(()=>{})
    : Promise.resolve();
  const imgP=Promise.all(imgs.map(im=>new Promise(res=>{
    if(im.complete)return res(); im.onload=res; im.onerror=res;})));
  Promise.all([fontsP,imgP]).then(()=>{window.ready=true;});
  setTimeout(()=>{window.ready=true;},8000); // hard fallback
},0);
