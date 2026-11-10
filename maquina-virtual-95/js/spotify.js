/* Spotify: player de verdade via embed oficial (precisa de internet).
   Cole o link de uma playlist, álbum, música ou podcast; o último link fica salvo neste navegador. */
(function(){
'use strict';
var VM=window.VM,$=VM.$;

VM.PAL.S='#1db954';
VM.MAPS.spotify=['.....KKKKKK.....','...KKSSSSSSKK...','..KSSSSSSSSSSK..','.KSSSUUUUUUSSSK.','KSSUUSSSSSSUUSSK','KSSSSSSSSSSSSSSK','KSSSSUUUUUUSSSSK','KSSSUUSSSSUUSSSK','KSSSSSSSSSSSSSSK','.KSSSSUUUUSSSSK.','.KSSUUSSSSUUSSK.','..KSSSSSSSSSSK..','...KKSSSSSSKK...','.....KKKKKK.....'];

var PRESETS=[
 ['Lo-fi','https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn'],
 ['Top Hits','https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M']
];
var KEY='vm95-spotify';

/* aceita link do site, link com idioma (intl-pt) ou URI "spotify:tipo:id" */
function parse(v){
  v=(v||'').trim();
  var m=v.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/)||v.match(/^spotify:(track|album|playlist|artist|episode|show):([A-Za-z0-9]+)$/);
  return m?{type:m[1],id:m[2]}:null;
}

VM.APPS.spotify={title:'Spotify',short:'Spotify',icon:'spotify',w:400,h:540,minw:320,minh:380,build:function(wb){
  wb.classList.add('spt');
  var h='<div class="spt-top"><div class="spt-pre">';
  PRESETS.forEach(function(p,i){h+='<button type="button" class="b95" data-p="'+i+'">'+p[0]+'</button>'});
  h+='</div><div class="spt-in"><input class="sunk" type="text" spellcheck="false" autocomplete="off" placeholder="Cole o link do Spotify aqui" aria-label="Link do Spotify"><button type="button" class="b95 go">Tocar</button></div></div>'+
     '<div class="spt-view"><iframe title="Spotify" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div>'+
     '<div class="status"><span class="msg">Cole um link de playlist, álbum ou música.</span><a class="open" target="_blank" rel="noopener noreferrer" hidden>Abrir no Spotify</a></div>';
  wb.innerHTML=h;
  var inp=$('input',wb),frame=$('iframe',wb),msg=$('.msg',wb),open=$('.open',wb);

  function load(url,remember){
    var r=parse(url);
    if(!r){msg.textContent='Link inválido. Copie o link em "Compartilhar" no Spotify.';return false}
    frame.src='https://open.spotify.com/embed/'+r.type+'/'+r.id+'?utm_source=generator';
    open.href='https://open.spotify.com/'+r.type+'/'+r.id;open.hidden=false;
    inp.value=url;msg.textContent='Carregando... (precisa de internet)';
    if(remember){try{localStorage.setItem(KEY,url)}catch(e){}}
    return true;
  }
  frame.addEventListener('load',function(){if(frame.getAttribute('src'))msg.textContent='Pronto. Aperte play no player.'});

  $('.spt-pre',wb).addEventListener('click',function(e){var b=e.target.closest('button');if(b)load(PRESETS[+b.dataset.p][1],true)});
  $('.go',wb).addEventListener('click',function(){load(inp.value,true)});
  inp.addEventListener('keydown',function(e){if(e.key==='Enter')load(inp.value,true)});

  var saved=null;try{saved=localStorage.getItem(KEY)}catch(e){}
  load(saved&&parse(saved)?saved:PRESETS[0][1],false);
}};
})();
