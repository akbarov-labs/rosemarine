/* Rosemarine page-local behaviour. The engine is untouched; everything here
   reads the --sc-p it publishes on each act.

   1. the thread: every path.thread[data-draw] draws across a window of its
      act's progress ("a b"), or over time on arrival ("intro")
   2. the order slip: products the visitor adds, kept per browser, sent to
      @rmehrchi as a Telegram message or copied
   3. the finder, the thumb index, and keyboard focus inside pinned acts */
(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var catalog = JSON.parse(document.getElementById('catalog').textContent);
  var T = catalog.t;

  var sc = window.ScrollCraft.mount(document.body);

  // ------------------------------------------------------------ thread --
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var draws = [];
  Array.prototype.forEach.call(document.querySelectorAll('[data-draw]'), function (el) {
    var spec = el.getAttribute('data-draw');
    var act = el.closest('[data-sc-act]');
    var rec = { el: el, act: act, intro: spec === 'intro' || spec === 'inview', start: spec === 'inview' ? Infinity : null, a: 0, b: 1, last: -1,
      clip: el.tagName.toLowerCase() === 'svg', dir: el.getAttribute('data-dir') || 'h',
      // data-life: measure across the act's whole on-screen life (entry slide
      // included), so drawing starts while the sheet is still sliding in
      life: el.hasAttribute('data-life') };
    if (spec === 'inview' && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { rec.start = performance.now(); io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(el.closest('svg') || el);
    } else if (spec === 'inview') rec.start = 0;
    if (!rec.intro) {
      var n = spec.split(/\s+/).map(parseFloat);
      rec.a = n[0]; rec.b = n[1];
    }
    draws.push(rec);
  });
  var fades = Array.prototype.map.call(document.querySelectorAll('[data-fade]'), function (el) {
    var n = el.getAttribute('data-fade').split(/\s+/).map(parseFloat);
    return { el: el, act: el.closest('[data-sc-act]'), a: n[0], b: n[1], last: -1 };
  });
  var progressOf = function (act) {
    if (!act) return 1;
    var v = parseFloat(act.style.getPropertyValue('--sc-p'));
    return isNaN(v) ? 0 : v;
  };
  var t0 = performance.now() + 250;
  var INTRO_MS = 2400;

  function frame(now) {
    for (var i = 0; i < draws.length; i++) {
      var d = draws[i], t;
      if (reduce) t = 1;
      else if (d.intro) t = easeOut(clamp((now - (d.start === null ? t0 : d.start)) / INTRO_MS));
      else if (d.life) {
        var r = d.act.getBoundingClientRect();
        t = clamp(((innerHeight - r.top) / (r.height + innerHeight) - d.a) / (d.b - d.a));
      }
      else t = clamp((progressOf(d.act) - d.a) / (d.b - d.a));
      t = Math.round(t * 1000) / 1000;
      if (t !== d.last) {
        if (d.clip) {
          var cut = ((1 - t) * 100).toFixed(1) + '%';
          d.el.style.clipPath = d.dir === 'v' ? 'inset(0 0 ' + cut + ' 0)' : 'inset(-50% ' + cut + ' -50% 0)';
        } else d.el.style.strokeDashoffset = String(1 - t);
        d.last = t;
      }
    }
    for (var j = 0; j < fades.length; j++) {
      var f = fades[j];
      var k = reduce ? 1 : clamp((progressOf(f.act) - f.a) / (f.b - f.a));
      var o = Math.round((1 - 0.8 * k) * 100) / 100;
      if (o !== f.last) { f.el.style.opacity = String(o); f.last = o; }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // -------------------------------------------------------- order slip --
  var KEY = 'rosemarine-slip';
  var slip = {};
  try { slip = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { slip = {}; }
  Object.keys(slip).forEach(function (id) { if (!catalog.products[id] || !(slip[id] > 0)) delete slip[id]; });
  var MAX = 20;
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(slip)); } catch (e) {} };

  var list = document.querySelector('[data-slip-list]');
  var empty = document.querySelector('[data-slip-empty]');
  var totalRow = document.querySelector('[data-slip-total]');
  var totalEl = document.querySelector('[data-total]');
  var send = document.querySelector('[data-send]');
  var copyBtn = document.querySelector('[data-copy]');
  var count = document.querySelector('[data-count]');
  var fmt = function (n) {
    var suffix = catalog.currency;
    var num = catalog.lang === 'en' ? n.toLocaleString('en-US') : n.toLocaleString('ru-RU').replace(/ /g, ' ');
    return num + suffix;
  };

  function message() {
    var lines = [T.msgHi];
    var total = 0;
    Object.keys(slip).forEach(function (id) {
      var p = catalog.products[id];
      total += p.price * slip[id];
      lines.push('• ' + p.name + ' × ' + slip[id] + ' · ' + fmt(p.price * slip[id]));
    });
    lines.push(T.msgTotal + ': ' + fmt(total));
    return { text: lines.join('\n'), total: total };
  }

  function render() {
    var ids = Object.keys(slip);
    list.textContent = '';
    ids.forEach(function (id) {
      var p = catalog.products[id];
      var li = document.createElement('li');
      li.innerHTML =
        '<span class="nm"></span>' +
        '<span class="qty"><button type="button" data-q="-1"></button><output></output><button type="button" data-q="1">+</button></span>' +
        '<span class="pr"></span>';
      li.querySelector('.nm').textContent = p.name;
      li.querySelector('output').textContent = slip[id];
      li.querySelector('.pr').textContent = fmt(p.price * slip[id]);
      var minus = li.querySelector('[data-q="-1"]');
      minus.textContent = slip[id] > 1 ? '−' : '×';
      minus.setAttribute('aria-label', p.name + ': ' + (slip[id] > 1 ? T.less : T.remove));
      var plus = li.querySelector('[data-q="1"]');
      plus.setAttribute('aria-label', p.name + ': ' + T.more);
      if (slip[id] >= MAX) { plus.disabled = true; plus.title = T.maxed; }
      li.setAttribute('data-id', id);
      list.appendChild(li);
    });
    var m = message();
    var has = ids.length > 0;
    empty.hidden = has;
    totalRow.hidden = !has;
    totalEl.textContent = fmt(m.total);
    send.href = has ? 'https://t.me/rmehrchi?text=' + encodeURIComponent(m.text) : 'https://t.me/rmehrchi';
    copyBtn.hidden = !has;
    Array.prototype.forEach.call(document.querySelectorAll('[data-when]'), function (el) {
      el.hidden = (el.getAttribute('data-when') === 'full') !== has;
    });
    var n = ids.reduce(function (s, id) { return s + slip[id]; }, 0);
    count.hidden = n === 0;
    count.textContent = n;
    Array.prototype.forEach.call(document.querySelectorAll('[data-add]'), function (b) {
      b.setAttribute('aria-pressed', slip[b.getAttribute('data-add')] ? 'true' : 'false');
    });
  }

  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) {
      var id = add.getAttribute('data-add');
      if (slip[id]) delete slip[id]; else slip[id] = 1;
      save(); render();
      return;
    }
    var q = e.target.closest('[data-q]');
    if (q) {
      var li = q.closest('li');
      var pid = li.getAttribute('data-id');
      slip[pid] = Math.min(MAX, (slip[pid] || 0) + parseInt(q.getAttribute('data-q'), 10));
      if (slip[pid] <= 0) delete slip[pid];
      save(); render();
      var again = list.querySelector('[data-id="' + pid + '"] [data-q="' + q.getAttribute('data-q') + '"]');
      (again && !again.disabled ? again : list.querySelector('[data-id="' + pid + '"] [data-q="-1"]') || send).focus();
    }
  });

  copyBtn.addEventListener('click', function () {
    if (!Object.keys(slip).length) return;
    var text = message().text;
    var done = function () {
      copyBtn.textContent = T.copied;
      setTimeout(function () { copyBtn.textContent = T.copy; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text); done(); });
    } else { legacyCopy(text); done(); }
  });
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
  }
  render();

  // ------------------------------------------------------------ finder --
  var chips = document.querySelectorAll('[data-concern]');
  Array.prototype.forEach.call(chips, function (c) {
    c.addEventListener('click', function () {
      var id = c.getAttribute('data-concern');
      Array.prototype.forEach.call(chips, function (o) { o.setAttribute('aria-pressed', o === c ? 'true' : 'false'); });
      Array.prototype.forEach.call(document.querySelectorAll('[data-answer]'), function (a) {
        a.hidden = a.getAttribute('data-answer') !== id;
      });
    });
  });

  var all = document.getElementById('barchasi');
  Array.prototype.forEach.call(document.querySelectorAll('[data-open-all]'), function (a) {
    a.addEventListener('click', function () { if (all) all.open = true; });
  });
  if (location.hash === '#barchasi' && all) all.open = true;

  // ------------------------------------------------------------- index --
  var tabs = {};
  Array.prototype.forEach.call(document.querySelectorAll('[data-tab]'), function (a) { tabs[a.getAttribute('data-tab')] = a; });
  var current = null;
  var setCurrent = function (id) {
    if (id === current || !tabs[id]) return;
    if (current && tabs[current]) tabs[current].removeAttribute('aria-current');
    tabs[id].setAttribute('aria-current', 'true');
    current = id;
  };
  var sections = Object.keys(tabs).map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var spy = function () {
    var mid = innerHeight * 0.5, best = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= mid) best = sections[i];
    }
    setCurrent(best.id);
  };
  addEventListener('scroll', spy, { passive: true });
  spy();

  var index = document.getElementById('index');
  var opener = document.querySelector('.chrome__index');
  var closer = index.querySelector('.index__close');
  var openIndex = function (open) {
    index.classList.toggle('is-open', open);
    opener.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) (tabs[current] || index.querySelector('a')).focus();
    else opener.focus();
  };
  opener.addEventListener('click', function () { openIndex(!index.classList.contains('is-open')); });
  document.querySelector('.chrome').addEventListener('click', function (e) {
    if (index.classList.contains('is-open') && !e.target.closest('.chrome__index')) {
      index.classList.remove('is-open');
      opener.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
    }
  });
  closer.addEventListener('click', function () { openIndex(false); });
  index.addEventListener('click', function (e) {
    if (e.target.closest('a') && index.classList.contains('is-open')) {
      index.classList.remove('is-open');
      opener.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
    }
  });
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && index.classList.contains('is-open')) openIndex(false);
  });

  // ---------------------------------------------- focus in pinned acts --
  // A pinned stage holds one viewport position for its whole act, so the
  // engine's "scroll the control to centre" cannot open a cue there. Park the
  // act at the progress where the focused control is actually visible.
  document.addEventListener('focusin', function (e) {
    var el = e.target;
    var act = el.closest && el.closest('.sc-act--pinned');
    if (!act) {
      // Outside pinned acts: the page scrolls smoothly, so the browser's own
      // focus scroll glides and focus sits off screen meanwhile. Jump instead.
      requestAnimationFrame(function () {
        var r = el.getBoundingClientRect();
        if (r.bottom > innerHeight - 8 || r.top < 72) el.scrollIntoView({ block: 'center', behavior: 'instant' });
      });
      return;
    }
    requestAnimationFrame(function () {
      var top = act.getBoundingClientRect().top + scrollY;
      var travel = act.offsetHeight - innerHeight;
      var p = null;
      var rail = el.closest('[data-sc-pan]');
      if (rail) {
        var item = el.closest('.leafsheet, .rail__end, .rail__lead') || el;
        var over = rail.scrollWidth - innerWidth;
        if (over > 0) p = clamp((item.offsetLeft - innerWidth * 0.2) / over);
      } else {
        var cue = el.closest('[data-sc-cue]');
        if (cue) {
          var from = parseFloat(cue.getAttribute('data-sc-cue'));
          if (from > 0.02) p = Math.min(0.98, from + 0.12);
        }
      }
      if (p === null) return;
      var y = Math.round(top + travel * p);
      if (Math.abs(scrollY - y) > 4) scrollTo({ top: y, behavior: 'instant' });
    });
  });

  window.Rosemarine = { sc: sc, slip: slip };
})();
