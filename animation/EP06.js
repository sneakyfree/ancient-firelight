/* Ancient Firelight — EP06 "The Worst Mistake"
   Master: voice/EP06_Worst_Mistake_MASTER.wav  (534.7s)
   Loaded AFTER engine.js.

   The spine is a WEEK — a 7-day grid of hours that starts as the famous 15 and
   fills up as the uncounted work gets added back. The episode is the channel's
   own thesis, so it closes on the fire itself.

   Scene map:
     A PARADISE  0   .. 74    let me sell you a paradise — and the fall, and the villain (the plough)
     B NUMBER    74  .. 167   Richard Lee, the Ju/'hoansi, the 15 hours, "the original affluent society"
     C LEFTOUT   167 .. 235   15 hours spent doing WHAT? the list the number left out
     D FORTYTWO  235 .. 288   Lee's fuller accounting: ~42 hours. A category error, not a lie.
     E WHYSTUCK  288 .. 350   why the story travelled: it consoles. The channel's whole ethic.
     F BONES     350 .. 440   the farming-was-hard evidence is real — and the osteological paradox
     G KILLED    440 .. 500   what the data actually killed: the fairy tale, and the habit of mind
     H REAL      500 .. 535   the real ancestors are better, because they're real
*/

/* ---------- EP06 primitives ---------- */

// THE WEEK — 7 columns of 24 hour-cells. Filling it is the whole argument.
// bands: [{hours, col, label}] stacked from the bottom of each day.
const WEEK_D=['M','T','W','T','F','S','S'];
function week(ctx,cx,cy,w,h,al,bands,litDays){
  if(al<=0.005)return;
  const cols=7, gap=w*0.018;
  const cw=(w-gap*(cols-1))/cols;
  const rowH=h/16;                       // show 16 waking hours per day
  ctx.save();ctx.globalAlpha=al;
  for(let d=0;d<cols;d++){
    const x=cx-w/2+d*(cw+gap);
    // the empty day
    ctx.fillStyle=rgba('#1A2029',0.85);
    ctx.beginPath();ctx.roundRect(x,cy-h/2,cw,h,5);ctx.fill();
    ctx.strokeStyle=rgba(COOL,0.22);ctx.lineWidth=1;
    ctx.beginPath();ctx.roundRect(x,cy-h/2,cw,h,5);ctx.stroke();
    // hour ticks
    ctx.strokeStyle=rgba(COOL,0.13);
    for(let r=1;r<16;r++){
      const y=cy+h/2-r*rowH;
      ctx.beginPath();ctx.moveTo(x+2,y);ctx.lineTo(x+cw-2,y);ctx.stroke();
    }
    line(ctx,WEEK_D[d],x+cw/2,cy+h/2+22,20,ASH,al*0.8,{font:MONO});
  }
  // stack the bands, day by day, hours spilling across days
  let used=new Array(cols).fill(0);
  for(const b of (bands||[])){
    if(b.hours<=0)continue;
    let left=b.hours;
    for(let d=0;d<cols && left>0.001;d++){
      const room=16-used[d];
      if(room<=0.001)continue;
      const take=Math.min(room,left,b.perDay||16);
      const x=cx-w/2+d*(cw+gap);
      const y0=cy+h/2-used[d]*rowH;
      const y1=y0-take*rowH;
      const g=ctx.createLinearGradient(0,y0,0,y1);
      g.addColorStop(0,b.c0);g.addColorStop(1,b.c1);
      ctx.fillStyle=g;
      ctx.beginPath();ctx.roundRect(x+1.5,y1,cw-3,y0-y1,3);ctx.fill();
      used[d]+=take;left-=take;
    }
  }
  ctx.restore();ctx.globalAlpha=1;
  return used;
}
// the mongongo nut + the rock that cracks it, over and over
function nut(ctx,cx,cy,s,al,hit){
  if(al<=0.005)return;
  ctx.save();ctx.globalAlpha=al;
  // the nut
  const g=ctx.createRadialGradient(cx-6*s,cy-8*s,3,cx,cy,30*s);
  g.addColorStop(0,'#7E5A38');g.addColorStop(0.6,'#5A3E26');g.addColorStop(1,'#3A2716');
  ctx.fillStyle=g;
  ctx.beginPath();ctx.ellipse(cx,cy,26*s,21*s,0.2,0,6.2832);ctx.fill();
  // the rock, coming down
  const drop=(1-hit)*54*s;
  ctx.fillStyle=rgba('#4A4238',0.95);
  ctx.beginPath();
  ctx.moveTo(cx-30*s,cy-46*s-drop);
  ctx.lineTo(cx+28*s,cy-52*s-drop);
  ctx.lineTo(cx+34*s,cy-22*s-drop);
  ctx.lineTo(cx-24*s,cy-18*s-drop);
  ctx.closePath();ctx.fill();
  // impact chips
  if(hit>0.85){
    const k=(hit-0.85)/0.15;
    ctx.globalAlpha=al*(1-k);
    ctx.fillStyle=rgba('#C9BDA8',0.9);
    for(let i=0;i<7;i++){
      const a0=Math.PI+rnd(i)*Math.PI;
      const rr=k*40*s;
      ctx.beginPath();ctx.arc(cx+Math.cos(a0)*rr,cy+Math.sin(a0)*rr*0.5,2.2*s,0,6.2832);ctx.fill();
    }
  }
  ctx.restore();ctx.globalAlpha=1;
}
// a plough — the villain of the fairy tale
function plough(ctx,cx,cy,s,al){
  if(al<=0.005)return;
  ctx.save();ctx.globalAlpha=al;
  ctx.strokeStyle=rgba('#3A2A1C',0.95);ctx.fillStyle=rgba('#3A2A1C',0.95);
  ctx.lineWidth=8*s;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(cx-72*s,cy-46*s);ctx.lineTo(cx+30*s,cy+18*s);ctx.stroke();  // beam
  ctx.beginPath();ctx.moveTo(cx-72*s,cy-46*s);ctx.lineTo(cx-96*s,cy-24*s);ctx.stroke();  // handle
  ctx.beginPath();                                                                        // share
  ctx.moveTo(cx+26*s,cy+8*s);ctx.lineTo(cx+70*s,cy+34*s);
  ctx.lineTo(cx+40*s,cy+46*s);ctx.lineTo(cx+14*s,cy+26*s);ctx.closePath();ctx.fill();
  ctx.restore();ctx.globalAlpha=1;
}
// two skeleton-height bars: forager vs early farmer
function heights(ctx,cx,cy,al,t){
  if(al<=0.005)return;
  const g1=ramp(t,366.0,368.5), g2=ramp(t,367.4,370.0);
  const base=cy+120;
  const draw=(x,hh,col,lab,sub,a)=>{
    ctx.save();ctx.globalAlpha=a;
    ctx.fillStyle=col;
    ctx.beginPath();ctx.roundRect(x-52,base-hh,104,hh,6);ctx.fill();
    ctx.restore();ctx.globalAlpha=1;
    line(ctx,lab,x,base+28,24,CREAM,a,{});
    if(sub) line(ctx,sub,x,base+56,21,ASH,a,{italic:true});
  };
  ctx.save();ctx.globalAlpha=al;
  ctx.strokeStyle=rgba(ASH,0.45);ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(cx-230,base);ctx.lineTo(cx+230,base);ctx.stroke();
  ctx.restore();
  draw(cx-130,236*g1,rgba(GOLD,0.8),'foragers',null,al*g1);
  draw(cx+130,176*g2,rgba(EMBER,0.85),'early farmers','shorter',al*g2);
  // dashed line across from the forager height so the drop is unmistakable
  if(g2>0.4){
    ctx.save();ctx.globalAlpha=al*g2*0.8;
    ctx.strokeStyle=rgba(GOLD,0.7);ctx.lineWidth=2;ctx.setLineDash([7,7]);
    ctx.beginPath();ctx.moveTo(cx-186,base-236);ctx.lineTo(cx+196,base-236);ctx.stroke();
    ctx.setLineDash([]);ctx.restore();ctx.globalAlpha=1;
  }
}

/* ============================================================
   A — LET ME SELL YOU A PARADISE (0 .. 74)
   ============================================================ */
function scenePara(ctx,t){
  // opens warm and golden — this is the seductive version
  const g=ctx.createLinearGradient(0,0,0,H);
  const warm=ramp(t,0,7)*(1-ramp(t,38,46)*0.75);   // it curdles at "and then we ruined it"
  g.addColorStop(0,mix('#0E1620','#3E2A18',warm*0.85));
  g.addColorStop(0.5,mix('#0B1219','#573A20',warm*0.62));
  g.addColorStop(1,mix('#080B0F','#2A1B11',warm*0.7));
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  strokes(ctx,t,120,['#6B4326','#8A5A2E','#3E2A18'],0.12*warm+0.04,0,H*0.72,1.1);
  strokes(ctx,t,55,['#C4451F','#E0A050','#7A4520'],0.09*warm+0.03,H*0.42,H,1.3);
  {const sx=W*0.78,sy=H*0.24;
   const sg=ctx.createRadialGradient(sx,sy,6,sx,sy,430);
   sg.addColorStop(0,rgba('#F0C070',0.28*warm));
   sg.addColorStop(0.4,rgba('#C4451F',0.12*warm));
   sg.addColorStop(1,'rgba(20,16,14,0)');ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);}

  if(t<40){
    line(ctx,'Let me sell you a paradise.',W*0.5,H*0.22,40,CREAM,env(t,3.4,4.8,11.4,12.8),{weight:700});
    line(ctx,'You’ve probably bought it before. Most of us have.',W*0.5,H*0.22+50,27,ASH,env(t,7.4,8.8,11.4,12.8),{italic:true});
    const idyll=[['wake up when you like',12.6],['gather a few handfuls of nuts and berries',15.0],
                 ['the hunters bring back something good',18.0],['by early afternoon, the food quest is done',20.4]];
    for(let i=0;i<idyll.length;i++){
      const a=env(t,idyll[i][1],idyll[i][1]+1.2,32.0,33.4); if(a<0.01)continue;
      line(ctx,'—  '+idyll[i][0],W*0.5,H*0.36+i*44,27,CREAM,a,{});
    }
    if(t>=23) line(ctx,'the rest of the day is for lounging · storytelling · staring at the fire',W*0.5,H*0.66,27,GOLD,env(t,23.8,25.2,32.0,33.4),{italic:true});
    if(t>=27) line(ctx,'No boss. No mortgage. No Monday.',W*0.5,H*0.76,32,CREAM,env(t,27.4,28.6,32.0,33.4),{weight:700});
    if(t>=33) line(ctx,'living exactly as evolution designed them to.',W*0.5,H*0.86,29,GOLD,env(t,35.2,36.4,38.4,39.8),{italic:true});
  }
  // and then we ruined it
  if(t>=39&&t<58){
    line(ctx,'And then, the story goes —',W*0.5,H*0.22,32,CREAM,env(t,39.6,40.8,56.0,57.4),{});
    line(ctx,'we ruined it.',W*0.5,H*0.32,44,EMBER2,env(t,41.2,42.2,56.0,57.4),{weight:700});
    plough(ctx,W*0.5,H*0.52,1.5,env(t,42.6,44.4,56.0,57.4));
    const costs=[['chained ourselves to fields and grain and fences',44.2],
                 ['worked ourselves half to death',48.4],
                 ['got shorter and sicker',50.0],
                 ['invented kings, and taxes, and toothache',52.4]];
    for(let i=0;i<costs.length;i++){
      const a=env(t,costs[i][1],costs[i][1]+1.1,56.0,57.4); if(a<0.01)continue;
      line(ctx,'—  '+costs[i][0],W*0.5,H*0.66+i*38,25,ASH,a,{});
    }
  }
  if(t>=58){
    const a=env(t,58.0,59.4,72.4,73.8);
    line(ctx,'One famous essay called agriculture',W*0.5,H*0.24,29,ASH,a,{italic:true});
    line(ctx,'“the worst mistake in the history of the human race.”',W*0.5,H*0.32,32,CREAM,env(t,59.0,60.4,72.4,73.8),{italic:true,weight:700});
    line(ctx,'It’s a wonderful story. It has a golden age, a fall, and a villain.',W*0.5,H*0.48,28,CREAM,env(t,63.0,64.4,72.4,73.8),{});
    plough(ctx,W*0.5,H*0.62,1.1,env(t,67.6,69.0,72.4,73.8));
    line(ctx,'The plough.',W*0.5,H*0.74,30,EMBER2,env(t,68.4,69.4,72.4,73.8),{weight:700});
    line(ctx,'It explains that nagging modern feeling that we weren’t built for this.',W*0.5,H*0.86,26,GOLD,env(t,70.0,71.2,72.6,74.0),{italic:true});
    citation(ctx,'Diamond J 1987, Discover Magazine',a);
  }
  vignette(ctx);grain(ctx,t);
}

/* ============================================================
   B — THE FAMOUS NUMBER (74 .. 167)
   ============================================================ */
function sceneNumber(ctx,t){
  baseBg(ctx,t,0.18);
  kicker(ctx,'follow the number back',env(t,88,89.5,102,104));
  if(t>=74&&t<92){
    line(ctx,'There’s just one problem.',W*0.5,H*0.28,34,CREAM,env(t,74.0,75.2,90.0,91.4),{weight:700});
    line(ctx,'The 15-hour paradise? The number is real.',W*0.5,H*0.40,30,CREAM,env(t,76.4,77.8,90.0,91.4),{});
    line(ctx,'It comes from real anthropology.',W*0.5,H*0.47,27,ASH,env(t,80.2,81.4,90.0,91.4),{italic:true});
    line(ctx,'And once you look at what it actually measured —',W*0.5,H*0.60,29,CREAM,env(t,82.8,84.2,90.0,91.4),{});
    line(ctx,'it’s almost completely a mirage.',W*0.5,H*0.68,34,EMBER2,env(t,85.6,86.8,90.0,91.4),{italic:true,weight:700});
  }
  if(t>=92&&t<132){
    const a=env(t,96.4,98.0,130.0,131.4);
    line(ctx,'The 15-hour week comes, more or less, from one place:',W*0.5,H*0.16,28,ASH,env(t,96.6,98.0,130.0,131.4),{italic:true});
    line(ctx,'Richard Lee, 1960s — living among the Ju/’hoansi',W*0.5,H*0.26,32,CREAM,env(t,101.2,102.6,130.0,131.4),{weight:700});
    line(ctx,'the !Kung San, hunter-gatherers of the Kalahari',W*0.5,H*0.33,26,ASH,env(t,106.0,107.4,130.0,131.4),{italic:true});
    line(ctx,'He did something admirably concrete:',W*0.5,H*0.43,27,CREAM,env(t,112.4,113.8,130.0,131.4),{});
    line(ctx,'he followed people around and timed how long they spent gathering food.',W*0.5,H*0.50,26,ASH,env(t,115.8,117.2,130.0,131.4),{italic:true});
    // the week grid with only the food-quest band
    const fq=ramp(t,122.0,126.0);
    week(ctx,W*0.5,H*0.72,760,190,env(t,120.0,122.0,130.0,131.4),
         [{hours:15*fq,perDay:2.2,c0:'#C4451F',c1:'#E0602F'}]);
    if(t>=124) line(ctx,'≈ 15 hours a week on the food quest',W*0.5,H*0.575,30,GOLD,env(t,124.4,125.6,130.0,131.4),{weight:700});
    if(t>=128) line(ctx,'Two, maybe two and a half days of work — and the rest is yours.',W*0.5,H*0.925,25,CREAM,env(t,128.0,129.2,130.2,131.6),{italic:true});
    citation(ctx,'Lee RB 1968/1979 — !Kung San subsistence time-allocation',a);
  }
  if(t>=132){
    const a=env(t,132.4,134.0,165.4,167.0);
    line(ctx,'Marshall Sahlins took that finding and built a beautiful idea on top of it:',W*0.5,H*0.20,27,ASH,a,{italic:true});
    line(ctx,'The Original Affluent Society',W*0.5,H*0.34,44,CREAM,env(t,138.4,140.0,165.4,167.0),{weight:700});
    line(ctx,'affluence = wanting little, and getting it easily',W*0.5,H*0.44,28,GOLD,env(t,146.8,148.2,165.4,167.0),{italic:true});
    if(t>=151){
      line(ctx,'By that measure, foragers were the original rich.',W*0.5,H*0.56,30,CREAM,env(t,151.0,152.4,165.4,167.0),{});
      line(ctx,'Few wants, quickly met. Abundant free time.',W*0.5,H*0.63,27,ASH,env(t,153.8,155.2,165.4,167.0),{italic:true});
    }
    if(t>=158){
      line(ctx,'A genuinely lovely idea — it swept through the culture and never left.',W*0.5,H*0.76,26,CREAM,env(t,158.6,160.0,165.4,167.0),{italic:true});
      line(ctx,'It’s why you’ve heard the 15-hour thing at a dinner party.',W*0.5,H*0.83,26,GOLD,env(t,162.8,164.0,165.6,167.2),{italic:true});
    }
    citation(ctx,'Sahlins M 1972, Stone Age Economics',env(t,138,140,165.4,167.0));
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   C — SPENT DOING WHAT? (167 .. 235)
   ============================================================ */
function sceneLeftOut(ctx,t){
  baseBg(ctx,t,0.18);
  kicker(ctx,'15 hours spent doing what?',env(t,169,170.5,184,186));
  if(t>=167&&t<184){
    line(ctx,'But here’s the question nobody asks at the dinner party:',W*0.5,H*0.30,29,CREAM,env(t,167.6,169.0,182.0,183.4),{});
    line(ctx,'15 hours spent doing what, exactly?',W*0.5,H*0.44,40,EMBER2,env(t,171.4,172.6,182.0,183.4),{weight:700});
    line(ctx,'Lee’s 15 hours counted one specific thing: the food quest.',W*0.5,H*0.60,28,CREAM,env(t,175.6,177.0,182.0,183.4),{});
    line(ctx,'Going out, finding the food, bringing it back. That’s a real category.',W*0.5,H*0.68,26,ASH,env(t,179.4,180.8,182.0,183.4),{italic:true});
  }
  // the list of what it left out — each item lands as a bar added to the week
  if(t>=184){
    const a=env(t,184.4,186.0,233.4,235.0);
    line(ctx,'Now let me read you the list of things that number left out.',W*0.5,H*0.13,28,GOLD,env(t,184.0,185.4,233.4,235.0),{italic:true});
    const bands=[{hours:15,perDay:2.2,c0:'#C4451F',c1:'#E0602F'}];
    if(t>186.4) bands.push({hours:9*ramp(t,186.4,196.0), perDay:1.5, c0:'#8A6A2E',c1:'#C79A44'});
    if(t>206.0) bands.push({hours:5*ramp(t,206.0,210.0), perDay:0.9, c0:'#6B5540',c1:'#9C8158'});
    if(t>208.8) bands.push({hours:6*ramp(t,208.8,216.0), perDay:1.0, c0:'#4A5A66',c1:'#7492A6'});
    if(t>221.8) bands.push({hours:7*ramp(t,221.8,230.0), perDay:1.2, c0:'#3E5A50',c1:'#6E9C8A'});
    week(ctx,W*0.5,H*0.42,780,210,a,bands);
    const items=[['food processing',186.6],['cooking and butchery',206.2],
                 ['making and mending all the stuff',209.0],['childcare and housework',222.0]];
    for(let i=0;i<items.length;i++){
      const ia=env(t,items[i][1],items[i][1]+1.1,233.4,235.0); if(ia<0.01)continue;
      line(ctx,'—  '+items[i][0],W*0.30,H*0.62+i*40,26,i===3?GOLD:CREAM,ia,{align:'center'});
    }
    // the mongongo nut, cracked over and over
    if(t>=196&&t<207){
      const na=env(t,196.4,198.0,205.4,206.8);
      const hit=(t*1.5)%1;
      nut(ctx,W*0.72,H*0.70,1.5,na,hit);
      line(ctx,'the mongongo nut',W*0.72,H*0.80,26,CREAM,na,{italic:true});
      line(ctx,'a shell you crack, by hand, with a rock —',W*0.72,H*0.86,23,ASH,env(t,199.4,200.8,205.4,206.8),{italic:true});
      line(ctx,'thousands of times',W*0.72,H*0.91,25,EMBER2,env(t,202.4,203.6,205.6,207.0),{italic:true,weight:700});
    }
    if(t>=226) line(ctx,'…the vast unpaid ocean of work someone was doing every single day,',W*0.72,H*0.79,24,CREAM,env(t,226.4,227.8,233.4,235.0),{italic:true});
    if(t>=230) line(ctx,'whether or not an anthropologist wrote it down.',W*0.72,H*0.845,24,GOLD,env(t,230.4,231.6,233.6,235.2),{italic:true});
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   D — 42 HOURS (235 .. 288)
   ============================================================ */
function sceneFortyTwo(ctx,t){
  baseBg(ctx,t,0.20);
  kicker(ctx,'the fuller accounting',env(t,237,238.5,252,254));
  const a=env(t,235.4,237.0,286.4,288.0);
  if(t>=235&&t<268){
    line(ctx,'So Lee — to his great credit — went back and did the fuller accounting.',W*0.5,H*0.14,27,CREAM,env(t,235.0,236.4,248.0,249.4),{});
    line(ctx,'subsistence + tool-making and maintenance + housework',W*0.5,H*0.215,25,ASH,env(t,240.0,241.4,248.0,249.4),{italic:true});
    // the week, filling to 42
    const fill=ramp(t,245.0,252.0);
    week(ctx,W*0.5,H*0.46,780,220,a,[
      {hours:15,             perDay:2.2, c0:'#C4451F',c1:'#E0602F'},
      {hours:9*fill,         perDay:1.5, c0:'#8A6A2E',c1:'#C79A44'},
      {hours:5*fill,         perDay:0.9, c0:'#6B5540',c1:'#9C8158'},
      {hours:6*fill,         perDay:1.0, c0:'#4A5A66',c1:'#7492A6'},
      {hours:7*fill,         perDay:1.2, c0:'#3E5A50',c1:'#6E9C8A'}]);
    if(t>=245) line(ctx,'The paradise number didn’t nudge. It roughly tripled.',W*0.5,H*0.68,30,EMBER2,env(t,245.4,246.8,258.0,259.4),{weight:700});
    if(t>=249){
      line(ctx,'!Kung men: ~44½ hours a week    ·    women: ~40',W*0.5,H*0.77,27,CREAM,env(t,251.4,252.8,264.0,265.4),{});
    }
    if(t>=257){
      line(ctx,'≈ 42 hours a week',W*0.5,H*0.87,52,GOLD,env(t,257.6,259.0,286.4,288.0),{weight:700});
    }
  }
  if(t>=266){
    line(ctx,'Sit with that. It’s quietly devastating to the whole legend.',W*0.5,H*0.20,29,CREAM,env(t,266.6,268.0,276.0,277.4),{italic:true});
    if(t>=270){
      line(ctx,'The famous work-free forager paradise —',W*0.5,H*0.32,29,CREAM,env(t,270.4,271.8,286.4,288.0),{});
      line(ctx,'once you count cracking the nuts, minding the children, fixing the spear —',W*0.5,H*0.39,26,ASH,env(t,272.4,273.8,286.4,288.0),{italic:true});
      line(ctx,'works about as many hours as you do.',W*0.5,H*0.475,34,EMBER2,env(t,275.0,276.2,286.4,288.0),{weight:700});
    }
    if(t>=277){
      line(ctx,'The 15-hour week wasn’t a lie.',W*0.5,H*0.62,32,CREAM,env(t,277.4,278.6,286.4,288.0),{});
      line(ctx,'It was a category error.',W*0.5,H*0.70,38,GOLD,env(t,280.4,281.6,286.4,288.0),{italic:true,weight:700});
      line(ctx,'It measured the fun-sounding half of the job — and called it the whole thing.',W*0.5,H*0.80,26,CREAM,env(t,283.4,284.8,286.6,288.2),{italic:true});
    }
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   E — WHY THE STORY STUCK (288 .. 350)
   ============================================================ */
function sceneWhyStuck(ctx,t){
  baseBg(ctx,t,0.20);
  kicker(ctx,'why it travelled so far',env(t,290,291.5,306,308));
  if(t>=288&&t<302){
    line(ctx,'Here’s what I find most interesting —',W*0.5,H*0.30,30,CREAM,env(t,288.0,289.4,300.4,301.8),{});
    line(ctx,'and it’s not about the Kalahari at all. It’s about us.',W*0.5,H*0.30+44,30,GOLD,env(t,289.8,291.2,300.4,301.8),{italic:true});
    line(ctx,'Why did this story travel so far, and stick so hard?',W*0.5,H*0.54,29,CREAM,env(t,292.4,293.8,300.4,301.8),{});
    line(ctx,'Because it flatters a suspicion we have already had.',W*0.5,H*0.64,30,EMBER2,env(t,297.6,299.0,300.6,302.0),{italic:true,weight:700});
  }
  if(t>=302&&t<330){
    const a=env(t,302.4,304.0,328.0,329.4);
    line(ctx,'Most of us carry a low background ache',W*0.5,H*0.22,30,CREAM,env(t,302.6,304.0,328.0,329.4),{});
    line(ctx,'that modern life is somehow wrong.',W*0.5,H*0.29,30,CREAM,env(t,304.8,306.0,328.0,329.4),{});
    line(ctx,'Too fast. Too fenced in. Too full of Mondays.',W*0.5,H*0.37,27,ASH,env(t,307.0,308.4,328.0,329.4),{italic:true});
    if(t>=310){
      line(ctx,'And the forager-paradise story takes that private ache',W*0.5,H*0.50,28,CREAM,env(t,310.4,311.8,328.0,329.4),{});
      line(ctx,'and hands it a history.',W*0.5,H*0.57,30,GOLD,env(t,312.6,313.8,328.0,329.4),{italic:true});
    }
    if(t>=314){
      line(ctx,'“You’re right. You were built for something better.',W*0.5,H*0.68,28,CREAM,env(t,314.4,315.8,328.0,329.4),{italic:true});
      line(ctx,'And here’s the Garden of Eden you fell from.”',W*0.5,H*0.75,28,CREAM,env(t,317.0,318.2,328.0,329.4),{italic:true});
      line(ctx,'The Garden of Eden — with footnotes.',W*0.5,H*0.86,30,EMBER2,env(t,320.4,321.6,328.0,329.4),{weight:700});
    }
  }
  if(t>=330){
    const a=env(t,330.0,331.6,348.4,350.0);
    line(ctx,'A story that tells you your unhappiness is real and not your fault',W*0.5,H*0.24,28,CREAM,env(t,322.4,324.0,338.0,339.4),{});
    line(ctx,'will always outrun a boring table of numbers.',W*0.5,H*0.32,30,GOLD,env(t,325.4,326.8,338.0,339.4),{italic:true,weight:700});
    if(t>=329){
      line(ctx,'That’s the honest reason the 15-hour week beat the 42-hour week.',W*0.5,H*0.46,28,CREAM,env(t,329.4,330.8,348.4,350.0),{});
      line(ctx,'Not because the evidence was better. Because it consoled us.',W*0.5,H*0.54,30,EMBER2,env(t,333.4,334.8,348.4,350.0),{italic:true,weight:700});
    }
    if(t>=338){
      line(ctx,'And this channel’s whole ethic is watching, in slow motion,',W*0.5,H*0.70,27,ASH,env(t,338.4,339.8,348.4,350.0),{italic:true});
      line(ctx,'how a story that consoles us beats a story that’s accurate —',W*0.5,H*0.77,27,CREAM,env(t,341.4,342.8,348.4,350.0),{});
      line(ctx,'over and over, across the whole history of how we got the past wrong.',W*0.5,H*0.84,26,GOLD,env(t,344.4,345.8,348.6,350.2),{italic:true});
    }
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   F — BUT THE BONES (350 .. 440)
   ============================================================ */
function sceneBones(ctx,t){
  baseBg(ctx,t,0.16);
  kicker(ctx,'and yet — the bones',env(t,352,353.5,368,370));
  if(t>=350&&t<366){
    line(ctx,'Because the “agriculture was hard on us” crowd',W*0.5,H*0.32,30,CREAM,env(t,350.2,351.6,364.0,365.4),{});
    line(ctx,'is not simply wrong.',W*0.5,H*0.32+46,34,EMBER2,env(t,354.4,355.6,364.0,365.4),{weight:700});
    line(ctx,'Dig up the skeletons of the earliest farming populations,',W*0.5,H*0.56,28,CREAM,env(t,357.4,358.8,364.0,365.4),{});
    line(ctx,'compare them to the foragers who came before —',W*0.5,H*0.63,28,ASH,env(t,360.6,362.0,364.0,365.4),{italic:true});
    line(ctx,'and you often find something sobering.',W*0.5,H*0.72,29,GOLD,env(t,364.2,365.4,366.4,367.8),{italic:true});
  }
  if(t>=366&&t<392){
    const a=env(t,366.0,367.6,390.0,391.4);
    heights(ctx,W*0.30,H*0.40,a,t);
    const marks=[['more cavities, worse teeth',370.0],['(thanks to all that starchy grain)',373.2],
                 ['more signs of nutritional stress',375.0],['more anaemia',377.4],
                 ['more of the marks infectious disease leaves on bone',379.0]];
    for(let i=0;i<marks.length;i++){
      const ma=env(t,marks[i][1],marks[i][1]+1.1,390.0,391.4); if(ma<0.01)continue;
      line(ctx,'—  '+marks[i][0],W*0.72,H*0.30+i*40,i===1?22:25,i===1?ASH:CREAM,ma,{align:'center',italic:i===1});
    }
    if(t>=382) line(ctx,'Packing people together with their animals, grain stores and garbage',W*0.5,H*0.80,26,CREAM,env(t,382.4,383.8,390.0,391.4),{});
    if(t>=385) line(ctx,'turns out to be a fabulous way to breed disease.',W*0.5,H*0.87,27,EMBER2,env(t,385.0,386.2,390.2,391.6),{italic:true});
  }
  // the osteological paradox — the careful reader has to stay careful
  if(t>=392){
    const a=env(t,392.0,394.0,438.4,440.0);
    line(ctx,'So the bodies do, in many places, tell a story of a rough transition.',W*0.5,H*0.16,27,CREAM,env(t,386.6,388.2,398.0,399.4),{});
    line(ctx,'But — and here’s where the careful reader has to stay careful —',W*0.5,H*0.25,28,GOLD,env(t,392.4,394.0,410.0,411.4),{italic:true});
    if(t>=400){
      line(ctx,'a graveyard full of sickly-looking bones',W*0.5,H*0.40,29,CREAM,env(t,400.4,401.8,420.4,421.6),{});
      line(ctx,'can actually mean the population was healthier — not sicker.',W*0.5,H*0.48,30,EMBER2,env(t,404.4,405.8,420.4,421.6),{italic:true,weight:700});
      line(ctx,'Because it means people survived long enough for stress to leave its mark,',W*0.5,H*0.585,26,CREAM,env(t,408.4,409.8,420.4,421.6),{});
      line(ctx,'instead of dying too fast to show anything at all.',W*0.5,H*0.645,26,ASH,env(t,412.8,414.0,420.4,421.6),{italic:true});
    }
    if(t>=417) line(ctx,'Reading health from old bones is genuinely, maddeningly hard.',W*0.5,H*0.755,27,CREAM,env(t,417.4,418.8,421.6,422.8),{italic:true});
    if(t>=422){
      line(ctx,'So the truth is a proper mess:',W*0.5,H*0.335,30,CREAM,env(t,422.6,424.0,438.4,440.0),{weight:700});
      line(ctx,'early farming really did make bodies smaller, mouths worse, crowds sicker —',W*0.5,H*0.44,25,CREAM,env(t,424.4,425.8,438.4,440.0),{});
      line(ctx,'AND the sweeping claim that foragers everywhere lived in easy abundance is a romance.',W*0.5,H*0.51,24,ASH,env(t,429.4,430.8,438.4,440.0),{italic:true});
      line(ctx,'Both are true at once. Neither is the clean story you were sold.',W*0.5,H*0.62,26,GOLD,env(t,434.0,435.4,438.6,440.2),{italic:true,weight:700});
    }
    citation(ctx,'Wood JW et al. 1992 — the osteological paradox',a);
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   G — WHAT THE DATA KILLED (440 .. 500)
   ============================================================ */
function sceneKilled(ctx,t){
  baseBg(ctx,t,0.18);
  kicker(ctx,'so what did the data kill?',env(t,441,442.5,456,458));
  if(t>=440&&t<472){
    line(ctx,'So what exactly did the data kill?',W*0.5,H*0.20,34,CREAM,env(t,440.0,441.4,456.0,457.4),{weight:700});
    line(ctx,'Not the idea that farming had costs. Clearly it did.',W*0.5,H*0.30,29,ASH,env(t,443.6,445.0,456.0,457.4),{italic:true});
    if(t>=446){
      line(ctx,'What the data killed is the fairy tale version:',W*0.5,H*0.42,30,CREAM,env(t,446.4,447.8,470.0,471.4),{});
      const bits=[['a spotless paradise on one side',450.6],['a villainous plough on the other',453.0],['a clean fall in between',455.0]];
      for(let i=0;i<bits.length;i++){
        const ba=env(t,bits[i][1],bits[i][1]+1.0,470.0,471.4); if(ba<0.01)continue;
        line(ctx,'—  '+bits[i][0],W*0.5,H*0.52+i*40,26,ASH,ba,{});
      }
    }
    if(t>=456){
      line(ctx,'the version where our ancestors worked 15 breezy hours — and we broke it.',W*0.5,H*0.72,26,CREAM,env(t,456.4,457.8,470.0,471.4),{italic:true});
      line(ctx,'It dies the moment you count the mongongo nuts and the childcare.',W*0.5,H*0.80,27,EMBER2,env(t,461.4,462.8,470.0,471.4),{italic:true});
      line(ctx,'Paradise had a 42-hour week — and a full nut-cracking to-do list of its own.',W*0.5,H*0.88,26,GOLD,env(t,465.8,467.2,470.2,471.6),{italic:true});
    }
  }
  if(t>=472){
    const a=env(t,472.4,474.0,498.4,500.0);
    line(ctx,'And the deeper thing the data kills is a habit of mind:',W*0.5,H*0.20,29,CREAM,a,{});
    line(ctx,'the habit of reaching backward for an Eden.',W*0.5,H*0.28,32,EMBER2,env(t,475.0,476.4,498.4,500.0),{italic:true,weight:700});
    if(t>=479){
      line(ctx,'We are a species that can’t seem to stop believing we fell from somewhere.',W*0.5,H*0.42,28,CREAM,env(t,479.4,480.8,498.4,500.0),{});
      line(ctx,'Every era invents its own golden age —',W*0.5,H*0.53,28,CREAM,env(t,484.4,485.8,498.4,500.0),{});
      line(ctx,'and locates it just out of reach,',W*0.5,H*0.60,27,ASH,env(t,486.6,487.8,498.4,500.0),{italic:true});
      line(ctx,'in a past clean enough to make the present feel like a betrayal.',W*0.5,H*0.67,27,GOLD,env(t,488.8,490.2,498.4,500.0),{italic:true});
    }
    if(t>=494) line(ctx,'The forager paradise is just the most recent, best-footnoted version of a very old human wish.',W*0.5,H*0.83,25,CREAM,env(t,494.4,495.8,498.6,500.2),{italic:true});
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   H — THE REAL ANCESTORS (500 .. 535)
   ============================================================ */
function sceneReal(ctx,t){
  // home, to the fire — the season ends where the channel lives
  const shrink=ramp(t,527,533.4);
  baseBg(ctx,t,0.34*(1-shrink*0.5));
  const fx=W*0.5,fy=H*0.90;
  fireGlow(ctx,fx,fy,0.80*(1-shrink*0.55),t);
  smoke(ctx,t,fx,fy,0.9,0.7);
  const a=env(t,500.4,502.0,532.0,534.4);
  // the band around it, ordinary and busy and at rest
  ctx.save();ctx.globalAlpha=a*0.95;
  const C=rgba('#100B08',0.95);
  figureLying(ctx,fx-330,fy-4,0.85,C);
  figure(ctx,fx-190,fy-26,0.90,C);
  figure(ctx,fx+180,fy-26,0.90,C);
  figureLying(ctx,fx+320,fy-8,0.82,C);
  figure(ctx,fx+80,fy-22,0.78,C);
  ctx.restore();ctx.globalAlpha=1;
  flame(ctx,fx,fy,0.95*(1-shrink*0.55)+0.06*Math.sin(t*2.2),t);
  emberDrift(ctx,t,40,0.8*(1-shrink*0.5),fx,fy);

  // NOTE: these beats overlap in time, so each pair gets its own band —
  // never reuse a y while the previous line is still fading.
  line(ctx,'The real ancestors are better than the fairy tale —',W*0.5,H*0.135,30,CREAM,env(t,498.9,500.4,505.4,506.4),{});
  line(ctx,'because they’re real.',W*0.5,H*0.205,34,GOLD,env(t,502.4,503.6,505.4,506.4),{italic:true,weight:700});
  if(t>=504){
    line(ctx,'They worked hard. About as hard as you.',W*0.5,H*0.135,32,CREAM,env(t,506.2,507.2,514.0,515.4),{weight:700});
    line(ctx,'They cracked the nuts, and mended the tools, and minded the children —',W*0.5,H*0.205,26,ASH,env(t,508.2,509.6,517.0,518.4),{italic:true});
  }
  if(t>=511){
    line(ctx,'and yes, still found time to sit by the fire and stare at it',W*0.5,H*0.30,28,CREAM,env(t,511.6,513.0,522.0,523.4),{});
    line(ctx,'the way you’re arguably doing right now.',W*0.5,H*0.365,28,GOLD,env(t,514.4,515.6,522.0,523.4),{italic:true});
  }
  if(t>=518){
    line(ctx,'They weren’t angels in a garden we ruined.',W*0.5,H*0.30,30,CREAM,env(t,518.2,519.4,526.0,527.4),{});
    line(ctx,'They were people with a full work week and a rich inner life,',W*0.5,H*0.365,27,CREAM,env(t,520.4,521.8,526.0,527.4),{});
    line(ctx,'doing the oldest human thing of all:',W*0.5,H*0.43,27,ASH,env(t,522.6,523.8,526.0,527.4),{italic:true});
  }
  if(t>=524){
    line(ctx,'getting by together —',W*0.5,H*0.30,32,CREAM,env(t,524.2,525.2,531.4,533.0),{});
    line(ctx,'and telling themselves stories about how it all used to be better.',W*0.5,H*0.375,28,GOLD,env(t,527.0,528.2,531.4,533.0),{italic:true});
    line(ctx,'We inherited the getting by.',W*0.5,H*0.47,30,CREAM,env(t,531.4,532.4,533.6,535.2),{});
    line(ctx,'And apparently we inherited the stories too.',W*0.5,H*0.535,32,EMBER2,env(t,532.6,533.4,534.2,535.6),{italic:true,weight:700});
  }
  vignette(ctx);grain(ctx,t);
}

/* ============================================================
   EPISODE
   ============================================================ */
window.EPISODE={
  duration:534.7,
  bounds:[74,167,235,288,350,440,500],
  ghostNames:['hands','horses'],
  render:function(ctx,t){
    if(t<74)        scenePara(ctx,t);
    else if(t<167)  sceneNumber(ctx,t);
    else if(t<235)  sceneLeftOut(ctx,t);
    else if(t<288)  sceneFortyTwo(ctx,t);
    else if(t<350)  sceneWhyStuck(ctx,t);
    else if(t<440)  sceneBones(ctx,t);
    else if(t<500)  sceneKilled(ctx,t);
    else            sceneReal(ctx,t);
  }
};
