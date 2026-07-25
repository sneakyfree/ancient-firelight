/* Ancient Firelight — EP03 "Boredom"
   Master: voice/EP03_Boredom_MASTER.wav  (576.8s)
   Loaded AFTER engine.js.

   Scene map:
     A OPEN      0   .. 90    the golden idle hour, the ochre crayon, the crosshatch, 73,000 years
     B ENGINE    90  .. 142   the lizard vs the restless mind; what boredom actually is
     C AFTERNOON 142 .. 233   they HAD those afternoons — Blombos workshop, engraved ochre, eggshell canteens
     D ADORN     233 .. 315   beads (75k Blombos, 142k Bizmoune) and rhythm, the art that can't fossilize
     E CHILDREN  315 .. 381   play is boredom's cheerful twin
     F MURK      381 .. 421   is it art, or idle scratching? even the sceptical reading is the point
     G WHAT      421 .. 497   the pain of unused capacity — and the useless thing that outlasted its maker
     H CLOSE     497 .. 577   boredom makes everything downstream of "what if"
*/

/* ---------- EP03 primitives ---------- */

// The Blombos crosshatch — THE object of this episode. Lines are drawn in the
// order a hand would drag them, so `prog` 0..1 builds the pattern stroke by stroke.
const XH_A=[  // the down-right family: [x1,y1,x2,y2] in a 0..1 unit box
  [0.06,0.72,0.52,0.10],[0.20,0.86,0.68,0.16],[0.34,0.93,0.83,0.22],
  [0.48,0.97,0.95,0.30],[0.02,0.50,0.36,0.06]
];
const XH_B=[  // the crossing family
  [0.08,0.22,0.62,0.86],[0.24,0.12,0.80,0.78],[0.40,0.07,0.93,0.68],
  [0.03,0.38,0.44,0.95]
];
const XH_C=[  // the long horizontals that bind it
  [0.04,0.34,0.94,0.46],[0.05,0.58,0.92,0.68]
];
function crosshatch(ctx,cx,cy,w,h,prog,al,col,lw){
  if(al<=0.005)return;
  const ALL=[...XH_A,...XH_B,...XH_C];
  const n=ALL.length, shown=prog*n;
  ctx.save();ctx.globalAlpha=al;ctx.lineCap='round';
  ctx.strokeStyle=col||rgba('#B4491F',0.95);ctx.lineWidth=lw||5;
  for(let i=0;i<n;i++){
    const f=clamp(shown-i,0,1); if(f<=0.001)continue;
    const [x1,y1,x2,y2]=ALL[i];
    const X1=cx-w/2+x1*w, Y1=cy-h/2+y1*h;
    const X2=cx-w/2+x2*w, Y2=cy-h/2+y2*h;
    ctx.beginPath();ctx.moveTo(X1,Y1);
    ctx.lineTo(X1+(X2-X1)*smooth(f),Y1+(Y2-Y1)*smooth(f));
    ctx.stroke();
  }
  ctx.restore();ctx.globalAlpha=1;
}
// the flat ochre stone the pattern sits on
function stone(ctx,cx,cy,w,h,al){
  if(al<=0.005)return;
  ctx.save();ctx.globalAlpha=al;
  const g=ctx.createLinearGradient(cx,cy-h/2,cx,cy+h/2);
  g.addColorStop(0,'#6E4A32');g.addColorStop(0.5,'#5A3B28');g.addColorStop(1,'#432C1E');
  ctx.fillStyle=g;
  ctx.beginPath();ctx.ellipse(cx,cy,w/2,h/2,0.04,0,6.2832);ctx.fill();
  // surface grain
  for(let i=0;i<70;i++){
    const a0=rnd(i)*6.2832, rr=Math.sqrt(rnd(i*1.7));
    const x=cx+Math.cos(a0)*rr*w*0.46, y=cy+Math.sin(a0)*rr*h*0.46;
    ctx.fillStyle=rgba(rnd(i*3.1)>0.5?'#7E5738':'#33210F',0.16);
    ctx.beginPath();ctx.arc(x,y,1+rnd(i*5.3)*4,0,6.2832);ctx.fill();
  }
  ctx.restore();ctx.globalAlpha=1;
}
// a lizard, utterly content, on a sunlit rock.
// NOTE: these daytime scenes have no fire behind them, so silhouettes must be a
// warm MID tone (not near-black) or they vanish into the background.
function lizard(ctx,x,y,s,al,col){
  if(al<=0.005)return;
  // the warm rock it's content on — also what makes the shape readable
  ctx.save();ctx.globalAlpha=al*0.75;
  const rg=ctx.createRadialGradient(x,y+14*s,6,x,y+14*s,190*s);
  rg.addColorStop(0,rgba('#C08A4E',0.34));
  rg.addColorStop(0.5,rgba('#7A4F28',0.16));
  rg.addColorStop(1,'rgba(20,16,14,0)');
  ctx.fillStyle=rg;ctx.fillRect(x-220*s,y-150*s,440*s,300*s);
  ctx.restore();
  col=col||rgba('#22160E',0.95);
  ctx.save();ctx.globalAlpha=al;ctx.fillStyle=col;ctx.strokeStyle=col;
  ctx.lineCap='round';ctx.lineWidth=4*s;
  ctx.beginPath();ctx.ellipse(x,y,34*s,12*s,0,0,6.2832);ctx.fill();          // body
  ctx.beginPath();ctx.ellipse(x-38*s,y-3*s,13*s,9*s,0,0,6.2832);ctx.fill();  // head
  ctx.beginPath();ctx.moveTo(x+32*s,y);                                       // tail
  ctx.quadraticCurveTo(x+66*s,y-6*s,x+84*s,y+12*s);ctx.stroke();
  for(const [dx,dy] of [[-18,10],[14,10],[-16,-10],[12,-10]]){                // legs
    ctx.beginPath();ctx.moveTo(x+dx*s,y+dy*s*0.6);
    ctx.lineTo(x+dx*s+(dx<0?-12:12)*s,y+dy*s*1.6);ctx.stroke();
  }
  ctx.restore();ctx.globalAlpha=1;
}
// a bead string — pierced shells on a cord
function beads(ctx,cx,cy,w,n,prog,al){
  if(al<=0.005)return;
  ctx.save();ctx.globalAlpha=al;
  ctx.strokeStyle=rgba(ASH,0.55);ctx.lineWidth=2;
  ctx.beginPath();
  for(let i=0;i<=60;i++){const u=i/60;ctx.lineTo(cx-w/2+w*u,cy+Math.sin(u*3.1416)*26);}
  ctx.stroke();
  const shown=prog*n;
  for(let i=0;i<n;i++){
    const f=clamp(shown-i,0,1); if(f<=0.02)continue;
    const u=(i+0.5)/n, x=cx-w/2+w*u, y=cy+Math.sin(u*3.1416)*26;
    ctx.globalAlpha=al*f;
    ctx.fillStyle=(i%3===0)?rgba(GOLD,0.92):rgba('#D9C6A8',0.9);
    ctx.beginPath();ctx.ellipse(x,y,7.5*f,9.5*f,rnd(i)*2,0,6.2832);ctx.fill();
    ctx.fillStyle=rgba('#1A120C',0.75);                                  // the pierced hole
    ctx.beginPath();ctx.arc(x,y-1,2.1*f,0,6.2832);ctx.fill();
  }
  ctx.restore();ctx.globalAlpha=1;
}
// rhythm — concentric pulses from a clap, since sound leaves nothing behind
function pulses(ctx,cx,cy,t,al,speed){
  if(al<=0.005)return;
  ctx.save();
  for(let i=0;i<5;i++){
    const cyc=((t*(speed||0.9)+i*0.2)%1);
    const r=cyc*260, a=al*(1-cyc)*0.55;
    if(a<=0.01)continue;
    ctx.globalAlpha=a;ctx.strokeStyle=rgba(EMBER2,0.9);ctx.lineWidth=3*(1-cyc)+0.6;
    ctx.beginPath();ctx.arc(cx,cy,r,0,6.2832);ctx.stroke();
  }
  ctx.restore();ctx.globalAlpha=1;
}
// a child, small, crouched, scratching at the ground
function child(ctx,x,baseY,s,al,col,t){
  if(al<=0.005)return;
  // warm ground pool so the small silhouette reads (no fire in this scene)
  ctx.save();ctx.globalAlpha=al*0.8;
  const rg=ctx.createRadialGradient(x+40*s,baseY,8,x+40*s,baseY,300*s);
  rg.addColorStop(0,rgba('#C08A4E',0.30));
  rg.addColorStop(0.5,rgba('#7A4F28',0.14));
  rg.addColorStop(1,'rgba(20,16,14,0)');
  ctx.fillStyle=rg;ctx.fillRect(x-320*s,baseY-300*s,700*s,400*s);
  ctx.restore();
  col=col||rgba('#22160E',0.95);
  ctx.save();ctx.globalAlpha=al;ctx.fillStyle=col;ctx.strokeStyle=col;
  ctx.lineCap='round';ctx.lineWidth=6*s;
  ctx.beginPath();ctx.ellipse(x,baseY-30*s,15*s,22*s,0,0,6.2832);ctx.fill();   // crouched body
  ctx.beginPath();ctx.arc(x-2*s,baseY-62*s,14*s,0,6.2832);ctx.fill();          // head
  const sw=Math.sin(t*2.6)*10*s;                                               // the arm, scribbling
  ctx.beginPath();ctx.moveTo(x+10*s,baseY-38*s);ctx.lineTo(x+30*s+sw,baseY-6*s);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-8*s,baseY-14*s);ctx.lineTo(x-20*s,baseY);ctx.stroke();
  ctx.restore();ctx.globalAlpha=1;
}

/* ============================================================
   A — THE GOLDEN IDLE HOUR (0 .. 90)
   ============================================================ */
function sceneOpen3(ctx,t){
  // a warm afternoon, not a night — this episode opens in daylight
  const g=ctx.createLinearGradient(0,0,0,H);
  const warm=ramp(t,0,6);
  g.addColorStop(0,mix('#101A22','#3E2A18',warm*0.8));
  g.addColorStop(0.45,mix('#0D141A','#5A3A20',warm*0.62));
  g.addColorStop(1,mix('#0A0D10','#2A1B11',warm*0.7));
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  strokes(ctx,t,130,['#6B4326','#8A5A2E','#3E2A18'],0.13,0,H*0.72,1.1);
  strokes(ctx,t,60,['#C4451F','#E0A050','#7A4520'],0.10,H*0.40,H,1.3);
  // low afternoon sun
  {const sx=W*0.80,sy=H*0.26;
   const sg=ctx.createRadialGradient(sx,sy,6,sx,sy,420);
   sg.addColorStop(0,rgba('#F0C070',0.30*warm));
   sg.addColorStop(0.4,rgba('#C4451F',0.13*warm));
   sg.addColorStop(1,'rgba(20,16,14,0)');ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);}

  if(t<28){
    line(ctx,'A scene that never makes it into the museum diorama.',W*0.5,H*0.30,32,CREAM,env(t,0.6,2.0,3.6,4.8),{italic:true});
    const facts=[['the hunt went well — there’s still meat',10.2],
                 ['the children are asleep',16.2],
                 ['the water’s fetched. the tools are sharp.',18.4]];
    for(let i=0;i<facts.length;i++){
      const a=env(t,facts[i][1],facts[i][1]+1.2,25.4,26.8); if(a<0.01)continue;
      line(ctx,'—  '+facts[i][0],W*0.5,H*0.42+i*46,27,ASH,a,{});
    }
    line(ctx,'For one rare golden hour, there is absolutely nothing that needs doing.',W*0.5,H*0.68,29,GOLD,env(t,20.4,22.0,25.6,27.0),{italic:true});
  }
  if(t>=26&&t<38){
    line(ctx,'And somebody is bored out of their skull.',W*0.5,H*0.40,42,CREAM,env(t,26.9,28.2,36.6,37.8),{weight:700});
    line(ctx,'We don’t have a word for who they were.',W*0.5,H*0.52,28,ASH,env(t,29.0,30.4,36.6,37.8),{italic:true});
    line(ctx,'But we have what they did next — they left it on a stone.',W*0.5,H*0.60,28,CREAM,env(t,32.8,34.2,36.6,37.8),{italic:true});
  }

  // ---- the crayon drags the pattern into being (38 .. 60) ----
  const stA=ramp(t,38.4,41.0);
  if(stA>0.01){
    const sx=W*0.5, sy=H*0.52;
    stone(ctx,sx,sy,470,330,stA);
    const prog=clamp((t-42.4)/(51.6-42.4),0,1);
    crosshatch(ctx,sx,sy,330,215,prog,stA,rgba('#C4451F',0.95),6);
    // the ochre crayon in hand, riding the newest stroke
    if(t>=42&&t<52.4){
      const ALL=[...XH_A,...XH_B,...XH_C], n=ALL.length, shown=prog*n;
      const idx=clamp(Math.floor(shown),0,n-1), f=clamp(shown-idx,0,1);
      const [x1,y1,x2,y2]=ALL[idx];
      const px=sx-165+ (x1+(x2-x1)*smooth(f))*330;
      const py=sy-107.5+(y1+(y2-y1)*smooth(f))*215;
      ctx.save();ctx.globalAlpha=0.95;
      ctx.fillStyle=rgba('#8E2E12',0.95);
      ctx.beginPath();ctx.ellipse(px,py-16,7,18,0.25,0,6.2832);ctx.fill();
      ctx.restore();ctx.globalAlpha=1;
    }
    if(t>=38&&t<43) line(ctx,'a little crayon of red ochre · a flat piece of rock',W*0.5,H*0.86,26,ASH,env(t,38.8,40.0,42.0,43.2),{italic:true});
    if(t>=51&&t<60){
      line(ctx,'The pattern of exactly nothing.',W*0.5,H*0.86,34,CREAM,env(t,51.9,53.0,58.8,60.0),{weight:700});
      line(ctx,'not a map · not a tally · not an animal',W*0.5,H*0.925,24,ASH,env(t,54.0,55.2,58.8,60.0),{italic:true});
      line(ctx,'a doodle',W*0.5,H*0.16,44,EMBER2,env(t,58.4,59.2,62.6,63.8),{weight:700});
    }
  }
  // ---- 73,000 (60 .. 78) ----
  if(t>=60&&t<79){
    line(ctx,'73,000 years old',W*0.5,H*0.16,60,CREAM,env(t,61.0,62.4,77.0,78.4),{weight:700});
    line(ctx,'one of the oldest drawings we have ever found',W*0.5,H*0.235,26,GOLD,env(t,65.4,66.8,77.0,78.4),{italic:true});
    line(ctx,'and it isn’t beautiful. Somebody made it for no reason at all.',W*0.5,H*0.90,28,CREAM,env(t,70.8,72.4,77.0,78.4),{italic:true});
    citation(ctx,'Henshilwood CS et al. 2018, Nature 562:115 — Blombos Cave, South Africa',ramp(t,61,63));
  }
  // ---- the question (79 .. 90) ----
  if(t>=79){
    const a=env(t,79.4,80.8,88.8,90.2);
    ctx.fillStyle=rgba('#000000',a*0.72);ctx.fillRect(0,0,W,H);
    line(ctx,'…one of the deepest questions in all of human origins:',W*0.5,H*0.40,28,ASH,a,{italic:true});
    line(ctx,'Where does “no reason at all” come from?',W*0.5,H*0.50,42,CREAM,env(t,83.4,84.8,88.8,90.2),{weight:700});
  }
  vignette(ctx);grain(ctx,t);
}

/* ============================================================
   B — THE ENGINE (90 .. 142)
   ============================================================ */
function sceneEngine(ctx,t){
  baseBg(ctx,t,0.20);
  kicker(ctx,'in defence of boredom',env(t,91,92.5,102,104));
  if(t>=90&&t<103){
    line(ctx,'Boredom gets no respect. It deserves a statue.',W*0.5,H*0.26,32,CREAM,env(t,86.2,88.0,101.0,102.4),{italic:true});
    line(ctx,'Most animals don’t seem to get bored the way we do.',W*0.5,H*0.36,29,ASH,env(t,91.0,92.4,101.0,102.4),{});
    lizard(ctx,W*0.42,H*0.60,1.5,env(t,93.4,95.0,101.4,102.8),rgba('#241A10',0.95));
    line(ctx,'content · perfectly, blissfully doing nothing',W*0.5,H*0.76,26,GOLD,env(t,97.8,99.2,101.4,102.8),{italic:true});
  }
  if(t>=103&&t<125){
    line(ctx,'But put a mind with spare capacity in the same afternoon…',W*0.5,H*0.20,28,ASH,env(t,103.8,105.2,122.8,124.2),{italic:true});
    const who=[['a raven',107.4],['a young chimp',108.6],['a human toddler',109.6],['you, on a delayed flight',110.8]];
    for(let i=0;i<who.length;i++){
      const a=env(t,who[i][1],who[i][1]+1.0,122.8,124.2); if(a<0.01)continue;
      line(ctx,who[i][0],W*(0.20+i*0.20),H*0.36,i===3?26:28,i===3?GOLD:CREAM,a,{italic:i===3});
    }
    // the mind casting around for a problem
    const cast=env(t,114.4,116.0,122.8,124.2);
    if(cast>0.01){
      ctx.save();ctx.globalAlpha=cast*0.8;
      ctx.strokeStyle=rgba(EMBER2,0.75);ctx.lineWidth=2.2;
      ctx.beginPath();
      for(let i=0;i<=140;i++){const u=i/140, ang=u*14+t*0.9, r=40+u*180;
        const x=W*0.5+Math.cos(ang)*r, y=H*0.60+Math.sin(ang)*r*0.42;
        i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
      ctx.stroke();ctx.restore();ctx.globalAlpha=1;
      line(ctx,'goes looking for a problem to solve —',W*0.5,H*0.84,28,CREAM,env(t,119.0,120.2,122.8,124.2),{italic:true});
      line(ctx,'and if it can’t find one, it will invent one.',W*0.5,H*0.90,28,EMBER2,env(t,121.2,122.2,123.0,124.4),{italic:true,weight:700});
    }
  }
  if(t>=125){
    const a=env(t,126.6,128.0,140.2,141.6);
    line(ctx,'Boredom isn’t the absence of activity.',W*0.5,H*0.34,34,CREAM,a,{});
    line(ctx,'It’s a mind with spare capacity, running hot, hunting for novelty.',W*0.5,H*0.44,29,EMBER2,env(t,129.2,130.6,140.2,141.6),{italic:true});
    line(ctx,'the feeling of having more brain than your afternoon requires',W*0.5,H*0.62,32,GOLD,env(t,137.8,139.2,140.4,141.8),{italic:true,weight:700});
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   C — THEY HAD THOSE AFTERNOONS (142 .. 233)
   ============================================================ */
function sceneAfternoon(ctx,t){
  baseBg(ctx,t,0.24);
  ghost(ctx,'hands',t,env(t,180,184,200,204)*0.10,1.4);
  kicker(ctx,'they had those afternoons',env(t,144,145.5,158,160));
  if(t>=142&&t<164){
    line(ctx,'The grim struggle-for-survival story leaves something out:',W*0.5,H*0.28,29,ASH,env(t,143.0,144.6,162.0,163.4),{italic:true});
    line(ctx,'They had those afternoons.',W*0.5,H*0.40,44,CREAM,env(t,148.4,149.8,162.0,163.4),{weight:700});
    line(ctx,'Hunter-gatherer life, for all its genuine dangers,',W*0.5,H*0.54,27,CREAM,env(t,151.2,152.6,162.0,163.4),{});
    line(ctx,'was not a non-stop scramble.',W*0.5,H*0.54+40,27,GOLD,env(t,153.6,155.0,162.0,163.4),{italic:true});
    line(ctx,'(a whole later episode on how much free time — the number will surprise you)',W*0.5,H*0.80,23,ASH,env(t,156.4,158.0,162.0,163.4),{italic:true});
  }
  if(t>=164&&t<175){
    line(ctx,'Sometimes the belly was full, the fire was lit, the leopard was elsewhere —',W*0.5,H*0.40,28,CREAM,env(t,165.0,166.6,173.4,174.8),{});
    line(ctx,'and the mind kept running anyway.',W*0.5,H*0.40+46,32,EMBER2,env(t,168.6,169.8,173.4,174.8),{italic:true,weight:700});
    line(ctx,'That surplus had to go somewhere.',W*0.5,H*0.58,30,GOLD,env(t,170.8,172.0,173.6,175.0),{italic:true});
  }
  // the Blombos workshop
  if(t>=175&&t<205){
    line(ctx,'Some of it went into that crosshatch at Blombos.',W*0.5,H*0.14,28,CREAM,env(t,175.4,176.8,203.4,204.8),{italic:true});
    const sx=W*0.24, sy=H*0.42;
    stone(ctx,sx,sy,300,210,env(t,176.2,177.8,203.4,204.8));
    crosshatch(ctx,sx,sy,215,140,1,env(t,176.6,178.4,203.4,204.8),rgba('#C4451F',0.95),4.5);
    // abalone paint pots
    const potA=env(t,191.4,193.0,203.4,204.8);
    if(potA>0.01){
      for(let i=0;i<2;i++){
        const px=W*(0.58+i*0.20), py=H*0.44;
        ctx.save();ctx.globalAlpha=potA;
        const g=ctx.createRadialGradient(px-14,py-14,4,px,py,74);
        g.addColorStop(0,'#9FB0B8');g.addColorStop(0.6,'#6E7F88');g.addColorStop(1,'#3E4A50');
        ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(px,py,72,52,0.2,0,6.2832);ctx.fill();
        ctx.fillStyle=rgba('#8E2E12',0.8);ctx.beginPath();ctx.ellipse(px+4,py+4,44,30,0.2,0,6.2832);ctx.fill();
        ctx.restore();ctx.globalAlpha=1;
      }
      line(ctx,'abalone shells used as paint pots — the recipe still crusted inside',W*0.68,H*0.60,24,ASH,potA,{italic:true});
    }
    if(t>=185) line(ctx,'a little ochre workshop · 100,000 years ago',W*0.24,H*0.62,25,GOLD,env(t,186.0,187.6,203.4,204.8),{italic:true});
    if(t>=196) line(ctx,'the same restless geometry, carved over and over',W*0.5,H*0.90,26,CREAM,env(t,197.4,198.8,203.4,204.8),{italic:true});
    citation(ctx,'Henshilwood CS et al. 2011, Science 334:219 — Blombos ochre-processing workshop',env(t,186,188,203.4,204.8));
  }
  // Diepkloof ostrich eggshell canteens
  if(t>=205){
    const a=env(t,206.4,208.2,231.4,232.8);
    line(ctx,'A few hundred kilometres away, at Diepkloof —',W*0.5,H*0.18,28,ASH,env(t,207.0,208.6,231.4,232.8),{italic:true});
    // eggshell canteens with hatch designs
    for(let i=0;i<3;i++){
      const ea=env(t,211.8+i*0.9,213.4+i*0.9,231.4,232.8); if(ea<0.01)continue;
      const ex=W*(0.28+i*0.22), ey=H*0.50;
      ctx.save();ctx.globalAlpha=ea;
      const g=ctx.createRadialGradient(ex-18,ey-24,6,ex,ey,110);
      g.addColorStop(0,'#E8DCC4');g.addColorStop(0.65,'#C9B899');g.addColorStop(1,'#8E7C60');
      ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(ex,ey,66,84,0,0,6.2832);ctx.fill();
      // scratched hatch bands
      ctx.strokeStyle=rgba('#4A3520',0.75);ctx.lineWidth=2.4;ctx.lineCap='round';
      for(let k=-3;k<=3;k++){
        ctx.beginPath();ctx.moveTo(ex-44,ey+k*17+9);ctx.lineTo(ex+44,ey+k*17-9);ctx.stroke();
      }
      for(let k=-2;k<=2;k++){
        ctx.beginPath();ctx.moveTo(ex+k*20-8,ey-58);ctx.lineTo(ex+k*20+8,ey+58);ctx.stroke();
      }
      ctx.restore();ctx.globalAlpha=1;
    }
    line(ctx,'ostrich eggshell water canteens — decorated',W*0.5,H*0.74,29,CREAM,env(t,218.2,219.8,231.4,232.8),{});
    line(ctx,'Decorated water bottles. 60,000 years old.',W*0.5,H*0.83,32,EMBER2,env(t,223.8,225.2,231.4,232.8),{italic:true,weight:700});
    line(ctx,'If that doesn’t make them feel achingly familiar, I don’t know what will.',W*0.5,H*0.91,24,GOLD,env(t,228.4,229.8,231.6,233.0),{italic:true});
    citation(ctx,'Texier PJ et al. 2010, PNAS 107:6180 — Diepkloof Rock Shelter',a);
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   D — DECORATION AND RHYTHM (233 .. 315)
   ============================================================ */
function sceneAdorn(ctx,t){
  baseBg(ctx,t,0.22);
  ghost(ctx,'hands',t,env(t,244,247,262,265)*0.09,3.1);
  kicker(ctx,'the other things a bored mind reaches for',env(t,235,236.5,248,250));
  if(t>=233&&t<243){
    line(ctx,'Drawing is only one of them.',W*0.5,H*0.36,32,CREAM,env(t,234.0,235.4,241.4,242.8),{});
    line(ctx,'There’s also decoration — the urge to make your stuff look like something.',W*0.5,H*0.36+48,27,ASH,env(t,238.0,239.4,241.4,242.8),{italic:true});
  }
  if(t>=243&&t<277){
    const bp=clamp((t-245.6)/4.5,0,1);
    beads(ctx,W*0.5,H*0.36,560,13,bp,env(t,244.6,246.2,275.4,276.8));
    line(ctx,'little sea-snail shells, pierced to hang on a cord',W*0.5,H*0.48,26,ASH,env(t,249.6,251.2,275.4,276.8),{italic:true});
    // two dates, the second one staggering
    const d1=env(t,255.4,256.8,275.4,276.8);
    if(d1>0.01){line(ctx,'Blombos — 75,000 years',W*0.30,H*0.62,30,CREAM,d1,{weight:700});}
    const d2=env(t,264.8,266.4,275.4,276.8);
    if(d2>0.01){
      line(ctx,'Bizmoune, Morocco — 142,000 years',W*0.70,H*0.62,30,EMBER2,d2,{weight:700});
      line(ctx,'somebody sat down and made themselves a necklace',W*0.5,H*0.78,28,CREAM,env(t,268.4,269.8,275.4,276.8),{italic:true});
      line(ctx,'Not because it kept them warm. Because they wanted to be looked at.',W*0.5,H*0.86,27,GOLD,env(t,272.6,274.0,275.6,277.0),{italic:true});
    }
    citation(ctx,'Sehasseh EM et al. 2021, Science Advances 7:eabi8620 — Bizmoune Cave',env(t,264,266,275.4,276.8));
  }
  // rhythm — the art that leaves nothing behind
  if(t>=277){
    const a=env(t,278.4,280.0,313.4,314.8);
    line(ctx,'And then there’s rhythm.',W*0.5,H*0.16,36,CREAM,env(t,278.6,279.8,313.4,314.8),{weight:700});
    line(ctx,'the thing you’re doing right now, tapping your foot without noticing',W*0.5,H*0.235,25,ASH,env(t,280.4,281.8,290.0,291.4),{italic:true});
    pulses(ctx,W*0.5,H*0.55,t,a,0.85);
    // two hands clapping — abstracted
    const cl=env(t,291.4,292.8,313.4,314.8);
    if(cl>0.01){
      const gap=10+16*Math.abs(Math.sin(t*3.0));
      // warm pool behind the clap so the two dark shapes read
      ctx.save();ctx.globalAlpha=cl*0.7;
      {const rg=ctx.createRadialGradient(W*0.5,H*0.55,8,W*0.5,H*0.55,250);
       rg.addColorStop(0,rgba('#C08A4E',0.26));rg.addColorStop(1,'rgba(20,16,14,0)');
       ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);}
      ctx.restore();
      ctx.save();ctx.globalAlpha=cl;
      ctx.fillStyle=rgba('#241A10',0.95);ctx.strokeStyle=rgba('#241A10',0.95);
      ctx.beginPath();ctx.ellipse(W*0.5-gap-34,H*0.55,26,46,0.22,0,6.2832);ctx.fill();
      ctx.beginPath();ctx.ellipse(W*0.5+gap+34,H*0.55,26,46,-0.22,0,6.2832);ctx.fill();
      ctx.restore();ctx.globalAlpha=1;
    }
    if(t>=285) line(ctx,'We can’t dig up a beat. Sound doesn’t fossilise.',W*0.5,H*0.80,29,CREAM,env(t,285.8,287.2,300.4,301.8),{italic:true});
    if(t>=288) line(ctx,'But the human body is a percussion instrument you carry everywhere.',W*0.5,H*0.87,26,GOLD,env(t,288.4,289.8,300.4,301.8),{italic:true});
    if(t>=299){
      line(ctx,'almost certainly the oldest art of all —',W*0.5,H*0.80,29,CREAM,env(t,299.6,301.0,313.4,314.8),{});
      line(ctx,'precisely because it leaves nothing behind',W*0.5,H*0.87,27,EMBER2,env(t,301.6,303.0,313.4,314.8),{italic:true});
    }
    if(t>=304) line(ctx,'A bored mind with two hands will find a rhythm faster than it’ll find a crayon.',W*0.5,H*0.945,24,ASH,env(t,304.4,305.8,313.6,315.0),{italic:true});
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   E — CHILDREN (315 .. 381)
   ============================================================ */
function sceneChildren(ctx,t){
  baseBg(ctx,t,0.26);
  kicker(ctx,'the place that’s easy to overlook',env(t,317,318.5,331,333));
  if(t>=315&&t<327){
    line(ctx,'Where does the whole habit begin?',W*0.5,H*0.34,34,CREAM,env(t,316.4,317.8,325.4,326.8),{});
    line(ctx,'One place is easy to overlook: children.',W*0.5,H*0.34+48,34,EMBER2,env(t,319.4,320.8,325.4,326.8),{italic:true,weight:700});
  }
  if(t>=327&&t<343){
    child(ctx,W*0.36,H*0.72,1.7,env(t,327.6,329.2,341.4,342.8),rgba('#241A10',0.95),t);
    // the scribble the child leaves in the dirt
    const sc=clamp((t-329.6)/6.0,0,1);
    ctx.save();ctx.globalAlpha=env(t,329.6,331.0,341.4,342.8)*0.85;
    ctx.strokeStyle=rgba('#7E5738',0.9);ctx.lineWidth=4;ctx.lineCap='round';
    ctx.beginPath();
    for(let i=0;i<=Math.floor(sc*90);i++){
      const u=i/90, x=W*0.46+u*300+Math.sin(u*22)*36, y=H*0.74+Math.cos(u*17)*30;
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.stroke();ctx.restore();ctx.globalAlpha=1;
    line(ctx,'Watch any child with a stick and five spare minutes.',W*0.5,H*0.22,29,CREAM,env(t,323.8,325.2,341.4,342.8),{italic:true});
    const acts=[['draw in the dirt',327.6],['hum a tuneless tune',329.6],['stack pebbles into a tower',331.4]];
    for(let i=0;i<acts.length;i++){
      const a=env(t,acts[i][1],acts[i][1]+1.1,341.4,342.8); if(a<0.01)continue;
      line(ctx,'—  '+acts[i][0],W*0.72,H*0.34+i*40,25,ASH,a,{align:'center'});
    }
    if(t>=335) line(ctx,'That’s not learned behaviour. It’s overflow.',W*0.5,H*0.90,29,GOLD,env(t,335.4,336.8,341.6,343.0),{italic:true});
  }
  if(t>=343&&t<365){
    line(ctx,'running its favourite program:',W*0.5,H*0.30,28,ASH,env(t,340.6,342.0,362.4,363.8),{italic:true});
    line(ctx,'Play',W*0.5,H*0.40,64,CREAM,env(t,341.6,343.0,362.4,363.8),{weight:700});
    line(ctx,'Play is boredom’s cheerful twin.',W*0.5,H*0.52,32,EMBER2,env(t,343.6,345.0,362.4,363.8),{italic:true});
    line(ctx,'what surplus attention does before anyone’s told it what things are for',W*0.5,H*0.62,26,GOLD,env(t,346.2,347.6,362.4,363.8),{italic:true});
    if(t>=351){
      line(ctx,'A band of ancient humans wasn’t just tired adults resting between hunts.',W*0.5,H*0.78,27,CREAM,env(t,352.2,353.8,362.4,363.8),{});
      line(ctx,'It was full of children.',W*0.5,H*0.85,30,CREAM,env(t,356.6,357.8,362.4,363.8),{weight:700});
    }
  }
  if(t>=365){
    const a=env(t,365.6,367.0,379.4,380.8);
    line(ctx,'poked · patterned · rearranged for fun',W*0.5,H*0.24,30,GOLD,env(t,361.6,363.2,372.0,373.4),{italic:true});
    line(ctx,'Some of the oldest marks we find may be exactly that. Innocent —',W*0.5,H*0.36,27,CREAM,a,{});
    line(ctx,'and no less important for it.',W*0.5,H*0.36+40,27,EMBER2,env(t,368.2,369.4,379.4,380.8),{italic:true});
    line(ctx,'The instinct that scratches a doodle at 73,000 years',W*0.5,H*0.56,28,CREAM,env(t,371.0,372.6,379.4,380.8),{});
    line(ctx,'is the same one that draws on the walls at age three.',W*0.5,H*0.56+42,28,GOLD,env(t,374.2,375.4,379.4,380.8),{italic:true});
    line(ctx,'Most parents will confirm it is essentially impossible to switch off.',W*0.5,H*0.80,25,ASH,env(t,377.4,378.6,379.6,381.0),{italic:true});
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   F — THE HONEST MURK (381 .. 421)
   ============================================================ */
function sceneMurk(ctx,t){
  baseBg(ctx,t,0.16);
  kicker(ctx,'where the science gets murky',env(t,383,384.5,398,400));
  if(t>=381&&t<400){
    line(ctx,'I want to be careful here.',W*0.5,H*0.26,32,CREAM,env(t,381.4,382.8,398.4,399.8),{});
    line(ctx,'This is where the science gets honestly murky.',W*0.5,H*0.26+44,29,ASH,env(t,383.4,384.8,398.4,399.8),{italic:true});
    line(ctx,'Not everyone agrees these marks mean anything.',W*0.5,H*0.44,29,CREAM,env(t,386.8,388.2,398.4,399.8),{});
    // the two readings, side by side
    const q=env(t,390.0,391.6,398.4,399.8);
    if(q>0.01){
      line(ctx,'That crosshatch — is it art?',W*0.30,H*0.60,27,CREAM,q,{italic:true});
      line(ctx,'Or idle scratching that happens to survive?',W*0.70,H*0.60,27,ASH,q,{italic:true});
      line(ctx,'Do beads prove symbolism — or just that shiny things are nice?',W*0.5,H*0.72,26,ASH,env(t,396.2,397.6,398.6,400.0),{italic:true});
    }
  }
  if(t>=400){
    const a=env(t,400.6,402.0,419.4,420.8);
    line(ctx,'These are the real fights, and I’m not going to paper over them.',W*0.5,H*0.20,27,ASH,a,{italic:true});
    line(ctx,'But notice —',W*0.5,H*0.34,30,CREAM,env(t,404.0,405.2,419.4,420.8),{});
    line(ctx,'even the sceptical reading is exactly my point:',W*0.5,H*0.34+42,30,CREAM,env(t,405.4,406.8,419.4,420.8),{});
    line(ctx,'“they were just idly scratching”',W*0.5,H*0.52,34,GOLD,env(t,407.6,409.0,419.4,420.8),{italic:true});
    line(ctx,'Idly scratching, done for its own sake, by a mind with attention to spare',W*0.5,H*0.66,27,CREAM,env(t,411.4,412.8,419.4,420.8),{});
    line(ctx,'— is the thing.',W*0.5,H*0.66+40,30,EMBER2,env(t,414.8,416.0,419.4,420.8),{italic:true,weight:700});
    line(ctx,'Not with a masterpiece. With a fidget.',W*0.5,H*0.84,32,CREAM,env(t,418.4,419.4,420.4,421.6),{weight:700});
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   G — WHAT BOREDOM ACTUALLY IS (421 .. 497)
   ============================================================ */
function capacityBars(ctx,t){
  // "more brain than the afternoon requires" — capacity vs demand
  const gx=W*0.5, base=H*0.66, bw=140, gap=110, maxH=210;
  const a=ramp(t,429.0,431.0);
  const cap=ramp(t,429.4,432.0), dem=ramp(t,430.4,433.0);
  ctx.save();
  ctx.globalAlpha=a;
  ctx.fillStyle=rgba(EMBER2,0.9);ctx.fillRect(gx-gap-bw,base-maxH*cap,bw,maxH*cap);
  ctx.fillStyle=rgba(ASH,0.55);ctx.fillRect(gx+gap,base-maxH*0.38*dem,bw,maxH*0.38*dem);
  ctx.strokeStyle=rgba(ASH,0.5);ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(gx-gap-bw-40,base);ctx.lineTo(gx+gap+bw+40,base);ctx.stroke();
  ctx.restore();
  line(ctx,'your mind',gx-gap-bw/2,base+28,24,CREAM,a,{});
  line(ctx,'the afternoon',gx+gap+bw/2,base+28,24,ASH,a,{});
  // the gap between them IS the feeling
  const gapA=ramp(t,433.4,435.4);
  if(gapA>0.01){
    ctx.save();ctx.globalAlpha=gapA*0.8;
    ctx.strokeStyle=rgba(GOLD,0.9);ctx.lineWidth=2.5;ctx.setLineDash([7,7]);
    ctx.beginPath();ctx.moveTo(gx-gap-bw/2,base-maxH*cap);ctx.lineTo(gx+gap+bw/2,base-maxH*cap);ctx.stroke();
    ctx.setLineDash([]);ctx.restore();
    line(ctx,'the gap is the feeling',gx,base-maxH*cap-26,25,GOLD,gapA,{italic:true});
  }
}
function sceneWhat(ctx,t){
  baseBg(ctx,t,0.22);
  kicker(ctx,'what boredom actually is',env(t,423,424.5,438,440));
  if(t>=421&&t<445){
    line(ctx,'Boredom is the nagging signal',W*0.5,H*0.20,32,CREAM,env(t,428.8,430.2,443.4,444.8),{});
    line(ctx,'that your mind is more powerful than your current situation.',W*0.5,H*0.20+42,29,EMBER2,env(t,430.8,432.2,443.4,444.8),{italic:true});
    capacityBars(ctx,t);
    if(t>=434){
      line(ctx,'It is, in a sense, pain.',W*0.5,H*0.84,32,CREAM,env(t,434.4,435.6,443.4,444.8),{});
      line(ctx,'The specific pain of unused capacity.',W*0.5,H*0.91,30,GOLD,env(t,436.4,437.8,443.6,445.0),{italic:true,weight:700});
    }
  }
  if(t>=445&&t<458){
    line(ctx,'And like most pain, it exists to make you do something about it.',W*0.5,H*0.30,29,CREAM,env(t,441.2,442.8,456.4,457.8),{});
    lizard(ctx,W*0.5,H*0.56,1.4,env(t,444.2,445.8,456.4,457.8),rgba('#241A10',0.95));
    line(ctx,'A lizard never feels it — its mind is beautifully matched to its day.',W*0.5,H*0.72,27,ASH,env(t,445.4,446.8,456.4,457.8),{italic:true});
  }
  if(t>=458&&t<473){
    line(ctx,'But somewhere in the long dawn of the human mind,',W*0.5,H*0.26,29,CREAM,env(t,449.4,450.8,471.4,472.8),{});
    line(ctx,'we ended up with brains that routinely had more than the afternoon needed.',W*0.5,H*0.26+42,27,ASH,env(t,452.0,453.4,471.4,472.8),{italic:true});
    const prods=[['Make something.',461.2],['Solve something.',462.8],['Try something that has never been tried.',464.6]];
    for(let i=0;i<prods.length;i++){
      const a=env(t,prods[i][1],prods[i][1]+1.0,471.4,472.8); if(a<0.01)continue;
      line(ctx,prods[i][0],W*0.5,H*0.46+i*46,32,i===2?GOLD:CREAM,a,{italic:i===2,weight:i===2?700:400});
    }
    if(t>=467) line(ctx,'Most of the time that gave us better tools, better plans — the slow accumulation of everything.',W*0.5,H*0.84,24,ASH,env(t,467.6,469.0,471.6,473.0),{italic:true});
  }
  if(t>=473){
    const a=env(t,473.6,475.2,495.4,496.8);
    line(ctx,'But sometimes, on a full-bellied afternoon with nothing left to fix,',W*0.5,H*0.20,28,CREAM,a,{});
    line(ctx,'it had nowhere useful to go. So it made a useless thing.',W*0.5,H*0.20+42,28,ASH,env(t,477.0,478.4,495.4,496.8),{italic:true});
    const sx=W*0.5, sy=H*0.52;
    stone(ctx,sx,sy,420,290,env(t,480.6,482.2,495.4,496.8));
    crosshatch(ctx,sx,sy,300,195,1,env(t,481.0,482.8,495.4,496.8),rgba('#C4451F',0.95),5.5);
    if(t>=486) line(ctx,'that fed no one, and killed no leopard, and did absolutely nothing —',W*0.5,H*0.85,26,ASH,env(t,486.8,488.2,495.4,496.8),{italic:true});
    if(t>=493) line(ctx,'except outlast its maker by 73,000 years.',W*0.5,H*0.92,30,EMBER2,env(t,493.4,494.6,495.6,497.0),{italic:true,weight:700});
  }
  vignette(ctx);grain(ctx,t);watermark(ctx,1);
}

/* ============================================================
   H — CLOSE (497 .. 577)
   ============================================================ */
function sceneClose3(ctx,t){
  baseBg(ctx,t,0.30*(1-ramp(t,562,574)*0.5));
  const fx=W*0.5,fy=H*0.92;
  fireGlow(ctx,fx,fy,0.42*(1-ramp(t,562,574)*0.6),t);
  ghost(ctx,'hands',t,env(t,505,509,522,526)*0.09,4.2);

  if(t>=497&&t<518){
    line(ctx,'Here’s the part I can’t quite get over.',W*0.5,H*0.22,32,CREAM,env(t,498.2,499.6,516.4,517.8),{});
    line(ctx,'That same restless engine — the one that couldn’t leave a blank stone alone —',W*0.5,H*0.34,27,ASH,env(t,500.4,501.8,516.4,517.8),{italic:true});
    line(ctx,'is the one that gave us every other thing too.',W*0.5,H*0.34+40,29,CREAM,env(t,504.6,506.0,516.4,517.8),{});
    if(t>=507){
      line(ctx,'a better spear  ·  a new word  ·  a wild idea about what the stars are',W*0.5,H*0.58,27,GOLD,env(t,512.6,514.0,516.4,517.8),{italic:true});
      line(ctx,'the mind that fidgets a crosshatch into a rock',W*0.5,H*0.48,26,CREAM,env(t,507.6,509.0,516.4,517.8),{italic:true});
    }
  }
  if(t>=518&&t<540){
    line(ctx,'Boredom doesn’t just make art.',W*0.5,H*0.26,34,CREAM,env(t,518.4,519.6,538.4,539.8),{});
    line(ctx,'Boredom makes everything downstream of',W*0.5,H*0.38,32,CREAM,env(t,520.4,521.8,538.4,539.8),{});
    line(ctx,'what if',W*0.5,H*0.47,54,EMBER2,env(t,522.2,523.4,538.4,539.8),{italic:true,weight:700});
    if(t>=524){
      line(ctx,'Art is simply the purest, most useless, most honest version of it —',W*0.5,H*0.64,26,ASH,env(t,524.4,525.8,538.4,539.8),{italic:true});
      line(ctx,'the one place the restlessness admits it isn’t solving anything at all.',W*0.5,H*0.71,26,ASH,env(t,528.4,529.8,538.4,539.8),{italic:true});
    }
    if(t>=532){
      line(ctx,'Just a mind refusing to sit still,',W*0.5,H*0.83,29,CREAM,env(t,532.8,534.0,538.4,539.8),{});
      line(ctx,'leaving a mark to prove it was thinking.',W*0.5,H*0.90,29,GOLD,env(t,536.2,537.4,538.6,540.0),{italic:true});
    }
  }
  if(t>=540&&t<556){
    line(ctx,'The doodle is the invention with its mask off.',W*0.5,H*0.24,34,CREAM,env(t,539.6,540.8,554.4,555.8),{weight:700});
    const sx=W*0.5, sy=H*0.54;
    stone(ctx,sx,sy,400,280,env(t,541.0,542.6,554.4,555.8));
    crosshatch(ctx,sx,sy,285,185,1,env(t,541.4,543.0,554.4,555.8),rgba('#C4451F',0.95),5.5);
    line(ctx,'That’s the room where art was born.',W*0.5,H*0.86,32,EMBER2,env(t,543.2,544.6,554.4,555.8),{italic:true,weight:700});
    line(ctx,'Not triumph. Not tragedy. Not some grand ceremony.',W*0.5,H*0.93,25,ASH,env(t,545.2,546.6,554.4,555.8),{italic:true});
  }
  if(t>=556){
    const a=env(t,556.0,557.4,574.6,576.4);
    line(ctx,'Boredom. An empty afternoon.',W*0.5,H*0.26,34,CREAM,a,{});
    line(ctx,'And a mind that couldn’t stand to leave the world exactly as it found it.',W*0.5,H*0.26+46,28,GOLD,env(t,551.4,553.0,574.6,576.4),{italic:true});
    line(ctx,'We are the descendants of the ones who fidgeted.',W*0.5,H*0.50,38,CREAM,env(t,555.6,557.0,574.6,576.4),{weight:700});
    if(t>=558){
      line(ctx,'Every doodle you ever drew in the margin of a page',W*0.5,H*0.66,28,CREAM,env(t,558.6,560.0,574.6,576.4),{});
      line(ctx,'you were supposed to be paying attention to',W*0.5,H*0.66+40,28,ASH,env(t,560.8,562.0,574.6,576.4),{italic:true});
      line(ctx,'is you, still tending the oldest fire there is.',W*0.5,H*0.80,32,EMBER2,env(t,563.4,564.8,574.6,576.4),{italic:true,weight:700});
    }
    // sign-off
    const so=ramp(t,569.5,572.5);
    if(so>0.01){
      ctx.fillStyle=rgba('#000000',so*0.80);ctx.fillRect(0,0,W,H);
      drawHand(ctx,W*0.5,H*0.42,0.58,so,EMBER,true);
      line(ctx,'ANCIENT FIRELIGHT',W*0.5,H*0.72,40,CREAM,so,{});
      line(ctx,'NEXT — the flute that may not be a flute',W*0.5,H*0.79,25,ASH,ramp(t,571.4,573.4),{italic:true});
    }
  }
  vignette(ctx);grain(ctx,t);
}

/* ============================================================
   EPISODE
   ============================================================ */
window.EPISODE={
  duration:576.8,
  bounds:[90,142,233,315,381,421,497],
  ghostNames:['hands','horses'],
  render:function(ctx,t){
    if(t<90)        sceneOpen3(ctx,t);
    else if(t<142)  sceneEngine(ctx,t);
    else if(t<233)  sceneAfternoon(ctx,t);
    else if(t<315)  sceneAdorn(ctx,t);
    else if(t<381)  sceneChildren(ctx,t);
    else if(t<421)  sceneMurk(ctx,t);
    else if(t<497)  sceneWhat(ctx,t);
    else            sceneClose3(ctx,t);
  }
};
