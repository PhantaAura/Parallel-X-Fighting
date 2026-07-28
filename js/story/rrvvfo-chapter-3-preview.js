import {ArenaBattle,resetArenaBattleInstance} from '../arena/arena-mode.js?v=29a2-story-hud-20260728';
import {SonicBattleDialogue} from '../sonic-battle-dialogue.js?v=29a2-story-hud-20260728';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=29a2-story-hud-20260728';
import {StoryMap} from './story-map.js?v=29a2-story-hud-20260728';
import {applyStoryProgressionToFighter} from './story-progression.js?v=29a2-story-hud-20260728';
import {storyConfirm} from './story-ux.js?v=29a2-story-hud-20260728';

const MISSION_ID='rrvvfo-03-preview';
const UI_ID='rrvvfoChapter3PreviewUI';
let activeMission=null;

function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
function lerp(a,b,t){return a+(b-a)*t}
function distance(a,b){return Math.hypot((a.x||0)-(b.x||0),(a.z||0)-(b.z||0))}

function buildUI(){
  document.getElementById(UI_ID)?.remove();
  const root=document.createElement('section');
  root.id=UI_ID;
  root.hidden=true;
  root.innerHTML=`
    <div class="c3Hud">
      <div class="c3Objective">
        <small>RRVVFO ROUTE • CHAPTER 3 DEVELOPMENT PREVIEW</small>
        <strong data-c3-objective>LOOK AROUND THE TRAINING REGION</strong>
        <span data-c3-detail>Inspect the damaged routes and question the people nearby.</span>
      </div>
      <div class="c3HudActions">
        <button type="button" data-c3-status>AREA STATUS</button>
        <button type="button" data-c3-exit>RETURN TO ROUTE</button>
      </div>
    </div>
    <div class="c3AreaTitle" data-c3-area hidden>
      <small>THE LOST YEAR • AFTER THE TOURNAMENT</small>
      <strong data-c3-area-name>EXPANDED TRAINING REGION</strong>
    </div>
    <div class="c3Prompt" data-c3-prompt hidden>
      <strong data-c3-prompt-title>INTERACT</strong>
      <span data-c3-prompt-detail>PRESS LIGHT / ENTER</span>
    </div>
    <aside class="c3Tracker" data-c3-tracker hidden>
      <header><small>CHAPTER 3 • INVESTIGATION</small><h2>CLOSED OFF</h2></header>
      <div class="c3TrackerRows">
        <div><span>BLOCKED ROUTES</span><strong data-c3-route-count>0 / 2</strong></div>
        <div><span>PEOPLE QUESTIONED</span><strong data-c3-npc-count>0 / 3</strong></div>
        <div><span>STRANGE MAN</span><strong data-c3-strange-status>NOT FOUND</strong></div>
        <div><span>UNDERGROUND BASE</span><strong data-c3-base-status>LOCKED</strong></div>
      </div>
      <p>This is the first playable slice of Chapter 3. The full tournament still comes before it in the finished route.</p>
      <button type="button" data-c3-close-status>CLOSE</button>
    </aside>
    <div class="c3Complete" data-c3-complete hidden>
      <article>
        <small>CHAPTER 3 OPENING PREVIEW COMPLETE</small>
        <h2>THE UNDERGROUND LEAD</h2>
        <p>Rrvvfo found several sealed routes, questioned the locals, and met a strange man who claims the culprit can be reached through an underground teleporter base.</p>
        <div class="c3Rewards">
          <span>EXPANDED NON-LINEAR TRAINING REGION ESTABLISHED</span>
          <span>BLOCKED-ROUTE INVESTIGATION ESTABLISHED</span>
          <span>UNDERGROUND BASE IS THE NEXT BUILD</span>
        </div>
        <button type="button" data-c3-continue>RETURN TO RRVVFO ROUTE</button>
      </article>
    </div>`;
  document.body.appendChild(root);
  return root;
}

class RrvvfoChapter3Preview{
  constructor({onComplete=()=>{},onExit=()=>{}}={}){
    this.onComplete=onComplete;
    this.onExit=onExit;
    this.root=buildUI();
    this.objective=this.root.querySelector('[data-c3-objective]');
    this.detail=this.root.querySelector('[data-c3-detail]');
    this.area=this.root.querySelector('[data-c3-area]');
    this.areaName=this.root.querySelector('[data-c3-area-name]');
    this.prompt=this.root.querySelector('[data-c3-prompt]');
    this.promptTitle=this.root.querySelector('[data-c3-prompt-title]');
    this.promptDetail=this.root.querySelector('[data-c3-prompt-detail]');
    this.tracker=this.root.querySelector('[data-c3-tracker]');
    this.completePanel=this.root.querySelector('[data-c3-complete]');
    this.routeCount=this.root.querySelector('[data-c3-route-count]');
    this.npcCount=this.root.querySelector('[data-c3-npc-count]');
    this.strangeStatus=this.root.querySelector('[data-c3-strange-status]');
    this.baseStatus=this.root.querySelector('[data-c3-base-status]');
    this.mode='opening';
    this.step='investigate';
    this.completed=false;
    this.aborted=false;
    this.dialogue=null;
    this.interactHeld=false;
    this.playerFlip=false;
    this.areaTimer=0;
    this.noticeCooldown=0;
    this.inspectedRoutes=new Set();
    this.questionedNpcs=new Set();
    this.strangeManVisible=false;
    this.strangeManMet=false;
    this.baseUnlocked=false;
    this.nearbyInteraction=null;
    this.fighterVisible=true;
    this.barricades=[
      {id:'east-crater',label:'EXPLODED EAST ROAD',x:1460,z:145,kind:'exploded',inspected:false},
      {id:'north-wall',label:'BARRICADED NORTH WOODS',x:360,z:-1040,kind:'barricaded',inspected:false},
      {id:'south-collapse',label:'COLLAPSED SOUTH PASS',x:-540,z:1030,kind:'collapsed',inspected:false}
    ];
    this.npcs=[
      {id:'student',label:'DOJO STUDENT',x:-640,z:-120,baseX:-640,baseZ:-120,color:'#4b8ee8',phase:.2},
      {id:'worker',label:'ROAD WORKER',x:890,z:360,baseX:890,baseZ:360,color:'#d38345',phase:1.4},
      {id:'traveler',label:'TRAVELER',x:420,z:620,baseX:420,baseZ:620,color:'#5eaa68',phase:2.5},
      {id:'vendor',label:'VENDOR',x:-880,z:520,baseX:-880,baseZ:520,color:'#bd5f7d',phase:3.7},
      {id:'guard',label:'REGION GUARD',x:1100,z:-470,baseX:1100,baseZ:-470,color:'#7b68c8',phase:4.6},
      {id:'witness',label:'NERVOUS LOCAL',x:640,z:-660,baseX:640,baseZ:-660,color:'#4da6a9',phase:5.5}
    ];
    this.strangeMan={id:'strange-man',label:'STRANGE MAN',x:-60,z:170,color:'#6e587d'};
    this.baseEntrance={x:-1430,z:790};
    const saved=loadLostYearProgress().chapter3Preview||{};
    this.inspectedRoutes=new Set(Array.isArray(saved.inspectedRoutes)?saved.inspectedRoutes:[]);
    this.questionedNpcs=new Set(Array.isArray(saved.questionedNpcs)?saved.questionedNpcs:[]);
    this.strangeManMet=Boolean(saved.strangeManMet);
    this.strangeManVisible=this.strangeManMet||this.inspectedRoutes.size>=2&&this.questionedNpcs.size>=3;
    this.baseUnlocked=Boolean(saved.baseUnlocked);
    for(const route of this.barricades)route.inspected=this.inspectedRoutes.has(route.id);
    this.root.querySelector('[data-c3-status]').addEventListener('click',()=>this.openTracker());
    this.root.querySelector('[data-c3-close-status]').addEventListener('click',()=>this.closeTracker());
    this.root.querySelector('[data-c3-exit]').addEventListener('click',()=>this.requestExit());
    this.root.querySelector('[data-c3-continue]').addEventListener('click',()=>this.exitToStory());
    this.keyHandler=event=>this.onKey(event);
    document.addEventListener('keydown',this.keyHandler,true);
  }

  start(){
    resetArenaBattleInstance();
    this.battle=new ArenaBattle('expanded-training-region');
    const hidden=this.battle.fighters[1];
    hidden.id='sage';
    hidden.name='The Sage';
    hidden.cpu=true;
    this.patchBattle();
    this.battle.start();
    this.battle.beforeRestart=()=>storyConfirm({title:'RESTART PREVIEW?',message:'Return Rrvvfo to the Chapter 3 starting point? Investigation discoveries remain saved.',confirmLabel:'RESTART'});
    this.battle.root.classList.add('storyChapter3Hub','storyChapter3Preview');
    this.battle.root.querySelector('[data-stage-name]').textContent='EXPANDED TRAINING REGION';
    const badge=this.battle.root.querySelector('.badge');
    if(badge){
      badge.querySelector('strong').textContent='PROTOTYPE 2.9A.2 • CHAPTER 3 PREVIEW';
      if(badge.lastChild)badge.lastChild.textContent=' NON-LINEAR INVESTIGATION PREVIEW';
    }
    this.battle.phase='story';
    this.battle.time=9999;
    this.battle.hideBanner();
    applyStoryProgressionToFighter(this.battle.fighters[0]);
    this.root.hidden=false;
    this.map=new StoryMap({
      title:'EXPANDED TRAINING REGION MAP',
      bounds:{minX:-1750,maxX:1750,minZ:-1300,maxZ:1300},
      getPlayer:()=>this.battle?.fighters?.[0]||null,
      getObjective:()=>{const point=this.objectivePoint();return point?{...point,label:this.objective?.textContent||'CURRENT OBJECTIVE'}:null},
      getPoints:()=>[
        ...this.barricades.map(route=>({x:route.x,z:route.z,label:route.label,color:route.inspected?'#6ca56f':'#c65b4f'})),
        {x:this.baseEntrance.x,z:this.baseEntrance.z,label:'UNDERGROUND BASE',color:this.baseUnlocked?'#4e9d7c':'#55515c'},
        {x:-40,z:80,label:'CENTRAL PLAZA',color:'#d9a629'}
      ]
    });
    this.showAreaTitle('EXPANDED TRAINING REGION');
    this.openingTimer=window.setTimeout(()=>{if(!this.aborted)this.showOpeningDialogue()},2200);
    return this;
  }

  patchBattle(){
    const battle=this.battle;
    const baseInput=battle.input.bind(battle);
    const baseCpu=battle.cpu.bind(battle);
    const baseUpdate=battle.update.bind(battle);
    const baseDraw=battle.draw.bind(battle);
    const baseDrawFighterLayer=battle.drawFighterLayer.bind(battle);
    const baseFlipFor=battle.flipFor.bind(battle);
    const defaultExit=battle.exit.bind(battle);

    battle.input=()=>{
      const command=baseInput();
      const interact=Boolean(command.light);
      if(this.mode==='hub'){
        if(interact&&!this.interactHeld)this.tryInteract();
        this.interactHeld=interact;
        return{...command,light:false,heavy:false,launcher:false,block:false,special:false};
      }
      this.interactHeld=interact;
      return{x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:false,special:false};
    };

    battle.cpu=()=>({x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:false,special:false});
    battle.castAbility=()=>false;
    battle.updateCamera=()=>this.updateCamera();
    battle.flipFor=fighter=>{
      if(fighter===battle.fighters[0]){
        const speed=Math.hypot(fighter.moveX||0,fighter.moveZ||0);
        if(speed>.05){
          const self=battle.renderer.project(fighter.x,80+fighter.y,fighter.z);
          const ahead=battle.renderer.project(
            fighter.x+(fighter.moveX||fighter.aimX||1)*120,
            80+fighter.y,
            fighter.z+(fighter.moveZ||fighter.aimZ||0)*120
          );
          this.playerFlip=ahead.x<self.x;
        }
        return this.playerFlip;
      }
      return baseFlipFor(fighter);
    };
    battle.drawFighterLayer=fighters=>{
      const visible=fighters.filter(fighter=>fighter===battle.fighters[0]||this.fighterVisible);
      baseDrawFighterLayer(visible);
    };
    battle.draw=()=>{
      baseDraw();
      this.drawHubExtras();
    };
    battle.update=dt=>{
      const player=battle.fighters[0];
      const previous={x:player.x,z:player.z};
      baseUpdate(dt);
      if(!battle.active||this.aborted)return;
      this.areaTimer=Math.max(0,this.areaTimer-dt);
      this.noticeCooldown=Math.max(0,this.noticeCooldown-dt);
      if(!this.areaTimer)this.area.hidden=true;
      if(this.mode==='hub'){
        player.hp=100;
        player.en=100;
        battle.time=9999;
        this.updateHub(previous);
      }
      this.updateNpcMotion();
      this.map?.draw();
    };
    battle.exit=async()=>{
      const leave=await storyConfirm({title:'RETURN TO ROUTE?',message:'Leave the Chapter 3 preview? Investigation progress has been saved.',confirmLabel:'RETURN TO ROUTE'});
      if(!leave)return;
      this.persistPreview();
      defaultExit();
      this.cleanup();
      this.onExit();
    };
  }

  showOpeningDialogue(){
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'I leave for one tournament and the Training Grounds somehow become an entire region.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'That would almost be impressive if the east road were not currently on fire.',tail:'down'},
      {speaker:'REGION ANNOUNCEMENT',speakerClass:'neutral',text:'Several routes are closed until further notice. Residents are asked to remain inside the central district.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Yeah, no. Somebody is going to explain what happened.',tail:'down'}
    ],()=>{
      this.fighterVisible=false;
      this.hideSecondFighter();
      this.mode='hub';
      this.battle.phase='play';
      if(this.baseUnlocked){
        this.step='reach-base';
        this.setObjective('FIND THE UNDERGROUND BASE','Your restored investigation points to the underground entrance in the southwest.');
      }else if(this.strangeManMet||this.strangeManVisible){
        this.strangeManVisible=true;
        this.step=this.strangeManMet?'reach-base':'meet-strange-man';
        this.setObjective(this.strangeManMet?'FIND THE UNDERGROUND BASE':'MEET THE STRANGE MAN',this.strangeManMet?'Follow the new lead to the underground entrance.':'Return to the central plaza. Someone is waiting there.');
      }else{
        this.step='investigate';
        this.setObjective('INVESTIGATE THE CLOSED ROUTES',`Restored progress: ${Math.min(this.inspectedRoutes.size,2)} / 2 routes and ${Math.min(this.questionedNpcs.size,3)} / 3 people. Explore in any order.`);
      }
      this.battle.notice(this.inspectedRoutes.size||this.questionedNpcs.size?'INVESTIGATION PROGRESS RESTORED':'NON-LINEAR CHAPTER HUB • CHOOSE YOUR OWN ORDER',2);
      this.refreshTracker();
    });
  }

  showDialogue(lines,onComplete){
    this.mode='dialogue';
    this.battle.phase='story';
    if(this.dialogue?._onKey)document.removeEventListener('keydown',this.dialogue._onKey);
    this.dialogue?.overlay?.remove();
    const dialogue=new SonicBattleDialogue({typeSpeed:18,onComplete:()=>{
      document.removeEventListener('keydown',dialogue._onKey);
      dialogue.overlay?.remove();
      this.dialogue=null;
      onComplete?.();
    }});
    this.dialogue=dialogue;
    dialogue.show(lines);
    if(dialogue.overlay)dialogue.overlay.style.zIndex='2300';
  }

  updateCamera(){
    const player=this.battle.fighters[0];
    const c=this.battle.stage.camera;
    this.battle.camera.x=lerp(this.battle.camera.x,player.x,.085);
    this.battle.camera.z=lerp(this.battle.camera.z,player.z,.085);
    this.battle.camera.distance=lerp(this.battle.camera.distance,1120,.06);
    const yaw=c.yawDeg*Math.PI/180;
    const horizontal=this.battle.camera.distance*c.horizontalDistanceScale;
    this.battle.camera.eye=[
      this.battle.camera.x+Math.sin(yaw)*horizontal,
      c.heightBase+this.battle.camera.distance*c.heightDistanceScale,
      this.battle.camera.z+Math.cos(yaw)*horizontal
    ];
    this.battle.camera.target=[this.battle.camera.x,c.targetHeight+player.y*c.jumpTargetScale,this.battle.camera.z];
    this.battle.cameraShake*=.86;
    if(this.battle.cameraShake<.15)this.battle.cameraShake=0;
  }

  updateHub(previous){
    const player=this.battle.fighters[0];
    const blockers=[
      {id:'dojo',minX:-520,maxX:120,minZ:-500,maxZ:-170},
      {id:'north-hall',minX:700,maxX:1180,minZ:-940,maxZ:-620},
      {id:'south-market',minX:-1080,maxX:-620,minZ:520,maxZ:860},
      {id:'east-crater',minX:1340,maxX:1710,minZ:-120,maxZ:390},
      {id:'north-wall',minX:160,maxX:600,minZ:-1200,maxZ:-900},
      {id:'south-collapse',minX:-820,maxX:-280,minZ:900,maxZ:1240}
    ];
    if(!this.baseUnlocked)blockers.push({id:'base-gate',minX:-1580,maxX:-1280,minZ:650,maxZ:930});
    for(const rect of blockers){
      if(player.x>rect.minX&&player.x<rect.maxX&&player.z>rect.minZ&&player.z<rect.maxZ){
        player.x=previous.x;
        player.z=previous.z;
        player.moveVX=0;
        player.moveVZ=0;
        if(!this.noticeCooldown&&['east-crater','north-wall','south-collapse'].includes(rect.id)){
          this.noticeCooldown=1.4;
          this.battle.notice('THE ROUTE IS COMPLETELY SEALED',1.1);
        }
      }
    }
    this.checkInvestigationReady();
    this.updatePrompt(player);
  }

  updatePrompt(player){
    const options=[];
    for(const route of this.barricades){
      const d=distance(player,route);
      if(d<145)options.push({type:'route',target:route,distance:d,title:route.inspected?'RECHECK DAMAGE':'INSPECT DAMAGE'});
    }
    for(const npc of this.npcs){
      const d=distance(player,npc);
      if(d<115)options.push({type:'npc',target:npc,distance:d,title:this.questionedNpcs.has(npc.id)?'TALK AGAIN':'ASK WHAT HAPPENED'});
    }
    if(this.strangeManVisible){
      const d=distance(player,this.strangeMan);
      if(d<125)options.push({type:'strange',target:this.strangeMan,distance:d,title:this.strangeManMet?'TALK TO STRANGE MAN':'QUESTION STRANGE MAN'});
    }
    if(this.baseUnlocked){
      const d=distance(player,this.baseEntrance);
      if(d<150)options.push({type:'base',target:this.baseEntrance,distance:d,title:'ENTER UNDERGROUND BASE'});
    }
    options.sort((a,b)=>a.distance-b.distance);
    this.nearbyInteraction=options[0]||null;
    if(!this.nearbyInteraction){
      this.prompt.hidden=true;
      return;
    }
    this.promptTitle.textContent=this.nearbyInteraction.title;
    this.promptDetail.textContent='PRESS LIGHT / ENTER';
    this.prompt.hidden=false;
  }

  tryInteract(){
    if(this.mode!=='hub'||!this.nearbyInteraction)return;
    const item=this.nearbyInteraction;
    if(item.type==='route')this.inspectRoute(item.target);
    else if(item.type==='npc')this.questionNpc(item.target);
    else if(item.type==='strange')this.meetStrangeMan();
    else if(item.type==='base')this.reachBaseEntrance();
  }

  inspectRoute(route){
    const first=!this.inspectedRoutes.has(route.id);
    this.inspectedRoutes.add(route.id);
    route.inspected=true;
    const scenes={
      'east-crater':[
        {speaker:'RRVVFO',speakerClass:'p1',text:'This was not an accident. The blast is centered directly on the road.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Whoever did this wanted the entire east district cut off.',tail:'down'}
      ],
      'north-wall':[
        {speaker:'RRVVFO',speakerClass:'p1',text:'Metal plates, energy locks, and enough rubble to stop a small army.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Somebody had way too much free time.',tail:'down'}
      ],
      'south-collapse':[
        {speaker:'RRVVFO',speakerClass:'p1',text:'The supports were destroyed from underneath.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Three different routes, three different methods. Same goal.',tail:'down'}
      ]
    };
    this.showDialogue(scenes[route.id],()=>{
      this.mode='hub';
      this.battle.phase='play';
      if(first)this.battle.notice(`BLOCKED ROUTE INSPECTED • ${this.inspectedRoutes.size}/2 REQUIRED`,1.4);
      this.persistPreview();
      this.refreshTracker();
      this.checkInvestigationReady();
    });
  }

  questionNpc(npc){
    const first=!this.questionedNpcs.has(npc.id);
    this.questionedNpcs.add(npc.id);
    const dialogue={
      student:[
        {speaker:'DOJO STUDENT',speakerClass:'neutral',text:'The explosion happened before sunrise. By the time we got outside, every road alarm was already active.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'So whoever did it knew the region systems.',tail:'down'}
      ],
      worker:[
        {speaker:'ROAD WORKER',speakerClass:'neutral',text:'That crater was cut too clean. Somebody aimed for the underground utility line.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Meaning they wanted the road and the power network.',tail:'down'}
      ],
      traveler:[
        {speaker:'TRAVELER',speakerClass:'neutral',text:'I tried the north woods, the south pass, and the east road. All closed. It feels like the whole region is being boxed in.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'That is probably because it is.',tail:'down'}
      ],
      vendor:[
        {speaker:'VENDOR',speakerClass:'neutral',text:'My deliveries cannot leave the plaza. Whoever caused this is going to hear from my refund department.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Somehow that sounds more dangerous than me.',tail:'down'}
      ],
      guard:[
        {speaker:'REGION GUARD',speakerClass:'neutral',text:'No group has claimed responsibility. The seals appeared almost simultaneously.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Then the explosions were only the distraction.',tail:'down'}
      ],
      witness:[
        {speaker:'NERVOUS LOCAL',speakerClass:'neutral',text:'I do not know who did it. I only saw someone carrying a strange metal case toward the old plaza tunnels.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Finally. A clue that is not “the road exploded.”',tail:'down'}
      ]
    };
    this.showDialogue(dialogue[npc.id],()=>{
      this.mode='hub';
      this.battle.phase='play';
      if(first)this.battle.notice(`PERSON QUESTIONED • ${this.questionedNpcs.size}/3 REQUIRED`,1.4);
      this.persistPreview();
      this.refreshTracker();
      this.checkInvestigationReady();
    });
  }

  checkInvestigationReady(){
    if(this.strangeManVisible||this.strangeManMet)return;
    if(this.inspectedRoutes.size<2||this.questionedNpcs.size<3)return;
    this.strangeManVisible=true;
    this.step='meet-strange-man';
    this.setObjective('RETURN TO THE CENTRAL PLAZA','A strange man has appeared near the old monument.');
    this.refreshTracker();
    this.battle.notice('NEW LEAD • STRANGE MAN IN THE CENTRAL PLAZA',2);
  }

  meetStrangeMan(){
    if(this.strangeManMet){
      this.showDialogue([
        {speaker:'STRANGE MAN',speakerClass:'rival',text:'The underground entrance is southwest. The teleporter controls are below it.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'You being vague is not making you less suspicious.',tail:'down'}
      ],()=>{this.mode='hub';this.battle.phase='play'});
      return;
    }
    this.strangeManMet=true;
    this.showDialogue([
      {speaker:'STRANGE MAN',speakerClass:'rival',text:'You want to know who sealed the routes.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'And you are dressed like somebody who waits around to say exactly that.',tail:'down'},
      {speaker:'STRANGE MAN',speakerClass:'rival',text:'I know where the one responsible is hiding. The area cannot be reached by road anymore.',tail:'down'},
      {speaker:'STRANGE MAN',speakerClass:'rival',text:'There is an underground base beneath this region. Solve its power-routing puzzle and you can reactivate the teleporter.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Why do you know about a secret underground teleporter base?',tail:'down'},
      {speaker:'STRANGE MAN',speakerClass:'rival',text:'You can ask me after the planet is no longer in danger.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'That answer somehow made you more suspicious.',tail:'down'}
    ],()=>{
      this.mode='hub';
      this.battle.phase='play';
      this.baseUnlocked=true;
      this.step='reach-base';
      this.setObjective('FIND THE UNDERGROUND BASE','Follow the southwest service road to the newly unlocked entrance.');
      this.battle.notice('UNDERGROUND BASE ENTRANCE UNLOCKED',1.8);
      this.persistPreview();
      this.refreshTracker();
    });
  }

  reachBaseEntrance(){
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'A hidden base under the Training Region. Sure. Why would anything be normal?',tail:'down'},
      {speaker:'STRANGE MAN',speakerClass:'rival',text:'The teleporter is deeper inside. Restore three power routes and the sealed area will become reachable.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Three power routes. You could have mentioned that before I came all the way down here.',tail:'down'},
      {speaker:'STRANGE MAN',speakerClass:'rival',text:'You did not ask.',tail:'down'}
    ],()=>this.commitCompletion());
  }

  openTracker(){
    if(this.mode!=='hub')return;
    this.mode='tracker';
    this.battle.phase='story';
    this.refreshTracker();
    this.tracker.hidden=false;
    this.root.querySelector('[data-c3-close-status]').focus();
  }

  closeTracker(){
    if(this.mode!=='tracker')return;
    this.tracker.hidden=true;
    this.mode='hub';
    this.battle.phase='play';
  }

  refreshTracker(){
    this.routeCount.textContent=`${Math.min(this.inspectedRoutes.size,2)} / 2`;
    this.npcCount.textContent=`${Math.min(this.questionedNpcs.size,3)} / 3`;
    this.strangeStatus.textContent=this.strangeManMet?'MET':this.strangeManVisible?'IN PLAZA':'NOT FOUND';
    this.baseStatus.textContent=this.baseUnlocked?'ENTRANCE OPEN':'LOCKED';
  }

  persistPreview(){
    const progress=loadLostYearProgress();
    saveLostYearProgress({
      ...progress,
      lastCheckpoint:MISSION_ID,
      chapter3Preview:{
        inspectedRoutes:[...this.inspectedRoutes],
        questionedNpcs:[...this.questionedNpcs],
        strangeManMet:this.strangeManMet,
        baseUnlocked:this.baseUnlocked
      }
    });
  }

  updateNpcMotion(){
    const time=performance.now()/1000;
    for(const npc of this.npcs){
      npc.x=npc.baseX+Math.sin(time*.45+npc.phase)*35;
      npc.z=npc.baseZ+Math.cos(time*.4+npc.phase)*22;
    }
  }

  hideSecondFighter(){
    const foe=this.battle.fighters[1];
    foe.y=-1200;
    foe.x=this.battle.fighters[0].x-120;
    foe.z=this.battle.fighters[0].z-120;
    foe.hp=100;
    foe.attackState=null;
  }

  drawHubExtras(){
    if(!this.battle?.renderer||this.aborted)return;
    const r=this.battle.renderer;
    const time=performance.now()/1000;
    const drawPerson=(npc,index)=>{
      const bob=Math.sin(time*2+npc.phase)*2;
      r.disc({x:npc.x,y:5,z:npc.z,rx:25,rz:16,color:'#000000',alpha:.24});
      r.box({x:npc.x,y:48+bob,z:npc.z,sx:30,sy:62,sz:24,color:npc.color});
      r.box({x:npc.x,y:92+bob,z:npc.z,sx:28,sy:28,sz:26,color:'#9b6848'});
      r.box({x:npc.x,y:111+bob,z:npc.z,sx:33,sy:15,sz:30,color:index%2?'#34211d':'#d5b04d'});
    };
    this.npcs.forEach(drawPerson);

    if(this.strangeManVisible){
      const npc=this.strangeMan;
      const bob=Math.sin(time*1.7)*2;
      r.disc({x:npc.x,y:5,z:npc.z,rx:28,rz:18,color:'#000000',alpha:.3});
      r.box({x:npc.x,y:52+bob,z:npc.z,sx:34,sy:72,sz:28,color:npc.color});
      r.box({x:npc.x,y:101+bob,z:npc.z,sx:30,sy:30,sz:28,color:'#8a6048'});
      r.box({x:npc.x,y:122+bob,z:npc.z,sx:46,sy:20,sz:38,color:'#261f2a'});
      const pulse=1+Math.sin(time*4)*.08;
      r.disc({x:npc.x,y:6,z:npc.z,rx:42*pulse,rz:28*pulse,color:'#cf9dff',alpha:.24});
    }

    for(const route of this.barricades){
      const pulse=1+Math.sin(time*3.6+route.x*.01)*.07;
      if(route.kind==='exploded'){
        r.disc({x:route.x,y:4,z:route.z,rx:190,rz:150,color:'#2a201d',alpha:.95});
        for(let i=0;i<8;i++){
          const angle=i/8*Math.PI*2;
          r.box({x:route.x+Math.cos(angle)*135,y:28,z:route.z+Math.sin(angle)*105,sx:62,sy:40,sz:48,color:'#5d5148',rotationY:angle});
        }
        for(let i=0;i<5;i++){
          r.billboard({x:route.x-70+i*35,y:95+Math.sin(time+i)*18,z:route.z-25+i*14,size:48,color:'#6d625f',alpha:.22});
        }
      }else if(route.kind==='barricaded'){
        for(let x=route.x-180;x<=route.x+180;x+=90){
          r.box({x,y:54,z:route.z,sx:70,sy:105,sz:40,color:'#696f7b'});
          r.box({x,y:112,z:route.z,sx:82,sy:18,sz:54,color:'#d04a48'});
        }
      }else{
        r.segment({x:route.x-220,y:18,z:route.z},{x:route.x+220,y:18,z:route.z},{width:55,height:35,color:'#554b43',alpha:1});
        for(let i=-3;i<=3;i++)r.box({x:route.x+i*58,y:46+Math.abs(i)*4,z:route.z+Math.sin(i)*30,sx:70,sy:55,sz:62,color:'#74685c',rotationY:i*.15});
      }
      if(!route.inspected){
        r.disc({x:route.x,y:7,z:route.z,rx:54*pulse,rz:36*pulse,color:'#ffd557',alpha:.28});
        r.billboard({x:route.x,y:170,z:route.z,size:36*pulse,color:'#fff1a3',alpha:.9});
      }
    }

    // Central monument keeps the large hub readable from several directions.
    r.box({x:-40,y:52,z:80,sx:95,sy:105,sz:95,color:'#5a4d48'});
    r.box({x:-40,y:130,z:80,sx:45,sy:55,sz:45,color:'#c4514e'});
    r.billboard({x:-40,y:192,z:80,size:35,color:'#ffd66b',alpha:.8});

    // Underground entrance. It is visually sealed until the strange man provides the route.
    r.box({x:this.baseEntrance.x,y:38,z:this.baseEntrance.z,sx:220,sy:76,sz:170,color:'#39353e'});
    r.box({x:this.baseEntrance.x,y:96,z:this.baseEntrance.z,sx:255,sy:42,sz:205,color:'#25232a'});
    r.box({x:this.baseEntrance.x,y:45,z:this.baseEntrance.z-88,sx:90,sy:88,sz:24,color:this.baseUnlocked?'#4e9d7c':'#a13d43'});
    if(this.baseUnlocked){
      const pulse=1+Math.sin(time*4.2)*.08;
      r.disc({x:this.baseEntrance.x,y:7,z:this.baseEntrance.z-130,rx:55*pulse,rz:38*pulse,color:'#79f1c3',alpha:.26});
      r.billboard({x:this.baseEntrance.x,y:160,z:this.baseEntrance.z-120,size:38*pulse,color:'#b9ffe5',alpha:.9});
    }

    const objective=this.objectivePoint();
    if(objective){
      const pulse=1+Math.sin(time*4)*.09;
      r.disc({x:objective.x,y:7,z:objective.z,rx:42*pulse,rz:29*pulse,color:'#ffd557',alpha:.25});
      r.billboard({x:objective.x,y:150,z:objective.z,size:34*pulse,color:'#fff1a3',alpha:.85});
    }
  }

  objectivePoint(){
    if(this.step==='meet-strange-man')return this.strangeMan;
    if(this.step==='reach-base')return this.baseEntrance;
    const uninspected=this.barricades.find(route=>!route.inspected);
    return uninspected||null;
  }

  setObjective(title,detail){
    this.objective.textContent=title;
    this.detail.textContent=detail;
  }

  showAreaTitle(name){
    this.areaName.textContent=name;
    this.area.hidden=false;
    this.areaTimer=2.6;
  }

  onKey(event){
    if(this.root.hidden)return;
    if(this.mode==='hub'&&(event.key==='Enter'||event.key.toLowerCase()==='e')){
      event.preventDefault();
      event.stopImmediatePropagation();
      this.tryInteract();
    }else if(this.mode==='hub'&&event.key.toLowerCase()==='m'){
      event.preventDefault();
      this.openTracker();
    }else if(this.mode==='tracker'&&(event.key==='Escape'||event.key.toLowerCase()==='m')){
      event.preventDefault();
      this.closeTracker();
    }
  }

  commitCompletion(){
    if(this.completed||this.aborted)return;
    this.completed=true;
    this.mode='complete';
    this.battle.phase='story';
    const progress=loadLostYearProgress();
    const completedMissions=progress.completedMissions.includes(MISSION_ID)?progress.completedMissions:[...progress.completedMissions,MISSION_ID];
    const unlocks=[...new Set([...(progress.unlocks||[]),'expandedTrainingRegion','chapter3Investigation','undergroundBaseLead'])];
    saveLostYearProgress({...progress,completedMissions,unlocks,lastCheckpoint:MISSION_ID,chapter3PreviewComplete:true});
    this.onComplete();
    this.completePanel.hidden=false;
    this.completePanel.querySelector('[data-c3-continue]').focus();
  }

  async requestExit(){
    this.persistPreview();
    const leave=await storyConfirm({title:'RETURN TO ROUTE?',message:'Leave the Chapter 3 preview? Your investigation progress is saved and will restore next time.',confirmLabel:'RETURN TO ROUTE'});
    if(leave)this.exitToStory();
  }

  exitToStory(){
    if(!this.completed)this.persistPreview();
    this.battle?.stopMatch();
    this.battle?.root.classList.add('hidden');
    this.cleanup();
    this.onExit();
  }

  cleanup(){
    if(this.aborted)return;
    this.aborted=true;clearTimeout(this.openingTimer);this.map?.destroy();this.map=null;
    document.removeEventListener('keydown',this.keyHandler,true);
    if(this.dialogue?._onKey)document.removeEventListener('keydown',this.dialogue._onKey);
    this.dialogue?.overlay?.remove();
    resetArenaBattleInstance();
    this.root.remove();
    this.battle?.root.classList.remove('storyChapter3Hub','storyChapter3Preview');
    activeMission=null;
  }
}

export function startRrvvfoChapter3Preview(options={}){
  if(activeMission)activeMission.exitToStory();
  activeMission=new RrvvfoChapter3Preview(options);
  return activeMission.start();
}

export {RrvvfoChapter3Preview};
