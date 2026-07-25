/* Ancient Firelight — thumbnail generator for EP02..EP06.
   (EP01 keeps its original approved artwork, re-lit by the snippet in
   assets/thumbs/README-relight.md rather than redrawn — a redraw came out worse.)
   Matches the approved EP01 language: near-black frame, ONE big signature object
   lit by ember, a short contrarian line at the bottom with the payload word in
   ember italic. Everything must read at 210px wide, so: few words, huge type,
   high contrast, no clutter.

   Loads engine.js first (palette, line(), flame(), fireGlow(), drawHand(), rnd…).
   Render with thumbs_render.py — one 1280x720 PNG per entry. */

/* ---------- shared backdrop ----------
   EXPOSURE NOTE (learned the hard way 2026-07-25): the first pass measured a mean
   luminance of 20-45 with 60-90% of the frame near-black. Strong YouTube thumbnails
   sit around 90-140. A thumbnail has to COMPETE in a bright feed, not match the
   video's dark grade. Everything below is deliberately lit far hotter than the
   episodes themselves. Target: mean ~85-110, near-black under ~35%. */
function plate(ctx, warm){
  const g=ctx.createRadialGradient(W*0.5,H*0.44,30,W*0.5,H*0.44,W*0.80);
  g.addColorStop(0,   mix('#6E3A18','#9A5520',warm));
  g.addColorStop(0.40,mix('#4A2510','#78400F',warm));
  g.addColorStop(0.75,mix('#2A1509','#3E1E0B',warm));
  g.addColorStop(1,   '#1A0E08');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  strokes(ctx,3.1,80,['#B4602A','#8A4520','#C4762F'],0.10,0,H,1.0);
}
/* a hot pool of light directly behind the subject so it never sits on flat black */
function keyLight(ctx,cx,cy,r,strength){
  const g=ctx.createRadialGradient(cx,cy,10,cx,cy,r);
  g.addColorStop(0,   rgba('#FFB25E',0.55*strength));
  g.addColorStop(0.35,rgba('#E0602F',0.42*strength));
  g.addColorStop(0.7, rgba('#8E2E12',0.22*strength));
  g.addColorStop(1,   'rgba(26,14,8,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
}
function bottomShade(ctx){
  // just enough to seat the type — NOT a crush to black
  const g=ctx.createLinearGradient(0,H*0.62,0,H);
  g.addColorStop(0,'rgba(12,7,5,0)');
  g.addColorStop(0.5,'rgba(12,7,5,0.55)');
  g.addColorStop(1,'rgba(12,7,5,0.78)');
  ctx.fillStyle=g;ctx.fillRect(0,H*0.62,W,H*0.38);
}
/* the headline: plain cream + one ember-italic payload word, centred */
function headline(ctx, plainL, emberW, plainR, y, size){
  size=size||92;
  ctx.save();
  const f=(it)=>`${it?'italic ':''}700 ${size}px ${SERIF}`;
  ctx.font=f(false); const wL=plainL?ctx.measureText(plainL).width:0;
  ctx.font=f(true);  const wE=emberW?ctx.measureText(emberW).width:0;
  ctx.font=f(false); const wR=plainR?ctx.measureText(plainR).width:0;
  let x=(W-(wL+wE+wR))/2;
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  const put=(txt,it,col)=>{
    if(!txt)return;
    ctx.font=f(it);
    ctx.shadowColor='rgba(0,0,0,0.95)';ctx.shadowBlur=26;ctx.shadowOffsetY=3;
    ctx.fillStyle=col;ctx.fillText(txt,x,y);
    ctx.shadowBlur=10;ctx.fillText(txt,x,y);
    ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.fillText(txt,x,y);
    x+=ctx.measureText(txt).width;
  };
  put(plainL,false,CREAM); put(emberW,true,EMBER); put(plainR,false,CREAM);
  ctx.restore();
}
/* eyes watching from the dark — the EP01 motif, reused sparingly */
function eyes(ctx,n,seedOff){
  ctx.save();
  for(let i=0;i<n;i++){
    const s=i*3.7+(seedOff||0);
    const x=rnd(s)*W, y=H*0.10+rnd(s*1.7)*H*0.52;
    if(Math.abs(x-W*0.5)<W*0.20) continue;         // keep clear of the subject
    ctx.fillStyle=rgba(GOLD,0.55+0.35*rnd(s*2.3));
    ctx.beginPath();ctx.ellipse(x,y,5.5,3.6,0,0,6.283);ctx.fill();
    ctx.beginPath();ctx.ellipse(x+17,y,5.5,3.6,0,0,6.283);ctx.fill();
  }
  ctx.restore();
}

/* ---------- signature objects (thumbnail-tuned) ---------- */

// EP02 — the negative hand with filed claw tips
function thumbHand(ctx){
  const cx=W*0.5, cy=H*0.30, s=2.05;
  // blown ochre field
  const R=250*s;
  const bg=ctx.createRadialGradient(cx,cy+46*s,20,cx,cy+46*s,R);
  bg.addColorStop(0,rgba('#FF8A3C',0.95));
  bg.addColorStop(0.45,rgba('#D9552B',0.80));
  bg.addColorStop(1,'rgba(140,50,20,0)');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  for(let i=0;i<1500;i++){
    const a0=rnd(i)*6.2832, rr=Math.sqrt(rnd(i*1.7))*R;
    const x=cx+Math.cos(a0)*rr*1.05, y=cy+46*s+Math.sin(a0)*rr*1.1;
    const fall=1-clamp(rr/R,0,1);
    ctx.globalAlpha=(0.16+0.6*fall)*(0.35+0.65*rnd(i*2.1));
    ctx.fillStyle=(i%7===0)?'#FFA85A':(i%3===0?'#E4602C':'#B4491F');
    ctx.beginPath();ctx.arc(x,y,rnd(i*3.1)*3.2*s+0.7,0,6.2832);ctx.fill();
  }
  ctx.globalAlpha=1;
  // knock out the hand
  const oc=document.createElement('canvas');oc.width=W;oc.height=H;
  const ox=oc.getContext('2d');
  ox.drawImage(ctx.canvas,0,0);
  ox.globalCompositeOperation='destination-out';
  ox.fillStyle='#000';ox.strokeStyle='#000';
  handClaw(ox,cx,cy,s);
  ctx.clearRect(0,0,W,H);
  plate(ctx,0.20);                       // dark behind the hand = the stencil reads
  ctx.drawImage(oc,0,0);
}
function handClaw(ctx,cx,cy,s){
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  ctx.beginPath();ctx.ellipse(cx,cy+42*s,43*s,47*s,0,0,6.2832);ctx.fill();
  ctx.beginPath();ctx.ellipse(cx-2*s,cy+74*s,33*s,30*s,0,0,6.2832);ctx.fill();
  ctx.beginPath();ctx.ellipse(cx,cy+104*s,21*s,26*s,0,0,6.2832);ctx.fill();
  const F=[[-40,-0.46,86,10.5],[-14,-0.15,104,11.5],[13,0.15,99,11.5],[37,0.46,81,10.5]];
  const digit=(bx,by,ang,L,Wd)=>{
    const ux=Math.sin(ang),uy=-Math.cos(ang),px=-uy,py=ux;
    const capL=L*0.80;
    ctx.lineWidth=Wd*2;
    ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+ux*capL,by+uy*capL);ctx.stroke();
    const tx=bx+ux*capL,ty=by+uy*capL,ext=L*0.34;
    ctx.beginPath();
    ctx.moveTo(tx-px*Wd*0.98,ty-py*Wd*0.98);
    ctx.lineTo(tx+px*Wd*0.98,ty+py*Wd*0.98);
    ctx.lineTo(tx+ux*ext,ty+uy*ext);ctx.closePath();ctx.fill();
  };
  for(const [dx,ang,len,wd] of F) digit(cx+dx*s,cy+16*s,ang,len*s,wd*s);
  digit(cx-40*s,cy+62*s,-1.16,70*s,12*s);
  ctx.restore();
}

// EP03 — the crosshatch on ochre stone. Must fill the frame: at 210px wide a
// small stone becomes a smudge.
function thumbCross(ctx){
  const cx=W*0.5, cy=H*0.30, w=760, h=430;
  const g=ctx.createLinearGradient(cx,cy-h/2,cx,cy+h/2);
  g.addColorStop(0,'#B4855A');g.addColorStop(0.5,'#8A5F3C');g.addColorStop(1,'#5E3E26');
  ctx.fillStyle=g;
  ctx.beginPath();ctx.ellipse(cx,cy,w/2,h/2,0.04,0,6.2832);ctx.fill();
  for(let i=0;i<90;i++){
    const a0=rnd(i)*6.2832, rr=Math.sqrt(rnd(i*1.7));
    ctx.fillStyle=rgba(rnd(i*3.1)>0.5?'#8E663F':'#2A1A0C',0.18);
    ctx.beginPath();ctx.arc(cx+Math.cos(a0)*rr*w*0.46,cy+Math.sin(a0)*rr*h*0.46,1+rnd(i*5.3)*5,0,6.2832);ctx.fill();
  }
  const L=[[0.06,0.72,0.52,0.10],[0.20,0.86,0.68,0.16],[0.34,0.93,0.83,0.22],
           [0.48,0.97,0.95,0.30],[0.02,0.50,0.36,0.06],
           [0.08,0.22,0.62,0.86],[0.24,0.12,0.80,0.78],[0.40,0.07,0.93,0.68],
           [0.03,0.38,0.44,0.95],[0.04,0.34,0.94,0.46],[0.05,0.58,0.92,0.68]];
  ctx.save();ctx.lineCap='round';ctx.strokeStyle=rgba('#E4602C',1);ctx.lineWidth=17;
  ctx.shadowColor='rgba(0,0,0,0.65)';ctx.shadowBlur=12;
  const bw=w*0.74,bh=h*0.68;
  for(const [x1,y1,x2,y2] of L){
    ctx.beginPath();
    ctx.moveTo(cx-bw/2+x1*bw,cy-bh/2+y1*bh);
    ctx.lineTo(cx-bw/2+x2*bw,cy-bh/2+y2*bh);
    ctx.stroke();
  }
  ctx.restore();
}

// EP04 — the bear bone with its two holes
function thumbBone(ctx){
  const cx=W*0.5, cy=H*0.30, L=1000, T=168;
  ctx.save();ctx.translate(cx,cy);ctx.rotate(-0.05);
  const g=ctx.createLinearGradient(0,-T/2,0,T/2);
  g.addColorStop(0,'#F0E4CB');g.addColorStop(0.42,'#D2C09B');g.addColorStop(1,'#8E7A5A');
  ctx.fillStyle=g;
  ctx.beginPath();
  ctx.moveTo(-L/2,-T*0.34);
  ctx.quadraticCurveTo(-L*0.52,-T*0.52,-L*0.44,-T*0.50);
  ctx.lineTo(L*0.44,-T*0.46);
  ctx.quadraticCurveTo(L*0.53,-T*0.54,L/2,-T*0.30);
  ctx.quadraticCurveTo(L*0.54,0,L/2,T*0.32);
  ctx.quadraticCurveTo(L*0.52,T*0.52,L*0.42,T*0.48);
  ctx.lineTo(-L*0.44,T*0.50);
  ctx.quadraticCurveTo(-L*0.53,T*0.52,-L/2,T*0.30);
  ctx.quadraticCurveTo(-L*0.55,0,-L/2,-T*0.34);
  ctx.closePath();ctx.fill();
  for(let i=0;i<70;i++){
    ctx.fillStyle=rgba(rnd(i*5.3)>0.5?'#A08A66':'#6B5940',0.15);
    ctx.beginPath();ctx.ellipse((rnd(i*1.7)-0.5)*L*0.95,(rnd(i*3.1)-0.5)*T*0.8,
      2+rnd(i*7.1)*8,1+rnd(i*2.3)*3,rnd(i)*3,0,6.2832);ctx.fill();
  }
  for(const u of [-0.09,0.09]){
    const x=u*L, r=T*0.21;
    ctx.fillStyle=rgba('#0E0A07',0.96);
    ctx.beginPath();ctx.arc(x,0,r,0,6.2832);ctx.fill();
    ctx.strokeStyle=rgba('#F6EBD2',0.38);ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(x,0,r*0.94,0.6,2.4);ctx.stroke();
  }
  ctx.restore();
}

// EP05 — ONE big human head in profile, dark, with Neanderthal DNA burning
// inside it. Filled pale skulls read as blobs at 210px; a hard silhouette with
// an ember rim does not.
function thumbSkulls(ctx){
  const cx=W*0.50, cy=H*0.32, s=3.5;
  const path=()=>{
    ctx.beginPath();
    ctx.moveTo(cx-46*s,cy-8*s);
    ctx.bezierCurveTo(cx-50*s,cy-56*s,cx-10*s,cy-72*s,cx+22*s,cy-58*s);
    ctx.bezierCurveTo(cx+48*s,cy-46*s,cx+50*s,cy-16*s,cx+44*s,cy+2*s);
    ctx.lineTo(cx+44*s,cy+8*s);
    ctx.bezierCurveTo(cx+34*s,cy+16*s,cx+30*s,cy+16*s,cx+28*s,cy+24*s);
    ctx.bezierCurveTo(cx+34*s,cy+46*s,cx+14*s,cy+54*s,cx-4*s,cy+46*s);
    ctx.bezierCurveTo(cx-26*s,cy+38*s,cx-40*s,cy+26*s,cx-46*s,cy-8*s);
    ctx.closePath();
  };
  // ember halo so the silhouette separates from the background
  const halo=ctx.createRadialGradient(cx,cy,20,cx,cy,260*s*0.55);
  halo.addColorStop(0,rgba(EMBER,0.42));
  halo.addColorStop(0.6,rgba('#6E2C14',0.20));
  halo.addColorStop(1,'rgba(16,12,10,0)');
  ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);
  // the head itself
  ctx.save();
  path();
  ctx.fillStyle='#2A1B10';ctx.fill();
  ctx.strokeStyle=rgba('#FFC070',0.95);ctx.lineWidth=6;ctx.stroke();
  // Neanderthal fragments burning inside the cranium
  ctx.clip();
  const segs=[[-30,-40,54],[6,-52,40],[-14,-22,66],[20,-30,34],[-34,-4,44],[10,-8,52],[-6,12,38]];
  for(const [dx,dy,len] of segs){
    const x=cx+dx*s, y=cy+dy*s;
    const g=ctx.createLinearGradient(x,y,x+len*s*0.5,y);
    g.addColorStop(0,'#E0602F');g.addColorStop(1,'#C4451F');
    ctx.fillStyle=g;ctx.shadowColor=rgba(EMBER,0.9);ctx.shadowBlur=22;
    ctx.beginPath();ctx.roundRect(x,y-7,len*s*0.5,15,7);ctx.fill();
  }
  ctx.restore();
}

// EP06 — the myth vs the arithmetic: two bars, 15 against 42.
// A 7-day grid is unreadable at 210px; two bars with numbers on them is instant.
function thumbWeek(ctx){
  // base/maxH tuned so the taller bar's number still clears the top edge
  const base=H*0.60, maxH=268, bw=190;
  const bar=(cx,hrs,col0,col1,lab,dim)=>{
    const h=maxH*(hrs/42);
    const g=ctx.createLinearGradient(0,base,0,base-h);
    g.addColorStop(0,col0);g.addColorStop(1,col1);
    ctx.save();
    if(!dim){ctx.shadowColor=rgba(EMBER,0.55);ctx.shadowBlur=30;}
    ctx.fillStyle=g;
    ctx.beginPath();ctx.roundRect(cx-bw/2,base-h,bw,h,10);ctx.fill();
    ctx.restore();
    // the number, sitting just above its bar
    ctx.save();
    ctx.font=`700 ${dim?76:96}px ${SERIF}`;ctx.textAlign='center';ctx.textBaseline='alphabetic';
    ctx.shadowColor='rgba(0,0,0,0.9)';ctx.shadowBlur=18;
    ctx.fillStyle=dim?ASH:CREAM;
    ctx.fillText(String(hrs),cx,base-h-26);
    ctx.restore();
    ctx.save();
    ctx.font=`italic 400 30px ${SERIF}`;ctx.textAlign='center';
    ctx.shadowColor='rgba(0,0,0,0.9)';ctx.shadowBlur=14;
    ctx.fillStyle=ASH;ctx.fillText(lab,cx,base+40);
    ctx.restore();
  };
  bar(W*0.34,15,'#6E6052','#A8977E','the myth',true);
  bar(W*0.66,42,'#8E2E12','#E0602F','the arithmetic',false);
}

// EP01 — the campfire with eyes in the dark (the approved launch concept,
// rebuilt here so all six live in one place and can be re-lit together)
function thumbFire(ctx){
  const fx=W*0.5, fy=H*0.46;
  keyLight(ctx,fx,fy+40,560,1.15);
  fireGlow(ctx,fx,fy+70,1.5,3.1);
  // two figures seated either side, warm-rimmed so they read as shapes not holes
  ctx.save();
  for(const dx of [-118,118]){
    ctx.fillStyle='#1C0F08';
    ctx.beginPath();ctx.ellipse(fx+dx,fy+58,52,66,0,0,6.2832);ctx.fill();
    ctx.beginPath();ctx.arc(fx+dx,fy-18,34,0,6.2832);ctx.fill();
  }
  ctx.restore();
  flame(ctx,fx,fy+96,1.9,3.1);
}

/* ---------- the six thumbnails ---------- */
const THUMBS = {
  EP02: function(ctx){ thumbHand(ctx); bottomShade(ctx); eyes(ctx,4,11);
        headline(ctx,'The fingers are ','wrong','.',H*0.90,96); },

  EP03: function(ctx){ plate(ctx,0.68); keyLight(ctx,W*0.5,H*0.30,470,1.0);
        thumbCross(ctx); bottomShade(ctx); eyes(ctx,4,3);
        headline(ctx,'It started with a ','doodle','.',H*0.90,92); },

  EP04: function(ctx){ plate(ctx,0.62); keyLight(ctx,W*0.5,H*0.30,520,1.0);
        thumbBone(ctx); bottomShade(ctx); eyes(ctx,5,7);
        headline(ctx,'A flute? Or ','lunch','?',H*0.90,98); },

  EP05: function(ctx){ plate(ctx,0.60); keyLight(ctx,W*0.5,H*0.32,470,1.1);
        thumbSkulls(ctx); bottomShade(ctx); eyes(ctx,4,19);
        headline(ctx,'You’re part ','Neanderthal','.',H*0.90,88); },

  EP06: function(ctx){ plate(ctx,0.58); keyLight(ctx,W*0.5,H*0.42,520,0.95);
        thumbWeek(ctx); bottomShade(ctx); eyes(ctx,4,29);
        headline(ctx,'Paradise worked ','42 hours','.',H*0.945,80); },
};

/* host hook — thumbs_render.py calls window.thumb('EP0N') then screenshots */
window.thumb = function(id){
  const x = window.__x;
  x.setTransform(1,0,0,1,0,0);      // thumbnails render at native 1280x720
  x.clearRect(0,0,W,H);
  plate(x,0.5);
  THUMBS[id](x);
  return true;
};
window.ready = true;                // no ghost images needed here
