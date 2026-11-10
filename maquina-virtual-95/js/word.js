/* Word: editor de texto simples com negrito, itálico, sublinhado, alinhamento, fonte e tamanho.
   O documento fica salvo neste navegador. "Salvar" baixa o arquivo .doc; "Abrir" lê .txt, .html e .doc. */
(function(){
'use strict';
var VM=window.VM,$=VM.$;

VM.MAPS.word=['................','.KKKKKKKKKKKKK..','.KBBBBBBBBBBBK..','.KBBWBBBBBWBBK..','.KBBWBBWBBWBBK..','.KBBWBBWBBWBBK..','.KBBBWBWBWBBBK..','.KBBBBWBWBBBBK..','.KBBBBBBBBBBBK..','.KKKKKKKKKKKKK..'];

var KEY='vm95-word';
var DEFAULT='<h2>Meu primeiro documento</h2><p>Escreva aqui. Use a barra acima para mudar a fonte, o tamanho e o alinhamento.</p><p>(o texto fica salvo neste navegador)</p>';
var FONTS=[['Times New Roman','Times New Roman'],['Arial','Arial'],['Courier New','Courier New'],['Verdana','Verdana']];
var SIZES=[['1','8'],['2','10'],['3','12'],['4','14'],['5','18'],['6','24'],['7','36']];

function opts(list,sel){return list.map(function(o){return '<option value="'+o[0]+'"'+(o[0]===sel?' selected':'')+'>'+o[1]+'</option>'}).join('')}

VM.APPS.word={title:'Documento1 - Word',short:'Word',icon:'word',w:520,h:430,minw:340,minh:300,build:function(wb){
  wb.classList.add('wd');
  wb.innerHTML=
   '<div class="menubar"><button type="button" data-a="new">Novo</button><button type="button" data-a="open">Abrir</button><button type="button" data-a="save">Salvar como .doc</button></div>'+
   '<div class="wd-tools">'+
    '<select class="b95" data-f="fontName" aria-label="Fonte">'+opts(FONTS,'Times New Roman')+'</select>'+
    '<select class="b95" data-f="fontSize" aria-label="Tamanho">'+opts(SIZES,'3')+'</select>'+
    '<button type="button" class="b95" data-c="bold" title="Negrito" aria-label="Negrito"><b>N</b></button>'+
    '<button type="button" class="b95" data-c="italic" title="Itálico" aria-label="Itálico"><i>I</i></button>'+
    '<button type="button" class="b95" data-c="underline" title="Sublinhado" aria-label="Sublinhado"><u>S</u></button>'+
    '<button type="button" class="b95" data-c="justifyLeft" title="Esquerda" aria-label="Alinhar à esquerda">&#8676;</button>'+
    '<button type="button" class="b95" data-c="justifyCenter" title="Centralizar" aria-label="Centralizar">&#8801;</button>'+
    '<button type="button" class="b95" data-c="justifyRight" title="Direita" aria-label="Alinhar à direita">&#8677;</button>'+
    '<button type="button" class="b95" data-c="insertUnorderedList" title="Lista" aria-label="Lista">&#8226;&#8801;</button>'+
   '</div>'+
   '<div class="wd-page sunk"><div class="wd-doc" contenteditable="true" spellcheck="false" aria-label="Documento"></div></div>'+
   '<div class="status"><span class="cnt">0 palavras</span><span class="msg">Salvo neste navegador</span></div>'+
   '<input class="file" type="file" accept=".txt,.html,.htm,.doc,text/plain,text/html" hidden>';

  var doc=$('.wd-doc',wb),cnt=$('.cnt',wb),msg=$('.msg',wb),fileIn=$('.file',wb),saveT=null;

  function esc(s){return String(s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
  function count(){
    var t=(doc.innerText||'').trim(),n=t?t.split(/\s+/).length:0;
    cnt.textContent=n+(n===1?' palavra':' palavras');
  }
  function persist(){
    try{localStorage.setItem(KEY,doc.innerHTML);msg.textContent='Salvo neste navegador'}catch(e){msg.textContent='Não deu para salvar aqui'}
  }
  function changed(){count();msg.textContent='Salvando...';clearTimeout(saveT);saveT=setTimeout(persist,400)}

  var saved=null;try{saved=localStorage.getItem(KEY)}catch(e){}
  doc.innerHTML=saved!=null&&saved!==''?saved:DEFAULT;
  count();
  doc.addEventListener('input',changed);

  /* barra de ferramentas: mousedown preserva a seleção do texto */
  var tools=$('.wd-tools',wb);
  tools.addEventListener('mousedown',function(e){if(e.target.closest('button'))e.preventDefault()});
  tools.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    doc.focus();document.execCommand(b.dataset.c,false,null);changed();
  });
  tools.addEventListener('change',function(e){
    var s=e.target.closest('select');if(!s)return;
    doc.focus();document.execCommand(s.dataset.f,false,s.value);changed();
  });

  $('.menubar',wb).addEventListener('click',function(e){
    var a=e.target.dataset.a;if(!a)return;
    if(a==='new'){doc.innerHTML='<p><br></p>';changed();doc.focus()}
    if(a==='open')fileIn.click();
    if(a==='save'){
      var html='<html><head><meta charset="utf-8"><title>Documento1</title></head><body>'+doc.innerHTML+'</body></html>';
      var url=URL.createObjectURL(new Blob(['﻿'+html],{type:'application/msword'}));
      var link=document.createElement('a');link.href=url;link.download='documento.doc';
      document.body.appendChild(link);link.click();link.remove();
      setTimeout(function(){URL.revokeObjectURL(url)},1000);
      msg.textContent='Arquivo documento.doc baixado';
    }
  });
  fileIn.addEventListener('change',function(){
    var f=fileIn.files[0];fileIn.value='';if(!f)return;
    var r=new FileReader();
    r.onload=function(){
      var t=String(r.result);
      if(/\.txt$/i.test(f.name)||f.type==='text/plain'){
        doc.innerHTML=t.split(/\r?\n/).map(function(l){return '<p>'+(esc(l)||'<br>')+'</p>'}).join('');
      }else{
        /* html/doc: pega só o texto, sem scripts nem estilos externos */
        var d=new DOMParser().parseFromString(t,'text/html');
        doc.innerHTML=(d.body.innerText||d.body.textContent||'').split(/\r?\n/).map(function(l){return '<p>'+(esc(l.trim())||'<br>')+'</p>'}).join('');
      }
      changed();msg.textContent='Aberto: '+f.name;
    };
    r.readAsText(f);
  });
}};
})();
