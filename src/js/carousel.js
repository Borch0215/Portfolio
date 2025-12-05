class Carousel{
  constructor(root, opts = {}){
    this.root = root;
    this.track = document.createElement('div');
    this.track.className = 'track';
    this.root.appendChild(this.track);
    this.items = [];
    this.lock = false;
    this.current = 0;
    this.timer = null;
    this.opts = Object.assign({autoplay:false, interval:4000}, opts);
    this.onTransitionEnd = this._onTransitionEnd.bind(this);
    this._boundResize = this.update.bind(this);
  }

  setItems(data){
    this.stop();
    this.track.innerHTML='';
    this.items = data || [];
    if(this.items.length === 0) return;
    // create slides
    this.items.forEach(d=>{
      const el = document.createElement('div'); el.className='slide';
      el.innerHTML = `
        <div class="review-card">
          <blockquote class="quote">${escapeHTML(d.message)}</blockquote>
          <div class="review-meta">
            <div class="who">
              <div class="review-avatar">${escapeHTML((d.name||'').charAt(0) || 'U')}</div>
              <div>
                <strong>${escapeHTML(d.name)}</strong>
                <div class="reviews-count-small">${escapeHTML(d.title || '')}</div>
              </div>
            </div>
            <div class="review-stars">${d.stars}★</div>
          </div>
        </div>`;
      this.track.appendChild(el);
    });
    // if only one slide, no need to clone
    if(this.track.children.length === 1){
      this.current = 0;
      this.track.style.display = 'flex';
      this.track.style.transition = 'transform .5s ease';
      this.update();
      this._maybeStart();
      window.addEventListener('resize', this._boundResize);
      return;
    }
    this.cloneForLoop();
    window.addEventListener('resize', this._boundResize);
    this._addInteractionHandlers();
    this._maybeStart();
  }

  cloneForLoop(){
    const first = this.track.children[0].cloneNode(true);
    const last = this.track.children[this.track.children.length-1].cloneNode(true);
    this.track.appendChild(first);
    this.track.insertBefore(last, this.track.firstChild);
    this.track.style.display='flex';
    this.track.style.transition='transform .5s ease';
    this.current = 1; // because we prepended one
    this.update();
    this.track.addEventListener('transitionend', this.onTransitionEnd);
  }

  _onTransitionEnd(){
    // called when a transition finishes
    this.lock = false;
    const childrenCount = this.track.children.length;
    if(this.current >= childrenCount - 1){
      this.current = 1; this.jump();
    } else if(this.current <= 0){
      this.current = childrenCount - 2; this.jump();
    }
  }

  next(){ if(this.lock) return; if(!this.track.children.length) return; this.lock = true; this.current++; this.update(); }
  prev(){ if(this.lock) return; if(!this.track.children.length) return; this.lock = true; this.current--; this.update(); }

  jump(){ this.track.style.transition='none'; this.update(); requestAnimationFrame(()=>{ this.track.style.transition='transform .5s ease'; }); }

  update(){ const w = this.root.clientWidth; Array.from(this.track.children).forEach(c=>c.style.minWidth = `${w}px`); this.track.style.transform = `translateX(${-this.current * w}px)`; }

  _addInteractionHandlers(){
    // pause on hover/focus
    this.root.addEventListener('mouseenter', ()=>this.pause());
    this.root.addEventListener('mouseleave', ()=>this._maybeStart());
    this.root.addEventListener('focusin', ()=>this.pause());
    this.root.addEventListener('focusout', ()=>this._maybeStart());
  }

  _maybeStart(){ if(this.opts.autoplay && this.items.length > 1) this.play(); }

  play(){ this.stop(); this.timer = setInterval(()=>{ this.next(); }, this.opts.interval); }
  stop(){ if(this.timer){ clearInterval(this.timer); this.timer = null; } }

  pause(){ this.stop(); }

  destroy(){ this.stop(); window.removeEventListener('resize', this._boundResize); this.track.removeEventListener('transitionend', this.onTransitionEnd); this.root.innerHTML=''; }
}

function escapeHTML(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

export default Carousel;
