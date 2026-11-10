/* Instagram.exe: tire uma foto (ou escolha da galeria), aplique um filtro, escreva a legenda e poste. */
(function(){
'use strict';
var VM=window.VM,$=VM.$;
var SIZE=480;
var FILTERS=[['normal','Normal'],['cd','Azul CD'],['bw','P&B granulado'],['bbs','Verde BBS'],['pixel','Pixelado'],['y2k','Y2K']];
var NAV={
 home:'<svg viewBox="0 0 16 16"><path d="M8 2L1 8h2v6h4v-4h2v4h4V8h2z" fill="#000"/></svg>',
 search:'<svg viewBox="0 0 16 16"><circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="#000" stroke-width="2"/><path d="M10 10l5 5" stroke="#000" stroke-width="2.4"/></svg>',
 cam:'<svg viewBox="0 0 16 16"><path d="M1 4h4l1-2h4l1 2h4v10H1z" fill="#000"/><circle cx="8" cy="9" r="3" fill="#c0c0c0"/></svg>',
 heart:'<svg viewBox="0 0 16 16"><path d="M8 14L2 8a3.5 3.5 0 0 1 6-3 3.5 3.5 0 0 1 6 3z" fill="#000"/></svg>'
};
VM.MAPS.camera=['................','....KKKK........','.KKKKKKKKKKKKKK.','.KGGGGGGGGGGGYK.','.KGGGKKKKGGGGGK.','.KGGKLLLLKGGGGK.','.KGGKLWLLKGGGGK.','.KGGKLLLLKGGGGK.','.KGGGKKKKGGGGGK.','.KGGGGGGGGGGGGK.','.KKKKKKKKKKKKKK.'];

function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ago(t){
  var s=Math.max(1,Math.floor((Date.now()-t)/1000));
  if(s<60)return 'agora mesmo';
  var m=Math.floor(s/60);if(m<60)return 'há '+m+' min';
  var h=Math.floor(m/60);if(h<24)return 'há '+h+' h';
  var d=Math.floor(h/24);return 'há '+d+(d===1?' dia':' dias');
}
function clamp(v){return v<0?0:v>255?255:v}

/* ---------- filtros (processam o canvas quadrado) ---------- */
function applyFilter(cv,name){
  var c=cv.getContext('2d'),w=cv.width,h=cv.height,i,img,d,g;
  if(name==='normal')return;
  if(name==='pixel'){
    var s=document.createElement('canvas');s.width=s.height=84;var sc=s.getContext('2d');
    sc.drawImage(cv,0,0,84,84);
    c.imageSmoothingEnabled=false;c.drawImage(s,0,0,84,84,0,0,w,h);
    img=c.getImageData(0,0,w,h);d=img.data;
    for(i=0;i<d.length;i+=4){d[i]=Math.round(d[i]/51)*51;d[i+1]=Math.round(d[i+1]/51)*51;d[i+2]=Math.round(d[i+2]/51)*51}
    c.putImageData(img,0,0);return;
  }
  img=c.getImageData(0,0,w,h);d=img.data;
  for(i=0;i<d.length;i+=4){
    var r=d[i],gg=d[i+1],b=d[i+2],px=(i/4)%w,py=Math.floor(i/4/w);
    g=.3*r+.59*gg+.11*b;
    if(name==='cd'){
      var t=Math.pow(clamp((g-20)*1.2)/255,1.1);
      d[i]=10+t*205;d[i+1]=20+t*210;d[i+2]=80+t*175;
    }else if(name==='bw'){
      var v=clamp((g-128)*1.3+128+(Math.random()-.5)*46);
      d[i]=d[i+1]=d[i+2]=v;
    }else if(name==='bbs'){
      var sl=(py%3===0)?.7:1;
      d[i]=g*.12*sl;d[i+1]=clamp(g*1.15)*sl;d[i+2]=g*.35*sl;
    }else if(name==='y2k'){
      var sat=1.5,m=g;
      var rr=m+(r-m)*sat,g2=m+(gg-m)*sat,bb=m+(b-m)*sat;
      var line=(py%4<1)?.82:1;
      d[i]=clamp(rr*1.02)*line;d[i+1]=clamp(g2)*line;d[i+2]=clamp(bb*1.1+14)*line;
    }
  }
  c.putImageData(img,0,0);
}
function drawSquare(cv,src,sw,sh,mirror){
  var c=cv.getContext('2d'),s=Math.min(sw,sh),sx=(sw-s)/2,sy=(sh-s)/2;
  cv.width=cv.height=SIZE;c.save();
  if(mirror){c.translate(SIZE,0);c.scale(-1,1)}
  c.drawImage(src,sx,sy,s,s,0,0,SIZE,SIZE);c.restore();
}
function shutter(){
  try{
    var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    var ac=new AC(),o=ac.createOscillator(),e=ac.createGain();
    o.type='square';o.frequency.setValueAtTime(1200,ac.currentTime);o.frequency.exponentialRampToValueAtTime(300,ac.currentTime+.08);
    e.gain.setValueAtTime(.12,ac.currentTime);e.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.1);
    o.connect(e);e.connect(ac.destination);o.start();o.stop(ac.currentTime+.12);
    setTimeout(function(){ac.close()},300);
  }catch(e){}
}

/* ---------- fotos de exemplo (desenhadas, só na primeira vez) ---------- */
function seedImage(type){
  var t=document.createElement('canvas');t.width=t.height=64;var c=t.getContext('2d'),x,y,i;
  if(type===0){c.fillStyle='#16217a';c.fillRect(0,0,64,64);c.fillStyle='#cfe0ff';c.beginPath();c.arc(32,32,26,0,7);c.fill();c.fillStyle='#2540b8';c.beginPath();c.arc(32,32,22,0,7);c.fill();c.fillStyle='#fff';for(i=0;i<9;i++){x=8+(i*23)%48;y=8+(i*37)%48;c.fillRect(x,y,3,3)}c.fillStyle='#16217a';c.beginPath();c.arc(32,32,7,0,7);c.fill();c.fillStyle='#cfe0ff';c.beginPath();c.arc(32,32,3,0,7);c.fill()}
  if(type===1){c.fillStyle='#d9d4ff';c.fillRect(0,0,64,64);c.fillStyle='#f2c744';for(i=0;i<7;i++){x=6+(i*19)%52;y=6+(i*29)%50;c.fillRect(x+3,y,4,4);c.fillRect(x,y+3,10,4);c.fillRect(x+3,y+7,4,4)}}
  if(type===2){c.fillStyle='#c0c0c0';c.fillRect(0,0,64,64);VM.drawMap(c,VM.PETS[1],4,0,8)}
  var o=document.createElement('canvas');o.width=o.height=SIZE;var oc=o.getContext('2d');oc.imageSmoothingEnabled=false;oc.drawImage(t,0,0,64,64,0,0,SIZE,SIZE);
  return o.toDataURL('image/png');
}
var SEEDS=[['Meu CD favorito: azul com estrelinhas ★',0],['Céu cheio de estrelas, tudo em pixel.',1],['O novo mascote da casa ♡',2]];
function seedIfNeeded(){
  var done=false;try{done=localStorage.getItem('vm95-seeded')==='1'}catch(e){}
  if(done)return Promise.resolve();
  var base=Date.now()-1000*60*60*50;
  return Promise.all(SEEDS.map(function(s,i){
    return DB.put('posts',{id:base+i*1000,img:seedImage(s[1]),cap:s[0],likes:120+i*17,liked:false,comments:[],t:base+i*3600000,seed:true});
  })).then(function(){try{localStorage.setItem('vm95-seeded','1')}catch(e){}});
}

/* ---------- janela ---------- */
VM.APPS.insta={title:'Instagram.exe',short:'Instagram',icon:'insta',w:350,h:600,minw:310,minh:420,build:function(wb,rec){
  wb.classList.add('ig');
  wb.innerHTML='<div class="menubar"><span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>O</u>ptions</span><span><u>H</u>elp</span></div>'+
   '<div class="win-in sunk" style="margin:0 3px"></div>'+
   '<div class="ig-nav"><button type="button" class="b95" data-n="feed" aria-label="Início">'+NAV.home+'</button><button type="button" class="b95" data-n="explore" aria-label="Explorar">'+NAV.search+'</button><button type="button" class="b95" data-n="cam" aria-label="Câmera">'+NAV.cam+'</button><button type="button" class="b95" data-n="act" aria-label="Atividade">'+NAV.heart+'</button><button type="button" class="b95" data-n="me" aria-label="Perfil"><canvas class="mini-av" width="22" height="22"></canvas></button></div>';
  var body=$('.win-in',wb),posts=[],profile={name:'meu_perfil',bio:'pixel ★ y2k\n♪ lofi, pets, cds',avatar:null},stream=null,face='user',raw=null,rawMirror=false,filter='normal',dead=false;

  function stopCam(){if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null}}
  function loadAll(){
    return Promise.all([DB.all('posts'),DB.kvGet('profile',null)]).then(function(r){
      posts=r[0].sort(function(a,b){return b.t-a.t});
      if(r[1])profile=r[1];
      drawMini();
    });
  }
  function drawAvatar(cv){
    var c=cv.getContext('2d');c.imageSmoothingEnabled=false;
    if(profile.avatar){var im=new Image();im.onload=function(){c.clearRect(0,0,cv.width,cv.height);var s=Math.min(im.width,im.height);c.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,cv.width,cv.height)};im.src=profile.avatar}
    else{
      var t=document.createElement('canvas');t.width=t.height=64;var tc=t.getContext('2d');tc.fillStyle='#ccd';tc.fillRect(0,0,64,64);VM.drawMap(tc,VM.PETS[1],4,0,8);
      c.drawImage(t,0,0,64,64,0,0,cv.width,cv.height);
    }
  }
  function drawMini(){var m=$('.mini-av',wb);if(m)drawAvatar(m)}
  function save(p){return DB.put('posts',p)}

  /* ----- feed ----- */
  function feed(focusId){
    stopCam();
    if(!posts.length){
      body.innerHTML='<div class="empty"><p>Ainda não tem fotos por aqui.</p><button type="button" class="b95 go-cam">📷 Tirar a primeira foto</button></div>';
      $('.go-cam',body).addEventListener('click',camera);return;
    }
    var h='';
    posts.forEach(function(p){
      h+='<article class="post" data-id="'+p.id+'"><div class="ig-head"><b>'+esc(profile.name)+'</b><span class="when">'+ago(p.t)+'</span><button type="button" class="b95 del" title="Apagar foto" aria-label="Apagar foto">✕</button></div>'+
        '<img alt="Foto postada" src="'+p.img+'">'+
        '<div class="acts"><button type="button" class="lk" aria-label="Curtir"></button><button type="button" class="cm" aria-label="Comentar">💬</button><button type="button" class="sh" aria-label="Baixar foto">⬇</button></div>'+
        '<div class="cap"></div><div class="cms"></div><div class="cmbox" hidden><input type="text" maxlength="120" placeholder="Escreva um comentário..." aria-label="Comentário"><button type="button" class="b95 send">Enviar</button></div></article>';
    });
    body.innerHTML=h;
    posts.forEach(function(p){
      var el=body.querySelector('[data-id="'+p.id+'"]');
      function upd(){
        $('.lk',el).textContent=p.liked?'♥':'♡';$('.lk',el).style.color=p.liked?'#d4204f':'#000';
        $('.cap',el).innerHTML='<b>'+(p.likes+(p.liked?1:0))+' curtidas</b><br>'+esc(p.cap||'')+'';
        $('.cms',el).innerHTML=(p.comments||[]).map(function(t){return '<div><b>você</b> '+esc(t)+'</div>'}).join('');
      }
      upd();
      $('.lk',el).addEventListener('click',function(){p.liked=!p.liked;save(p);upd()});
      $('.cm',el).addEventListener('click',function(){var b=$('.cmbox',el);b.hidden=!b.hidden;if(!b.hidden)$('input',b).focus()});
      function send(){var inp=$('.cmbox input',el),t=inp.value.trim();if(!t)return;p.comments=(p.comments||[]).concat(t);inp.value='';save(p);upd()}
      $('.send',el).addEventListener('click',send);
      $('.cmbox input',el).addEventListener('keydown',function(e){if(e.key==='Enter')send()});
      $('.sh',el).addEventListener('click',function(){var a=document.createElement('a');a.href=p.img;a.download='foto-'+p.id+'.'+(p.img.indexOf('image/png')>-1?'png':'jpg');document.body.appendChild(a);a.click();a.remove()});
      $('.del',el).addEventListener('click',function(){
        if(!confirm('Apagar esta foto?'))return;
        DB.del('posts',p.id).then(loadAll).then(function(){feed()});
      });
    });
    if(focusId){var f=body.querySelector('[data-id="'+focusId+'"]');if(f)f.scrollIntoView()}
  }

  /* ----- perfil / explorar ----- */
  function grid(withHeader){
    stopCam();
    var h='';
    if(withHeader){
      h+='<div class="ig-top"><button type="button" class="avatar" title="Trocar foto de perfil" aria-label="Trocar foto de perfil"><canvas width="64" height="64"></canvas></button><div class="ig-stats"><div class="n"><span><b>'+posts.length+'</b>posts</span><span><b>1872</b>seguidores</span><span><b>4</b>seguindo</span></div><button type="button" class="b95 edit">Editar perfil</button></div></div><div class="ig-name">'+esc(profile.name)+'</div><div class="ig-bio">'+esc(profile.bio).replace(/\n/g,'<br>')+'</div><input class="f-av" type="file" accept="image/*" hidden>';
    }
    h+=posts.length?'<div class="grid3">'+posts.map(function(p){return '<img data-id="'+p.id+'" src="'+p.img+'" alt="Foto" role="button" tabindex="0">'}).join('')+'</div>':'<div class="empty"><p>Nada por aqui ainda.</p><button type="button" class="b95 go-cam">📷 Tirar uma foto</button></div>';
    body.innerHTML=h;
    if(withHeader){
      drawAvatar($('.avatar canvas',body));
      $('.avatar',body).addEventListener('click',function(){$('.f-av',body).click()});
      $('.f-av',body).addEventListener('change',function(e){
        var f=e.target.files[0];if(!f)return;
        fromFile(f,function(cv){profile.avatar=cv.toDataURL('image/jpeg',.85);DB.kvSet('profile',profile);drawMini();grid(true)});
      });
      $('.edit',body).addEventListener('click',function(){
        var n=prompt('Nome de usuário:',profile.name);if(n===null)return;
        var b=prompt('Bio:',profile.bio.replace(/\n/g,' / '));
        profile.name=(n.trim()||profile.name).slice(0,24);if(b!==null)profile.bio=b.slice(0,120);
        DB.kvSet('profile',profile);grid(true);
      });
    }
    var gc=$('.go-cam',body);if(gc)gc.addEventListener('click',camera);
    body.querySelectorAll('.grid3 img').forEach(function(im){
      function open(){feed(+im.dataset.id)}
      im.addEventListener('click',open);im.addEventListener('keydown',function(e){if(e.key==='Enter')open()});
    });
  }
  function activity(){
    stopCam();
    var likes=posts.reduce(function(a,p){return a+p.likes+(p.liked?1:0)},0),cms=posts.reduce(function(a,p){return a+(p.comments||[]).length},0);
    body.innerHTML='<div class="empty"><div class="big">♥</div><p><b>'+likes+'</b> curtidas no total</p><p><b>'+cms+'</b> comentários seus</p><p><b>'+posts.length+'</b> fotos postadas</p></div>';
  }

  /* ----- câmera ----- */
  function fromFile(file,cb){
    var u=URL.createObjectURL(file),im=new Image();
    im.onload=function(){var cv=document.createElement('canvas');drawSquare(cv,im,im.naturalWidth,im.naturalHeight,false);URL.revokeObjectURL(u);cb(cv)};
    im.onerror=function(){URL.revokeObjectURL(u);alert('Não consegui abrir essa imagem.')};
    im.src=u;
  }
  function camera(){
    stopCam();
    body.innerHTML='<div class="cam"><div class="cam-view"><video autoplay playsinline muted></video><div class="cam-msg">Abrindo a câmera...</div></div>'+
      '<div class="cam-row"><button type="button" class="b95 shut" disabled>● Tirar foto</button><button type="button" class="b95 flip" disabled>↻ Virar</button></div>'+
      '<div class="cam-row"><button type="button" class="b95 gal">🖼 Galeria</button><button type="button" class="b95 nat">📱 Câmera do celular</button></div>'+
      '<input class="f-gal" type="file" accept="image/*" hidden><input class="f-nat" type="file" accept="image/*" capture="environment" hidden></div>';
    var v=$('video',body),msg=$('.cam-msg',body),shut=$('.shut',body),flip=$('.flip',body);
    function open(){
      stopCam();
      if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){msg.textContent='Câmera ao vivo indisponível aqui. Use "Câmera do celular" ou "Galeria".';return}
      navigator.mediaDevices.getUserMedia({video:{facingMode:face,width:{ideal:1280},height:{ideal:1280}},audio:false}).then(function(s){
        if(dead){s.getTracks().forEach(function(t){t.stop()});return}
        stream=s;v.srcObject=s;msg.hidden=true;shut.disabled=false;flip.disabled=false;
        v.style.transform=face==='user'?'scaleX(-1)':'none';
      }).catch(function(){msg.hidden=false;msg.textContent='Sem permissão para a câmera. Use "Câmera do celular" ou "Galeria".'});
    }
    open();
    shut.addEventListener('click',function(){
      if(!v.videoWidth)return;
      var cv=document.createElement('canvas');drawSquare(cv,v,v.videoWidth,v.videoHeight,face==='user');
      shutter();stopCam();compose(cv);
    });
    flip.addEventListener('click',function(){face=face==='user'?'environment':'user';open()});
    $('.gal',body).addEventListener('click',function(){$('.f-gal',body).click()});
    $('.nat',body).addEventListener('click',function(){$('.f-nat',body).click()});
    ['.f-gal','.f-nat'].forEach(function(sel){
      $(sel,body).addEventListener('change',function(e){var f=e.target.files[0];if(f)fromFile(f,function(cv){stopCam();compose(cv)})});
    });
  }

  /* ----- publicar ----- */
  function compose(orig){
    raw=orig;filter='normal';
    var h='<div class="compose"><canvas class="prev"></canvas><label class="flt">Filtro <select aria-label="Filtro">'+FILTERS.map(function(f){return '<option value="'+f[0]+'">'+f[1]+'</option>'}).join('')+'</select></label>'+
      '<textarea maxlength="200" rows="3" placeholder="Escreva uma legenda..." aria-label="Legenda"></textarea>'+
      '<div class="cam-row"><button type="button" class="b95 post-it">Postar</button><button type="button" class="b95 again">Tirar outra</button><button type="button" class="b95 drop">Descartar</button></div></div>';
    body.innerHTML=h;
    var prev=$('.prev',body);
    function render(){
      prev.width=prev.height=SIZE;var c=prev.getContext('2d');c.drawImage(raw,0,0);applyFilter(prev,filter);
    }
    render();
    $('select',body).addEventListener('change',function(e){filter=e.target.value;render()});
    $('.again',body).addEventListener('click',camera);
    $('.drop',body).addEventListener('click',function(){feed()});
    $('.post-it',body).addEventListener('click',function(){
      var cap=$('textarea',body).value.trim(),p={id:Date.now(),img:prev.toDataURL('image/jpeg',.85),cap:cap,likes:0,liked:false,comments:[],t:Date.now()};
      $('.post-it',body).disabled=true;
      save(p).then(loadAll).then(function(){feed(p.id);body.scrollTop=0;if(VM.say)VM.say('ficou lindo! já está no feed.')});
    });
  }

  wb.querySelector('.ig-nav').addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;var n=b.dataset.n;
    if(n==='feed')feed();else if(n==='explore')grid(false);else if(n==='cam')camera();else if(n==='act')activity();else if(n==='me')grid(true);
  });
  rec.onclose=function(){dead=true;stopCam()};
  seedIfNeeded().then(loadAll).then(function(){if(!dead)feed()});
}};
})();
