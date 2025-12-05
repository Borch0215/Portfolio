async function loadProjects(){
  console.log('loadProjects called');
  try{
    const res = await fetch('../data/seed_projects.json');
    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Projects data loaded:', data.length, 'items');
    renderProjects(data);
  } catch(e){
    console.error('loadProjects error:', e);
  }
}

function renderProjects(list){
  console.log('renderProjects called with:', list.length, 'items');
  const grid = document.getElementById('projects-grid'); 
  console.log('Grid element:', grid);
  if(!grid) return; 
  grid.innerHTML='';
  list.forEach(p=>{
    const it = document.createElement('article');
    it.className='projects-item fade-up';

    // Image / thumbnail (responsive + lazy)
    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'project-thumb';
    if (p.images && p.images.length) {
      const img = document.createElement('img');
      img.className = 'responsive-img img-lazy';
      img.loading = 'lazy';
      // prefer provided srcset if available in data (each image can be object or string)
      const first = p.images[0];
      if (typeof first === 'string') {
        img.src = first;
      } else if (first && first.src) {
        img.src = first.src;
        if (first.srcset) img.srcset = first.srcset;
        if (first.sizes) img.sizes = first.sizes;
      }
      img.alt = p.title + ' — preview';
      thumbWrap.appendChild(img);
    } else {
      // fallback placeholder (SVG data URI with initials)
      const ph = document.createElement('div');
      ph.className = 'project-thumb-placeholder img-lazy';
      ph.setAttribute('aria-hidden', 'true');
      ph.textContent = p.title.split(' ').map(w=>w[0]).slice(0,2).join('');
      thumbWrap.appendChild(ph);
    }

    const body = document.createElement('div');
    body.className = 'project-body';
    const h = document.createElement('h4'); h.className = 'project-title'; h.textContent = p.title;
    const pShort = document.createElement('p'); pShort.textContent = p.short;
    const small = document.createElement('p'); small.innerHTML = `<small>${(p.stack||[]).join(', ')}</small>`;
    const actions = document.createElement('p'); actions.innerHTML = `<button class="btn" data-id="${p.id}">Ver proyecto</button>`;

    body.appendChild(h);
    body.appendChild(pShort);
    body.appendChild(small);
    body.appendChild(actions);

    it.appendChild(thumbWrap);
    it.appendChild(body);
    grid.appendChild(it);
  });
  console.log('renderProjects finished, grid now has:', grid.children.length, 'items');
  grid.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button[data-id]'); if(!btn) return; const id = btn.dataset.id;
    const project = list.find(x=>x.id==id); if(project) openModal(project);
  });
}

function openModal(project) {
  const modal = document.createElement('div');
  modal.className = 'modal fade-in';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', `project-${project.id}`);

  modal.innerHTML = `
    <div class="panel fade-up-modal">
      <button class="modal-close" aria-label="Cerrar modal" title="Cerrar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="project-modal-header">
        <h3 id="project-${project.id}">${escapeHTML(project.title)}</h3>
        <p class="project-modal-subtitle">${escapeHTML(project.short)}</p>
      </div>

      <div class="project-modal-content">
        <p class="project-description">${escapeHTML(project.long)}</p>

        <div class="project-stack">
          <h4>Stack Tecnológico</h4>
          <div class="stack-tags">
            ${project.stack.map(s => `<span class="stack-tag">${escapeHTML(s)}</span>`).join('')}
          </div>
        </div>

        <div class="project-tags">
          <h4>Categorías</h4>
          <div class="tags-list">
            ${project.tags.map(t => `<span class="tag-badge">${escapeHTML(t)}</span>`).join('')}
          </div>
        </div>

        <div class="project-actions">
          <a class="btn primary" href="${project.demo}" target="_blank" rel="noopener noreferrer">
            <span>🚀 Ver Demo</span>
          </a>
          <a class="btn outline" href="${project.repo}" target="_blank" rel="noopener noreferrer">
            <span>📦 Repositorio</span>
          </a>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.modal-close');

  // Close handler ensures cleanup (restore scroll, remove listeners, remove DOM)
  let closeModal = () => {
    // restore body scroll
    document.body.style.overflow = '';

    // animate out then remove
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out');

    // remove keydown listener in case it's still attached
    document.removeEventListener('keydown', handleEscape);

    setTimeout(() => {
      if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
    }, 300);
  };

  closeBtn.addEventListener('click', closeModal);

  // Cerrar al hacer click fuera del panel
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Cerrar con tecla Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Prevenir scroll mientras el modal está abierto
  document.body.style.overflow = 'hidden';
}

function escapeHTML(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// filters
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initFilters);
} else {
  initFilters();
}

function initFilters(){
  loadProjects();
  
  // esperar un poco para asegurar que los botones existan
  setTimeout(()=>{
    const buttons = document.querySelectorAll('.filters button');
    console.log('Buttons found:', buttons.length);
    buttons.forEach(b=>b.addEventListener('click', async (e)=>{
      document.querySelectorAll('.filters button').forEach(x=>x.classList.remove('active')); 
      b.classList.add('active');
      const f = b.dataset.filter;
      console.log('Filter clicked:', f);
      try{
        const res = await fetch('../data/seed_projects.json'); 
        const list = await res.json();
        if(f==='all') renderProjects(list);
        else renderProjects(list.filter(p=>p.tags && p.tags.includes(f)));
      } catch(e){
        console.error('Filter error:', e);
      }
    }));
  }, 100);
}

export {};

export {loadProjects};
