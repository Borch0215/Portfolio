// preloader: ensure visible at least 3s and until window.load
(async function(){
  const pre = document.getElementById('preloader');
  if(!pre) return;

  const minDuration = new Promise(r => setTimeout(r, 3000));
  const windowLoad = new Promise(resolve => window.addEventListener('load', resolve, { once: true }));

  await Promise.all([minDuration, windowLoad]);

  pre.classList.add('fade-out');
  pre.addEventListener('transitionend', () => pre.remove());
})();