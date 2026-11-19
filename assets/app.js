/* Sasihong Hakrawee — profile site
   Two-step playful access gate (code + image select), then the profile.
   Note: this runs in the browser, so it is a fun gate, not real security. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
  function rand(n) { return Math.floor(Math.random() * n); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rand(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* remember a passed visitor for this browser tab */
  var passed = false;
  try { passed = sessionStorage.getItem('sh-verified') === '1'; } catch (e) {}

  function openSite() {
    try { sessionStorage.setItem('sh-verified', '1'); } catch (e) {}
    $('gate').hidden = true;
    $('site').hidden = false;
    window.scrollTo(0, 0);
    initSite();
  }

  /* ================= STEP 1 · CODE ================= */
  var code = '';
  var boxes = Array.prototype.slice.call(document.querySelectorAll('#otp input'));
  var codeMsg = $('code-msg'), codeCard = $('step-code'), otp = $('otp');

  function newCode() {
    code = '';
    for (var i = 0; i < 6; i++) code += rand(10);
    var colors = ['#1C1917', '#C2410C', '#9A3412', '#44403C', '#EA580C'];
    var wrap = $('code-digits');
    wrap.innerHTML = '';
    code.split('').forEach(function (ch) {
      var s = document.createElement('span');
      s.textContent = ch;
      s.style.color = colors[rand(colors.length)];
      s.style.transform = 'rotate(' + (rand(31) - 15) + 'deg) translateY(' + (rand(13) - 6) + 'px)';
      wrap.appendChild(s);
    });
    $('code-box').setAttribute('aria-label', 'Verification code: ' + code.split('').join(' '));
  }
  function clearBoxes() { boxes.forEach(function (b) { b.value = ''; }); }
  function setMsg(el, text, ok) { el.textContent = text; el.classList.toggle('ok', !!ok); }

  boxes.forEach(function (box, i) {
    box.addEventListener('input', function () {
      var v = box.value.replace(/\D/g, '');
      if (v.length > 1) { fill(v, i); return; }
      box.value = v;
      otp.classList.remove('error'); setMsg(codeMsg, '');
      if (v && i < boxes.length - 1) boxes[i + 1].focus();
    });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !box.value && i > 0) { boxes[i - 1].focus(); boxes[i - 1].value = ''; e.preventDefault(); }
      if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
      if (e.key === 'ArrowRight' && i < boxes.length - 1) boxes[i + 1].focus();
    });
    box.addEventListener('paste', function (e) {
      var t = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      if (t) { e.preventDefault(); fill(t, i); }
    });
    box.addEventListener('focus', function () { box.select(); });
  });
  function fill(digits, from) {
    for (var k = 0; k < digits.length && from + k < boxes.length; k++) boxes[from + k].value = digits[k];
    boxes[Math.min(from + digits.length, boxes.length - 1)].focus();
  }

  $('refresh-code').addEventListener('click', function () { newCode(); clearBoxes(); setMsg(codeMsg, ''); otp.classList.remove('error'); boxes[0].focus(); });

  $('code-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = boxes.map(function (b) { return b.value; }).join('');
    if (v.length < 6) { otp.classList.add('error'); setMsg(codeMsg, 'Please fill in all 6 digits.'); shake(codeCard); return; }
    if (v === code) { goHuman(); return; }
    otp.classList.add('error');
    setMsg(codeMsg, 'The code doesn’t match. Here’s a new one — please try again.');
    newCode(); clearBoxes(); boxes[0].focus(); shake(codeCard);
  });

  /* ================= STEP 2 · IMAGE SELECT ================= */
  var S = 'stroke="#1C1917" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  var ART = {
    laptop: { name: 'a laptop', svg: '<rect x="12" y="14" width="40" height="26" rx="3" fill="#fff" ' + S + '/><rect x="17" y="19" width="30" height="16" rx="1" fill="#F97316"/><path d="M6 46h52l-4 6H10z" fill="#1C1917"/>' },
    coffee: { name: 'a coffee cup', svg: '<path d="M14 24h30v14a12 12 0 0 1-12 12h-6a12 12 0 0 1-12-12z" fill="#fff" ' + S + '/><path d="M44 28h4a6 6 0 0 1 0 12h-4" fill="none" ' + S + '/><path d="M16 31h26" stroke="#F97316" stroke-width="5"/><path d="M23 9c0 4 4 4 4 9M33 9c0 4 4 4 4 9" fill="none" stroke="#1C1917" stroke-width="2.5" stroke-linecap="round"/><path d="M10 56h40" ' + S + '/>' },
    plant: { name: 'a plant', svg: '<path d="M20 40h24l-3 16H23z" fill="#F97316" ' + S + '/><path d="M32 40V22" ' + S + '/><path d="M32 28c-10 0-14-8-14-14 8 0 14 4 14 14z" fill="#86EFAC" ' + S + '/><path d="M32 24c0-8 6-14 14-14 0 8-4 14-14 14z" fill="#86EFAC" ' + S + '/>' },
    phone: { name: 'a phone', svg: '<rect x="20" y="6" width="24" height="52" rx="5" fill="#fff" ' + S + '/><rect x="24" y="13" width="16" height="32" rx="1" fill="#F97316"/><circle cx="32" cy="51" r="2.5" fill="#1C1917"/>' },
    briefcase: { name: 'a briefcase', svg: '<rect x="8" y="20" width="48" height="32" rx="4" fill="#F97316" ' + S + '/><path d="M24 20v-5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5" fill="none" ' + S + '/><path d="M8 32h48" ' + S + '/><rect x="28" y="28" width="8" height="8" rx="1.5" fill="#fff" stroke="#1C1917" stroke-width="2.5"/>' }
  };
  var KINDS = Object.keys(ART);
  var BGS = ['#FFF7ED', '#FFEDD5', '#FEF3C7', '#F5F5F4', '#FFE4E6', '#ECFCCB', '#E0F2FE'];
  var target = null, lastTarget = null;
  var humanMsg = $('human-msg'), humanCard = $('step-human'), grid = $('grid9');

  function artSvg(kind, cls) { return '<svg class="' + cls + '" viewBox="0 0 64 64" aria-hidden="true">' + ART[kind].svg + '</svg>'; }

  function newGrid() {
    var choices = KINDS.filter(function (k) { return k !== lastTarget; });
    target = choices[rand(choices.length)];
    lastTarget = target;
    var others = KINDS.filter(function (k) { return k !== target; });
    var nTarget = 3 + rand(2); // 3 or 4 matching tiles
    var tiles = [];
    for (var i = 0; i < nTarget; i++) tiles.push(target);
    while (tiles.length < 9) tiles.push(others[rand(others.length)]);
    shuffle(tiles);

    $('task-name').textContent = ART[target].name;
    $('task-ico').innerHTML = '<svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true">' + ART[target].svg.replace(/#1C1917/g, '#fff').replace(/fill="#fff"/g, 'fill="none"') + '</svg>';
    grid.innerHTML = '';
    tiles.forEach(function (kind, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tile';
      b.dataset.kind = kind;
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', 'Image ' + (i + 1));
      b.style.background = BGS[rand(BGS.length)];
      b.innerHTML = '<span class="tick" aria-hidden="true"><svg class="ico" width="14" height="14" viewBox="0 0 24 24" style="stroke-width:3"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' + artSvg(kind, 'art');
      var art = b.querySelector('svg.art');
      art.style.rotate = (rand(21) - 10) + 'deg';
      if (Math.random() < .35) art.style.scale = '-1 1';
      b.addEventListener('click', function () {
        b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        setMsg(humanMsg, '');
      });
      grid.appendChild(b);
    });
    setMsg(humanMsg, '');
  }

  function goHuman() {
    codeCard.hidden = true;
    humanCard.hidden = false;
    $('step2bar').classList.add('on');
    $('step-text').textContent = 'Step 2 of 2';
    newGrid();
    var first = grid.querySelector('.tile'); if (first) first.focus();
  }

  $('new-grid').addEventListener('click', newGrid);
  $('verify-human').addEventListener('click', function () {
    var tiles = Array.prototype.slice.call(grid.querySelectorAll('.tile'));
    var picked = tiles.filter(function (t) { return t.getAttribute('aria-pressed') === 'true'; });
    if (!picked.length) { setMsg(humanMsg, 'Select at least one image first.'); shake(humanCard); return; }
    var ok = tiles.every(function (t) { return (t.dataset.kind === target) === (t.getAttribute('aria-pressed') === 'true'); });
    if (ok) {
      $('human-task').hidden = true;
      $('verified').hidden = false;
      setTimeout(openSite, reduceMotion ? 300 : 1200);
      return;
    }
    var missed = tiles.some(function (t) { return t.dataset.kind === target && t.getAttribute('aria-pressed') !== 'true'; });
    setMsg(humanMsg, missed ? 'You missed some ' + ART[target].name.replace(/^an? /, '') + ' images. Try this new set.' : 'Some picks don’t match. Try this new set.');
    shake(humanCard);
    var msg = humanMsg.textContent;
    newGrid();
    setMsg(humanMsg, msg);
  });

  /* ================= PROFILE SITE ================= */
  var siteReady = false;
  function initSite() {
    if (siteReady) return; siteReady = true;
    var items = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      items.forEach(function (el) { io.observe(el); });

      var links = {};
      document.querySelectorAll('.nav a.link').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === en.target.id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(links).forEach(function (id) { var s = $(id); if (s) spy.observe(s); });
    } else {
      items.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* start */
  if (passed) { $('gate').hidden = true; $('site').hidden = false; initSite(); }
  else { newCode(); boxes[0].focus(); }
})();
