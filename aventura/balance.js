/* Fonte única dos números do jogo. Unidades: px do mundo / segundos de simulação. */
(function(root){
 'use strict';
 const economy={start:240,lives:20,sell:.7,waveBase:28,waveGrowth:3,masteryCost:420};
 const towers={
  brush:{name:'Escova',role:'Rápida · alvo único',color:'#75b6d4',cost:80,damage:7,interval:.58,range:140,projectile:430,upgrade:100,branchCost:175,
   detail:'Tiros de espuma rápidos. Ótima contra corredores; sofre com armadura.',
   branches:{a:{name:'Turbina',detail:'Rajadas rápidas: 8 de dano a cada 0,25 s.'},b:{name:'Precisão',detail:'28 de dano e ignora metade da armadura.'}}},
  floss:{name:'Fio dental',role:'Perfura · vários alvos',color:'#91bf9f',cost:115,damage:14,interval:1.45,range:155,pierce:3,upgrade:125,branchCost:185,
   detail:'Uma linha atravessa até 3 alvos e ignora armaduras. Aproveite as curvas.',
   branches:{a:{name:'Fita longa',detail:'Atravessa até 6 alvos; alcance maior.'},b:{name:'Fio firme',detail:'Mais dano, até 3 alvos; forte contra blindados.'}}},
  fluoride:{name:'Flúor',role:'Área · desacelera',color:'#b4a5dc',cost:135,damage:5,interval:1.9,range:150,projectile:270,splash:70,slow:.68,duration:1.8,upgrade:120,branchCost:180,
   detail:'Bolhas atingem um grupo e o desaceleram. Precisa de torres de dano por perto.',
   branches:{a:{name:'Bolha ampla',detail:'Área de 105; segura grupos por mais tempo.'},b:{name:'Brilho intenso',detail:'Explosão mais forte, menor controle.'}}},
  water:{name:'Irrigador',role:'Pulso · empurra',color:'#64bfca',cost:135,damage:14,interval:1.05,range:155,projectile:510,push:30,upgrade:130,branchCost:190,
   detail:'Um jato empurra para trás. Cada inimigo resiste a empurrões repetidos.',
   branches:{a:{name:'Onda larga',detail:'Jato de 24 de dano atinge uma pequena área.'},b:{name:'Jato preciso',detail:'38 de dano e mais alcance contra alvos fortes.'}}},
  saliva:{name:'Saliva',role:'Aura · fortalece o time',color:'#efbe75',cost:125,damage:0,interval:1,range:160,haste:.84,power:1.12,upgrade:110,branchCost:170,
   detail:'Acelera e fortalece torres próximas. Não ataca; auras não se acumulam.',
   branches:{a:{name:'Abraço',detail:'Aura maior para alcançar mais torres.'},b:{name:'Energia',detail:'Aura menor, com reforço mais potente.'}}}
 };
 const introductions=[
  {tower:'brush',title:'A escova entra em ação',fact:'Escove com creme dental com flúor pelo menos duas vezes ao dia — uma delas antes de dormir. Pode haver outras escovações ao longo do dia; uma pessoa adulta ajuda e confere até a criança ter habilidade para escovar bem.',tip:'No jogo, a Escova ataca rápido. Coloque-a onde alcance duas curvas.'},
  {tower:'floss',title:'O fio chega entre os dentes',fact:'Quando dois dentes encostam, o fio dental limpa o espaço entre eles, onde a escova não alcança. Em geral, esse cuidado é feito uma vez ao dia, com ajuda de uma pessoa adulta quando necessário.',tip:'No jogo, o Fio atravessa uma fila de visitantes e funciona bem contra armaduras.'},
  {tower:'fluoride',title:'A proteção do flúor',fact:'O creme dental com flúor ajuda a prevenir a cárie desde o primeiro dente. A quantidade muda com a idade: é pequena e deve ser colocada ou supervisionada por uma pessoa adulta, seguindo a orientação da odontopediatra.',tip:'No jogo, as bolhas de Flúor desaceleram grupos. Combine-as com torres que causam dano.'},
  {tower:'water',title:'Uma pausa para a água',fact:'Água é a melhor bebida para matar a sede. Ela não substitui a escovação com creme dental com flúor nem a limpeza entre os dentes. O Irrigador desta aventura é um poder de fantasia.',tip:'No jogo, o Irrigador empurra visitantes para dar outra chance às torres.'},
  {tower:'saliva',title:'A saliva ajuda o sorriso',fact:'A saliva umedece a boca e participa da proteção natural dos dentes. Mesmo assim, a rotina diária continua importante: escovação com creme dental com flúor e limpeza entre dentes que se encostam.',tip:'No jogo, a Saliva fortalece torres próximas. Procure um espaço central para formar um time.'},
  {tower:null,title:'Todo o time em campo',fact:'O cuidado combina bons hábitos: escovar bem pelo menos duas vezes ao dia, limpar entre dentes que se encostam, beber água, cuidar da frequência do açúcar e visitar a odontopediatra conforme a necessidade de cada criança.',tip:'Agora todas as torres estão disponíveis. Experimente novas combinações e posições.'}
 ];
 const unlockedTowers=stage=>Object.keys(towers).filter((type,index)=>index<=stage);
 const towerAvailable=(stage,type)=>Object.hasOwn(towers,type)&&unlockedTowers(stage).includes(type);
 // tools: maior índice de torre liberado nesta partida (repetir fase ou desafio adulto liberam mais que a fase)
 const purchaseCost=(stage,type,placed=[],tools=stage)=>{
  if(!towerAvailable(Math.max(stage,tools),type))return Infinity;
  const debut=stage>0&&introductions[stage]?.tower===type&&!placed.some(t=>t?.type===type);
  return debut?Math.round(towers[type].cost*.7):towers[type].cost;
 };
 function stats(t){
  const b=towers[t.type],v={...b};
  if(t.level>=2){v.damage*=1.45;v.range+=12;v.interval*=.94;if(v.splash)v.splash+=8;if(v.pierce)v.pierce++;if(v.push)v.push+=8;if(v.haste){v.haste=.8;v.power=1.18;}}
  if(t.level>=3){
   const a=t.branch==='a';
   if(t.type==='brush'){v.damage=a?8:28;v.interval=a?.25:.74;v.armorPierce=a?0:.5;}
   if(t.type==='floss'){v.pierce=a?6:3;v.range+=a?30:5;v.damage=a?23:40;}
   if(t.type==='fluoride'){v.splash=a?105:76;v.damage=a?9:20;v.slow=a?.56:.8;v.duration=a?2.5:1.2;}
   if(t.type==='water'){v.splash=a?52:0;v.damage=a?24:38;v.range+=a?0:35;v.push=a?32:48;}
   if(t.type==='saliva'){v.range=a?225:165;v.haste=a?.73:.66;v.power=a?1.26:1.34;}
  }
  if(t.level===4){v.range+=15;v.damage*=1.22;v.interval*=.95;if(v.splash)v.splash+=10;if(v.pierce)v.pierce++;if(v.push)v.push+=8;if(v.haste){v.haste*=.94;v.power+=.07;}}
  v.range+=t.rangeBonus||0;
  return v;
 }
 const enemies={
  basic:{name:'Bactéria curiosa',hp:32,speed:53,reward:8,radius:17,leak:1,color:'#dbad59',hint:'A primeira visitante: uma escova dá conta.'},
  sugar:{name:'Açúcar ligeiro',hp:26,speed:100,reward:9,radius:14,leak:1,color:'#f3bbca',hint:'Muito rápido. Escovas rápidas e bolhas ajudam.'},
  swarm:{name:'Turminha do biofilme',hp:18,speed:66,reward:5,radius:11,leak:1,color:'#97c092',hint:'Vêm em grupo. Mais escovas ajudam; depois, Fio e ataques de área brilham.'},
  plaque:{name:'Placa de armadura',hp:105,speed:38,reward:16,radius:23,armor:.48,leak:2,color:'#c89b71',hint:'Resiste à espuma. Melhore a Escova para Precisão ou use o Fio quando abrir.'},
  acid:{name:'Gota azedinha',hp:55,speed:76,reward:12,radius:19,leak:1,color:'#b4a5d8',hint:'Corre mais quando fica com pouca energia. Controle o caminho.'},
  mini:{name:'Bolota pegajosa',hp:340,speed:33,reward:45,radius:32,armor:.25,leak:4,color:'#c99291',hint:'Ao se dividir, chama pequenas bolotas. Prepare dano em área.'},
  boss:{name:'Maestro da Bagunça',hp:720,speed:24,reward:130,radius:43,armor:.15,leak:20,color:'#b58fc7',hint:'Alterna uma capa e chama ajudantes. Escovas melhoradas ajudam; nas próximas fases, o Fio também. Se chegar ao sorriso, a tentativa termina.'},
  mender:{name:'Maestro aprendiz',hp:82,speed:51,reward:18,radius:21,leak:1,color:'#6cbbb0',hint:'Recupera a energia dos companheiros próximos, exceto chefes e outros aprendizes. Use a prioridade “Apoio primeiro”.'}
 };
 const group=(type,n,gap=1.1)=>({type,n,gap});
 const wave=(name,lesson,groups,scale=1)=>({name,lesson,groups,scale});
 /* 27/09/2026: posições afastadas da trilha só o necessário para a torre não
    ficar em cima do caminho (antes, na Oficina, duas ficavam literalmente sobre
    a faixa). Detalhes em aventura/POLIMENTO-2026-09-27.md. */
 const maps=[
  {name:'Chegada ao consultório',subtitle:'Recepção · descubra as primeiras curvas',theme:'reception',color:'#f5ead9',accent:'#d8ad83',rule:'Na recepção, uma torre perto da curva cobre dois trechos do caminho.',collectible:'Bilhete da primeira visita',path:[[0,320],[160,320],[160,170],[375,170],[375,370],[650,370],[650,220],[850,220]],pads:[[93,220],[255,255],[380,78],[490,275],[550,465],[738,335],[655,110],[255,415],[310,65],[450,460]],waves:[
   wave('Bem-vindos!','Coloque uma escova perto da curva. O círculo mostra seu alcance.',[group('basic',6,1.8)]),
   wave('Passos pela recepção','Guarde moedas ou melhore uma escova para os corredores.',[group('basic',5,1.2),group('sugar',4,1.5)]),
   wave('A turma chegou','Monte outra Escova para cobrir a saída enquanto a primeira protege a curva.',[group('swarm',14,.4),group('basic',4,1)]),
   wave('Primeira surpresa','Mini-chefe! Ela se divide: monte uma segunda linha de defesa.',[group('mini',1),group('basic',6,1.5)]),
   wave('Uma pausa para pensar','Uma onda mais leve para preparar a próxima defesa.',[group('basic',7,1.4),group('sugar',3,1.5)],1.1),
   wave('A primeira casquinha','A armadura resiste à espuma. A melhoria Precisão da Escova ajuda.',[group('plaque',5,1.7),group('swarm',12,.4)]),
   wave('O time se encontra','Espalhe as Escovas pelas curvas. O rugido do Toddy dá tempo ao time.',[group('sugar',10,.55),group('plaque',4,1.4)],1.15),
   wave('Festa na recepção','A capa do chefe vai e volta. Escovas melhoradas e uma boa reserva ajudam.',[group('boss',1),group('swarm',14,.48),group('sugar',8,.7)],1)
  ]},
  {name:'A cadeira espacial',subtitle:'Sala de atendimento · ligue as posições',theme:'chair',color:'#d9edf0',accent:'#9bc7c9',rule:'O trajeto passa pela cadeira e muda de direção. Combine torres que cobrem curvas diferentes.',collectible:'Adesivo de explorador',path:[[0,145],[220,145],[220,355],[450,355],[450,155],[680,155],[680,380],[875,380]],pads:[[110,245],[305,220],[350,450],[525,265],[590,80],[770,260],[575,460],[100,80],[150,465],[800,95]],waves:[
   wave('Cadeira preparada','O Fio Dental estreou! Posicione-o para atravessar a fila e a armadura.',[group('basic',6,1.3),group('plaque',2,1.8)]),
   wave('Exploradores apressados','Prepare o fio para a turma que vem junta.',[group('swarm',18,.35),group('sugar',5,1.1)]),
   wave('Gotas em visita','As gotas aceleram quando enfraquecem. Não deixe a saída vazia.',[group('acid',8,1.4),group('basic',6,1)]),
   wave('Duas tarefas','Corredores e blindados pedem funções diferentes.',[group('plaque',6,1.6),group('sugar',10,.55)]),
   wave('Hora da escolha','Um respiro para escolher a especialização de uma torre.',[group('basic',12,1.1)],1.25),
   wave('Pequena confusão','Duas bolotas: guarde o rugido para quando se dividirem.',[group('mini',2,3),group('swarm',16,.4)],1.2),
   wave('Jato na curva','O irrigador pode devolver corredores para a zona de ataque.',[group('sugar',18,.45),group('acid',7,.85)],1.25),
   wave('Um time unido','A aura da saliva reforça o time próximo. Auras não se somam.',[group('plaque',10,1.4),group('basic',12,.65)],1.4),
   wave('Antes da grande visita','Prepare a defesa: enxame seguido de gotas.',[group('swarm',25,.28),group('acid',10,.7)],1.5),
   wave('O maestro na cadeira','Capa, ajudantes e corredores: deixe cada torre cumprir seu papel.',[group('boss',1),group('mini',1,2),group('sugar',14,.55)],1.65)
  ]},
  {name:'Brinquedoteca das cores',subtitle:'Brinquedoteca · uma trilha mais longa',theme:'playroom',color:'#ece4f3',accent:'#c3acd6',rule:'A trilha faz várias voltas. A posição de cada torre vale tanto quanto a melhoria.',collectible:'Peça do sorriso',path:[[0,315],[165,315],[165,110],[400,110],[400,330],[610,330],[610,140],[790,140],[790,445],[885,445]],pads:[[85,175],[260,225],[340,420],[490,215],[682,76],[705,245],[695,450],[284,68],[510,450],[849,255]],waves:[
   wave('Porta das cores','O Flúor estreou! Bolhas seguram grupos para Escova e Fio atacarem juntos.',[group('swarm',12,.5),group('basic',5,1.15),group('sugar',4,1.2)],1.1),
   wave('Corrida entre brinquedos','Ritmo ou alcance? Uma melhoria muda essa escolha.',[group('sugar',12,.65),group('swarm',12,.4)],1.2),
   wave('Blocos resistentes','O fio merece uma boa posição antes dos blindados.',[group('plaque',7,1.5),group('basic',8,.7)],1.2),
   wave('Gotas no tapete','Dano em área e controle trabalham melhor juntos.',[group('acid',12,.85),group('swarm',20,.3)],1.35),
   wave('Parada para montar','Aproveite as moedas para uma especialização.',[group('basic',12,1.1)],1.6),
   wave('O primeiro ensaio','A primeira visita do maestro. Prepare o fio para sua capa.',[group('boss',1),group('sugar',10,.8)],1.25),
   wave('Reorganizar os brinquedos','Reconstrua uma posição, se precisar. Vendas devolvem 70%.',[group('basic',9,1.2),group('acid',7,1.2)],1.6),
   wave('Fila de peças','Uma turma grande, mas finita. Área e perfuração evitam desperdício.',[group('swarm',40,.24),group('plaque',8,1.25)],1.8),
   wave('Três bolotas no salão','Três mini-chefes e suas pequenas divisões.',[group('mini',3,2.5),group('acid',12,.75)],1.85),
   wave('Pelo arco-íris','Corredores atravessam defesas lentas. Divida o trabalho.',[group('sugar',24,.38),group('plaque',10,1.1)],1.9),
   wave('Brinquedos em movimento','Combine controle com dano, e deixe o Toddy pronto.',[group('acid',18,.65),group('swarm',24,.25),group('plaque',7,1.1)],2),
   wave('Grande brincadeira','Último chefe! A capa protege, o fio perfura, o time vence junto.',[group('boss',1),group('mini',2,3),group('acid',14,.7)],2.1)
  ]}
 ];
 maps.push(
  {name:'Expedição pela boca',subtitle:'Boca imaginária · contorne língua e dentinhos',theme:'mouth',color:'#f8c9bf',accent:'#df8e9c',rule:'Esmalte liso: a faixa brilhante acelera os visitantes em 65%. É um deslize mágico deste mundo de faz de conta.',collectible:'Mapa dos dentinhos',zones:[{x:370,y:65,w:205,h:90,factor:1.65,label:'ESMALTE LISO'}],path:[[0,130],[180,100],[390,120],[690,100],[705,400],[555,440],[200,400],[180,285],[470,270],[475,535]],pads:[[95,205],[275,185],[795,225],[550,195],[565,345],[790,425],[341,351],[372,494],[450,200],[700,500]],waves:[
   wave('Os primeiros dentinhos','O Irrigador estreou! Seu jato devolve os corredores para as torres atacarem mais uma vez.',[group('basic',12,1),group('sugar',5,.8)],1.3),
   wave('Bolhas no caminho','O flúor ajuda a segurar quem sai da corrente.',[group('sugar',16,.5),group('swarm',18,.28)],1.45),
   wave('Um novo ajudante','Novo visitante! Ele recupera os companheiros próximos. Priorize o apoio.',[group('plaque',5,1),group('mender',2,1.1),group('basic',8,.55)],1.4),
   wave('Contorno dos molares','O fio alcança a coluna de blindados pelo contorno dos molares.',[group('plaque',10,1),group('sugar',8,.6)],1.5),
   wave('Respire entre bolhas','Depois da especialização, o Brilho mestre oferece mais alcance e força por 420 moedas.',[group('basic',16,.85)],1.8),
   wave('Surpresa na língua','Duas bolotas vão se dividir. Guarde área para a curva.',[group('mini',2,3),group('swarm',24,.24)],1.7),
   wave('Apoio na curva','Aprendizes no meio do grupo: mude a prioridade de uma torre.',[group('acid',10,.7),group('mender',4,.9),group('plaque',6,.8)],1.8),
   wave('O maestro aparece','Prepare a perfuração para o maestro.',[group('boss',1),group('sugar',14,.5)],1.6),
   wave('Outra volta pela boca','Redistribua a defesa para o retorno pelo contorno da boca.',[group('basic',16,.8),group('acid',12,.65)],2),
   wave('Bolhas em todo lugar','Área na entrada, precisão no final.',[group('swarm',36,.22),group('mender',4,.9),group('sugar',16,.4)],2.1),
   wave('Três bolotas no arco','Três bolotas preparam o último concerto.',[group('mini',3,2.5),group('plaque',10,1)],2.1),
   wave('Sorriso em movimento','O esmalte liso acelera o chefe também. Use todo o percurso.',[group('boss',1),group('mender',5,.8),group('acid',18,.6)],2.8)
  ]},
  {name:'Oficina dos molares',subtitle:'Oficina lúdica · aproveite os espelhos',theme:'workshop',color:'#f1eadc',accent:'#c4ba9d',rule:'Espelhos 2, 5 e 7: +35 de alcance para qualquer torre, inclusive a aura.',collectible:'Molar brilhante',beacons:[1,4,6],path:[[0,280],[230,70],[450,270],[240,480],[680,480],[825,280],[630,90],[450,270],[875,270]],pads:[[91,113],[276,203],[130,410],[440,395],[680,365],[652,204],[505,85],[510,415],[575,392],[800,430]],waves:[
   wave('Luzes da oficina','A Saliva estreou! Coloque-a entre torres próximas para fortalecer o time nos espelhos.',[group('basic',14,.9),group('sugar',6,.75)],1.5),
   wave('Peças em diagonal','O cruzamento permite atingir trechos diferentes.',[group('swarm',26,.25),group('acid',7,.85)],1.5),
   wave('Escolta entre espelhos','Apoio primeiro: evite que o aprendiz recupere a escolta.',[group('plaque',7,.85),group('mender',4,.85)],1.7),
   wave('Passos cruzados','Torres de precisão ajudam nos trechos mais curtos.',[group('sugar',22,.4),group('acid',10,.6)],1.6),
   wave('Hora de polir','Melhore uma torre em um espelho; sua aura pode alcançar o time inteiro.',[group('basic',20,.7)],2),
   wave('Duas visitas na bancada','Duas bolotas em lados diferentes da curva.',[group('mini',2,5),group('plaque',10,.9)],1.9),
   wave('O maestro ensaia','O primeiro chefe pede dano concentrado.',[group('boss',1),group('swarm',24,.3)],1.9),
   wave('Brilho em movimento','Aprendizes e gotas dividem a atenção da defesa.',[group('acid',16,.6),group('mender',5,.8)],2),
   wave('A próxima escolha','Reconstrua se precisar. A próxima turma usa armadura.',[group('sugar',16,.55),group('basic',12,.75)],2.1),
   wave('Caravana de molares','Combine a aura com fios bem posicionados.',[group('plaque',16,.85),group('mender',4,.95)],2.2),
   wave('Oficina movimentada','Um enxame comprido testa a cobertura das torres.',[group('swarm',44,.22),group('acid',16,.55)],2.3),
   wave('Três peças travessas','Área e controle para as divisões das bolotas.',[group('mini',3,3),group('sugar',20,.4)],2.4),
   wave('Concerto dos espelhos','Um maestro, uma escolta e os três espelhos a seu favor.',[group('boss',1),group('plaque',12,.9),group('mender',5,.8)],3.3)
  ]},
  {name:'Arco do grande sorriso',subtitle:'Sala final · a volta mais longa',theme:'smile',color:'#dde8ef',accent:'#a5bcd0',rule:'Bolhas suaves reduzem a velocidade em 35%; esmalte liso acelera 50%. Espelhos 3 e 7 ampliam o alcance.',collectible:'Estrela do sorriso',beacons:[2,6],zones:[{x:180,y:70,w:170,h:95,factor:.65,label:'BOLHAS SUAVES'},{x:720,y:190,w:100,h:140,factor:1.5,label:'ESMALTE LISO'}],path:[[0,120],[300,120],[300,425],[70,425],[70,270],[530,270],[530,90],[770,90],[770,425],[480,425],[480,535]],pads:[[124,72],[195,195],[167,500],[412,344],[630,350],[680,190],[828,285],[415,95],[400,180],[598,499]],waves:[
   wave('Primeiro arco','Observe as bolhas e o esmalte liso. Uma torre pode alcançar duas voltas.',[group('basic',15,.9),group('sugar',7,.7)],1.6),
   wave('Rastro de estrelas','Prepare o retorno: o esmalte liso acelera a saída.',[group('sugar',20,.4),group('swarm',18,.3)],1.7),
   wave('Uma turma de apoio','Prioridade de apoio ajuda contra os aprendizes.',[group('plaque',8,.95),group('mender',4,1)],1.8),
   wave('Nuvem no caminho','Controle perto do esmalte liso evita a fuga das gotas.',[group('acid',18,.65),group('sugar',10,.45)],1.9),
   wave('Pausa sob as luzes','Reserve moedas para especializar seu time.',[group('basic',24,.65)],2),
   wave('Órbita de bolotas','Duas bolotas inauguram a segunda metade da trilha.',[group('mini',2,3),group('swarm',30,.23)],2),
   wave('Pequeno eclipse','O primeiro maestro atravessa as bolhas. Prepare dano contínuo.',[group('boss',1),group('mender',3,1.1)],2),
   wave('Um novo começo','Reorganize e observe por onde escapou mais gente.',[group('basic',18,.7),group('acid',14,.65)],2.3),
   wave('Passos de cometa','Corredores rápidos passam entre os ataques lentos.',[group('sugar',30,.32),group('plaque',8,1)],2.3),
   wave('Dança dos ajudantes','Cada aprendiz sustenta a escolta. Concentre o ataque.',[group('plaque',12,.85),group('mender',6,.75),group('acid',8,.65)],2.4),
   wave('Quatro constelações','Quatro bolotas: use o rugido com as divisões.',[group('mini',4,3),group('swarm',30,.24)],2.5),
   wave('A volta do maestro','O segundo maestro exige uma defesa já especializada.',[group('boss',1),group('sugar',22,.4)],2.6),
   wave('Cauda brilhante','Perfuração para o enxame, precisão para as gotas.',[group('swarm',50,.2),group('acid',22,.55)],2.7),
   wave('Última preparação','Última escolta antes do concerto. Confira as prioridades.',[group('plaque',18,.8),group('mender',5,.8),group('mini',2,3)],2.7),
   wave('O grande sorriso','Dois maestros em sequência! Preserve alcance em toda a trilha.',[group('boss',2,16),group('acid',18,.6),group('mender',4,1)],3.2)
  ]}
 );
 // Two additional central placements make the aura useful; pressure now grows with the team.
 maps[4].waves.forEach(w=>w.scale=+(w.scale*1.105).toFixed(3));
 // Os títulos reforçam a jornada visual sem alterar o papel estratégico de cada onda.
 const medals={perfect:{name:'Sorriso intacto',detail:'Vença com os 20 pontos de sorriso.'},team:{name:'Time completo',detail:'Vença com pelo menos 4 tipos de torre em campo.'}};
 const ability={cooldown:32,duration:3.5,slow:.45,bossSlow:.75};
 // Modo difícil: liberado só depois que a criança vence a última fase. Todas as
 // torres liberadas em qualquer fase, visitantes 6% mais rápidos, 8% menos moedas e
 // resistência ajustada por fase (as 5 torres deixam as primeiras fases muito mais
 // fáceis). Calibrado em _ferramentas/qa-tower/adulto-sim.cjs: contra as mesmas
 // estratégias, cerca de metade das vitórias do modo normal em cada fase.
 // (internamente continua se chamando "adult"/"hard" para manter os saves compatíveis)
 const adult={hp:[.96,.93,.96,1.10,1.08,1.03],speed:1.06,cash:.92,reward:.92};
 const data={economy,towers,enemies,maps,stats,medals,ability,adult,introductions,unlockedTowers,towerAvailable,purchaseCost,step:1/60,version:3};
 if(typeof module!=='undefined'&&module.exports)module.exports=data;else root.LuccareBalance=data;
})(typeof window!=='undefined'?window:globalThis);


