(function(root){
 'use strict';
 const B=typeof module!=='undefined'&&module.exports?require('./balance.js'):root.LuccareBalance;
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function emit(s,type,extra={}){s.events.push({type,...extra});if(s.events.length>128)s.events.shift();}
 function effect(s,type,extra={}){if(s.effects.length<110)s.effects.push({type,life:.35,max:.35,...extra});}
 function hit(s,e,value,type,source,pierce=0){
  if(e.hp<=0)return;
  const armor=type==='floss'?0:Math.max(e.armor||0,e.type==='boss'&&e.age%8<3?.62:0)*(1-pierce);
  const actual=Math.min(e.hp,value*(1-armor));e.hp-=actual;e.hit=.13;
  const tower=s.towers.find(t=>t&&t.id===source);if(tower)tower.damage+=actual;
  if(e.hp<=0&&tower)tower.kills++;
 }
 function target(s,t,v){
  const available=s.enemies.filter(e=>e.hp>0&&!e.gone&&distance(e,t)<=v.range);
  available.sort((a,b)=>t.target==='support'?(Number(b.type==='mender')-Number(a.type==='mender')||b.d-a.d):t.target==='strong'?b.hp-a.hp:t.target==='last'?a.d-b.d:b.d-a.d);
  return available[0];
 }
 function buff(s,t){
  let haste=1,power=1;
  for(const support of s.towers){if(!support||support.type!=='saliva'||support===t)continue;const v=B.stats(support);
   if(distance(t,support)<=v.range){haste=Math.min(haste,v.haste);power=Math.max(power,v.power);}
  }
  return {haste,power};
 }
 function lineDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(d2||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
 function shoot(s,t,v,enemy,power){
  t.recoil=.2;t.aim=Math.atan2(enemy.y-t.y,enemy.x-t.x);emit(s,'attack',{tower:t.type,x:t.x,y:t.y,pad:t.pad});
  if(t.type==='floss'){
   const dx=enemy.x-t.x,dy=enemy.y-t.y,len=Math.hypot(dx,dy)||1;
   const end={x:t.x+dx/len*(v.range+145),y:t.y+dy/len*(v.range+145)};
   const targets=s.enemies.filter(e=>e.hp>0&&lineDistance(e,t,end)<e.radius+13).sort((a,b)=>distance(a,t)-distance(b,t)).slice(0,v.pierce);
   for(const e of targets)hit(s,e,v.damage*power,t.type,t.id);
   effect(s,'floss',{x:t.x,y:t.y,tx:end.x,ty:end.y,life:.22,max:.22});return;
  }
  s.projectiles.push({x:t.x,y:t.y,tx:enemy.x,ty:enemy.y,target:enemy.id,source:t.id,type:t.type,damage:v.damage*power,speed:v.projectile,splash:v.splash||0,slow:v.slow||1,duration:v.duration||0,push:v.push||0,pierce:v.armorPierce||0,life:3});
 }
 function impact(s,p){
  const targets=p.splash?s.enemies.filter(e=>e.hp>0&&distance(e,p)<=p.splash):s.enemies.filter(e=>e.id===p.target&&e.hp>0);
  for(const enemy of targets){
   hit(s,enemy,p.damage,p.type,p.source,p.pierce);
   if(p.slow<1){enemy.slow=Math.min(enemy.slow,p.slow);enemy.slowUntil=Math.max(enemy.slowUntil,s.time+p.duration);}
   if(p.push&&s.time>=enemy.pushUntil&&enemy.pushed<90){const push=Math.min(p.push,90-enemy.pushed)*(enemy.type==='boss'?.15:1);enemy.d=Math.max(0,enemy.d-push);enemy.pushed+=push;enemy.pushUntil=s.time+2.4;}
  }
  effect(s,p.type==='fluoride'?'bubble':p.type==='water'?'water':'foam',{x:p.x,y:p.y,radius:p.splash||18,life:p.type==='fluoride'?.55:.26,max:p.type==='fluoride'?.55:.26});
 }
 function step(s,dt){
  for(const e of s.effects)e.life-=dt;s.effects=s.effects.filter(e=>e.life>0);
  for(const tower of s.towers){if(!tower)continue;tower.recoil=Math.max(0,tower.recoil-dt);tower.upFlash=Math.max(0,tower.upFlash-dt);
   if(tower.type==='saliva')continue;tower.cooldown-=dt;if(tower.cooldown>0)continue;
   const v=B.stats(tower),e=target(s,tower,v);if(!e){tower.cooldown=0;continue;}
   const boost=buff(s,tower);shoot(s,tower,v,e,boost.power);tower.cooldown+=v.interval*boost.haste;
  }
  for(const p of s.projectiles){
   p.life-=dt;if(p.life<=0)continue;const e=s.enemies.find(e=>e.id===p.target&&e.hp>0&&!e.gone);
   if(e){p.tx=e.x;p.ty=e.y;}const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy),travel=p.speed*dt;
   if(d<=travel+2){p.x=p.tx;p.y=p.ty;impact(s,p);p.life=0;}else{p.x+=dx/d*travel;p.y+=dy/d*travel;}
  }
  s.projectiles=s.projectiles.filter(p=>p.life>0);
 }
 const api={step,hit,effect,emit,target,buff,lineDistance};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LuccareCombat=api;
})(typeof window!=='undefined'?window:globalThis);
