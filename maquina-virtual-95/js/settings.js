/* Configurações: escolher o papel de parede. A escolha fica salva neste navegador.
   Para adicionar um papel de parede novo: coloque a imagem em assets/papeis/, uma miniatura (240x135)
   em assets/papeis/miniaturas/ e acrescente uma linha na lista WALLPAPERS abaixo. */
(function(){
'use strict';
var VM=window.VM,$=VM.$,desk=VM.desk;
var KEY='vm95-wallpaper';

var WALLPAPERS=[
 {id:'synthwave',name:'Pôr do sol synthwave',src:'assets/papeis/synthwave.png',thumb:'assets/papeis/miniaturas/synthwave.jpg'},
 {id:'cidade-noite',name:'Cidade pixel à noite',src:'assets/papeis/cidade-noite.png',thumb:'assets/papeis/miniaturas/cidade-noite.jpg'},
 {id:'praia-sol',name:'Praia no entardecer',src:'assets/papeis/praia-sol.png',thumb:'assets/papeis/miniaturas/praia-sol.jpg'},
 {id:'aurora-lago',name:'Aurora no lago',src:'assets/papeis/aurora-lago.png',thumb:'assets/papeis/miniaturas/aurora-lago.jpg'},
 {id:'colina-ceu',name:'Colina e céu azul',src:'assets/papeis/colina-ceu.png',thumb:'assets/papeis/miniaturas/colina-ceu.jpg'},
 {id:'espaco-saturno',name:'Espaço e planeta',src:'assets/papeis/espaco-saturno.png',thumb:'assets/papeis/miniaturas/espaco-saturno.jpg'}
];
var DEFAULT_ID='synthwave';

function find(id){for(var i=0;i<WALLPAPERS.length;i++)if(WALLPAPERS[i].id===id)return WALLPAPERS[i];return null}
function current(){var s=null;try{s=localStorage.getItem(KEY)}catch(e){}return find(s)?s:DEFAULT_ID}
function apply(id,remember){
  var w=find(id)||find(DEFAULT_ID);
  desk.style.backgroundImage="url('"+w.src+"')";
  desk.style.backgroundPosition=w.pos||'center';
  if(remember){try{localStorage.setItem(KEY,w.id)}catch(e){}}
  document.dispatchEvent(new CustomEvent('vm95:wallpaper',{detail:{id:w.id,name:w.name,user:!!remember}}));
  return w;
}
apply(current(),false);

VM.APPS.settings={title:'Configurações',short:'Configurações',icon:'pc',w:460,h:560,minw:340,minh:380,build:function(wb){
  wb.classList.add('cfg');
  var h='<div class="cfg-prev"><div class="cfg-mon"><div class="cfg-scr"></div></div></div>'+
        '<div class="cfg-lbl">Papel de parede:</div><div class="cfg-list sunk" role="listbox" aria-label="Papéis de parede">';
  WALLPAPERS.forEach(function(w){
    h+='<button type="button" class="wp" role="option" data-id="'+w.id+'"><img alt="" draggable="false" src="'+w.thumb+'"><span>'+w.name+'</span></button>';
  });
  h+='</div><div class="status"><span class="msg"></span></div>';
  wb.innerHTML=h;
  var scr=$('.cfg-scr',wb),msg=$('.msg',wb),btns=wb.querySelectorAll('.wp');
  function mark(id){
    var w=find(id);
    scr.style.backgroundImage="url('"+w.thumb+"')";
    btns.forEach(function(b){var on=b.dataset.id===id;b.classList.toggle('sel',on);b.setAttribute('aria-selected',String(on))});
    msg.textContent='Papel de parede: '+w.name;
  }
  mark(current());
  $('.cfg-list',wb).addEventListener('click',function(e){
    var b=e.target.closest('.wp');if(!b)return;
    apply(b.dataset.id,true);mark(b.dataset.id);
  });
}};
})();
