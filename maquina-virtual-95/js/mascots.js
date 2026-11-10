/* Mascote NS: arraste, clique, dê dois cliques. Ele dança quando o rádio toca e dorme se ficar parado. */
(function(){
'use strict';
var VM=window.VM,desk=VM.desk;
var DEF={id:'ns',name:'NS',src:'assets/ns.png',ratio:1603/1048,lines:[
  'oi! eu sou o NS ✦','psiu... tira uma foto no Instagram.exe!','bota uma música no rádio?','me arrasta pela tela!',
  'já olhou o Google BBS hoje?','abre o Paint e desenha pra gente.','quer trocar o fundo? abre Configurações.','dois cliques e eu giro!',
  'tá tarde, hein... ☾','eu vigio a tela pra você.']};
var TICKLE=['hehe, faz cócegas!','nyaa~ ✧','de novo, de novo!','☆ ☆ ☆'];
var POS_KEY='vm95-ns-pos';
var el,bubble,shown=false,lastSay=0,bubbleTimer=null,sleepTimer=null,clicks=0,musicSaid=false;

function pick(a){return a[Math.floor(Math.random()*a.length)]}
function loadPos(){try{var p=JSON.parse(localStorage.getItem(POS_KEY));if(p&&isFinite(p.x)&&isFinite(p.y))return p}catch(e){}return null}
function savePos(){try{localStorage.setItem(POS_KEY,JSON.stringify({x:el.offsetLeft/desk.clientWidth,y:el.offsetTop/desk.clientHeight}))}catch(e){}}
function play(cls,ms){el.classList.remove('jump','spin');void el.offsetWidth;el.classList.add(cls);setTimeout(function(){el.classList.remove(cls)},ms)}
function wake(){
  el.classList.remove('sleep');clearTimeout(sleepTimer);
  sleepTimer=setTimeout(function(){if(shown&&!document.body.classList.contains('music-on')){el.classList.add('sleep');say('zzz...')}},60000);
}
function build(){
  el=document.createElement('div');
  el.className='mascot';el.id='m-'+DEF.id;el.hidden=true;el.tabIndex=0;
  el.setAttribute('role','button');el.setAttribute('aria-label','Mascote '+DEF.name+': clique para conversar, arraste para mover');
  el.innerHTML='<div class="bubble" hidden aria-live="polite"></div><img alt="" draggable="false" src="'+DEF.src+'"><span class="mname">'+DEF.name+'</span>';
  bubble=el.querySelector('.bubble');
  desk.appendChild(el);
  var sx=0,sy=0,ox=0,oy=0,lx=0,moved=false,down=false;
  el.addEventListener('pointerdown',function(e){
    down=true;moved=false;sx=lx=e.clientX;sy=e.clientY;ox=el.offsetLeft;oy=el.offsetTop;
    el.setPointerCapture(e.pointerId);el.classList.add('held');wake();
  });
  el.addEventListener('pointermove',function(e){
    if(!down)return;
    var dx=e.clientX-sx,dy=e.clientY-sy;
    if(!moved&&Math.abs(dx)+Math.abs(dy)<5)return;
    if(!moved){moved=true;say('wheee!')}
    el.style.left=Math.min(Math.max(ox+dx,-20),desk.clientWidth-el.offsetWidth+20)+'px';
    el.style.top=Math.min(Math.max(oy+dy,0),desk.clientHeight-el.offsetHeight+10)+'px';
    el.style.setProperty('--tilt',Math.max(-14,Math.min(14,(e.clientX-lx)*1.4))+'deg');lx=e.clientX;
  });
  function up(){
    if(!down)return;down=false;el.classList.remove('held');
    if(moved){savePos();play('jump',650);return}
    clicks++;
    if(clicks%5===0){play('jump',650);say(pick(TICKLE))}else say(pick(DEF.lines));
  }
  el.addEventListener('pointerup',up);
  el.addEventListener('pointercancel',function(){down=false;el.classList.remove('held')});
  el.addEventListener('dblclick',function(){play('spin',800);say(pick(['uhuu!','giiira!','de novo!','☆ ☆ ☆']))});
  el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();wake();play('jump',650);say(pick(DEF.lines))}});
}
function say(text){
  if(!shown||el.hidden)return;
  bubble.textContent=text;bubble.hidden=false;lastSay=Date.now();
  clearTimeout(bubbleTimer);bubbleTimer=setTimeout(function(){bubble.hidden=true},3800);
}
function place(){
  var dw=desk.clientWidth,dh=desk.clientHeight,small=dw<560;
  var w=small?84:130,h=Math.round(w*DEF.ratio);
  el.style.width=w+'px';
  var p=loadPos();
  if(p){
    el.style.left=Math.round(Math.min(Math.max(p.x*dw,-20),dw-w+20))+'px';
    el.style.top=Math.round(Math.min(Math.max(p.y*dh,0),dh-h+10))+'px';
  }else if(small){el.style.left=(dw-w-6)+'px';el.style.top=Math.max(40,Math.round(dh*.4))+'px'}
  else{el.style.left=Math.round(dw*.62)+'px';el.style.top=Math.max(40,dh-h-50)+'px'}
}
function show(){shown=true;place();el.hidden=false;wake()}
function hide(){shown=false;clearTimeout(sleepTimer);el.hidden=true;el.classList.remove('sleep');bubble.hidden=true}

build();
window.addEventListener('resize',function(){if(shown)place()});
document.addEventListener('vm95:wallpaper',function(e){if(e.detail&&e.detail.user){wake();play('jump',650);say('fundo novo: '+e.detail.name+'!')}});
new MutationObserver(function(){
  var on=document.body.classList.contains('music-on');
  if(on){el.classList.remove('sleep');if(!musicSaid&&shown){musicSaid=true;say('♪ bora dançar!')}}else musicSaid=false;
}).observe(document.body,{attributes:true,attributeFilter:['class']});
setInterval(function(){if(shown&&!el.classList.contains('sleep')&&Date.now()-lastSay>28000)say(pick(DEF.lines))},9000);
VM.say=function(t){say(t)};
VM.mascots={show:show,hide:hide,toggle:function(){shown?hide():show()},visible:function(){return shown},place:place};
})();
