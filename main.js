/* =============================================
   DOBGIMA JOSHUA FONCHAM - PORTFOLIO SCRIPTS
   ============================================= */
'use strict';

/* ==============================
   CURSOR GLOW
============================== */
const cursorGlow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top = e.clientY + 'px';
});

/* ==============================
   PARTICLE CANVAS
============================== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.5 ? '99,102,241' : '6,182,212';
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = `rgb(${this.color})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initParticles(count = 80) {
  particles = [];
  for (let i = 0; i < count; i++) particles.push(new Particle());
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.save();
        ctx.globalAlpha = (1 - dist / 120) * 0.08;
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}
initParticles();
animateParticles();

/* ==============================
   TYPED TEXT EFFECT
============================== */
const typedEl = document.getElementById('typedText');
const phrases = [
  'beautiful web apps.',
  'powerful mobile apps.',
  'seamless experiences.',
  'clean & scalable code.',
  'your vision to life.',
];
let phraseIndex = 0, charIndex = 0, isDeleting = false;

function type() {
  const current = phrases[phraseIndex];
  typedEl.textContent = isDeleting
    ? current.substring(0, charIndex--)
    : current.substring(0, charIndex++);
  let delay = isDeleting ? 50 : 80;
  if (!isDeleting && charIndex === current.length + 1) { delay = 2000; isDeleting = true; }
  else if (isDeleting && charIndex < 0) { isDeleting = false; charIndex = 0; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 400; }
  setTimeout(type, delay);
}
type();

/* ==============================
   NAVBAR SCROLL BEHAVIOR
============================== */
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

function handleScroll() {
  const scrollY = window.scrollY;
  navbar.classList.toggle('scrolled', scrollY > 60);
  backToTop.classList.toggle('show', scrollY > 300);
  updateActiveNavLink();
}
window.addEventListener('scroll', handleScroll, { passive: true });

/* ==============================
   ACTIVE NAV LINK ON SCROLL
============================== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNavLink() {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active-link');
        if (link.getAttribute('href') === `#${section.id}`) link.classList.add('active-link');
      });
    }
  });
}

/* ==============================
   MOBILE HAMBURGER
============================== */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinksEl.classList.toggle('open');
  // Lock page scrolling while the menu is open
  document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
});
navLinksEl.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinksEl.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ==============================
   SCROLL REVEAL ANIMATIONS
============================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

/* ==============================
   COUNTER ANIMATION
============================== */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  if (target === 0) { el.textContent = 0; return; }
  const step = target / (2000 / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { el.textContent = target; clearInterval(timer); }
    else el.textContent = Math.floor(current);
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);

/* ==============================
   SKILL BAR ANIMATION
============================== */
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-bar').forEach(bar => {
        setTimeout(() => { bar.style.width = bar.getAttribute('data-pct') + '%'; }, 200);
      });
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.skills-panel').forEach(panel => skillObserver.observe(panel));

/* ==============================
   SKILLS TABS
============================== */
const tabBtns = document.querySelectorAll('.tab-btn');
const skillsPanels = document.querySelectorAll('.skills-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.getAttribute('data-tab');
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    skillsPanels.forEach(panel => {
      panel.classList.remove('active');
      if (panel.id === `tab-${tabId}`) {
        panel.classList.add('active');
        panel.querySelectorAll('.skill-bar').forEach(bar => {
          bar.style.width = '0';
          setTimeout(() => { bar.style.width = bar.getAttribute('data-pct') + '%'; }, 100);
        });
        panel.querySelectorAll('.reveal-up').forEach(el => {
          el.classList.remove('revealed');
          setTimeout(() => el.classList.add('revealed'), 50);
        });
      }
    });
  });
});

window.addEventListener('load', () => {
  document.querySelector('.skills-panel.active')?.querySelectorAll('.skill-bar').forEach(bar => {
    setTimeout(() => { bar.style.width = bar.getAttribute('data-pct') + '%'; }, 600);
  });
});

/* ==============================
   DYNAMIC PROJECTS — SUPABASE
============================== */
function normalizeUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) return 'https://' + url;
  return url;
}

const STATIC_PROJECTS = [
  {
    title: 'M&J Luxurious Guest House',
    description: 'Website for a premium apartment and guest house business in Bonamussadi, Douala — showcasing luxury units with a sleek, modern presentation.',
    tags: 'Web, Hospitality',
    icon: 'fas fa-hotel',
    live_url: 'https://mjluxuriousguesthouse.vercel.app/',
  },
  {
    title: 'SlumLife Children Foundation',
    description: 'Website for a foundation empowering street children in Uganda — telling their story and connecting donors and volunteers to the cause.',
    tags: 'Web, Non-Profit',
    icon: 'fas fa-hand-holding-heart',
    live_url: 'https://slum-life.vercel.app/',
  },
  {
    title: 'Buea Shopping Mall',
    description: 'Online cosmetics shopping platform for Buea — browse products, view details and shop from a clean, easy-to-use storefront.',
    tags: 'Web, E-Commerce',
    icon: 'fas fa-shopping-bag',
    live_url: 'https://cosmetics-buea-shopping-mall-j5gg.vercel.app/',
  },
  {
    title: 'I Grill House',
    description: 'Restaurant website for a charcoal-grill house in Bamenda — full menu, daily specials, online reservations and WhatsApp ordering.',
    tags: 'Web, Restaurant',
    icon: 'fas fa-utensils',
    live_url: 'https://i-grill-house.vercel.app/',
  },
  {
    title: 'Hospital Management System',
    description: 'Hospital platform with online appointment booking, doctor directory, departments, patient portal and 24/7 emergency contacts.',
    tags: 'Web, Healthcare',
    icon: 'fas fa-hospital',
    live_url: 'https://hospitalmanagementsystem-eta-smoky.vercel.app/',
  },
];

const PROJ_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
];

async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  // Start from the built-in featured projects, then append any extra
  // projects added via the admin panel (skipping duplicate URLs).
  let projects = [...STATIC_PROJECTS];
  try {
    const { data: dbProjects, error } = await sb.from('projects').select('*').order('created_at', { ascending: true });
    if (!error && dbProjects) {
      const knownUrls = new Set(STATIC_PROJECTS.map(p => normalizeUrl(p.live_url)));
      projects = projects.concat(dbProjects.filter(p => !knownUrls.has(normalizeUrl(p.live_url || ''))));
    }
  } catch (e) {
    console.error('Could not load projects from Supabase:', e);
  }

  grid.innerHTML = projects.map((p, i) => {
    const gradient = PROJ_GRADIENTS[i % PROJ_GRADIENTS.length];
    const tagsHtml = (p.tags || '').split(',').map(t => t.trim()).filter(Boolean)
      .map(t => `<span class="tag">${t}</span>`).join('');
    const imgHtml = p.image_url
      ? `<img src="${p.image_url}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;" />`
      : `<div class="project-icon"><i class="${p.icon || 'fas fa-code'}"></i></div>`;
    const demoBtn = p.live_url
      ? `<a href="${normalizeUrl(p.live_url)}" target="_blank" rel="noopener noreferrer" class="project-btn"><i class="fas fa-eye"></i> Live Demo</a>` : '';
    const codeBtn = p.code_url
      ? `<a href="${normalizeUrl(p.code_url)}" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-ghost"><i class="fab fa-github"></i> Code</a>` : '';

    return `
      <div class="project-card reveal-up" style="--delay:${i * 0.08}s">
        <div class="project-image" style="background:${gradient};">${imgHtml}</div>
        <div class="project-content">
          <div class="project-tags">${tagsHtml}</div>
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc">${p.description}</p>
          <div class="project-links">${demoBtn}${codeBtn}</div>
        </div>
      </div>`;
  }).join('');

  grid.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));
  grid.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -5;
      const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 5;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* Profile photo and CV are served from files in this repo
   (profile.jpg, Dobgima_Joshua_Foncham_CV.pdf) — no Supabase override. */

document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
});

/* ==============================
   HIRE ME MODAL
============================== */
function openHireModal() {
  const overlay = document.getElementById('hireMeOverlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeHireModal() {
  const overlay = document.getElementById('hireMeOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeHireModal(); });

/* ==============================
   CONTACT FORM (FormSubmit)
============================== */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');

if (contactForm) {
  const nextInput = document.getElementById('formNextUrl');
  if (nextInput) nextInput.value = window.location.href + '?sent=1';
  if (window.location.search.includes('sent=1')) {
    if (formSuccess) formSuccess.classList.add('show');
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  contactForm.addEventListener('submit', () => {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }
  });
}

/* ==============================
   SMOOTH SCROLL
============================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    }
  });
});

/* ==============================
   FOOTER YEAR
============================== */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ==============================
   HERO ENTRANCE
============================== */
window.addEventListener('load', () => {
  document.querySelectorAll('.hero .reveal-up').forEach(el => {
    setTimeout(() => el.classList.add('revealed'), 100);
  });
});

/* ==============================
   SCROLL PROGRESS BAR
============================== */
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position:fixed;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4);
  transform-origin:left;transform:scaleX(0);
  z-index:9999;transition:transform 0.1s linear;pointer-events:none;`;
document.body.appendChild(progressBar);
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  progressBar.style.transform = `scaleX(${pct})`;
}, { passive: true });

console.log('%c👋 Hey there, developer!', 'color:#6366f1;font-size:18px;font-weight:bold;');
console.log('%cPortfolio of Dobgima Joshua Foncham 🚀', 'color:#94a3b8;font-size:13px;');
