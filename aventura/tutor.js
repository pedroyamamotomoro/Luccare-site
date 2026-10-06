/* Guardiões do Sorriso · tutorial guiado da primeira partida (06/10/2026)

   Só na primeira vez na fase 1 (modo normal), para quem nunca jogou tower
   defense. Três passos, sem bloquear nada: a pessoa faz o gesto de verdade.
     1. "Arraste a Escova até o +"  — mãozinha leva a escova da loja até a
        posição sugerida (a posição 2, dentro da primeira curva). Se a pessoa
        tocar num + em vez de arrastar, o passo vira "Toque em Construir".
     2. "Toque aqui para começar"   — aponta o botão da onda.
     3. Recado curto quando a onda começa, e o tutorial some.
   Some sozinho se abrir um diálogo, trocar de fase ou tocar em "Pular".
   É só apresentação: lê o estado do jogo, nunca o altera. */
(function(root){
 'use strict';
 const TARGET_PAD=1;
 root.LuccareTutor=function(opts){
  const get=opts.get,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,touch=matchMedia('(pointer: coarse)').matches;
  let alive=true,step='',finishTimer=0,moving=null,moveKey='',startedWave=false;
  const el=document.createElement('div');el.className='tutor';el.setAttribute('aria-live','polite');
  el.innerHTML='<div class="tutor-ring" hidden></div><div class="tutor-ghost" hidden><img alt=""><svg class="tutor-hand" viewBox="0 0 40 48" aria-hidden="true"><path d="M14 4c2.2 0 4 1.8 4 4v13l2-.4V16c0-2 1.6-3.4 3.4-3.4S27 14 27 16v5l1.6-.2c1.9 0 3.4 1.5 3.4 3.4v1.4l.8-.1c1.8 0 3.2 1.5 3.2 3.3V36c0 6-4.6 10-10.8 10h-4.4c-3.4 0-6.4-1.6-8.4-4.3L3.6 31.8c-1-1.5-.6-3.5.9-4.4 1.3-.8 3-.6 4 .5L10 30V8c0-2.2 1.8-4 4-4z" fill="#fffaf0" stroke="#2c5a4e" stroke-width="2.2" stroke-linejoin="round"/></svg></div><div class="tutor-bubble" role="status"><p class="tutor-text"></p><p class="tutor-sub"></p><button type="button" class="tutor-skip">Pular dica</button></div>';
  document.body.append(el);
  const ring=el.querySelector('.tutor-ring'),ghost=el.querySelector('.tutor-ghost'),bubble=el.querySelector('.tutor-bubble'),text=el.querySelector('.tutor-text'),sub=el.querySelector('.tutor-sub');
  ghost.querySelector('img').src=opts.brushArt||'';
  const skip=el.querySelector('.tutor-skip');skip.addEventListener('click',()=>{stop();opts.onSkip?.();});
  const visible=n=>{if(!n)return null;const r=n.getBoundingClientRect(),cs=getComputedStyle(n);return r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'&&r.bottom>0&&r.top<innerHeight?r:null;};
  const center=r=>({x:r.left+r.width/2,y:r.top+r.height/2});
  function shopBrush(){for(const sel of ['#quickShopButtons [data-tower="brush"]','#shop [data-tower="brush"]']){const n=document.querySelector(sel),r=visible(n);if(r)return r;}return null;}
  function hideAll(){ring.hidden=true;ghost.hidden=true;bubble.hidden=true;stopMove();}
  function stopMove(){if(moving){moving.cancel();moving=null;}moveKey='';}
  function ringOn(r,round){ring.hidden=false;const pad=8;Object.assign(ring.style,{left:r.left-pad+'px',top:r.top-pad+'px',width:r.width+pad*2+'px',height:r.height+pad*2+'px',borderRadius:round?'50%':'16px'});}
  function say(t,s2,anchor,side){
   bubble.hidden=false;if(text.textContent!==t)text.textContent=t;sub.textContent=s2||'';sub.hidden=!s2;
   const bw=bubble.offsetWidth,bh=bubble.offsetHeight,m=10;
   let x,y;
   if(anchor&&side==='left'&&anchor.left-bw-18>=m){x=anchor.left-bw-18;y=anchor.top+anchor.height/2-bh/2;}
   else if(anchor){x=anchor.left+anchor.width/2-bw/2;y=anchor.top-bh-18;if(y<m)y=anchor.bottom+18;if(y+bh>innerHeight-m)y=Math.max(m,anchor.top-bh-18);}
   else{const f=visible(document.getElementById('field'))||{left:0,top:0,width:innerWidth,height:innerHeight};x=f.left+f.width/2-bw/2;y=f.top+16;}
   x=Math.min(Math.max(m,x),innerWidth-bw-m);y=Math.min(Math.max(m,y),innerHeight-bh-m);
   bubble.style.left=x+'px';bubble.style.top=y+'px';
  }
  function hand(from,to){
   ghost.hidden=false;
   if(reduced||!from){stopMove();ghost.classList.add('still');ghost.style.transform='translate('+(to.x-18)+'px,'+(to.y-20)+'px)';return;}
   ghost.classList.remove('still');
   const key=[from.x,from.y,to.x,to.y].map(Math.round).join(',');if(key===moveKey&&moving)return;stopMove();moveKey=key;
   const a='translate('+(from.x-18)+'px,'+(from.y-20)+'px)',b='translate('+(to.x-18)+'px,'+(to.y-20)+'px)';
   moving=ghost.animate([{transform:a,opacity:0},{transform:a,opacity:1,offset:.12},{transform:a,opacity:1,offset:.22},{transform:b,opacity:1,offset:.72},{transform:b,opacity:1,offset:.88},{transform:b,opacity:0}],{duration:2200,iterations:Infinity,easing:'ease-in-out'});
  }
  function tick(){
   if(!alive)return;
   const st=get(),s=st.s;
   if(s.stage!==0||s.adult||['won','lost'].includes(s.phase)){stop();return;}
   if(s.wave>0&&!startedWave){startedWave=true;finishTimer=setTimeout(stop,6500);}
   if(document.querySelector('dialog[open]')||document.hidden){hideAll();return;}
   if(startedWave){ring.hidden=true;ghost.hidden=true;stopMove();
    skip.textContent='Fechar';say('Os visitantes seguem o caminho até o dente. Suas torres cuidam deles!','Ganhe moedas e toque numa torre para melhorá-la.',null);return;}
   const built=s.towers.some(Boolean);
   if(!built){
    const build=document.getElementById('build'),br=visible(build);
    if(st.selected>=0&&br&&!build.disabled){step='confirm';ringOn(br,false);ghost.hidden=true;stopMove();
     say(touch?'Agora toque em Construir.':'Agora clique em Construir.','',br);return;}
    const pad=visible(document.querySelector('[data-pad="'+TARGET_PAD+'"]'));if(!pad){hideAll();return;}
    step='build';ringOn(pad,true);const from=shopBrush();hand(from?center(from):null,center(pad));
    say('Arraste a Escova até este +',(touch?'Ou toque no + e depois em Construir.':'Ou clique no + e depois em Construir.'),pad);return;
   }
   const start=visible(document.getElementById('start'));if(!start){hideAll();return;}
   step='start';ghost.hidden=false;hand(null,{x:start.left+start.width*.72,y:start.top+start.height*.62});ringOn(start,false);
   say(touch?'Pronto! Toque aqui para começar a onda.':'Pronto! Clique aqui para começar a onda.','Se quiser, coloque mais torres antes.',start,'left');
  }
  const loop=setInterval(tick,180);addEventListener('resize',tick);
  function stop(){if(!alive)return;alive=false;clearInterval(loop);clearTimeout(finishTimer);removeEventListener('resize',tick);stopMove();el.remove();}
  tick();
  return {stop,get step(){return step;},get alive(){return alive;}};
 };
})(window);
