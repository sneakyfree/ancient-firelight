/* Ancient Firelight — EP04 "The Flute"
   Master: voice/EP04_The_Flute_MASTER_FINAL.wav  (534.8s)
   Loaded AFTER engine.js.

   The episode is a trial: one bone, two stories, no verdict. So the visual spine is
   the bone itself — drawn once, then re-read as evidence by each side.

   Scene map:
     A OPEN     0   .. 95    Divje Babe, the bear cemetery, the fragment with holes, "made by a Neanderthal"
     B HOLES    95  .. 150   proving a thing is a flute; holes happen; the object doesn't tell you what it meant
     C FOR      150 .. 207   the case FOR: spacing, clean round holes, 100 reconstructions, the museum
     D AGAINST  207 .. 302   the case AGAINST: hyena jaws, opposing punctures, Diedrich 2015, "a snack that whistles"
     E UNSOLVED 302 .. 325   genuinely unresolved — and that's not a shrug
     F HOHLE    325 .. 398   the vulture-wing flute nobody argues about — 42,000 years, a whole tradition
     G WHY      398 .. 446   why bring music to a glacier? the together, not the sound
     H ROOTS    446 .. 511   traditions have roots; the first instruments were bodies and breath
     I CLOSE    511 .. 535   a deliberate sound because the sound was good
*/

/* ---------- EP04 primitives ---------- */

// THE BONE — a fragment of young cave-bear femur, drawn horizontally.
// holes: array of {u (0..1 along the bone), r, kind:'clean'|'broken'}
// Everything in this episode points at this object, so it's drawn once, well.
function bone(ctx,cx,cy,len,thick,al,holes,tilt){
  if(al<=0.005)return;
  ctx.save();ctx.globalAlpha=al;
  ctx.translate(cx,cy);ctx.rotate(tilt||0);
  const L=len,T=thick;
  // shaft with slightly flared, broken ends
  const g=ctx.createLinearGradient(0,-T/2,0,T/2);
  g.addColorStop(0,'#E4D7BE');g.addColorStop(0.42,'#CBB994');g.addColorStop(1,'#8E7A5A');
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
  // surface: age mottling and hairline cracks
  for(let i=0;i<90;i++){
    const x=(rnd(i*1.7)-0.5)*L*0.95, y=(rnd(i*3.1)-0.5)*T*0.8;
    ctx.fillStyle=rgba(rnd(i*5.3)>0.5?'#A08A66':'#6B5940',0.16);
    ctx.beginPath();ctx.ellipse(x,y,1.5+rnd(i*7.1)*7,1+rnd(i*2.3)*3,rnd(i)*3,0,6.2832);ctx.fill();
  }
  ctx.strokeStyle=rgba('#7A6647',0.35);ctx.lineWidth=1.2;
  for(let i=0;i<5;i++){
    const x=(rnd(i*11.3)-0.5)*L*0.8;
    ctx.beginPath();ctx.moveTo(x,-T*0.4);
    ctx.lineTo(x+(rnd(i*3.7)-0.5)*22,T*0.4);ctx.stroke();
  }
  // the holes — the entire argument
  for(const h of (holes||[])){
    const x=(h.u-0.5)*L*0.86, r=h.r*T;
    if(h.kind==='broken'){
      // only a rim survives — the "hints of maybe two more"
      ctx.strokeStyle=rgba('#3A2E1E',0.55);ctx.lineWidth=2.4;ctx.setLineDash([5,6]);
      ctx.beginPath();ctx.arc(x,0,r,0,6.2832);ctx.stroke();ctx.setLineDash([]);
    }else{
      // a clean round hole: dark bore + a lit lower lip so it reads as a hole, not a dot
      ctx.fillStyle=rgba('#140F0A',0.94);
      ctx.beginPath();ctx.arc(x,0,r,0,6.2832);ctx.fill();
      ctx.strokeStyle=rgba('#F0E2C6',0.30);ctx.lineWidth=1.8;
      ctx.beginPath();ctx.arc(x,0,r*0.94,0.6,2.4);ctx.stroke();
      ctx.strokeStyle=rgba('#5A4A32',0.5);ctx.lineWidth=1.4;
      ctx.beginPath();ctx.arc(x,0,r*0.96,3.4,5.6);ctx.stroke();
    }
  }
  ctx.restore();ctx.globalAlpha=1;
}
// hyena jaw closing on the bone — two opposing teeth that line up
function jaw(ctx,cx,cy,s,close,al){
  if(al<=0.005)return;
  const open=(1-smooth(close))*54*s;
  ctx.save();ctx.globalAlpha=al;
  const drawJaw=(dir)=>{
    ctx.save();ctx.translate(cx,cy+dir*open);ctx.scale(1,dir);
    ctx.fillStyle=rgba('#231A12',0.95);
    ctx.beginPath();                                   // jaw mass
    ctx.moveTo(-150*s,-52*s);
    ctx.quadraticCurveTo(0,-88*s,150*s,-44*s);
    ctx.lineTo(150*s,-16*s);ctx.quadraticCurveTo(0,-40*s,-150*s,-20*s);
    ctx.closePath();ctx.fill();
    // teeth — the two big carnassials sit opposite each other
    const T=[[-66,17,10],[-16,26,13],[38,17,10],[86,12,8]];
    for(const [tx,th,tw] of T){
      ctx.beginPath();
      ctx.moveTo((tx-tw)*s,-20*s);
      ctx.lineTo((tx+tw)*s,-20*s);
      ctx.lineTo(tx*s,(-20+th)*s*1.0);
      ctx.closePath();ctx.fill();
    }
    ctx.restore();
  };
  drawJaw(-1);drawJaw(1);
  ctx.restore();ctx.globalAlpha=1;
}
// the Hohle Fels vulture-wing flute: long, slender, five holes, notched blowing end
function vultureFlute(ctx,cx,cy,len,al,t){
  if(al<=0.005)return;
  ctx.save();ctx.globalAlpha=al;
  const T=len*0.062;
  const g=ctx.createLinearGradient(0,cy-T/2,0,cy+T/2);
  g.addColorStop(0,'#EFE4CD');g.addColorStop(0.45,'#D8C7A4');g.addColorStop(1,'#9B8763');
  ctx.fillStyle=g;
  ctx.beginPath();ctx.roundRect(cx-len/2,cy-T/2,len,T,T*0.5);ctx.fill();
  // the V notch you blow across
  ctx.fillStyle=rgba('#0E0A07',0.9);
  ctx.beginPath();
  ctx.moveTo(cx-len/2+len*0.028,cy-T/2);
  ctx.lineTo(cx-len/2+len*0.062,cy-T/2);
  ctx.lineTo(cx-len/2+len*0.045,cy-T*0.02);
  ctx.closePath();ctx.fill();
  // five deliberate finger holes
  for(let i=0;i<5;i++){
    const x=cx-len*0.20+i*len*0.105;
    ctx.fillStyle=rgba('#140F0A',0.93);
    ctx.beginPath();ctx.ellipse(x,cy,T*0.20,T*0.24,0,0,6.2832);ctx.fill();
    ctx.strokeStyle=rgba('#F4E8CE',0.34);ctx.lineWidth=1.5;
    ctx.beginPath();ctx.ellipse(x,cy,T*0.19,T*0.23,0,0.7,2.5);ctx.stroke();
  }
  ctx.restore();ctx.globalAlpha=1;
}
// notes drifting up out of an instrument — used sparingly, never cartoonish
function notes(ctx,cx,cy,t,al,spread){
  if(al<=0.005)return;
  ctx.save();
  for(let i=0;i<9;i++){
    const seed=i*3.77, cyc=((t*0.30+rnd(seed))%1);
    const x=cx+Math.sin(cyc*3.0+i)*(spread||120)*0.5+(rnd(seed*1.3)-0.5)*40;
    const y=cy-cyc*230;
    const a=al*(1-cyc)*0.75;
    if(a<=0.01)continue;
    ctx.globalAlpha=a;ctx.fillStyle=(i%3===0)?rgba(GOLD,0.9):rgba(EMBER2,0.85);
    const r=3.2*(1-cyc*0.5);
    ctx.beginPath();ctx.ellipse(x,y,r*1.35,r,0.4,0,6.2832);ctx.fill();
    ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=1.6;
    ctx.beginPath();ctx.moveTo(x+r*1.25,y);ctx.lineTo(x+r*1.25,y-13*(1-cyc));ctx.stroke();
  }
  ctx.restore();ctx.globalAlpha=1;
}
// A balance for the two competing readings — it never settles.
// Labelled pans ("flute" / "lunch") so the image argues by itself.
function scales(ctx,cx,cy,tipT,al){
  if(al<=0.005)return;
  const tip=(tipT-0.5)*0.26;  // radians; ±0.13 max
  const ARM=250, DROP=52, PAN=52;
  ctx.save();ctx.globalAlpha=al;
  ctx.strokeStyle=rgba(ASH,0.75);ctx.lineWidth=3;ctx.lineCap='round';
  // post + base
  ctx.beginPath();ctx.moveTo(cx,cy+108);ctx.lineTo(cx,cy);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx-56,cy+108);ctx.lineTo(cx+56,cy+108);ctx.stroke();
  // beam
  ctx.save();ctx.translate(cx,cy);ctx.rotate(tip);
  ctx.beginPath();ctx.moveTo(-ARM,0);ctx.lineTo(ARM,0);ctx.stroke();
  ctx.fillStyle=rgba(ASH,0.8);
  ctx.beginPath();ctx.arc(0,0,6,0,6.2832);ctx.fill();
  ctx.restore();
  // pans hang VERTICALLY from the rotated beam ends (this is what was tangled before)
  for(const d of [-1,1]){
    const ex=cx+d*ARM*Math.cos(tip), ey=cy+d*ARM*Math.sin(tip);
    ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex,ey+DROP);ctx.stroke();
    ctx.beginPath();ctx.arc(ex,ey+DROP,PAN,0.12,Math.PI-0.12);ctx.stroke();
    line(ctx,d<0?'flute':'lunch',ex,ey+DROP+PAN*0.55,23,d<0?GOLD:ASH,al,{italic:true});
  }
  ctx.restore();ctx.globalAlpha=1;
  return {tip:tip,arm:ARM,drop:DROP};
}

/* ============================================================
   A — DIVJE BABE (0 .. 95)
   ============================================================ */
function sceneOpen4(ctx,t){
  baseBg(ctx,t,0.14);
  ghost(ctx,'bear',t,env(t,8,12,30,34)*0.12,0.7);
  if(t<36){
    line(ctx,'Somewhere in what is now Slovenia,',W*0.5,H*0.30,32,CREAM,env(t,0.8,2.2,8.0,9.4),{});
    line(ctx,'in a cave called Divje Babe —',W*0.5,H*0.30+46,32,CREAM,env(t,2.6,4.0,8.0,9.4),{});
    line(ctx,'a cave bear died.',W*0.5,H*0.52,42,EMBER2,env(t,5.8,7.0,8.2,9.6),{weight:700});
    line(ctx,'This was not unusual. Cave bears died in caves all the time.',W*0.5,H*0.30,29,ASH,env(t,10.2,11.6,15.8,17.0),{italic:true});
    line(ctx,'It’s practically in the name.',W*0.5,H*0.30+42,27,ASH,env(t,14.0,15.0,15.8,17.0),{italic:true});
    line(ctx,'They shuffled in to sleep through the winter —',W*0.5,H*0.34,29,CREAM,env(t,17.2,18.6,26.4,27.8),{});
    line(ctx,'and the old ones, the unlucky ones, simply didn’t shuffle back out.',W*0.5,H*0.34+42,27,ASH,env(t,20.6,22.0,26.4,27.8),{italic:true});
    // the floor filling with bones over centuries
    const bn=env(t,27.6,30.0,34.6,36.0);
    if(bn>0.01){
      ctx.save();ctx.globalAlpha=bn*0.8;
      for(let i=0;i<64;i++){
        const x=W*0.10+rnd(i*1.7)*W*0.80, y=H*0.62+rnd(i*3.1)*H*0.26;
        const l=26+rnd(i*5.3)*60, a=rnd(i*7.1)*3;
        ctx.save();ctx.translate(x,y);ctx.rotate(a);
        ctx.fillStyle=rgba('#8E7A5A',0.30+0.35*rnd(i*2.3));
        ctx.beginPath();ctx.roundRect(-l/2,-3,l,6,3);ctx.fill();
        ctx.restore();
      }
      ctx.restore();ctx.globalAlpha=1;
      line(ctx,'thousands of them',W*0.5,H*0.24,30,ASH,env(t,31.0,32.2,34.6,36.0),{italic:true});
      line(ctx,'less a cave than a very slow, very cold bear cemetery',W*0.5,H*0.90,27,GOLD,env(t,32.4,33.6,34.8,36.2),{italic:true});
    }
  }
  // ---- the fragment ----
  if(t>=36&&t<70){
    const a=env(t,37.0,38.8,68.0,69.6);
    line(ctx,'And in among all those bones —',W*0.5,H*0.16,29,ASH,env(t,36.2,37.6,44.0,45.4),{italic:true});
    // holes appear as he counts them: two clean ones first ("two clean, round,
    // complete holes"), then the two broken rims ("hints of maybe two more")
    const HOLES=[{u:0.40,r:0.19,kind:'clean', at:48.6},
                 {u:0.56,r:0.19,kind:'clean', at:49.6},
                 {u:0.24,r:0.17,kind:'broken',at:51.8},
                 {u:0.72,r:0.17,kind:'broken',at:52.6}];
    const shown=HOLES.filter(h=>t>h.at);
    bone(ctx,W*0.5,H*0.50,620,86,a,shown,-0.04);
    if(t>=41) line(ctx,'one small piece of a young bear’s thigh bone',W*0.5,H*0.72,30,CREAM,env(t,41.6,43.0,55.0,56.4),{});
    if(t>=44) line(ctx,'about the length of your hand — with holes in it',W*0.5,H*0.79,27,GOLD,env(t,44.6,46.0,55.0,56.4),{italic:true});
    if(t>=48) line(ctx,'two clean, round, complete holes in a neat little row',W*0.5,H*0.86,26,CREAM,env(t,48.4,49.8,55.0,56.4),{italic:true});
    if(t>=51) line(ctx,'…and the broken hints of maybe two more',W*0.5,H*0.925,25,ASH,env(t,51.4,52.6,55.2,56.6),{italic:true});
    if(t>=56){
      line(ctx,'the layer it came from: roughly 50–60,000 years old',W*0.5,H*0.76,29,CREAM,env(t,56.4,57.8,68.0,69.6),{});
      line(ctx,'And the only people around this part of the world back then',W*0.5,H*0.86,27,ASH,env(t,62.0,63.4,68.0,69.6),{italic:true});
      line(ctx,'were Neanderthals.',W*0.5,H*0.93,32,EMBER2,env(t,65.0,66.2,68.2,69.8),{weight:700});
    }
  }
  // ---- the question that has kept archaeologists up for three decades ----
  if(t>=70){
    const a=env(t,70.4,72.0,93.4,95.0);
    ctx.fillStyle=rgba('#000000',a*0.55);ctx.fillRect(0,0,W,H);
    line(ctx,'So here is the question that has kept archaeologists up at night',W*0.5,H*0.18,29,ASH,a,{italic:true});
    line(ctx,'for three decades:',W*0.5,H*0.18+40,29,ASH,env(t,72.4,73.6,93.4,95.0),{italic:true});
    line(ctx,'If a human being deliberately bored those holes to play a tune…',W*0.5,H*0.36,30,CREAM,env(t,74.6,76.0,93.4,95.0),{});
    line(ctx,'then this chewed-looking scrap of bear leg',W*0.5,H*0.50,30,CREAM,env(t,79.0,80.4,93.4,95.0),{});
    line(ctx,'is the oldest musical instrument ever found.',W*0.5,H*0.50+44,34,GOLD,env(t,81.0,82.4,93.4,95.0),{weight:700});
    line(ctx,'And it was made by a Neanderthal.',W*0.5,H*0.68,34,EMBER2,env(t,84.6,86.0,93.4,95.0),{italic:true,weight:700});
    // the counter-possibility, landing hard
    line(ctx,'But if something else made these holes —',W*0.5,H*0.82,30,CREAM,env(t,88.2,89.4,93.4,95.0),{});
    line(ctx,'it’s lunch.',W*0.5,H*0.90,38,ASH,env(t,90.6,91.6,93.6,95.2),{italic:true,weight:700});
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   B — HOLES HAPPEN (95 .. 150)
   ============================================================ */
function sceneHoles(ctx,t){
  baseBg(ctx,t,0.16);
  kicker(ctx,'everything hangs on the holes',env(t,97,98.5,112,114));
  if(t>=95&&t<122){
    line(ctx,'Everything hangs on the holes.',W*0.5,H*0.22,36,CREAM,env(t,95.6,96.8,105.0,106.4),{weight:700});
    line(ctx,'How hard is it to prove a thing is a flute?',W*0.5,H*0.34,30,ASH,env(t,99.4,100.8,110.0,111.4),{italic:true});
    line(ctx,'It sounds easy. Holes in a row. You blow across it and it goes toot.',W*0.5,H*0.44,27,CREAM,env(t,103.6,105.0,110.0,111.4),{italic:true});
    // the claim being made, stated precisely
    const cl=env(t,111.0,112.6,120.4,121.8);
    if(cl>0.01){
      line(ctx,'But you’re claiming that a hole is intentional —',W*0.5,H*0.30,29,CREAM,cl,{});
      line(ctx,'that a mind decided the hole should be there,',W*0.5,H*0.30+42,29,CREAM,env(t,112.6,114.0,120.4,121.8),{});
      line(ctx,'and put it there on purpose, to shape sound.',W*0.5,H*0.30+84,29,GOLD,env(t,114.8,116.2,120.4,121.8),{italic:true});
      line(ctx,'A hole is one of the least talkative pieces of evidence there is.',W*0.5,H*0.68,28,EMBER2,env(t,117.4,118.8,120.6,122.0),{italic:true});
    }
  }
  // holes happen — the litany
  if(t>=122&&t<133){
    line(ctx,'Holes happen.',W*0.5,H*0.24,40,CREAM,env(t,121.8,122.8,131.4,132.8),{weight:700});
    const causes=[['Teeth make holes.',122.9],['Rocks make holes.',123.7],['Time makes holes.',124.5]];
    for(let i=0;i<causes.length;i++){
      const a=env(t,causes[i][1],causes[i][1]+0.9,131.4,132.8); if(a<0.01)continue;
      line(ctx,causes[i][0],W*0.5,H*0.40+i*46,30,ASH,a,{});
    }
    line(ctx,'A bone can sit in the ground for 50,000 years, accumulating holes',W*0.5,H*0.70,27,CREAM,env(t,125.8,127.2,131.4,132.8),{italic:true});
    line(ctx,'the way a favourite sweater accumulates them.',W*0.5,H*0.77,27,GOLD,env(t,127.6,129.0,131.4,132.8),{italic:true});
    line(ctx,'And none of it means anybody was trying to make music.',W*0.5,H*0.88,28,EMBER2,env(t,129.4,130.6,131.6,133.0),{italic:true});
  }
  // the thesis of the whole channel
  if(t>=133){
    const a=env(t,133.4,135.0,148.4,149.8);
    ctx.fillStyle=rgba('#000000',a*0.62);ctx.fillRect(0,0,W,H);
    line(ctx,'This is the deep problem lurking under this whole channel.',W*0.5,H*0.24,28,ASH,a,{italic:true});
    line(ctx,'The object doesn’t tell you what it meant.',W*0.5,H*0.40,42,CREAM,env(t,135.8,137.2,148.4,149.8),{weight:700});
    line(ctx,'You have to argue it.',W*0.5,H*0.52,36,EMBER2,env(t,138.8,139.8,148.4,149.8),{italic:true,weight:700});
    if(t>=143){
      bone(ctx,W*0.5,H*0.70,420,58,env(t,143.4,144.8,148.4,149.8),
           [{u:0.40,r:0.19,kind:'clean'},{u:0.56,r:0.19,kind:'clean'}],-0.03);
      line(ctx,'Same bone. Same holes. Two completely different stories.',W*0.5,H*0.86,28,CREAM,env(t,143.8,145.2,148.4,149.8),{});
      line(ctx,'And the bone is not taking sides.',W*0.5,H*0.93,28,GOLD,env(t,146.4,147.4,148.6,150.0),{italic:true});
    }
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   C — THE CASE FOR (150 .. 207)
   ============================================================ */
function sceneFor(ctx,t){
  baseBg(ctx,t,0.20);
  kicker(ctx,'the case for · it’s a flute',env(t,152,153.5,168,170));
  // the bone sits high; the arguments stack beneath it
  bone(ctx,W*0.5,H*0.26,520,72,env(t,150.6,152.4,205.0,206.6),
       [{u:0.40,r:0.19,kind:'clean'},{u:0.56,r:0.19,kind:'clean'},
        {u:0.24,r:0.17,kind:'broken'},{u:0.72,r:0.17,kind:'broken'}],-0.03);
  if(t>=150&&t<162){
    line(ctx,'So let’s hear both stories.',W*0.5,H*0.52,34,CREAM,env(t,150.2,151.4,158.0,159.4),{});
    line(ctx,'The people who think it’s a real flute — led for years by Ivan Turk —',W*0.5,H*0.64,27,ASH,env(t,153.8,155.4,161.0,162.4),{italic:true});
    line(ctx,'have some genuinely good points. I don’t want to wave them away.',W*0.5,H*0.71,27,ASH,env(t,156.2,157.6,161.0,162.4),{italic:true});
  }
  if(t>=162&&t<190){
    // 1 — spacing: fingers land where the holes are
    const s1=env(t,162.6,164.2,188.0,189.6);
    if(s1>0.01){
      line(ctx,'First — the spacing.',W*0.5,H*0.46,30,CREAM,s1,{weight:700});
      line(ctx,'The holes line up the way your fingers would want them.',W*0.5,H*0.53,26,ASH,env(t,164.6,166.0,175.0,176.4),{italic:true});
      // fingertips descending onto the holes
      const fd=env(t,166.0,168.0,175.0,176.4);
      if(fd>0.01){
        ctx.save();ctx.globalAlpha=fd*0.9;
        for(let i=0;i<2;i++){
          const hx=W*0.5+((i===0?0.40:0.56)-0.5)*520*0.86;
          const drop=6*Math.sin(t*2.2+i*1.3);
          ctx.fillStyle=rgba('#241A10',0.9);
          ctx.beginPath();ctx.ellipse(hx,H*0.26-58+drop,13,26,0,0,6.2832);ctx.fill();
        }
        ctx.restore();ctx.globalAlpha=1;
      }
    }
    // 2 — clean not crushed
    const s2=env(t,170.8,172.4,188.0,189.6);
    if(s2>0.01){
      line(ctx,'Second — the holes are round and clean,',W*0.5,H*0.66,30,CREAM,s2,{weight:700});
      line(ctx,'not the ragged crush you’d expect from a jaw clamping down.',W*0.5,H*0.73,26,ASH,env(t,172.4,173.8,188.0,189.6),{italic:true});
    }
    // 3 — the crowd pleaser
    const s3=env(t,176.0,177.6,188.0,189.6);
    if(s3>0.01){
      line(ctx,'Third — and this is the crowd-pleaser:',W*0.5,H*0.84,30,CREAM,s3,{weight:700});
      line(ctx,'a musician built 100+ reconstructions and learned to play it —',W*0.5,H*0.905,26,GOLD,env(t,178.4,179.8,188.0,189.6),{italic:true});
      line(ctx,'coaxing out a range of several octaves.',W*0.5,H*0.96,26,GOLD,env(t,184.2,185.4,188.0,189.6),{italic:true});
      notes(ctx,W*0.5,H*0.20,t,env(t,180.0,182.0,188.0,189.6),260);
    }
  }
  if(t>=190){
    const a=env(t,190.0,191.6,205.4,207.0);
    line(ctx,'The National Museum of Slovenia displays it proudly',W*0.5,H*0.50,29,CREAM,a,{});
    line(ctx,'as the oldest known musical instrument in the world.',W*0.5,H*0.50+42,29,CREAM,env(t,192.4,193.8,205.4,207.0),{});
    line(ctx,'…and who ever thought Neanderthals had it in them?',W*0.5,H*0.66,27,GOLD,env(t,195.6,197.0,205.4,207.0),{italic:true});
    line(ctx,'You’d want it to be true. I want it to be true.',W*0.5,H*0.80,32,CREAM,env(t,199.0,200.4,205.4,207.0),{italic:true});
    line(ctx,'But wanting is exactly what this channel is built to be suspicious of.',W*0.5,H*0.90,27,EMBER2,env(t,203.0,204.2,205.6,207.2),{italic:true});
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   D — THE CASE AGAINST (207 .. 302)
   ============================================================ */
function sceneAgainst(ctx,t){
  baseBg(ctx,t,0.18);
  ghost(ctx,'lions',t,env(t,222,226,244,248)*0.10,2.8);   // the predator register
  kicker(ctx,'the case against · it’s lunch',env(t,209,210.5,226,228));
  if(t>=207&&t<223){
    line(ctx,'Because there’s a second story —',W*0.5,H*0.30,32,CREAM,env(t,207.6,209.0,221.0,222.4),{});
    line(ctx,'and it is annoyingly persuasive.',W*0.5,H*0.30+46,32,EMBER2,env(t,209.8,211.2,221.0,222.4),{italic:true});
    line(ctx,'Divje Babe wasn’t just a bear cemetery.',W*0.5,H*0.54,29,CREAM,env(t,213.4,214.8,221.0,222.4),{});
    line(ctx,'It was also, at times, a hyena den.',W*0.5,H*0.54+42,32,GOLD,env(t,216.4,217.8,221.0,222.4),{italic:true,weight:700});
  }
  // the jaw
  if(t>=223&&t<250){
    const a=env(t,223.4,225.0,248.0,249.6);
    line(ctx,'They bite them. Their jaws are astonishing —',W*0.5,H*0.16,29,CREAM,env(t,223.4,224.8,234.0,235.4),{});
    line(ctx,'built to crunch straight through leg bones for the marrow inside.',W*0.5,H*0.23,26,ASH,env(t,228.0,229.4,234.0,235.4),{italic:true});
    // bone with the jaw closing on it
    const close=ramp(t,234.6,238.4);
    bone(ctx,W*0.5,H*0.52,520,72,a,
         (t>238.8)?[{u:0.40,r:0.19,kind:'clean'},{u:0.56,r:0.19,kind:'clean'}]:[],-0.03);
    jaw(ctx,W*0.5,H*0.52,1.05,close,a*0.95);
    if(t>=235) line(ctx,'a tooth punching into fresh, soft, young bone',W*0.5,H*0.78,28,CREAM,env(t,235.4,236.8,248.0,249.6),{italic:true});
    if(t>=239) line(ctx,'can leave a hole that is round. And clean.',W*0.5,H*0.85,29,GOLD,env(t,239.4,240.6,248.0,249.6),{italic:true});
    if(t>=242){
      line(ctx,'And here’s the gut punch —',W*0.5,H*0.92,28,EMBER2,env(t,242.2,243.4,248.0,249.6),{weight:700});
      // the opposing tooth: a second hole appearing in line
      line(ctx,'sometimes lined up with the hole its opposing tooth made on the other side.',W*0.5,H*0.975,24,CREAM,env(t,244.4,245.8,248.2,249.8),{italic:true});
    }
  }
  if(t>=250&&t<276){
    const a=env(t,250.6,252.2,274.0,275.6);
    bone(ctx,W*0.5,H*0.34,470,66,a,[{u:0.40,r:0.19,kind:'clean'},{u:0.56,r:0.19,kind:'clean'}],-0.03);
    line(ctx,'That’s the argument the palaeontologist Cajus Diedrich laid out in 2015:',W*0.5,H*0.56,27,CREAM,env(t,251.0,252.6,274.0,275.6),{italic:true});
    line(ctx,'our “flute” is a young cave bear’s thigh bone',W*0.5,H*0.66,30,CREAM,env(t,258.0,259.4,274.0,275.6),{});
    line(ctx,'that a hyena cracked open for a meal —',W*0.5,H*0.66+42,30,ASH,env(t,260.4,261.8,274.0,275.6),{italic:true});
    line(ctx,'and the famous holes are tooth punctures.',W*0.5,H*0.66+84,30,EMBER2,env(t,262.6,264.0,274.0,275.6),{weight:700});
    if(t>=266) line(ctx,'He wasn’t the first sceptic — the taphonomy question goes back to the late 1990s.',W*0.5,H*0.93,24,ASH,env(t,266.6,268.0,274.2,275.8),{italic:true});
    citation(ctx,'Diedrich CG 2015, Royal Society Open Science 2:140022',a);
  }
  // the "but you can play it" trap
  if(t>=276){
    const a=env(t,276.4,278.0,300.4,302.0);
    line(ctx,'And notice the trap in the “but you can play it” argument.',W*0.5,H*0.20,29,CREAM,a,{italic:true});
    const things=[['a garden hose',283.0],['an empty bottle',285.4],['anything you like',287.4]];
    for(let i=0;i<things.length;i++){
      const ta=env(t,things[i][1],things[i][1]+1.0,296.0,297.4); if(ta<0.01)continue;
      line(ctx,'You can play '+things[i][0]+'.',W*0.5,H*0.36+i*46,29,ASH,ta,{});
    }
    if(t>=289){
      line(ctx,'Getting music out of a tube with holes in it proves the tube can make music.',W*0.5,H*0.62,26,CREAM,env(t,289.4,290.8,300.4,302.0),{});
      line(ctx,'It does not prove anyone ever meant it to.',W*0.5,H*0.70,30,EMBER2,env(t,292.0,293.2,300.4,302.0),{italic:true,weight:700});
    }
    if(t>=295) line(ctx,'That’s the difference between a flute — and a snack that whistles.',W*0.5,H*0.86,30,GOLD,env(t,295.6,297.0,300.6,302.2),{italic:true,weight:700});
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   E — UNSOLVED (302 .. 325)
   ============================================================ */
function sceneUnsolved(ctx,t){
  baseBg(ctx,t,0.16);
  // the balance, wavering, never settling. Sits centre; all copy stays clear of it.
  const scA=env(t,303.0,305.0,322.4,324.0);
  const wob=0.5+0.16*Math.sin(t*0.7)+0.06*Math.sin(t*1.6);
  const cy=H*0.46;
  scales(ctx,W*0.5,cy,wob,scA);
  // the bone rides the "flute" pan, tilting with it
  {
    const tip=(wob-0.5)*0.26, ARM=250, DROP=52;
    const ex=W*0.5-ARM*Math.cos(tip), ey=cy-ARM*Math.sin(tip);
    bone(ctx,ex,ey+DROP-14,132,20,scA,[{u:0.40,r:0.19,kind:'clean'},{u:0.58,r:0.19,kind:'clean'}],tip);
  }
  line(ctx,'So where does this leave us, honestly?',W*0.5,H*0.13,32,CREAM,env(t,302.4,303.6,311.0,312.4),{});
  // the three verdict words sit ABOVE the balance so nothing overlaps the pans
  const words=[['Unsolved.',303.4],['Genuinely, actively — no consensus.',304.6],['Unresolved.',306.6]];
  for(let i=0;i<words.length;i++){
    const a=env(t,words[i][1],words[i][1]+1.0,311.0,312.4); if(a<0.01)continue;
    line(ctx,words[i][0],W*0.5,H*0.205+i*38,i===0?34:24,i===0?EMBER2:ASH,a,{weight:i===0?700:400,italic:i>0});
  }
  if(t>=307) line(ctx,'Some of the best specialists in the world still line up on opposite sides of this bone.',W*0.5,H*0.855,25,CREAM,env(t,307.4,308.8,314.0,315.4),{italic:true});
  if(t>=308){
    line(ctx,'I’m not going to pretend I’ve settled it for you.',W*0.5,H*0.90,28,CREAM,env(t,308.6,310.0,318.4,319.8),{});
    line(ctx,'Because I haven’t. And neither has anyone else.',W*0.5,H*0.955,26,ASH,env(t,313.0,314.4,318.4,319.8),{italic:true});
  }
  if(t>=316){
    line(ctx,'But here’s why this episode isn’t a shrug:',W*0.5,H*0.145,32,GOLD,env(t,316.4,317.8,323.4,325.0),{italic:true,weight:700});
    line(ctx,'while everyone’s been fighting over the bear bone,',W*0.5,H*0.885,27,CREAM,env(t,319.8,321.2,323.4,325.0),{});
    line(ctx,'there’s another instrument nobody argues about at all.',W*0.5,H*0.945,27,CREAM,env(t,321.6,322.8,323.6,325.2),{});
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   F — HOHLE FELS (325 .. 398)
   ============================================================ */
function sceneHohle(ctx,t){
  baseBg(ctx,t,0.24);
  kicker(ctx,'the one nobody argues about',env(t,327,328.5,333.4,334.8));
  const a=env(t,326.0,328.0,396.0,397.6);
  vultureFlute(ctx,W*0.5,H*0.36,720,a,t);
  if(t>=325&&t<345){
    line(ctx,'In a cave in southern Germany called Hohle Fels —',W*0.5,H*0.235,29,CREAM,env(t,325.4,326.8,336.0,337.4),{});
    line(ctx,'a flute made from the wing bone of a griffon vulture.',W*0.5,H*0.55,30,CREAM,env(t,330.6,332.0,343.4,344.8),{});
    line(ctx,'Five finger holes, carefully carved. A notched end to blow across.',W*0.5,H*0.62,27,GOLD,env(t,333.8,335.2,343.4,344.8),{italic:true});
    line(ctx,'It is unmistakably, deliberately, a musical instrument.',W*0.5,H*0.76,30,CREAM,env(t,338.4,339.8,343.4,344.8),{weight:700});
  }
  if(t>=344&&t<372){
    line(ctx,'There is no hyena in this story. No maybe.',W*0.5,H*0.56,32,EMBER2,env(t,344.8,346.0,356.0,357.4),{italic:true,weight:700});
    line(ctx,'42,000 – 43,000 years old',W*0.5,H*0.68,50,CREAM,env(t,348.6,350.2,370.0,371.4),{weight:700});
    notes(ctx,W*0.5,H*0.30,t,env(t,350.0,352.0,370.0,371.4),300);
    if(t>=353){
      line(ctx,'And it wasn’t alone —',W*0.5,H*0.80,28,ASH,env(t,353.2,354.6,370.0,371.4),{italic:true});
      line(ctx,'the same region gave up flutes of swan bone, and carved mammoth ivory.',W*0.5,H*0.87,27,CREAM,env(t,361.4,362.8,370.0,371.4),{});
      line(ctx,'People who made music as a matter of course. A whole tradition of it.',W*0.5,H*0.94,26,GOLD,env(t,366.4,367.8,370.2,371.6),{italic:true});
    }
    citation(ctx,'Conard NJ, Malina M, Münzel SC 2009, Nature 460:737 — Hohle Fels',a);
  }
  if(t>=372){
    const b=env(t,372.4,374.0,396.4,398.0);
    line(ctx,'These flutes were made by early modern humans. By us.',W*0.5,H*0.56,30,CREAM,env(t,369.4,371.0,382.0,383.4),{});
    line(ctx,'42,000 years ago, the very first of our kind to settle ice-age Europe',W*0.5,H*0.66,28,CREAM,b,{});
    line(ctx,'unpacked their gear — and part of that gear was flutes.',W*0.5,H*0.73,28,GOLD,env(t,378.6,380.0,396.4,398.0),{italic:true});
    if(t>=383){
      line(ctx,'Not because a flute helps you survive a glacier. It doesn’t.',W*0.5,H*0.84,27,ASH,env(t,383.0,384.4,396.4,398.0),{italic:true});
      line(ctx,'But walking into one of the harshest places humans have ever tried to live,',W*0.5,H*0.90,25,CREAM,env(t,387.4,388.8,396.4,398.0),{});
      line(ctx,'they made sure to bring the music.',W*0.5,H*0.96,29,EMBER2,env(t,391.8,393.0,396.6,398.2),{italic:true,weight:700});
    }
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   G — WHY (398 .. 446)
   ============================================================ */
function sceneWhy4(ctx,t){
  baseBg(ctx,t,0.30);
  const fx=W*0.5,fy=H*0.88;
  fireGlow(ctx,fx,fy,0.62,t);
  kicker(ctx,'why bring music to a glacier?',env(t,400,401.5,414,416));
  if(t>=398&&t<413){
    line(ctx,'Why would a struggling band on the edge of an ice sheet',W*0.5,H*0.24,29,CREAM,env(t,398.6,400.0,411.4,412.8),{});
    line(ctx,'spend precious hours hollowing out a vulture’s wing?',W*0.5,H*0.24+42,29,ASH,env(t,401.0,402.4,411.4,412.8),{italic:true});
    line(ctx,'My best guess — and here I’m reasoning, not reading off the bone:',W*0.5,H*0.46,26,ASH,env(t,405.4,406.8,411.4,412.8),{italic:true});
    line(ctx,'music was never really about the sound.',W*0.5,H*0.58,34,CREAM,env(t,408.0,409.4,411.6,413.0),{});
    line(ctx,'It was about the together.',W*0.5,H*0.66,38,EMBER2,env(t,410.4,411.4,412.4,413.8),{italic:true,weight:700});
  }
  // the group, moving as one — figures round the fire pulsing on a shared beat
  if(t>=413){
    const a=env(t,413.4,415.0,444.4,446.0);
    const beat=Math.sin(t*3.4);
    ctx.save();ctx.globalAlpha=a;
    const C=rgba('#100B08',0.95);
    const pos=[-360,-235,-115,115,235,360];
    for(let i=0;i<pos.length;i++){
      const bob=Math.sin(t*3.4+i*0.15)*7;     // everyone on the SAME pulse
      figure(ctx,fx+pos[i],fy-24+bob,0.86,C);
    }
    ctx.restore();ctx.globalAlpha=1;
    flame(ctx,fx,fy,0.95+0.06*beat,t);
    pulsesRing(ctx,fx,fy-120,t,a*0.5);
    if(t>=414) line(ctx,'Nothing binds a group faster than making a rhythm as one.',W*0.5,H*0.20,29,CREAM,env(t,414.0,415.4,424.0,425.4),{});
    if(t>=417) line(ctx,'Voices matching. Feet landing on the same beat.',W*0.5,H*0.27,27,ASH,env(t,417.4,418.8,424.0,425.4),{italic:true});
    if(t>=420) line(ctx,'Everyone briefly running on a single pulse.',W*0.5,H*0.34,27,GOLD,env(t,420.2,421.4,424.0,425.4),{italic:true});
    if(t>=425){
      line(ctx,'If you’re a small, fragile band trying to survive a winter that wants you dead,',W*0.5,H*0.20,26,CREAM,env(t,425.4,426.8,436.0,437.4),{});
      line(ctx,'the thing that keeps you alive isn’t any one flute.',W*0.5,H*0.27,28,CREAM,env(t,428.8,430.0,436.0,437.4),{});
      line(ctx,'It’s the glue between you.',W*0.5,H*0.35,34,EMBER2,env(t,431.4,432.4,436.0,437.4),{italic:true,weight:700});
    }
    if(t>=434) line(ctx,'And music, it turns out, is one of the strongest glues our species has ever found.',W*0.5,H*0.44,26,GOLD,env(t,434.4,435.8,444.4,446.0),{italic:true});
    if(t>=439){
      line(ctx,'So maybe they didn’t bring the flutes despite the glacier.',W*0.5,H*0.56,29,CREAM,env(t,439.4,440.8,444.4,446.0),{});
      line(ctx,'Maybe they brought the flutes because of it.',W*0.5,H*0.64,32,CREAM,env(t,442.0,443.2,444.6,446.2),{weight:700});
    }
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}
// concentric rings for the shared pulse (kept local so it can't clash with EP03's `pulses`)
function pulsesRing(ctx,cx,cy,t,al){
  if(al<=0.005)return;
  ctx.save();
  for(let i=0;i<4;i++){
    const cyc=((t*0.55+i*0.25)%1);
    const a=al*(1-cyc)*0.5;
    if(a<=0.01)continue;
    ctx.globalAlpha=a;ctx.strokeStyle=rgba(EMBER2,0.8);ctx.lineWidth=2.6*(1-cyc)+0.5;
    ctx.beginPath();ctx.ellipse(cx,cy,cyc*430,cyc*150,0,0,6.2832);ctx.stroke();
  }
  ctx.restore();ctx.globalAlpha=1;
}

/* ============================================================
   H — TRADITIONS HAVE ROOTS (446 .. 511)
   ============================================================ */
function sceneRoots(ctx,t){
  baseBg(ctx,t,0.20);
  kicker(ctx,'put the two bones side by side',env(t,448,449.5,464,466));
  // the two bones, side by side — the whole episode in one frame
  const a=env(t,446.6,448.4,509.4,511.0);
  vultureFlute(ctx,W*0.5,H*0.22,520,a,t);
  bone(ctx,W*0.5,H*0.40,430,60,a,[{u:0.40,r:0.19,kind:'clean'},{u:0.56,r:0.19,kind:'clean'}],-0.03);
  line(ctx,'Hohle Fels — certain',W*0.5,H*0.29,22,GOLD,env(t,448.0,449.4,509.4,511.0),{italic:true,font:MONO});
  line(ctx,'Divje Babe — unresolved',W*0.5,H*0.48,22,ASH,env(t,448.6,450.0,509.4,511.0),{italic:true,font:MONO});
  if(t>=450&&t<466){
    line(ctx,'The vulture-bone flute proves that by at least 42,000 years ago,',W*0.5,H*0.60,27,CREAM,env(t,450.6,452.0,464.0,465.4),{});
    line(ctx,'music was not a novelty. It was an institution.',W*0.5,H*0.67,30,EMBER2,env(t,454.0,455.4,464.0,465.4),{weight:700});
    line(ctx,'A whole tradition — with a supply chain of the right bones, and the skill to work them.',W*0.5,H*0.76,25,ASH,env(t,457.6,459.0,464.0,465.4),{italic:true});
    line(ctx,'And you don’t get a tradition overnight.',W*0.5,H*0.85,30,GOLD,env(t,461.4,462.6,464.2,465.6),{italic:true});
  }
  if(t>=466&&t<489){
    line(ctx,'Traditions have roots.',W*0.5,H*0.60,38,CREAM,env(t,464.6,465.8,487.4,488.8),{weight:700});
    const firsts=[['the first tapped rhythm',468.6],['the first hummed melody',470.6],
                  ['the first person who blew across a hollow reed — and liked the sound',473.4]];
    for(let i=0;i<firsts.length;i++){
      const fa=env(t,firsts[i][1],firsts[i][1]+1.2,487.4,488.8); if(fa<0.01)continue;
      line(ctx,'—  '+firsts[i][0],W*0.5,H*0.69+i*38,25,i===2?GOLD:ASH,fa,{italic:true});
    }
    if(t>=477) line(ctx,'…reaching back far behind the flute, into a stretch of time from which almost nothing survives.',W*0.5,H*0.90,24,CREAM,env(t,477.4,478.8,487.4,488.8),{italic:true});
    if(t>=482) line(ctx,'Because the first instruments were bodies, and breath, and reeds that rotted.',W*0.5,H*0.96,24,EMBER2,env(t,482.4,483.8,487.6,489.0),{italic:true});
  }
  if(t>=489){
    const b=env(t,489.4,491.0,509.4,511.0);
    line(ctx,'And the bear bone?',W*0.5,H*0.60,32,CREAM,b,{});
    line(ctx,'The bear bone is the honest edge of what we can know.',W*0.5,H*0.68,30,GOLD,env(t,491.4,492.8,509.4,511.0),{italic:true,weight:700});
    if(t>=494){
      line(ctx,'It sits right on the line between “somebody meant this”',W*0.5,H*0.78,26,CREAM,env(t,494.4,495.8,509.4,511.0),{});
      line(ctx,'and “the world just does this.” And it refuses to tell us which.',W*0.5,H*0.84,26,ASH,env(t,496.6,498.0,509.4,511.0),{italic:true});
    }
    if(t>=500){
      line(ctx,'That’s not a failure. That’s the actual shape of the past:',W*0.5,H*0.92,27,CREAM,env(t,500.4,501.8,509.4,511.0),{});
      line(ctx,'mostly a bone with a hole in it, and a story we have to argue our way toward.',W*0.5,H*0.975,24,EMBER2,env(t,503.4,504.8,509.6,511.2),{italic:true});
    }
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   I — CLOSE (511 .. 535)
   ============================================================ */
function sceneClose4(ctx,t){
  const shrink=ramp(t,527,533.6);
  baseBg(ctx,t,0.30*(1-shrink*0.6));
  const fx=W*0.5,fy=H*0.86;
  fireGlow(ctx,fx,fy,0.66*(1-shrink*0.7),t);
  // one figure by the fire, playing — the flute is held AT the mouth, angled,
  // so it reads as being played rather than floating beside them
  const a=env(t,511.4,513.0,532.6,534.6);
  const px=fx-150, pbase=fy-6;
  ctx.save();ctx.globalAlpha=a*0.95;
  figure(ctx,px,pbase,0.95,rgba('#100B08',0.95));
  // arms up to the instrument
  ctx.strokeStyle=rgba('#100B08',0.95);ctx.lineWidth=9;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(px+8,pbase-62);ctx.lineTo(px+42,pbase-88);ctx.stroke();
  ctx.beginPath();ctx.moveTo(px+14,pbase-50);ctx.lineTo(px+62,pbase-74);ctx.stroke();
  ctx.restore();ctx.globalAlpha=1;
  // flute angled down-away from the mouth (head sits ~pbase-96)
  ctx.save();ctx.translate(px+28,pbase-96);ctx.rotate(0.30);
  vultureFlute(ctx,90,0,190,a*0.92,t);
  ctx.restore();
  notes(ctx,px+150,pbase-130,t,a*(1-shrink*0.5),140);
  if(!shrink||shrink<0.9) flame(ctx,fx,fy,0.9*(1-shrink*0.6),t);

  line(ctx,'Here’s what I’ll say for certain.',W*0.5,H*0.16,32,CREAM,env(t,511.6,512.8,518.0,519.4),{});
  line(ctx,'Somewhere in the long dawn — we can’t say exactly when,',W*0.5,H*0.24,27,ASH,env(t,513.8,515.2,522.0,523.4),{italic:true});
  line(ctx,'and anyone who tells you they can is selling something —',W*0.5,H*0.30,27,ASH,env(t,516.4,517.8,522.0,523.4),{italic:true});
  line(ctx,'a human being made a deliberate sound',W*0.5,H*0.40,34,CREAM,env(t,518.6,520.0,530.0,531.4),{});
  line(ctx,'purely because the sound was good.',W*0.5,H*0.47,34,EMBER2,env(t,520.8,522.0,530.0,531.4),{italic:true,weight:700});
  if(t>=523){
    line(ctx,'And every song you have ever loved',W*0.5,H*0.58,29,CREAM,env(t,523.4,524.6,533.4,535.0),{});
    line(ctx,'is the far end of a note first blown into a hollow bone by firelight —',W*0.5,H*0.645,27,CREAM,env(t,525.4,526.8,533.4,535.0),{italic:true});
    line(ctx,'by someone whose name is gone,',W*0.5,H*0.71,29,ASH,env(t,529.2,530.2,533.4,535.0),{italic:true});
    line(ctx,'but whose tune somehow is still playing.',W*0.5,H*0.775,32,GOLD,env(t,531.0,532.0,533.6,535.2),{italic:true,weight:700});
  }
  vignette(ctx);grain(ctx,t);
}

/* ============================================================
   EPISODE
   ============================================================ */
window.EPISODE={
  duration:534.8,
  bounds:[95,150,207,302,325,398,446,511],
  ghostNames:['bear','lions'],
  render:function(ctx,t){
    if(t<95)        sceneOpen4(ctx,t);
    else if(t<150)  sceneHoles(ctx,t);
    else if(t<207)  sceneFor(ctx,t);
    else if(t<302)  sceneAgainst(ctx,t);
    else if(t<325)  sceneUnsolved(ctx,t);
    else if(t<398)  sceneHohle(ctx,t);
    else if(t<446)  sceneWhy4(ctx,t);
    else if(t<511)  sceneRoots(ctx,t);
    else            sceneClose4(ctx,t);
  }
};
