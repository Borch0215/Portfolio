import './theme-toggle.js';
document.addEventListener('DOMContentLoaded', ()=>{
  // year
  const y = new Date().getFullYear(); const yearEl = document.getElementById('year'); if(yearEl) yearEl.textContent = y;

  // defensive restore for body scroll in case other scripts left it disabled
  try{ if(document.body && document.body.style && document.body.style.overflow === 'hidden') document.body.style.overflow = ''; }catch(e){}

  // progressive enhanced smooth scroll with history update
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const href = a.getAttribute('href'); if(!href || href==='#' || href==='#0') return;
      if(href.startsWith('#')){
        e.preventDefault();
        const el = document.querySelector(href);
        if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
        try{ history.replaceState(null,'',href); }catch(e){}
        // no mobile menu to close
      }
    });
  });

  // mobile menu removed

  // header shrink on scroll
  const header = document.querySelector('.site-header');
  if(header){
    const onScroll = ()=>{
      if(window.scrollY > 18) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    };
    onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
    // update CSS variable for header height
    const updateHeaderHeight = ()=>{ const h = getComputedStyle(header).height; document.documentElement.style.setProperty('--header-height', h); };
    updateHeaderHeight(); window.addEventListener('resize', updateHeaderHeight);
  }

});
