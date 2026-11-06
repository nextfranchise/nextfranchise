/* ============================================================
   Next Franchise · Shared navigation layer
   - Session rail (Home + S1–S9) with progress ticks, on every page
   - Progress memory (localStorage): visited, last stage, completed
   - Deep links: page.html#stage-3  (and #stage-end)
   - Next/Previous buttons roll across sessions at the first/last stage
   - Auto cross-links: "Session 8", "Template B4", "Appendix C" in body text
   - Index: per-session status badges + "Continue where you left off"
   ============================================================ */
(function () {
  'use strict';

  var SESSIONS = [
    { n: 1, week: 'Week 1',  short: 'Meta Skills',        title: 'Why the Meta Skills Matter & All 13' },
    { n: 2, week: 'Week 1',  short: 'Dino Crew',          title: 'All 13 at Work & Dino Crew Case' },
    { n: 3, week: 'Week 2A', short: 'Financial Engine',   title: 'The Financial Goals Engine' },
    { n: 4, week: 'Week 2B', short: 'Blueprint 1–3',      title: 'The Blueprint: Parts 1 to 3' },
    { n: 5, week: 'Week 2B', short: 'Blueprint 4–6',      title: 'Parts 4 to 6 & Offer Audit' },
    { n: 6, week: 'Week 3',  short: 'Problem Loop',       title: 'The Problem-Solving Loop' },
    { n: 7, week: 'Week 3',  short: 'Hard Conversation',  title: 'The Hard Conversation' },
    { n: 8, week: 'Week 4',  short: 'Capstone',           title: 'Capstone Presentations' },
    { n: 9, week: 'Week 4',  short: 'Certification',      title: 'Scoring & Certification Gate' }
  ];

  var KEY = 'nf_progress_v1';

  /* ---------- storage helpers (never throw) ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var p = raw ? JSON.parse(raw) : {};
      p.sessions = p.sessions || {};
      return p;
    } catch (e) { return { sessions: {} }; }
  }
  function save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }

  /* ---------- which page am I on? ---------- */
  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var m = file.match(/^session(\d)\.html$/);
  var current = m ? parseInt(m[1], 10) : 0; // 0 = index
  function pageFor(n) { return n === 0 ? 'index.html' : 'session' + n + '.html'; }

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent =
    '.nf-rail{background:#161D27;border-top:1px solid #2C3747}' +
    '.nf-rail-inner{max-width:80rem;margin:0 auto;padding:5px 16px;display:flex;align-items:center;gap:4px;overflow-x:auto;scrollbar-width:none}' +
    '.nf-rail-inner::-webkit-scrollbar{display:none}' +
    '.nf-pill{flex:0 0 auto;display:flex;align-items:center;gap:6px;height:26px;padding:0 8px;border-radius:99px;font:600 11px "Inter",sans-serif;color:#94A3B8;text-decoration:none;white-space:nowrap;transition:background .15s,color .15s}' +
    '.nf-pill:hover{background:#253040;color:#fff}' +
    '.nf-pill .nf-num{font:700 10px "JetBrains Mono",monospace;width:18px;height:18px;border-radius:50%;background:#1F2733;display:inline-flex;align-items:center;justify-content:center}' +
    '.nf-pill .nf-lbl{display:none}' +
    '.nf-pill.nf-current{background:#BD9F4F;color:#fff;padding:0 10px 0 6px}' +
    '.nf-pill.nf-current .nf-lbl{display:inline}' +
    '.nf-pill.nf-current .nf-num{background:rgba(0,0,0,.2)}' +
    '.nf-pill.nf-done .nf-num{background:#1E7B4F;color:#fff}' +
    '.nf-pill.nf-started .nf-num{box-shadow:0 0 0 1.5px #BD9F4F}' +
    '.nf-sep{display:none}' +
    '.nf-meter{flex:0 0 auto;margin-left:auto;display:flex;align-items:center;gap:8px;font:600 10px "JetBrains Mono",monospace;color:#94A3B8;padding-left:8px}' +
    '.nf-bar{width:48px;height:4px;border-radius:99px;background:#2C3747;overflow:hidden}' +
    '.nf-bar>i{display:block;height:100%;background:#BD9F4F;transition:width .3s}' +
    '.nf-reset{background:none;border:0;color:#64748B;font:inherit;font-size:13px;line-height:1;cursor:pointer;padding:0}' +
    '.nf-reset:hover{color:#fff}' +
    '@media(max-width:640px){.nf-bar{display:none}}' +
    '.nf-bridge{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;background:#1F2733;color:#fff;border-radius:16px;padding:16px 20px;border:1px solid #BD9F4F;margin-top:24px}' +
    '.nf-bridge small{display:block;font:700 10px "JetBrains Mono",monospace;color:#BD9F4F;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}' +
    '.nf-bridge strong{display:block;font:800 15px "Montserrat",sans-serif}' +
    '.nf-bridge p{margin:4px 0 0;font-size:12px;color:#CBD5E1;line-height:1.5;max-width:46rem}' +
    '.nf-bridge>a{background:#BD9F4F;color:#fff;font:700 12px "Montserrat",sans-serif;padding:10px 18px;border-radius:12px;text-decoration:none;white-space:nowrap}' +
    '.nf-bridge>a:hover{background:#a68a40}' +
    '.nf-xref{color:#8A6F22;font-weight:600;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:2px}' +
    '.nf-xref:hover{color:#BD9F4F;text-decoration-style:solid}' +
    '.nf-badge{display:flex;align-items:center;gap:6px;font:700 10px "JetBrains Mono",monospace;margin-bottom:-4px}' +
    '.nf-resume{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;background:#1F2733;color:#fff;border-radius:16px;padding:14px 18px;border:1px solid #BD9F4F}' +
    '.nf-resume a{background:#BD9F4F;color:#fff;font:700 12px "Montserrat",sans-serif;padding:9px 16px;border-radius:12px;text-decoration:none}' +
    '.nf-resume a:hover{background:#a68a40}';
  document.head.appendChild(css);

  /* ---------- progress recording ---------- */
  function record() {
    if (typeof currentTopicIndex === 'undefined' || !current) return;
    var p = load();
    var s = p.sessions[current] || {};
    s.visited = true;
    s.stage = currentTopicIndex + 1;
    s.total = totalTopics;
    s.stageTitle = (typeof topicTitles !== 'undefined') ? topicTitles[currentTopicIndex] : '';
    if (currentTopicIndex === totalTopics - 1) s.done = true;
    p.sessions[current] = s;
    p.last = current;
    save(p);
    renderRail();
  }

  /* ---------- session rail ---------- */
  var rail;
  function renderRail() {
    var p = load();
    var doneCount = 0;
    SESSIONS.forEach(function (s) { if ((p.sessions[s.n] || {}).done) doneCount++; });

    var html = '<div class="nf-rail-inner" role="navigation" aria-label="Training sessions">';
    html += '<a class="nf-pill ' + (current === 0 ? 'nf-current' : '') + '" href="index.html" title="Syllabus home">' +
            '<span class="nf-num" aria-hidden="true">⌂</span><span class="nf-lbl">Home</span></a>';
    SESSIONS.forEach(function (s, i) {
      var st = p.sessions[s.n] || {};
      var cls = 'nf-pill' + (s.n === current ? ' nf-current' : '') + (st.done ? ' nf-done' : (st.visited ? ' nf-started' : ''));
      var tip = s.week + ' · ' + s.title + (st.done ? ' (completed)' : st.visited ? ' (in progress)' : '');
      html += '<a class="' + cls + '" href="' + pageFor(s.n) + '" title="' + tip + '"' + (s.n === current ? ' aria-current="page"' : '') + '>' +
              '<span class="nf-num">' + (st.done && s.n !== current ? '✓' : s.n) + '</span><span class="nf-lbl">' + s.short + '</span></a>';
    });
    html += '<div class="nf-meter"><span>' + doneCount + '/9</span><span class="nf-bar"><i style="width:' + Math.round(doneCount / 9 * 100) + '%"></i></span>' +
            '<button class="nf-reset" type="button" id="nf-reset" title="Clear saved progress" aria-label="Reset progress">↺</button></div></div>';
    rail.innerHTML = html;
    var r = document.getElementById('nf-reset');
    if (r) r.onclick = function () {
      if (confirm('Clear saved progress for all sessions on this device?')) { try { localStorage.removeItem(KEY); } catch (e) {} renderRail(); decorateIndex(); }
    };
    var cur = rail.querySelector('.nf-current');
    if (cur && cur.scrollIntoView && current) { try { rail.firstChild.scrollLeft = cur.offsetLeft - 60; } catch (e) {} }
  }

  function mountRail() {
    var header = document.querySelector('header');
    if (!header) return;
    rail = document.createElement('div');
    rail.className = 'nf-rail';
    header.appendChild(rail);
    renderRail();
  }

  /* ---------- fix header logo / home links ---------- */
  function fixLinks() {
    document.querySelectorAll('header a').forEach(function (a) {
      var h = a.getAttribute('href');
      if (h === '#' || !h) a.setAttribute('href', 'index.html');
    });
    document.querySelectorAll('header a[href="index.html"] span.hidden').forEach(function (sp) {
      if (/^Module 1$/i.test(sp.textContent.trim())) sp.textContent = 'Home';
    });
    document.querySelectorAll('footer a, main a').forEach(function (a) {
      a.querySelectorAll('span').forEach(function (sp) {
        if (/Return to Module 1 Cockpit/i.test(sp.textContent)) sp.textContent = 'Return to Syllabus Home';
      });
    });
  }

  /* ---------- cross-reference auto-links ---------- */
  function linkify() {
    var root = document.querySelector('main');
    if (!root) return;
    var re = /\b(Session (\d)(?!\d)|Template B[1-9]\b|Appendix C\b)/g;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !/Session \d|Template B[1-9]|Appendix C/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        var el = node.parentElement;
        while (el && el !== root) {
          var tag = el.tagName;
          if (tag === 'A' || tag === 'BUTTON' || tag === 'SCRIPT' || tag === 'STYLE' || el.hasAttribute('onclick') || (el.classList && (el.classList.contains('nf-bridge') || el.classList.contains('nf-resume')))) return NodeFilter.FILTER_REJECT;
          el = el.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);

    nodes.forEach(function (node) {
      var text = node.nodeValue, last = 0, frag = document.createDocumentFragment(), changed = false, mt;
      re.lastIndex = 0;
      while ((mt = re.exec(text))) {
        var label = mt[1], href = null, title = '';
        if (mt[2]) {
          var num = parseInt(mt[2], 10);
          if (num === current || num < 1 || num > 9) continue;
          href = pageFor(num); title = 'Open Session ' + num + ': ' + SESSIONS[num - 1].title;
        } else if (/^Template/.test(label)) {
          if (current === 0) continue;
          href = 'index.html#stage-6'; title = 'Open the Toolkit (Templates B1–B9)';
        } else if (/^Appendix C/.test(label)) {
          if (current === 9) continue;
          href = 'session9.html#stage-2'; title = 'Open the Appendix C rubric (Session 9)';
        }
        if (!href) continue;
        frag.appendChild(document.createTextNode(text.slice(last, mt.index)));
        var a = document.createElement('a');
        a.className = 'nf-xref'; a.href = href; a.title = title; a.textContent = label;
        frag.appendChild(a);
        last = mt.index + label.length; changed = true;
      }
      if (changed) {
        frag.appendChild(document.createTextNode(text.slice(last)));
        node.parentNode.replaceChild(frag, node);
      }
    });
  }

  /* ---------- stage-aware prev/next across pages ---------- */
  function wireButtons() {
    var next = document.getElementById('next-btn');
    var prev = document.getElementById('prev-btn');
    if (next) next.onclick = function () {
      if (currentTopicIndex < totalTopics - 1) { goToTopic(currentTopicIndex + 1); return; }
      if (current < 9) location.href = pageFor(current + 1);
      else location.href = 'index.html';
    };
    if (prev) prev.onclick = function () {
      if (currentTopicIndex > 0) { goToTopic(currentTopicIndex - 1); return; }
      if (current > 1) location.href = pageFor(current - 1) + '#stage-end';
      else if (current === 1) location.href = 'index.html#stage-end';
    };
  }
  function labelButtons() {
    var next = document.getElementById('next-btn');
    var prev = document.getElementById('prev-btn');
    var atEnd = currentTopicIndex === totalTopics - 1;
    var atStart = currentTopicIndex === 0;
    if (next) {
      var sp = next.querySelector('span');
      if (sp && !sp.dataset.orig) sp.dataset.orig = sp.textContent;
      if (atEnd) {
        next.disabled = false;
        if (sp) sp.textContent = current === 0 ? 'Start Session 1' : current < 9 ? 'Next: Session ' + (current + 1) : 'Back to Home';
      } else if (sp && sp.dataset.orig) {
        sp.textContent = sp.dataset.orig;
      }
    }
    if (prev) {
      var sp2 = prev.querySelector('span');
      if (sp2 && !sp2.dataset.orig) sp2.dataset.orig = sp2.textContent;
      if (atStart && current >= 1) {
        prev.disabled = false;
        if (sp2) sp2.textContent = current === 1 ? 'Syllabus Home' : 'Session ' + (current - 1);
      } else if (sp2 && sp2.dataset.orig) {
        sp2.textContent = sp2.dataset.orig;
      }
    }
  }

  /* ---------- deep links ---------- */
  function stageFromHash() {
    var h = location.hash.replace('#', '');
    if (h === 'stage-end') return totalTopics - 1;
    var mm = h.match(/^stage-(\d+)$/);
    if (!mm) return null;
    var i = parseInt(mm[1], 10) - 1;
    return (i >= 0 && i < totalTopics) ? i : null;
  }
  function writeHash() {
    try {
      var url = location.pathname + location.search + (currentTopicIndex > 0 ? '#stage-' + (currentTopicIndex + 1) : '');
      history.replaceState(null, '', url);
    } catch (e) {}
  }

  /* ---------- index enhancements ---------- */
  function decorateIndex() {
    if (current !== 0) return;
    var p = load();
    document.querySelectorAll('.nf-badge,.nf-resume').forEach(function (el) { el.remove(); });

    document.querySelectorAll('#topic-view-0 a[href^="session"]').forEach(function (a) {
      var mm = a.getAttribute('href').match(/session(\d)\.html/);
      if (!mm) return;
      var n = parseInt(mm[1], 10), st = p.sessions[n] || {};
      var b = document.createElement('div');
      b.className = 'nf-badge';
      if (st.done) { b.style.color = '#1E7B4F'; b.textContent = '✓ COMPLETED'; }
      else if (st.visited) { b.style.color = '#BD9F4F'; b.textContent = '● IN PROGRESS · STAGE ' + st.stage + '/' + st.total; a.href = pageFor(n) + '#stage-' + st.stage; }
      else { b.style.color = '#94A3B8'; b.textContent = '○ NOT STARTED'; }
      a.parentNode.insertBefore(b, a);
      var lbl = a.querySelector('span');
      if (lbl && st.visited && !st.done) lbl.textContent = 'Resume Session ' + n;
    });

    var last = p.last && p.sessions[p.last];
    var view = document.getElementById('topic-view-0');
    if (last && last.visited && view) {
      var n2 = p.last;
      var nextN = last.done ? Math.min(n2 + 1, 9) : n2;
      var target = last.done ? pageFor(nextN) : pageFor(n2) + '#stage-' + last.stage;
      var box = document.createElement('div');
      box.className = 'nf-resume';
      box.innerHTML = '<div><div style="font:700 10px \'JetBrains Mono\',monospace;color:#BD9F4F;letter-spacing:.08em">CONTINUE WHERE YOU LEFT OFF</div>' +
        '<div style="font:700 14px \'Montserrat\',sans-serif;margin-top:2px">' +
        (last.done ? 'Session ' + n2 + ' complete → up next: Session ' + nextN + ' · ' + SESSIONS[nextN - 1].title
                   : 'Session ' + n2 + ' · ' + SESSIONS[n2 - 1].title + (last.stageTitle ? ' — ' + last.stageTitle : '')) +
        '</div></div><a href="' + target + '">' + (last.done && n2 === 9 ? 'Review Gate' : 'Continue →') + '</a>';
      var anchor = view.querySelector('.grid');
      if (anchor) view.insertBefore(box, anchor);
    }
  }

  /* ---------- "Up next" hand-off card on the final stage ---------- */
  var BRIDGES = {
    3: 'Your approved Financial Goals workbook becomes the foundation of the Blueprint. In Session 4, every peso you write into the cards must match it.',
    4: 'Parts 1 to 3 are drafted. Session 5 completes the Blueprint with Part 4 (Shared Value), Part 5 (Advisory) and Appendices A and B, then puts the Part 6 Offer through an integrity audit.'
  };
  function addBridge() {
    if (!current || current >= 9 || typeof totalTopics === 'undefined') return;
    var view = document.getElementById('topic-view-' + (totalTopics - 1));
    if (!view || view.querySelector('.nf-bridge')) return;
    var nextN = current + 1;
    if (view.textContent.indexOf('Session ' + nextN) !== -1) return; // page already has its own hand-off
    var nx = SESSIONS[nextN - 1];
    var box = document.createElement('div');
    box.className = 'nf-bridge';
    box.innerHTML = '<div><small>Up next · ' + nx.week + '</small><strong>Session ' + nextN + ' · ' + nx.title + '</strong>' +
      (BRIDGES[current] ? '<p>' + BRIDGES[current] + '</p>' : '') + '</div>' +
      '<a href="' + pageFor(nextN) + '">Continue to Session ' + nextN + ' →</a>';
    view.appendChild(box);
  }

  /* ---------- boot ---------- */
  function boot() {
    mountRail();
    fixLinks();
    wireButtons();

    if (typeof updateView === 'function' && typeof goToTopic === 'function') {
      var orig = window.updateView;
      window.updateView = function () {
        orig.apply(this, arguments);
        labelButtons();
        writeHash();
        record();
      };
      var s = stageFromHash();
      if (s !== null && s !== currentTopicIndex) goToTopic(s); else window.updateView();
      window.addEventListener('hashchange', function () {
        var t = stageFromHash();
        if (t !== null && t !== currentTopicIndex) goToTopic(t);
      });
    }

    addBridge();
    linkify();
    decorateIndex();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
