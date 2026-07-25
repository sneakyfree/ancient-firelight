const W=1280,H=720;
const CREAM='#EDE4D6',EMBER2='#D9552B',SPARK='#E9783B';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const ramp=(t,a,b)=>smooth((t-a)/(b-a));
const rnd=s=>{const x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x);};
function hx(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function mix(a,b,t){t=clamp(t,0,1);const A=hx(a),B=hx(b);return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`;}

function figure(ctx,x,baseY,s,color){
  ctx.fillStyle=color;
  ctx.beginPath();ctx.moveTo(x-34*s,baseY);
  ctx.quadraticCurveTo(x-30*s,baseY-70*s,x,baseY-78*s);
  ctx.quadraticCurveTo(x+30*s,baseY-70*s,x+34*s,baseY);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.arc(x,baseY-96*s,20*s,0,6.2832);ctx.fill();
  ctx.beginPath();ctx.ellipse(x+20*s,baseY-8*s,26*s,16*s,0,0,6.2832);ctx.fill();
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

function render(ctx,t){
  ctx.clearRect(0,0,W,H);
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
  const spark=ramp(t,36.2,37.2)*(1-ramp(t,37.6,38.3));
  if(spark>0.01){ctx.fillStyle=SPARK;for(let i=0;i<30;i++){const u=rnd(i*5+7);
    ctx.globalAlpha=spark*(1-u);const sx=fx+(rnd(i)-0.5)*70,sy=fy-20-u*200*spark;
    ctx.beginPath();ctx.arc(sx,sy,(1-u)*2.2+0.4,0,6.2832);ctx.fill();}ctx.globalAlpha=1;}
  const halfA=ramp(t,24.0,24.5)*(1-ramp(t,26.2,26.9));
  if(halfA>0.01){ctx.globalAlpha=halfA;ctx.fillStyle=CREAM;
    ctx.font='700 150px EBG,Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('Half.',W*0.5,H*0.48);ctx.globalAlpha=1;}
  const qA=ramp(t,27.0,27.6)*(1-ramp(t,29.2,30.0));
  if(qA>0.01){ctx.globalAlpha=qA;ctx.fillStyle=EMBER2;
    ctx.font='italic 400 62px EBG,Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('So what did you do?',W*0.5,H*0.48);ctx.globalAlpha=1;}
  const v=ctx.createRadialGradient(W/2,H/2,H*0.32,W/2,H/2,H*0.85);
  v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,0.55)');
  ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
  if(lit){const flr=fire*(0.045+0.03*Math.sin(t*17));ctx.fillStyle=`rgba(150,60,25,${flr})`;ctx.fillRect(0,0,W,H);}
}
window.__c=document.getElementById('c');window.__x=window.__c.getContext('2d');
window.frame=function(t){render(window.__x,t);return window.__c.toDataURL('image/png');};
window.ready=true;
