import {storyExperienceBeat,storyRankReaction} from './story-experience.js?v=29a4071-chapter3-sabotage-investigation-20260802';
const SESSION_KEY='pxStoryCharmSessionV1';
const MAX_QUEUE=16;

const CHECKPOINT_MOMENTS=Object.freeze({
  'rrvvfo-road-bridge':{kind:'arrival',kicker:'ROUTE OPENED',title:'RIVER CROSSING',detail:'Object Swap turned the broken bridge into a shortcut.',tone:'rrvvfo'},
  'rrvvfo-road-transport':{kind:'banter',lines:[['TRANSPORT DRIVER','You saved the supplies and the whole cart.'],['RRVVFO','Make sure the announcer says that part twice.']]},
  'rrvvfo-road-encounter':{kind:'arrival',kicker:'ROAD CLEARED',title:'TOURNAMENT ROAD',detail:'The final stretch to the tournament is open.',tone:'gold'},
  'rrvvfo-02-hub':{kind:'arrival',kicker:'DESTINATION REACHED',title:'TOURNAMENT GROUNDS',detail:'The festival is alive. The bracket is not.',tone:'gold'},
  'rrvvfo-02-quarterfinal':{kind:'banter',lines:[['WADE','You know the crowd cheers louder when you almost fall out, right?'],['RRVVFO','Then they are getting a very expensive show.'],['BARK','Try winning without nearly losing first.']]},
  'rrvvfo-02-wade':{kind:'banter',lines:[['WADE','Do I still get to cheer if I am the opponent?'],['BARK','You will cheer either way.'],['RRVVFO','He might cheer while attacking me.']]},
  'rrvvfo-03-facilityEntered':{kind:'arrival',kicker:'NEW AREA',title:'RESONANCE FACILITY',detail:'The tournament mystery continues below the ring.',tone:'mystery'},
  'rrvvfo-03-projectHollow':{kind:'arrival',kicker:'DISCOVERY',title:'PROJECT HOLLOW',detail:'Someone has been recording fighters and rebuilding their attacks.',tone:'danger'},
  'rrvvfo-04-villageReached':{kind:'arrival',kicker:'DESTINATION REACHED',title:'ECHO VILLAGE',detail:'An ancient settlement cut off from the tournament world.',tone:'echo'},
  'rrvvfo-04-beaconRestored':{kind:'banter',lines:[['WADE','The beacon is glowing. That means I fixed it.'],['BARK','All three of us fixed it.'],['RRVVFO','Let him have this. It may be his first correct wire.']]},
  'rrvvfo-04-villageDefended':{kind:'arrival',kicker:'HUB CHANGED',title:'ECHO VILLAGE SECURED',detail:'Villagers return outside, repair fires are lit, and the mountain route opens.',tone:'victory'},
  'rrvvfo-04-mountainEntered':{kind:'banter',lines:[['WADE','I could climb with you.'],['BARK','You said that already.'],['RRVVFO','He is hoping the mountain changes its answer.']]},
  'rrvvfo-04-hollowWatcherDefeated':{kind:'arrival',kicker:'THREAT CLEARED',title:'HOLLOW WATCHER DOWN',detail:'The machine learned Rrvvfo’s habits. It did not learn why he changes them.',tone:'danger'},
  'rrvvfo-04-lookoutReached':{kind:'arrival',kicker:'DESTINATION REACHED',title:'SHADOW’S LOOKOUT',detail:'No bridge. One pebble. One perfectly timed Object Swap.',tone:'echo'}
});


const CHECKPOINT_BANTER=Object.freeze({
  'rrvvfo-road-cart-saved':[['TOURNAMENT DRIVER','I was already planning how to explain losing the whole cart.'],['RRVVFO','Tell them you planned around me showing up.']],
  'rrvvfo-02-round-1':[['WADE','One win and people already know your name.'],['BARK','They knew his name before the fight.'],['RRVVFO','Yeah, but now they say it louder.']],
  'rrvvfo-02-final':[['BARK','Last round. Stop looking at the crowd.'],['WADE','Counterpoint: the crowd is looking at him.'],['RRVVFO','Both of you are making this worse.']],
  'rrvvfo-03-projectHollow':[['RRVVFO','So all of that weird tournament stuff has a name now.'],['RRVVFO','Not sure that makes it better.']],
  'rrvvfo-04-barkWadeArrive':[['WADE','Three ninjas again. This should go perfectly.'],['BARK','That sentence guarantees it will not.'],['RRVVFO','Good. We are all caught up.']],
  'rrvvfo-04-villageDefended':[['WADE','Nobody say I almost got knocked out.'],['BARK','You just said it.'],['RRVVFO','And now the village knows too.']],
  'rrvvfo-04-mountainEntered':[['RRVVFO','...It got quiet fast.']]
});

const TECHNIQUE_LABELS=Object.freeze({
  combatManual:['SAGE MANUAL','Combat rules, field techniques, and discoveries can now be reviewed.'],
  fieldObjectSwap:['FIELD OBJECT SWAP','Swap with marked objects during Story exploration.'],
  fieldShotsOfAgony:['FIELD MASTERY UPDATED','A retired early field lesson has been converted to Object Swap mastery.'],
  fieldLensOfTruth:['FIELD LENS OF TRUTH','Reveal disguised routes and hidden evidence.'],
  vibrationSense:['VIBRATION SENSE','Reveal hidden movement and underground activity.'],
  lensMastery1:['LENS MASTERY • LEVEL 1','Prediction and hidden-target reading have improved.'],
  echoTeamBadge:['ECHO TEAM BADGE','A record of the three-ninja Echo Village operation.'],
  hollowWatcherProfile:['HOLLOW WATCHER PROFILE','The Sage Manual now records its adaptation behavior.']
});

const MISSION_UNLOCKS=Object.freeze({
  'rrvvfo-01':{kicker:'ROUTE UPDATED',title:'TOURNAMENT ROAD UNLOCKED',detail:'Leave the Training Grounds and travel toward the tournament.'},
  'rrvvfo-road':{kicker:'NEW CHAPTER',title:'CHAPTER 2 UNLOCKED',detail:'Definitely Not the World Tournament is now available.'},
  'rrvvfo-02':{kicker:'NEW CHAPTER + MODE',title:'CHAPTER 3 & LOCAL 2 PLAYER',detail:'Something Under the Ring and local multiplayer are now available.'},
  'rrvvfo-03':{kicker:'NEW CHAPTER + MODE',title:'CHAPTER 4 & ARENA',detail:'Echo Region and Arena Mode are now available.'},
  'rrvvfo-04':{kicker:'ROUTE MILESTONE',title:'RRVVFO ROUTE • 50% COMPLETE',detail:'Four of eight planned chapters are complete.'}
});

function sessionState(){
  try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'{"seen":[]}')}catch{return{seen:[]}}
}
function remember(key){
  if(!key)return true;
  const state=sessionState();if(state.seen?.includes(key))return false;
  state.seen=[...(state.seen||[]),key].slice(-80);
  try{sessionStorage.setItem(SESSION_KEY,JSON.stringify(state))}catch{}
  return true;
}
function cleanLabel(value=''){return String(value).replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[-_:]/g,' ').replace(/\s+/g,' ').trim().toUpperCase()}
function activeStory(){return Boolean(document.querySelector('.storyEngineActive'))}

class StoryCharmController{
  constructor(){this.root=null;this.queue=[];this.running=false;this.mode='';this.timer=0;this.bound=false}
  build(){
    if(this.root&&document.body.contains(this.root))return;
    this.root=document.createElement('div');this.root.id='storyCharmLayer';
    this.root.innerHTML=`
      <section class="storyCharmArrival" data-charm-arrival hidden aria-live="polite"><i></i><div><small data-charm-arrival-kicker>DESTINATION REACHED</small><h2 data-charm-arrival-title></h2><p data-charm-arrival-detail></p></div><b></b></section>
      <aside class="storyPartyBanter" data-charm-banter hidden aria-live="polite"><small>PARTY BANTER</small><strong data-charm-banter-speaker></strong><p data-charm-banter-text></p><div data-charm-banter-dots></div></aside>
      <section class="storyProgressCelebration" data-charm-progress hidden aria-live="assertive"><div class="storyCelebrationBurst"></div><article><small data-charm-progress-kicker>PROGRESSION</small><h2 data-charm-progress-title></h2><p data-charm-progress-detail></p><div data-charm-progress-items></div></article></section>`;
    document.body.appendChild(this.root);
  }
  bind(){
    if(this.bound)return;this.bound=true;this.build();
    document.addEventListener('pxstorycheckpoint',event=>this.onCheckpoint(event.detail||{}));
    document.addEventListener('pxstoryprogression',event=>this.onProgression(event.detail||{}));
    document.addEventListener('pxstoryarrival',event=>this.enqueue({kind:'arrival',...(event.detail||{})}));
    document.addEventListener('pxstorybanter',event=>this.enqueue({kind:'banter',...(event.detail||{})}));
    document.addEventListener('pxstorycelebration',event=>this.enqueue({kind:'celebration',...(event.detail||{})}));
    document.addEventListener('pxstorymodechange',event=>{this.mode=event.detail?.to||''});
    document.addEventListener('pxstorymenuopen',()=>this.clearVisuals());
    document.addEventListener('pxstoryfightrank',event=>{const reaction=storyRankReaction(event.detail?.rank);if(reaction)this.enqueue({...reaction,once:false})});
  }
  clearVisuals(){
    if(!this.root)return;
    for(const node of this.root.children){node.classList.remove('show');node.hidden=true}
    clearTimeout(this.timer);this.running=false;
    if(this.queue.length)queueMicrotask(()=>this.next());
  }
  enqueue(item={}){
    if(!item.kind)return;
    const key=item.onceKey||`${item.kind}:${item.title||item.lines?.map(line=>line.join(':')).join('|')||''}`;
    if(item.once!==false&&!remember(key))return;
    this.queue.push({...item,key});if(this.queue.length>MAX_QUEUE)this.queue.shift();this.next();
  }
  next(){
    if(this.running||!this.queue.length)return;
    if(!activeStory()&&this.queue[0].kind!=='celebration'){this.queue.shift();return this.next()}
    if(['combat','fight','dialogue','qte','manual','tracker'].includes(this.mode)){setTimeout(()=>this.next(),350);return}
    const item=this.queue.shift();this.running=true;
    if(item.kind==='arrival')this.showArrival(item);
    else if(item.kind==='banter')this.showBanter(item);
    else this.showCelebration(item);
  }
  finish(node,delay=180){
    clearTimeout(this.timer);node.classList.remove('show');
    this.timer=setTimeout(()=>{node.hidden=true;this.running=false;this.next()},delay);
  }
  showArrival(item){
    this.build();const node=this.root.querySelector('[data-charm-arrival]');node.dataset.tone=item.tone||'gold';
    node.querySelector('[data-charm-arrival-kicker]').textContent=item.kicker||'DESTINATION REACHED';
    node.querySelector('[data-charm-arrival-title]').textContent=item.title||'NEW AREA';
    node.querySelector('[data-charm-arrival-detail]').textContent=item.detail||'';
    node.hidden=false;node.classList.remove('show');void node.offsetWidth;node.classList.add('show');
    document.dispatchEvent(new CustomEvent('pxstoryuicue',{detail:{cue:'arrival'}}));
    this.timer=setTimeout(()=>this.finish(node),item.duration||2600);
  }
  showBanter(item){
    this.build();const node=this.root.querySelector('[data-charm-banter]'),lines=(item.lines||[]).filter(line=>Array.isArray(line)&&line.length>=2);if(!lines.length){this.running=false;return this.next()}
    let index=0;node.querySelector('[data-charm-banter-dots]').innerHTML=lines.map((_,i)=>`<i data-banter-dot="${i}"></i>`).join('');
    const render=()=>{const [speaker,text]=lines[index];node.querySelector('[data-charm-banter-speaker]').textContent=speaker;node.querySelector('[data-charm-banter-text]').textContent=text;node.querySelectorAll('[data-banter-dot]').forEach((dot,i)=>dot.classList.toggle('active',i===index));document.dispatchEvent(new CustomEvent('pxstoryuicue',{detail:{cue:'banter'}}))};
    node.hidden=false;node.classList.remove('show');void node.offsetWidth;node.classList.add('show');render();
    const advance=()=>{index++;if(index>=lines.length){this.finish(node);return}render();this.timer=setTimeout(advance,item.lineDuration||2200)};
    this.timer=setTimeout(advance,item.lineDuration||2200);
  }
  showCelebration(item){
    this.build();const node=this.root.querySelector('[data-charm-progress]');node.dataset.tone=item.tone||item.type||'unlock';
    node.querySelector('[data-charm-progress-kicker]').textContent=item.kicker||'PROGRESSION';
    node.querySelector('[data-charm-progress-title]').textContent=item.title||'UNLOCKED';
    node.querySelector('[data-charm-progress-detail]').textContent=item.detail||'';
    const items=(item.items||[]).filter(Boolean);node.querySelector('[data-charm-progress-items]').innerHTML=items.map(value=>`<span>${value}</span>`).join('');
    node.hidden=false;node.classList.remove('show');void node.offsetWidth;node.classList.add('show');
    document.dispatchEvent(new CustomEvent('pxstoryuicue',{detail:{cue:item.type==='level'?'levelUp':'unlock'}}));
    this.timer=setTimeout(()=>this.finish(node,240),item.duration||3900);
  }
  onCheckpoint({checkpoint}={}){const moment=CHECKPOINT_MOMENTS[checkpoint]||storyExperienceBeat(checkpoint);if(moment)this.enqueue({...moment,onceKey:`checkpoint:${checkpoint}`});const banter=CHECKPOINT_BANTER[checkpoint];if(banter)setTimeout(()=>this.enqueue({kind:'banter',lines:banter,onceKey:`checkpoint-banter:${checkpoint}`,lineDuration:1650}),650)}
  onProgression(detail={}){
    const levelFrom=Number(detail.oldLevel)||0,levelTo=Number(detail.newLevel)||0;
    if(levelTo>levelFrom){
      setTimeout(()=>{if(document.querySelector('[data-level-up]:not([hidden])'))return;this.enqueue({kind:'celebration',type:'level',tone:'level',kicker:'LEVEL UP!',title:`TRAINING LEVEL ${levelTo}`,detail:detail.source||'Story experience converted into permanent Story growth.',items:(detail.statChanges||[]).map(change=>`${change.label} +${change.amount}`),onceKey:`level:${levelTo}`})},80);
    }
    for(const mission of detail.newMissions||[]){const card=MISSION_UNLOCKS[mission];if(card)this.enqueue({kind:'celebration',type:'route',tone:'route',...card,onceKey:`mission:${mission}`})}
    const techniques=(detail.newUnlocks||[]).map(id=>({id,entry:TECHNIQUE_LABELS[id]})).filter(item=>item.entry);
    if(techniques.length)this.enqueue({kind:'celebration',type:'technique',tone:'technique',kicker:techniques.length>1?'TECHNIQUES UNLOCKED':'TECHNIQUE UNLOCKED',title:techniques[0].entry[0],detail:techniques[0].entry[1],items:techniques.slice(1).map(item=>item.entry[0]),onceKey:`techniques:${techniques.map(item=>item.id).join(',')}`});
    if((detail.statChanges||[]).length&&!(levelTo>levelFrom))this.enqueue({kind:'celebration',type:'stat',tone:'stat',kicker:'STORY STAT BOOST',title:'PERMANENT GROWTH',detail:'This bonus applies only to Story Mode.',items:detail.statChanges.map(change=>`${change.label} +${change.amount}`),onceKey:`stats:${detail.statChanges.map(change=>`${change.label}${change.amount}`).join(',')}:${detail.updatedAt||Date.now()}`});
  }
}

let singleton=null;
export function initializeStoryCharm(){if(!singleton){singleton=new StoryCharmController();singleton.bind()}return singleton}
export function storyCharmArrival(title,detail='',options={}){initializeStoryCharm().enqueue({kind:'arrival',title,detail,...options})}
export function storyCharmBanter(lines,options={}){initializeStoryCharm().enqueue({kind:'banter',lines,...options})}
export function storyCharmCelebration(title,detail='',options={}){initializeStoryCharm().enqueue({kind:'celebration',title,detail,...options})}
export function celebrateCharacterUnlock(name,detail='A new fighter is available.',options={}){storyCharmCelebration(`${cleanLabel(name)} UNLOCKED`,detail,{type:'character',tone:'character',kicker:'NEW FIGHTER',...options})}
