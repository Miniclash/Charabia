/* Studio Charabia : interface au-dessus du moteur (src/charabia.js). */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
};
const { MOODS, MOOD_KEYS, DEFAULT, KEYS, applyMacros, sanitize, moodMix } = Charabia;
const encodeVoice = Charabia.encode, decodeVoice = Charabia.decode, jsonVoice = Charabia.toJSON;

/* ============ Contenu du studio ============ */
// Contenu éditable : data/repliques.js et data/personnages.js
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const asList = (l, fb) => Array.isArray(l) && l.filter(x => typeof x === 'string' && x.trim()).length ? l.filter(x => typeof x === 'string' && x.trim()) : fb;
const RAW_LINES = window.CHARABIA_REPLIQUES || {};
const SAMPLES = { fr:asList(RAW_LINES.fr, ['Bonjour !']), en:asList(RAW_LINES.en, ['Hello!']) };
const PRESETS = (Array.isArray(window.CHARABIA_PERSONNAGES) ? window.CHARABIA_PERSONNAGES : []).map(c => {
  let p = null;
  if (c.code){ try { p = decodeVoice(c.code); } catch(e){ console.warn('Charabia : code de voix illisible pour', c.nom); } }
  if (!p){
    const v = c.voix || {};
    p = Object.assign({}, DEFAULT, { age:v.age ?? DEFAULT.age, gender:v.gender ?? DEFAULT.gender, size:v.size ?? DEFAULT.size });
    applyMacros(p); Object.assign(p, v); p = sanitize(p);
  }
  if (c.nom) p.name = String(c.nom).slice(0, 24);
  return { role:c.role || '', fr:c.fr || c.en || SAMPLES.fr[0], en:c.en || c.fr || SAMPLES.en[0], p };
});
if (!PRESETS.length) PRESETS.push({ role:'', fr:SAMPLES.fr[0], en:SAMPLES.en[0], p:sanitize(DEFAULT) });

/* ============ État ============ */
let P = Object.assign({}, DEFAULT);
let presetIdx = 0;

/* ============ Lecture ============ */
let current = null;
function stopCurrent(){ Charabia.stop(); if (current) current.stopped = true; }
function play(text, opts = {}){
  if (!text.trim()) return;
  if (current && current.reveal && !current.done){ revealTo(charEls.length); nextEl.hidden = false; current.done = true; }
  stopCurrent();
  const h = Charabia.speak(text, P);
  if (!h) return;
  const reveal = opts.reveal !== false;
  current = { tl:h.timeline, start:h.start, text, reveal, ptr:0, revealed:0, done:false, stopped:false };
  if (reveal){ renderDialogue(text, false); nextEl.hidden = true; }
}

/* ============ Bulle de dialogue ============ */
const dtext = $('#dtext'), nextEl = $('#next'), dialog = $('#dialog');
let charEls = [];
function renderDialogue(text, full){
  dtext.textContent = ''; charEls = new Array(text.length).fill(null);
  const frag = document.createDocumentFragment();
  const re = /(\s+)|(\S+)/g; let m, ci = 0;
  while ((m = re.exec(text))){
    const base = m.index;
    if (m[1]){
      for (let i = 0; i < m[1].length; i++){
        const c = m[1][i];
        if (c === '\n') frag.appendChild(document.createElement('br'));
        else frag.appendChild(document.createTextNode(c));
      }
    } else {
      const w = document.createElement('span'); w.className = 'w';
      let i = 0; const str = m[2];
      while (i < str.length){
        const cp = str.codePointAt(i); const len = cp > 0xffff ? 2 : 1;
        const sp = document.createElement('span'); sp.className = full ? 'ch on' : 'ch';
        sp.textContent = str.slice(i, i + len); sp.style.setProperty('--i', ci++);
        if (full) sp.style.animation = 'none';
        for (let k = 0; k < len; k++) charEls[base + i + k] = sp;
        w.appendChild(sp); i += len;
      }
      frag.appendChild(w);
    }
  }
  dtext.appendChild(frag);
}
function revealTo(n){
  if (!current) return;
  n = Math.min(n, charEls.length);
  for (let i = current.revealed; i < n; i++){ const el = charEls[i]; if (el && !el.classList.contains('on')) el.classList.add('on'); }
  if (n > current.revealed) current.revealed = n;
}
function finish(){
  if (!current) return;
  if (current.reveal){ revealTo(charEls.length); nextEl.hidden = false; }
  current.done = true;
}
function skipOrReplay(){
  if (current && !current.done && current.reveal){ stopCurrent(); finish(); }
  else play(lineEl.value);
}
dialog.addEventListener('click', skipOrReplay);
dialog.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); skipOrReplay(); } });

/* ============ Interface : contrôles ============ */
const sizeName = v => v < 15 ? 'minuscule' : v < 38 ? 'petit' : v < 63 ? 'moyen' : v < 86 ? 'grand' : 'colossal';
const genderName = v => v < 35 ? 'féminin' : v > 65 ? 'masculin' : 'neutre';
const SLIDERS = {
  perso: [
    ['age', 'Âge', 4, 90, 1, v => v + ' ans', 'Enfant aigu et vif, âgé plus lent et chevrotant.', true],
    ['gender', 'Genre', 0, 100, 1, v => genderName(v), 'Hauteur et timbre, de féminin à masculin.', true],
    ['size', 'Carrure', 0, 100, 1, v => sizeName(v), 'De la fée minuscule au géant des montagnes.', true],
    ['hue', 'Couleur', 0, 359, 1, v => v + '°', 'Juste pour la bouille du perso.']
  ],
  humeur: [
    ['moodAmt', 'Intensité', 0, 100, 1, v => v + ' %', 'Dose de l’humeur sur la voix de base.']
  ],
  pros: [
    ['__grain'],
    ['__lang'],
    ['speed', 'Débit', 3, 28, .5, v => v + ' /s', 'Syllabes par seconde (×1,8 en mode lettre).'],
    ['pitchVar', 'Variation', 0, 8, .1, v => '± ' + (+v).toFixed(1) + ' dt', 'Écart de hauteur aléatoire entre syllabes, en demi-tons.'],
    ['inton', 'Intonation', 0, 100, 1, v => v + ' %', 'Montée des questions, élan des exclamations, retombée des phrases.'],
    ['pauses', 'Pauses', 0, 100, 1, v => v + ' %', 'Poids des virgules, points et points de suspension.'],
    ['__scale'],
    ['__caps']
  ],
  son: [
    ['__src'],
    ['pitch', 'Hauteur', 50, 700, 1, v => v + ' Hz', 'Fréquence de base de la voix.'],
    ['formant', 'Formants', .6, 1.7, .01, v => '×' + (+v).toFixed(2), 'Taille du conduit vocal : bas = grosse bête, haut = petit être.'],
    ['breath', 'Souffle', 0, 100, 1, v => v + ' %', 'Air mêlé à la voix.'],
    ['artic', 'Articulation', 0, 100, 1, v => v + ' %', 'Netteté des consonnes (p, t, s, ch…).'],
    ['gate', 'Tenue', 25, 130, 1, v => v + ' %', 'Bips secs et détachés ou syllabes liées.'],
    ['vib', 'Vibrato', 0, 100, 1, v => v + ' %', 'Ondulation de la hauteur.'],
    ['jitter', 'Chevrotement', 0, 100, 1, v => v + ' %', 'Instabilité de la voix, typique des voix âgées.'],
    ['crunch', 'Crunch', 0, 100, 1, v => v + ' %', 'Saturation et réduction de bits, façon vieille console.'],
    ['echo', 'Écho', 0, 100, 1, v => v + ' %', 'Grotte, cathédrale, donjon.'],
    ['vol', 'Volume', 0, 100, 1, v => v + ' %', '']
  ]
};
const SEGS = {
  __grain: ['grain', 'Découpage', [['lettre','Lettre'],['syllabe','Syllabe'],['mot','Mot']], 'Un son par lettre (style Animalese), par syllabe ou par mot.'],
  __lang: ['lang', 'Langue du texte', [['fr','Français'],['en','English']], 'Règles de lecture des voyelles et syllabes.'],
  __scale: ['scale', 'Gamme', [['libre','Libre'],['penta','Penta'],['majeur','Majeur'],['chroma','Chroma']], 'Cale les hauteurs sur des notes : plus chantant.'],
  __caps: ['caps', 'Options', [[1,'MAJ = cri'],[0,'MAJ ignorées']], ''],
  __src: ['src', 'Source', [['voix','Voix'],['bip','Bip'],['doux','Doux'],['chip','Chiptune'],['souffle','Souffle']], 'Voix à formants, bip carré, triangle doux, pulse 8-bit ou chuchotement.']
};
const MACRO_KEYS = ['age','gender','size'];
const sliderEls = {}, segEls = {};

function ctlHTML(def){
  if (def[0].startsWith('__')){
    const [key, label, opts, hint] = SEGS[def[0]];
    return `<div class="ctl"><span class="lab" id="lab-${key}">${label}</span><div class="seg" role="group" aria-labelledby="lab-${key}" data-seg="${key}">` +
      opts.map(o => `<button type="button" data-v="${o[0]}">${o[1]}</button>`).join('') + `</div>${hint ? `<small>${hint}</small>` : ''}</div>`;
  }
  const [key, label, min, max, step, , hint] = def;
  return `<div class="ctl"><div class="ctl-top"><label for="s-${key}">${label}</label><span class="val" id="v-${key}"></span></div>` +
    `<input type="range" id="s-${key}" min="${min}" max="${max}" step="${step}">${hint ? `<small>${hint}</small>` : ''}</div>`;
}
for (const [pane, defs] of Object.entries(SLIDERS)){
  const host = $('#ctl-' + pane);
  host.innerHTML = defs.map(ctlHTML).join('');
  defs.forEach(def => {
    if (def[0].startsWith('__')){
      const key = SEGS[def[0]][0];
      const el = host.querySelector(`[data-seg="${key}"]`); segEls[key] = el;
      el.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        let v = b.dataset.v; if (key === 'caps') v = +v;
        const prevLang = P.lang;
        P[key] = v;
        if (key === 'lang') swapLang(prevLang, v);
        changed(true);
      });
    } else {
      const [key, , , , , fmt] = def;
      const el = $('#s-' + key);
      sliderEls[key] = { el, fmt, val: $('#v-' + key) };
      el.addEventListener('input', () => {
        P[key] = +el.value;
        if (MACRO_KEYS.includes(key)) applyMacros(P);
        changed(false);
      });
      el.addEventListener('change', () => preview());
    }
  });
}

function syncControls(){
  for (const [k, o] of Object.entries(sliderEls)){
    o.el.value = P[k];
    const min = +o.el.min, max = +o.el.max;
    o.el.style.setProperty('--pct', ((P[k] - min) / (max - min) * 100) + '%');
    o.val.textContent = o.fmt(P[k]);
  }
  for (const [k, el] of Object.entries(segEls)){
    el.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v) === String(P[k])));
  }
  if (document.activeElement !== $('#name')) $('#name').value = P.name;
  if (document.activeElement !== $('#seed')) $('#seed').value = P.seed;
}

/* Humeurs */
const moodsHost = $('#moods');
moodsHost.innerHTML = MOOD_KEYS.map(k => `<button type="button" class="mood" data-m="${k}"><canvas width="40" height="40"></canvas>${MOODS[k].n}</button>`).join('');
moodsHost.addEventListener('click', e => {
  const b = e.target.closest('.mood'); if (!b) return;
  P.mood = b.dataset.m; changed(true);
});
function syncMoods(){
  moodsHost.querySelectorAll('.mood').forEach(b => {
    const k = b.dataset.m;
    b.setAttribute('aria-pressed', k === P.mood);
    drawCreature(b.querySelector('canvas'), P, k, { t:0, mouth:0, anim:false });
  });
  $('#moodDesc').textContent = MOODS[P.mood].d;
}

/* Onglets */
const tabs = [...document.querySelectorAll('.tab')];
function selectTab(tab){
  tabs.forEach(t => { const on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; $('#' + t.getAttribute('aria-controls')).hidden = !on; });
  store.set('ms-tab', tab.id);
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft'){ const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; selectTab(n); n.focus(); }
  });
});

/* ============ Code de voix ============ */
const codeMsg = $('#codeMsg');
function say(msg, err){ codeMsg.textContent = msg; codeMsg.classList.toggle('err', !!err); }
function copyText(text, fallbackEl, okMsg){
  const fallback = () => { if (fallbackEl){ fallbackEl.focus(); fallbackEl.select && fallbackEl.select(); } say('Code sélectionné : faites Ctrl + C pour le copier.'); };
  try { navigator.clipboard.writeText(text).then(() => say(okMsg), fallback); } catch(e){ fallback(); }
}
$('#copyCode').addEventListener('click', () => copyText(P._code, $('#codeOut'), 'Code copié.'));
$('#copyJson').addEventListener('click', () => copyText(jsonVoice(P), null, 'JSON copié.'));
$('#loadCode').addEventListener('click', loadFromInput);
$('#codeIn').addEventListener('keydown', e => { if (e.key === 'Enter') loadFromInput(); });
function loadFromInput(){
  const v = $('#codeIn').value; if (!v.trim()){ say('Collez d’abord un code dans le champ.', true); return; }
  try { P = decodeVoice(v); presetIdx = -1; changed(true, true); say('Voix chargée : ' + P.name + '.'); $('#codeIn').value = ''; flipPortrait(); play(lineEl.value); }
  catch(e){ say('Ce code n’est pas lisible. Vérifiez qu’il commence par MUMBLE1. et qu’il est complet.', true); }
}

/* ============ Deck ============ */
const deck = $('#deck');
function presetVoice(i){ return Object.assign({}, PRESETS[i].p); }
deck.innerHTML = PRESETS.map((pr, i) => `<button type="button" class="card" data-i="${i}" aria-label="${esc(pr.p.name)}, ${esc(pr.role)}">
  <span class="role">${esc(pr.role)}</span><span class="art" style="background:hsl(${pr.p.hue} 30% 22%)"><canvas width="40" height="40"></canvas></span>
  <span class="nm">${esc(pr.p.name)}</span><span class="tag">${MOODS[pr.p.mood].n}</span></button>`).join('');
deck.querySelectorAll('.card').forEach(c => {
  const i = +c.dataset.i;
  drawCreature(c.querySelector('canvas'), presetVoice(i), PRESETS[i].p.mood, { t:0, mouth:0, anim:false });
  c.addEventListener('click', () => loadPreset(i, true));
  if (!reduceMotion){
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.setProperty('--ry', (x * 16) + 'deg'); c.style.setProperty('--rx', (-y * 16) + 'deg'); });
    c.addEventListener('pointerleave', () => { c.style.setProperty('--ry', '0deg'); c.style.setProperty('--rx', '0deg'); });
  }
});
function loadPreset(i, speak){
  const lang = P.lang;
  P = presetVoice(i); P.lang = lang; presetIdx = i;
  lineEl.value = PRESETS[i][lang];
  changed(true, true);
  if (speak){ flipPortrait(); play(lineEl.value); }
}
function syncDeck(){ deck.querySelectorAll('.card').forEach(c => c.setAttribute('aria-pressed', +c.dataset.i === presetIdx)); }

/* ============ Tirage ============ */
const NAME_SYL = ['bo','ri','ka','lu','mo','zé','ta','pi','gor','fen','dra','mi','sha','ul','nok','bri','ze','pa','tou','vik','lo','nim','qua','ré'];
function randName(){ const r = Math.random; let n = ''; const k = r() < .55 ? 2 : 3; for (let i = 0; i < k; i++) n += NAME_SYL[(r() * NAME_SYL.length) | 0]; return n[0].toUpperCase() + n.slice(1); }
const pick = a => a[(Math.random() * a.length) | 0];
function drawCharacter(){
  const r = Math.random, lang = P.lang;
  const p = Object.assign({}, DEFAULT, {
    name:randName(), seed:(r() * 9999) | 0, hue:(r() * 360) | 0,
    age: pick([7,9,15,22,28,34,41,50,63,72,85]), gender:(r() * 100) | 0, size:(r() * 100) | 0, lang
  });
  applyMacros(p);
  Object.assign(p, {
    mood: r() < .3 ? 'normal' : pick(MOOD_KEYS), moodAmt: 45 + ((r() * 55) | 0),
    src: pick(['voix','voix','voix','bip','doux','chip']), grain: pick(['syllabe','syllabe','lettre','mot']),
    scale: pick(['libre','libre','penta','majeur']), pitchVar: Math.round((1 + r() * 4) * 10) / 10,
    inton: 30 + ((r() * 50) | 0), gate: 50 + ((r() * 50) | 0), artic: 30 + ((r() * 50) | 0),
    crunch: r() < .2 ? (r() * 40) | 0 : 0, echo: r() < .2 ? (r() * 50) | 0 : 0
  });
  if (p.mood === 'robot') p.src = 'chip';
  P = sanitize(p); presetIdx = -1;
  lineEl.value = pick(SAMPLES[lang]);
  changed(true, true); flipPortrait(); play(lineEl.value);
}

/* ============ Réplique ============ */
const lineEl = $('#line');
function swapLang(from, to){
  const v = lineEl.value;
  let i = SAMPLES[from].indexOf(v);
  if (i >= 0){ lineEl.value = SAMPLES[to][i]; renderDialogue(lineEl.value, true); return; }
  i = PRESETS.findIndex(pr => pr[from] === v);
  if (i >= 0){ lineEl.value = PRESETS[i][to]; renderDialogue(lineEl.value, true); }
}
$('#another').addEventListener('click', () => {
  const list = SAMPLES[P.lang]; let v; do { v = pick(list); } while (v === lineEl.value && list.length > 1);
  lineEl.value = v; play(v);
});
$('#play').addEventListener('click', () => play(lineEl.value));
$('#stop').addEventListener('click', () => { stopCurrent(); finish(); });
$('#draw').addEventListener('click', drawCharacter);
lineEl.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)){ e.preventDefault(); play(lineEl.value); } });
lineEl.addEventListener('input', () => store.set('ms-line', lineEl.value));
document.addEventListener('keydown', e => { if (e.key === 'Escape'){ stopCurrent(); finish(); } });
$('#name').addEventListener('input', e => { P.name = e.target.value.slice(0, 24); changed(false); });
$('#seed').addEventListener('change', e => { P.seed = clamp(+e.target.value | 0, 0, 9999); changed(true); });
$('#reseed').addEventListener('click', () => { P.seed = (Math.random() * 9999) | 0; changed(true); });

const autoPrev = $('#autoPrev');
let prevTimer = 0;
function preview(){
  if (!autoPrev.checked) return;
  clearTimeout(prevTimer);
  prevTimer = setTimeout(() => {
    play(lineEl.value.trim() ? lineEl.value : 'Bla bla bla !');
  }, 220);
}

/* ============ Synchro globale ============ */
const portrait = $('#portrait');
function flipPortrait(){ if (reduceMotion) return; portrait.classList.remove('flip'); void portrait.offsetWidth; portrait.classList.add('flip'); }
function changed(doPreview, fullSync){
  syncControls();
  const M = moodMix(P);
  $('#statHz').textContent = Math.round(P.pitch * Math.pow(2, M.semi / 12));
  $('#statRate').textContent = (Math.round(P.speed * M.speed * 2) / 2).toString().replace('.', ',');
  $('#moodPill').textContent = P.mood === 'normal' ? 'Normal' : MOODS[P.mood].n + ' ' + P.moodAmt + ' %';
  $('#nametag').textContent = P.name || '???';
  portrait.style.setProperty('--pbg', `hsl(${P.hue} 28% 20%)`);
  const fx = { ivre:'fx-wave', joyeux:'fx-bounce', surexcite:'fx-bounce', effraye:'fx-shake', furieux:'fx-shake fx-angry', atone:'fx-dim', endormi:'fx-dim', chuchote:'fx-dim', robot:'fx-robot', triste:'fx-dim' }[P.mood] || '';
  dialog.className = 'dialog ' + (P.moodAmt > 10 ? fx : '');
  syncMoods(); syncDeck();
  P._code = encodeVoice(P);
  $('#codeOut').value = P._code;
  $('#jsonOut').textContent = jsonVoice(P);
  const save = Object.assign({}, P); delete save._code; store.set('ms-voice', save);
  if (doPreview) preview();
}

/* ============ Fond, oscilloscope, boucle ============ */
const bg = $('#bg'), bgx = bg.getContext('2d'), BW = bg.width, BH = bg.height, img = bgx.createImageData(BW, BH);
const PAL = [[10,34,31],[15,47,43],[22,64,58],[29,79,67],[38,95,80]];
function drawBg(t){
  const d = img.data;
  for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++){
    const u = x / BW - .5, v = (y / BH - .5) * BH / BW;
    const r = Math.sqrt(u * u + v * v), a = Math.atan2(v, u);
    let val = Math.sin(a * 3 + r * 14 - t * .5 + Math.sin(r * 7 - t * .8) * 1.6) * .5 + .5;
    val = val * .75 + (1 - r * 1.4) * .35;
    const k = clamp(Math.floor(val * PAL.length), 0, PAL.length - 1), c = PAL[k], o = (y * BW + x) * 4;
    d[o] = c[0]; d[o+1] = c[1]; d[o+2] = c[2]; d[o+3] = 255;
  }
  bgx.putImageData(img, 0, 0);
}
const scope = $('#scope'), sx = scope.getContext('2d'), SW = scope.width, SH = scope.height;
let scopeBuf = null;
function drawScope(){
  sx.fillStyle = '#06120f'; sx.fillRect(0, 0, SW, SH);
  sx.fillStyle = 'rgba(138,242,162,.12)';
  for (let x = 0; x < SW; x += 20) sx.fillRect(x, 0, 1, SH);
  sx.fillRect(0, SH >> 1, SW, 1);
  sx.fillStyle = '#8af2a2';
  const analyser = Charabia.analyser;
  if (!analyser){ sx.fillRect(0, SH >> 1, SW, 1); return; }
  if (!scopeBuf) scopeBuf = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(scopeBuf);
  let py = SH >> 1;
  for (let x = 0; x < SW; x++){
    const v = scopeBuf[Math.floor(x / SW * scopeBuf.length)] / 128 - 1;
    const y = clamp(Math.round(SH / 2 - v * SH * .9), 0, SH - 1);
    const y0 = Math.min(py, y), y1 = Math.max(py, y);
    sx.fillRect(x, y0, 1, Math.max(1, y1 - y0)); py = y;
  }
}
const hero = $('#hero');
let lastBg = 0;
function frame(ts){
  const t = ts / 1000;
  let mouth = 0, vowel = 'oe';
  if (current && !current.stopped){
    const el = Charabia.now() - current.start;
    const evs = current.tl.events;
    while (current.ptr < evs.length && evs[current.ptr].t <= el){
      const ev = evs[current.ptr];
      if (current.reveal && !ev.nr) revealTo(ev.kind === 'gap' ? ev.e : ev.s);
      current.ptr++;
    }
    if (current.reveal && current.ptr > 0){
      for (let k = current.ptr - 1; k >= 0 && k >= current.ptr - 3; k--){
        const ev = evs[k];
        if (ev.kind === 'blip' && !ev.nr){ const x = clamp((el - ev.t) / (ev.step * .8), 0, 1); revealTo(Math.round(ev.s + (ev.e - ev.s) * x)); break; }
      }
    }
    for (let k = Math.max(0, current.ptr - 4); k < Math.min(evs.length, current.ptr + 1); k++){
      const ev = evs[k];
      if (ev.kind === 'blip' && el >= ev.t && el < ev.t + ev.dur){
        const x = (el - ev.t) / ev.dur; mouth = Math.sin(Math.min(1, x * 1.3) * Math.PI) * clamp(ev.gain, .5, 1.3); vowel = ev.vowel;
      }
    }
    if (!current.done && el > current.tl.total) finish();
  } else if (current && current.stopped && !current.done) finish();
  drawCreature(hero, P, P.mood, { t, mouth, vowel, anim:!reduceMotion });
  drawScope();
  if (!reduceMotion && !document.hidden && ts - lastBg > 70){ drawBg(t); lastBg = ts; }
  requestAnimationFrame(frame);
}

/* ============ Logo, CRT, démarrage ============ */
const logo = $('#logo');
'CHARABIA'.split('').forEach((c, i) => {
  if (c === ' '){ logo.appendChild(document.createTextNode(' ')); return; }
  const s = document.createElement('span'); s.textContent = c; s.style.setProperty('--i', i); s.setAttribute('aria-hidden', 'true');
  if (i > 3) s.className = 'sp'; logo.appendChild(s);
});
const crtT = $('#crtToggle');
const crtSaved = store.get('ms-crt'); if (crtSaved === false) crtT.checked = false;
const applyCrt = () => { document.documentElement.classList.toggle('crt-on', crtT.checked); store.set('ms-crt', crtT.checked); };
crtT.addEventListener('change', applyCrt); applyCrt();
const apSaved = store.get('ms-auto'); if (apSaved === false) autoPrev.checked = false;
autoPrev.addEventListener('change', () => store.set('ms-auto', autoPrev.checked));

const savedVoice = store.get('ms-voice'), savedLine = store.get('ms-line');
if (savedVoice && typeof savedVoice === 'object'){ P = sanitize(savedVoice); presetIdx = -1; lineEl.value = savedLine || SAMPLES[P.lang][0]; }
else { P = presetVoice(0); presetIdx = 0; lineEl.value = PRESETS[0].fr; }
const savedTab = store.get('ms-tab'); if (savedTab && document.getElementById(savedTab)) selectTab(document.getElementById(savedTab));
changed(false, true);
renderDialogue(lineEl.value, true);
nextEl.hidden = false;
drawBg(0);
requestAnimationFrame(frame);
})();
