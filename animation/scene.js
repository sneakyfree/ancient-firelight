/* Night-fire scene for Ancient Firelight thumbnails. Crude-but-premium:
   silhouette figures, one ember fire, soot dark. The style IS the subject. */
window.Scene = (function () {
  function rand(s){ // deterministic-ish jitter by index, no Math.random dependency for layout
    var x = Math.sin(s * 12.9898) * 43758.5453; return x - Math.floor(x);
  }
  function flame(ctx, x, y, s) {
    // layered ember flame, bottom-anchored at (x,y)
    var layers = [
      ['rgba(120,40,18,0.9)', 1.0],
      ['rgba(196,69,31,0.95)', 0.66],
      ['rgba(233,120,50,1)', 0.4],
      ['rgba(255,214,150,1)', 0.18]
    ];
    for (var l = 0; l < layers.length; l++) {
      var w = 46 * s * layers[l][1], h = 120 * s * layers[l][1];
      ctx.fillStyle = layers[l][0];
      ctx.beginPath();
      ctx.moveTo(x, y - h);
      ctx.bezierCurveTo(x - w, y - h * 0.55, x - w * 0.7, y, x, y);
      ctx.bezierCurveTo(x + w * 0.7, y, x + w, y - h * 0.55, x, y - h);
      ctx.closePath(); ctx.fill();
    }
    // sparks rising
    ctx.fillStyle = '#E9783B';
    for (var i = 0; i < 26; i++) {
      var t = rand(i + x), u = rand(i * 2.3 + y);
      var sx = x + (t - 0.5) * 90 * s, sy = y - 40 - u * 260 * s;
      ctx.globalAlpha = (1 - u) * 0.8;
      var r = (1 - u) * 2.4 * s + 0.4;
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function figure(ctx, x, baseY, s, color) {
    // crude seated silhouette: torso + head + a knee
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(x - 34 * s, baseY);
    ctx.quadraticCurveTo(x - 30 * s, baseY - 70 * s, x, baseY - 78 * s);
    ctx.quadraticCurveTo(x + 30 * s, baseY - 70 * s, x + 34 * s, baseY);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x, baseY - 96 * s, 20 * s, 0, 6.2832); ctx.fill(); // head
    ctx.beginPath(); ctx.ellipse(x + 20 * s, baseY - 8 * s, 26 * s, 16 * s, 0, 0, 6.2832); ctx.fill(); // knee
  }
  function draw(ctx, W, H, o) {
    o = o || {};
    var fx = o.fireX !== undefined ? o.fireX : W * 0.5;
    var fy = o.fireY !== undefined ? o.fireY : H * 0.72;
    var fs = o.fireScale || 1;
    // base night sky
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0B0908'); bg.addColorStop(0.6, '#120E0C'); bg.addColorStop(1, '#080605');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // stars
    ctx.fillStyle = '#5A5048';
    for (var i = 0; i < (o.stars || 60); i++) {
      var sx = rand(i) * W, sy = rand(i * 3.7) * H * 0.62;
      ctx.globalAlpha = 0.2 + rand(i * 1.3) * 0.5;
      ctx.beginPath(); ctx.arc(sx, sy, rand(i * 2.1) * 1.4 + 0.3, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // firelight glow
    var g = ctx.createRadialGradient(fx, fy - 30 * fs, 20, fx, fy - 30 * fs, 520 * fs);
    g.addColorStop(0, 'rgba(180,70,30,0.55)'); g.addColorStop(0.4, 'rgba(110,44,20,0.28)');
    g.addColorStop(1, 'rgba(20,16,14,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // eyes in the dark (optional)
    if (o.eyes) for (var e = 0; e < o.eyes.length; e++) {
      var ex = o.eyes[e][0], ey = o.eyes[e][1], es = o.eyes[e][2] || 1;
      ctx.fillStyle = '#D9A441';
      ctx.beginPath(); ctx.ellipse(ex - 9 * es, ey, 5.5 * es, 3.4 * es, 0, 0, 6.2832); ctx.fill();
      ctx.beginPath(); ctx.ellipse(ex + 9 * es, ey, 5.5 * es, 3.4 * es, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = '#1a1208';
      ctx.beginPath(); ctx.arc(ex - 9 * es, ey, 1.5 * es, 0, 6.2832); ctx.fill();
      ctx.beginPath(); ctx.arc(ex + 9 * es, ey, 1.5 * es, 0, 6.2832); ctx.fill();
    }
    // figures
    if (o.figures) for (var f = 0; f < o.figures.length; f++) {
      var ff = o.figures[f];
      figure(ctx, ff[0], ff[1], ff[2] || 1, ff[3] || '#0A0706');
    }
    if (o.fire !== false) flame(ctx, fx, fy, fs);
    // vignette to push the eye to centre and darken text zones
    var v = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.9);
    v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,0.55)');
    ctx.fillStyle=v; ctx.fillRect(0,0,W,H);
  }
  return { draw: draw };
})();
