/* --- Loading Screen --- */
const isFirstVisit = !sessionStorage.getItem('xl_loaded');
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

/* --- Interactive Terminal --- */
const termBody  = document.getElementById('termBody');
const termInput = document.getElementById('termInput');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const cmdHistory = [];
let histIdx = -1;

const TERM_CMDS = {
  help: [
    { cls:'ok', t:'available commands:\n' },
    { cls:'o',  t:'  whoami          → who is xuan lin\n' },
    { cls:'o',  t:'  ls              → list directory\n' },
    { cls:'o',  t:'  ls projects     → all projects\n' },
    { cls:'o',  t:'  cat skills      → skill stack\n' },
    { cls:'o',  t:'  cat experience  → work history\n' },
    { cls:'o',  t:'  cat contact     → contact info\n' },
    { cls:'o',  t:'  nmap self       → skill port scan\n' },
    { cls:'o',  t:'  ping xuanlin    → check status\n' },
    { cls:'o',  t:'  date            → current time\n' },
    { cls:'o',  t:'  clear           → clear terminal\n\n' },
  ],
  whoami: [
    { cls:'tq', t:'xuan lin\n' },
    { cls:'o',  t:'Cybersecurity & Digital Forensics — Singapore Polytechnic\n' },
    { cls:'o',  t:'SOC analyst · digital forensics · automation · builder\n' },
    { cls:'ok', t:'[✓] open to opportunities\n\n' },
  ],
  ls: [
    { cls:'tq', t:'projects/  skills.txt  experience  contact.txt  certs/\n\n' },
  ],
  'ls projects': [
    { cls:'tq', t:'forensics-investigation/\n' },
    { cls:'tq', t:'soc-automation/\n' },
    { cls:'tq', t:'ocbc-ignite-2025/\n' },
    { cls:'tq', t:'stray-cat-platform/\n' },
    { cls:'tq', t:'llm-log-research/\n\n' },
  ],
  'cat skills': [
    { cls:'ok', t:'[SECURITY]  ' }, { cls:'o', t:'SOC monitoring · alert triage · IOC sweeping · threat hunting\n' },
    { cls:'ok', t:'[FORENSICS] ' }, { cls:'o', t:'Wireshark · Autopsy · Magnet AXIOM · RegShot · PE tools\n' },
    { cls:'ok', t:'[DEV]       ' }, { cls:'o', t:'Python · JavaScript · Node.js · SQL · HTML/CSS · Linux\n' },
    { cls:'ok', t:'[TOOLS]     ' }, { cls:'o', t:'Trend Micro Vision One · Graylog · n8n · Jira · GitHub\n\n' },
  ],
  'cat experience': [
    { cls:'p',  t:'Mar 2025–Present   ' }, { cls:'c', t:'Project Lead @ PERSOL Singapore\n' },
    { cls:'p',  t:'Apr–Dec 2023       ' }, { cls:'c', t:'IT Intern @ PERSOL EVO · Tech Refresh\n' },
    { cls:'p',  t:'Jan–Jun 2021       ' }, { cls:'c', t:'IT Intern @ NCS Pte Ltd\n' },
    { cls:'o',  t:'  → supported Singtel · MediaCorp · SATS\n\n' },
  ],
  'cat contact': [
    { cls:'o', t:'email    → lauxuanlin2@gmail.com\n' },
    { cls:'o', t:'linkedin → /in/xuanlinnnnn\n' },
    { cls:'o', t:'github   → /xuanlinnnnn\n' },
    { cls:'o', t:'phone    → +65 8787 6049\n\n' },
  ],
  'nmap self': [
    { cls:'p',  t:'Starting Nmap 7.95 on xuanlin.local...\n' },
    { cls:'ok', t:'80/tcp   open  http       ' }, { cls:'o', t:'Python · JS · Node.js\n' },
    { cls:'ok', t:'443/tcp  open  https      ' }, { cls:'o', t:'SOC · threat hunting\n' },
    { cls:'ok', t:'22/tcp   open  ssh        ' }, { cls:'o', t:'Linux · digital forensics\n' },
    { cls:'ok', t:'9000/tcp open  automation ' }, { cls:'o', t:'n8n · Graylog\n' },
    { cls:'p',  t:'4 open ports. 0 vulnerabilities. 1 opportunity.\n\n' },
  ],
  'ping xuanlin': [
    { cls:'o',  t:'PING xuanlin.local (127.0.0.1): 64 bytes\n' },
    { cls:'ok', t:'64 bytes · ttl=64 · time=0.21ms — alive\n' },
    { cls:'ok', t:'64 bytes · ttl=64 · time=0.18ms — open to work\n' },
    { cls:'ok', t:'64 bytes · ttl=64 · time=0.14ms — ready to build\n' },
    { cls:'p',  t:'3 packets tx, 3 rx, 0% packet loss\n\n' },
  ],
  date: [{ cls:'o', t:() => new Date().toLocaleString('en-SG',{timeZone:'Asia/Singapore',weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'})+' SGT\n\n' }],
};

function termAppend(lines) {
  lines.forEach(l => {
    const s = document.createElement('span');
    s.className = l.cls;
    s.textContent = typeof l.t === 'function' ? l.t() : l.t;
    termBody.appendChild(s);
  });
  termBody.scrollTop = termBody.scrollHeight;
}

function termRun(raw) {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return;
  cmdHistory.unshift(raw); histIdx = -1;

  if (cmd === 'clear') { termBody.innerHTML = ''; return; }

  const pe = document.createElement('span'); pe.className = 'p'; pe.textContent = '> ';
  const ce = document.createElement('span'); ce.className = 'c'; ce.textContent = raw + '\n';
  termBody.appendChild(pe); termBody.appendChild(ce);

  if (TERM_CMDS[cmd]) {
    termAppend(TERM_CMDS[cmd]);
  } else if (cmd.startsWith('sudo')) {
    termAppend([
      { cls:'er', t:'[sudo] nice try 😏 — proper auth required.\n' },
      { cls:'o',  t:'hint: try whoami first.\n\n' },
    ]);
  } else {
    termAppend([{ cls:'er', t:`bash: command not found: ${raw}\ntype help for available commands.\n\n` }]);
  }
  termBody.scrollTop = termBody.scrollHeight;
}

if (termBody) {
  const boot = [
    { cls:'p', t:'> ' }, { cls:'c', t:'./boot.sh\n' },
    { cls:'ok', t:'[✓] ' }, { cls:'o', t:'system: XUAN LIN — ALL GREEN\n' },
    { cls:'ok', t:'[✓] ' }, { cls:'o', t:'portfolio v2.0 loaded\n' },
    { cls:'p',  t:'> ' }, { cls:'c', t:'# type help to see available commands\n\n' },
  ];
  termAppend(boot);
}

if (termInput) {
  termInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { termRun(termInput.value); termInput.value = ''; }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); if (histIdx < cmdHistory.length-1) termInput.value = cmdHistory[++histIdx]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); histIdx > 0 ? termInput.value = cmdHistory[--histIdx] : (histIdx=-1, termInput.value=''); }
  });
  document.getElementById('termWrapper')?.addEventListener('click', () => termInput.focus());
}

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
  { id:'soc-ops',   img:'images/professional.jpg', msg:'this is basically what i stare at every day 👀' },
  { id:'projects',   img:'images/clumsy.jpg',       msg:'built it. broke it. rebuilt it. shipped it. repeat.' },
  { id:'experience', img:'images/professional.jpg', msg:'project lead by day. security nerd by night. both deadlines matter.' },
  { id:'certs',      img:'images/avatar.jpg',       msg:'certified. and yes i actually attended these 🏅' },
  { id:'tools',      img:'images/gentle.jpg',       msg:"go ahead, test your password. i won't judge (much) 🔐" },
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
  setTimeout(() => {
    statsEl.querySelectorAll('[data-count]').forEach(countUp);
  }, isFirstVisit ? 2100 : 600);
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

/* --- SOC Dashboard --- */
(function initSOC() {
  const log = document.getElementById('socLog');
  if (!log) return;

  const EVTS = [
    { type:'info', msg:'Port scan from 192.168.{A}.{B} — pattern: SYN sweep → logged' },
    { type:'ok',   msg:'IOC sweep complete — threats detected: 0' },
    { type:'warn', msg:'Failed auth attempts on admin portal ({N}x) → threshold reached' },
    { type:'info', msg:'Threat intel feed refreshed — {N} new indicators ingested' },
    { type:'ok',   msg:'SIEM ruleset updated — 847 active signatures loaded' },
    { type:'alrt', msg:'Anomalous outbound traffic on 10.0.{A}.{B} → escalated' },
    { type:'info', msg:'Log ingestion rate: {N}.{M}k events/min — nominal' },
    { type:'ok',   msg:'Malware scan completed — no active infections found' },
    { type:'warn', msg:'SSH brute-force pattern on 10.0.{A}.{B} → source blocked' },
    { type:'info', msg:'SSL cert check — all {N} endpoints healthy' },
    { type:'ok',   msg:'Network baseline recalibrated — 0 anomalies pending' },
    { type:'alrt', msg:'Lateral movement signature on subnet 172.16.{A}.0/24 → flagged' },
    { type:'info', msg:'Vulnerability scan initiated — {N} hosts in scope' },
    { type:'warn', msg:'Unusual process spawned on WKS-{A}{B} → under investigation' },
    { type:'ok',   msg:'Patch compliance check — {N}% endpoints current' },
  ];

  const THREATS = [
    { val:'LOW',      color:'var(--good)',  bg:'conic-gradient(var(--good) 0% 20%, var(--line) 20% 100%)' },
    { val:'MODERATE', color:'#7dd8d8',      bg:'conic-gradient(#7dd8d8 0% 45%, var(--line) 45% 100%)' },
    { val:'ELEVATED', color:'var(--amber)', bg:'conic-gradient(var(--amber) 0% 68%, var(--line) 68% 100%)' },
  ];

  let alertCount = 247, iocCount = 12, threatIdx = 0;
  const socAlertsEl = document.getElementById('socAlertsN');
  const socIocEl    = document.getElementById('socIocN');
  const threatRing  = document.getElementById('socThreatRing');
  const threatVal   = document.getElementById('socThreatVal');

  function rnd(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

  function addEvent() {
    const evt = EVTS[rnd(0, EVTS.length - 1)];
    const msg = evt.msg
      .replace('{A}', rnd(1,254)).replace('{B}', rnd(1,254))
      .replace('{N}', rnd(2,99)).replace('{M}', rnd(1,9));
    const now = new Date();
    const ts  = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    const el  = document.createElement('div');
    el.className = 'soc-log-entry';
    el.innerHTML = `<span class="soc-ts">${ts}</span><span class="soc-badge ${evt.type}">${evt.type.toUpperCase()}</span><span class="soc-msg">${msg}</span>`;
    log.appendChild(el);
    while (log.children.length > 14) log.removeChild(log.firstChild);
    log.scrollTop = log.scrollHeight;
    if (evt.type === 'alrt') { iocCount++; if (socIocEl) socIocEl.textContent = iocCount; }
    alertCount += rnd(0, 2);
    if (socAlertsEl) socAlertsEl.textContent = alertCount;
  }

  function updateThreat() {
    threatIdx = (threatIdx + 1) % THREATS.length;
    const t = THREATS[threatIdx];
    if (threatRing) threatRing.style.background = t.bg;
    if (threatVal)  { threatVal.textContent = t.val; threatVal.style.color = t.color; }
  }

  const socSect = document.getElementById('soc-ops');
  if (socSect) {
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.unobserve(socSect);
      for (let i = 0; i < 7; i++) addEvent();
      setInterval(addEvent, 3000);
      setInterval(updateThreat, 11000);
    }, { threshold: 0.15 }).observe(socSect);
  }
})();

/* --- Password Analyzer --- */
(function initPwAnalyzer() {
  const pwInput    = document.getElementById('pwInput');
  const pwEye      = document.getElementById('pwEye');
  const pwMeter    = document.getElementById('pwMeter');
  const pwStrLbl   = document.getElementById('pwStrLabel');
  const pwEntropy  = document.getElementById('pwEntropy');
  const pwCharSize = document.getElementById('pwCharsetSize');
  const pwCharTypes= document.getElementById('pwCharTypes');
  const pwCrack    = document.getElementById('pwCrackTime');
  const pwTips     = document.getElementById('pwTips');
  if (!pwInput) return;

  pwEye?.addEventListener('click', () => { pwInput.type = pwInput.type === 'password' ? 'text' : 'password'; });

  function fmtTime(s) {
    if (s < 1)           return 'instant';
    if (s < 60)          return `${Math.round(s)}s`;
    if (s < 3600)        return `${Math.round(s/60)} min`;
    if (s < 86400)       return `${Math.round(s/3600)} hrs`;
    if (s < 2592000)     return `${Math.round(s/86400)} days`;
    if (s < 31536000)    return `${Math.round(s/2592000)} months`;
    if (s < 3.15e10)     return `${Math.round(s/31536000)} yrs`;
    return 'centuries+';
  }

  function analyze(pw) {
    const empty = v => { if(v) v.textContent='—'; };
    if (!pw) {
      pwMeter.style.width='0'; pwMeter.style.background='var(--line)';
      pwStrLbl.textContent='—'; pwStrLbl.style.color='var(--faint)';
      [pwEntropy,pwCharSize,pwCharTypes,pwCrack].forEach(empty);
      if(pwTips) pwTips.innerHTML=''; return;
    }
    const hasLower  = /[a-z]/.test(pw);
    const hasUpper  = /[A-Z]/.test(pw);
    const hasDigit  = /[0-9]/.test(pw);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pw);
    let charset = 0;
    const types = [];
    if (hasLower)  { charset += 26; types.push('a-z'); }
    if (hasUpper)  { charset += 26; types.push('A-Z'); }
    if (hasDigit)  { charset += 10; types.push('0-9'); }
    if (hasSymbol) { charset += 32; types.push('symbols'); }
    const entropy    = charset > 0 ? pw.length * Math.log2(charset) : 0;
    const combos     = charset > 0 ? Math.pow(charset, pw.length) : 0;
    const crackSecs  = combos / 2 / 1.6e12;
    let strength, pct, color;
    if      (entropy < 28) { strength=t('pw.s.critical'); pct=8;   color='#E2685B'; }
    else if (entropy < 40) { strength=t('pw.s.weak');     pct=28;  color='#E07850'; }
    else if (entropy < 55) { strength=t('pw.s.moderate'); pct=54;  color='var(--amber)'; }
    else if (entropy < 70) { strength=t('pw.s.strong');   pct=78;  color='var(--teal)'; }
    else                   { strength=t('pw.s.vstrong');  pct=100; color='var(--good)'; }
    pwMeter.style.width = pct+'%'; pwMeter.style.background = color;
    pwStrLbl.textContent = strength; pwStrLbl.style.color = color;
    if (pwEntropy)   pwEntropy.textContent   = entropy.toFixed(1)+' bits';
    if (pwCharSize)  pwCharSize.textContent  = charset ? charset+' chars' : '—';
    if (pwCharTypes) pwCharTypes.textContent = types.length ? types.join(' + ') : '—';
    if (pwCrack) { pwCrack.textContent = fmtTime(crackSecs); pwCrack.style.color = pct<55?'#E2685B':pct<78?'var(--amber)':'var(--good)'; }
    const tips = [];
    if (pw.length < 12)              tips.push(t('pw.tip.len'));
    if (!hasUpper)                   tips.push(t('pw.tip.upper'));
    if (!hasDigit)                   tips.push(t('pw.tip.num'));
    if (!hasSymbol)                  tips.push(t('pw.tip.sym'));
    if (/(.)\1{2,}/.test(pw))        tips.push(t('pw.tip.rep'));
    if (/^[0-9]+$/.test(pw))         tips.push(t('pw.tip.nonum'));
    if (pwTips) pwTips.innerHTML = tips.map(t=>`<span class="pw-tip">↑ ${t}</span>`).join('');
  }
  pwInput.addEventListener('input', () => analyze(pwInput.value));
})();

/* --- AI Chat Widget --- */
(function initChat() {
  const btn   = document.getElementById('xlChatBtn');
  const panel = document.getElementById('xlChatPanel');
  const close = document.getElementById('xlChatClose');
  const msgs  = document.getElementById('xlChatMsgs');
  const input = document.getElementById('xlChatInput');
  const send  = document.getElementById('xlChatSend');
  if (!btn || !panel) return;

  const KB = [
    { k:['hire','hiring','job','work','opportunity','available','open','employ','looking','recruit'],
      r:"Xuan Lin is actively open to opportunities 🟢\nSeeking cybersecurity, SOC, IT, or tech roles — part-time or full-time.\n\n📧 lauxuanlin2@gmail.com\n💼 /in/xuanlinnnnn" },
    { k:['skill','know','programming','code','language','tech stack','can she','capable'],
      r:"Her stack:\n▸ Python · JS · Node.js · SQL · HTML/CSS · Linux\n\nSecurity tools:\n▸ Wireshark · Autopsy · Magnet AXIOM\n▸ Trend Micro Vision One · Graylog · n8n\n\nShe picks up new tools fast." },
    { k:['experience','company','worked','history','background','resume','cv','intern'],
      r:"3 companies:\n\n▸ Project Lead @ PERSOL Singapore (Mar 2025–Now)\n▸ IT Intern @ PERSOL EVO — tech refresh (2023)\n▸ IT Intern @ NCS Pte Ltd (2021)\n  supported Singtel, MediaCorp, SATS" },
    { k:['cert','certification','qualified','qualification','security+'],
      r:"Certifications:\n🏆 ST Engineering Cybersecurity Operations Specialist\n🏴‍☠️ EC-Council CyberQ CTF Participant\n📚 Currently pursuing CompTIA Security+" },
    { k:['project','built','made','portfolio','build'],
      r:"Her projects:\n\n▸ Network & Malware Forensics\n  (Wireshark, Autopsy, Magnet AXIOM, RegShot)\n▸ OCBC Ignite Challenge 2025\n▸ SOC Automation — 12+ n8n workflows\n▸ Stray Cat Community Platform (full-stack)\n▸ LLM Log Analysis Research" },
    { k:['contact','email','reach','linkedin','github','phone'],
      r:"📧 lauxuanlin2@gmail.com\n💼 linkedin.com/in/xuanlinnnnn\n🐙 github.com/xuanlinnnnn\n\nOr use the contact form at the bottom of this page!" },
    { k:['school','study','education','sp','polytechnic','student','graduate'],
      r:"Digital Cybersecurity & Digital Forensics @ Singapore Polytechnic 🎓" },
    { k:['who','about','introduce','yourself','tell me','xuan','xl'],
      r:"Xuan Lin — cybersecurity & forensics student at SP.\n\nSOC analyst · forensics investigator · automation builder · full-stack developer.\n\nMeticulous, curious, and allegedly the funniest one in the group 😄" },
    { k:['forensics','wireshark','autopsy','magnet','axiom','regshot','malware'],
      r:"She uses:\n▸ Wireshark — network packet analysis\n▸ Autopsy & Magnet AXIOM — disk/memory forensics\n▸ RegShot — registry diffing\n▸ PE tools — malware static analysis\n\nReal tools, real investigations." },
    { k:['soc','analyst','security operation','monitoring','alert','triage'],
      r:"Real SOC experience:\n▸ Alert triage & IOC sweeping\n▸ Threat hunting & incident investigation\n▸ n8n automation — cut manual triage load significantly" },
    { k:['ctf','competition','hacking','hack','capture'],
      r:"She competes in CTFs 🏴‍☠️\nEC-Council CyberQ (WISSEN) + multiple others.\nShe does it for fun. Yes, really." },
    { k:['n8n','automation','workflow'],
      r:"Built 12+ n8n workflows:\n▸ Auto-triage & alert classification\n▸ Jira integration for zero-touch ticket creation\n▸ API connectors for threat intel\n\nActually cut the team's manual work." },
    { k:['ocbc','ignite','challenge','banking','fintech'],
      r:"OCBC Ignite Challenge 2025 — team of 4.\nTheme: Accessible Digital Banking.\nConcept: 'Simple Mode' — cleaner UX, guided steps, voice assistance + AI chatbot.\nPitched to OCBC judges 🎤" },
    { k:['cat','stray','animal','website','platform','full stack','full-stack'],
      r:"She built a full-stack stray cat community platform 🐱\nFront end + backend + database.\nPeople can log sightings and leave contacts to donate or foster.\nActually works, not a mockup." },
    { k:['salary','pay','compensation','rate','money'],
      r:"Nice try 😄\nReach her directly: lauxuanlin2@gmail.com" },
    { k:['name','called','call her','full name'],
      r:"Her name is Xuan Lin 😊\nMost people just call her Xuan.\nYou can reach her at lauxuanlin2@gmail.com or linkedin.com/in/xuanlinnnnn" },
    { k:['where','location','based','singapore','country','city'],
      r:"She's based in Singapore 🇸🇬\nCurrently studying at Singapore Polytechnic and working as a Project Lead at PERSOL Singapore." },
    { k:['language','speak','chinese','english','mandarin'],
      r:"She speaks English and Mandarin 🗣️\n(you may have noticed the 细心 — that's deliberate 😄)" },
    { k:['hello','hi','hey','sup','yo'],
      r:"Hey 👋 I'm Xuan Lin's assistant.\nAsk me about her skills, experience, or whether she's open to work!" },
    { k:['thanks','thank','thx','ty','nice'],
      r:"Happy to help! Anything else you want to know? 😊" },
  ];

  function typeReply(text) {
    const m = document.createElement('div'); m.className = 'xl-cm-bot'; m.textContent = '';
    msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight;
    let i = 0;
    const iv = setInterval(() => { m.textContent = text.slice(0,++i); msgs.scrollTop=msgs.scrollHeight; if(i>=text.length) clearInterval(iv); }, 10);
  }

  function respond(q) {
    const d = document.createElement('div'); d.className='xl-cm-user'; d.textContent=q;
    msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight;
    const t = document.createElement('div'); t.className='xl-cm-typing';
    t.innerHTML='<span></span><span></span><span></span>'; msgs.appendChild(t); msgs.scrollTop=msgs.scrollHeight;
    const lq = q.toLowerCase();
    const match = KB.find(kb => kb.k.some(w => lq.includes(w)));
    const res = match ? match.r : "Hmm, not sure about that 🤔\nTry asking about her skills, experience, projects, or availability!\n\n📧 lauxuanlin2@gmail.com";
    setTimeout(() => { t.remove(); typeReply(res); }, 600 + Math.random()*400);
  }

  btn.addEventListener('click', () => {
    const open = panel.style.display === 'none';
    panel.style.display = open ? '' : 'none';
    if (open) setTimeout(() => input.focus(), 250);
  });
  close?.addEventListener('click', () => { panel.style.display = 'none'; });
  function submit() { const q=input.value.trim(); if(!q) return; input.value=''; respond(q); }
  send?.addEventListener('click', submit);
  input?.addEventListener('keydown', e => { if(e.key==='Enter') submit(); });
})();
