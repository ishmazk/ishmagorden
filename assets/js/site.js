(function(){
var t=document.querySelector('.menu-toggle'),n=document.querySelector('.nav');
if(t&&n){t.addEventListener('click',function(){var o=n.classList.toggle('open');t.setAttribute('aria-expanded',o);});}
var f=document.getElementById('finder');
if(f){f.addEventListener('input',function(){var q=f.value.toLowerCase();document.querySelectorAll('[data-row]').forEach(function(r){r.style.display=r.getAttribute('data-row').indexOf(q)>-1?'':'none';});document.querySelectorAll('[data-grp]').forEach(function(g){var any=g.querySelector('[data-row]:not([style*="none"])');g.style.display=any?'':'none';});});}
var links=document.querySelectorAll('a[data-lb]');
if(links.length&&window.HTMLDialogElement){
var d=document.createElement('dialog');d.className='lb';d.innerHTML='<button type="button" aria-label="Tutup">&times;</button><figure><img alt=""><figcaption></figcaption></figure>';document.body.appendChild(d);
var im=d.querySelector('img'),cp=d.querySelector('figcaption');
d.querySelector('button').addEventListener('click',function(){d.close();});
d.addEventListener('click',function(e){if(e.target===d)d.close();});
links.forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();im.src=a.href;im.alt=a.getAttribute('data-alt')||'';cp.textContent=a.getAttribute('data-cap')||'';d.showModal();});});
}
})();
