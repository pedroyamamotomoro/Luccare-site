(function(root){
 'use strict';
 const B=root.LuccareBalance,TAU=Math.PI*2;
 const circle=(g,x,y,r,fill,stroke)=>{g.beginPath();g.arc(x,y,r,0,TAU);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.stroke();}};
 const rect=(g,x,y,w,h,r,fill,stroke)=>{g.beginPath();g.roundRect(x,y,w,h,r);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.stroke();}};
 function face(g,x,y,scale=1){g.save();g.translate(x,y);g.scale(scale,scale);circle(g,-7,-2,2.8,'#294d45');circle(g,7,-2,2.8,'#294d45');g.beginPath();g.arc(0,3,5,0,Math.PI);g.lineWidth=2;g.strokeStyle='#294d45';g.stroke();g.restore();}
 function tooth(g,x,y,scale=1){g.save();g.translate(x,y);g.scale(scale,scale);g.lineWidth=3;g.beginPath();g.moveTo(0,-24);g.bezierCurveTo(-28,-47,-47,-19,-34,9);g.bezierCurveTo(-25,53,-15,48,-9,26);g.bezierCurveTo(-3,6,5,9,10,27);g.bezierCurveTo(18,51,27,44,36,8);g.bezierCurveTo(48,-24,26,-46,0,-24);g.fillStyle='#fffef3';g.fill();g.strokeStyle='#7a9c8b';g.stroke();face(g,0,-4,1.2);g.restore();}
 function lion(g,x,y,r){g.save();g.translate(x,y);g.scale(r/32,r/32);for(let i=0;i<10;i++){const a=i/10*TAU;circle(g,Math.cos(a)*22,Math.sin(a)*22,12,'#784d2a');}circle(g,0,0,24,'#dca35f');circle(g,-18,-14,7,'#dca35f');circle(g,18,-14,7,'#dca35f');circle(g,-8,-4,3,'#36291e');circle(g,8,-4,3,'#36291e');rect(g,-12,8,24,13,6,'#a94c54');rect(g,-8,8,6,6,1,'#fffaf0');rect(g,2,8,6,6,1,'#fffaf0');g.restore();}
 function towerArt(g,type,level=1,branch=null,attack=0){
  const asset=root.LuccareAssets,key=asset?.towerKey(type,level,branch),height=level===4?103:level===3?94:level===2?85:77;
  if(asset?.has(key)){g.save();g.translate(0,-attack*9);asset.draw(g,key,-43,-height+13,86,height);g.restore();for(let i=0;i<level;i++)circle(g,(i-(level-1)/2)*8,17,2.6,'#fff0ae','#977447');return;}
  g.lineJoin='round';g.lineCap='round';g.lineWidth=2.7;const color=B.towers[type].color;
  circle(g,0,10,25,'#466b5633');rect(g,-25,-1,50,26,10,'#f9f8eb','#537e70');rect(g,-22,12,44,10,5,color);
  if(level>1){g.strokeStyle=level===4?'#bd89bf':level===3?'#d9a344':'#8bb7a0';g.lineWidth=level===4?5:3.5;g.beginPath();g.ellipse(0,16,28,13,0,0,TAU);g.stroke();if(level===4){circle(g,-23,9,4,'#fff4bb');circle(g,23,9,4,'#fff4bb');}}
  g.save();g.translate(0,-attack*18);
  if(type==='brush'){
   rect(g,-9,-41,18,46,7,'#5faccd','#365f66');rect(g,-19,-60,38,27,8,'#94c9dc','#365f66');
   for(let k=0;k<5;k++)rect(g,-15+k*6,-66,5,16,2,'#fffdf0','#d1e5df');face(g,0,-26,.75);
   if(level>=3){circle(g,branch==='a'?-19:19,-41,8,branch==='a'?'#e8bf68':'#b99de1','#456d66');}
  }else if(type==='floss'){
   rect(g,-24,-39,48,40,12,color,'#436f60');rect(g,-20,-42,40,8,4,'#c9e8ce','#436f60');
   g.beginPath();g.moveTo(-13,-42);g.bezierCurveTo(-35,-83,36,-84,15,-42);g.strokeStyle='#f9fff3';g.lineWidth=7;g.stroke();g.strokeStyle='#698f77';g.lineWidth=2;g.stroke();face(g,0,-17,.8);
   if(level>=3){g.beginPath();g.moveTo(-17,-45);g.quadraticCurveTo(0,-88,18,-45);g.strokeStyle=branch==='a'?'#fffdf0':'#e0bc71';g.lineWidth=3;g.stroke();}
  }else if(type==='fluoride'){
   rect(g,-17,-42,34,43,9,'#e6dcf3','#72658d');rect(g,-10,-58,20,18,5,'#a392c7','#72658d');circle(g,0,-68,10,'#e2d9f9','#9684c1');face(g,0,-23,.75);rect(g,-10,-8,20,5,2,color);
   if(level>=3){circle(g,-23,-45,7,'#d8c5f4');circle(g,22,-38,branch==='a'?10:7,'#d8c5f4');}
  }else if(type==='water'){
   rect(g,-21,-41,42,42,10,'#9ad8df','#3b7d88');rect(g,-16,-35,32,13,5,'#e1f8f1');rect(g,8,-55,28,12,5,'#75bccb','#3b7d88');rect(g,-9,-57,19,18,5,'#e4f6ed','#3b7d88');face(g,0,-18,.75);
   if(level>=3){rect(g,18,-61,24,7,3,branch==='a'?'#eaf9ef':'#f3d584','#3b7d88');}
  }else{
   g.beginPath();g.moveTo(0,-71);g.bezierCurveTo(35,-37,38,-12,0,-7);g.bezierCurveTo(-36,-12,-34,-37,0,-71);g.fillStyle='#acdce4';g.fill();g.strokeStyle='#5d9da6';g.stroke();face(g,0,-30,.85);
   g.beginPath();g.ellipse(0,-23,35,9,-.2,0,TAU);g.strokeStyle=level>=3?'#d6a254':'#f2d48d';g.lineWidth=4;g.stroke();
  }
  g.restore();
  for(let i=0;i<level;i++)circle(g,(i-(level-1)/2)*9,16,3,'#ffefb8','#987e4a');
 }
 function enemyArt(g,type){
  const asset=root.LuccareAssets,radius=B.enemies[type].radius,size=radius*2+12;
  if(asset?.draw(g,type,-size/2,-size/2-3,size,size))return;
  const b=B.enemies[type],r=b.radius;g.lineJoin='round';g.lineWidth=2.5;g.fillStyle=b.color;g.strokeStyle='#725c664f';
  if(type==='sugar'){
   g.save();g.rotate(.2);rect(g,-14,-15,28,28,6,'#fff0e6','#c78da3');g.beginPath();g.moveTo(-12,-9);g.lineTo(0,-15);g.lineTo(11,-8);g.strokeStyle='#e8b8c1';g.stroke();g.restore();g.beginPath();g.moveTo(-13,14);g.lineTo(-24,17);g.moveTo(10,14);g.lineTo(21,18);g.strokeStyle='#c58c9b';g.stroke();face(g,0,0,.7);
  }else if(type==='acid'){
   g.beginPath();g.moveTo(1,-28);g.bezierCurveTo(27,-3,24,21,0,21);g.bezierCurveTo(-28,20,-24,-3,1,-28);g.fill();g.stroke();circle(g,-7,-7,4,'#e8ddfb');face(g,1,4,.85);
  }else if(type==='mender'){
   circle(g,0,0,22,'#82c6b9','#447f7a');rect(g,-24,-23,48,12,6,'#f7da86','#a49d62');circle(g,0,-26,7,'#eac069');face(g,0,2,.85);
   g.beginPath();g.moveTo(20,13);g.lineTo(34,-17);g.strokeStyle='#537d79';g.lineWidth=4;g.stroke();circle(g,35,-20,5,'#fff7be');circle(g,-10,-8,5,'#cbf0d4');
  }else if(type==='plaque'){
   rect(g,-25,-22,50,43,14,b.color,'#95785d');g.beginPath();g.moveTo(-19,-12);g.lineTo(-6,-24);g.lineTo(14,-19);g.lineTo(24,-5);g.strokeStyle='#e5caaa';g.lineWidth=7;g.stroke();rect(g,-11,-9,22,22,7,'#e9cfaa','#aa8b66');face(g,0,2,.7);
  }else if(type==='swarm'){
   for(let i=0;i<3;i++){const a=i/3*TAU;circle(g,Math.cos(a)*7,Math.sin(a)*7,8,b.color,'#6c9b794f');}face(g,0,1,.55);
  }else if(type==='mini'||type==='boss'){
   for(let i=0;i<7;i++){const a=i/7*TAU;circle(g,Math.cos(a)*r*.64,Math.sin(a)*r*.65,r*.48,b.color,'#79516a4f');}
   circle(g,0,0,r*.8,b.color);face(g,0,4,type==='boss'?1.65:1.25);
   if(type==='boss'){
    g.beginPath();g.moveTo(-22,-28);g.lineTo(-29,-49);g.lineTo(-8,-41);g.lineTo(1,-58);g.lineTo(14,-40);g.lineTo(29,-47);g.lineTo(23,-28);g.closePath();g.fillStyle='#efc464';g.fill();g.strokeStyle='#b48b47';g.stroke();
    rect(g,-25,21,50,10,5,'#7b617f');circle(g,0,25,7,'#f5d17a');
   }else{circle(g,-13,-15,9,'#e2b5b0');circle(g,14,-10,6,'#e2b5b0');}
  }else{
   for(let i=0;i<7;i++){const a=i/7*TAU;circle(g,Math.cos(a)*13,Math.sin(a)*13,6,b.color);}
   circle(g,0,0,17,b.color,'#ab8549');circle(g,-7,-9,3,'#f9d98c');face(g,0,2,.8);
  }
 }

 /* O dente que o time protege, no estilo das torres: porcelana brilhante sobre o
    mesmo pedestal de pedra, rosto de brinquedo e expressão que acompanha o sorriso
    restante (feliz, preocupado, assustado) e faz careta quando alguém escapa. */
 function ellipse(g,x,y,rx,ry,fill,stroke,w=2){g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.lineWidth=w;g.strokeStyle=stroke;g.stroke();}}
 function molarPath(g){g.beginPath();g.moveTo(0,-50);g.bezierCurveTo(10,-65,31,-64,33,-44);g.bezierCurveTo(35,-29,31,-17,27,-7);g.bezierCurveTo(23,5,21,15,14,17);g.bezierCurveTo(8,19,6,6,4,-1);g.bezierCurveTo(2,-6,-2,-6,-4,-1);g.bezierCurveTo(-6,6,-8,19,-14,17);g.bezierCurveTo(-21,15,-23,5,-27,-7);g.bezierCurveTo(-31,-17,-35,-29,-33,-44);g.bezierCurveTo(-31,-64,-10,-65,0,-50);g.closePath();}
 function sparkle4(g,x,y,r,a){g.save();g.globalAlpha*=a;g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x+r*.18,y-r*.18,x+r,y);g.quadraticCurveTo(x+r*.18,y+r*.18,x,y+r);g.quadraticCurveTo(x-r*.18,y+r*.18,x-r,y);g.quadraticCurveTo(x-r*.18,y-r*.18,x,y-r);g.fillStyle='#fff6c9';g.fill();g.restore();}
 function goalTooth(g,x,y,mood,t,wince,reduced){
  g.save();g.translate(x,y);
  // chão: brilho de "área protegida" e sombra
  const glow=g.createRadialGradient(0,6,6,0,6,58);glow.addColorStop(0,'#fff4c455');glow.addColorStop(1,'#fff4c400');g.fillStyle=glow;g.fillRect(-60,-50,120,110);
  g.globalAlpha=.24;ellipse(g,2,15,42,11,'#3d4b40');g.globalAlpha=1;
  // pedestal de pedra, como o das torres
  const side=g.createLinearGradient(-36,0,36,0);side.addColorStop(0,'#b3a893');side.addColorStop(.45,'#cfc5b2');side.addColorStop(1,'#a59a84');
  g.beginPath();g.ellipse(0,10,37,11.5,0,0,Math.PI);g.lineTo(-37,0);g.ellipse(0,0,37,11.5,0,Math.PI,0,true);g.closePath();g.fillStyle=side;g.fill();
  const top=g.createRadialGradient(-8,-4,4,0,0,40);top.addColorStop(0,'#f6f1e7');top.addColorStop(1,'#d9d0bf');ellipse(g,0,0,37,11.5,top,'#c2b7a2',1.2);
  ellipse(g,0,.5,28,8,null,'#ffffff55',1.4);
  g.globalAlpha=.18;ellipse(g,3,1,24,6.5,'#5d6b70');g.globalAlpha=1;
  // corpo: balança de leve; na careta, encolhe e treme
  const bob=reduced?0:Math.sin(t*2.3)*1.8,shake=wince&&!reduced?Math.sin(t*60)*2.2:0;
  g.translate(shake,-16+bob);if(wince&&!reduced)g.scale(1.06,.93);
  const body=g.createRadialGradient(-12,-46,3,4,-22,58);body.addColorStop(0,'#ffffff');body.addColorStop(.38,'#faf8f3');body.addColorStop(.72,'#e4ebee');body.addColorStop(1,'#bccdd6');
  molarPath(g);g.fillStyle=body;g.fill();g.lineWidth=1.7;g.strokeStyle='#adc1c9';g.stroke();
  // luz de borda à direita, como no brilho das torres
  g.save();molarPath(g);g.clip();g.globalAlpha=.55;g.lineWidth=5;g.strokeStyle='#ffffff';g.beginPath();g.moveTo(29,-50);g.bezierCurveTo(33,-36,31,-20,25,-6);g.stroke();g.restore();
  // sombra suave nas raízes e brilho de porcelana
  g.save();molarPath(g);g.clip();const low=g.createLinearGradient(0,-10,0,18);low.addColorStop(0,'#c7d5dc00');low.addColorStop(1,'#b8cad466');g.fillStyle=low;g.fillRect(-40,-12,80,32);g.restore();
  g.save();g.translate(-17,-45);g.rotate(-.55);g.globalAlpha=.85;ellipse(g,0,0,5,10,'#ffffff');g.restore();g.globalAlpha=.9;ellipse(g,-8,-55,2.4,2.4,'#ffffff');g.globalAlpha=1;
  // rosto no estilo das torres
  g.globalAlpha=.55;ellipse(g,-17,-21,5.5,3.2,'#f4a3b1');ellipse(g,17,-21,5.5,3.2,'#f4a3b1');g.globalAlpha=1;
  g.lineCap='round';g.lineJoin='round';
  if(wince){g.strokeStyle='#2c383b';g.lineWidth=2.4;g.beginPath();g.moveTo(-13,-33);g.lineTo(-7,-30);g.lineTo(-13,-27);g.moveTo(13,-33);g.lineTo(7,-30);g.lineTo(13,-27);g.stroke();
   g.beginPath();g.moveTo(-6,-15);g.quadraticCurveTo(-3,-18,0,-15);g.quadraticCurveTo(3,-12,6,-15);g.stroke();}
  else{
   for(const ex of [-9,9]){ellipse(g,ex,-30,4.3,5.8,'#2c383b');ellipse(g,ex+1.7,-32.6,1.7,1.9,'#ffffff');ellipse(g,ex-1.3,-27.6,.9,.9,'#ffffffcc');}
   if(mood!=='happy'){g.strokeStyle='#5b6a6d';g.lineWidth=1.8;g.beginPath();g.moveTo(-14,mood==='scared'?-40:-38);g.lineTo(-5,mood==='scared'?-42:-39);g.moveTo(14,mood==='scared'?-40:-38);g.lineTo(5,mood==='scared'?-42:-39);g.stroke();}
   if(mood==='happy'){g.beginPath();g.moveTo(-7,-20);g.quadraticCurveTo(0,-9,7,-20);g.closePath();g.fillStyle='#7c2f3c';g.fill();ellipse(g,0,-14.6,3.6,2.2,'#f1899a');}
   else if(mood==='worried'){ellipse(g,0,-16,3.2,3.8,'#7c2f3c');}
   else{g.strokeStyle='#7c2f3c';g.lineWidth=2.2;g.beginPath();g.moveTo(-7,-15);g.quadraticCurveTo(-3.5,-19,0,-15);g.quadraticCurveTo(3.5,-11,7,-15);g.stroke();
    g.beginPath();g.moveTo(24,-47);g.quadraticCurveTo(29,-39,24,-36);g.quadraticCurveTo(19,-39,24,-47);g.fillStyle='#9fd4ea';g.fill();}
  }
  if(mood==='happy'&&!wince){const k=reduced?1:.55+.45*Math.sin(t*3);sparkle4(g,-38,-54,6,k);sparkle4(g,36,-40,4.5,1-k*.6);sparkle4(g,30,-66,3.5,k);}
  g.restore();
 }
 class Renderer{
  constructor(canvas){this.canvas=canvas;this.g=canvas.getContext('2d');this.bg=document.createElement('canvas');this.bg.width=900;this.bg.height=560;this.stage=-1;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.sprites={};
   this.flashes={};
   for(const type of Object.keys(B.enemies)){const c=document.createElement('canvas');c.width=c.height=150;const g=c.getContext('2d');g.translate(75,80);enemyArt(g,type);this.sprites[type]=c;
    // silhueta branca do mesmo desenho: pisca por cima quando o visitante leva um golpe
    const f=document.createElement('canvas');f.width=f.height=150;const fg=f.getContext('2d');fg.drawImage(c,0,0);fg.globalCompositeOperation='source-in';fg.fillStyle='#fffdf6';fg.fillRect(0,0,150,150);this.flashes[type]=f;}
   this.fx=root.LuccareJuice?new root.LuccareJuice(this.reduced):null;
   this.resize();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);
  }
  resize(){const dpr=Math.min(devicePixelRatio||1,2),w=this.canvas.clientWidth||900;this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(w*560/900*dpr);}
  postcard(stage,width=270){this.background(stage);const c=document.createElement('canvas');c.width=width;c.height=Math.round(width*560/900);const g=c.getContext('2d');g.drawImage(this.bg,0,0,c.width,c.height);{g.save();g.setTransform(c.width/900,0,0,c.height/560,0,0);const end=B.maps[stage].path.at(-1);g.translate(Math.min(855,end[0]),Math.min(505,end[1]-8)+26);g.scale(1.15,1.15);goalTooth(g,0,0,'happy',0,false,true);g.restore();}if(width>=600){g.setTransform(c.width/900,0,0,c.height/560,0,0);B.maps[stage].pads.forEach(([x,y],i)=>{circle(g,x,y,20,'#fffdf1','#6d9884');g.fillStyle='#466c5e';g.textAlign='center';g.font='bold 16px Trebuchet MS';g.fillText(i+1,x,y+5);});}this.stage=-1;return c.toDataURL();}
  background(stage){
   this.stage=stage;const g=this.bg.getContext('2d'),m=B.maps[stage];g.clearRect(0,0,900,560);root.LuccareScenes.draw(g,m);
   g.lineJoin='round';g.lineCap='round';const path=()=>{g.beginPath();m.path.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));};
   path();g.lineWidth=76;g.strokeStyle=m.theme==='mouth'||m.theme==='smile'?'#743e5870':'#587e7450';g.stroke();
   path();g.lineWidth=65;g.strokeStyle='#fffdf0';g.stroke();
   path();g.lineWidth=52;g.strokeStyle=m.theme==='mouth'?'#fce7c5':m.theme==='smile'?'#fff1d9':'#fff0d2';g.stroke();
   path();g.lineWidth=2.5;g.strokeStyle=m.theme==='mouth'||m.theme==='smile'?'#cfa895':'#d1bd94';g.setLineDash([2,16]);g.stroke();g.setLineDash([]);
   // Chevrons at regular distances make direction legible even at a crossing.
   const pieces=m.path.slice(1).map((p,i)=>({a:m.path[i],b:p,len:Math.hypot(p[0]-m.path[i][0],p[1]-m.path[i][1])}));
   const total=pieces.reduce((n,p)=>n+p.len,0);
   for(let dist=125;dist<total-90;dist+=165){let left=dist,seg;for(const p of pieces){seg=p;if(left<=p.len)break;left-=p.len;}const t=left/seg.len,x=seg.a[0]+(seg.b[0]-seg.a[0])*t,y=seg.a[1]+(seg.b[1]-seg.a[1])*t,angle=Math.atan2(seg.b[1]-seg.a[1],seg.b[0]-seg.a[0]);g.save();g.translate(x,y);g.rotate(angle);g.beginPath();g.moveTo(-8,-5);g.lineTo(0,0);g.lineTo(-8,5);g.strokeStyle=m.theme==='mouth'||m.theme==='smile'?'#b67c83':'#b7a685';g.lineWidth=2.5;g.stroke();g.restore();}
   root.LuccareScenes.terrain?.(g,m,0,false);
   for(const pad of m.beacons||[]){const [x,y]=m.pads[pad];g.lineWidth=2;circle(g,x,y,36,'#fbf2bf99','#c7aa63');for(let k=0;k<4;k++){const a=k*TAU/4;g.save();g.translate(x+Math.cos(a)*35,y+Math.sin(a)*35);g.rotate(Math.PI/4);rect(g,-5,-5,10,10,2,'#d8c5ee','#9b91b8');g.restore();}}
   // o dente do objetivo agora é desenhado vivo em draw(), com expressão
   const start=m.path[0];rect(g,start[0]+4,start[1]-51,63,24,8,'#ffffffb5');g.fillStyle='#637b62';g.font='bold 10px Trebuchet MS';g.textAlign='center';g.fillText('ENTRADA',start[0]+35,start[1]-35);
  }
  draw(s,selected=-1,preview=null,fxDt=0){
   if(this.stage!==s.stage)this.background(s.stage);const g=this.g,fx=this.fx;g.setTransform(this.canvas.width/900,0,0,this.canvas.height/560,0,0);g.clearRect(0,0,900,560);
   if(fx)fx.update(fxDt,s);const [ox,oy]=fx?fx.offset():[0,0];
   // na tremida o cenário é desenhado com uma sobra, para a borda nunca aparecer vazia
   if(ox||oy){g.drawImage(this.bg,-12,-8,924,576);g.translate(ox,oy);}else g.drawImage(this.bg,0,0);
   const now=performance.now()/1000,canBuy=preview&&s.phase==='prep'&&s.cash>=B.purchaseCost(s.stage,preview,s.towers,s.tools??s.stage);
   if(!this.reduced)root.LuccareScenes.terrain?.(g,B.maps[s.stage],s.time,true);
   // Range is gameplay information; animation remains tied to simulation time.
   if(selected>=0){const t=s.towers[selected],p=B.maps[s.stage].pads[selected],v=t?B.stats(t):preview?{...B.towers[preview],range:B.towers[preview].range+(B.maps[s.stage].beacons?.includes(selected)?35:0)}:null;if(v){circle(g,p[0],p[1],v.range,'#ffffff24');g.strokeStyle=t?.type==='saliva'?'#d8a756':'#416f776b';g.lineWidth=2;g.setLineDash([5,6]);g.stroke();g.setLineDash([]);}}
   for(let i=0;i<B.maps[s.stage].pads.length;i++){const [x,y]=B.maps[s.stage].pads[i],t=s.towers[i];if(!t){const breathe=canBuy&&!this.reduced?Math.sin(now*3.2+i)*1.8:0;if(canBuy){g.globalAlpha=.35+.2*Math.sin(now*3.2+i);circle(g,x,y,32+breathe,'#fff3c4');g.globalAlpha=1;}circle(g,x,y+6,27,'#335c4023');circle(g,x,y,26+breathe,'#f9fbeaCC');g.lineWidth=2;g.strokeStyle=i===selected?'#2c6457':'#86a383';g.setLineDash([4,5]);g.stroke();g.setLineDash([]);g.fillStyle='#6f8c6d';g.font='bold 23px Trebuchet MS';g.textAlign='center';g.fillText('+',x,y+7);}
    else{if(t.type==='saliva'){g.globalAlpha=.12;circle(g,x,y,B.stats(t).range,'#efd185');g.globalAlpha=1;}g.save();g.translate(x,y+12);if(fx){const [sx,sy]=fx.towerScale(t);g.scale(sx,sy);}g.translate(0,-12);towerArt(g,t.type,t.level,t.branch,this.reduced?0:t.recoil);g.restore();if(t.upFlash>0){g.globalAlpha=t.upFlash;circle(g,x,y-27,43,null,'#fff6bc');g.globalAlpha=1;}}
    rect(g,x+18,y+17,18,17,7,i===selected?'#2d6557':'#fffcf0');g.fillStyle=i===selected?'white':'#5b7960';g.font='bold 10px Trebuchet MS';g.textAlign='center';g.fillText(i+1,x+27,y+29);
   }
   {const end=B.maps[s.stage].path.at(-1),gx=Math.min(855,end[0]),gy=Math.min(505,end[1]-8),mood=s.lives>=15?'happy':s.lives>=8?'worried':'scared';
    g.save();g.translate(gx,gy+26);g.scale(1.15,1.15);goalTooth(g,0,0,mood,fx?fx.now:0,!!(fx&&fx.goalFlash>.25),this.reduced);g.restore();}
   for(const e of s.enemies){
    const bob=this.reduced?0:Math.sin(e.age*(e.type==='sugar'?16:e.type==='plaque'?5:9)+e.id)*2;
    g.globalAlpha=.15;g.beginPath();g.ellipse(e.x,e.y+e.radius*.85,e.radius*.88,5,0,0,TAU);g.fillStyle='#39533f';g.fill();g.globalAlpha=1;
    if(e.type==='mender'){g.lineWidth=1;circle(g,e.x,e.y,100,'#91d9c515','#75bbaa55');}
    if(e.slow<1||s.time<s.abilityUntil){circle(g,e.x,e.y,e.radius+7,'#c7b5ee44','#a794ce');}
    g.save();g.translate(e.x,e.y+bob);if(!this.reduced){const entrance=Math.min(1,e.age/.35);g.scale(entrance,entrance);if(e.hit>0)g.scale(1.1,.92);else g.scale(1-bob*.012,1+bob*.02);}g.drawImage(this.sprites[e.type],-75,-80);if(e.hit>0){g.globalAlpha=Math.min(1,e.hit/.13)*.72;g.drawImage(this.flashes[e.type],-75,-80);g.globalAlpha=1;}g.restore();
    if(e.type==='boss'&&e.age%8<3){g.lineWidth=4;circle(g,e.x,e.y,e.radius+7,null,'#b99ce0');}
    if(e.hp<e.max||e.type==='boss'||e.type==='mini'){rect(g,e.x-e.radius,e.y-e.radius-15,e.radius*2,5,2,'#ffffffb0');rect(g,e.x-e.radius,e.y-e.radius-15,Math.max(0,e.hp/e.max)*e.radius*2,5,2,'#497c68');}
   }
   for(const p of s.projectiles){g.save();g.translate(p.x,p.y);if(p.type==='water'){g.rotate(Math.atan2(p.ty-p.y,p.tx-p.x));rect(g,-10,-3,19,6,3,'#e3ffff','#50a6bb');}else if(p.type==='fluoride'){circle(g,0,0,9,'#e8d9fc','#aa8bc8');circle(g,-2,-3,3,'white');}else{circle(g,0,0,5,'#fffdf0','#aedbd4');circle(g,-5,4,3,'#fffdf0');}g.restore();}
   for(const fx of s.effects){const alpha=Math.max(0,fx.life/fx.max),progress=1-alpha;g.globalAlpha=alpha;g.lineWidth=3;
    if(fx.type==='floss'){g.beginPath();g.moveTo(fx.x,fx.y);g.quadraticCurveTo((fx.x+fx.tx)/2,(fx.y+fx.ty)/2-18*alpha,fx.tx,fx.ty);g.strokeStyle='#fbfff2';g.lineWidth=6;g.stroke();g.strokeStyle='#6b9c83';g.lineWidth=2;g.stroke();}
    else if(fx.type==='bubble'){circle(g,fx.x,fx.y,fx.radius*(.65+progress*.35),'#c5aceb44','#ae92d1');}
    else if(fx.type==='water'){circle(g,fx.x,fx.y,fx.radius*progress,null,'#75c2d2');}
    else if(fx.type==='roar'){circle(g,fx.x,fx.y,fx.radius*progress,null,'#ffe9a8');circle(g,fx.x,fx.y,fx.radius*progress*.75,null,'#fffbec');}
    else if(!this.reduced){for(let k=0;k<(fx.type==='celebrate'?14:5);k++){const a=k/5*TAU;circle(g,fx.x+Math.cos(a)*(10+progress*(fx.radius||25)),fx.y+Math.sin(a)*(10+progress*(fx.radius||25)),Math.max(1,4*alpha),fx.type==='foam'?'#fffdf5':k%2?'#f4cf78':'#fffbe0');}}
    g.globalAlpha=1;
   }
   if(fx)fx.draw(g,s);
   g.setTransform(1,0,0,1,0,0);
  }
 }
 const iconCache=new Map();
 function icon(type,size=100,level=1,branch=null){const key=[type,size,level,branch].join(':');if(iconCache.has(key))return iconCache.get(key);const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d'),asset=root.LuccareAssets,sprite=B.towers[type]?asset?.towerKey(type,level,branch):type;
  if(!asset?.draw(g,sprite,size*.06,size*.04,size*.88,size*.9)){g.translate(size/2,size*.72);g.scale(size/110,size/110);if(type==='toddy')lion(g,0,-23,33);else if(B.towers[type])towerArt(g,type,level,branch);else enemyArt(g,type);}const url=c.toDataURL();iconCache.set(key,url);return url;}
 root.LuccareArt={Renderer,icon,goalTooth};
})(window);
