/* Ancient Firelight — EP05 "The Affair"
   Master: voice/EP05_The_Affair_MASTER.wav  (616.0s)
   Loaded AFTER engine.js.

   The spine is a genome strip — a long bar of human sequence with Neanderthal
   segments lit inside it. Everything else is measured against that strip.

   Scene map:
     A CRIMESCENE 0   .. 90    the old story: they were replaced / wiped out — and its fatal problem
     B DNA        90  .. 195   Pääbo 2010; 1–2%; the fragments don't overlap; >20% recoverable from the living
     C SEVEN      195 .. 296   Dec 2024: one continuous 7,000-year window, not one night
     D BLENDING   296 .. 396   Peștera cu Oase — a Neanderthal great-great-grandparent, and a branch that ended
     E BOTHWAYS   396 .. 477   Altai: modern human DNA inside HER genome. A two-way exchange.
     F EXTINCT    477 .. 525   not erasure — absorption. A tributary joining a river.
     G FAMILY     525 .. 616   they're your family. The longest love story we've ever found.
*/

/* ---------- EP05 primitives ---------- */

// THE GENOME STRIP — the object of the episode.
// segs: [{u0,u1}] Neanderthal stretches in 0..1 coordinates along the strip.
function genome(ctx,cx,cy,w,h,al,segs,segAl,label){
  if(al<=0.005)return;
  ctx.save();ctx.globalAlpha=al;
  // the human baseline
  const g=ctx.createLinearGradient(cx-w/2,0,cx+w/2,0);
  g.addColorStop(0,'#1B2530');g.addColorStop(0.5,'#243240');g.addColorStop(1,'#1B2530');
  ctx.fillStyle=g;
  ctx.beginPath();ctx.roundRect(cx-w/2,cy-h/2,w,h,h*0.34);ctx.fill();
  ctx.strokeStyle=rgba(COOL,0.35);ctx.lineWidth=1.4;
  ctx.beginPath();ctx.roundRect(cx-w/2,cy-h/2,w,h,h*0.34);ctx.stroke();
  // faint base ticks so it reads as sequence, not a progress bar
  ctx.strokeStyle=rgba(COOL,0.16);ctx.lineWidth=1;
  for(let i=1;i<86;i++){const x=cx-w/2+w*(i/86);
    ctx.beginPath();ctx.moveTo(x,cy-h*0.30);ctx.lineTo(x,cy+h*0.30);ctx.stroke();}
  // the Neanderthal segments, lit in ember
  for(const s of (segs||[])){
    const x0=cx-w/2+w*s.u0, x1=cx-w/2+w*s.u1;
    ctx.globalAlpha=al*(segAl===undefined?1:segAl);
    const sg=ctx.createLinearGradient(0,cy-h/2,0,cy+h/2);
    sg.addColorStop(0,'#E0602F');sg.addColorStop(0.5,'#C4451F');sg.addColorStop(1,'#8E2E12');
    ctx.fillStyle=sg;
    ctx.beginPath();ctx.roundRect(x0,cy-h/2+1.5,Math.max(3,x1-x0),h-3,h*0.28);ctx.fill();
  }
  ctx.globalAlpha=al;
  if(label) line(ctx,label,cx,cy-h*0.5-20,21,ASH,al,{italic:true,font:MONO});
  ctx.restore();ctx.globalAlpha=1;
}
// deterministic pseudo-random Neanderthal segment set for "person i"
function personSegs(i,n){
  const out=[];
  for(let k=0;k<(n||5);k++){
    const u0=0.04+rnd(i*7.3+k*2.1)*0.88;
    const w=0.012+rnd(i*3.1+k*5.7)*0.030;
    out.push({u0:u0,u1:Math.min(0.97,u0+w)});
  }
  return out;
}
// two skull profiles side by side — Neanderthal (heavy brow, long) vs modern (domed, chin)
function skull(ctx,cx,cy,s,kind,al,col){
  if(al<=0.005)return;
  ctx.save();ctx.globalAlpha=al;
  ctx.fillStyle=col||rgba('#D8C7A8',0.92);
  ctx.beginPath();
  if(kind==='nean'){
    // long, low cranium with a strong continuous browridge
    ctx.moveTo(cx-52*s,cy-6*s);
    ctx.bezierCurveTo(cx-54*s,cy-46*s,cx-16*s,cy-62*s,cx+18*s,cy-54*s);
    ctx.bezierCurveTo(cx+50*s,cy-46*s,cx+58*s,cy-20*s,cx+52*s,cy-2*s);
    ctx.lineTo(cx+56*s,cy+6*s);                       // brow shelf out front
    ctx.bezierCurveTo(cx+40*s,cy+16*s,cx+30*s,cy+14*s,cx+26*s,cy+22*s);
    ctx.bezierCurveTo(cx+34*s,cy+40*s,cx+16*s,cy+50*s,cx-2*s,cy+44*s);  // no chin
    ctx.bezierCurveTo(cx-24*s,cy+40*s,cx-44*s,cy+26*s,cx-52*s,cy-6*s);
  }else{
    // higher domed cranium, flat face, distinct chin
    ctx.moveTo(cx-46*s,cy-8*s);
    ctx.bezierCurveTo(cx-50*s,cy-56*s,cx-10*s,cy-72*s,cx+22*s,cy-58*s);
    ctx.bezierCurveTo(cx+48*s,cy-46*s,cx+50*s,cy-16*s,cx+44*s,cy+2*s);
    ctx.lineTo(cx+44*s,cy+8*s);
    ctx.bezierCurveTo(cx+34*s,cy+16*s,cx+30*s,cy+16*s,cx+28*s,cy+24*s);
    ctx.bezierCurveTo(cx+34*s,cy+46*s,cx+14*s,cy+54*s,cx-4*s,cy+46*s);  // chin
    ctx.bezierCurveTo(cx-26*s,cy+38*s,cx-40*s,cy+26*s,cx-46*s,cy-8*s);
  }
  ctx.closePath();ctx.fill();
  // eye socket
  ctx.fillStyle=rgba('#100B08',0.85);
  ctx.beginPath();ctx.ellipse(cx+(kind==='nean'?26:20)*s,cy+2*s,11*s,9*s,0.1,0,6.2832);ctx.fill();
  ctx.restore();ctx.globalAlpha=1;
}
// the river + tributary — absorption, not erasure
function river(ctx,t,al,merge){
  if(al<=0.005)return;
  ctx.save();ctx.globalAlpha=al;
  const yb=H*0.62;
  // main river
  ctx.strokeStyle=rgba(COOL,0.55);ctx.lineCap='round';
  for(let k=0;k<3;k++){
    ctx.lineWidth=[54,34,16][k];
    ctx.strokeStyle=rgba(['#2A3E4E','#35536A','#4A7391'][k],[0.55,0.6,0.45][k]);
    ctx.beginPath();
    for(let i=0;i<=90;i++){
      const u=i/90, x=W*0.06+u*W*0.90;
      const y=yb+Math.sin(u*5.0+t*0.20)*16+Math.sin(u*11+t*0.11)*6;
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.stroke();
  }
  // the tributary, joining and dissolving in
  const jx=W*0.46;
  for(let k=0;k<2;k++){
    ctx.lineWidth=[26,12][k];
    ctx.strokeStyle=rgba(k?'#E0602F':'#8E2E12',(k?0.75:0.6)*(1-merge*0.55));
    ctx.beginPath();
    for(let i=0;i<=60;i++){
      const u=i/60;
      const x=W*0.10+u*(jx-W*0.10);
      const y=H*0.20+u*u*(yb-H*0.20)+Math.sin(u*7+t*0.3)*7;
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.stroke();
  }
  // ember colour bleeding downstream after the join
  if(merge>0.01){
    ctx.lineWidth=30;
    for(let i=0;i<26;i++){
      const u=i/26;
      const x=jx+u*(W*0.96-jx);
      const y=yb+Math.sin(((x-W*0.06)/(W*0.90))*5.0+t*0.20)*16;
      ctx.globalAlpha=al*merge*0.30*(1-u*0.75);
      ctx.strokeStyle=rgba(EMBER,0.5);
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+W*0.045,y);ctx.stroke();
    }
  }
  ctx.restore();ctx.globalAlpha=1;
}
// a small generation chain: dots linked, one of them Neanderthal
function lineage(ctx,cx,cy,n,neanIdx,al,t){
  if(al<=0.005)return;
  const sp=118;
  ctx.save();ctx.globalAlpha=al;
  ctx.strokeStyle=rgba(ASH,0.5);ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(cx-(n-1)*sp/2,cy);ctx.lineTo(cx+(n-1)*sp/2,cy);ctx.stroke();
  for(let i=0;i<n;i++){
    const x=cx-(n-1)*sp/2+i*sp;
    const isN=(i===neanIdx);
    ctx.fillStyle=isN?rgba(EMBER2,0.95):rgba('#C9BDA8',0.85);
    ctx.beginPath();ctx.arc(x,cy,isN?15:11,0,6.2832);ctx.fill();
    if(isN){
      ctx.strokeStyle=rgba(EMBER,0.6);ctx.lineWidth=2.5;
      ctx.beginPath();ctx.arc(x,cy,15+7+3*Math.sin(t*2.2),0,6.2832);ctx.stroke();
    }
  }
  ctx.restore();ctx.globalAlpha=1;
}

/* ============================================================
   A — THE CRIME SCENE (0 .. 90)
   ============================================================ */
function sceneCrime(ctx,t){
  baseBg(ctx,t,0.14);
  if(t<38){
    line(ctx,'For a long time we told this story like a crime scene.',W*0.5,H*0.20,32,CREAM,env(t,0.6,2.0,7.0,8.4),{});
    // Neanderthal, left
    skull(ctx,W*0.30,H*0.48,1.7,'nean',env(t,5.8,7.6,36.0,37.6),rgba('#D8C7A8',0.92));
    line(ctx,'the Neanderthals',W*0.30,H*0.66,29,CREAM,env(t,6.0,7.4,36.0,37.6),{weight:700});
    line(ctx,'stocky · big-brained · cold-adapted',W*0.30,H*0.72,23,ASH,env(t,8.2,9.6,36.0,37.6),{italic:true});
    line(ctx,'the original Europeans — 200,000 years of getting on with things',W*0.30,H*0.77,20,ASH,env(t,10.8,12.2,36.0,37.6),{italic:true});
    // us, right
    skull(ctx,W*0.70,H*0.48,1.7,'sap',env(t,15.0,16.8,36.0,37.6),rgba('#EFE4CD',0.94));
    line(ctx,'then, out of Africa — us',W*0.70,H*0.66,29,CREAM,env(t,15.2,16.6,36.0,37.6),{weight:700});
    line(ctx,'taller · chattier · cleverer',W*0.70,H*0.72,23,ASH,env(t,19.0,20.4,36.0,37.6),{italic:true});
    line(ctx,'…or so we like to flatter ourselves',W*0.70,H*0.77,20,GOLD,env(t,21.9,23.2,36.0,37.6),{italic:true});
    // and then they're gone
    if(t>=24){
      // they don't get blacked out — they DISSOLVE (a hard rectangle read as a bug,
      // and it also prejudges the episode's own argument)
      const fade=ramp(t,31.5,34.8);
      if(fade>0.01){
        ctx.save();
        const rg=ctx.createRadialGradient(W*0.30,H*0.52,20,W*0.30,H*0.52,300);
        rg.addColorStop(0,rgba('#0A0806',fade*0.94));
        rg.addColorStop(0.62,rgba('#0A0806',fade*0.80));
        rg.addColorStop(1,'rgba(10,8,6,0)');
        ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
        ctx.restore();
      }
      line(ctx,'within a few thousand years of our arrival…',W*0.5,H*0.90,27,ASH,env(t,25.0,26.4,32.6,34.0),{italic:true});
      line(ctx,'the Neanderthals were gone.',W*0.30,H*0.47,30,EMBER2,env(t,33.0,34.2,36.4,37.8),{weight:700});
      line(ctx,'Every last one.',W*0.30,H*0.545,25,ASH,env(t,35.6,36.4,36.8,38.2),{italic:true});
    }
  }
  // the verb that wrote itself
  if(t>=38&&t<62){
    line(ctx,'You can see why the story wrote itself.',W*0.5,H*0.22,32,CREAM,env(t,38.4,39.8,60.0,61.4),{});
    line(ctx,'New humans arrive. Old humans vanish.',W*0.5,H*0.34,29,ASH,env(t,40.8,42.2,60.0,61.4),{italic:true});
    line(ctx,'And the obvious verb sitting in the middle is:',W*0.5,H*0.42,27,ASH,env(t,43.4,44.8,60.0,61.4),{italic:true});
    line(ctx,'replaced',W*0.5,H*0.53,54,CREAM,env(t,45.8,46.8,60.0,61.4),{weight:700});
    line(ctx,'…or, if you were feeling dramatic:  wiped out',W*0.5,H*0.63,30,EMBER2,env(t,48.4,49.6,60.0,61.4),{italic:true});
    line(ctx,'We cast ourselves as the clever newcomers,',W*0.5,H*0.76,26,CREAM,env(t,51.8,53.2,60.0,61.4),{});
    line(ctx,'and the Neanderthals as the doomed locals.',W*0.5,H*0.82,26,ASH,env(t,54.8,56.2,60.0,61.4),{italic:true});
    line(ctx,'Every textbook, for the better part of a century.',W*0.5,H*0.90,25,GOLD,env(t,58.4,59.6,60.2,61.6),{italic:true});
  }
  // the problem
  if(t>=62){
    const a=env(t,62.4,63.8,88.4,90.0);
    line(ctx,'Here’s the problem with that story.',W*0.5,H*0.16,34,CREAM,a,{weight:700});
    line(ctx,'If they were simply erased, replaced, gone —',W*0.5,H*0.28,29,ASH,env(t,64.6,66.0,88.4,90.0),{italic:true});
    line(ctx,'then they should be strangers to us. A dead-end branch.',W*0.5,H*0.35,29,ASH,env(t,68.4,69.8,88.4,90.0),{italic:true});
    if(t>=73){
      line(ctx,'So why is it that if your family tree runs anywhere outside Africa,',W*0.5,H*0.50,29,CREAM,env(t,73.4,74.8,88.4,90.0),{});
      line(ctx,'you are, at this very moment, carrying a piece of a Neanderthal',W*0.5,H*0.57,29,CREAM,env(t,77.0,78.4,88.4,90.0),{});
      line(ctx,'around inside your own body?',W*0.5,H*0.64,32,EMBER2,env(t,79.8,81.0,88.4,90.0),{weight:700});
    }
    if(t>=82){
      line(ctx,'That’s not a metaphor. That’s your DNA.',W*0.5,H*0.78,34,GOLD,env(t,82.2,83.4,88.4,90.0),{italic:true,weight:700});
      line(ctx,'The story we told was wrong in the most human way possible.',W*0.5,H*0.88,26,ASH,env(t,86.0,87.4,88.6,90.2),{italic:true});
    }
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   B — THE THING IN YOUR CELLS (90 .. 195)
   ============================================================ */
function sceneDNA(ctx,t){
  baseBg(ctx,t,0.18);
  kicker(ctx,'the thing in your cells',env(t,92,93.5,108,110));
  if(t>=90&&t<112){
    line(ctx,'Let’s start with the part people can never quite believe.',W*0.5,H*0.26,30,CREAM,env(t,90.6,92.0,96.4,97.8),{italic:true});
    line(ctx,'2010 — a heroic effort to pull ancient DNA out of crumbling bones.',W*0.5,H*0.40,29,CREAM,env(t,97.4,98.8,110.4,111.8),{});
    line(ctx,'A team led by Svante Pääbo published the first draft',W*0.5,H*0.50,28,ASH,env(t,102.8,104.2,110.4,111.8),{italic:true});
    line(ctx,'of the Neanderthal genome — and compared it to living people.',W*0.5,H*0.57,28,ASH,env(t,105.6,107.0,110.4,111.8),{italic:true});
    citation(ctx,'Green RE et al. 2010, Science 328:710 — draft Neanderthal genome',ramp(t,98,100));
  }
  // the strip, and the 1-2%
  if(t>=112&&t<140){
    const a=env(t,112.4,114.0,138.0,139.6);
    line(ctx,'What they found rewrote everything.',W*0.5,H*0.18,32,CREAM,env(t,111.9,113.2,124.0,125.4),{weight:700});
    genome(ctx,W*0.5,H*0.42,900,52,a,personSegs(1,5),ramp(t,118.4,121.4),'your genome');
    line(ctx,'1–2% Neanderthal DNA',W*0.5,H*0.58,52,EMBER2,env(t,119.6,121.2,138.0,139.6),{weight:700});
    line(ctx,'for anyone whose ancestry lies outside sub-Saharan Africa',W*0.5,H*0.66,25,ASH,env(t,116.4,117.8,138.0,139.6),{italic:true});
    if(t>=125){
      line(ctx,'Not “descended from something Neanderthal-ish.”',W*0.5,H*0.78,27,ASH,env(t,125.4,126.8,138.0,139.6),{italic:true});
      line(ctx,'Actual Neanderthal gene sequences, still switched into the human genome —',W*0.5,H*0.85,26,CREAM,env(t,129.4,130.8,138.0,139.6),{});
      line(ctx,'still doing things, tens of thousands of years later.',W*0.5,H*0.91,26,GOLD,env(t,134.6,136.0,138.2,139.8),{italic:true});
    }
  }
  // the fragments don't overlap
  if(t>=140&&t<175){
    const a=env(t,140.4,142.0,172.4,174.0);
    line(ctx,'1–2% doesn’t sound like much. But here’s the part that got me:',W*0.5,H*0.14,28,CREAM,env(t,140.0,141.4,156.0,157.4),{italic:true});
    line(ctx,'that 1–2% isn’t the same 1–2% in each person.',W*0.5,H*0.22,30,EMBER2,env(t,146.0,147.4,172.4,174.0),{weight:700});
    // three different people, three different segment sets
    const who=['you','me','someone across the world'];
    for(let i=0;i<3;i++){
      const ga=env(t,150.4+i*1.6,152.0+i*1.6,172.4,174.0); if(ga<0.01)continue;
      genome(ctx,W*0.5,H*0.36+i*0.10*H,840,40,ga,personSegs(i+2,5),1,who[i]);
    }
    if(t>=157){
      line(ctx,'They don’t fully overlap.',W*0.5,H*0.72,30,CREAM,env(t,155.0,156.2,172.4,174.0),{italic:true});
      line(ctx,'So gather every Neanderthal fragment scattered across everyone alive,',W*0.5,H*0.80,26,ASH,env(t,158.0,159.4,172.4,174.0),{italic:true});
      line(ctx,'lay them end to end…',W*0.5,H*0.86,26,ASH,env(t,163.4,164.6,172.4,174.0),{italic:true});
    }
  }
  // >20% reassembled
  if(t>=175){
    const a=env(t,175.0,176.6,193.4,195.0);
    // the reassembled Neanderthal genome. It must READ as "a fifth of it" —
    // scattered recovered pieces, not a filled bar.
    // ~20% coverage: 20 narrow recovered pieces scattered across 100 slots,
    // so the eye reads "a fifth of it", not a filled bar.
    const fill=ramp(t,166.5,171.5);
    const segs=[];
    const SLOTS=100;
    for(let i=0;i<SLOTS;i++){
      if(rnd(i*9.13)>0.20) continue;              // only a fifth of slots recovered
      const u0=i/SLOTS;
      if(u0>fill) break;                          // pieces arrive left-to-right
      segs.push({u0:u0+0.0015,u1:u0+(1/SLOTS)*0.72});
    }
    genome(ctx,W*0.5,H*0.34,900,58,env(t,166.0,168.0,193.4,195.0),segs,1,'the Neanderthal genome, reassembled from the living');
    line(ctx,'over 20%',W*0.5,H*0.50,64,GOLD,env(t,170.6,172.0,193.4,195.0),{weight:700});
    line(ctx,'of the entire Neanderthal genome — recovered out of living people',W*0.5,H*0.585,26,CREAM,env(t,172.4,173.8,193.4,195.0),{italic:true});
    if(t>=177){
      line(ctx,'The Neanderthals didn’t vanish into the ground.',W*0.5,H*0.70,32,CREAM,env(t,177.4,178.8,193.4,195.0),{weight:700});
      line(ctx,'A substantial chunk of them got up and walked into the future —',W*0.5,H*0.78,27,CREAM,env(t,180.4,181.8,193.4,195.0),{});
      line(ctx,'distributed across billions of us, like a book torn into pages',W*0.5,H*0.85,26,ASH,env(t,183.8,185.2,193.4,195.0),{italic:true});
      line(ctx,'and tucked into a billion different pockets.',W*0.5,H*0.91,26,ASH,env(t,186.6,187.8,193.4,195.0),{italic:true});
    }
    if(t>=189) line(ctx,'“Extinct” is not quite the right word for that.',W*0.5,H*0.975,27,EMBER2,env(t,189.8,191.0,193.6,195.2),{italic:true,weight:700});
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   C — SEVEN THOUSAND YEARS (195 .. 296)
   ============================================================ */
function timelineBand(ctx,t){
  // the mixing window drawn against deep time
  const x0=W*0.10,x1=W*0.90,y=H*0.50;
  const T0=56000,T1=38000;
  const px=v=>x0+(x1-x0)*clamp((T0-v)/(T0-T1),0,1);
  const a=ramp(t,230.6,232.6);
  ctx.save();ctx.globalAlpha=a;
  ctx.strokeStyle=rgba(ASH,0.5);ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();
  for(const v of [55000,50000,45000,40000]){
    ctx.beginPath();ctx.moveTo(px(v),y-7);ctx.lineTo(px(v),y+7);ctx.stroke();
    line(ctx,(v/1000)+'k',px(v),y+28,20,ASH,1,{font:MONO});
  }
  ctx.restore();
  // the 7,000-year band growing
  const grow=ramp(t,233.4,239.4);
  if(grow>0.01){
    const bx0=px(50500), bx1=px(50500-7000*grow);
    ctx.save();ctx.globalAlpha=a;
    const g=ctx.createLinearGradient(bx0,0,bx1,0);
    g.addColorStop(0,rgba(EMBER,0.85));g.addColorStop(1,rgba(EMBER2,0.55));
    ctx.fillStyle=g;ctx.fillRect(bx0,y-46,bx1-bx0,38);
    ctx.restore();
    line(ctx,'begins ~50,500 years ago',bx0,y-64,22,GOLD,ramp(t,234.6,236.2),{italic:true});
    if(grow>0.85) line(ctx,'≈ 7,000 years of continuous mixing',(bx0+bx1)/2,y-104,28,CREAM,ramp(t,239.0,240.6),{weight:700});
  }
  // the second team's independent window
  const t2=ramp(t,252.4,254.4);
  if(t2>0.01){
    const cx0=px(49000),cx1=px(45000);
    ctx.save();ctx.globalAlpha=t2*a;
    ctx.strokeStyle=rgba(GOLD,0.9);ctx.lineWidth=2.5;ctx.setLineDash([8,6]);
    ctx.strokeRect(cx0,y+44,cx1-cx0,34);ctx.setLineDash([]);ctx.restore();
    line(ctx,'second team: 45–49,000 years ago',(cx0+cx1)/2,y+104,23,GOLD,t2,{italic:true});
  }
}
function sceneSeven(ctx,t){
  baseBg(ctx,t,0.18);
  kicker(ctx,'when, exactly?',env(t,197,198.5,212,214));
  if(t>=195&&t<213){
    line(ctx,'For years everyone knew the fact of the interbreeding —',W*0.5,H*0.30,29,CREAM,env(t,195.6,197.0,211.4,212.8),{});
    line(ctx,'but was fuzzy on the shape of it.',W*0.5,H*0.30+42,29,ASH,env(t,198.4,199.8,211.4,212.8),{italic:true});
    const qs=[['When did it happen?',202.4],['How?',204.0],['One dramatic encounter — a prehistoric Romeo and Juliet?',205.4],['Or something slower?',209.6]];
    for(let i=0;i<qs.length;i++){
      const a=env(t,qs[i][1],qs[i][1]+1.0,211.4,212.8); if(a<0.01)continue;
      line(ctx,qs[i][0],W*0.5,H*0.50+i*44,i===2?26:28,i===3?GOLD:CREAM,a,{italic:i>=2});
    }
  }
  if(t>=213&&t<262){
    line(ctx,'December 2024 — two teams answered with real precision.',W*0.5,H*0.16,29,CREAM,env(t,213.4,214.8,258.0,259.4),{});
    if(t>=221&&t<232){
      line(ctx,'The main pulse wasn’t a single night.',W*0.5,H*0.36,32,CREAM,env(t,221.6,223.0,230.0,231.4),{});
      line(ctx,'Not a single generation. Not even a single century.',W*0.5,H*0.36+46,29,ASH,env(t,225.4,226.8,230.0,231.4),{italic:true});
    }
    timelineBand(ctx,t);
    if(t>=241) line(ctx,'…and lasted about 7,000 years.',W*0.5,H*0.86,34,EMBER2,env(t,241.4,242.6,258.0,259.4),{italic:true,weight:700});
    if(t>=257) line(ctx,'Two approaches. Two sets of bones. The same stretch of deep time.',W*0.5,H*0.93,25,CREAM,env(t,257.4,258.8,260.4,261.8),{italic:true});
    citation(ctx,'Iasi LNM et al. & Sümer AP et al. 2024/2025, Science & Nature',ramp(t,214,216));
  }
  // sit with that number
  if(t>=262){
    const a=env(t,262.4,264.0,294.4,296.0);
    ctx.fillStyle=rgba('#000000',a*0.55);ctx.fillRect(0,0,W,H);
    line(ctx,'7,000 years.',W*0.5,H*0.22,72,CREAM,a,{weight:700});
    line(ctx,'Sit with that number — it quietly detonates the old story.',W*0.5,H*0.33,28,GOLD,env(t,265.6,267.0,294.4,296.0),{italic:true});
    if(t>=269){
      line(ctx,'That’s not an affair in the tabloid sense. Not a scandalous moment.',W*0.5,H*0.46,28,ASH,env(t,269.4,270.8,294.4,296.0),{italic:true});
      line(ctx,'That’s an affair in the geological sense.',W*0.5,H*0.54,34,EMBER2,env(t,274.2,275.4,294.4,296.0),{weight:700});
    }
    if(t>=277){
      line(ctx,'7,000 years is longer than all of recorded history.',W*0.5,H*0.66,30,CREAM,env(t,277.0,278.4,294.4,296.0),{});
      line(ctx,'Hundreds of generations of two kinds of human',W*0.5,H*0.745,27,CREAM,env(t,281.0,282.4,294.4,296.0),{});
      line(ctx,'living in the same valleys · meeting at the same rivers',W*0.5,H*0.805,26,ASH,env(t,283.8,285.2,294.4,296.0),{italic:true});
      line(ctx,'falling in together, and raising children.',W*0.5,H*0.87,29,GOLD,env(t,291.8,293.0,294.6,296.2),{italic:true,weight:700});
    }
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   D — A FACE ON THE NUMBER (296 .. 396)
   ============================================================ */
function sceneOase(ctx,t){
  baseBg(ctx,t,0.22);
  kicker(ctx,'a face on the number',env(t,314,315.5,330,332));
  if(t>=296&&t<308){
    line(ctx,'This wasn’t a collision.',W*0.5,H*0.34,36,CREAM,env(t,296.4,297.6,306.4,307.8),{weight:700});
    line(ctx,'It was a very long, slow blending.',W*0.5,H*0.34+50,34,EMBER2,env(t,298.6,299.8,306.4,307.8),{italic:true});
    line(ctx,'For 7,000 years on the same landscape,',W*0.5,H*0.58,28,CREAM,env(t,301.2,302.6,306.4,307.8),{});
    line(ctx,'us and them were quietly, repeatedly, just us.',W*0.5,H*0.58+42,30,GOLD,env(t,304.0,305.2,306.6,308.0),{italic:true,weight:700});
  }
  if(t>=308&&t<342){
    const a=env(t,308.4,310.0,340.0,341.6);
    line(ctx,'And every now and then the deep past hands you a single person',W*0.5,H*0.14,27,ASH,env(t,308.2,309.6,318.0,319.4),{italic:true});
    line(ctx,'who makes all of this stop being statistics.',W*0.5,H*0.20,27,ASH,env(t,311.6,313.0,318.0,319.4),{italic:true});
    line(ctx,'Peștera cu Oase, Romania',W*0.5,H*0.30,36,CREAM,env(t,314.4,315.8,340.0,341.6),{weight:700});
    line(ctx,'the jaw of a modern human man who lived ~40,000 years ago',W*0.5,H*0.37,26,ASH,env(t,318.4,319.8,340.0,341.6),{italic:true});
    // his genome — dramatically more Neanderthal, in long unbroken chunks
    const segs=[{u0:0.06,u1:0.15},{u0:0.28,u1:0.40},{u0:0.52,u1:0.63},{u0:0.74,u1:0.86}];
    genome(ctx,W*0.5,H*0.52,880,54,env(t,327.0,328.8,340.0,341.6),segs,1,'Oase 1');
    if(t>=327){
      line(ctx,'6–9% Neanderthal DNA',W*0.5,H*0.66,44,EMBER2,env(t,327.8,329.2,340.0,341.6),{weight:700});
      line(ctx,'several times what anyone alive today carries',W*0.5,H*0.735,26,CREAM,env(t,331.6,333.0,340.0,341.6),{italic:true});
      line(ctx,'and it came in long, unbroken chunks —',W*0.5,H*0.80,27,CREAM,env(t,334.4,335.8,340.0,341.6),{});
      line(ctx,'the genetic fingerprint of a recent mixing.',W*0.5,H*0.86,27,GOLD,env(t,337.6,338.8,340.2,341.8),{italic:true});
    }
    citation(ctx,'Fu Q et al. 2015, Nature 524:216 — Oase 1',a);
  }
  // four to six generations
  if(t>=342&&t<367){
    const a=env(t,342.0,343.6,365.0,366.6);
    line(ctx,'How recent?',W*0.5,H*0.20,34,CREAM,env(t,341.8,343.0,352.0,353.4),{weight:700});
    line(ctx,'A Neanderthal ancestor just four to six generations back —',W*0.5,H*0.30,29,CREAM,env(t,343.8,345.2,365.0,366.6),{});
    line(ctx,'a great-great-grandparent, give or take.',W*0.5,H*0.37,28,GOLD,env(t,347.8,349.0,365.0,366.6),{italic:true});
    lineage(ctx,W*0.5,H*0.54,6,0,env(t,345.0,347.0,365.0,366.6),t);
    if(t>=352){
      line(ctx,'Close enough that his grandparents might have told stories about it.',W*0.5,H*0.68,27,CREAM,env(t,352.8,354.2,365.0,366.6),{italic:true});
      line(ctx,'There was a Neanderthal. A specific individual.',W*0.5,H*0.77,30,EMBER2,env(t,356.4,357.8,365.0,366.6),{weight:700});
      line(ctx,'Someone who fell in love, or was taken, or simply built a life',W*0.5,H*0.85,26,CREAM,env(t,359.8,361.2,365.0,366.6),{});
      line(ctx,'across a line we’d always assumed was uncrossable.',W*0.5,H*0.91,26,GOLD,env(t,362.4,363.6,365.2,366.8),{italic:true});
    }
  }
  // the poignant footnote
  if(t>=367){
    const a=env(t,367.0,368.6,394.4,396.0);
    line(ctx,'Here’s the poignant footnote — I include it because the honesty is the whole game.',W*0.5,H*0.20,25,ASH,a,{italic:true});
    line(ctx,'As far as we can tell, this man left no descendants among people alive today.',W*0.5,H*0.34,27,CREAM,env(t,371.4,372.8,394.4,396.0),{});
    line(ctx,'His branch ended.',W*0.5,H*0.42,34,EMBER2,env(t,376.4,377.6,394.4,396.0),{weight:700});
    // the lineage, with the line stopping
    lineage(ctx,W*0.5,H*0.56,6,0,env(t,371.0,373.0,394.4,396.0),t);
    if(t>=377){
      ctx.save();ctx.globalAlpha=env(t,377.4,378.6,394.4,396.0);
      ctx.strokeStyle=rgba(ASH,0.8);ctx.lineWidth=3;
      const ex=W*0.5+(5-2.5)*118;
      ctx.beginPath();ctx.moveTo(ex+26,H*0.56-20);ctx.lineTo(ex+52,H*0.56+20);
      ctx.moveTo(ex+52,H*0.56-20);ctx.lineTo(ex+26,H*0.56+20);ctx.stroke();
      ctx.restore();ctx.globalAlpha=1;
    }
    if(t>=379){
      line(ctx,'So the Neanderthal DNA in you doesn’t come from him.',W*0.5,H*0.70,27,ASH,env(t,379.0,380.4,394.4,396.0),{italic:true});
      line(ctx,'It comes from that long 7,000-year blending, further back.',W*0.5,H*0.76,27,ASH,env(t,382.4,383.8,394.4,396.0),{italic:true});
    }
    if(t>=387){
      line(ctx,'But he’s proof of concept. He’s a face on the number.',W*0.5,H*0.86,30,CREAM,env(t,387.2,388.4,394.4,396.0),{});
      line(ctx,'Somewhere out there was a family that was literally both kinds of human at once.',W*0.5,H*0.93,25,GOLD,env(t,391.0,392.4,394.6,396.2),{italic:true});
    }
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   E — IT WENT BOTH WAYS (396 .. 477)
   ============================================================ */
function sceneBothWays(ctx,t){
  baseBg(ctx,t,0.20);
  kicker(ctx,'one more twist',env(t,398,399.5,414,416));
  if(t>=396&&t<416){
    line(ctx,'There’s one more twist —',W*0.5,H*0.28,32,CREAM,env(t,396.8,398.2,414.0,415.4),{});
    line(ctx,'the one that finally retired the “conquerors and losers” story for me.',W*0.5,H*0.28+44,28,GOLD,env(t,399.4,400.8,414.0,415.4),{italic:true});
    line(ctx,'We’ve been talking as if the genes flowed only one direction:',W*0.5,H*0.50,28,CREAM,env(t,405.4,406.8,414.0,415.4),{});
    // one-way arrow, then it breaks
    const oneWay=env(t,409.0,410.4,414.0,415.4);
    if(oneWay>0.01){
      arrow(ctx,W*0.34,H*0.62,W*0.66,H*0.62,oneWay,ASH);
      line(ctx,'Neanderthal',W*0.30,H*0.62,25,ASH,oneWay,{italic:true,align:'right'});
      line(ctx,'us',W*0.70,H*0.62,25,ASH,oneWay,{italic:true,align:'left'});
    }
    line(ctx,'But it wasn’t one way.',W*0.5,H*0.76,34,EMBER2,env(t,414.6,415.6,417.4,418.8),{weight:700});
  }
  if(t>=416&&t<442){
    const a=env(t,416.6,418.2,440.0,441.6);
    line(ctx,'When they sequenced the Neanderthal woman from a cave',W*0.5,H*0.18,28,CREAM,env(t,416.8,418.2,440.0,441.6),{});
    line(ctx,'in the Altai Mountains of Siberia —',W*0.5,H*0.25,28,ASH,env(t,419.4,420.6,440.0,441.6),{italic:true});
    // HER genome, with modern-human segments inside it
    const segs=[{u0:0.12,u1:0.18},{u0:0.36,u1:0.44},{u0:0.62,u1:0.68},{u0:0.82,u1:0.88}];
    ctx.save();
    // draw with the palette inverted: ember baseline, cool segments = modern human DNA
    ctx.globalAlpha=1;
    genome(ctx,W*0.5,H*0.42,880,54,env(t,421.6,423.4,440.0,441.6),[],1,'her genome — an Altai Neanderthal');
    // modern-human inserts drawn in cool blue
    const ga=env(t,423.4,425.4,440.0,441.6);
    if(ga>0.01){
      ctx.globalAlpha=ga;
      for(const s of segs){
        const x0=W*0.5-440+880*s.u0, x1=W*0.5-440+880*s.u1;
        const sg=ctx.createLinearGradient(0,H*0.42-27,0,H*0.42+27);
        sg.addColorStop(0,'#8FB6CE');sg.addColorStop(0.5,'#5A7C93');sg.addColorStop(1,'#35536A');
        ctx.fillStyle=sg;
        ctx.beginPath();ctx.roundRect(x0,H*0.42-25.5,Math.max(3,x1-x0),51,15);ctx.fill();
      }
      ctx.globalAlpha=1;
    }
    ctx.restore();
    if(t>=421) line(ctx,'they found modern human DNA sitting inside her genome.',W*0.5,H*0.56,30,COOL,env(t,421.8,423.2,440.0,441.6),{weight:700});
    if(t>=426){
      line(ctx,'The signature of an even older encounter — maybe ~100,000 years ago,',W*0.5,H*0.68,27,CREAM,env(t,426.4,427.8,440.0,441.6),{});
      line(ctx,'long before the famous 7,000-year affair in Europe.',W*0.5,H*0.745,26,ASH,env(t,431.8,433.2,440.0,441.6),{italic:true});
      line(ctx,'Early members of our lineage had, way back, contributed to theirs.',W*0.5,H*0.83,27,GOLD,env(t,435.8,437.2,440.2,441.8),{italic:true});
    }
    citation(ctx,'Kuhlwilm M et al. 2016, Nature 530:429 — Altai Neanderthal',a);
  }
  if(t>=442){
    const a=env(t,442.4,444.0,475.4,477.0);
    line(ctx,'So this wasn’t a takeover with a winner and a loser.',W*0.5,H*0.20,30,CREAM,a,{});
    line(ctx,'It was a genuine two-way exchange —',W*0.5,H*0.28,32,EMBER2,env(t,445.0,446.4,475.4,477.0),{weight:700});
    // arrows both ways
    const bw=env(t,447.0,448.6,475.4,477.0);
    if(bw>0.01){
      arrow(ctx,W*0.36,H*0.40,W*0.64,H*0.40,bw,EMBER2);
      arrow(ctx,W*0.64,H*0.47,W*0.36,H*0.47,bw,COOL);
      line(ctx,'them',W*0.32,H*0.435,25,ASH,bw,{italic:true,align:'right'});
      line(ctx,'us',W*0.68,H*0.435,25,ASH,bw,{italic:true,align:'left'});
    }
    if(t>=451) line(ctx,'running in both directions, across an enormous span of time.',W*0.5,H*0.58,27,ASH,env(t,451.4,452.8,475.4,477.0),{italic:true});
    if(t>=457){
      line(ctx,'Less an invasion —',W*0.5,H*0.68,30,CREAM,env(t,457.4,458.6,475.4,477.0),{});
      line(ctx,'and more a very long, very tangled family reunion',W*0.5,H*0.755,30,GOLD,env(t,459.6,461.0,475.4,477.0),{italic:true});
      line(ctx,'that nobody planned and nobody wrote down.',W*0.5,H*0.82,27,ASH,env(t,462.0,463.2,475.4,477.0),{italic:true});
    }
    if(t>=470){
      line(ctx,'The relationship was never one of predator and prey.',W*0.5,H*0.90,28,CREAM,env(t,470.4,471.8,475.4,477.0),{});
      line(ctx,'It was one of neighbours.',W*0.5,H*0.96,32,EMBER2,env(t,474.8,475.6,476.4,478.0),{italic:true,weight:700});
    }
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   F — NOT EXTINCT. ABSORBED. (477 .. 525)
   ============================================================ */
function sceneExtinct(ctx,t){
  baseBg(ctx,t,0.20);
  kicker(ctx,'that word — extinct',env(t,479,480.5,494,496));
  if(t>=477&&t<499){
    line(ctx,'So let’s go back to that word. Extinct.',W*0.5,H*0.26,34,CREAM,env(t,477.6,479.0,497.0,498.4),{weight:700});
    line(ctx,'We say they went extinct ~40,000 years ago — and in one narrow sense, that’s true.',W*0.5,H*0.38,26,ASH,env(t,481.8,483.2,497.0,498.4),{italic:true});
    line(ctx,'There’s no separate Neanderthal population out there. No hidden valley of them.',W*0.5,H*0.46,26,CREAM,env(t,488.2,489.6,497.0,498.4),{});
    if(t>=493){
      line(ctx,'But “extinct” carries a whiff of total erasure. Of a door closing forever.',W*0.5,H*0.62,28,CREAM,env(t,493.6,495.0,497.4,498.8),{italic:true});
      line(ctx,'And that is not what the DNA shows.',W*0.5,H*0.70,32,EMBER2,env(t,498.8,500.0,501.4,502.8),{weight:700});
    }
  }
  if(t>=499){
    const a=env(t,502.0,503.8,523.4,525.0);
    line(ctx,'What the DNA shows is closer to absorption.',W*0.5,H*0.16,32,CREAM,env(t,502.4,503.8,523.4,525.0),{weight:700});
    river(ctx,t,a,ramp(t,513.0,519.0));
    if(t>=505){
      line(ctx,'Two kinds of human met, and over 7,000 years',W*0.5,H*0.26,27,ASH,env(t,505.6,507.0,523.4,525.0),{italic:true});
      line(ctx,'the smaller population didn’t so much die out',W*0.5,H*0.32,27,CREAM,env(t,509.4,510.8,523.4,525.0),{});
      line(ctx,'as get folded in. Dissolved into the larger one.',W*0.5,H*0.38,28,GOLD,env(t,512.8,514.2,523.4,525.0),{italic:true});
    }
    if(t>=518){
      line(ctx,'Like a tributary joining a river.',W*0.5,H*0.82,34,CREAM,env(t,518.4,519.6,523.4,525.0),{weight:700});
      line(ctx,'The river keeps the name of the bigger stream — but the water is mixed.',W*0.5,H*0.90,27,EMBER2,env(t,521.2,522.4,523.6,525.2),{italic:true});
    }
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   G — THEY'RE YOUR FAMILY (525 .. 616)
   ============================================================ */
function sceneFamily(ctx,t){
  const shrink=ramp(t,600,612);
  baseBg(ctx,t,0.30*(1-shrink*0.5));
  const fx=W*0.5,fy=H*0.94;
  fireGlow(ctx,fx,fy,0.5*(1-shrink*0.6),t);
  if(t>=525&&t<543){
    line(ctx,'This is the strongest identity hook in all of prehistory,',W*0.5,H*0.26,28,ASH,env(t,525.4,526.8,541.4,542.8),{italic:true});
    line(ctx,'so I’m going to say it as plainly as I can:',W*0.5,H*0.33,28,ASH,env(t,529.4,530.6,541.4,542.8),{italic:true});
    line(ctx,'This is not a story about them.',W*0.5,H*0.46,40,CREAM,env(t,531.6,532.8,541.4,542.8),{weight:700});
    if(t>=534){
      line(ctx,'If your ancestry runs outside Africa,',W*0.5,H*0.60,30,CREAM,env(t,534.0,535.2,541.4,542.8),{});
      line(ctx,'the Neanderthals are not a separate species you’re reading about in a book.',W*0.5,H*0.67,26,ASH,env(t,537.2,538.6,541.4,542.8),{italic:true});
      line(ctx,'They’re your family.',W*0.5,H*0.77,42,EMBER2,env(t,540.6,541.6,543.4,544.8),{weight:700});
    }
  }
  if(t>=543&&t<563){
    const a=env(t,543.0,544.6,561.4,562.8);
    line(ctx,'A great-great-something-grandparent,',W*0.5,H*0.20,30,CREAM,a,{});
    line(ctx,'contributing a percent or two of the instructions',W*0.5,H*0.27,27,ASH,env(t,546.0,547.4,561.4,562.8),{italic:true});
    line(ctx,'that built the body you’re sitting in.',W*0.5,H*0.335,27,ASH,env(t,548.8,550.0,561.4,562.8),{italic:true});
    const bits=[['the heavy brow',551.0],['the cold-country lungs',552.4],
                ['bits of your immune system',553.8],['quirks of your skin, and your sleep',555.4]];
    for(let i=0;i<bits.length;i++){
      const ba=env(t,bits[i][1],bits[i][1]+1.0,561.4,562.8); if(ba<0.01)continue;
      line(ctx,'—  '+bits[i][0],W*0.5,H*0.46+i*42,27,i===3?GOLD:CREAM,ba,{italic:i===3});
    }
    if(t>=557) line(ctx,'Inheritance from a kind of human the textbooks call “the dead end.”',W*0.5,H*0.86,27,EMBER2,env(t,557.4,558.8,561.6,563.0),{italic:true});
  }
  if(t>=563&&t<590){
    const a=env(t,563.4,565.0,588.0,589.6);
    line(ctx,'The long dawn of the human mind, it turns out,',W*0.5,H*0.24,30,CREAM,env(t,563.6,565.0,588.0,589.6),{});
    line(ctx,'was never lit by just one kind of human.',W*0.5,H*0.31,32,GOLD,env(t,566.0,567.2,588.0,589.6),{italic:true,weight:700});
    line(ctx,'For a good stretch of it, there were several of us.',W*0.5,H*0.40,29,CREAM,env(t,568.4,569.8,588.0,589.6),{});
    // two skulls, drawing together — sit them high so the closing copy has room
    const conv=ramp(t,575.0,584.0);
    const gap=(1-conv)*0.13;
    skull(ctx,W*(0.42-gap),H*0.555,1.35,'nean',a,rgba('#D8C7A8',0.9));
    skull(ctx,W*(0.58+gap),H*0.555,1.35,'sap',a,rgba('#EFE4CD',0.92));
    if(t>=571) line(ctx,'Cousins sharing a cold continent.',W*0.5,H*0.73,28,ASH,env(t,571.4,572.8,588.0,589.6),{italic:true});
    if(t>=575){
      line(ctx,'And where they overlapped, they did the most human thing imaginable.',W*0.5,H*0.82,26,CREAM,env(t,575.4,576.8,588.0,589.6),{});
      line(ctx,'They didn’t only fight. And they didn’t only flee.',W*0.5,H*0.90,28,GOLD,env(t,578.0,579.4,588.0,589.6),{italic:true});
    }
  }
  if(t>=590){
    const a=env(t,590.0,591.6,614.0,616.0);
    line(ctx,'Sometimes — for 7,000 years’ worth of “sometimes” —',W*0.5,H*0.26,30,CREAM,env(t,582.0,583.6,600.0,601.4),{italic:true});
    line(ctx,'they reached across the gap and made a family.',W*0.5,H*0.35,36,EMBER2,env(t,586.2,587.4,600.0,601.4),{weight:700});
    line(ctx,'You’re what came of it.',W*0.5,H*0.50,42,CREAM,env(t,590.8,592.0,606.0,607.4),{weight:700});
    if(t>=592){
      line(ctx,'You are, in a small and permanent way,',W*0.5,H*0.62,29,CREAM,env(t,592.6,594.0,610.0,611.4),{});
      line(ctx,'the surviving evidence of the longest love story we have ever found.',W*0.5,H*0.69,29,GOLD,env(t,595.4,596.8,610.0,611.4),{italic:true,weight:700});
    }
    if(t>=599) line(ctx,'Carry it well.',W*0.5,H*0.80,38,CREAM,env(t,599.9,600.8,606.4,607.8),{italic:true,weight:700});
    // sign-off
    const so=ramp(t,606.5,609.5);
    if(so>0.01){
      ctx.fillStyle=rgba('#000000',so*0.82);ctx.fillRect(0,0,W,H);
      drawHand(ctx,W*0.5,H*0.42,0.58,so,EMBER,true);
      line(ctx,'ANCIENT FIRELIGHT',W*0.5,H*0.72,40,CREAM,so,{});
      line(ctx,'NEXT — the worst mistake in the history of the human race',W*0.5,H*0.79,24,ASH,ramp(t,608.4,610.4),{italic:true});
    }
  }
  vignette(ctx);grain(ctx,t);
}

/* ============================================================
   EPISODE
   ============================================================ */
window.EPISODE={
  duration:616.0,
  bounds:[90,195,296,396,477,525],
  ghostNames:['lions','hands'],
  render:function(ctx,t){
    if(t<90)        sceneCrime(ctx,t);
    else if(t<195)  sceneDNA(ctx,t);
    else if(t<296)  sceneSeven(ctx,t);
    else if(t<396)  sceneOase(ctx,t);
    else if(t<477)  sceneBothWays(ctx,t);
    else if(t<525)  sceneExtinct(ctx,t);
    else            sceneFamily(ctx,t);
  }
};
