(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var screenEl=$('#screen'),desk=$('#desk'),tasks=$('#tasks'),menu=$('#menu'),startBtn=$('#start');
var zTop=10,uid=0,wins=new Map();
var VM=window.VM={bootAt:Date.now(),ICONS:{}};
var coarse=window.matchMedia('(pointer:coarse)').matches;
var PAL={K:'#1d2040',W:'#ffffff',C:'#dcdcdc',G:'#808080',B:'#2d6fd6',L:'#9ccbf5',Y:'#f2c744',H:'#ffe58a',O:'#d9622b',D:'#a8431c',R:'#d33a2c',N:'#3c9a2e',P:'#e86aa8',U:'#0a0a0a',V:'#3cff6e'};
var MAPS={
 pc:['................','.KKKKKKKKKKKKK..','.KCCCCCCCCCCCK..','.KCBBBBBBBBBCK..','.KCBLLBBBBBBCK..','.KCBLBBBBNNBCK..','.KCBBBBBNNNNCK..','.KCBBBNNNNNNCK..','.KCCCCCCCCCCCK..','.KKKKKKKKKKKKK..','.....KCCCK......','..KKKKKKKKKKK...','..KCCCCCCCCCK...','..KKKKKKKKKKK...'],
 folder:['................','.KKKKK..........','.KHHHHKKKKKKKK..','.KHHHHHHHHHHHK..','.KHYYYYYYYYYYK..','.KYYYYYYYYYYYK..','.KYYYYYYYYYYYK..','.KYYYYYYYYYYYK..','.KYYYYYYYYYYYK..','.KYYYYYYYYYYYK..','.KYYYYYYYYYYYK..','.KKKKKKKKKKKKK..'],
 globe:['.....KKKKKK.....','...KKBBBBBBKK...','..KBBLLBBBBBBK..','.KBLLNNNBBBBBBK.','.KBBNNNNNBBBNNK.','KBBBBNNNNBBBNNNK','KBBBBBNNBBBBNNNK','KBBBBBBBBBBBBNNK','KBBBBBBBBBBBBBBK','KBBBBBBNNBBBBBBK','.KBBBBNNNNBBBBK.','.KBBBBBNNNBBBBK.','..KBBBBBBBBBBK..','...KKBBBBBBKK...','.....KKKKKK.....'],
 note:['..KKKKKKKKK.....','..KWWWWWWWKK....','..KWWWWWWWKCK...','..KWWWWWWWKKKK..','..KWBBBBBBWWWK..','..KWWWWWWWWWWK..','..KWBBBBBBBBWK..','..KWWWWWWWWWWK..','..KWBBBBBBWWWK..','..KWWWWWWWWWWK..','..KWBBBBBBBWWK..','..KWWWWWWWWWWK..','..KKKKKKKKKKKK..'],
 paint:['.....KKKKKK.....','...KKCCCCCCKK...','..KCCCCCCCCCCK..','.KCCRRCCCCNNCCK.','.KCCRRCCCCNNCCK.','KCCCCCCCCCCCCCCK','KCCBBCCCCCCCCCCK','KCCBBCCCCCCCCCCK','.KCCCCCCCCKKCCK.','.KCYYCCCCCKKCCK.','..KCYYCCCCCCCK..','...KKCCCCCCKK...','.....KKKKKK.....'],
 bin:['......KKKK......','...KKKKKKKKKK...','...KCCCCCCCCK...','...KKKKKKKKKK...','....KCNCCNCK....','....KCNCCNCK....','....KCCNNCCK....','....KCNCCNCK....','....KCNCCNCK....','....KCCCCCCK....','....KKKKKKKK....'],
 bbs:['................','.KKKKKKKKKKKKK..','.KUUUUUUUUUUUK..','.KUVVVUVVUUUUK..','.KUUUUUUUUUUUK..','.KUVVVVVUVVUUK..','.KUUUUUUUUUUUK..','.KUVVUUUUUUUUK..','.KUUUUUUUUUUUK..','.KKKKKKKKKKKKK..','.....KCCCK......','..KKKKKKKKKKK...','..KCCCCCCCCCK...','..KKKKKKKKKKK...'],
 insta:['................','...KKKKKKKKKK...','..KPPPPPPPPPPK..','..KPOOOOOOOOPK..','..KPOWWWWWWOPK..','..KPOWKKKKWOPK..','..KPOWKYYKWOPK..','..KPOWKKKKWOPK..','..KPOWWWWWWOPK..','..KPOOOOOOOOPK..','..KPPPPPPPPPPK..','...KKKKKKKKKK...'],
 pet:['................','..K..........K..','..KK........KK..','..KWKKKKKKKKWK..','..KWWWWWWWWWWK..','..KWKKWWWWKKWK..','..KWKYKWWKYKWK..','..KWKKWWWWKKWK..','..KWWWWPPWWWWK..','...KWWWWWWWWK...','....KKKKKKKK....','...KWWWWWWWWK...','...KWKK..KKWK...','....KK....KK....'],
 mine:['.......K........','...K...K...K....','....K..K..K.....','.....KKKKK......','.KK.KKKKKKK.KK..','..KKKKWKKKKKK...','KKKKKKWKKKKKKKK.','..KKKKKKKKKKK...','.KK.KKKKKKK.KK..','.....KKKKK......','....K..K..K.....','...K...K...K....','.......K........'],
 win:['................','.KKKKKKKKKKKKKK.','.KBBBBBBBBBBBKK.','.KCCCCCCCCCCCKK.','.KCWWWWWWWWWCK..','.KCWWWWWWWWWCK..','.KCWWWWWWWWWCK..','.KCWWWWWWWWWCK..','.KCCCCCCCCCCCK..','.KKKKKKKKKKKKK..'],
 help:['.....KKKKKK.....','...KKRRRRRRKK...','..KRRRWWWRRRRK..','..KRRRRRWWRRRK..','..KRRRRWWRRRRK..','..KRRRRWRRRRRK..','..KRRRRRRRRRRK..','..KRRRRWRRRRRK..','...KKRRRRRRKK...','.....KKKKKK.....']
};
var cache={};
function pxsvg(n){
  if(cache[n])return cache[n];
  var rows=MAPS[n],out='<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">';
  rows.forEach(function(row,y){var x=0;while(x<16){var ch=row[x];if(!ch||ch==='.'){x++;continue}var s=x;while(row[x]===ch&&x<16)x++;out+='<rect x="'+s+'" y="'+y+'" width="'+(x-s)+'" height="1" fill="'+PAL[ch]+'"/>'}});
  return(cache[n]=out+'</svg>');
}
function ico(n,s){s=s||32;var u=VM.ICONS&&VM.ICONS[n];return '<span class="i" style="width:'+s+'px;height:'+s+'px">'+(u?'<img src="'+u+'" alt="" draggable="false">':pxsvg(n))+'</span>'}
var SPK='<svg viewBox="0 0 16 16"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor"/><path d="M11 5c2 1.5 2 4.5 0 6M13 3c3.5 2.5 3.5 7.5 0 10" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>';

/* ---------- janelas ---------- */
function drag(el,handle,skip){
  handle.addEventListener('pointerdown',function(e){
    if((skip&&skip(e))||el.classList.contains('max'))return;
    var sx=e.clientX-el.offsetLeft,sy=e.clientY-el.offsetTop;
    handle.setPointerCapture(e.pointerId);
    function mv(ev){
      el.style.left=Math.min(Math.max(ev.clientX-sx,-el.offsetWidth+90),desk.clientWidth-90)+'px';
      el.style.top=Math.min(Math.max(ev.clientY-sy,0),desk.clientHeight-24)+'px';
    }
    function up(){handle.removeEventListener('pointermove',mv);handle.removeEventListener('pointerup',up);handle.removeEventListener('pointercancel',up)}
    handle.addEventListener('pointermove',mv);handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',up);
  });
}
function focusWin(id){
  var r=wins.get(id);if(!r)return;
  if(r.el.hidden)r.el.hidden=false;
  r.el.style.zIndex=++zTop;
  wins.forEach(function(o,k){o.el.classList.toggle('active',k===id);o.btn.classList.toggle('on',k===id&&!o.el.hidden)});
}
function closeWin(id){
  var r=wins.get(id);if(!r)return;
  if(r.onclose)r.onclose();
  r.el.remove();r.btn.remove();wins.delete(id);
  var last=null;wins.forEach(function(o,k){if(!o.el.hidden)last=k});
  if(last)focusWin(last);
}
function minWin(r){r.el.hidden=true;r.btn.classList.remove('on');r.el.classList.remove('active')}
function createWindow(o){
  var key=o.key||('w'+(++uid));
  if(wins.has(key)){focusWin(key);return wins.get(key)}
  var dw=desk.clientWidth,dh=desk.clientHeight,w=Math.min(o.w,dw-8),h=Math.min(o.h,dh-8),n=wins.size%6;
  var x=o.x!=null?o.x:(dw>=900?190:40)+n*28,y=o.y!=null?o.y:20+n*26;
  x=Math.max(0,Math.min(x,dw-w));y=Math.max(0,Math.min(y,dh-h));
  var el=document.createElement('div');
  el.className='win';el.setAttribute('role','dialog');el.setAttribute('aria-label',o.title);
  el.style.cssText='left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px';
  el.innerHTML='<div class="tb">'+ico(o.icon,16)+'<span class="tt"></span><span class="tbtns"><button type="button" class="b-min" aria-label="Minimizar">_</button><button type="button" class="b-max" aria-label="Maximizar">&#9633;</button><button type="button" class="b-x" aria-label="Fechar">&#10005;</button></span></div><div class="wb"></div><div class="grip"></div>';
  $('.tt',el).textContent=o.title;
  desk.appendChild(el);
  if(dw<560)el.classList.add('max');
  var btn=document.createElement('button');
  btn.type='button';btn.className='tbtn';btn.innerHTML=ico(o.icon,16)+'<span class="t"></span>';
  $('.t',btn).textContent=o.short||o.title;tasks.appendChild(btn);
  var rec={el:el,btn:btn,key:key};wins.set(key,rec);
  var tb=$('.tb',el);
  el.addEventListener('pointerdown',function(){if(!el.classList.contains('active')||+el.style.zIndex!==zTop)focusWin(key)},true);
  drag(el,tb,function(e){return !!e.target.closest('button')});
  $('.grip',el).addEventListener('pointerdown',function(e){
    e.preventDefault();var g=e.currentTarget;g.setPointerCapture(e.pointerId);
    var sw=el.offsetWidth,sh=el.offsetHeight,px=e.clientX,py=e.clientY,mw=o.minw||240,mh=o.minh||150;
    function mv(ev){
      el.style.width=Math.min(Math.max(mw,sw+ev.clientX-px),desk.clientWidth-el.offsetLeft)+'px';
      el.style.height=Math.min(Math.max(mh,sh+ev.clientY-py),desk.clientHeight-el.offsetTop)+'px';
    }
    function up(){g.removeEventListener('pointermove',mv);g.removeEventListener('pointerup',up);g.removeEventListener('pointercancel',up)}
    g.addEventListener('pointermove',mv);g.addEventListener('pointerup',up);g.addEventListener('pointercancel',up);
  });
  function toggleMax(){el.classList.toggle('max')}
  tb.addEventListener('dblclick',function(e){if(!e.target.closest('button'))toggleMax()});
  $('.b-max',el).addEventListener('click',toggleMax);
  $('.b-min',el).addEventListener('click',function(){minWin(rec)});
  $('.b-x',el).addEventListener('click',function(){closeWin(key)});
  btn.addEventListener('click',function(){if(!el.hidden&&el.classList.contains('active'))minWin(rec);else focusWin(key)});
  if(o.build)o.build($('.wb',el),rec);
  focusWin(key);return rec;
}
var APPS={};
function openApp(k,extra){var a=APPS[k];if(!a)return;var o={key:k};for(var p in a)o[p]=a[p];for(var q in (extra||{}))o[q]=extra[q];return createWindow(o)}
function pad2(n){return String(n).padStart(2,'0')}
function hms(d){return pad2(d.getHours())+':'+pad2(d.getMinutes())+':'+pad2(d.getSeconds())}

var FONT={G:[' ### ','#   #','#    ','# ###','#   #',' ### '],o:['     ','     ',' ### ','#   #','#   #',' ### '],g:['     ',' ####','#   #',' ####','    #',' ### '],l:['  #  ','  #  ','  #  ','  #  ','  #  ','  #  '],e:['     ',' ### ','#   #','#### ','#    ',' ### ']};
var LCOL={G:'#3d6bff',o1:'#ff4a3a',o2:'#ffd23f',g:'#3d6bff',l:'#3cff6e',e:'#ff4a3a'};
function bigLogo(){
  var seq=[['G','G'],['o','o1'],['o','o2'],['g','g'],['l','l'],['e','e']],out='';
  for(var r=0;r<6;r++){seq.forEach(function(s){out+='<b style="color:'+LCOL[s[1]]+'">'+FONT[s[0]][r].replace(/#/g,'█').replace(/ /g,'&nbsp;')+'</b>&nbsp;'});out+='\n'}
  return out;
}
var DIAS=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
var MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
var NEWS=['AL GORE INVENTA A INTERNET','MICHAEL JACKSON COMPRA PLUTÃO','REAGAN VISITA A BÉLGICA POR ACIDENTE','PRIMEIRO DEMOCRATA NO ESPAÇO'];
var RESULTS={
 'gato':['gatos-pixelados.html — 1.337 gifs de gatinhos','como-treinar-seu-tamagotchi.txt','receita-de-bolo-de-cenoura.bbs'],
 'lofi':['sonho_lofi.mid — o melhor arquivo de 12 KB','radio-madrugada.pls','como-estudar-ouvindo-chuva.txt'],
 'luz':['por-que-a-luz-do-onibus-fica-dourada.txt','fotografia-pinhole-para-iniciantes.htm','golden-hour.bbs']
};
APPS.bbs={title:'Google BBS Tunnel',short:'BBS',icon:'bbs',w:600,h:470,minw:380,minh:330,build:function(wb,rec){
  wb.classList.add('bbs');
  var d=new Date();
  wb.innerHTML='<div class="bbs-scr" tabindex="-1"></div><label class="bbs-in"><span>&gt;</span><input type="text" spellcheck="false" autocomplete="off" aria-label="Comando"></label><div class="bbs-bar"><span>GOOGLE BBS TUNNEL</span><span>Serial</span><span>Connected</span><span class="lt">Login time 00:00:00</span></div>';
  var scr=$('.bbs-scr',wb),inp=$('input',wb),lt=$('.lt',wb),t0=Date.now(),mode='cmd';
  function add(h){scr.insertAdjacentHTML('beforeend',h);scr.scrollTop=scr.scrollHeight}
  function home(){
    scr.innerHTML='';
    add('<span class="w">Bem-vindo de volta, ANÔNIMO. Hoje é '+DIAS[d.getDay()]+', '+d.getDate()+' de '+MESES[d.getMonth()]+' de '+d.getFullYear()+'!</span>\n');
    add('<div class="logo-g">'+bigLogo()+'</div><div class="netsearch">MECANISMO DE BUSCA</div>');
    var nh='<div class="news"><div class="t">NOTÍCIAS DE HOJE</div><div>';
    NEWS.forEach(function(n){nh+='<div class="l">'+n+'</div>'});
    add(nh+'</div></div>');
    add('<span class="c">\'Google (S)earch\' ou \'Estou com (L)ucky\'? (? = ajuda)</span>\n');
  }
  function run(v){
    var t=v.trim();add('<span class="g">&gt; </span>'+esc(t)+'\n');
    if(mode==='search'){
      mode='cmd';var q=t.toLowerCase(),list=null;
      for(var k in RESULTS)if(q.indexOf(k)>-1)list=RESULTS[k];
      list=list||[q+'.html — 1 resultado (talvez)','nada-encontrado-mas-continue-tentando.txt','voltar-para-o-inicio.bbs'];
      add('<span class="y">Procurando por "'+esc(t)+'"...</span>\n');
      list.forEach(function(r,i){add('<span class="w">'+(i+1)+'.</span> '+esc(r)+'\n')});
      add('\n');return;
    }
    var c=t.toLowerCase();
    if(c==='s'){mode='search';add('<span class="c">O que você quer buscar?</span>\n')}
    else if(c==='l'){var L=['Você foi parar numa página 404 muito acolhedora.','A luz bateu no vidro e a tarde ficou dourada.','Você achou um disquete antigo escrito: "não apagar".'];add('<span class="y">'+L[Math.floor(Math.random()*L.length)]+'</span>\n')}
    else if(c==='?'||c==='help'){add('<span class="c">S</span> buscar   <span class="c">L</span> estou com sorte   <span class="c">N</span> notícias\n<span class="c">C</span> limpar   <span class="c">H</span> início   <span class="c">Q</span> sair\n')}
    else if(c==='n'){NEWS.forEach(function(n){add('<span class="l" style="color:#35e8ff">'+n+'</span>\n')})}
    else if(c==='c'){scr.innerHTML=''}
    else if(c==='h'){home()}
    else if(c==='q'){closeWin('bbs');return}
    else if(c){add('Comando desconhecido. Digite ? para ajuda.\n')}
  }
  function esc(s){return s.replace(/[&<>]/g,function(ch){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]})}
  inp.addEventListener('keydown',function(e){if(e.key==='Enter'){var v=inp.value;inp.value='';run(v)}});
  scr.addEventListener('click',function(){inp.focus()});
  var iv=setInterval(function(){var s=Math.floor((Date.now()-t0)/1000);lt.textContent='Login time '+hms(new Date(2000,0,1,0,0,s))},1000);
  rec.onclose=function(){clearInterval(iv)};
  home();if(!coarse)setTimeout(function(){inp.focus()},50);
}};

/* ---------- pets em pixel art (usados no Instagram) ---------- */
var PETPAL={K:'#14161d',g:'#3f5a3a',h:'#a9b98a',s:'#c8c8c8',W:'#ffffff',y:'#c8c64a',b:'#42a8e0',d:'#1c2a30',B:'#7cc9ee',l:'#6a9a4a'};
var PETS=[
 ['..g........g....','..gg......gg....','.gggggggggggg...','.gKKKKKKKKKKg...','.gKhhhhhhhhKg...','.gKhKhhhhKhKg...','.gKhhhhhhhhKg...','.gKKKKKKKKKKg...','..ggssssssgg....','.gggssssssggg...','.gg.ssssss.gg...','....gg....gg....','....gg....gg....'],
 ['..K..........K.','..KK........KK..','.KWWKKKKKKKKWWK.','.KWWWWWWWWWWWWK.','.KWKKKWWWWKKKWK.','.KWKyKWWWWKyKWK.','.KWKKKWWWWKKKWK.','.KWWWWWPPWWWWWK.','..KWWWWWWWWWWK..','...KWWWWWWWWK...','..KWWWWWWWWWWK..','...WW......WW...','...WW......WW...'],
 ['.....KKKKKK.....','.....KbbbbK.....','..bbbbbbbbbbbb..','.bbddddddddddbb.','.bbdddKddKdddbb.','.bbdddddddddddb.','.bbbbbbbbbbbbbb.','..bBbbbbbbbbBb..','.BBB.BBBBBB.BBB.','.BB...BBBB...BB.','......BB..BB....','......BB..BB....']
];
function drawMap(c,map,s,ox,oy){
  for(var y=0;y<map.length;y++)for(var x=0;x<map[y].length;x++){var ch=map[y][x];if(ch==='.')continue;c.fillStyle=PETPAL[ch]||'#fff';c.fillRect(ox+x*s,oy+y*s,s,s)}
}

/* ---------- bloco de notas, paint ---------- */
var NP_DEFAULT='lista para hoje:\n- terminar o portfólio\n- escolher a trilha sonora\n- tirar foto da luz no ônibus\n\n(este bloco de notas guarda o texto neste navegador)';
APPS.notepad={title:'Sem título - Bloco de Notas',short:'Bloco de Notas',icon:'note',w:380,h:300,build:function(wb){
  wb.classList.add('np');
  wb.innerHTML='<div class="menubar"><button type="button" data-a="new">Novo</button><button type="button" data-a="all">Selecionar tudo</button><button type="button" data-a="date">Hora/Data</button></div><textarea spellcheck="false" aria-label="Texto"></textarea>';
  var ta=$('textarea',wb),saved=null;
  try{saved=localStorage.getItem('vm95-notepad')}catch(e){}
  ta.value=saved!=null?saved:NP_DEFAULT;
  ta.addEventListener('input',function(){try{localStorage.setItem('vm95-notepad',ta.value)}catch(e){}});
  $('.menubar',wb).addEventListener('click',function(e){
    var a=e.target.dataset.a;if(!a)return;
    if(a==='new'){ta.value='';ta.dispatchEvent(new Event('input'))}
    if(a==='all'){ta.focus();ta.select()}
    if(a==='date'){var d=new Date();ta.setRangeText(d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+' '+d.toLocaleDateString('pt-BR'),ta.selectionStart,ta.selectionEnd,'end');ta.focus();ta.dispatchEvent(new Event('input'))}
  });
}};
var COLORS=['#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080','#ffffff','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff'];
APPS.paint={title:'sem título - Paint',short:'Paint',icon:'paint',w:520,h:400,minw:300,minh:260,build:function(wb){
  var sw='';COLORS.forEach(function(c){sw+='<button type="button" style="background:'+c+'" data-c="'+c+'" aria-label="Cor '+c+'"></button>'});
  wb.innerHTML='<div class="menubar"><button type="button" data-a="new">Novo</button><button type="button" data-a="undo">Desfazer</button></div><div class="pt-main"><div class="tools"><button type="button" class="b95 on" data-t="pen" title="Lápis" aria-label="Lápis">✏</button><button type="button" class="b95" data-t="brush" title="Pincel" aria-label="Pincel">🖌</button><button type="button" class="b95" data-t="eraser" title="Borracha" aria-label="Borracha">▭</button><button type="button" class="b95" data-t="line" title="Linha" aria-label="Linha">╲</button></div><div class="cv-wrap sunk"><canvas width="480" height="300"></canvas></div></div><div class="sw">'+sw+'</div>';
  var cv=$('canvas',wb),cx=cv.getContext('2d',{willReadFrequently:true}),tool='pen',col='#000',drawing=false,sx=0,sy=0,snap=null,undo=[];
  cx.fillStyle='#fff';cx.fillRect(0,0,cv.width,cv.height);
  function pos(e){var r=cv.getBoundingClientRect();return[(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height]}
  cv.addEventListener('pointerdown',function(e){
    e.preventDefault();var p=pos(e);drawing=true;sx=p[0];sy=p[1];cv.setPointerCapture(e.pointerId);
    undo.push(cx.getImageData(0,0,cv.width,cv.height));if(undo.length>20)undo.shift();
    snap=cx.getImageData(0,0,cv.width,cv.height);
    cx.lineCap='round';cx.lineJoin='round';cx.strokeStyle=tool==='eraser'?'#fff':col;cx.lineWidth=tool==='eraser'?14:tool==='brush'?6:2;
    if(tool!=='line'){cx.beginPath();cx.moveTo(sx,sy);cx.lineTo(sx+.01,sy);cx.stroke()}
  });
  cv.addEventListener('pointermove',function(e){
    if(!drawing)return;var p=pos(e);
    if(tool==='line'){cx.putImageData(snap,0,0);cx.beginPath();cx.moveTo(sx,sy);cx.lineTo(p[0],p[1]);cx.stroke()}else{cx.lineTo(p[0],p[1]);cx.stroke()}
  });
  function end(){drawing=false}cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  wb.querySelector('.tools').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;tool=b.dataset.t;wb.querySelectorAll('.tools button').forEach(function(x){x.classList.toggle('on',x===b)})});
  wb.querySelector('.sw').addEventListener('click',function(e){var b=e.target.closest('button');if(b)col=b.dataset.c});
  $('.menubar',wb).addEventListener('click',function(e){var a=e.target.dataset.a;
    if(a==='new'){cx.fillStyle='#fff';cx.fillRect(0,0,cv.width,cv.height)}
    if(a==='undo'&&undo.length)cx.putImageData(undo.pop(),0,0)});
}};

/* ---------- sistema, documentos, lixeira, executar, ajuda ---------- */
APPS.about={title:'Propriedades do sistema',short:'Sistema',icon:'pc',w:380,h:250,build:function(wb,rec){
  wb.classList.add('about');
  wb.innerHTML=ico('pc',64)+'<dl><dt>Sistema</dt><dd>Máquina Virtual 95 (simulada)</dd><dt>Processador</dt><dd>Pentium virtual, 133 MHz</dd><dt>Memória</dt><dd>32 MB de RAM</dd><dt>Tela</dt><dd class="res"></dd><dt>Ligada há</dt><dd class="up">00:00:00</dd></dl>';
  var up=$('.up',wb);$('.res',wb).textContent=desk.clientWidth+' x '+desk.clientHeight+' pixels';
  var iv=setInterval(function(){var s=Math.floor((Date.now()-VM.bootAt)/1000);up.textContent=pad2(Math.floor(s/3600))+':'+pad2(Math.floor(s/60)%60)+':'+pad2(s%60)},1000);
  rec.onclose=function(){clearInterval(iv)};
}};
var FILES=[['bbs.exe','bbs','bbs'],['instagram.exe','insta','insta'],['radio.exe','radio','radio'],['spotify.exe','spotify','spotify'],['documento.doc','word','word'],['desenho.bmp','paint','paint'],['lista.txt','note','notepad']];
APPS.docs={title:'Meus Documentos',short:'Documentos',icon:'folder',w:420,h:280,build:function(wb){
  var h='<div class="files sunk">';FILES.forEach(function(f,i){h+='<button type="button" class="file" data-i="'+i+'">'+ico(f[1],32)+'<span>'+f[0]+'</span></button>'});
  wb.innerHTML=h+'</div><div class="status"><span>'+FILES.length+' objetos</span></div>';
  wb.addEventListener('click',function(e){
    var b=e.target.closest('.file');if(!b)return;
    wb.querySelectorAll('.file').forEach(function(x){x.classList.toggle('sel',x===b)});
    if(coarse||e.detail===2)openApp(FILES[+b.dataset.i][2]);
  });
}};
APPS.bin={title:'Lixeira',short:'Lixeira',icon:'bin',w:300,h:150,build:function(wb){wb.classList.add('dlg');wb.innerHTML='<div class="dlg-row">'+ico('bin',48)+'<span>A Lixeira está vazia.</span></div>'}};
APPS.help={title:'Ajuda do Windows',short:'Ajuda',icon:'help',w:340,h:200,build:function(wb){wb.classList.add('dlg');wb.innerHTML='<div class="dlg-row">'+ico('help',40)+'<span>Dê dois cliques nos ícones para abrir os programas. No celular, um toque basta. Arraste as janelas pela barra azul.</span></div>'}};
APPS.run={title:'Executar',short:'Executar',icon:'win',w:340,h:170,build:function(wb){
  wb.classList.add('dlg');
  wb.innerHTML='<div class="dlg-row">'+ico('win',32)+'<span>Digite o nome do programa: radio, spotify, bbs, instagram, paint, notepad, word, configuracoes.</span></div><div class="dlg-row"><span>Abrir:</span><input class="sunk" type="text" spellcheck="false" aria-label="Programa"><button type="button" class="b95">OK</button></div><div class="status"><span class="m"></span></div>';
  var inp=$('input',wb),m=$('.m',wb);
  var MAP={radio:'radio','rádio':'radio',bbs:'bbs',instagram:'insta',insta:'insta',spotify:'spotify',paint:'paint',notepad:'notepad',notas:'notepad',word:'word',configuracoes:'settings',configurações:'settings',settings:'settings',docs:'docs'};
  function go(){var k=MAP[inp.value.trim().toLowerCase().replace(/\.exe$/,'')];if(k){closeWin('run');openApp(k)}else m.textContent='Não encontrei esse programa.'}
  $('button',wb).addEventListener('click',go);inp.addEventListener('keydown',function(e){if(e.key==='Enter')go()});
  setTimeout(function(){inp.focus()},50);
}};


/* ---------- exposição para os outros arquivos ---------- */
VM.$=$;VM.desk=desk;VM.screenEl=screenEl;VM.tasks=tasks;VM.menu=menu;VM.startBtn=startBtn;VM.wins=wins;VM.APPS=APPS;
VM.ico=ico;VM.PAL=PAL;VM.MAPS=MAPS;VM.drawMap=drawMap;VM.PETS=PETS;VM.PETPAL=PETPAL;VM.openApp=openApp;VM.closeWin=closeWin;
VM.focusWin=focusWin;VM.pad2=pad2;VM.coarse=coarse;VM.SPK=SPK;VM.createWindow=createWindow;
})();
