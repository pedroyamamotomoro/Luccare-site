(function(root){
 'use strict';
 const KEY='luccare_td_profile_v2',SESSION='luccare_td_shared_v2',MODE='luccare_td_mode',TTL=35*60*1000;
 const B=root.LuccareBalance,count=B.maps.length,zeros=()=>Array(count).fill(0);
 const fresh=()=>({version:2,settings:{speed:1,sound:false,volume:.25},unlocked:0,stars:zeros(),hard:zeros(),best:zeros(),highest:zeros(),medals:Array.from({length:count},()=>[]),cards:[],checkpoint:null,tutorial:false,updated:Date.now()});
 const finite=(v,max)=>Number.isFinite(v)&&v>=0&&v<=max;
 // A fase seguinte abre ao vencer a anterior. O modo difícil ("hard"/"adult" no
 // código) só existe depois de vencer a última fase no modo normal.
 function derive(p){
  while(p.unlocked<count-1&&(p.stars[p.unlocked]>0||p.hard[p.unlocked]>0))p.unlocked++;
  return p;
 }
 const hardAvailable=p=>p.stars[count-1]>0;
 function sanitize(raw){
  const p=fresh();if(!raw||raw.version!==2)return p;
  if(raw.settings){p.settings.speed=[1,2,3].includes(raw.settings.speed)?raw.settings.speed:1;p.settings.sound=raw.settings.sound===true;p.settings.volume=finite(raw.settings.volume,1)?raw.settings.volume:.25;}
  for(const key of ['stars','hard','best','highest'])if(Array.isArray(raw[key]))p[key]=B.maps.map((m,i)=>finite(raw[key][i],key==='stars'||key==='hard'?3:key==='highest'?m.waves.length:1e8)?Math.floor(raw[key][i]):0);
  // A fase seguinte só existe para o jogador depois de concluir, em ordem, as anteriores.
  // O antigo campo "unlocked" é apenas um cache e não pode conceder acesso sozinho.
  derive(p);
  p.cards=Array.isArray(raw.cards)?[...new Set(raw.cards.filter(x=>Number.isInteger(x)&&x>=0&&x<count&&(p.stars[x]>0||p.hard[x]>0)))]:[];
  p.medals=B.maps.map((m,i)=>Array.isArray(raw.medals?.[i])?[...new Set(raw.medals[i].filter(k=>Object.hasOwn(B.medals,k)))]:[]);
  const restored=raw.checkpoint&&root.SmileDefense.restore(raw.checkpoint);
  p.tutorial=raw.tutorial===true;p.adult=raw.adult===true&&hardAvailable(p);p.checkpoint=restored&&(restored.adult?hardAvailable(p):restored.stage<=p.unlocked)?raw.checkpoint:null;
  p.updated=finite(raw.updated,1e16)?raw.updated:Date.now();return p;
 }
 // Progresso só soma. Uma fase vencida fica liberada para sempre neste aparelho:
 // uma aba antiga (ou outra aba aberta) que salva ao fechar nunca apaga estrelas,
 // recordes, conquistas nem fases liberadas. Só "Apagar meu progresso" zera.
 function merge(p,d){
  for(const key of ['stars','hard','best','highest'])p[key]=p[key].map((v,i)=>Math.max(v,d[key][i]||0));
  p.medals=p.medals.map((m,i)=>[...new Set([...m,...(d.medals[i]||[])])]);
  p.cards=[...new Set([...p.cards,...d.cards])].sort((a,b)=>a-b);
  p.tutorial=p.tutorial||d.tutorial;
  p.unlocked=Math.max(p.unlocked,d.unlocked);
  return derive(p);
 }
 class Store{
  constructor(){this.available=true;this.mode='home';try{this.mode=sessionStorage.getItem(MODE)==='shared'?'shared':'home';}catch(_){}
   this.profile=this.load();
  }
  read(storage,key){try{const value=storage.getItem(key);return value?JSON.parse(value):null;}catch(_){return null;}}
  load(){
   let raw;try{raw=this.read(this.mode==='home'?localStorage:sessionStorage,this.mode==='home'?KEY:SESSION);}catch(_){this.available=false;}
   if(this.mode==='shared'&&raw&&Date.now()-raw.updated>TTL)raw=null;
   if(!raw&&this.mode==='home'){
    try{const old=this.read(localStorage,'luccare_aventura_v1');if(old&&old.mode==='home'&&Array.isArray(old.cards)){raw=fresh();raw.cards=[...new Set(old.cards.filter(x=>[0,1,2].includes(x)))];raw.cards.forEach(i=>raw.stars[i]=1);}}catch(_){}
   }
   return sanitize(raw);
  }
  save(wipe=false){this.profile.updated=Date.now();try{const storage=this.mode==='home'?localStorage:sessionStorage,key=this.mode==='home'?KEY:SESSION;
   if(!wipe){const disk=this.read(storage,key);if(disk&&disk.version===2)merge(this.profile,sanitize(disk));}
   // fase vencida = próxima fase liberada, sempre deduzido das estrelas
   derive(this.profile);
   storage.setItem(key,JSON.stringify(this.profile));this.available=true;}catch(_){this.available=false;}return this.available;}
  // traz para esta aba o progresso salvo por outra aba
  refresh(){try{const disk=this.read(this.mode==='home'?localStorage:sessionStorage,this.mode==='home'?KEY:SESSION);if(disk&&disk.version===2)merge(this.profile,sanitize(disk));}catch(_){}return this.profile;}
  switchMode(mode){this.mode=mode;try{sessionStorage.setItem(MODE,mode);}catch(_){}this.profile=mode==='shared'?fresh():this.load();this.save(mode==='shared');return this.profile;}
  reset(){this.profile=fresh();this.save(true);return this.profile;}
  expired(){return this.mode==='shared'&&Date.now()-this.profile.updated>TTL;}
 }
 root.LuccareSave={Store,fresh,sanitize,merge,hardAvailable,KEY};
})(window);
