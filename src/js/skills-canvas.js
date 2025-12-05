const SKILLS = [
  {
    name: 'HTML',
    pct: 60,
    desc: 'Markup, semántica, accesibilidad WCAG AA',
    details: [
      'Semántica y estructura (header, main, nav, footer)',
      'Accesibilidad: roles ARIA y buenas prácticas WCAG AA',
      'SEO básico: meta, headings y microdata cuando aplica'
    ]
  },
  {
    name: 'CSS',
    pct: 85,
    desc: 'Responsive, Grid, Flexbox, animaciones',
    details: [
      'Layout: Grid y Flexbox, mobile-first',
      'Sistemas de diseño y variables CSS',
      'Animaciones CSS y transiciones con rendimiento en mente'
    ]
  },
  {
    name: 'JavaScript',
    pct: 50,
    desc: 'ES6+, DOM, Fetch, gestión de estado',
    details: [
      'ES6+ moderno: módulos, async/await, Promises',
      'Manipulación DOM, eventos y rendimiento',
      'Integración con APIs y fetch, manejo de errores y cache'
    ]
  },
  {
    name: 'PHP',
    pct: 15,
    desc: 'Backend, APIs, almacenamiento JSON',
    details: [
      'APIs REST simples para formularios y datos',
      'Gestión de archivos y JSON para persistencia ligera',
      'Buenas prácticas de seguridad básicas (input sanitization)'
    ]
  },
  {
    name: 'UI/UX',
    pct: 85,
    desc: 'Diseño de sistemas, prototipado, UX',
    details: [
      'Prototipado con herramientas modernas',
      'Diseño centrado en accesibilidad y usabilidad',
      'Creación de componentes reutilizables y tokens de diseño'
    ]
  },
  {
    name: '3D Design',
    pct: 20,
    desc: 'Blender, modelado, texturizado',
    details: [
      'Modelado low-poly para web y juegos',
      'Texturizado básico y UV mapping',
      'Exportación optimizada para rendimiento'
    ]
  }
];

function makeCard(skill){
  const el = document.createElement('div');
  el.className = 'skill-card fade-up';
  el.tabIndex = 0;
  el.setAttribute('role', 'group');
  el.setAttribute('aria-label', `${skill.name} ${skill.pct} por ciento`);

  // SVG circular progress
  const size = 140;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.classList.add('skill-svg');

  const cx = size/2, cy = size/2, r = 48;
  const circumference = 2 * Math.PI * r;

  const bgCircle = document.createElementNS(svgNS, 'circle');
  bgCircle.setAttribute('cx', cx);
  bgCircle.setAttribute('cy', cy);
  bgCircle.setAttribute('r', r);
  bgCircle.setAttribute('fill', 'none');
  bgCircle.setAttribute('stroke-width', '10');
  bgCircle.setAttribute('stroke', 'rgba(0,0,0,0.06)');
  bgCircle.setAttribute('stroke-linecap', 'round');

  const prog = document.createElementNS(svgNS, 'circle');
  prog.setAttribute('cx', cx);
  prog.setAttribute('cy', cy);
  prog.setAttribute('r', r);
  prog.setAttribute('fill', 'none');
  prog.setAttribute('stroke-width', '10');
  prog.setAttribute('stroke-linecap', 'round');
  prog.setAttribute('stroke', 'url(#ggrad)');
  prog.setAttribute('transform', `rotate(-90 ${cx} ${cy})`);
  prog.style.strokeDasharray = circumference;
  prog.style.strokeDashoffset = circumference;

  // defs gradient
  const defs = document.createElementNS(svgNS, 'defs');
  const lin = document.createElementNS(svgNS, 'linearGradient');
  lin.setAttribute('id', `ggrad-${skill.name.replace(/\s+/g,'')}`);
  lin.setAttribute('x1','0'); lin.setAttribute('x2','1');
  const stop1 = document.createElementNS(svgNS,'stop'); stop1.setAttribute('offset','0%'); stop1.setAttribute('stop-color','#4f46e5');
  const stop2 = document.createElementNS(svgNS,'stop'); stop2.setAttribute('offset','100%'); stop2.setAttribute('stop-color','#06b6d4');
  lin.appendChild(stop1); lin.appendChild(stop2);
  defs.appendChild(lin);
  prog.setAttribute('stroke','url(#' + lin.id + ')');

  svg.appendChild(defs);
  svg.appendChild(bgCircle);
  svg.appendChild(prog);

  // percentage text
  const perc = document.createElement('div');
  perc.className = 'skill-perc';
  perc.innerHTML = `<span class="num">0</span><small class="pct">%</small>`;

  const label = document.createElement('div');
  label.className = 'skill-label';
  label.textContent = skill.name;

  el.appendChild(svg);
  el.appendChild(perc);
  el.appendChild(label);

  // attach runtime data for animation
  // allow click / pointer / keyboard to open a small detail panel
  el.style.cursor = 'pointer';
  function openHandler(e){
    // prefer not to interfere with other controls
    try{
      // prevent double-open if a modal already exists
      if(document.querySelector('.modal')) return;
      if(e && e.type === 'keydown' && !(['Enter',' '].includes(e.key))) return;
      openSkillPanel(skill, el);
    } catch (err) {
      console.error('openSkillPanel error', err);
      // defensive: remove any modal left behind and restore scroll
      const stray = document.querySelector('.modal'); if(stray && stray.parentNode) stray.parentNode.removeChild(stray);
      document.body.style.overflow = '';
    }
  }
  el.addEventListener('pointerup', openHandler);
  el.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openHandler(e); } });
  return {el, prog, circumference, target: skill.pct, perc, skill};
}

function animateSVG(item){
  const {prog, circumference, target, perc} = item;
  const duration = 900;
  const start = performance.now();

  function step(ts){
    const t = Math.min(1, (ts - start)/duration);
    const ease = 1 - Math.pow(1-t, 3);
    const current = Math.round(target * ease);
    const offset = circumference * (1 - (current/100));
    prog.style.strokeDashoffset = offset;
    const num = perc.querySelector('.num');
    if(num) num.textContent = current;
    if(t < 1) requestAnimationFrame(step);
    else { num.textContent = target; prog.style.strokeDashoffset = circumference * (1 - target/100); }
  }

  requestAnimationFrame(step);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSkills);
} else {
  initSkills();
}

function initSkills(){
  const wrap = document.getElementById('skills-canvas-wrap');
  if(!wrap) return;
  wrap.innerHTML = '';
  const items = SKILLS.map(s => makeCard(s));
  items.forEach(i=> wrap.appendChild(i.el));

  if('IntersectionObserver' in window){
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          const it = items.find(x => x.el === e.target);
          if(it){ animateSVG(it); obs.unobserve(e.target); }
        }
      });
    }, {threshold: 0.35});
    items.forEach(i=> obs.observe(i.el));
  } else {
    items.forEach(animateSVG);
  }
}

export {};

// Small interactive skill panel
function openSkillPanel(skill, anchor){
  // follow same modal pattern used for projects to avoid inconsistencies
  const modal = document.createElement('div');
  modal.className = 'modal fade-in';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', `skill-${skill.name.replace(/\s+/g,'')}`);

  modal.innerHTML = `
    <div class="panel fade-up-modal">
      <button class="modal-close" aria-label="Cerrar modal" title="Cerrar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="project-modal-header">
        <h3 id="skill-${skill.name.replace(/\s+/g,'')}">${escapeHTML(skill.name)}</h3>
        <p class="project-modal-subtitle">${escapeHTML(skill.desc)}</p>
      </div>

      <div class="project-modal-content">
        <p class="project-description"><strong>Nivel:</strong> ${skill.pct}%</p>
        ${ (skill.details || []).length ? `<div class="project-stack"><h4>Detalles</h4><div class="stack-tags">${(skill.details||[]).map(d => `<span class="stack-tag">${escapeHTML(d)}</span>`).join('')}</div></div>` : '' }
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.modal-close');

  let closeModal = () => {
    document.body.style.overflow = '';
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out');
    document.removeEventListener('keydown', handleEscape);
    setTimeout(() => { if (modal && modal.parentNode) modal.parentNode.removeChild(modal); }, 300);
    if (anchor && anchor.focus) anchor.focus();
  };

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  const handleEscape = (e) => { if (e.key === 'Escape') closeModal(); };
  document.addEventListener('keydown', handleEscape);

  // Prevent background scroll while modal is open
  document.body.style.overflow = 'hidden';
}

// Simple focus trap: keep tab within panel
function trapFocus(panel, e){
  const focusable = panel.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
  if(!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length-1];
  if(e.shiftKey && document.activeElement === first){
    e.preventDefault(); last.focus();
  } else if(!e.shiftKey && document.activeElement === last){
    e.preventDefault(); first.focus();
  }
}

function escapeHTML(s){ return String(s).replace(/[&<>\"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
