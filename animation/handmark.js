/* Shared hand-mark geometry — the Muna Island stencil, fingertips tapered to claws.
   Local 200 x 300 space. Two render modes: solid (logo) and sprayed (banner). */
window.HandMark = (function () {
  function fingerPath(p, bx, by, deg, len, w) {
    var a = deg * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx;
    function P(t, o) { return [bx + dx * len * t + px * w * o, by + dy * len * t + py * w * o]; }
    var bL = P(0, 1), bR = P(0, -1), mL = P(0.62, 0.86), mR = P(0.62, -0.86), tip = P(1, 0);
    p.moveTo(bL[0], bL[1]);
    p.quadraticCurveTo(mL[0], mL[1], tip[0], tip[1]);
    p.quadraticCurveTo(mR[0], mR[1], bR[0], bR[1]);
    p.closePath();
  }
  function build() {
    var p = new Path2D();
    p.moveTo(150, 178);
    p.ellipse(100, 180, 54, 60, 0, 0, Math.PI * 2);
    fingerPath(p, 72, 132, -101, 92, 13);
    fingerPath(p, 99, 124, -93, 102, 13.5);
    fingerPath(p, 126, 130, -85, 94, 13);
    fingerPath(p, 150, 146, -71, 74, 11);
    fingerPath(p, 150, 200, -22, 78, 15);
    p.moveTo(66, 214); p.lineTo(134, 214); p.lineTo(140, 300); p.lineTo(60, 300); p.closePath();
    return p;
  }
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * v); }

  // solid hand: flat fill, optional faint spray halo. cx,cy = centre; scale relative to 300-tall hand.
  function solid(ctx, cx, cy, scale, color, halo) {
    var hw = 200 * scale, hh = 300 * scale, ox = cx - hw / 2, oy = cy - hh / 2;
    if (halo) {
      // build mask to keep spray off the hand
      var mc = document.createElement('canvas');
      var W = ctx.canvas.width, H = ctx.canvas.height;
      mc.width = W; mc.height = H;
      var mx = mc.getContext('2d');
      mx.save(); mx.translate(ox, oy); mx.scale(scale, scale); mx.fillStyle = '#fff'; mx.fill(build()); mx.restore();
      var m = mx.getImageData(0, 0, W, H).data;
      var sx = hw * 0.66, sy = hh * 0.52, n = Math.round(hw * hh * 0.9);
      ctx.fillStyle = color;
      for (var i = 0; i < n; i++) {
        var x = cx + gauss() * sx, y = cy + gauss() * sy;
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        if (m[((y | 0) * W + (x | 0)) * 4 + 3] > 40) continue;
        ctx.globalAlpha = 0.05 + Math.random() * 0.28;
        var r = 0.5 + Math.random() * Math.random() * 2.0 * scale;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    ctx.save(); ctx.translate(ox, oy); ctx.scale(scale, scale);
    ctx.fillStyle = color; ctx.fill(build());
    ctx.restore();
  }

  // sprayed stencil: pigment around a masked hand (negative-space hand). density = dots/px.
  function sprayed(ctx, cx, cy, scale, color, density, alphaMax) {
    var W = ctx.canvas.width, H = ctx.canvas.height;
    var hw = 200 * scale, hh = 300 * scale, ox = cx - hw / 2, oy = cy - hh / 2;
    var mc = document.createElement('canvas'); mc.width = W; mc.height = H;
    var mx = mc.getContext('2d');
    mx.save(); mx.translate(ox, oy); mx.scale(scale, scale); mx.fillStyle = '#fff'; mx.fill(build()); mx.restore();
    var m = mx.getImageData(0, 0, W, H).data;
    var sx = hw * 0.62, sy = hh * 0.5, n = Math.round(hw * hh * (density || 1.4));
    ctx.fillStyle = color;
    for (var i = 0; i < n; i++) {
      var x = cx + gauss() * sx, y = cy + gauss() * sy;
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      if (m[((y | 0) * W + (x | 0)) * 4 + 3] > 40) continue;
      ctx.globalAlpha = (0.05 + Math.random() * (alphaMax || 0.34));
      var r = 0.4 + Math.random() * Math.random() * 2.0 * Math.max(1, scale);
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  return { solid: solid, sprayed: sprayed };
})();
