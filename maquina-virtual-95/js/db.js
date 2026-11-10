/* Armazenamento local (IndexedDB) para músicas e fotos.
   Se o navegador bloquear o IndexedDB, usa a memória (some ao recarregar). */
(function(){
'use strict';
var mem={posts:[],tracks:[],kv:[]},dbp=null;
function key(store){return store==='kv'?'k':'id'}
function open(){
  if(dbp)return dbp;
  dbp=new Promise(function(res){
    try{
      var r=indexedDB.open('vm95',1);
      r.onupgradeneeded=function(){
        var d=r.result;
        ['posts','tracks'].forEach(function(s){if(!d.objectStoreNames.contains(s))d.createObjectStore(s,{keyPath:'id'})});
        if(!d.objectStoreNames.contains('kv'))d.createObjectStore('kv',{keyPath:'k'});
      };
      r.onsuccess=function(){res(r.result)};
      r.onerror=function(){res(null)};
      r.onblocked=function(){res(null)};
    }catch(e){res(null)}
  });
  return dbp;
}
function run(store,mode,fn,fallback){
  return open().then(function(d){
    if(!d)return fallback();
    return new Promise(function(res){
      try{
        var t=d.transaction(store,mode),req=fn(t.objectStore(store));
        t.oncomplete=function(){res(req&&req.result)};
        t.onerror=t.onabort=function(){res(fallback())};
      }catch(e){res(fallback())}
    });
  });
}
window.DB={
  all:function(store){
    return run(store,'readonly',function(s){return s.getAll()},function(){return mem[store].slice()}).then(function(r){return r||[]});
  },
  get:function(store,id){
    return run(store,'readonly',function(s){return s.get(id)},function(){
      return mem[store].filter(function(o){return o[key(store)]===id})[0]});
  },
  put:function(store,obj){
    var k=key(store);
    mem[store]=mem[store].filter(function(o){return o[k]!==obj[k]});mem[store].push(obj);
    return run(store,'readwrite',function(s){return s.put(obj)},function(){});
  },
  del:function(store,id){
    var k=key(store);
    mem[store]=mem[store].filter(function(o){return o[k]!==id});
    return run(store,'readwrite',function(s){return s.delete(id)},function(){});
  },
  kvGet:function(k,def){return DB.get('kv',k).then(function(o){return o&&o.v!==undefined?o.v:def})},
  kvSet:function(k,v){return DB.put('kv',{k:k,v:v})}
};
})();
