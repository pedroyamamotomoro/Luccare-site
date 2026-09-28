/* Sensação de jogo: partículas, textos que sobem, avisos de onda e tremidas.
   É só apresentação. Vive fora do estado da simulação: não altera moedas, vida,
   alvos nem resultado, e por isso não participa dos testes de determinismo.
   O relógio desta camada é passado pelo game.js: anda com a velocidade do jogo
   durante a onda, em tempo real na preparação e para quando o jogo pausa. */
(function(root){
 'use strict';
 const TAU=Math.PI*2,B=root.LuccareBalance;
 const rand=(a,b)=>a+Math.random()*(b-a);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 // cor da "poeirinha" de cada visitante ao ser vencido
 const TINT={basic:['#e9b23f','#fff1c4'],sugar:['#f3a3bd','#fff'],swarm:['#7fbf73','#e6f7dc'],plaque:['#d8b38a','#f5e2c8'],acid:['#c6b5ea','#efe6ff'],mini:['#e3a7a6','#ffe0dc'],boss:['#c9a0dc','#f6d57a'],mender:['#8fd3c5','#fff4b8']};
 const SHOT={brush:['#ffffff','#bfe9f2'],fluoride:['#e6d8fb','#b89ce0'],water:['#bff4fb','#66c2d3'],floss:['#f4fff0','#9cc9a9']};
 const CONFETTI=['#f6c06f','#f9b1b4','#b4d7b7','#acc2e8','#c8b3ea','#fff4c9'];
 const LIMIT={parts:260,texts:26,rings:40};

 class Juice{
  constructor(reduced){this.reduced=!!reduced;this.reset();}
  reset(){this.parts=[];this.texts=[];this.rings=[];this.banner=null;this.shakeT=0;this.shakeDur=0;this.shakePow=0;this.born=new Map();this.bump=new Map();this.goalFlash=0;this.vignette=0;this.now=0;this.trailClock=0;}

  // ── fábrica de efeitos ─────────────────────────────────────────
  kick(power,duration){if(this.reduced)return;if(power>=this.shakePow*(this.shakeT/(this.shakeDur||1))){this.shakePow=power;this.shakeDur=duration;this.shakeT=duration;}}
  part(p){if(this.parts.length>=LIMIT.parts)this.parts.shift();this.parts.push(p);}
  burst(x,y,colors,n,speed=[70,150],size=[2.5,5],gravity=260,life=[.35,.6],shape='dot'){
   if(this.reduced)n=Math.min(n,4);
   for(let i=0;i<n;i++){const a=rand(0,TAU),v=rand(...speed),l=rand(...life);
    this.part({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-rand(20,60),g:gravity,life:l,max:l,r:rand(...size),color:colors[i%colors.length],shape,spin:rand(-8,8),rot:rand(0,TAU)});}
  }
  ring(x,y,r0,r1,life,color,width=3){if(this.rings.length>=LIMIT.rings)this.rings.shift();this.rings.push({x,y,r0,r1,life,max:life,color,width});}
  text(x,y,text,color,size=17,life=.85){if(this.texts.length>=LIMIT.texts)this.texts.shift();this.texts.push({x,y,vy:-46,text,color,size,life,max:life});}
  say(title,sub,tone='wave',life=1.7){this.banner={title,sub,tone,life,max:life};}

  // ── reação aos eventos do motor ────────────────────────────────
  feed(ev,s){
   switch(ev.type){
    case 'pop':{
     const c=TINT[ev.kind]||TINT.basic;this.burst(ev.x,ev.y,c,ev.kind==='mini'?20:12,[80,170+(ev.r||16)*2],[3,6.2]);
     this.ring(ev.x,ev.y,(ev.r||16)*.5,(ev.r||16)*1.7,.28,'#fffdf2',3);
     if(ev.reward)this.text(ev.x,ev.y-(ev.r||16)-4,'+'+ev.reward,'#9a6508',ev.kind==='mini'?26:20);
     break;}
    case 'bossDown':{
     this.burst(ev.x,ev.y,CONFETTI,40,[120,300],[3,6.5],300,[.7,1.2],'confetti');
     this.ring(ev.x,ev.y,20,150,.6,'#fff4c4',6);this.ring(ev.x,ev.y,10,95,.45,'#c9a0dc',4);
     this.text(ev.x,ev.y-54,'+'+(ev.reward||0),'#b9801f',30,1.3);
     this.say('Maestro vencido!','O sorriso continua protegido','good',1.8);this.kick(9,.55);break;}
    case 'leak':{
     this.goalFlash=.7;this.vignette=.45;
     const [gx,gy]=goal(s);this.text(gx,gy-40,'−'+(ev.leak||1)+' ♥','#d0677c',ev.kind==='boss'?30:19,1);
     this.burst(gx,gy-8,['#f7b7c4','#ffe3e8'],8,[50,120],[2.5,4.5],180);
     this.kick(ev.kind==='boss'?11:3.5,ev.kind==='boss'?.6:.28);break;}
    case 'buy':{
     const t=s.towers[ev.pad];if(t)this.born.set(t.id,0);
     this.burst(ev.x,ev.y+8,['#efe2c6','#fffaf0','#d9c7a3'],12,[40,110],[2.5,5],320,[.3,.5]);
     this.ring(ev.x,ev.y+8,10,52,.4,'#fffaf0',4);break;}
    case 'upgrade':{
     const t=s.towers[ev.pad];if(t)this.bump.set(t.id,0);
     this.burst(ev.x,ev.y-40,['#ffe9a6','#fff9df','#f6c06f'],18,[80,190],[3,6],120,[.5,.85],'star');
     this.ring(ev.x,ev.y-30,14,70,.5,'#ffe9a6',5);break;}
    case 'sell':this.burst(ev.x,ev.y,['#e8e4d8','#fffdf5'],10,[40,100],[3,6],150,[.35,.6],'bubble');this.ring(ev.x,ev.y,8,40,.35,'#e8e4d8',3);break;
    case 'wave':this.say('Onda '+ev.wave,ev.name||'','wave',1.6);break;
    case 'clear':this.say('Onda concluída!','+'+(ev.reward||0)+' moedas','good',1.6);break;
    case 'boss':this.kick(ev.kind==='boss'?6:4,.4);break;
    case 'summon':this.ring(ev.x,ev.y,16,90,.5,'#c8b3ea',5);this.kick(4,.3);break;
    case 'roar':this.kick(4.5,.45);break;
    case 'attack':{
     if(ev.tower==='floss'||ev.x===undefined)break;
     const c=SHOT[ev.tower]||SHOT.brush;this.burst(ev.x,ev.y-56,c,this.reduced?0:3,[25,70],[2,3.5],-30,[.18,.3],'bubble');break;}
   }
  }

  // ── passagem do tempo ──────────────────────────────────────────
  update(dt,s){
   if(!(dt>0))return;this.now+=dt;
   for(const p of this.parts){p.life-=dt;p.vy+=p.g*dt;p.vx*=1-1.6*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.spin*dt;}
   this.parts=this.parts.filter(p=>p.life>0);
   for(const t of this.texts){t.life-=dt;t.y+=t.vy*dt;t.vy*=1-2.2*dt;}this.texts=this.texts.filter(t=>t.life>0);
   for(const r of this.rings)r.life-=dt;this.rings=this.rings.filter(r=>r.life>0);
   if(this.banner){this.banner.life-=dt;if(this.banner.life<=0)this.banner=null;}
   this.shakeT=Math.max(0,this.shakeT-dt);this.goalFlash=Math.max(0,this.goalFlash-dt);this.vignette=Math.max(0,this.vignette-dt);
   for(const [k,v] of this.born){if(v>.6)this.born.delete(k);else this.born.set(k,v+dt);}
   for(const [k,v] of this.bump){if(v>.45)this.bump.delete(k);else this.bump.set(k,v+dt);}
   // rastro dos projéteis: espuma, bolha e gotinha
   if(s&&!this.reduced){this.trailClock+=dt;if(this.trailClock>=.035){this.trailClock=0;
    for(const p of s.projectiles){const c=SHOT[p.type];if(!c)continue;this.part({x:p.x+rand(-2,2),y:p.y+rand(-2,2),vx:0,vy:0,g:-10,life:.2,max:.2,r:p.type==='fluoride'?4:2.6,color:c[0],shape:'bubble',spin:0,rot:0});}}}
  }

  // ── consultas usadas pelo renderizador ─────────────────────────
  offset(){if(this.shakeT<=0)return [0,0];const k=this.shakePow*(this.shakeT/this.shakeDur);return [rand(-k,k),rand(-k,k)];}
  towerScale(t){
   let sx=1,sy=1;const age=this.born.get(t.id);
   if(age!==undefined&&!this.reduced){const u=clamp(age/.45,0,1),e=u<1?1-Math.pow(1-u,3)*Math.cos(u*TAU*1.25):1;sx*=.35+.65*e;sy*=.35+.65*e;}
   const up=this.bump.get(t.id);if(up!==undefined&&!this.reduced){const k=Math.sin(clamp(up/.45,0,1)*Math.PI)*.16;sx*=1+k;sy*=1+k;}
   if(t.recoil>0&&!this.reduced){const k=t.recoil*.45;sx*=1+k;sy*=1-k;}
   return [sx,sy];
  }

  // ── desenho por cima do mundo ──────────────────────────────────
  draw(g,s){
   for(const r of this.rings){const a=r.life/r.max,u=1-a;g.globalAlpha=a;g.beginPath();g.arc(r.x,r.y,r.r0+(r.r1-r.r0)*(1-a*a),0,TAU);g.strokeStyle=r.color;g.lineWidth=r.width*a+.5;g.stroke();}
   for(const p of this.parts){const a=clamp(p.life/p.max,0,1);g.globalAlpha=Math.min(1,a*1.4);g.fillStyle=p.color;
    if(p.shape==='confetti'){g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillRect(-p.r,-p.r*.45,p.r*2,p.r*.9);g.restore();}
    else if(p.shape==='star'){star(g,p.x,p.y,p.r*(.6+.4*a),p.color);}
    else if(p.shape==='bubble'){g.beginPath();g.arc(p.x,p.y,p.r*(.7+.3*a),0,TAU);g.fill();g.globalAlpha*=.8;g.strokeStyle='#ffffffcc';g.lineWidth=1;g.stroke();}
    else{g.beginPath();g.arc(p.x,p.y,p.r*a+.4,0,TAU);g.fill();}}
   g.globalAlpha=1;
   if(this.goalFlash>0){const [gx,gy]=goal(s),a=this.goalFlash/.7;g.globalAlpha=a*.55;g.beginPath();g.arc(gx,gy,48+(1-a)*30,0,TAU);g.fillStyle='#ffb3c1';g.fill();g.globalAlpha=1;}
   g.textAlign='center';g.lineJoin='round';
   for(const t of this.texts){const a=clamp(t.life/t.max*1.6,0,1),pop=1+Math.max(0,.25-(t.max-t.life))*1.4;g.globalAlpha=a;g.font='bold '+Math.round(t.size*pop)+'px Trebuchet MS, sans-serif';g.lineWidth=6;g.strokeStyle='#fffdf4';g.strokeText(t.text,t.x,t.y);g.fillStyle=t.color;g.fillText(t.text,t.x,t.y);}
   g.globalAlpha=1;
   if(this.vignette>0){const a=this.vignette/.45,v=g.createRadialGradient(450,280,180,450,280,560);v.addColorStop(0,'#ffb3c100');v.addColorStop(1,'rgba(232,120,146,'+(.35*a).toFixed(3)+')');g.fillStyle=v;g.fillRect(0,0,900,560);}
   if(this.banner)banner(g,this.banner,this.reduced);
  }
 }
 function goal(s){const m=B.maps[s.stage],end=m.path.at(-1);return [Math.min(855,end[0]),Math.min(505,end[1]-8)];}
 function star(g,x,y,r,c){g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,k=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*k,y+Math.sin(a)*k);}g.closePath();g.fillStyle=c;g.fill();}
 function banner(g,b,reduced){
  const u=1-b.life/b.max,inn=clamp(u/.18,0,1),out=clamp((1-u)/.2,0,1),a=Math.min(inn,out),ease=1-Math.pow(1-inn,3);
  g.save();g.font='bold 34px Trebuchet MS, sans-serif';const tw=g.measureText(b.title).width;
  g.font='15px Trebuchet MS, sans-serif';const sw=b.sub?g.measureText(b.sub).width:0;
  const y=reduced?250:210+40*(1-ease),w=clamp(Math.max(tw,sw)+84,280,660);
  g.globalAlpha=a;g.textAlign='center';
  const good=b.tone==='good',fill=good?'#fff6dc':'#fffdf6',edge=good?'#e7c16c':'#9cc4b4';
  g.beginPath();g.roundRect(450-w/2,y-44,w,b.sub?86:64,22);g.fillStyle=fill+'f2';g.fill();g.lineWidth=3;g.strokeStyle=edge;g.stroke();
  g.fillStyle=good?'#8a6a24':'#2f6a5f';g.font='bold 34px Trebuchet MS, sans-serif';g.fillText(b.title,450,y+(b.sub?-6:6));
  if(b.sub){g.fillStyle='#6f7a6d';g.font='15px Trebuchet MS, sans-serif';g.fillText(b.sub,450,y+22);}
  g.restore();
 }
 root.LuccareJuice=Juice;
})(window);
