/* Cenários vetoriais autorais. Só decoração: não interfere com o motor ou a colisão. */
(function(root){
 'use strict';
 const TAU=Math.PI*2;
 function fill(g,c){g.fillStyle=c;g.fill();}
 function stroke(g,c,w=2){g.strokeStyle=c;g.lineWidth=w;g.stroke();}
 function round(g,x,y,w,h,r,c,line){g.beginPath();g.roundRect(x,y,w,h,r);fill(g,c);if(line)stroke(g,line,2);}
 function oval(g,x,y,rx,ry,c,line,w=2){g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);fill(g,c);if(line)stroke(g,line,w);}
 function label(g,text,x,y,size=16,color='#49645c'){g.fillStyle=color;g.font='bold '+size+'px Trebuchet MS, sans-serif';g.textAlign='center';g.fillText(text,x,y);}
 function plant(g,x,y,s=1){g.save();g.translate(x,y);g.scale(s,s);g.beginPath();g.moveTo(0,24);g.lineTo(0,-25);stroke(g,'#6e9e7c',4);for(const [a,b,rot] of [[-16,-12,-.65],[17,-22,.7],[-13,-36,-.6],[14,-43,.6]]){g.save();g.translate(a,b);g.rotate(rot);oval(g,0,0,15,8,'#86bc9a','#619c7c');g.restore();}round(g,-20,20,40,20,6,'#cf9d79','#ad7b5f');g.restore();}
 function sparkle(g,x,y,r=11,c='#fff9dd'){g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x+r*.16,y-r*.16,x+r,y);g.quadraticCurveTo(x+r*.16,y+r*.16,x,y+r);g.quadraticCurveTo(x-r*.16,y+r*.16,x-r,y);g.quadraticCurveTo(x-r*.16,y-r*.16,x,y-r);fill(g,c);}
 function cartoonTooth(g,x,y,size=1,face=false){g.save();g.translate(x,y);g.scale(size,size);g.beginPath();g.moveTo(0,-26);g.bezierCurveTo(-24,-41,-41,-21,-34,9);g.bezierCurveTo(-24,45,-15,45,-9,21);g.bezierCurveTo(-4,8,5,8,10,22);g.bezierCurveTo(17,46,27,42,35,8);g.bezierCurveTo(42,-22,23,-42,0,-26);fill(g,'#fffdf4');stroke(g,'#96b9ac',2.5);if(face){oval(g,-9,-4,2.5,3,'#52756a');oval(g,9,-4,2.5,3,'#52756a');g.beginPath();g.arc(0,3,6,0,Math.PI);stroke(g,'#52756a',2);}g.restore();}
 function tiles(g,color='#ffffff37',spacing=42){g.strokeStyle=color;g.lineWidth=1;for(let x=0;x<920;x+=spacing){g.beginPath();g.moveTo(x,0);g.lineTo(x,560);g.stroke();}for(let y=0;y<580;y+=spacing){g.beginPath();g.moveTo(0,y);g.lineTo(900,y);g.stroke();}}
 function reception(g){
  tiles(g,'#b29d8534',54);round(g,30,22,840,118,22,'#fff9ec','#ead8be');
  round(g,72,40,185,80,17,'#91b9a9','#698f84');round(g,86,53,157,48,12,'#f4e5cf');label(g,'BEM-VINDOS',164,83,17);round(g,93,94,145,16,6,'#cc9b77');
  for(const [x,y] of [[495,95],[767,100]]){round(g,x-42,y-42,84,68,14,'#fffefa','#b9d5c6');cartoonTooth(g,x,y-7,.45,true);}
  for(const x of [465,540,615]){round(g,x,454,52,39,10,'#9fc7b6','#71998b');round(g,x+10,491,33,12,5,'#c38d70');}
  round(g,36,440,157,77,16,'#e8c79f','#c79970');for(let i=0;i<4;i++)round(g,49+i*32,455,23,31,4,['#9dc9d6','#f1babb','#cbb5dc','#d9cf91'][i]);
  plant(g,822,200,1.25);oval(g,370,495,70,24,'#fff4df','#e8d3b1');
 }
 function chair(g){
  tiles(g,'#8abac440',47);round(g,23,21,854,112,20,'#f5fffa','#b6d4cf');
  round(g,43,38,235,79,15,'#aed8d8','#83b4b7');round(g,56,49,209,58,10,'#e8f5ee');for(let i=0;i<3;i++)oval(g,94+i*57,78,20,16,'#f9fcf2');
  round(g,350,406,225,34,16,'#9abbb7','#78a2a2');round(g,398,301,99,113,21,'#83b7bf','#578c98');round(g,459,264,144,83,28,'#92c6ca','#618e9b');round(g,422,437,22,62,8,'#7596a0');round(g,500,437,22,62,8,'#7596a0');
  g.beginPath();g.moveTo(505,0);g.lineTo(505,75);g.lineTo(585,75);stroke(g,'#709599',11);oval(g,584,91,60,23,'#f3dc9e','#c2a568');oval(g,585,99,43,11,'#fff9dd');
  round(g,727,30,120,88,15,'#fffdf5','#a2c5bb');round(g,739,42,96,55,8,'#cde0d8');label(g,'☺',787,78,33,'#679b8e');
  round(g,28,445,158,70,15,'#afc9d1','#7ba0ad');for(let i=0;i<4;i++)round(g,43+i*32,457,21,43,5,['#e9c77e','#f6bfab','#c5badf','#9bc2aa'][i]);plant(g,846,455,.9);
 }
 function playroom(g){
  tiles(g,'#bbaad034',58);round(g,25,21,850,116,22,'#fff9f2','#d7c6e4');
  for(let i=0;i<5;i++){g.beginPath();g.arc(450,204,185-i*19,Math.PI*1.08,Math.PI*1.92);stroke(g,['#df9faf','#edc390','#e8dba2','#b3d7bd','#a9c6dd'][i],12);}
  for(const [x,y,c] of [[84,91,'#efbd9e'],[200,470,'#a2c8cf'],[742,477,'#e6cd89']]){round(g,x-45,y-22,90,46,9,c,'#acaaa2');round(g,x-31,y-62,62,39,7,'#fffefa','#b3c5b4');label(g,'✦',x,y-36,24,'#ab92c0');}
  for(let i=0;i<11;i++){const x=30+(i*151)%835,y=175+(i*109)%310;sparkle(g,x,y,5+i%3*3,['#efd79a','#f7eef9','#fff9df'][i%3]);}
  round(g,668,34,145,92,19,'#ebd8e8','#c6aace');cartoonTooth(g,738,80,.62,true);
  round(g,34,437,146,81,13,'#b6b7d4','#9395ba');for(let i=0;i<3;i++)round(g,48+i*43,454,34,47,5,['#efc099','#a3c6be','#eee1a6'][i]);
 }
 function mouth(g){
  oval(g,450,280,446,259,'#eaa7a9','#cb8795',8);oval(g,450,280,410,225,'#ab6e81','#9a6077',5);
  oval(g,450,418,263,93,'#dc8f9a','#be778b',5);g.beginPath();g.moveTo(232,437);g.quadraticCurveTo(450,485,666,437);stroke(g,'#f7bbbc88',5);
  for(let i=0;i<11;i++){const x=91+i*72,off=Math.pow((x-450)/450,2);cartoonTooth(g,x,102+off*55,.62,false);cartoonTooth(g,x,450-off*50,.55,false);}
  for(const [x,y] of [[155,225],[751,240],[85,353],[811,365]]){oval(g,x,y,25,12,'#efa3ad88');sparkle(g,x,y,8,'#fff3e8');}
  // Long curved bands guide the eye without implying a medical diagram.
  g.beginPath();g.arc(450,285,392,Math.PI*1.08,Math.PI*1.92);stroke(g,'#f9c8c075',8);
 }
 function workshop(g){
  tiles(g,'#baa98b3c',44);round(g,22,20,855,108,21,'#fffaf0','#ddccb0');
  round(g,300,28,270,80,16,'#bcd8d2','#95bbb1');round(g,314,41,243,51,12,'#e9f8ed');cartoonTooth(g,435,73,.46,true);
  for(const [x,y] of [[75,190],[842,190],[88,464],[804,475]]){oval(g,x,y,50,34,'#d1ded4','#a3bbb0');cartoonTooth(g,x,y,.55,false);}
  round(g,380,343,155,58,13,'#c7ad8c','#9b846b');round(g,393,352,128,33,9,'#e1eacb','#abbc9f');for(let i=0;i<4;i++)sparkle(g,414+i*28,368,6,'#fffaf0');
  for(const [x,y,r] of [[186,64,25],[650,65,19],[795,362,29]]){g.save();g.translate(x,y);g.beginPath();g.moveTo(0,-r);g.lineTo(r*.7,-r*.2);g.lineTo(r*.5,r);g.lineTo(-r*.5,r);g.lineTo(-r*.7,-r*.2);g.closePath();fill(g,'#a9c9ca');stroke(g,'#f4ffed',3);g.restore();}
  plant(g,849,390,.72);
 }
 function smile(g){
  tiles(g,'#a9bfd333',55);round(g,21,21,858,96,19,'#f8fbf3','#c0d8d5');
  g.beginPath();g.moveTo(62,25);g.quadraticCurveTo(450,140,838,25);stroke(g,'#d4a875',6);for(let i=0;i<13;i++){const x=80+i*61,y=27+Math.sin(i/12*Math.PI)*44;oval(g,x,y+10,6,8,['#f3bdac','#f0d890','#b7d9bd','#b7cadf'][i%4]);}
  oval(g,449,297,421,234,'#f0b8b5','#da9a9c',6);oval(g,449,297,389,205,'#d58f9c','#b77e90',4);
  for(let i=0;i<10;i++){const x=105+i*75,curve=Math.pow((x-449)/415,2);cartoonTooth(g,x,132+curve*53,.61,false);cartoonTooth(g,x,441-curve*43,.58,false);}
  oval(g,450,432,248,73,'#e8a8aa','#d08b9a',4);
  for(let i=0;i<29;i++){const x=(i*193+51)%890,y=(i*97+152)%540;sparkle(g,x,y,4+i%4,['#f7ebbd','#fff7f3','#c5e6db'][i%3]);}
  round(g,545,27,223,53,14,'#fff7df','#c9bd9a');label(g,'SORRISO!',656,61,23,'#977b69');
 }
 function draw(g,m){
  const art=root.LuccareAssets?.images[m.theme];if(art){g.drawImage(art,0,0,900,560);return;}
  round(g,0,0,900,560,24,m.color);
  if(m.theme==='reception')reception(g);
  if(m.theme==='chair')chair(g);
  if(m.theme==='playroom')playroom(g);
  if(m.theme==='mouth')mouth(g);
  if(m.theme==='workshop')workshop(g);
  if(m.theme==='smile')smile(g);
 }
 function terrain(g,m,time=0,animated=false){
  for(const z of m.zones||[]){g.save();g.beginPath();g.roundRect(z.x,z.y,z.w,z.h,20);g.clip();
   if(!animated){const paint=g.createLinearGradient(z.x,z.y,z.x+z.w,z.y+z.h);paint.addColorStop(0,z.factor<1?'#e6d8f3ed':'#e6fcffed');paint.addColorStop(.5,z.factor<1?'#c8b8e1dd':'#b6e3eadd');paint.addColorStop(1,'#fffcf3e8');g.fillStyle=paint;g.fillRect(z.x,z.y,z.w,z.h);
    if(z.factor<1){for(let i=0;i<7;i++){const x=z.x+18+(i*37)%(z.w-25),y=z.y+28+(i*23)%(z.h-35);oval(g,x,y,8+i%3*3,8+i%3*3,'#ffffff45','#fff9');}}
    else{g.beginPath();g.moveTo(z.x-20,z.y+z.h);g.lineTo(z.x+z.w*.5,z.y);g.moveTo(z.x+z.w*.25,z.y+z.h);g.lineTo(z.x+z.w*.95,z.y);stroke(g,'#ffffffa0',10);cartoonTooth(g,z.x+z.w/2,z.y+z.h*.57,.37);}
    label(g,z.factor<1?'BOLHAS SUAVES':'ESMALTE LISO',z.x+z.w/2,z.y+16,z.w<120?9:10,'#466f80');label(g,(z.factor<1?'−35%':z.factor===1.65?'+65%':'+50%'),z.x+z.w/2,z.y+z.h-8,10,'#637486');
   }else{g.globalAlpha=.35+.25*Math.sin(time*2);for(let i=0;i<3;i++)sparkle(g,z.x+20+(i*59)%(z.w-35),z.y+30+(i*27)%(z.h-40),4,'#fff');}
   g.restore();
  }
 }
 root.LuccareScenes={draw,terrain};
})(window);
