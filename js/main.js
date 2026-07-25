"use strict";
import {ROSTER,ROSTER_IDS,isMirrorMatch} from './roster.js';
import {STAGES,drawStage} from './stages.js';
import {STORY_ORDER,STORY_STAGES,SAVE_KEY} from './story.js';
import {CONTROL_MAPS,InputManager} from './input.js';
import {decideCPU} from './ai.js';
import {TimerRegistry,clamp,resetCombo} from './combat.js';
import {EffectSystem} from './effects.js';
import {Fighter} from './fighter.js';
import {moveList} from './movesets.js';
import {trainingState,recordInput,clearTraining,resetTrainingWorld,exitTrainingWorld,setTrainingSetting,dummyCommand} from './training.js';
import {byId as $} from './ui.js';
import {clearClash,cpuClashContribution,createClashState,tryProjectileClash,updateClash} from './clash-system.js';

const canvas=$('game'),ctx=canvas.getContext('2d'),WIDTH=canvas.width,HEIGHT=canvas.height,GROUND=430;
const U={menu:$('menuScreen'),game:$('gameScreen'),mode:$('mode'),diff:$('difficulty'),stage:$('stage'),rt:$('roundTime'),rounds:$('rounds'),roster:$('roster'),slot1:$('slot1'),slot2:$('slot2'),n1:$('name1'),n2:$('name2'),m1:$('moves1'),m2:$('moves2'),s2l:$('slot2label'),notice:$('notice'),p1n:$('p1name'),p2n:$('p2name'),p1h:$('p1hp'),p2h:$('p2hp'),p1e:$('p1en'),p2e:$('p2en'),p1g:$('p1guard'),p2g:$('p2guard'),p1d:$('p1defense'),p2d:$('p2defense'),timer:$('timer'),rl:$('roundLabel'),msg:$('msg'),mt:$('msgTitle'),mx:$('msgText'),mb:$('msgButton'),pause:$('pause')};
const comboHud=[document.createElement('div'),document.createElement('div')];comboHud.forEach((element,index)=>{element.className=`comboHud c${index+1}`;$('gameWrap').appendChild(element)});
const cooldownHud=[document.createElement('div'),document.createElement('div')];cooldownHud.forEach((element,index)=>{element.className='moveCooldown';(index?U.p2e:U.p1e).parentElement.parentElement.appendChild(element)});
const clashHud=document.createElement('div');clashHud.className='clashHud hidden';clashHud.innerHTML='<strong id="clashLabel">CLASH!</strong><div class="clashTrack"><div class="clashFill" id="clashFill"></div></div>';$('gameWrap').appendChild(clashHud);
const trainingHud=document.createElement('div');trainingHud.className='trainingHud hidden';trainingHud.innerHTML='<div id="trainStats"></div><div id="trainMoves"></div><div><label><input id="liveHealth" type="checkbox" checked> ∞ HP</label> <label><input id="liveEnergy" type="checkbox" checked> ∞ ENERGY</label> <label><input id="liveGuard" type="checkbox"> ∞ GUARD</label> <label><input id="liveGuardRegen" type="checkbox" checked> GUARD REGEN</label> <label><input id="livePerfectPractice" type="checkbox"> PB PRACTICE</label> <label><input id="liveClash" type="checkbox"> ∞ CLASH</label><br><select id="liveDummy"><option value="never">Never Block</option><option value="always">Always Block</option><option value="after">Block After First Hit</option><option value="perfect">Perfect Block</option><option value="breaker">Use Breaker</option><option value="stationary">Stationary</option><option value="cpu">CPU Dummy</option></select> <label><input id="stationaryBlock" type="checkbox"> Stationary blocks</label><br><button id="forceClash">FORCE NEXT CLASH</button><button id="resetClash">RESET CLASH</button><button id="trainResetPos">RESET TRAINING (Y)</button><button id="trainResetCombo">RESET COMBO</button><button id="trainRestart">QUICK RESTART</button><button id="exitTraining">EXIT TRAINING</button><div id="trainInputs"></div></div>';$('gameWrap').appendChild(trainingHud);

let selectSlot=1,p1id='rrvvfo',p2id='revvfo',mode='story',difficulty='normal',stage='dojo',limit=90,roundsToWin=2,currentRound=1,wins1=0,wins2=0,state='menu',paused=false,story=0,time=90,last=0,acc=0,audio=null;
const input=new InputManager();
const world={width:WIDTH,height:HEIGHT,ground:GROUND,fighters:[],projectiles:[],effects:new EffectSystem(),timers:new TimerRegistry(),clash:createClashState(),shake:0,hitstop:0,training:trainingState,sound,tryProjectileClash};

function sound(frequency=220,duration=.05,type='square',volume=.03){try{audio??=new(AudioContext||webkitAudioContext)();const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type=type;oscillator.frequency.value=frequency;gain.gain.value=volume;oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);oscillator.stop(audio.currentTime+duration)}catch{}}
function different(id){const choices=ROSTER_IDS.filter(candidate=>candidate!==id);return choices[Math.floor(Math.random()*choices.length)]}
function clearTransient(){world.timers.cancelAll();world.projectiles.length=0;world.effects.clear();clearClash(world);world.shake=0;world.hitstop=0}

function buildRoster(){U.roster.innerHTML='';for(const id of ROSTER_IDS){const c=ROSTER[id],button=document.createElement('button');button.className='card';button.dataset.id=id;button.innerHTML=`<div class="portrait"><div class="head" style="background:${c.h}"></div><div class="body" style="background:${c.c};box-shadow:0 0 12px ${c.a}66"></div></div><b>${c.n.toUpperCase()}</b><div>${c.o}</div>`;button.onclick=()=>choose(id);U.roster.appendChild(button)}refreshSelection()}
function choose(id){if(selectSlot===1){if(isMirrorMatch(id,p2id)){p2id=different(id);U.notice.textContent='Mirror matches are disabled, so Player 2 changed.'}p1id=id}else{if(isMirrorMatch(id,p1id)){U.notice.textContent='You cannot use the same character on both sides.';return}p2id=id}refreshSelection()}
function refreshSelection(){const a=ROSTER[p1id],b=ROSTER[p2id];U.n1.textContent=a.n.toUpperCase();U.n2.textContent=b.n.toUpperCase();U.m1.textContent=`${a.s} • ${a.u}`;U.m2.textContent=`${b.s} • ${b.u}`;U.slot1.classList.toggle('active',selectSlot===1);U.slot2.classList.toggle('active',selectSlot===2);document.querySelectorAll('.card').forEach(card=>{card.classList.toggle('p1',card.dataset.id===p1id);card.classList.toggle('p2',card.dataset.id===p2id)})}

function humanCommand(side){
  const map=CONTROL_MAPS[side-1],pressed=new Set(),down=new Set();
  for(const [action,key] of Object.entries(map)){if(input.down(key))down.add(action);if(input.consume(key))pressed.add(action)}
  if(side===1){if(input.down('Space'))down.add('j');if(input.consume('Space'))pressed.add('j')}
  if((pressed.has('a')&&down.has('h'))||(pressed.has('h')&&down.has('a'))){pressed.delete('a');pressed.delete('h');pressed.add('t')}
  if(pressed.has('s')&&down.has('b')){pressed.delete('s');pressed.add('k')}
  return{down:action=>down.has(action),pressed:action=>pressed.has(action)};
}
function aiCommand(fighter,foe){
  const decision=decideCPU(fighter,foe,difficulty),down=new Set(),pressed=new Set(decision.actions);if(decision.move)down.add(decision.move);if(decision.block)down.add('b');
  return{down:action=>down.has(action),pressed:action=>pressed.has(action)};
}
function commandFor(fighter){
  if(trainingState.enabled&&fighter.side===2)return trainingState.dummy==='cpu'?aiCommand(fighter,fighter.foe()):dummyCommand(fighter);
  return fighter.cpu?aiCommand(fighter,fighter.foe()):humanCommand(fighter.side);
}

function setup(){
  if(p1id===p2id)p2id=different(p1id);clearTransient();input.clear();paused=false;time=limit;
  world.fighters=[new Fighter(p1id,1,false,world),new Fighter(p2id,2,mode!=='local'&&mode!=='training',world)];
  U.p1n.textContent=`${ROSTER[p1id].n.toUpperCase()}  ${wins1}`;U.p2n.textContent=`${wins2}  ${ROSTER[p2id].n.toUpperCase()}`;
  U.rl.textContent=mode==='story'?`STORY ${story+1}/${STORY_ORDER.length} • ROUND ${currentRound}`:mode==='training'?'TRAINING':`ROUND ${currentRound}`;
  U.msg.classList.add('hidden');U.pause.classList.add('hidden');state='playing';last=performance.now();
}
function startGame(){
  mode=U.mode.value;trainingState.enabled=mode==='training';trainingHud.classList.toggle('hidden',!trainingState.enabled);if(trainingState.enabled)clearTraining();
  difficulty=U.diff.value;limit=+U.rt.value;roundsToWin=mode==='story'?1:+U.rounds.value;currentRound=1;wins1=wins2=story=0;
  if(mode==='story'){p2id=STORY_ORDER[0];if(p2id===p1id){story++;p2id=STORY_ORDER[story]}stage=STORY_STAGES[story]}else stage=U.stage.value;
  U.menu.classList.add('hidden');U.game.classList.remove('hidden');setup();
}
function over(winner){
  state='over';clearTransient();const p1win=winner===world.fighters[0];if(p1win)wins1++;else wins2++;const matchWon=wins1>=roundsToWin||wins2>=roundsToWin;
  if(!matchWon){currentRound++;show(p1win?`${ROSTER[p1id].n} TAKES ROUND ${currentRound-1}`:`${ROSTER[p2id].n} TAKES ROUND ${currentRound-1}`,`Score: ${wins1}–${wins2}`,'NEXT ROUND',setup);return}
  if(mode==='story'&&p1win){story++;currentRound=1;wins1=wins2=0;if(story>=STORY_ORDER.length){localStorage.setItem(SAVE_KEY,JSON.stringify({cleared:true,date:Date.now()}));show('STORY CLEARED!','You defeated the full Clash of Souls roster. Your victory is saved in this browser.','PLAY AGAIN',()=>{story=0;p2id=STORY_ORDER[0];stage=STORY_STAGES[0];setup()});return}p2id=STORY_ORDER[story];if(p2id===p1id){story++;if(story>=STORY_ORDER.length){localStorage.setItem(SAVE_KEY,JSON.stringify({cleared:true,date:Date.now()}));show('STORY CLEARED!','You defeated the full Clash of Souls roster.','PLAY AGAIN',startGame);return}p2id=STORY_ORDER[story]}stage=STORY_STAGES[story];show('NEXT FIGHT',`${ROSTER[p2id].n} enters ${STAGES[stage].n}.`,'CONTINUE',setup)}
  else show(p1win?`${ROSTER[p1id].n} WINS THE MATCH!`:`${ROSTER[p2id].n} WINS THE MATCH!`,mode==='story'?'Your story run ended. Try again.':`Final score: ${wins1}–${wins2}`,'REMATCH',()=>{currentRound=1;wins1=wins2=0;setup()});
}
function show(title,text,button,callback){U.mt.textContent=title;U.mx.textContent=text;U.mb.textContent=button;U.msg.classList.remove('hidden');U.mb.onclick=callback}
function returnToCharacterSelect(){
  if(trainingState.enabled)exitTrainingWorld(world,input);else{clearTransient();input.clear()}
  trainingHud.classList.add('hidden');trainingState.enabled=false;paused=false;state='menu';U.msg.classList.add('hidden');U.pause.classList.add('hidden');U.game.classList.add('hidden');U.menu.classList.remove('hidden');refreshSelection();
}

function update(dt){
  if(state!=='playing'||paused)return;input.poll();if(world.hitstop>0){world.hitstop--;return}
  if(world.clash.active){
    const contributions=world.fighters.map((fighter,index)=>{
      const cpu=fighter.cpu||(trainingState.enabled&&fighter.side===2&&trainingState.dummy==='cpu');
      if(cpu)return cpuClashContribution(difficulty,fighter,world.clash.frame);
      const map=CONTROL_MAPS[index],pressed=(input.consume(map.a)?1:0)+(input.consume(map.h)?1:0);
      return pressed*4;
    });
    updateClash(world,contributions);world.effects.update();return;
  }
  if(!trainingState.enabled)time=Math.max(0,time-dt);
  for(const fighter of world.fighters)fighter.update(commandFor(fighter));
  if(trainingState.enabled){if(trainingState.infiniteHealth)for(const fighter of world.fighters)fighter.hp=100;if(trainingState.infiniteEnergy)for(const fighter of world.fighters)fighter.en=100;if(trainingState.infiniteGuard)for(const fighter of world.fighters)fighter.guard=fighter.guardMax}
  for(const projectile of world.projectiles)projectile.update(world);world.projectiles=world.projectiles.filter(projectile=>!projectile.dead);world.effects.update();
  if(!trainingState.enabled&&(world.fighters[0].hp<=0||world.fighters[1].hp<=0||time<=0)){const [a,b]=world.fighters,winner=a.hp===b.hp?world.fighters[Math.random()<.5?0:1]:a.hp>b.hp?a:b;over(winner)}
}
function render(){
  ctx.save();if(world.shake>0){ctx.translate((Math.random()-.5)*world.shake,(Math.random()-.5)*world.shake);world.shake*=.86;if(world.shake<.5)world.shake=0}
  drawStage(ctx,stage,WIDTH,HEIGHT,GROUND);world.effects.draw(ctx);for(const fighter of world.fighters)fighter.draw(ctx);for(const projectile of world.projectiles)projectile.draw(ctx);ctx.restore();
  if(!world.fighters.length)return;const blinded=world.fighters.find(fighter=>fighter.lens>0&&!fighter.cpu);
  if(blinded){ctx.save();ctx.fillStyle='rgba(0,0,0,.96)';ctx.fillRect(0,0,WIDTH,HEIGHT);ctx.textAlign='center';ctx.fillStyle='#f7f7ff';ctx.font='900 30px Segoe UI';ctx.fillText('LENS OF TRUTH',WIDTH/2,HEIGHT/2-8);ctx.font='bold 16px Segoe UI';ctx.fillStyle='#cfd6ff';ctx.fillText(blinded.lens<60?'WARNING • LENS ENDING':'VISION LOST • AUTO-DODGE ACTIVE',WIDTH/2,HEIGHT/2+24);ctx.restore()}
  world.fighters.forEach((fighter,index)=>comboHud[index].innerHTML=fighter.combo.hits>1?`${fighter.combo.hits} HIT COMBO<small>${fighter.combo.damage.toFixed(1)} DAMAGE • ${Math.round(fighter.combo.scale*100)}% SCALE</small>`:'');
  world.fighters.forEach((fighter,index)=>{
    const seconds=fighter.agonyCooldown>0?` • ${Math.ceil(fighter.agonyCooldown/60)}s`:'';
    cooldownHud[index].textContent=fighter.id!=='rrvvfo'?'':fighter.agonyActiveVolley?`SHOTS OF AGONY • VOLLEY ACTIVE${seconds}`:fighter.agonyCooldown>0?`SHOTS OF AGONY${seconds}`:'';
  });
  clashHud.classList.toggle('hidden',!world.clash.active);
  if(world.clash.active){$('clashLabel').textContent=world.clash.type==='beam'?'BEAM CLASH!':world.clash.type==='ultimate'?'ULTIMATE CLASH!':'CLASH!';const amount=(world.clash.meter+100)/2;$('clashFill').style.left=`${Math.min(50,amount)}%`;$('clashFill').style.width=`${Math.abs(amount-50)}%`}
  if(trainingState.enabled){$('trainStats').innerHTML=`COMBO ${world.fighters[0].combo.hits}<br>DAMAGE ${world.fighters[0].combo.damage.toFixed(1)}<br>SCALING ${Math.round(world.fighters[0].combo.scale*100)}%<br>GUARD DMG ${world.fighters[1].guardDamageLast.toFixed(1)}<br>PB WINDOW ${world.fighters[0].perfectBlockWindow}<br>DUMMY ${trainingState.dummy.toUpperCase()}<br>CLASH ${world.clash.active?`${world.clash.type.toUpperCase()} ${world.clash.meter.toFixed(1)}`:trainingState.forceNextClash?'ARMED':'READY'}`;$('trainMoves').innerHTML=`<b>${ROSTER[p1id].n} MOVE LIST</b><br>${moveList(p1id).join('<br>')||'Legacy light • heavy • launcher • air • special • ultimate'}`;$('trainInputs').textContent=`INPUTS: ${trainingState.inputHistory.join(' › ')}`}
  const [a,b]=world.fighters;U.p1h.style.width=a.hp+'%';U.p2h.style.width=b.hp+'%';U.p1e.style.width=a.en+'%';U.p2e.style.width=b.en+'%';U.p1g.style.width=a.guard+'%';U.p2g.style.width=b.guard+'%';U.p1d.textContent=a.guardBreakStun?'GUARD BROKEN':a.breakerUsed?'BREAKER SPENT':'BREAKER READY';U.p2d.textContent=b.guardBreakStun?'GUARD BROKEN':b.breakerUsed?'BREAKER SPENT':'BREAKER READY';U.timer.textContent=Math.ceil(time);
}
function loop(timestamp){const delta=Math.min(.034,(timestamp-last)/1000||0);last=timestamp;acc+=delta;while(acc>=1/60){update(1/60);acc-=1/60}if(state!=='menu')render();requestAnimationFrame(loop)}

U.slot1.onclick=()=>{selectSlot=1;refreshSelection()};U.slot2.onclick=()=>{selectSlot=2;refreshSelection()};
U.mode.onchange=()=>{U.s2l.textContent=U.mode.value==='local'?'PLAYER 2 — CLICK TO SELECT':'CPU/DUMMY — CLICK TO SELECT';$('trainingOptions').classList.toggle('hidden',U.mode.value!=='training')};
$('random').onclick=()=>{p1id=ROSTER_IDS[Math.floor(Math.random()*ROSTER_IDS.length)];p2id=different(p1id);refreshSelection()};$('reset').onclick=()=>{localStorage.removeItem(SAVE_KEY);U.notice.textContent='Saved progress reset.'};$('fight').onclick=startGame;
$('backMenu').onclick=returnToCharacterSelect;
addEventListener('keydown',event=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code))event.preventDefault();if(event.code==='Escape'&&trainingState.enabled){event.preventDefault();returnToCharacterSelect();return}input.setKeyboard(event.code,true);if(trainingState.enabled)recordInput(event.code.replace('Key',''));if(event.code==='KeyY'&&trainingState.enabled)resetTrainingWorld(world);if(event.code==='KeyP'&&state==='playing'){paused=!paused;U.pause.classList.toggle('hidden',!paused)}});
addEventListener('keyup',event=>input.setKeyboard(event.code,false));
document.querySelectorAll('[data-t]').forEach(button=>{const map={left:'KeyA',right:'KeyD',jump:'KeyW',attack:'KeyF',special:'KeyG',ult:'KeyH'},key=map[button.dataset.t],down=event=>{event.preventDefault();input.setTouch(key,true)},up=event=>{event.preventDefault();input.setTouch(key,false)};button.onpointerdown=down;button.onpointerup=up;button.onpointercancel=up;button.onpointerleave=up});
function bindSyncedCheckbox(preId,liveId,key){const pre=$(preId),live=$(liveId),apply=event=>setTrainingSetting(key,event.target.checked,pre,live);pre.onchange=apply;live.onchange=apply}
bindSyncedCheckbox('trainHealth','liveHealth','infiniteHealth');bindSyncedCheckbox('trainEnergy','liveEnergy','infiniteEnergy');bindSyncedCheckbox('preStationaryBlock','stationaryBlock','stationaryBlock');
bindSyncedCheckbox('trainGuard','liveGuard','infiniteGuard');bindSyncedCheckbox('trainGuardRegen','liveGuardRegen','guardRegen');bindSyncedCheckbox('trainPerfectPractice','livePerfectPractice','perfectBlockPractice');
bindSyncedCheckbox('trainClash','liveClash','infiniteClash');
function syncDummy(event){setTrainingSetting('dummy',event.target.value,$('dummyMode'),$('liveDummy'));trainingState.afterFirstHit=false}$('dummyMode').onchange=syncDummy;$('liveDummy').onchange=syncDummy;
$('forceClash').onclick=()=>{trainingState.forceNextClash=true};$('resetClash').onclick=()=>clearClash(world);$('trainResetPos').onclick=()=>resetTrainingWorld(world);$('trainResetCombo').onclick=()=>{for(const fighter of world.fighters){resetCombo(fighter.combo);fighter.lightChain=0;fighter.lightChainTimer=0;fighter.chainLockout=0}trainingState.afterFirstHit=false};$('trainRestart').onclick=setup;$('exitTraining').onclick=returnToCharacterSelect;

buildRoster();U.mode.dispatchEvent(new Event('change'));if(localStorage.getItem(SAVE_KEY))U.notice.textContent='Story clear detected on this browser.';requestAnimationFrame(loop);
