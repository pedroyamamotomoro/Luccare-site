/* Local art only. The offline bundle is loaded exclusively for file:// previews. */
(function(root){
 'use strict';
 const names=['reception','chair','playroom','mouth','workshop','smile','towers','cast'],images={},failed=[];
 const rows=['brush','floss','fluoride','water','saliva'],cast=['basic','sugar','swarm','plaque','acid','mini','boss','mender','toddy'];
 let promise=null,frames={};const pixelCache=new WeakMap();
 function read(url){return new Promise(resolve=>{const img=new Image();let settled=false;const finish=value=>{if(settled)return;settled=true;clearTimeout(timer);resolve(value);};const timer=setTimeout(()=>finish(null),12000);img.onload=()=>finish(img);img.onerror=()=>finish(null);img.src=url;});}
 function trim(atlas,box){
  if(!pixelCache.has(atlas)){const c=document.createElement('canvas');c.width=atlas.width;c.height=atlas.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(atlas,0,0);pixelCache.set(atlas,g.getImageData(0,0,c.width,c.height).data);}
  const [x,y,w,h]=box,p=pixelCache.get(atlas);let x0=w,y0=h,x1=0,y1=0;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(p[((y+j)*atlas.width+x+i)*4+3]>64){x0=Math.min(x0,i);y0=Math.min(y0,j);x1=Math.max(x1,i);y1=Math.max(y1,j);}
  return x0<=x1?[x+x0,y+y0,x1-x0+1,y1-y0+1]:box;
 }
 function prepare(){
  // Separators follow actual transparent gutters of the approved generated atlas.
  if(images.towers){const xs=[0,220,451,689,911,1141,1374],ys=[0,244,458,667,900,1145];rows.forEach((type,row)=>{for(let col=0;col<6;col++)frames[type+col]={image:images.towers,box:trim(images.towers,[xs[col],ys[row],xs[col+1]-xs[col],ys[row+1]-ys[row]])};});}
  if(frames.water2)frames.water2.box=trim(images.towers,[475,667,214,233]);if(frames.floss3)frames.floss3.box=trim(images.towers,[689,244,210,214]);
  if(images.cast){const xs=[0,456,835,1254],ys=[0,405,780,1254];cast.forEach((type,i)=>{const row=Math.floor(i/3),col=i%3;frames[type]={image:images.cast,box:trim(images.cast,[xs[col],ys[row],xs[col+1]-xs[col],ys[row+1]-ys[row]])};});}
 }
 function load(){if(promise)return promise;promise=(async()=>{
  if(location.protocol==='file:'&&!root.LuccareOfflineArt)await new Promise(resolve=>{const script=document.createElement('script');script.src='assets/art/offline.js';script.onload=script.onerror=resolve;document.head.append(script);});
  // WebP (≈1,4 MB no total, mesmas dimensões e transparência); o PNG original fica de reserva.
  await Promise.all(names.map(async name=>{const img=await read(root.LuccareOfflineArt?.[name]||'assets/art/'+name+'.webp')||(!root.LuccareOfflineArt&&await read('assets/art/'+name+'.png'));if(img)images[name]=img;else failed.push(name);}));
  try{prepare();}catch(error){frames={};failed.push('sprites');}
  delete root.LuccareOfflineArt;return {failed:[...failed]};
 })();return promise;}
 function draw(g,key,x,y,w,h){const frame=frames[key];if(!frame)return false;const [sx,sy,sw,sh]=frame.box,scale=Math.min(w/sw,h/sh),dw=sw*scale,dh=sh*scale;g.drawImage(frame.image,sx,sy,sw,sh,x+(w-dw)/2,y+h-dh,dw,dh);return true;}
 function towerKey(type,level=1,branch='a'){return type+(level===1?0:level===2?1:level===3?(branch==='b'?3:2):(branch==='b'?5:4));}
 root.LuccareAssets={load,images,failed,draw,towerKey,has:key=>!!frames[key]};
})(window);
