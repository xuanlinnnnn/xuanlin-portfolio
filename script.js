document.getElementById('year').textContent = new Date().getFullYear();

const nav = document.getElementById('nav');
const navLinks = document.getElementById('navLinks');
document.getElementById('navToggle').addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20));

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

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

function typeTerminal(){
  let i = 0, span = null;
  (function next(){
    if (i >= termLines.length){ termBody.insertAdjacentHTML('beforeend','<span class="term-cursor"></span>'); return; }
    const part = termLines[i];
    let j = 0;
    span = document.createElement('span'); span.className = part.cls;
    termBody.appendChild(span);
    (function char(){
      if (j < part.t.length){ span.textContent += part.t[j++]; setTimeout(char, 16 + Math.random()*22); }
      else { i++; setTimeout(next, 90); }
    })();
  })();
}
const termObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting){
      if (reduceMotion){
        termBody.innerHTML = termLines.map(l => '<span class="'+l.cls+'">'+l.t.replace(/</g,'&lt;')+'</span>').join('') + '<span class="term-cursor"></span>';
      } else { typeTerminal(); }
      termObserver.disconnect();
    }
  });
}, { threshold: 0.4 });
termObserver.observe(termBody);

document.getElementById('contactForm').addEventListener('submit', function(e){
  e.preventDefault();
  const note = document.getElementById('formNote');
  const btn = this.querySelector('button[type="submit"]');
  if (!this.checkValidity()){ note.textContent = '// please fill in all fields first.'; note.style.color = '#E2685B'; return; }
  btn.disabled = true; btn.textContent = 'Sending…';
  fetch(this.action, { method:'POST', body: new FormData(this), headers:{ 'Accept':'application/json' } })
    .then(r => {
      if (r.ok){
        note.textContent = '// message sent — I\'ll get back to you soon.';
        note.style.color = 'var(--good)';
        this.reset();
      } else {
        note.textContent = '// something went wrong — try emailing me directly.';
        note.style.color = '#E2685B';
      }
    })
    .catch(() => { note.textContent = '// network error — try again.'; note.style.color = '#E2685B'; })
    .finally(() => { btn.disabled = false; btn.textContent = 'Send Message →'; });
});

const charData = [
  { id:'hero',       img:'images/hero.jpg',        msg:'psst — scroll down, it gets better 👀' },
  { id:'about',      img:'images/avatar.jpg',       msg:'fun fact: i catch the bug everyone else scrolled past. even in prod.' },
  { id:'skills',     img:'images/gentle.jpg',       msg:'// cat skills.json → trust me, it compiles.' },
  { id:'projects',   img:'images/clumsy.jpg',       msg:'built it. broke it. rebuilt it. shipped it. repeat.' },
  { id:'experience', img:'images/professional.jpg', msg:'monitoring 847 alerts rn. still writing docs. still unblinking.' },
  { id:'contact',    img:'images/hero.jpg',         msg:"i don't bite. well — depends on the severity level 😌" },
];

let charBubbleVisible = true;
let charImgCurrent = 'images/hero.jpg';
let charImgAActive = true;
const charBubbleEl = document.getElementById('charBubble');
const charTextEl   = document.getElementById('charText');
const charImgA     = document.getElementById('charImgA');
const charImgB     = document.getElementById('charImgB');

function charSwitchImg(src){
  if (src === charImgCurrent) return;
  charImgCurrent = src;
  if (charImgAActive){
    charImgB.src = src; charImgB.classList.remove('char-out'); charImgA.classList.add('char-out');
  } else {
    charImgA.src = src; charImgA.classList.remove('char-out'); charImgB.classList.add('char-out');
  }
  charImgAActive = !charImgAActive;
}

function charSetMsg(msg){
  charBubbleEl.style.animation = 'none';
  void charBubbleEl.offsetWidth;
  charBubbleEl.style.animation = '';
  charTextEl.innerHTML = msg + '<span class="char-blink">_</span>';
}

const charObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const d = charData.find(s => s.id === e.target.id);
    if (d){ charSwitchImg(d.img); charSetMsg(d.msg); }
  });
}, { threshold: 0.35 });

charData.forEach(d => { const el = document.getElementById(d.id); if (el) charObserver.observe(el); });

document.getElementById('charAvatar').addEventListener('click', () => {
  charBubbleVisible = !charBubbleVisible;
  charBubbleEl.style.display = charBubbleVisible ? '' : 'none';
});

setTimeout(() => charSetMsg(charData[0].msg), 900);
