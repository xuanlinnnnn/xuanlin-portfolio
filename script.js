/* --- Loading Screen --- */
const loader = document.getElementById('loader');
if (!sessionStorage.getItem('xl_loaded')) {
  sessionStorage.setItem('xl_loaded', '1');
  const fill = document.getElementById('loaderFill');
  const lines = document.getElementById('loaderLines');
  const steps = [
    { t: 200,  text: 'initializing portfolio...',        color: 'var(--muted)' },
    { t: 700,  text: 'loading credentials...',           color: 'var(--muted)' },
    { t: 1100, text: 'system: XUAN LIN — ALL GREEN',     color: 'var(--good)'  },
  ];
  setTimeout(() => { fill.style.width = '100%'; }, 250);
  steps.forEach(s => setTimeout(() => {
    const el = document.createElement('div');
    el.className = 'loader-line';
    el.innerHTML = `<span class="lp">></span><span style="color:${s.color}">${s.text}</span>`;
    lines.appendChild(el);
  }, s.t));
  setTimeout(() => {
    loader.classList.add('fade-out');
    setTimeout(() => { loader.style.display = 'none'; }, 500);
  }, 1700);
} else {
  loader.style.display = 'none';
}

/* --- Scroll Progress Bar --- */
const progBar = document.getElementById('prog-bar');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  progBar.style.width = pct + '%';
});

/* --- Cursor --- */
const cursorGlow = document.getElementById('cursor-glow');
const cOut = document.getElementById('cursor-outer');
const cIn  = document.getElementById('cursor-inner');
let mx = 0, my = 0, ox = 0, oy = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursorGlow.style.left = mx + 'px'; cursorGlow.style.top = my + 'px';
  if (cIn) { cIn.style.left = mx + 'px'; cIn.style.top = my + 'px'; }
});
if (cOut) {
  (function rafCursor() {
    ox += (mx - ox) * .14; oy += (my - oy) * .14;
    cOut.style.left = ox + 'px'; cOut.style.top = oy + 'px';
    requestAnimationFrame(rafCursor);
  })();
  document.querySelectorAll('a, button, .skill-card, .cert-card, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => cOut.classList.add('hov'));
    el.addEventListener('mouseleave', () => cOut.classList.remove('hov'));
  });
}

/* --- Particle Network Canvas --- */
(function initParticles() {
  const canvas = document.getElementById('net-canvas');
  const ctx = canvas.getContext('2d');
  const COUNT = 70, MAX_DIST = 120;
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function spawn() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .35,
      vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.5 + .6,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(95,201,201,.45)';
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(95,201,201,${(1 - d / MAX_DIST) * .18})`;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }

  resize(); spawn(); draw();
  window.addEventListener('resize', () => { resize(); spawn(); });
})();

/* --- Navbar --- */
const nav = document.getElementById('nav');
const navLinks = document.getElementById('navLinks');
document.getElementById('navToggle').addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20));

/* --- Scroll Reveal --- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* --- Skill Progress Bars --- */
const skillObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-progress-fill').forEach(bar => {
        bar.style.width = bar.dataset.level;
      });
      skillObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
const skillsGrid = document.querySelector('.skills-grid');
if (skillsGrid) skillObserver.observe(skillsGrid);

/* --- Terminal Typewriter --- */
const termLines = [
  { cls:'p', t:'> ' }, { cls:'c', t:'whoami\n' },
  { cls:'o', t:'xuan_lin\n\n' },
  { cls:'p', t:'> ' }, { cls:'c', t:'traits --list\n' },
  { cls:'ok', t:'[✓] ' }, { cls:'o', t:'introvert (runs quiet, thinks loud)\n' },
  { cls:'ok', t:'[✓] ' }, { cls:'o', t:'细心 — catches the detail everyone scrolled past\n' },
  { cls:'ok', t:'[✓] ' }, { cls:'o', t:'gentle by default\n' },
  { cls:'ok', t:'[✓] ' }, { cls:'o', t:'reportedly the funniest one in the group\n' },
  { cls:'ok', t:'[✓] ' }, { cls:'o', t:'small circle, full commitment\n\n' },
  { cls:'p', t:'> ' }, { cls:'c', t:'status\n' },
  { cls:'ok', t:'ready to build.' }
];
const termBody = document.getElementById('termBody');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function typeTerminal() {
  let i = 0;
  (function next() {
    if (i >= termLines.length) { termBody.insertAdjacentHTML('beforeend', '<span class="term-cursor"></span>'); return; }
    const part = termLines[i]; let j = 0;
    const span = document.createElement('span'); span.className = part.cls;
    termBody.appendChild(span);
    (function char() {
      if (j < part.t.length) { span.textContent += part.t[j++]; setTimeout(char, 16 + Math.random() * 22); }
      else { i++; setTimeout(next, 90); }
    })();
  })();
}
const termObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      if (reduceMotion) {
        termBody.innerHTML = termLines.map(l => `<span class="${l.cls}">${l.t.replace(/</g,'&lt;')}</span>`).join('') + '<span class="term-cursor"></span>';
      } else { typeTerminal(); }
      termObserver.disconnect();
    }
  });
}, { threshold: 0.4 });
termObserver.observe(termBody);

/* --- Contact Form --- */
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const note = document.getElementById('formNote');
  const btn  = this.querySelector('button[type="submit"]');
  if (!this.checkValidity()) { note.textContent = '// please fill in all fields first.'; note.style.color = '#E2685B'; return; }
  btn.disabled = true; btn.textContent = 'Sending…';
  fetch(this.action, { method:'POST', body: new FormData(this), headers:{ 'Accept':'application/json' } })
    .then(r => {
      if (r.ok) { note.textContent = "// message sent — I'll get back to you soon."; note.style.color = 'var(--good)'; this.reset(); }
      else       { note.textContent = '// something went wrong — try emailing me directly.'; note.style.color = '#E2685B'; }
    })
    .catch(() => { note.textContent = '// network error — try again.'; note.style.color = '#E2685B'; })
    .finally(() => { btn.disabled = false; btn.textContent = 'Send Message →'; });
});

/* --- Character Widget --- */
const charData = [
  { id:'hero',       img:'images/hero.jpg',        msg:'psst — scroll down, it gets better 👀' },
  { id:'about',      img:'images/avatar.jpg',       msg:'fun fact: i catch the bug everyone else scrolled past. even in prod.' },
  { id:'skills',     img:'images/gentle.jpg',       msg:'// cat skills.json → trust me, it compiles.' },
  { id:'projects',   img:'images/clumsy.jpg',       msg:'built it. broke it. rebuilt it. shipped it. repeat.' },
  { id:'experience', img:'images/professional.jpg', msg:'project lead by day. security nerd by night. both deadlines matter.' },
  { id:'certs',      img:'images/avatar.jpg',       msg:'certified. and yes i actually attended these 🏅' },
  { id:'contact',    img:'images/hero.jpg',         msg:"i don't bite. well — depends on the severity level 😌" },
];

let charBubbleVisible = true, charImgCurrent = 'images/hero.jpg', charImgAActive = true;
const charBubbleEl = document.getElementById('charBubble');
const charTextEl   = document.getElementById('charText');
const charImgA     = document.getElementById('charImgA');
const charImgB     = document.getElementById('charImgB');

function charSwitchImg(src) {
  if (src === charImgCurrent) return;
  charImgCurrent = src;
  if (charImgAActive) { charImgB.src = src; charImgB.classList.remove('char-out'); charImgA.classList.add('char-out'); }
  else                { charImgA.src = src; charImgA.classList.remove('char-out'); charImgB.classList.add('char-out'); }
  charImgAActive = !charImgAActive;
}
function charSetMsg(msg) {
  charBubbleEl.style.animation = 'none';
  void charBubbleEl.offsetWidth;
  charBubbleEl.style.animation = '';
  charTextEl.innerHTML = msg + '<span class="char-blink">_</span>';
}
const charObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const d = charData.find(s => s.id === e.target.id);
    if (d) { charSwitchImg(d.img); charSetMsg(d.msg); }
  });
}, { threshold: 0.35 });
charData.forEach(d => { const el = document.getElementById(d.id); if (el) charObserver.observe(el); });
document.getElementById('charAvatar').addEventListener('click', () => {
  charBubbleVisible = !charBubbleVisible;
  charBubbleEl.style.display = charBubbleVisible ? '' : 'none';
});
setTimeout(() => charSetMsg(charData[0].msg), 900);

/* --- Footer Year --- */
document.getElementById('year').textContent = new Date().getFullYear();

/* --- Text Scramble on section headings --- */
const SCHARS = '!<>-_\\/[]{}=+*^?#@$%0123456789ABCDEFabcdef';
function scramble(el) {
  const orig = el.textContent;
  let f = 0; const N = 26;
  const iv = setInterval(() => {
    el.textContent = orig.split('').map((c, i) => {
      if (c === ' ' || c === '.' || c === ',' || c === '&') return c;
      if (f / N >= i / orig.length) return c;
      return SCHARS[Math.floor(Math.random() * SCHARS.length)];
    }).join('');
    if (++f > N + orig.length) { el.textContent = orig; clearInterval(iv); }
  }, 32);
}
const scrambleObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => { if (e.isIntersecting) { scramble(e.target); obs.unobserve(e.target); } });
}, { threshold:0.5 });
document.querySelectorAll('.section-title').forEach(el => scrambleObs.observe(el));

/* --- 3D Card Tilt (desktop only) --- */
if (window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.skill-card, .cert-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - .5) * 18;
      const y = ((e.clientY - r.top)  / r.height - .5) * 18;
      card.style.transition = 'transform .07s linear';
      card.style.transform  = `perspective(600px) rotateY(${x}deg) rotateX(${-y}deg) translateZ(10px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .45s ease';
      card.style.transform  = '';
    });
  });
}

/* --- Click Sparks --- */
const SPARK_COLORS = ['var(--teal)','var(--amber)','#a78bfa','#6FCF8E'];
document.addEventListener('click', e => {
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('div');
    s.className = 'click-spark';
    const angle = (i / 10) * Math.PI * 2 + Math.random() * .5;
    const dist  = 25 + Math.random() * 45;
    s.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;` +
      `--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px;` +
      `--sz:${2+Math.random()*4}px;background:${SPARK_COLORS[i%SPARK_COLORS.length]};`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 600);
  }
});

/* --- Hero Stats Counter --- */
function countUp(el) {
  const target = +el.dataset.count, suffix = el.dataset.suffix || '';
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 50));
  const iv = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur + suffix;
    if (cur >= target) clearInterval(iv);
  }, 35);
}
const statsEl = document.querySelector('.hero-stats');
if (statsEl) {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      obs.unobserve(e.target);
    });
  }, { threshold:.5 }).observe(statsEl);
}

/* --- Sudo Easter Egg --- */
let typeBuf = '';
document.addEventListener('keydown', e => {
  typeBuf = (typeBuf + e.key).slice(-10);
  if (typeBuf.toLowerCase().includes('sudo')) {
    typeBuf = '';
    if (document.getElementById('sudo-popup')) return;
    const pop = document.createElement('div');
    pop.id = 'sudo-popup';
    pop.innerHTML = `
      <div class="sudo-line"><span class="sp">root@xuanlin:~#</span> sudo access granted</div>
      <div class="sudo-line sudo-ok">[✓] welcome, admin. nice try though 😏</div>
      <div class="sudo-line sudo-ok">[✓] fun fact: i actually know how sudo works</div>
      <div class="sudo-line sudo-ok">[✓] security through obscurity is not security</div>
      <div class="sudo-line sudo-ok">[✓] — xuan lin, SOC analyst 🔐</div>
      <span class="sudo-close" onclick="this.parentElement.remove()">[ esc to close ]</span>
    `;
    document.body.appendChild(pop);
    document.addEventListener('keydown', function esc(ev) {
      if (ev.key === 'Escape') { pop.remove(); document.removeEventListener('keydown', esc); }
    });
    setTimeout(() => { if (pop.parentElement) pop.remove(); }, 5000);
  }
});
