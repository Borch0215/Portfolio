if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initContact);
} else {
  initContact();
}

function initContact(){
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', async (e)=>{
    e.preventDefault(); const fd = new FormData(form); const payload = Object.fromEntries(fd.entries());
    if(!payload.name||!payload.email||!payload.message){ alert('Rellena todos los campos'); return; }
    try{
      const res = await fetch('../server/php/api/contact.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const json = await res.json(); if(json.success){ alert('Mensaje enviado'); form.reset(); } else { alert('Error: '+(json.error||'---')) }
    }catch(err){ alert('Nota: Sin backend PHP, el mensaje no se guardará. Pero puedes ver el formulario funcionando.'); }
  });
}

export {};
