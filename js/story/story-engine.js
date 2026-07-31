import {ArenaBattle,resetArenaBattleInstance} from '../arena/arena-mode.js?v=29a29-pursuit-combat-20260731';
import {sharedInput} from '../input-runtime.js?v=29a29-pursuit-combat-20260731';
import {SonicBattleDialogue} from '../sonic-battle-dialogue.js?v=29a29-pursuit-combat-20260731';
import {applyStoryProgressionToFighter} from './story-progression.js?v=29a29-pursuit-combat-20260731';

export const STORY_ENGINE_VERSION='2.9A.24';
export const STORY_ENGINE_CACHE='29a29-pursuit-combat-20260731';

const EMPTY_COMMAND=Object.freeze({x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:false,charge:false,grab:false,breaker:false,counter:false,interact:false,special:false});
const STORY_MODES=Object.freeze(['dialogue','exploration','tutorial','combat','cinematic','complete','story']);
const RUNTIME_METHODS=Object.freeze(['input','cpu','update','hud','draw','drawFighterLayer','drawFallback2D','flipFor','updateCamera','castAbility','applyDamage','updateSpecials','exit']);
const TOUCH_PROMPTS=Object.freeze({
  move:'MOVE STICK / D-PAD',jump:'JUMP',dash:'DASH',light:'LIGHT',heavy:'HEAVY',launcher:'LAUNCH',
  block:'BLOCK',charge:'CHARGE',grab:'GRAB',interact:'INTERACT',breaker:'BREAKER',counter:'COUNTER',
  ability1:'TAP SLOT 1',ability2:'TAP SLOT 2',ability3:'TAP SLOT 3',ability4:'TAP SLOT 4',ability5:'TAP SLOT 5'
});

function normalizeMode(mode){
  const value=String(mode||'story').toLowerCase();
  if(value==='hub'||value==='freeexplore')return'exploration';
  if(value==='fight'||value==='fight-ko'||value==='spectator')return'combat';
  if(value==='opening'||value==='transition'||value==='choice'||value==='storycomplete'||value==='card'||value==='level'||value==='qte'||value==='clash')return'cinematic';
  return STORY_MODES.includes(value)?value:'story';
}

function setArenaNames(battle,left='RRVVFO',right='OPPONENT'){
  const names=battle?.root?.querySelectorAll('.top .side .name span:first-child');
  if(names?.[0])names[0].textContent=left;
  if(names?.[1])names[1].textContent=right;
}

function configureOpponent(fighter,opponent={}){
  if(!fighter)return;
  if(opponent.id)fighter.id=opponent.id;
  if(opponent.name)fighter.name=opponent.name;
  if(opponent.accent)fighter.accent=opponent.accent;
  if(typeof opponent.cpu==='boolean')fighter.cpu=opponent.cpu;
  if(opponent.appearance)fighter.appearance=opponent.appearance;
}

function snapshotRuntime(battle){
  if(battle.__storyEngineBaseRuntime)return battle.__storyEngineBaseRuntime;
  const runtime={};
  for(const name of RUNTIME_METHODS){
    if(typeof battle[name]==='function')runtime[name]=battle[name];
  }
  Object.defineProperty(battle,'__storyEngineBaseRuntime',{value:runtime,writable:false,enumerable:false,configurable:true});
  return runtime;
}

export function createStoryBattle({stageId='dojo',opponent=null}={}){
  resetArenaBattleInstance();
  const battle=new ArenaBattle(stageId);
  snapshotRuntime(battle);
  if(opponent)configureOpponent(battle.fighters[1],opponent);
  return battle;
}

export function storyCommandForMode(command={},mode,{allowJump=true,allowDash=true,allowInteract=false}={}){
  const normalized=normalizeMode(mode);
  const safe={...EMPTY_COMMAND,...(command||{})};
  if(normalized==='combat'||normalized==='tutorial')return safe;
  if(normalized==='exploration'){
    return{
      ...safe,
      jump:allowJump?Boolean(safe.jump):false,
      dash:allowDash?Boolean(safe.dash):false,
      light:false,interact:allowInteract?Boolean(safe.interact):false,
      heavy:false,launcher:false,block:false,charge:false,grab:false,special:false
    };
  }
  return{...EMPTY_COMMAND};
}

function controllerPrompt(action){
  const mapping=sharedInput.controllerMapping(1);
  const label=key=>mapping.labels[key]||String(key).toUpperCase();
  const ability=/^ability([1-5])$/.exec(action);
  if(ability)return`D-PAD L/R • ${label('u')} ACTIVATE • SLOT ${ability[1]}`;
  const prompts={
    move:'LEFT STICK',
    jump:label('j'),
    dash:label('d'),
    light:label('a'),
    heavy:label('h'),
    launcher:`UP + ${label('h')}`,
    block:label('b'),
    charge:label('k'),
    grab:label('s'),
    interact:label('i'),breaker:label('q'),counter:label('c')
  };
  return prompts[action]||String(action).toUpperCase();
}

function keyboardPrompt(action,fallback=''){
  const ability=/^ability([1-5])$/.exec(action);
  if(ability)return`PRESS ${ability[1]}`;
  const actions={jump:'j',dash:'d',light:'a',heavy:'h',launcher:'x',block:'b',charge:'k',grab:'s',interact:'i',breaker:'q',counter:'c'};
  if(action==='move')return'WASD';
  const semantic=actions[action];
  if(semantic)return sharedInput.actionLabel(1,semantic,{device:'keyboard'}).toUpperCase();
  return fallback||String(action).toUpperCase();
}

function mousePrompt(action,fallback=''){
  const ability=/^ability([1-5])$/.exec(action);
  if(ability)return`PRESS ${ability[1]}`;
  if(action==='move')return'WASD';
  const actions={jump:'j',dash:'d',light:'a',heavy:'h',launcher:'x',block:'b',charge:'k',grab:'s',interact:'i',breaker:'q',counter:'c'};
  const semantic=actions[action];
  if(semantic)return sharedInput.actionLabel(1,semantic,{device:'mouse'}).toUpperCase();
  return fallback||String(action).toUpperCase();
}

export class StoryEngineSession{
  constructor(battle,options={}){
    this.battle=battle;
    this.options=options;
    this.chapterLabel=options.chapterLabel||'STORY MODE';
    this.stageName=options.stageName||battle.stage?.name||'STORY ARENA';
    this.rootClasses=Array.isArray(options.rootClasses)?options.rootClasses.filter(Boolean):[];
    this.getMode=typeof options.getMode==='function'?options.getMode:()=>options.mode||'story';
    this.dialogue=null;
    this.lastMode='';
    this.lastInput='';
    this.attached=false;
    this.baseRuntime=snapshotRuntime(battle);
    this.profile=Object.create(null);
    this.runtimeOptions={
      exploration:{allowJump:true,allowDash:true,allowInteract:false},
      keepStoryTimer:true,
      hideInactiveOpponentHud:false,
      ...options.runtime
    };
  }

  /**
   * Registers chapter content hooks without letting chapter files replace
   * ArenaBattle methods. Every chapter now passes through this one dispatcher.
   * A hook receives `next` followed by the original method arguments.
   */
  useChapterProfile(profile={}){
    for(const [name,handler] of Object.entries(profile)){
      if(RUNTIME_METHODS.includes(name)&&typeof handler==='function')this.profile[name]=handler;
    }
    this.battle.root.dataset.storyProfile=Object.keys(this.profile).sort().join(',');
    return this;
  }

  clearChapterProfile(){
    this.profile=Object.create(null);
    delete this.battle.root.dataset.storyProfile;
  }

  invokeRuntime(name,args=[]){
    const base=this.baseRuntime[name];
    const next=(...overrideArgs)=>{
      if(typeof base!=='function')return undefined;
      return base.apply(this.battle,overrideArgs.length?overrideArgs:args);
    };
    const hook=this.profile[name];
    return typeof hook==='function'?hook(next,...args):next(...args);
  }

  installUnifiedRuntime(){
    const battle=this.battle;

    battle.input=()=>{
      const raw=this.invokeRuntime('input')||EMPTY_COMMAND;
      return storyCommandForMode(raw,this.getMode(),this.runtimeOptions.exploration);
    };

    battle.cpu=(...args)=>{
      const mode=normalizeMode(this.getMode());
      if(!['combat','tutorial'].includes(mode))return{...EMPTY_COMMAND};
      return this.invokeRuntime('cpu',args)||{...EMPTY_COMMAND};
    };

    battle.update=dt=>{
      this.sync();
      this.invokeRuntime('update',[dt]);
      const mode=normalizeMode(this.getMode());
      if(this.runtimeOptions.keepStoryTimer&&['exploration','tutorial','story','cinematic'].includes(mode)&&Number.isFinite(battle.time))battle.time=Math.max(battle.time,9999);
      this.sync();
    };

    battle.hud=(...args)=>{
      const value=this.invokeRuntime('hud',args);
      this.applyUnifiedHud();
      return value;
    };

    for(const name of ['draw','drawFighterLayer','drawFallback2D','flipFor','updateCamera','applyDamage','updateSpecials','exit']){
      if(typeof this.baseRuntime[name]!=='function')continue;
      battle[name]=(...args)=>this.invokeRuntime(name,args);
    }

    battle.castAbility=(...args)=>{
      const mode=normalizeMode(this.getMode());
      if(['dialogue','cinematic','complete','story'].includes(mode))return false;
      return Boolean(this.invokeRuntime('castAbility',args));
    };

    battle.root.dataset.storyRuntime='single-engine';
  }

  setRuntimeOptions(next={}){
    this.runtimeOptions={...this.runtimeOptions,...next,exploration:{...this.runtimeOptions.exploration,...(next.exploration||{})}};
    this.sync(true);
    return this.runtimeOptions;
  }

  attach(){
    if(this.attached)return this;
    this.attached=true;
    const {battle}=this;
    this.installUnifiedRuntime();
    battle.root.classList.add('storyEngineActive','storyUnifiedRuntime',...this.rootClasses);
    battle.root.dataset.storyEngineVersion=STORY_ENGINE_VERSION;
    battle.root.dataset.storyChapter=this.chapterLabel;
    this.sync(true);
    return this;
  }

  start({phase='story',time=9999,hideBanner=true,applyProgression=true,names=null}={}){
    const {battle}=this;
    if(!battle.active)battle.start();
    if(phase)battle.phase=phase;
    if(Number.isFinite(time))battle.time=time;
    if(hideBanner)battle.hideBanner();
    if(applyProgression)applyStoryProgressionToFighter(battle.fighters[0]);
    this.setLabels({stageName:this.stageName,chapterLabel:this.chapterLabel,names});
    this.applyUnifiedHud();
    this.sync(true);
    return battle;
  }

  setLabels({stageName=this.stageName,chapterLabel=this.chapterLabel,names=null}={}){
    this.stageName=stageName||this.stageName;
    this.chapterLabel=chapterLabel||this.chapterLabel;
    const {root}=this.battle;
    const stageLabel=root.querySelector('[data-stage-name]');
    if(stageLabel)stageLabel.textContent=String(this.stageName).toUpperCase();
    const badge=root.querySelector('.badge strong');
    if(badge)badge.textContent=`PROTOTYPE ${STORY_ENGINE_VERSION} • ${String(this.chapterLabel).toUpperCase()}`;
    root.dataset.storyChapter=this.chapterLabel;
    if(Array.isArray(names))setArenaNames(this.battle,names[0],names[1]);
  }

  setMode(mode){
    const normalized=normalizeMode(mode);
    const root=this.battle.root;
    const previous=this.lastMode;
    const fightContext=normalized==='combat'||root.classList.contains('chapter2FightMode')||root.classList.contains('storyChapter3Combat')||root.classList.contains('storyChapter4Combat');
    document.body.classList.toggle('storyFightUiSafe',fightContext);
    if(fightContext){
      document.querySelectorAll('.storyMapOverlay').forEach(overlay=>{overlay.hidden=true});
      document.querySelectorAll('[data-c2-tracker],[data-c2-menu-panel],[data-c3-tracker],[data-c3-menu],[data-c4-tracker],[data-c4-menu]').forEach(panel=>{panel.hidden=true});
    }
    if(normalized===this.lastMode){this.applyUnifiedHud();return normalized}
    for(const entry of STORY_MODES)root.classList.remove(`storyEngineMode-${entry}`);
    root.classList.add(`storyEngineMode-${normalized}`);
    root.dataset.storyEngineMode=normalized;
    document.getElementById('touchInteract')?.classList.toggle('storyVisible',normalized==='exploration');
    this.lastMode=normalized;
    this.applyUnifiedHud();
    const detail={from:previous,to:normalized,mode:normalized,chapter:this.chapterLabel,opponent:this.battle?.fighters?.[1]?.name||'OPPONENT'};
    root.dispatchEvent(new CustomEvent('storymodechange',{detail,bubbles:true}));
    document.dispatchEvent(new CustomEvent('pxstorymodechange',{detail}));
    return normalized;
  }

  transition(mode,{phase=null,time=null,hideBanner=false,notice=null}={}){
    const normalized=this.setMode(mode);
    if(phase)this.battle.phase=phase;
    else this.battle.phase=['combat','tutorial','exploration'].includes(normalized)?'play':'story';
    if(Number.isFinite(time))this.battle.time=time;
    if(hideBanner)this.battle.hideBanner();
    if(notice)this.battle.notice(notice,1.6);
    this.sync(true);
    return normalized;
  }

  setGameplayState(mode,options={}){return this.transition(mode,options)}
  commandForMode(command,mode,options={}){return storyCommandForMode(command,mode,options)}

  activeInput(){
    const input=sharedInput.lastInputDevice[0]||this.battle?.controls?.lastInput||this.battle?.root?.dataset?.activeInput||'keyboard';
    return input;
  }

  prompt(action,keyboardLabel=''){
    const input=this.activeInput();
    if(input==='touch')return TOUCH_PROMPTS[action]||keyboardLabel||String(action).toUpperCase();
    if(input==='controller')return controllerPrompt(action);
    if(input==='mouse')return mousePrompt(action,keyboardLabel);
    return keyboardPrompt(action,keyboardLabel);
  }

  applyUnifiedHud(){
    const root=this.battle?.root;if(!root)return;
    const mode=normalizeMode(this.getMode());
    root.dataset.storyHudMode=mode;
    root.classList.toggle('storyHudExploration',mode==='exploration');
    root.classList.toggle('storyHudCombat',mode==='combat'||mode==='tutorial');
    root.classList.toggle('storyHudCinematic',['dialogue','cinematic','complete','story'].includes(mode));
    if(this.runtimeOptions.hideInactiveOpponentHud)root.classList.toggle('storyHideOpponentHud',mode==='exploration');
  }

  setHotbarAvailability(allowedSlots=[],{show=true}={}){
    const allowed=new Set(allowedSlots.map(Number));
    this.battle.root.classList.toggle('storyHotbarVisible',Boolean(show));
    this.battle.root.querySelectorAll('[data-arena-slot]').forEach(button=>{
      const slot=Number(button.dataset.arenaSlot),unlocked=allowed.has(slot);
      button.classList.toggle('storyAbilityLocked',!unlocked);
      button.setAttribute('aria-disabled',unlocked?'false':'true');
      button.tabIndex=unlocked?0:-1;
      const state=button.querySelector('[data-arena-state]');
      if(state&&!unlocked)state.textContent='LEARN LATER';
    });
  }

  clearHotbarAvailability(){
    this.battle.root.classList.remove('storyHotbarVisible');
    this.battle.root.querySelectorAll('[data-arena-slot]').forEach(button=>{
      button.classList.remove('storyAbilityLocked');button.removeAttribute('aria-disabled');button.tabIndex=0;
    });
  }

  sync(force=false){
    const mode=normalizeMode(this.getMode());
    if(force||mode!==this.lastMode)this.setMode(mode);
    const input=this.activeInput();
    if(force||input!==this.lastInput){
      this.lastInput=input;
      this.battle.root.dataset.storyInput=input;
      this.battle.root.dispatchEvent(new CustomEvent('storyinputchange',{detail:{input}}));
    }
    this.applyUnifiedHud();
  }

  showDialogue(lines,{onComplete=()=>{},typeSpeed=18,allowSkip=true}={}){
    this.closeDialogue();
    this.battle.root.classList.add('storyDialogueOpen');
    this.setMode('dialogue');
    let dialogue=null;
    dialogue=new SonicBattleDialogue({
      typeSpeed,allowSkip,
      onComplete:()=>{
        if(this.dialogue===dialogue)this.dialogue=null;
        this.battle.root.classList.remove('storyDialogueOpen');
        dialogue?.destroy();
        onComplete();
        this.sync(true);
      }
    });
    this.dialogue=dialogue;
    dialogue.show(lines);
    if(dialogue.overlay)dialogue.overlay.style.zIndex='2300';
    this.sync(true);
    return dialogue;
  }

  closeDialogue(){
    const dialogue=this.dialogue;
    if(!dialogue){this.battle.root.classList.remove('storyDialogueOpen');return}
    this.dialogue=null;dialogue.destroy();this.battle.root.classList.remove('storyDialogueOpen');this.sync(true);
  }

  destroy(){
    this.closeDialogue();
    this.clearHotbarAvailability();
    this.clearChapterProfile();
    const root=this.battle?.root;
    if(root){
      root.classList.remove('storyEngineActive','storyUnifiedRuntime','storyHudExploration','storyHudCombat','storyHudCinematic','storyHideOpponentHud',...this.rootClasses);
      document.getElementById('touchInteract')?.classList.remove('storyVisible');
      document.body.classList.remove('storyFightUiSafe');
      for(const mode of STORY_MODES)root.classList.remove(`storyEngineMode-${mode}`);
      for(const key of ['storyEngineMode','storyEngineVersion','storyInput','storyHudMode','storyRuntime','storyChapter','storyProfile'])delete root.dataset[key];
    }
    for(const [name,fn] of Object.entries(this.baseRuntime))this.battle[name]=fn;
    resetArenaBattleInstance();
    this.attached=false;
  }
}

export function attachStoryEngine(battle,options={}){
  const session=new StoryEngineSession(battle,options);
  battle.storyEngine=session;
  return session.attach();
}

export function destroyStoryBattle(battle){
  if(battle?.storyEngine)battle.storyEngine.destroy();
  else resetArenaBattleInstance();
}

export function storyArenaNames(battle,left,right){setArenaNames(battle,left,right)}
