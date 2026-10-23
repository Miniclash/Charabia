/* Créature pixel 40x40 du studio : bouche calée sur les voyelles, expression selon l'humeur. */
(function (root) {
'use strict';
const MOUTH = { a:[4,1,3], o:[3,0,3], u:[2,1,1], i:[5,0,1.5], e:[4,0,2], y:[2,1,1.5], oe:[3,0,2.4] };
function drawCreature(cv, p, mood, an){
  const g = cv.getContext('2d'); const S = 40;
  g.clearRect(0, 0, S, S);
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const robot = mood === 'robot';
  const hue = robot ? 200 : p.hue, sat = robot ? 14 : 58;
  const body = `hsl(${hue} ${sat}% 60%)`, shade = `hsl(${hue} ${sat}% 44%)`, light = `hsl(${hue} ${sat}% 76%)`;
  const ink = '#141820', white = '#f6f3ea';
  const sz = p.size / 100, age = p.age;
  const rw = 9 + sz * 6, rh = 8 + sz * 4;
  const t = an.t || 0;
  let ox = 0, oy = 0;
  if (an.anim){
    oy = Math.sin(t * 2.4) > .3 ? -1 : 0;
    if (mood === 'effraye') ox = Math.round((Math.random() - .5) * 2.2);
    if (mood === 'ivre') ox = Math.round(Math.sin(t * 1.4) * 1.4);
    if (mood === 'furieux' && an.mouth > .2) ox = Math.round((Math.random() - .5) * 1.6);
    if (mood === 'endormi' || mood === 'atone') oy = Math.sin(t * 1.2) > .6 ? -1 : 0;
  }
  const cx = 20 + ox, cy = 35 - rh + oy;
  const inside = (x, y) => { const dx = (x + .5 - cx) / rw, dy = (y + .5 - cy) / rh; return dx * dx + dy * dy <= 1; };
  R(cx - rw + 2, 36, rw * 2 - 3, 1, 'rgba(0,0,0,.35)');
  // accessoires derrière le corps
  const feat = robot ? 1 : p.seed % 4, top = Math.round(cy - rh);
  const acc = robot ? '#c9d3d6' : shade;
  if (feat === 0){ for (const s of [-1, 1]){ const ex = Math.round(cx + s * rw * .55); R(ex - 2, top - 1, 4, 3, ink); R(ex - 1, top, 2, 2, body); } }
  else if (feat === 1){ R(cx, top - 5, 1, 5, ink); const lit = robot ? (Math.sin(t * 6) > 0 ? '#ff5a4d' : '#7a2420') : '#f6a623'; R(cx - 1, top - 7, 3, 3, ink); R(cx, top - 6, 1, 1, lit); }
  else if (feat === 2){ for (const s of [-1, 1]){ const ex = Math.round(cx + s * rw * .5); R(ex, top - 3, 1, 4, ink); R(ex + (s > 0 ? -1 : 1), top - 1, 1, 2, '#efe2c2'); } }
  else { R(cx - 2, top - 2, 1, 3, acc); R(cx, top - 3, 1, 4, acc); R(cx + 2, top - 2, 1, 3, acc); }
  // corps
  for (let y = Math.floor(cy - rh - 1); y <= cy + rh + 1; y++){
    for (let x = Math.floor(cx - rw - 1); x <= cx + rw + 1; x++){
      if (inside(x, y)){
        const dx = (x + .5 - cx) / rw, dy = (y + .5 - cy) / rh;
        let c = body;
        if (dy > .5 || (dx > .62 && dy > -.1)) c = shade;
        if (dx < -.35 && dy < -.35 && dx * dx + dy * dy < .62) c = light;
        R(x, y, 1, 1, c);
      } else if (inside(x + 1, y) || inside(x - 1, y) || inside(x, y + 1) || inside(x, y - 1)) R(x, y, 1, 1, ink);
    }
  }
  if (robot){ R(cx - rw + 3, cy + 2, rw * 2 - 6, 1, shade); }
  // yeux
  const eyY = Math.round(cy - rh * .22), eX = Math.max(3, Math.round(rw * .42));
  const big = p.formant > 1.24 || age < 13;
  const blink = an.anim && ((t + (p.seed % 7) * .37) % 3.6) < .12;
  const eye = (x, s) => {
    const y = eyY;
    switch (mood){
      case 'joyeux': R(x - 1, y + 1, 1, 1, ink); R(x, y, 1, 1, ink); R(x + 1, y + 1, 1, 1, ink); break;
      case 'atone': R(x - 1, y, 3, 1, shade); R(x - 1, y + 1, 3, 1, ink); break;
      case 'endormi': R(x - 1, y + 1, 3, 1, ink); break;
      case 'robot': R(x - 1, y - 1, 3, 2, (Math.sin(t * 3) > -.8) ? '#5ff2ff' : '#1d6a74'); break;
      case 'surexcite': R(x, y - 1, 1, 3, '#f6a623'); R(x - 1, y, 3, 1, '#f6a623'); R(x - 1, y - 2, 1, 1, white); break;
      case 'ivre': R(x - 1, y - 1, 3, 3, white); R(x + (s > 0 ? 1 : -1), y + (s > 0 ? -1 : 1), 1, 1, ink); break;
      case 'effraye': R(x - 1, y - 1, 3, 3, white); R(x, y, 1, 1, ink); break;
      case 'furieux': R(x - 1, y, 3, 2, white); R(x, y + 1, 1, 1, ink); R(x - 1, y - 2 + (s < 0 ? 0 : 1), 1, 1, ink); R(x, y - 2 + (s < 0 ? 1 : 1), 1, 1, ink); R(x + 1, y - 2 + (s < 0 ? 1 : 0), 1, 1, ink); break;
      case 'triste': R(x - 1, y, 3, 2, white); R(x, y + 1, 1, 1, ink); R(x + (s < 0 ? 1 : -1), y - 2, 1, 1, ink); R(x, y - 1, 1, 1, ink); break;
      case 'chuchote': R(x - 1, y, 3, 2, white); R(x + 1, y, 1, 2, ink); break;
      case 'enrhume': R(x - 1, y, 3, 1, shade); R(x - 1, y + 1, 3, 1, white); R(x, y + 1, 1, 1, ink); break;
      default:
        if (blink){ R(x - 1, y + 1, 3, 1, ink); break; }
        if (big){ R(x - 1, y - 1, 3, 3, ink); R(x - 1, y - 1, 1, 1, white); }
        else { R(x - 1, y, 2, 2, ink); R(x - 1, y, 1, 1, white); }
    }
  };
  eye(cx - eX, -1); eye(cx + eX, 1);
  // âge : sourcils gris + lunettes
  if (age >= 65 && mood !== 'robot'){
    R(cx - eX - 2, eyY - 3, 3, 1, '#d9d9d2'); R(cx + eX, eyY - 3, 3, 1, '#d9d9d2');
    for (const s of [-1, 1]){ const x = cx + s * eX; R(x - 2, eyY - 2, 5, 1, ink); R(x - 2, eyY + 2, 5, 1, ink); R(x - 2, eyY - 2, 1, 5, ink); R(x + 2, eyY - 2, 1, 5, ink); }
    R(cx - 1, eyY, 3, 1, ink);
  }
  // joues / nez
  const cheek = mood === 'ivre' || mood === 'furieux' ? '#e2504a' : '#f08da0';
  if (age < 14 || mood === 'joyeux' || mood === 'ivre' || mood === 'furieux' || mood === 'surexcite'){
    R(cx - eX - 2, eyY + 3, 2, 1, cheek); R(cx + eX + 1, eyY + 3, 2, 1, cheek);
  }
  if (mood === 'ivre' || mood === 'enrhume') R(cx - 1, eyY + 2, 2, 2, '#e2504a');
  // bouche
  const my = eyY + (mood === 'ivre' || mood === 'enrhume' ? 5 : 4);
  const vm = MOUTH[an.vowel] || MOUTH.oe;
  const h = an.mouth > .05 ? Math.max(1, Math.round(vm[1] + an.mouth * vm[2])) : 0;
  if (h > 0){
    const w = vm[0], x0 = Math.round(cx - w / 2);
    R(x0, my, w, h, '#3b1219');
    if (h >= 3) R(x0 + (w > 2 ? 1 : 0), my + h - 1, Math.max(1, w - 2), 1, '#e2697a');
    if (mood === 'furieux' && w > 2) R(x0, my, w, 1, white);
    if (robot) R(x0, my, w, h, '#5ff2ff');
  } else {
    switch (mood){
      case 'joyeux': case 'surexcite': R(cx - 2, my - 1, 1, 1, ink); R(cx - 1, my, 3, 1, ink); R(cx + 2, my - 1, 1, 1, ink); break;
      case 'triste': R(cx - 2, my + 1, 1, 1, ink); R(cx - 1, my, 3, 1, ink); R(cx + 2, my + 1, 1, 1, ink); break;
      case 'furieux': R(cx - 2, my, 5, 2, ink); R(cx - 1, my, 1, 1, white); R(cx + 1, my, 1, 1, white); break;
      case 'effraye': R(cx - 2, my, 1, 1, ink); R(cx - 1, my + 1, 1, 1, ink); R(cx, my, 1, 1, ink); R(cx + 1, my + 1, 1, 1, ink); break;
      case 'robot': R(cx - 2, my, 5, 1, '#5ff2ff'); break;
      case 'atone': case 'endormi': case 'chuchote': R(cx - 1, my, 2, 1, ink); break;
      default: R(cx - 1, my, 3, 1, ink);
    }
  }
  // extras
  if (mood === 'effraye'){ const sx = Math.round(cx + rw - 2), sy = Math.round(cy - rh + 3); R(sx, sy, 1, 1, '#9fd8ff'); R(sx - 1, sy + 1, 3, 2, '#9fd8ff'); }
  if (mood === 'triste'){ const ty = eyY + 2 + (an.anim ? Math.floor((t * 4) % 5) : 1); R(cx - eX, ty, 1, 1, '#7fc4ff'); }
  if (mood === 'endormi'){ const zy = an.anim ? Math.floor((t * 3) % 4) : 0; const zx = Math.round(cx + rw - 1), zt = Math.round(cy - rh - 2 - zy);
    R(zx, zt, 3, 1, white); R(zx + 1, zt + 1, 1, 1, white); R(zx, zt + 2, 3, 1, white); }
  if (mood === 'surexcite' && an.anim){ const k = Math.floor(t * 5) % 2; R(cx - rw - 1 + k, cy - rh - 1, 1, 1, '#f6a623'); R(cx + rw - k, cy - rh + 2, 1, 1, '#f6a623'); }
}

root.drawCreature = drawCreature;
})(window);
