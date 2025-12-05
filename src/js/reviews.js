import Carousel from './carousel.js';

async function fetchReviews(){
  try{ const res = await fetch('../data/reviews.json'); return await res.json(); } catch(e){ console.error('fetchReviews error:', e); return []; }
}

async function initReviews(){
  const data = await fetchReviews();
  const carouselRoot = document.getElementById('reviews-carousel');
  let car = null;
  if(carouselRoot){
    car = new Carousel(carouselRoot, {autoplay:true, interval:5000});
    car.setItems(Array.isArray(data) ? data : (data.reviews||[]));
    window.addEventListener('resize', ()=>car.update());

    // connect UI controls
    const btnPrev = document.getElementById('rev-prev');
    const btnNext = document.getElementById('rev-next');
    if(btnPrev) btnPrev.addEventListener('click', ()=>{ if(car) car.prev(); });
    if(btnNext) btnNext.addEventListener('click', ()=>{ if(car) car.next(); });
    // pause autoplay when interacting with controls
    [btnPrev, btnNext].forEach(b=>{ if(!b) return; b.addEventListener('mouseenter', ()=>car.pause()); b.addEventListener('mouseleave', ()=>car.play()); });
  }
  // populate summary counts and average
  try{
    const reviewsList = Array.isArray(data) ? data : (data.reviews || []);
    const avg = (reviewsList.reduce((s,r)=>s+(r.stars||0),0) / Math.max(1,reviewsList.length)).toFixed(1);
    const elAvg = document.getElementById('avg-stars'); if(elAvg) elAvg.textContent = avg;
    const elCount = document.getElementById('reviews-count'); if(elCount) elCount.textContent = `${reviewsList.length} reseñas verificadas`;
  }catch(e){/* ignore */}

  const form = document.getElementById('review-form');
  // Initialize star widget if present
  initStarWidget(form);

  form?.addEventListener('submit', async (e)=>{
    e.preventDefault(); const fd = new FormData(form); const payload = Object.fromEntries(fd.entries());
    // simple client validation
    if(!payload.name||!payload.email||!payload.message) { alert('Rellena todos los campos'); return; }
    try{
      const res = await fetch('../server/php/api/reviews.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const json = await res.json(); if(json.success) alert('Revisión enviada. Revisa tu email para verificar'); else alert('Error: '+(json.error||'---'));
    } catch(e){
      alert('Nota: Sin backend PHP, la reseña no se guardará. Pero puedes ver el formulario funcionando.');
    }
  });
}

function initStarWidget(form){
  if(!form) return;
  const widget = form.querySelector('.star-rating');
  if(!widget) return;
  const hidden = widget.querySelector('input[type="hidden"][name="stars"]');
  const buttons = widget.querySelectorAll('.star');
  let current = Number(hidden?.value || 5);

  function update(v){
    buttons.forEach(b=>{
      const val = Number(b.dataset.value);
      if(val <= v) b.classList.add('active'); else b.classList.remove('active');
    });
    if(hidden) hidden.value = String(v);
  }

  buttons.forEach(b=>{
    b.addEventListener('click', ()=>{ current = Number(b.dataset.value); update(current); });
    b.addEventListener('mouseenter', ()=>{ update(Number(b.dataset.value)); });
    b.addEventListener('mouseleave', ()=>{ update(current); });
  });

  // initialize
  update(current);
}

document.addEventListener('DOMContentLoaded', initReviews);

export {};
