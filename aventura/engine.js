(function(root){
 'use strict';
 const B=typeof module!=='undefined'&&module.exports?require('./balance.js'):root.LuccareBalance;
 const C=typeof module!=='undefined'&&module.exports?require('./combat.js'):root.LuccareCombat;
 function route(stage){const points=B.maps[stage].path,lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));return {points,lengths,total:lengths.reduce((a,b)=>a+b,0)};}
 function point(path,d){for(let i=0;i<path.lengths.length;i++){if(d<=path.lengths[i]){const t=Math.max(0,d)/path.lengths[i];return {x:path.points[i][0]+(path.points[i+1][0]-path.points[i][0])*t,y:path.points[i][1]+(path.points[i+1][1]-path.points[i][1])*t};}d-=path.lengths[i];}const p=path.points.at(-1);return {x:p[0],y:p[1]};}
 // opts.tools: maior índice de torre liberado (padrão: o da própria fase).
 // opts.adult: desafio adulto. Sem opts, a partida é idêntica à de antes.
 function create(stage=0,opts={}){
  stage=Number.isInteger(stage)&&stage>=0&&stage<B.maps.length?stage:0;
  const tools=Number.isInteger(opts.tools)?Math.max(stage,Math.min(Object.keys(B.towers).length-1,opts.tools)):stage,adult=opts.adult===true;
  return {stage,tools,adult,path:route(stage),phase:'prep',wave:0,cash:Math.round((B.economy.start+stage*25)*(adult?B.adult.cash:1)),lives:B.economy.lives,time:0,waveTime:0,serial:0,towers:Array(B.maps[stage].pads.length).fill(null),enemies:[],projectiles:[],effects:[],events:[],queue:[],spawnIndex:0,abilityUntil:0,abilityCooldown:0,intermission:0,stats:{kills:0,bosses:0,spent:0,earned:0,upgrades:0,leaked:0,score:0},waveReports:[]};
 }
 const actionable=s=>s.phase==='prep'||s.phase==='running';
 function buy(s,pad,type){
  if(!actionable(s)||!B.towerAvailable(s.tools??s.stage,type)||!Number.isInteger(pad)||pad<0||pad>=s.towers.length||s.towers[pad])return false;
  const cost=B.purchaseCost(s.stage,type,s.towers,s.tools??s.stage);if(s.cash<cost)return false;
  const [x,y]=B.maps[s.stage].pads[pad];s.cash-=cost;s.stats.spent+=cost;
  s.towers[pad]={id:++s.serial,type,pad,x,y,rangeBonus:B.maps[s.stage].beacons?.includes(pad)?35:0,level:1,branch:null,invested:cost,cooldown:0,aim:-Math.PI/2,recoil:0,upFlash:.6,target:'first',damage:0,kills:0};C.emit(s,'buy',{pad,x,y});return true;
 }
 function upgrade(s,pad,branch){
  const t=s.towers[pad];if(!actionable(s)||!t||t.level===4||t.level===3&&s.stage<3)return false;
  const spec=B.towers[t.type],cost=t.level===1?spec.upgrade:t.level===2?spec.branchCost:B.economy.masteryCost;
  if(s.cash<cost||t.level===2&&!['a','b'].includes(branch))return false;
  s.cash-=cost;s.stats.spent+=cost;s.stats.upgrades++;t.invested+=cost;t.level++;t.branch=t.level===3?branch:t.branch;t.upFlash=1;
  C.effect(s,'upgrade',{x:t.x,y:t.y,radius:58,life:.7,max:.7});C.emit(s,'upgrade',{pad,x:t.x,y:t.y,level:t.level});return true;
 }
 function sell(s,pad){const t=s.towers[pad];if(!actionable(s)||!t)return false;s.cash+=Math.floor(t.invested*B.economy.sell+1e-9);s.towers[pad]=null;C.emit(s,'sell',{pad,x:t.x,y:t.y});return true;}
 function setTarget(s,pad,mode){if(!actionable(s)||!s.towers[pad]||!['first','strong','last','support'].includes(mode))return false;s.towers[pad].target=mode;return true;}
 function terrain(s,e){return (B.maps[s.stage].zones||[]).find(z=>e.x>=z.x&&e.x<=z.x+z.w&&e.y>=z.y&&e.y<=z.y+z.h)?.factor||1;}
 function buildQueue(w){let at=.7;const q=[];for(const g of w.groups){for(let i=0;i<g.n;i++){q.push({at,type:g.type,scale:w.scale});at+=g.gap;}at+=.8;}return q;}
 function start(s){
  if(s.phase!=='prep'||s.wave>=B.maps[s.stage].waves.length||!s.towers.some(t=>t&&t.type!=='saliva'))return false;
  const w=B.maps[s.stage].waves[s.wave];s.queue=buildQueue(w);s.wave++;s.waveTime=0;s.spawnIndex=0;s.phase='running';s.intermission=0;s.waveStart={lives:s.lives,cash:s.cash,kills:s.stats.kills};
  C.emit(s,'wave',{wave:s.wave,name:w.name});return true;
 }
 function spawn(s,type,scale=1,d=0,helper=false){
  if(s.enemies.length>=100)return;const b=B.enemies[type],A=s.adult?B.adult:null,hp=b.hp*scale*(A?(Array.isArray(A.hp)?A.hp[s.stage]:A.hp):1);
  s.enemies.push({id:++s.serial,type,d,...point(s.path,d),hp,max:hp,speed:b.speed*(A?A.speed:1),armor:b.armor||0,reward:helper?0:A?Math.round(b.reward*A.reward):b.reward,radius:b.radius,leak:b.leak,age:0,slow:1,slowUntil:0,pushUntil:0,pushed:0,hit:0,phase:0,helper,scale,gone:false});
  if(type==='boss'||type==='mini')C.emit(s,'boss',{name:b.name,kind:type});
 }
 function roar(s){if(s.phase!=='running'||s.abilityCooldown>0)return false;s.abilityCooldown=B.ability.cooldown;s.abilityUntil=s.time+B.ability.duration;C.effect(s,'roar',{x:450,y:280,radius:490,life:1,max:1});C.emit(s,'roar');return true;}
 function pause(s){if(s.phase==='running'){s.phase='paused';return true;}return false;}
 function resume(s){if(s.phase==='paused'){s.phase='running';return true;}return false;}
 function step(s,dt){
  if(s.phase!=='running')return;
  s.time+=dt;s.waveTime+=dt;s.abilityCooldown=Math.max(0,s.abilityCooldown-dt);
  while(s.spawnIndex<s.queue.length&&s.queue[s.spawnIndex].at<=s.waveTime){const q=s.queue[s.spawnIndex++];spawn(s,q.type,q.scale);}
  for(const e of s.enemies){
   if(e.hp<=0)continue;e.age+=dt;e.hit=Math.max(0,e.hit-dt);
   if(e.slowUntil<=s.time)e.slow=1;
   let factor=Math.max(e.type==='boss'?.8:.5,e.slow);
   if(s.time<s.abilityUntil)factor=Math.min(factor,e.type==='boss'?B.ability.bossSlow:B.ability.slow);
   if(e.type==='acid'&&e.hp<e.max*.45)factor*=1.35;
   e.d+=e.speed*factor*terrain(s,e)*dt;Object.assign(e,point(s.path,e.d));
   if(e.type==='boss'&&((e.phase===0&&e.hp<e.max*.65)||(e.phase===1&&e.hp<e.max*.3))){
    e.phase++;for(let k=0;k<5;k++)spawn(s,'swarm',e.scale,Math.max(0,e.d-k*22),true);C.emit(s,'summon',{x:e.x,y:e.y});C.effect(s,'summon',{x:e.x,y:e.y,radius:70,life:.6,max:.6});
   }
   if(e.d>=s.path.total){e.gone=true;s.lives=Math.max(0,s.lives-e.leak);s.stats.leaked++;C.emit(s,'leak',{x:e.x,y:e.y,kind:e.type,leak:e.leak});}
  }
  s.enemies=s.enemies.filter(e=>!e.gone);
  // Apprentice auras never stack and never heal bosses, other apprentices or dead units.
  const healers=s.enemies.filter(e=>e.type==='mender'&&e.hp>0);
  for(const e of s.enemies)if(e.hp>0&&e.type!=='boss'&&e.type!=='mender'&&healers.some(h=>Math.hypot(e.x-h.x,e.y-h.y)<=100))e.hp=Math.min(e.max,e.hp+e.max*.018*dt);
  C.step(s,dt);
  const dead=s.enemies.filter(e=>e.hp<=0);s.enemies=s.enemies.filter(e=>e.hp>0);
  for(const e of dead){
   s.cash+=e.reward;s.stats.earned+=e.reward;s.stats.kills++;s.stats.score+=Math.round(e.max)+(e.type==='boss'?500:0);
   if(e.type==='boss')s.stats.bosses++;
   C.effect(s,e.type==='boss'?'celebrate':'pop',{x:e.x,y:e.y,radius:e.radius,life:e.type==='boss'?1:.3,max:e.type==='boss'?1:.3});
   C.emit(s,e.type==='boss'?'bossDown':'pop',{x:e.x,y:e.y,kind:e.type,reward:e.reward,r:e.radius});
   if(e.type==='mini')for(let i=0;i<4;i++)spawn(s,'swarm',e.scale,Math.max(0,e.d-i*20),true);
  }
  if(s.lives<=0){s.phase='lost';tidy(s);C.emit(s,'lost');}
  else if(s.spawnIndex===s.queue.length&&s.enemies.length===0){
   const reward=Math.round((B.economy.waveBase+s.wave*B.economy.waveGrowth)*(s.adult?B.adult.reward:1));s.cash+=reward;s.stats.earned+=reward;s.stats.score+=100+s.lives*5;
   s.waveReports.push({wave:s.wave,lives:s.lives,cash:s.cash,seconds:+s.waveTime.toFixed(2),kills:s.stats.kills-s.waveStart.kills,leaks:s.waveStart.lives-s.lives});
   s.projectiles=[];tidy(s);s.phase=s.wave===B.maps[s.stage].waves.length?'won':'prep';C.emit(s,s.phase==='won'?'won':'clear',{reward});
  }
 }
 // Mini-reset do fim da onda. O último golpe e o fim da onda podem acontecer no
 // mesmo passo: sem isso, a linha do fio, os estouros e o recuo da torre ficavam
 // congelados na tela durante toda a preparação (step() não roda fora do combate).
 function tidy(s){s.effects=[];for(const t of s.towers)if(t){t.recoil=0;}}
 // Fora do combate o mundo continua "assentando" em tempo real: o brilho de uma
 // torre recém-construída e qualquer efeito restante se apagam sozinhos.
 // Só mexe em estado visual; nunca em moedas, vida, alvos ou recargas.
 function settle(s,dt){
  if(s.phase==='running'||s.phase==='paused'||!(dt>0))return;
  for(const e of s.effects)e.life-=dt;s.effects=s.effects.filter(e=>e.life>0);
  for(const t of s.towers)if(t){t.recoil=Math.max(0,t.recoil-dt);t.upFlash=Math.max(0,t.upFlash-dt);}
 }
 function checkpoint(s){
  if(s.phase!=='prep')return null;
  return {stage:s.stage,tools:s.tools,adult:s.adult,wave:s.wave,cash:s.cash,lives:s.lives,time:s.time,abilityCooldown:s.abilityCooldown,serial:s.serial,stats:{...s.stats},towers:s.towers.map(t=>t?{type:t.type,level:t.level,branch:t.branch,target:t.target,invested:t.invested,id:t.id,damage:t.damage,kills:t.kills,cooldown:t.cooldown}:null)};
 }
 function restore(c){
  if(!c||!Number.isInteger(c.stage)||!B.maps[c.stage]||!Number.isInteger(c.wave)||c.wave<0||c.wave>=B.maps[c.stage].waves.length)return null;
  const finite=(v,max=1e7)=>Number.isFinite(v)&&v>=0&&v<=max;
  if(!finite(c.cash)||!finite(c.lives,20)||c.lives<1||!finite(c.time)||!finite(c.abilityCooldown,32)||!finite(c.serial)||!Array.isArray(c.towers)||![8,B.maps[c.stage].pads.length].includes(c.towers.length))return null;
  const tools=c.tools===undefined?c.stage:c.tools,adult=c.adult===undefined?false:c.adult;
  if(!Number.isInteger(tools)||tools<c.stage||tools>=Object.keys(B.towers).length||typeof adult!=='boolean')return null;
  const s=create(c.stage,{tools,adult});s.wave=c.wave;s.cash=c.cash;s.lives=c.lives;s.time=c.time;s.serial=c.serial;s.abilityCooldown=c.abilityCooldown;
  if(!c.stats||Object.keys(s.stats).some(k=>!finite(c.stats[k])))return null;s.stats={...c.stats};
  for(let i=0;i<c.towers.length;i++){const t=c.towers[i];if(!t)continue;
   if(!Object.hasOwn(B.towers,t.type)||!B.towerAvailable(tools,t.type)||![1,2,3,4].includes(t.level)||t.level===4&&c.stage<3||t.level>=3&&!['a','b'].includes(t.branch)||!['first','strong','last','support'].includes(t.target)||!finite(t.id)||!finite(t.invested)||!finite(t.damage)||!finite(t.kills)||(t.cooldown!==undefined&&!finite(t.cooldown,3)))return null;
   const [x,y]=B.maps[c.stage].pads[i];s.towers[i]={type:t.type,level:t.level,branch:t.level>=3?t.branch:null,target:t.target,invested:t.invested,id:t.id,damage:t.damage,kills:t.kills,pad:i,x,y,rangeBonus:B.maps[c.stage].beacons?.includes(i)?35:0,cooldown:t.cooldown||0,aim:-Math.PI/2,recoil:0,upFlash:0};
  }
  return s;
 }
 const api={create,route,point,buy,upgrade,sell,setTarget,start,step,settle,tidy,roar,pause,resume,checkpoint,restore,buildQueue,spawn,terrain};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SmileDefense=api;
})(typeof window!=='undefined'?window:globalThis);
