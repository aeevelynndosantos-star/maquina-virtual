/* Rádio: toca músicas que você adiciona (mp3, wav, ogg, m4a...), rádios públicas da internet salvas na lista e uma estação lo-fi sintetizada. */
(function(){
'use strict';
var VM=window.VM,$=VM.$,pad2=VM.pad2;

VM.MAPS.radio=['....KKKKKKKK....','.KKKKKKKKKKKKKK.','.KPPPPPPPPPPPPK.','.KPKKKKPPKKKKPK.','.KPKGGKPPKGGKPK.','.KPKGGKPPKGGKPK.','.KPKKKKPPKKKKPK.','.KPPPPPPPPPPPPK.','.KPKCCCCCCCCKPK.','.KPPPPPPPPPPPPK.','.KKKKKKKKKKKKKK.'];

var G={
 rew:'<svg viewBox="0 0 16 16"><path d="M8 3v10L2 8zM14 3v10L8 8z" fill="currentColor"/></svg>',
 fwd:'<svg viewBox="0 0 16 16"><path d="M8 3v10l6-5zM2 3v10l6-5z" fill="currentColor"/></svg>',
 play:'<svg viewBox="0 0 16 16"><path d="M4 2v12l9-6z" fill="currentColor"/></svg>',
 pause:'<svg viewBox="0 0 16 16"><path d="M3 2h4v12H3zM9 2h4v12H9z" fill="currentColor"/></svg>',
 stop:'<svg viewBox="0 0 16 16"><path d="M3 3h10v10H3z" fill="currentColor"/></svg>'
};
function fmt(s){if(!isFinite(s)||s<0)s=0;return Math.floor(s/60)+':'+pad2(Math.floor(s%60))}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var STATION={id:'synth',name:'Estação Lo-fi (sintetizada)',synth:true};
/* músicas fixas, tocadas direto da pasta do site (mesma lista do player.js) */
var PASTA='musicas/musicas/';
var FIXAS=[
 ['Avicii - Waiting For Love','avicii-waiting-for-love.mp3'],
 ['Post Malone - Sunflower','post-malone-sunflower.mp3'],
 ['Coldplay - A Sky Full Of Stars','coldplay-a-sky-full-of-stars.mp3'],
 ['Alok - Never Let Me Go','alok-never-let-me-go.mp3'],
 ['Alok - Hear Me Now','alok-hear-me-now.mp3'],
 ['Vintage Culture - I Will Find','vintage-culture-i-will-find.mp3'],
 ['Rubel - Grão de Areia','rubel-grao-de-areia.mp3'],
 ['Coldplay - Paradise','Coldplay-Paradise.mp3'],
 ['Twenty One Pilots','twenty-onepilots.mp3'],
 ["Tiko's Groove",'TIKOS-GROOVE-feat.mp3']
].map(function(m,i){return{id:'fixa'+i,name:m[0],url:PASTA+m[1],fixed:true}});

/* rádios salvas (ficam no navegador, em localStorage) */
var LS_KEY='vm95_radios';
function getSt(){try{var a=JSON.parse(localStorage.getItem(LS_KEY)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}}
function setSt(a){try{localStorage.setItem(LS_KEY,JSON.stringify(a))}catch(e){}}

VM.APPS.radio={title:'Rádio',short:'Rádio',icon:'radio',w:380,h:640,minw:320,minh:520,build:function(wb,rec){
  wb.classList.add('rd');
  wb.innerHTML=
   '<canvas class="rd-cv" width="160" height="100" aria-label="Toca-discos"></canvas>'+
   '<div class="rd-title sunk"><span>Rádio ligado — escolha uma música</span></div>'+
   '<div class="rd-prog"><span class="t0">0:00</span><input class="seek" type="range" min="0" max="1000" value="0" aria-label="Posição"><span class="t1">0:00</span></div>'+
   '<div class="rd-ctl"><button type="button" class="b95" data-k="prev" aria-label="Anterior">'+G.rew+'</button><button type="button" class="b95" data-k="pp" aria-label="Tocar">'+G.play+'</button><button type="button" class="b95" data-k="stop" aria-label="Parar">'+G.stop+'</button><button type="button" class="b95" data-k="next" aria-label="Próxima">'+G.fwd+'</button>'+
   '<button type="button" class="b95 tgl" data-k="shuf" title="Aleatório" aria-pressed="false">⤮</button><button type="button" class="b95 tgl" data-k="rep" title="Repetir" aria-pressed="false">↻</button></div>'+
   '<div class="rd-vol"><span class="spk">'+VM.SPK+'</span><input class="vol" type="range" min="0" max="100" value="70" aria-label="Volume"></div>'+
   '<div class="rd-add"><button type="button" class="b95 add">+ Músicas</button><button type="button" class="b95 link">+ Link de rádio</button><input class="file" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac" multiple hidden><span class="hint">ou arraste arquivos</span></div>'+
   '<div class="rd-add"><input class="q" type="search" placeholder="Buscar rádio (ex: jovem pan)" aria-label="Buscar rádio"><button type="button" class="b95 go">Buscar</button></div>'+
   '<ul class="rd-list rd-res sunk" aria-label="Resultados da busca" hidden></ul>'+
   '<ul class="rd-list sunk rd-main" aria-label="Lista"></ul>'+
   '<div class="status"><span class="msg">Sua lista fica salva neste navegador.</span></div>';

  var cv=$('.rd-cv',wb),cx=cv.getContext('2d'),titleEl=$('.rd-title span',wb),list=$('.rd-main',wb),resEl=$('.rd-res',wb),msg=$('.msg',wb);
  var seek=$('.seek',wb),vol=$('.vol',wb),t0=$('.t0',wb),t1=$('.t1',wb),ppBtn=$('[data-k=pp]',wb),fileIn=$('.file',wb),qIn=$('.q',wb);
  var items=[STATION],cur=-1,playing=false,shuffle=false,repeat=false,dead=false,url=null,seeking=false,results=[];
  var audio=new Audio();audio.preload='auto';
  /* rádios online usam um player separado: sem passar pelo WebAudio, porque streams de outros sites
     não liberam CORS e o áudio ficaria mudo se passasse pelo analisador */
  var radio=new Audio();radio.preload='none';
  var ac=null,master=null,an=null,synthGain=null,mediaSrc=null,timer=null,nextT=0,step=0,synthT0=0;
  var buf=new Uint8Array(32);

  /* ---------- áudio ---------- */
  function ensureCtx(){
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!AC||ac)return;
    try{
      ac=new AC();master=ac.createGain();an=ac.createAnalyser();an.fftSize=64;synthGain=ac.createGain();
      master.gain.value=vol.value/100;
      synthGain.connect(an);
      try{mediaSrc=ac.createMediaElementSource(audio);mediaSrc.connect(an)}catch(e){mediaSrc=null}
      an.connect(master);master.connect(ac.destination);
    }catch(e){ac=null}
  }
  function applyVol(){
    var v=vol.value/100;
    if(master)master.gain.value=v;
    audio.volume=mediaSrc?1:v;
    radio.volume=v;
  }
  var SC=[0,2,3,7,9,12,14,15,19],ROOT=[-12,-14,-16,-14];
  function hz(semi){return 220*Math.pow(2,semi/12)}
  function tone(f,t,d,type,g){
    var o=ac.createOscillator(),e=ac.createGain();o.type=type;o.frequency.value=f;
    e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(g,t+.02);e.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(e);e.connect(synthGain);o.start(t);o.stop(t+d+.05);
  }
  function sched(){
    while(nextT<ac.currentTime+.35){
      var bar=Math.floor(step/8)%4;
      if(step%8===0)tone(hz(ROOT[bar]),nextT,1.9,'sine',.24);
      if(step%2===0||Math.random()<.3)tone(hz(SC[Math.floor(Math.random()*SC.length)]+(bar===2?-2:0)),nextT,.7,'triangle',.11);
      nextT+=.27;step++;
    }
  }
  function stopSynth(){clearInterval(timer);timer=null}
  function stopRadio(){radio.pause();if(radio.getAttribute('src')){radio.removeAttribute('src');try{radio.load()}catch(e){}}}
  function stopFile(){audio.pause();if(url){try{URL.revokeObjectURL(url)}catch(e){}url=null}audio.removeAttribute('src');try{audio.load()}catch(e){}stopRadio()}
  function setTitle(t){titleEl.textContent=t}
  function setPlaying(p){
    playing=p;ppBtn.innerHTML=p?G.pause:G.play;ppBtn.setAttribute('aria-label',p?'Pausar':'Tocar');
    document.body.classList.toggle('music-on',p);
  }
  function isLive(it){return it&&(it.synth||it.stream)}
  function renderList(){
    list.innerHTML='';
    items.forEach(function(it,i){
      var li=document.createElement('li');li.className=(i===cur?'cur':'');li.dataset.i=i;
      li.innerHTML='<span class="n">'+(it.synth?'📻':it.stream?'📡':'♪')+'</span><span class="nm">'+esc(it.name)+'</span>'+((it.synth||it.fixed)?'':'<button type="button" class="rm" aria-label="Remover" title="Remover">✕</button>');
      list.appendChild(li);
    });
  }
  function play(i){
    if(i<0||i>=items.length)return;
    ensureCtx();if(ac&&ac.resume)ac.resume();
    applyVol();
    var it=items[i];cur=i;stopSynth();stopFile();renderList();
    seek.disabled=!!isLive(it);seek.value=0;
    if(it.synth){
      setTitle('♪ '+it.name);
      if(!ac){setTitle('Áudio indisponível neste navegador');setPlaying(false);return}
      step=0;nextT=ac.currentTime+.05;synthT0=Date.now();timer=setInterval(sched,100);sched();setPlaying(true);
      if(VM.say)VM.say('lo-fi no ar. que paz!');
    }else if(it.stream){
      setTitle('📡 conectando... '+it.name);synthT0=Date.now();
      radio.src=it.url;
      var q=radio.play();
      var ok=function(){setPlaying(true);setTitle('📡 '+it.name)};
      if(q&&q.then)q.then(ok).catch(function(){setPlaying(false);setTitle('Não consegui sintonizar esta rádio')});else ok();
      if(VM.say)VM.say('sintonizando: '+it.name.slice(0,28));
    }else{
      setTitle('♪ '+it.name);
      if(it.fixed)audio.src=it.url;else{url=URL.createObjectURL(it.blob);audio.src=url}
      var p=audio.play();
      if(p&&p.then)p.then(function(){setPlaying(true)}).catch(function(){setPlaying(false);setTitle('Toque em ▶ para iniciar')});else setPlaying(true);
      if(VM.say)VM.say('boa escolha: '+it.name.slice(0,28));
    }
  }
  function pause(){
    if(cur<0){if(items.length)play(items.length>1?1:0);return}
    var it=items[cur];
    if(it.synth){stopSynth();setPlaying(false);setTitle('⏸ '+it.name)}
    else if(it.stream){stopRadio();setPlaying(false);setTitle('⏸ '+it.name)}
    else{audio.pause();setPlaying(false)}
  }
  function resume(){
    var it=items[cur];
    if(isLive(it))play(cur); /* rádio ao vivo: reconecta */
    else{ensureCtx();if(ac&&ac.resume)ac.resume();var p=audio.play();if(p&&p.then)p.then(function(){setPlaying(true)}).catch(function(){});else setPlaying(true)}
  }
  function stopAll(){stopSynth();stopFile();setPlaying(false);cur=-1;renderList();setTitle('Rádio ligado — escolha uma música');seek.value=0;seek.disabled=false;t0.textContent='0:00';t1.textContent='0:00'}
  function next(dir){
    if(!items.length)return;
    var n;
    if(shuffle&&items.length>2){do{n=Math.floor(Math.random()*items.length)}while(n===cur)}
    else n=(cur+dir+items.length)%items.length;
    play(n);
  }
  audio.addEventListener('ended',function(){if(repeat)play(cur);else next(1)});
  audio.addEventListener('timeupdate',function(){if(!seeking&&audio.duration){seek.value=Math.round(audio.currentTime/audio.duration*1000);t0.textContent=fmt(audio.currentTime);t1.textContent=fmt(audio.duration)}});
  audio.addEventListener('error',function(){if(!audio.getAttribute('src'))return;setPlaying(false);setTitle('Não consegui tocar este arquivo');if(VM.say)VM.say('hmm, esse arquivo não tocou...')});
  radio.addEventListener('error',function(){if(!radio.getAttribute('src'))return;setPlaying(false);setTitle('Rádio fora do ar ou bloqueada');if(VM.say)VM.say('essa rádio não quis tocar...')});
  seek.addEventListener('input',function(){seeking=true;if(audio.duration)t0.textContent=fmt(seek.value/1000*audio.duration)});
  seek.addEventListener('change',function(){if(audio.duration)audio.currentTime=seek.value/1000*audio.duration;seeking=false});
  vol.addEventListener('input',applyVol);

  /* ---------- controles ---------- */
  wb.querySelector('.rd-ctl').addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;var k=b.dataset.k;
    if(k==='pp'){if(cur<0)play(0);else if(playing)pause();else resume()}
    else if(k==='stop')stopAll();
    else if(k==='prev')next(-1);
    else if(k==='next')next(1);
    else if(k==='shuf'){shuffle=!shuffle;b.classList.toggle('on',shuffle);b.setAttribute('aria-pressed',shuffle)}
    else if(k==='rep'){repeat=!repeat;b.classList.toggle('on',repeat);b.setAttribute('aria-pressed',repeat)}
  });
  list.addEventListener('click',function(e){
    var li=e.target.closest('li');if(!li)return;var i=+li.dataset.i;
    if(e.target.closest('.rm')){remove(i);return}
    play(i);
  });
  function remove(i){
    var it=items[i];if(!it||it.synth||it.fixed)return;
    if(i===cur)stopAll();else if(cur>i)cur--;
    if(it.stream){setSt(getSt().filter(function(s){return s.id!==it.id}));load()}
    else DB.del('tracks',it.id).then(load);
  }

  /* ---------- lista: rádios salvas + músicas do usuário ---------- */
  function load(){
    return DB.all('tracks').then(function(ts){
      ts.sort(function(a,b){return a.added-b.added});
      var sts=getSt().map(function(s){return{id:s.id,name:s.name,url:s.url,stream:true}});
      var playingId=cur>=0&&items[cur]?items[cur].id:null;
      items=[STATION].concat(FIXAS,sts,ts);
      cur=playingId?items.findIndex(function(x){return x.id===playingId}):-1;
      renderList();
      msg.textContent=(sts.length||ts.length)?sts.length+' rádio(s) e '+ts.length+' música(s) na lista.':'Adicione rádios ou músicas nos botões acima.';
    });
  }
  function addStation(name,u){
    u=String(u||'').trim();
    if(!/^https?:\/\//i.test(u)){msg.textContent='O link precisa começar com http:// ou https://';return false}
    var sts=getSt();
    if(sts.some(function(s){return s.url===u})){msg.textContent='Essa rádio já está na lista.';return false}
    sts.push({id:'r'+Date.now()+Math.floor(Math.random()*1000),name:(name||u).trim().slice(0,60),url:u});
    setSt(sts);load().then(function(){msg.textContent='Rádio salva: '+(name||u)});
    return true;
  }
  function addFiles(files){
    var ok=[].filter.call(files,function(f){return /^audio\//.test(f.type)||/\.(mp3|wav|ogg|m4a|flac|aac|opus|webm)$/i.test(f.name)});
    if(!ok.length){msg.textContent='Nenhum arquivo de áudio encontrado.';return}
    var base=Date.now();
    Promise.all(ok.map(function(f,i){
      return DB.put('tracks',{id:base+i+Math.random(),name:f.name.replace(/\.[^.]+$/,''),blob:f,added:base+i});
    })).then(load).then(function(){
      msg.textContent=ok.length+' música(s) adicionada(s)!';
      if(VM.say)VM.say('músicas novas! quero ouvir!');
      if(cur<0&&items.length>1)play(items.length-ok.length);
    });
  }
  $('.add',wb).addEventListener('click',function(){fileIn.click()});
  fileIn.addEventListener('change',function(){if(fileIn.files.length)addFiles(fileIn.files);fileIn.value=''});
  ['dragenter','dragover'].forEach(function(n){wb.addEventListener(n,function(e){e.preventDefault();wb.classList.add('drop')})});
  ['dragleave','drop'].forEach(function(n){wb.addEventListener(n,function(e){e.preventDefault();wb.classList.remove('drop')})});
  wb.addEventListener('drop',function(e){if(e.dataTransfer&&e.dataTransfer.files.length)addFiles(e.dataTransfer.files)});

  /* ---------- rádios públicas: busca (Radio Browser, diretório aberto) e link manual ---------- */
  $('.link',wb).addEventListener('click',function(){
    var u=prompt('Cole o link do streaming da rádio (http... .mp3 / .aac / .m3u8):');
    if(!u)return;
    var n=prompt('Nome da rádio:','')||u;
    addStation(n,u);
  });
  function renderRes(){
    resEl.innerHTML='';
    if(!results.length){resEl.hidden=true;return}
    resEl.hidden=false;
    results.forEach(function(s,i){
      var li=document.createElement('li');li.dataset.i=i;
      var sub=[s.country,s.tags&&s.tags.split(',')[0]].filter(Boolean).join(' · ');
      li.innerHTML='<span class="n">📡</span><span class="nm">'+esc(s.name.trim())+(sub?' <small>('+esc(sub)+')</small>':'')+'</span><button type="button" class="rm add-st" aria-label="Salvar na lista" title="Salvar na lista">＋</button>';
      resEl.appendChild(li);
    });
  }
  function search(){
    var q=qIn.value.trim();
    if(!q){results=[];renderRes();return}
    msg.textContent='Buscando rádios...';
    fetch('https://de1.api.radio-browser.info/json/stations/search?name='+encodeURIComponent(q)+'&limit=25&hidebroken=true&order=votes&reverse=true')
     .then(function(r){return r.json()})
     .then(function(rs){
       var https=location.protocol==='https:';
       results=rs.filter(function(s){var u=s.url_resolved||s.url;return u&&(!https||/^https:/i.test(u))}).map(function(s){return{name:s.name||'Rádio',url:s.url_resolved||s.url,country:s.country,tags:s.tags}});
       renderRes();
       msg.textContent=results.length?results.length+' rádio(s) encontrada(s). Toque no ＋ para salvar.':'Nenhuma rádio encontrada.';
     })
     .catch(function(){msg.textContent='Não consegui buscar agora (sem internet?). Você ainda pode colar um link.'});
  }
  $('.go',wb).addEventListener('click',search);
  qIn.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();search()}});
  resEl.addEventListener('click',function(e){
    var li=e.target.closest('li');if(!li)return;var s=results[+li.dataset.i];if(!s)return;
    addStation(s.name.trim(),s.url);
  });

  /* ---------- cena do toca-discos (pixel art, 160x100) ---------- */
  var off=document.createElement('canvas');off.width=off.height=56;var ox=off.getContext('2d');
  var rot=0,arm=0,stars=[[110,14],[124,22],[138,12],[142,34],[118,38],[132,28]],lastT=0,fake=new Array(12).fill(0);
  function px(x,y,w,h,c){cx.fillStyle=c;cx.fillRect(Math.round(x),Math.round(y),w,h)}
  function line(x0,y0,x1,y1,c){
    var n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0;
    for(var i=0;i<=n;i++){px(x0+(x1-x0)*i/(n||1),y0+(y1-y0)*i/(n||1),2,2,c)}
  }
  function vinyl(a){
    var img=ox.createImageData(56,56),d=img.data,c=27.5;
    for(var y=0;y<56;y++)for(var x=0;x<56;x++){
      var dx=x-c,dy=y-c,r=Math.sqrt(dx*dx+dy*dy),o=(y*56+x)*4,col=null;
      if(r<=27){
        col=[24,24,32];
        if(Math.floor(r)%4===0&&r>11)col=[40,40,52];
        var ang=Math.atan2(dy,dx)-a,m=((ang%Math.PI)+Math.PI)%Math.PI;
        if(r>11&&(m<.28||m>Math.PI-.05))col=[78,78,98];
        if(r<=10)col=[232,106,168];
        if(r<=10&&Math.abs(((Math.atan2(dy,dx)-a+Math.PI*4)%(Math.PI*2))-0)<.5&&r>5)col=[255,240,250];
        if(r<=2.6)col=[20,16,28];
      }
      if(col){d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=255}
    }
    ox.putImageData(img,0,0);cx.drawImage(off,50-28,64-28);
  }
  function draw(ts){
    if(dead)return;
    var dt=Math.min(.05,(ts-lastT)/1000||0);lastT=ts;
    var w=160,h=100;
    px(0,0,w,h,'#7a4a5e');px(0,0,w,3,'#8e5a70');
    /* janela noturna */
    px(98,6,56,48,'#3a2a50');px(100,8,52,44,'#14123a');
    for(var i=0;i<stars.length;i++){var tw=((ts/500+i*7)%4)<3;if(tw)px(stars[i][0],stars[i][1],2,2,'#fff6c8')}
    px(104,14,10,10,'#ffe9a0');px(108,12,8,10,'#14123a');
    px(125,6,2,48,'#3a2a50');px(98,28,56,2,'#3a2a50');
    /* planta */
    px(138,68,10,14,'#9a6a8a');px(140,66,6,3,'#b88aa8');px(142,52,2,14,'#4c8a4a');px(137,56,4,8,'#e86aa8');px(146,54,4,10,'#f58fc0');
    /* mesa */
    px(0,84,w,16,'#c89a8a');px(0,84,w,2,'#e0b4a2');
    /* toca-discos */
    px(8,40,100,48,'#8a6a60');px(6,38,100,48,'#e8d3c0');px(6,38,100,3,'#fff0e0');px(6,83,100,3,'#cfb4a2');
    px(10,44,88,38,'#d8bfa8');
    /* disco */
    var spin=playing?3.2:0;
    rot+=spin*dt;vinyl(rot);
    /* braço */
    var target=playing?1:0;arm+=(target-arm)*Math.min(1,dt*4);
    var tx=96+(70-96)*arm,ty=78+(56-78)*arm;
    px(92,44,10,10,'#b99a8a');px(94,46,6,6,'#8a6a60');
    line(97,49,tx,ty,'#6a4a50');px(tx-2,ty-1,6,4,'#3a2a30');
    /* botões */
    px(14,76,5,5,'#e86aa8');px(24,76,5,5,'#a8a0c0');
    /* equalizador (rádio online não passa pelo analisador, então anima "de mentirinha") */
    var cit=items[cur],real=playing&&an&&!(cit&&cit.stream);
    if(real){an.getByteFrequencyData(buf);for(var b=0;b<12;b++)fake[b]=buf[b+1]/255}
    else if(playing){for(var f=0;f<12;f++)fake[f]=.25+.5*Math.abs(Math.sin(ts/220+f))}
    else for(var z=0;z<12;z++)fake[z]*=.85;
    for(var k=0;k<12;k++){
      var hh=Math.max(1,Math.round(fake[k]*22));
      for(var yy=0;yy<hh;yy+=3)px(8+k*6,34-yy,4,2,yy>14?'#ffe9a0':yy>8?'#f58fc0':'#e86aa8');
    }
    if(synthT0&&playing&&isLive(cit)){var s=(Date.now()-synthT0)/1000;t0.textContent=fmt(s);t1.textContent='∞'}
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  rec.onclose=function(){
    dead=true;stopSynth();stopFile();document.body.classList.remove('music-on');
    if(ac&&ac.close)ac.close().catch(function(){});
  };
  renderList();load();
}};
})();
