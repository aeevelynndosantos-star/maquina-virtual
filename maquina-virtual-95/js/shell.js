/* Área de trabalho, menu Iniciar, barra de tarefas, boot e desligar. */
(function(){
'use strict';
var VM=window.VM,$=VM.$,desk=VM.desk,menu=VM.menu,startBtn=VM.startBtn,ico=VM.ico,openApp=VM.openApp,coarse=VM.coarse;

/* ---------- ícones da área de trabalho ---------- */
var DESK=[['Meu Computador','pc','about'],['Meus Documentos','folder','docs'],['Rádio','radio','radio'],['Instagram.exe','insta','insta'],['Internet BBS','bbs','bbs'],['Spotify','spotify','spotify'],['Paint','paint','paint'],['Bloco de Notas','note','notepad'],['Word','word','word'],['Lixeira','bin','bin']];
var iconsEl=$('#icons');
DESK.forEach(function(d){
  var b=document.createElement('button');b.type='button';b.className='dicon';b.innerHTML=ico(d[1],36)+'<span class="l"></span>';$('.l',b).textContent=d[0];
  b.addEventListener('click',function(e){iconsEl.querySelectorAll('.dicon').forEach(function(x){x.classList.toggle('sel',x===b)});if(coarse||e.detail===2)openApp(d[2])});
  b.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();openApp(d[2])}});
  iconsEl.appendChild(b);
});
iconsEl.addEventListener('pointerdown',function(e){if(e.target===iconsEl)iconsEl.querySelectorAll('.dicon').forEach(function(x){x.classList.remove('sel')})});
$('#tray-spk').innerHTML=VM.SPK;
[['radio','radio','Rádio'],['insta','insta','Instagram'],['bbs','bbs','BBS']].forEach(function(q){
  var b=document.createElement('button');b.type='button';b.className='qbtn';b.title=q[2];b.setAttribute('aria-label',q[2]);b.innerHTML=ico(q[0],20);
  b.addEventListener('click',function(){openApp(q[1])});$('#ql').appendChild(b);
});

/* ---------- menu iniciar (estilo Windows 95) ---------- */
var ml=$('#mlist'),sm=$('#submenu');
var PROGS=[['Rádio','radio','radio'],['Instagram.exe','insta','insta'],['Google BBS','bbs','bbs'],['Spotify','spotify','spotify'],['Paint','paint','paint'],['Bloco de Notas','note','notepad'],['Word','word','word']];
var MENU=[['Windows Update','win',null],null,['Programas','folder','progs'],['Favoritos','folder','docs'],['Documentos','folder','docs'],['Configurações','pc','settings'],['Localizar','globe','bbs'],['Ajuda','help','help'],['Mascotes: ligar/desligar','pet','mascots'],['Executar...','win','run'],null,['Desligar...','pc','off']];
MENU.forEach(function(m){
  if(!m){ml.appendChild(document.createElement('hr'));return}
  var b=document.createElement('button');b.type='button';b.className='mnu';b.innerHTML=ico(m[1],22)+'<span></span>'+(m[2]==='progs'?'<span class="ar">▶</span>':'');
  b.firstElementChild.nextSibling.textContent=m[0];
  b.addEventListener('click',function(e){
    e.stopPropagation();
    if(m[2]==='progs'){showSub(b);return}
    sm.hidden=true;
    if(m[2]==='off'){shutdown();return}
    closeMenu();
    if(m[2]==='mascots'){VM.mascots.toggle();return}
    if(m[2])openApp(m[2]);
  });
  ml.appendChild(b);
});
function showSub(anchor){
  sm.innerHTML='';
  PROGS.forEach(function(p){var s=document.createElement('button');s.type='button';s.className='mnu';s.innerHTML=ico(p[1],20)+'<span></span>';s.lastChild.textContent=p[0];s.addEventListener('click',function(){closeMenu();openApp(p[2])});sm.appendChild(s)});
  sm.style.bottom=Math.max(0,menu.clientHeight-anchor.offsetTop-anchor.offsetHeight-6)+'px';
  sm.hidden=false;
}
function closeMenu(){menu.hidden=true;sm.hidden=true;startBtn.setAttribute('aria-expanded','false');startBtn.classList.remove('on')}
startBtn.addEventListener('click',function(e){e.stopPropagation();menu.hidden=!menu.hidden;sm.hidden=true;startBtn.classList.toggle('on',!menu.hidden);startBtn.setAttribute('aria-expanded',String(!menu.hidden))});
document.addEventListener('pointerdown',function(e){if(!menu.hidden&&!menu.contains(e.target)&&!startBtn.contains(e.target))closeMenu()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu()});
function tick(){$('#clock').textContent=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
tick();setInterval(tick,10000);

/* ---------- boot, desligar ---------- */
var bootEl=$('#boot'),offEl=$('#offscr'),led=$('#led'),sub=$('#vm-sub'),bootTimer=null,logTimer=null;
var BOOT=['Máquina Virtual BIOS v1.0','Memória: 32768 KB ... OK','Detectando teclado ... OK','Detectando disco ... CD-ROM ... OK','Carregando rádio ... OK','Carregando câmera ... OK','Acordando o NS ...','','Iniciando Windows 95...'];
function closeAll(){Array.from(VM.wins.keys()).forEach(VM.closeWin)}
function openDefaults(){
  VM.mascots.show();
  setTimeout(function(){VM.say('oi! eu sou o NS. bem-vindo(a)!','ns')},500);
  setTimeout(function(){VM.say('clica nos ícones, ou me arrasta!','ns')},3600);
}
function boot(){
  closeAll();closeMenu();VM.bootAt=Date.now();offEl.hidden=true;VM.mascots.hide();
  led.classList.remove('off');sub.textContent='ligada';bootEl.classList.remove('gone');
  var log=$('#bootlog'),i=0,done=false;log.textContent='';
  clearInterval(logTimer);logTimer=setInterval(function(){if(i<BOOT.length){log.textContent+=BOOT[i++]+'\n'}else clearInterval(logTimer)},260);
  function fin(){if(done)return;done=true;clearTimeout(bootTimer);clearInterval(logTimer);bootEl.classList.add('gone');openDefaults()}
  bootEl.onclick=fin;bootTimer=setTimeout(fin,2800);
}
function shutdown(){
  closeAll();closeMenu();clearTimeout(bootTimer);clearInterval(logTimer);VM.mascots.hide();
  bootEl.classList.add('gone');offEl.hidden=false;led.classList.add('off');sub.textContent='desligada';
}
$('#vm-reset').addEventListener('click',boot);
$('#vm-off').addEventListener('click',shutdown);
$('#power').addEventListener('click',boot);
boot();
})();
