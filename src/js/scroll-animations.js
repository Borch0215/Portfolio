const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initObserver() {
  const els = document.querySelectorAll('.fade-up, .stagger');
  
  // First, check which elements are already in viewport and add in-view immediately
  els.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      el.classList.add('in-view');
    }
  });

  if ('IntersectionObserver' in window && !prefersReduced) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !e.target.classList.contains('in-view')) {
          e.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.12 });

    els.forEach(el => obs.observe(el));
  } else {
    // Fallback: simple scroll handler
    const handler = () => {
      els.forEach(el => {
        if (!el.classList.contains('in-view')) {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight - 60) {
            el.classList.add('in-view');
          }
        }
      });
    };

    window.addEventListener('scroll', handler, { passive: true });
  }
}

// Wait for DOM to be ready, but also handle dynamically added elements
document.addEventListener('DOMContentLoaded', initObserver);

// Also trigger on load in case DOMContentLoaded already fired
window.addEventListener('load', initObserver);

export {};

