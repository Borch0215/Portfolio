// Mobile dropdown menu for small screens
// Builds menu from existing desktop `.nav-list` and provides accessible behavior.
const toggle = document.getElementById('menu-dropdown-toggle');
const panel = document.getElementById('menu-dropdown');

if (toggle && panel) {
  const desktopList = document.querySelector('.nav-list');
  let menuItems = [];

  function buildMenu() {
    panel.innerHTML = '';
    const list = document.createElement('ul');
    list.className = 'menu-list';

    if (desktopList) {
      // clone links from desktop nav and set stagger delays
      desktopList.querySelectorAll('a').forEach((a, i) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = a.getAttribute('href') || '#';
        link.textContent = a.textContent.trim();
        link.setAttribute('role', 'menuitem');
        link.tabIndex = 0;
        li.appendChild(link);
        li.style.setProperty('--delay', `${i * 60}ms`);
        list.appendChild(li);
      });
    } else {
      // fallback static items
      ['Inicio','Sobre mí','Skills','Proyectos','Reseñas','Contacto'].forEach((t, i) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = t;
        link.setAttribute('role', 'menuitem');
        link.tabIndex = 0;
        li.appendChild(link);
        li.style.setProperty('--delay', `${i * 60}ms`);
        list.appendChild(li);
      });
    }

    panel.appendChild(list);
    const footer = document.createElement('div');
    footer.className = 'menu-footer';
    panel.appendChild(footer);

    menuItems = Array.from(panel.querySelectorAll('a[role="menuitem"]').length ? panel.querySelectorAll('a[role="menuitem"]') : panel.querySelectorAll('a'));
  }

  function openMenu() {
    if (panel.classList.contains('open')) return;
    buildMenu();
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    // small delay for CSS transition
    requestAnimationFrame(() => panel.classList.add('open'));
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('click', onDocClick);
    // focus first link
    setTimeout(() => { if (menuItems[0]) menuItems[0].focus(); }, 180);
  }

  function closeMenu() {
    if (!panel.classList.contains('open')) return;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('click', onDocClick);
    // wait for transition then hide
    setTimeout(() => { panel.hidden = true; }, 240);
    toggle.focus();
  }

  function toggleMenu() {
    if (panel.classList.contains('open')) closeMenu(); else openMenu();
  }

  function onDocClick(e) {
    if (!panel.contains(e.target) && e.target !== toggle) closeMenu();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') return closeMenu();
    const KEY = e.key;
    const active = document.activeElement;
    const idx = menuItems.indexOf(active);
    if (KEY === 'ArrowDown') {
      e.preventDefault();
      const next = (idx + 1) % menuItems.length; menuItems[next].focus();
    } else if (KEY === 'ArrowUp') {
      e.preventDefault();
      const prev = (idx - 1 + menuItems.length) % menuItems.length; menuItems[prev].focus();
    } else if (KEY === 'Tab') {
      // trap focus inside panel
      if (menuItems.length === 0) return;
      if (e.shiftKey && active === menuItems[0]) { e.preventDefault(); menuItems[menuItems.length-1].focus(); }
      else if (!e.shiftKey && active === menuItems[menuItems.length-1]) { e.preventDefault(); menuItems[0].focus(); }
    }
  }

  // keyboard & pointer activation for toggle
  toggle.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
  toggle.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); } });

  // delegate clicks inside menu to close when link activated
  panel.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) {
      // allow default navigation; close menu on click
      closeMenu();
    }
  });

  // responsive: close menu on resize > 720px to avoid stuck state
  window.addEventListener('resize', () => { if (window.innerWidth > 720) closeMenu(); });
}
