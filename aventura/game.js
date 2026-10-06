(async function(){
 'use strict';
 const $=id=>document.getElementById(id),B=window.LuccareBalance,E=window.SmileDefense;
 const artStatus=await LuccareAssets.load();$('artLoading').hidden=!artStatus.failed.length;if(artStatus.failed.length)$('artLoading').textContent='Algumas ilustrações não carregaram. A aventura continua com a arte simplificada.';
 const store=new LuccareSave.Store(),audio=new LuccareAudio(),clock=new LuccareClock(),renderer=new LuccareArt.Renderer($('battle'));
 let profile=store.profile,s=null,chosen='brush',selected=-1,speed=profile.settings.speed,last=0,raf=0,uiTime=0,bannerUntil=0,selectionKey='',confirmAction=null,confirmWasRunning=false,lastInput=Date.now(),ended=false;
 // Torres da partida. Primeira vez numa fase: só as da fase (a lição apresenta a estreante).
 // Repetindo uma fase já vencida: todas as torres já conquistadas.
 // Modo difícil ("adult"/"hard" no código): só existe depois de vencer a última fase;
 // todas as torres e todas as fases liberadas, estrelas próprias.
 const MAX_TOOL=Object.keys(B.towers).length-1;
 const hardAvailable=()=>profile.stars[B.maps.length-1]>0;
 const isAdult=()=>profile.adult===true&&hardAvailable();
 const won=(stage,adult)=>adult?profile.hard[stage]>0:(profile.stars[stage]>0||profile.hard[stage]>0);
 const reach=adult=>adult?B.maps.length-1:profile.unlocked;
 const toolsFor=(stage,adult)=>adult?MAX_TOOL:won(stage,false)?Math.min(MAX_TOOL,Math.max(stage,profile.unlocked)):stage;
 // a lição da torre só aparece se a fase nunca foi vencida em nenhum modo
 const firstVisit=st=>st.tools===st.stage&&!(profile.stars[st.stage]>0||profile.hard[st.stage]>0);
 const starText=n=>'★'.repeat(n)+'☆'.repeat(3-n);
 function intro(st){if(st.adult)return 'Modo difícil: todas as torres liberadas, visitantes mais rápidos e fortes e menos moedas.';return 'Revanche! Todas as torres que você já conquistou estão liberadas nesta fase.';}
 const newGame=stage=>E.create(stage,{tools:toolsFor(stage,isAdult()),adult:isAdult()});
 // partida em andamento = só pede confirmação se ainda há algo a perder
 const inProgress=()=>!['won','lost'].includes(s.phase)&&(s.wave>0||s.towers.some(Boolean));
 s=E.restore(profile.checkpoint)||newGame(0);
 if(!profile.tutorial&&s.wave===0)speed=1;
 const images={};for(const type of ['toddy',...Object.keys(B.towers),...Object.keys(B.enemies)])images[type]=LuccareArt.icon(type);
 const postcards=B.maps.map((m,i)=>renderer.postcard(i,420));
 document.querySelectorAll('[data-art]').forEach(img=>img.src=images[img.dataset.art]);
 audio.enabled=profile.settings.sound;audio.volume=profile.settings.volume;
 function say(text){$('message').textContent=text;}
 // ── Sensação de jogo no HUD: moedas que voam do visitante até o contador,
 //    contador que pulsa e coração que treme. Só apresentação.
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let coinGate=0,coinsAlive=0;
 function pulse(id,cls){const el=$(id)?.parentElement;if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);}
 function flyCoin(x,y){
  if(reducedMotion||coinsAlive>=10||document.hidden)return;const now=performance.now();if(now-coinGate<85)return;coinGate=now;
  const c=$('battle').getBoundingClientRect(),t=$('cash').getBoundingClientRect();if(!c.width||!t.width)return;
  const sx=c.left+x/900*c.width,sy=c.top+y/560*c.height,dx=t.left+t.width/2-sx,dy=t.top+t.height/2-sy;
  const el=document.createElement('span');el.className='coin-fly';el.textContent='✦';el.setAttribute('aria-hidden','true');el.style.left=sx+'px';el.style.top=sy+'px';document.body.append(el);coinsAlive++;
  const a=el.animate([{transform:'translate(-50%,-50%) scale(.5)',opacity:0},{transform:'translate(calc(-50% + '+dx*.3+'px),calc(-50% + '+(dy*.15-55)+'px)) scale(1.2)',opacity:1,offset:.35},{transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px)) scale(.7)',opacity:.9}],{duration:640,easing:'cubic-bezier(.35,.1,.3,1)'});
  const done=()=>{el.remove();coinsAlive=Math.max(0,coinsAlive-1);pulse('cash','bump');};a.onfinish=done;a.oncancel=done;
 }
 function persist(){store.profile=profile;store.save();$('saveStatus').textContent=!store.available?'Este navegador não permite salvar. Você pode continuar jogando.':store.mode==='shared'?'Visita compartilhada · reinicia após 35 minutos sem interação.':'Progresso guardado só neste navegador · sem cadastro.';}
 function saveCheckpoint(){if(s.phase==='prep')profile.checkpoint=E.checkpoint(s);persist();}
 function input(){if(store.mode==='shared'&&Date.now()-lastInput>35*60000){profile=store.reset();reset(0);say('Uma nova visita começou. Vamos montar um time!');}lastInput=Date.now();profile.updated=Date.now();}
 function openDialog(id){E.pause(s);clock.reset();if(!$(id).open)$(id).showModal();hud(true);}
 function ask(action,title='Recomeçar esta fase?',erase=false){confirmAction=action;confirmWasRunning=s.phase==='running';$('confirmTitle').textContent=title;$('confirm').querySelector('p:not(.eyebrow)').textContent=erase?'Esta ação apaga recordes, fases desbloqueadas e a defesa salva neste modo. O progresso de outro modo permanece guardado.':'A defesa atual será substituída. Seus recordes e fases desbloqueadas continuam guardados.';$('confirmYes').textContent=erase?'Apagar progresso':'Começar de novo';openDialog('confirm');}
 function revealStage(){const active=$('chapters').querySelector('.active');if(active)$('chapters').scrollLeft=Math.max(0,active.offsetLeft-$('chapters').offsetLeft-20);}
 window.addEventListener('resize',()=>requestAnimationFrame(revealStage));
 function renderChapters(){
  $('chapters').innerHTML=B.maps.map((m,i)=>{const adult=isAdult(),locked=i>reach(adult);return '<button class="chapter '+(i===s.stage?'active':'')+' '+(locked?'locked':'')+'" data-stage="'+i+'" aria-current="'+(i===s.stage?'step':'false')+'" aria-label="'+(locked?m.name+'; bloqueada. Conclua a fase '+i+' primeiro.':m.name)+'" '+(locked?'disabled':'')+'><img class="map-thumb" src="'+postcards[i]+'" alt=""><span class="chapter-copy"><strong><span class="num">0'+(i+1)+'</span>'+m.name+'</strong><small>'+m.waves.length+' ondas'+(locked?' · 🔒 conclua a anterior':adult?' · difícil '+starText(profile.hard[i]):' · '+starText(profile.stars[i])+(profile.hard[i]?' · difícil '+starText(profile.hard[i]):''))+'</small></span></button>';}).join('');
  $('mapTitle').textContent=B.maps[s.stage].name;$('mapNumber').textContent='0'+(s.stage+1);
  $('modeBadge').hidden=!s.adult;document.body.classList.toggle('adult-mode',!!s.adult);
  // modo difícil: discreto, só nos ajustes e só depois de vencer a última fase
  $('hardSetting').hidden=!hardAvailable();$('hardMode').checked=isAdult();$('hardHint').hidden=!hardAvailable()||isAdult();
  $('mapRule').textContent=B.maps[s.stage].rule;$('campaignCount').textContent=B.maps.length+' regiões · '+B.maps.reduce((n,m)=>n+m.waves.length,0)+' ondas · '+(isAdult()?'modo difícil · '+profile.hard.reduce((a,b)=>a+b,0):profile.stars.reduce((a,b)=>a+b,0))+'/'+B.maps.length*3+' estrelas'+(!isAdult()&&profile.hard.some(Boolean)?' · difícil '+profile.hard.reduce((a,b)=>a+b,0)+'/'+B.maps.length*3:'');
  requestAnimationFrame(revealStage);
 }
 function cost(type){return B.purchaseCost(s.stage,type,s.towers,s.tools);}
 function renderPads(){
  $('pads').innerHTML=B.maps[s.stage].pads.map((p,i)=>'<button class="pad" data-pad="'+i+'" style="left:'+p[0]/9+'%;top:'+p[1]/5.6+'%"><span class="sr-only"></span></button>').join('');updatePads();
 }
 function updatePads(){document.querySelectorAll('[data-pad]').forEach(b=>{const i=+b.dataset.pad,t=s.towers[i];b.classList.toggle('selected',i===selected);b.classList.toggle('unaffordable',!t&&s.cash<cost(chosen));b.setAttribute('aria-label','Posição '+(i+1)+(t?': '+B.towers[t.type].name+', nível '+t.level:': construir '+B.towers[chosen].name));b.disabled=s.phase==='paused'||['won','lost'].includes(s.phase);});}
 function renderShop(){
  const html=Object.entries(B.towers).map(([type,t])=>{const available=B.towerAvailable(s.tools,type),price=cost(type),stage=Object.keys(B.towers).indexOf(type)+1;return '<button data-tower="'+type+'" '+(available?'':'disabled')+' aria-label="'+(available?'Selecionar '+t.name+', '+price+' moedas':t.name+' abre na fase '+stage)+'"><img src="'+images[type]+'" alt="" draggable="false"><strong>'+t.name+'</strong><small>'+(available?'✦ '+price+(price<t.cost?' · estreia':''):'Fase '+stage+' 🔒')+'</small></button>';}).join('');
  $('shop').innerHTML=html;$('quickShopButtons').innerHTML=html;
 }
 function renderSelection(force=false){
  const t=s.towers[selected],v=t?B.stats(t):{...B.towers[chosen],range:B.towers[chosen].range+(B.maps[s.stage].beacons?.includes(selected)?35:0)},key=[selected,chosen,t?.id,t?.level,t?.branch,s.cash,s.phase].join('|');if(!force&&key===selectionKey)return;selectionKey=key;
  const focus=document.activeElement,focusId=$('selection').contains(focus)?focus.id:null;
  $('selection').classList.toggle('mobile-open',selected>=0);
  let html='<button id="dismissSelection" class="dismiss-selection" aria-label="Fechar painel da torre">×</button><div class="selection-head"><img src="'+LuccareArt.icon(t?t.type:chosen,128,t?.level||1,t?.branch)+'" alt=""><div><h3>'+v.name+'</h3><p class="small">'+(t?'Nível '+t.level+(t.branch?' · '+B.towers[t.type].branches[t.branch].name:''):v.role)+'</p></div></div>';
  html+='<p>'+v.detail+'</p><div class="tower-stats"><span><b>'+Math.round(v.range)+'</b>alcance</span>'+(v.damage?'<span><b>'+(v.damage/v.interval).toFixed(1)+'</b>dano/s por alvo</span>':'<span><b>+'+Math.round((1/v.haste-1)*100)+'%</b>velocidade</span>')+'</div>';
  if(t){
   if(t.level<3){const spec=B.towers[t.type],cost=t.level===1?spec.upgrade:spec.branchCost;
    if(t.level===1)html+='<button id="upgrade" class="upgrade" data-upgrade="" '+(s.cash<cost?'disabled':'')+'><img class="upgrade-art" src="'+LuccareArt.icon(t.type,96,2)+'" alt=""><strong>Melhorar para nível 2</strong><span>✦ '+cost+'</span><small>'+(t.type==='saliva'?'Aura mais potente e alcance maior.':'+45% de dano, mais alcance e ataques mais rápidos.')+'</small></button>';
    else html+=['a','b'].map(branch=>'<button id="upgrade-'+branch+'" class="upgrade" data-upgrade="'+branch+'" '+(s.cash<cost?'disabled':'')+'><img class="upgrade-art" src="'+LuccareArt.icon(t.type,96,3,branch)+'" alt=""><strong>'+spec.branches[branch].name+'</strong><span>✦ '+cost+'</span><small>'+spec.branches[branch].detail+'</small></button>').join('');
   }else if(t.level===3&&s.stage>=3)html+='<button id="mastery" class="upgrade mastery" data-upgrade="mastery" '+(s.cash<B.economy.masteryCost?'disabled':'')+'><img class="upgrade-art" src="'+LuccareArt.icon(t.type,96,4,t.branch)+'" alt=""><strong>Brilho mestre · nível 4</strong><span>✦ '+B.economy.masteryCost+'</span><small>Mais alcance e força para esta torre. Uma escolha opcional nas últimas regiões.</small></button>';
   else html+='<p><strong>Especialização completa ✦</strong></p>';
   if(t.rangeBonus)html+='<p class="crystal-note">✧ Espelho iluminado: +35 de alcance.</p>';
   if(t.type!=='saliva')html+='<label class="target-row">Prioridade<select id="target"><option value="first">Mais perto da saída</option><option value="strong">Mais resistente</option><option value="last">Mais perto da entrada</option><option value="support">Apoio primeiro</option></select></label>';
   html+='<button id="sell" class="text-btn sell">Vender · receber '+Math.floor(t.invested*B.economy.sell+1e-9)+' moedas</button>';
  }else html+='<button id="build" class="primary" '+(selected<0||s.cash<cost(chosen)?'disabled':'')+'>'+(selected<0?'Arraste a torre ou toque em um +':s.cash<cost(chosen)?'Faltam '+(cost(chosen)-s.cash)+' moedas':'Construir por '+cost(chosen)+' moedas')+'</button>';
  $('selectionContent').innerHTML=html;
  if(t&&$('target'))$('target').value=t.target;
  if(s.phase==='paused'||['won','lost'].includes(s.phase))$('selectionContent').querySelectorAll('button:not(.dismiss-selection),select').forEach(b=>b.disabled=true);
  if(focusId&&$(focusId))$(focusId).focus({preventScroll:true});
 }
 function renderWave(){
  const active=s.phase==='running'||s.phase==='paused',index=active?s.wave-1:Math.min(s.wave,B.maps[s.stage].waves.length-1),w=B.maps[s.stage].waves[index];
  $('waveLabel').textContent=active?'EM CAMPO':s.phase==='won'?'SORRISO PROTEGIDO':'PRÓXIMA ONDA';$('waveTitle').textContent=w.name;
  $('wavePreview').textContent=w.groups.map(g=>g.n+' '+B.enemies[g.type].name.toLowerCase()).join(' · ');
  $('start').disabled=s.phase!=='prep';$('start').classList.toggle('ready',s.phase==='prep'&&s.towers.some(t=>t&&t.type!=='saliva'));$('start').textContent=s.phase==='won'?'Fase concluída ✓':s.phase==='lost'?'Tente uma nova defesa':active?'Onda '+s.wave+' em andamento':'Começar onda '+(s.wave+1)+' →';
  $('waveProgress').innerHTML=B.maps[s.stage].waves.map((w,i)=>'<span title="'+(i+1)+': '+w.name+'" class="'+(i<s.wave-(active?1:0)?'done':i===s.wave-(active?1:0)?'current':'')+'"></span>').join('');
 }
 function hud(force=false){
  $('cash').textContent=s.cash;$('lives').textContent=s.lives;$('waveCount').textContent=s.wave+'/'+B.maps[s.stage].waves.length;
  document.querySelectorAll('[data-speed]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.speed===speed)));
  $('pause').disabled=!['running','paused'].includes(s.phase);$('pause').textContent=s.phase==='paused'?'▶':'Ⅱ';$('pause').setAttribute('aria-label',s.phase==='paused'?'Continuar jogo':'Pausar jogo');$('pausedOverlay').hidden=s.phase!=='paused';
  document.querySelectorAll('[data-tower]').forEach(b=>{const type=b.dataset.tower,available=B.towerAvailable(s.tools,type),price=cost(type);b.disabled=!available||!['prep','running'].includes(s.phase);b.classList.toggle('selected',type===chosen&&!s.towers[selected]);b.classList.toggle('cant-afford',available&&s.cash<price);b.setAttribute('aria-pressed',String(type===chosen&&!s.towers[selected]));b.querySelector('small').textContent=available?'✦ '+price+(price<B.towers[type].cost?' · estreia':''):'Fase '+(Object.keys(B.towers).indexOf(type)+1)+' 🔒';});
  $('roar').disabled=s.phase!=='running'||s.abilityCooldown>0;$('roarStatus').textContent=s.abilityCooldown>0?'Pronto em '+Math.ceil(s.abilityCooldown)+' s':s.phase==='running'?'Pronto! Desacelera todos por alguns segundos.':'Disponível durante a onda';
  $('roarQuick').disabled=$('roar').disabled;$('roarQuick').querySelector('span').textContent=s.abilityCooldown>0?Math.ceil(s.abilityCooldown)+' s':s.phase==='running'?'Pronto':'Na onda';
  $('bossBanner').hidden=s.time>=bannerUntil||!bannerUntil||!['running','paused'].includes(s.phase);
  updatePads();renderSelection(force);
 }
 function soundUI(){audio.enabled=profile.settings.sound;audio.volume=profile.settings.volume;$('sound').textContent='Som: '+(audio.enabled?'ligado':'desligado');$('sound').setAttribute('aria-pressed',String(audio.enabled));$('audioEnabled').checked=audio.enabled;$('volume').value=audio.volume;$('homeMode').classList.toggle('active',store.mode==='home');$('sharedMode').classList.toggle('active',store.mode==='shared');}
 function showLesson(){const lesson=B.introductions[s.stage];$('lessonStage').textContent='FASE '+(s.stage+1)+' · '+B.maps[s.stage].name;$('lessonTitle').textContent=lesson.title;$('lessonFact').textContent=lesson.fact;$('lessonTip').textContent=lesson.tip;$('lessonArt').src=LuccareArt.icon(lesson.tower||'toddy',240);$('lessonScene').src=LuccareAssets.images[B.maps[s.stage].theme]?.src||postcards[s.stage];$('lessonRegion').textContent=B.maps[s.stage].subtitle;$('lesson').dataset.guardian=lesson.tower||'team';$('lessonEvolution').innerHTML=lesson.tower?[1,2,3,4].map(level=>'<div><img src="'+LuccareArt.icon(lesson.tower,120,level,'a')+'" alt="'+B.towers[lesson.tower].name+', nível '+level+'"><span>Nível '+level+'</span></div>').join(''):Object.keys(B.towers).map(type=>'<div><img src="'+images[type]+'" alt="'+B.towers[type].name+'"><span>'+B.towers[type].name+'</span></div>').join('');if(!$('lesson').open)$('lesson').showModal();}
 function reset(stage){if(!Number.isInteger(stage)||stage<0||stage>B.maps.length-1||stage>reach(isAdult())){say('Esta fase ainda está bloqueada. Conclua a fase anterior para continuar a jornada.');return false;}s=newGame(stage);renderer.fx?.reset();selected=-1;chosen='brush';ended=false;bannerUntil=0;clock.reset();last=0;renderChapters();renderShop();renderPads();renderWave();saveCheckpoint();hud(true);
  if(firstVisit(s)){say(B.maps[stage].waves[0].lesson);showLesson();maybeTutor();}
  else say(intro(s));
  schedule();return true;}
 function begin(){
  input();if(s.phase!=='prep')return;saveCheckpoint();
  if(E.start(s)){profile.highest[s.stage]=Math.max(profile.highest[s.stage],s.wave);if(!profile.tutorial&&s.wave===1){speed=1;profile.tutorial=true;}persist();say(B.maps[s.stage].waves[s.wave-1].lesson);renderWave();hud(true);audio.activate();schedule();}
  else say('Construa uma escova ou outra torre de ataque antes de começar.');
 }
 function finish(){
  if(ended)return;ended=true;const hardBefore=hardAvailable(),win=s.phase==='won',stars=win?(s.lives>=16?3:s.lives>=9?2:1):0;
  profile.best[s.stage]=Math.max(profile.best[s.stage],s.stats.score);profile.highest[s.stage]=Math.max(profile.highest[s.stage],s.wave);if(s.adult)profile.hard[s.stage]=Math.max(profile.hard[s.stage],stars);else profile.stars[s.stage]=Math.max(profile.stars[s.stage],stars);profile.checkpoint=null;
  const earned=[];
  if(win){profile.unlocked=Math.max(profile.unlocked,Math.min(B.maps.length-1,s.stage+1));profile.cards=[...new Set([...profile.cards,s.stage])];
   const awards=[...(s.lives===20?['perfect']:[]),...(new Set(s.towers.filter(Boolean).map(t=>t.type)).size>=4?['team']:[])];
   for(const key of awards)if(!profile.medals[s.stage].includes(key)){profile.medals[s.stage].push(key);earned.push(B.medals[key].name);}
  }persist();renderChapters();
  const best=s.towers.filter(Boolean).sort((a,b)=>b.damage-a.damage)[0];
  $('resultScene').src=LuccareAssets.images[B.maps[s.stage].theme]?.src||postcards[s.stage];$('resultLabel').textContent=(s.adult?'DESAFIO ADULTO · ':'')+(win?'SEU TIME PROTEGEU O SORRISO':'UMA NOVA ESTRATÉGIA COMEÇA AQUI');$('resultTitle').textContent=win?'Um sorriso de vitória!':'Vamos reorganizar o time?';$('resultStars').textContent=win?'★'.repeat(stars)+'☆'.repeat(3-stars):'✦';
  $('resultText').textContent=win?(s.stage<B.maps.length-1?'Próxima parada: '+B.maps[s.stage+1].name+'. '+B.maps[s.stage+1].subtitle+'.':'Você completou a campanha do Toddy! Explore outras combinações e complete sua coleção de conquistas.'):(s.stage===0?'Espalhe as Escovas pelas curvas e experimente a melhoria Precisão contra armaduras. Seu recorde ficou guardado.':'Espalhe o alcance, melhore suas torres e prepare o Fio para as armaduras. Seu recorde ficou guardado.');
  $('resultAwards').textContent=win?'Cartão da região: '+B.maps[s.stage].collectible+(earned.length?' · Nova conquista: '+earned.join(' + '):'')+(!s.adult&&!hardBefore&&hardAvailable()?' · Modo difícil liberado! Ative nos ajustes ⚙.':''):'';
  $('resultStats').innerHTML='<div><b>'+s.stats.score+'</b><span>pontos</span></div><div><b>'+s.wave+'</b><span>onda alcançada</span></div><div><b>'+s.stats.kills+'</b><span>turminhas vencidas</span></div>';
  if(best)$('resultText').textContent+=' Destaque do time: '+B.towers[best.type].name+'.';
  $('next').textContent=win&&s.stage<B.maps.length-1?'Explorar próxima fase →':'Jogar de novo';$('result').showModal();renderWave();hud(true);
 }
 function events(){
  for(const event of s.events){audio.play(event);renderer.fx?.feed(event,s);
   if(event.type==='pop'&&event.reward)flyCoin(event.x,event.y-10);
   if(event.type==='bossDown')for(let k=0;k<3;k++)setTimeout(()=>flyCoin(event.x+(k-1)*18,event.y-20),k*90);
   if(event.type==='leak')pulse('lives','hurt');
   if(event.type==='clear')pulse('cash','bump');
   if(event.type==='clear'){say('Onda concluída! +'+event.reward+' moedas. '+B.maps[s.stage].waves[s.wave].lesson);saveCheckpoint();renderWave();}
   if(event.type==='boss'){$('bossArt').src=images[event.name===B.enemies.boss.name?'boss':'mini'];bannerUntil=s.time+4;$('bossName').textContent=event.name;$('bossBanner').querySelector('span').textContent=event.name===B.enemies.boss.name?'Não deixe o maestro chegar ao sorriso!':'Prepare-se para a pequena turma que vem junto.';say(event.name===B.enemies.boss.name?B.enemies.boss.hint:B.enemies.mini.hint);}
   if(event.type==='summon')say('O maestro chamou ajudantes! Ataques de área e o rugido ajudam.');
   if(event.type==='won'||event.type==='lost')finish();
  }s.events=[];
 }
 function frame(now){
  raf=0;const seconds=last?Math.max(0,(now-last)/1000):0;last=now;
  // A long interruption pauses instead of silently simulating a large jump.
  if(seconds>.5&&s.phase==='running'){E.pause(s);clock.reset();say('A aventura pausou para esperar você.');}
  else if(s.phase==='running'&&!document.querySelector('dialog[open]'))clock.advance(seconds,speed,dt=>E.step(s,dt));
  else E.settle(s,Math.min(seconds,.1));
  const dialogOpen=!!document.querySelector('dialog[open]'),fxDt=s.phase==='paused'||dialogOpen&&s.phase==='running'?0:s.phase==='running'?seconds*speed:Math.min(seconds,.1);
  events();renderer.draw(s,selected,chosen,Math.min(fxDt,.3));uiTime+=seconds;if(uiTime>=.1){uiTime=0;hud();}
  if(!document.hidden)raf=requestAnimationFrame(frame);
 }
 function schedule(){if(!raf&&!document.hidden)raf=requestAnimationFrame(frame);}
 function pauseToggle(){input();if(s.phase==='paused'){E.resume(s);last=0;schedule();}else E.pause(s);clock.reset();hud(true);}
 let drag=null,suppressShopClick=false;
 for(const tray of [$('shop'),$('quickShopButtons')])tray.addEventListener('dragstart',e=>e.preventDefault());
 function dragTarget(x,y){let best=null,distance=Infinity;for(const pad of $('pads').querySelectorAll('[data-pad]')){const rect=pad.getBoundingClientRect(),d=Math.hypot(x-(rect.left+rect.width/2),y-(rect.top+rect.height/2));if(d<Math.max(34,rect.width*.8)&&d<distance){best=pad;distance=d;}}return best;}
 function endDrag(){if(!drag)return;drag.ghost?.remove();$('pads').querySelectorAll('.drop-target').forEach(p=>p.classList.remove('drop-target'));drag=null;}
 for(const tray of [$('shop'),$('quickShopButtons')])tray.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-tower]');if(!b||b.disabled||e.button!==0)return;drag={type:b.dataset.tower,x:e.clientX,y:e.clientY,pointerId:e.pointerId,active:false,ghost:null};});
 document.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointerId)return;if(!drag.active&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<8)return;if(!drag.active){drag.active=true;drag.ghost=document.createElement('div');drag.ghost.className='tower-drag';drag.ghost.innerHTML='<img src="'+images[drag.type]+'" alt=""><strong>'+B.towers[drag.type].name+'</strong>';document.body.append(drag.ghost);}e.preventDefault();drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';$('pads').querySelectorAll('.drop-target').forEach(p=>p.classList.remove('drop-target'));const pad=dragTarget(e.clientX,e.clientY);if(pad&&!s.towers[+pad.dataset.pad])pad.classList.add('drop-target');});
 document.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.pointerId)return;const active=drag.active,type=drag.type,pad=dragTarget(e.clientX,e.clientY);endDrag();if(!active)return;suppressShopClick=true;setTimeout(()=>suppressShopClick=false,0);input();if(!pad){say('Solte a torre sobre um dos espaços com +.');return;}const index=+pad.dataset.pad;if(s.towers[index]){selected=index;hud(true);say('Este espaço já tem uma torre. Escolha outro +.');return;}if(E.buy(s,index,type)){selected=index;chosen=type;saveCheckpoint();hud(true);audio.activate();say(B.towers[type].name+' entrou no time! Você também pode tocar para construir.');}else say(s.cash<cost(type)?'Faltam '+(cost(type)-s.cash)+' moedas para esta torre.':'Não é possível construir agora.');});
 document.addEventListener('pointercancel',endDrag);
 for(const tray of [$('shop'),$('quickShopButtons')])tray.addEventListener('click',e=>{if(suppressShopClick){suppressShopClick=false;return;}const b=e.target.closest('[data-tower]');if(!b||b.disabled)return;input();chosen=b.dataset.tower;if(s.towers[selected])selected=-1;hud(true);say('Arraste a torre até um + ou toque em um espaço para construir '+B.towers[chosen].name.toLowerCase()+'.');});
 $('pads').addEventListener('click',e=>{const b=e.target.closest('[data-pad]');if(!b)return;input();selected=+b.dataset.pad;hud(true);if(!s.towers[selected])say('Veja o alcance. Confirme a construção no painel do time.');});
 $('selection').addEventListener('click',e=>{input();const b=e.target.closest('button');if(!b)return;
  let changed=false;
  if(b.id==='dismissSelection'){selected=-1;hud(true);return;}
  if(b.id==='build'){changed=E.buy(s,selected,chosen);if(changed){say('Torre pronta! Comece a onda ou monte mais uma defesa.');if(innerWidth<=520)selected=-1;}}
  if(b.hasAttribute('data-upgrade')){changed=E.upgrade(s,selected,b.dataset.upgrade);if(changed)say('Seu time ficou mais forte! Observe o equipamento e o novo ataque.');}
  if(b.id==='sell'){if(b.dataset.confirm==='yes'){changed=E.sell(s,selected);say('Moedas devolvidas. Agora você pode repensar essa posição.');}else{b.dataset.confirm='yes';b.textContent='Confirmar venda? Toque novamente';return;}}
  if(changed){saveCheckpoint();hud(true);audio.activate();}
 });
 $('selection').addEventListener('change',e=>{if(e.target.id==='target'){input();E.setTarget(s,selected,e.target.value);saveCheckpoint();}});
 $('start').addEventListener('click',begin);$('pause').addEventListener('click',pauseToggle);$('resume').addEventListener('click',pauseToggle);$('lessonClose').addEventListener('click',()=>$('lesson').close());
 document.querySelectorAll('[data-speed]').forEach(b=>b.addEventListener('click',()=>{input();speed=+b.dataset.speed;profile.settings.speed=speed;persist();hud();}));
 $('roar').addEventListener('click',()=>{input();if(E.roar(s)){say('Rugido da proteção! Um respiro para seu time agir.');hud();audio.activate();}});
 $('roarQuick').addEventListener('click',()=>$('roar').click());
 $('restart').addEventListener('click',()=>inProgress()?ask(()=>reset(s.stage)):reset(s.stage));
 $('chapters').addEventListener('click',e=>{const b=e.target.closest('[data-stage]');if(!b||b.disabled)return;const stage=+b.dataset.stage;if($('stages').open)$('stages').close();if(stage>reach(isAdult())){say('Esta fase ainda está bloqueada. Conclua a fase anterior para continuar a jornada.');return;}if(inProgress())ask(()=>reset(stage),'Começar '+B.maps[stage].name+'?');else reset(stage);});
 $('next').addEventListener('click',()=>{const stage=s.phase==='won'&&s.stage<B.maps.length-1?s.stage+1:s.stage;$('result').close();reset(stage);});$('replay').addEventListener('click',()=>{$('result').close();reset(s.stage);});
 $('confirmYes').addEventListener('click',()=>{$('confirm').close();if(confirmAction)confirmAction();confirmAction=null;});
 function cancelConfirm(){confirmAction=null;$('confirm').close();if(confirmWasRunning){E.resume(s);last=0;clock.reset();}hud();}
 $('confirmCancel').addEventListener('click',cancelConfirm);$('confirm').addEventListener('cancel',e=>{e.preventDefault();cancelConfirm();});
 $('settingsOpen').addEventListener('click',()=>{soundUI();openDialog('settings');});
 document.querySelectorAll('[data-open-settings]').forEach(b=>b.addEventListener('click',()=>$('settingsOpen').click()));
 $('stagesOpen').addEventListener('click',()=>{input();renderChapters();openDialog('stages');});
 $('settingsProgress').addEventListener('click',()=>{$('settings').close();$('progressOpen').click();});
 $('settingsRestart').addEventListener('click',()=>{$('settings').close();$('restart').click();});
 // chave de dificuldade no diálogo de fases
 $('hardMode').addEventListener('change',e=>{input();const adult=e.target.checked&&hardAvailable();if(adult===isAdult())return;
  const apply=()=>{profile.adult=adult;persist();reset(s.stage);};$('settings').close();
  if(inProgress())ask(apply,adult?'Começar no modo difícil?':'Voltar ao modo normal?');else apply();});
 // progresso conquistado em outra aba aparece aqui também
 window.addEventListener('storage',e=>{if(e.key===LuccareSave.KEY&&store.mode==='home'){store.refresh();profile=store.profile;renderChapters();hud(true);}});
 $('settingsGuide').addEventListener('click',()=>{$('settings').close();$('guideOpen').click();});
 document.querySelectorAll('[data-open-guide]').forEach(b=>b.addEventListener('click',()=>$('guideOpen').click()));
 // ── Tela cheia deitada (celular) ──────────────────────────────────
 // Android: pede tela cheia e trava em paisagem. iPhone não permite tela cheia
 // fora de vídeo; lá o aviso só pede para virar o aparelho.
 const root=document.documentElement,canFull=!!(root.requestFullscreen||root.webkitRequestFullscreen),touch=matchMedia('(pointer: coarse)').matches;
 const isFull=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
 function fullUI(){const on=isFull();document.querySelectorAll('[data-fullscreen],#fullscreen').forEach(b=>{b.hidden=!(canFull&&touch);b.setAttribute('aria-label',on?'Sair da tela cheia':'Jogar em tela cheia');});
  if($('fullscreen').querySelector('span'))$('fullscreen').querySelector('span').textContent=on?'Sair':'Tela cheia';$('rotateFs').textContent=on?'Sair da tela cheia':'Jogar deitado em tela cheia';$('rotateFs').hidden=!(canFull&&touch);
  document.body.classList.toggle('is-fullscreen',on);}
 async function toggleFull(){input();try{if(isFull()){await (document.exitFullscreen||document.webkitExitFullscreen).call(document);}else{await (root.requestFullscreen||root.webkitRequestFullscreen).call(root,{navigationUI:'hide'});try{await screen.orientation?.lock?.('landscape');}catch(_){}}}catch(_){say('Não foi possível abrir a tela cheia neste navegador. Vire o celular para o campo ficar maior.');}fullUI();}
 document.querySelectorAll('[data-fullscreen],#fullscreen').forEach(b=>b.addEventListener('click',toggleFull));
 document.addEventListener('fullscreenchange',fullUI);document.addEventListener('webkitfullscreenchange',fullUI);
 // aviso "vire o celular" só em telefone em pé
 const portrait=matchMedia('(orientation: portrait) and (max-width: 700px)');
 function rotateUI(){$('rotateHint').hidden=!(touch&&portrait.matches);}
 portrait.addEventListener?.('change',rotateUI);fullUI();rotateUI();$('guideOpen').addEventListener('click',()=>openDialog('guide'));
 $('progressOpen').addEventListener('click',()=>{$('progressSummary').textContent=profile.cards.length+'/'+B.maps.length+' cartões · '+profile.medals.flat().length+'/'+B.maps.length*2+' conquistas'+(hardAvailable()?' · modo difícil '+profile.hard.reduce((x,y)=>x+y,0)+'/'+B.maps.length*3+' estrelas':'');$('progressCards').innerHTML=B.maps.map((m,i)=>'<article class="progress-card '+(profile.cards.includes(i)?'collected':'')+'"><img class="postcard" src="'+postcards[i]+'" alt="Percurso de '+m.name+'"><div><h3>'+m.name+'</h3><div class="stars" aria-label="'+profile.stars[i]+' estrelas">'+starText(profile.stars[i])+'</div>'+(hardAvailable()?'<div class="stars adult-stars" aria-label="Modo difícil: '+profile.hard[i]+' estrelas"><small>DIFÍCIL</small> '+starText(profile.hard[i])+'</div>':'')+'<p><strong>'+m.collectible+'</strong> · '+(profile.cards.includes(i)?'Colecionado!':'Vença para colecionar.')+'</p><p>'+(i>profile.unlocked?'Conclua a fase anterior.':m.subtitle+' · Recorde: '+profile.best[i]+' pontos')+'</p><div class="medals">'+Object.entries(B.medals).map(([key,medal])=>'<span class="medal '+(profile.medals[i].includes(key)?'earned':'')+'" title="'+medal.detail+'">'+(profile.medals[i].includes(key)?'✓':'○')+' '+medal.name+'</span>').join('')+'</div></div></article>').join('');openDialog('progress');});
 document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
 function toggleSound(enabled){profile.settings.sound=enabled;soundUI();audio.activate();persist();}
 $('sound').addEventListener('click',()=>toggleSound(!profile.settings.sound));$('audioEnabled').addEventListener('change',e=>toggleSound(e.target.checked));$('volume').addEventListener('input',e=>{profile.settings.volume=+e.target.value;audio.volume=+e.target.value;persist();});
 function switchMode(mode){$('settings').close();ask(()=>{profile=store.switchMode(mode);s=E.restore(profile.checkpoint)||newGame(0);lastInput=Date.now();speed=profile.settings.speed;ended=false;selected=-1;bannerUntil=0;renderChapters();renderPads();renderWave();soundUI();hud(true);persist();say('Vamos montar nosso time!');},mode==='shared'?'Começar uma visita compartilhada?':'Voltar ao progresso deste aparelho?');}
 $('homeMode').addEventListener('click',()=>switchMode('home'));$('sharedMode').addEventListener('click',()=>switchMode('shared'));
 $('resetSave').addEventListener('click',()=>{$('settings').close();ask(()=>{profile=store.reset();speed=1;soundUI();reset(0);},'Apagar o progresso deste modo?',true);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){E.pause(s);clock.reset();cancelAnimationFrame(raf);raf=0;last=0;persist();}else{input();last=0;schedule();hud(true);}});
 window.addEventListener('pagehide',()=>{E.pause(s);cancelAnimationFrame(raf);raf=0;last=0;persist();});window.addEventListener('pageshow',()=>{last=0;schedule();});
 document.addEventListener('keydown',e=>{if(e.repeat||document.querySelector('dialog[open]')||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const key=e.key.toLowerCase();if(['1','2','3'].includes(key)){document.querySelector('[data-speed="'+key+'"]').click();e.preventDefault();}if(key==='p'){$('pause').click();e.preventDefault();}if(key==='r'){$('roar').click();e.preventDefault();}});
 $('enemyGuide').innerHTML=Object.entries(B.enemies).map(([type,e])=>'<article class="enemy-card"><img src="'+images[type]+'" alt=""><strong>'+e.name+'</strong><p>'+e.hint+'</p></article>').join('');
 // tutorial guiado: só na primeira partida da fase 1, modo normal
 let tutor=null;
 function maybeTutor(){if(!window.LuccareTutor||tutor?.alive||profile.tutorial||s.stage!==0||s.adult||s.wave!==0)return;
  tutor=LuccareTutor({get:()=>({s,selected}),brushArt:images.brush,onSkip:()=>{profile.tutorial=true;persist();}});}
 renderChapters();renderShop();renderPads();renderWave();soundUI();hud(true);persist();if(s.wave===0&&firstVisit(s))showLesson();
 else if(s.wave===0&&!profile.checkpoint)say(intro(s));
 maybeTutor();
 if(profile.checkpoint)say('Sua defesa voltou à preparação da onda '+(s.wave+1)+'. Escolha quando continuar.');schedule();
})();

