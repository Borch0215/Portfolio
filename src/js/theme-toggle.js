const key = 'portfolio-theme';
const root = document.documentElement;
const btn = document.getElementById('theme-toggle');
const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setToggleVisual(isDark){
  if(!btn) return;
  if(isDark){ btn.classList.add('active'); btn.setAttribute('aria-pressed','true'); }
  else { btn.classList.remove('active'); btn.setAttribute('aria-pressed','false'); }
}

function applyTheme(t){
  if(t==='dark') root.setAttribute('data-theme','dark'); else root.removeAttribute('data-theme');
  setToggleVisual(t==='dark');
}

const stored = localStorage.getItem(key) || (window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
applyTheme(stored);

if(btn){
  btn.addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    if(!prefersReduced){ document.documentElement.style.transition = 'background .28s ease,color .28s ease'; }
    applyTheme(next);
    localStorage.setItem(key, next);
  });
}

