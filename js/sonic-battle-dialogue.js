import {storyConfirm} from './story/story-ux.js?v=29a391-chapter4-ending-continuity-20260801';

/* Parallels X shared story dialogue presentation. */
const ADVANCE_KEYS=new Set(['Enter','Space','KeyZ','KeyJ','KeyF','ArrowRight']);
const PREVIOUS_KEYS=new Set(['ArrowUp','ArrowLeft']);
const NEXT_KEYS=new Set(['ArrowDown']);
const PREFS_KEY='pxDialoguePrefsV1';
const SPEEDS=Object.freeze({slow:38,normal:24,fast:10,instant:0});

const SPEAKER_ALIASES=Object.freeze({
  p1:'rrvvfo',player1:'rrvvfo',rrvvfo:'rrvvfo',revvfo:'revvfo',sage:'sage','the sage':'sage',
  wade:'wade',bark:'bark',alt:'alt',rover:'rover',robert:'robert',narrator:'narrator',system:'system',neutral:'narrator'
});
const ATLAS_FIGHTERS=Object.freeze({rrvvfo:'rrvvfo',revvfo:'revvfo',wade:'wade',bark:'bark',sage:'sage'});
const atlasCache=new Map();

function speakerKey(entry={}){
  const explicit=String(entry.speakerClass||'').trim().toLowerCase();
  const name=String(entry.speaker||'').trim().toLowerCase();
  if(name.includes('sage'))return'sage';
  return SPEAKER_ALIASES[explicit]||SPEAKER_ALIASES[name]||explicit||'narrator';
}
function safeText(value){return value==null?'':String(value)}
function readPrefs(){
  try{return{auto:false,speed:'normal',...JSON.parse(localStorage.getItem(PREFS_KEY)||'{}')}}catch{return{auto:false,speed:'normal'}}
}
function inferEmotion(entry={}){
  if(entry.emotion)return String(entry.emotion).toLowerCase();
  const text=safeText(entry.text),upper=text.replace(/[^A-Z]/g,'').length,letters=text.replace(/[^A-Za-z]/g,'').length;
  if(/laugh|haha|smirk|yay|thank|good luck|no problemo/i.test(text))return'happy';
  if(/wait|what\?|why\?|holy|ahh|really\?|impossible/i.test(text))return'shocked';
  if(/careful|worried|sorry|please|don.?t go|seems fishy/i.test(text))return'worried';
  if(/think|guess|maybe|seems|probably|clue|observe/i.test(text))return'thinking';
  if(text.includes('!')||(letters&&upper/letters>.66))return'angry';
  if(/win|defeat|fight|capable|strong|ready|try me/i.test(text))return'determined';
  return'neutral';
}
function animationCandidates(emotion){
  return{
    happy:['victory','idle','fightingStance'],angry:['heavyActive','heavyStartup','fightingStance'],
    shocked:['hurtLight','guardBreak','idle'],worried:['blockHold','hurtLight','idle'],
    thinking:['idle','fightingStance'],determined:['fightingStance','heavyStartup','idle'],neutral:['idle','fightingStance']
  }[emotion]||['idle','fightingStance'];
}
async function loadAtlas(id){
  if(atlasCache.has(id))return atlasCache.get(id);
  const promise=(async()=>{
    const manifestUrl=new URL(`../assets/fighters/${id}/${id}-animations.json`,import.meta.url);
    const response=await fetch(manifestUrl);
    if(!response.ok)throw new Error(`Portrait manifest ${response.status}`);
    const manifest=await response.json(),image=new Image();
    image.src=new URL(manifest.image,manifestUrl).href;
    await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('Portrait atlas failed'))});
    return{manifest,image};
  })().catch(error=>{atlasCache.delete(id);throw error});
  atlasCache.set(id,promise);return promise;
}
function frameForEmotion(manifest,emotion){
  for(const animationName of animationCandidates(emotion)){
    const animation=manifest.animations?.[animationName];
    const frameId=animation?.variants?.down?.[0]||animation?.frames?.[0];
    const frame=frameId&&manifest.frames?.[frameId];
    if(frame?.source)return frame;
  }
  const frame=Object.values(manifest.frames||{}).find(candidate=>candidate?.source);
  return frame||null;
}

export class SonicBattleDialogue{
  constructor(options={}){
    this.container=options.container||document.body;this.onComplete=options.onComplete||(()=>{});this.onChoice=options.onChoice||(()=>{});
    this.typeSpeed=options.typeSpeed??24;this.autoAdvanceDelay=options.autoAdvanceDelay??1450;this.prefs=readPrefs();this.history=[];
    this.overlay=this.spriteWrap=this.spriteEl=this.box=this.textEl=this.speakerEl=this.tailEl=this.promptEl=this.choicesEl=this.portraitEl=null;
    this.toolbar=this.historyPanel=this.emotionEl=null;this.typingTimer=null;this.advanceTimer=null;this.gamepadFrame=0;this.isTyping=false;this.canAdvance=false;
    this.currentQueue=[];this.queueIndex=0;this.choiceIndex=0;this.inputBound=false;this.isClosing=false;this.completed=false;this.gamepadWasPressed=false;this.skipPromptOpen=false;this.allowSkip=options.allowSkip!==false;
    this._onKey=this._onKey.bind(this);this._onPointer=this._onPointer.bind(this);this._pollGamepad=this._pollGamepad.bind(this);this.bindInput();
  }
  savePrefs(){try{localStorage.setItem(PREFS_KEY,JSON.stringify(this.prefs))}catch{}}
  build(){
    if(this.overlay)return;
    this.overlay=document.createElement('div');this.overlay.className='px-dialogue-overlay sbDialogueOverlay';this.overlay.style.zIndex='2200';this.overlay.setAttribute('role','dialog');this.overlay.setAttribute('aria-modal','true');this.overlay.setAttribute('aria-live','polite');this.overlay.setAttribute('aria-label','Story dialogue');
    this.spriteWrap=document.createElement('div');this.spriteWrap.className='px-dialogue-sprite-wrap sbDialoguePortraitWrap';
    this.spriteEl=document.createElement('div');this.spriteEl.className='px-dialogue-sprite sbDialoguePortrait';this.spriteEl.style.display='none';this.spriteWrap.appendChild(this.spriteEl);this.portraitEl=this.spriteEl;
    this.box=document.createElement('div');this.box.className='px-dialogue-box sbDialogueBox';
    this.toolbar=document.createElement('div');this.toolbar.className='px-dialogue-toolbar';this.toolbar.innerHTML='<button type="button" data-dialogue-auto>AUTO: OFF</button><button type="button" data-dialogue-speed>SPEED: NORMAL</button><button type="button" data-dialogue-history>HISTORY</button>';
    this.speakerEl=document.createElement('div');this.speakerEl.className='px-dialogue-speaker sbDialogueSpeaker';this.speakerEl.style.display='none';
    this.emotionEl=document.createElement('span');this.emotionEl.className='px-dialogue-emotion';
    this.tailEl=document.createElement('div');this.tailEl.className='sbDialogueTail';this.tailEl.style.display='none';
    this.textEl=document.createElement('div');this.textEl.className='px-dialogue-text sbDialogueText';
    this.choicesEl=document.createElement('div');this.choicesEl.className='px-dialogue-choices sbDialogueChoices';this.choicesEl.style.display='none';
    this.promptEl=document.createElement('div');this.promptEl.className='px-dialogue-prompt sbDialoguePrompt';this.promptEl.innerHTML='<span>Click or press</span><kbd class="px-key sbKey">A</kbd><span>to continue</span>';this.promptEl.style.display='none';
    this.historyPanel=document.createElement('section');this.historyPanel.className='px-dialogue-history hidden';this.historyPanel.setAttribute('aria-label','Dialogue history');this.historyPanel.innerHTML='<header><strong>DIALOGUE HISTORY</strong><button type="button" data-dialogue-history-close>BACK</button></header><div data-dialogue-history-list></div>';
    this.box.append(this.toolbar,this.speakerEl,this.tailEl,this.textEl,this.choicesEl,this.promptEl);this.overlay.append(this.spriteWrap,this.box,this.historyPanel);
    this.overlay.addEventListener('pointerdown',this._onPointer);this.container.appendChild(this.overlay);
    this.toolbar.querySelector('[data-dialogue-auto]').addEventListener('click',event=>{event.stopPropagation();this.prefs.auto=!this.prefs.auto;this.savePrefs();this.updateToolbar();if(this.prefs.auto&&this.canAdvance)this.advanceTimer=setTimeout(()=>this.advance(),this.autoAdvanceDelay)});
    this.toolbar.querySelector('[data-dialogue-speed]').addEventListener('click',event=>{event.stopPropagation();const order=['slow','normal','fast','instant'],index=order.indexOf(this.prefs.speed);this.prefs.speed=order[(index+1)%order.length];this.savePrefs();this.updateToolbar()});
    this.toolbar.querySelector('[data-dialogue-history]').addEventListener('click',event=>{event.stopPropagation();this.openHistory()});
    this.historyPanel.querySelector('[data-dialogue-history-close]').addEventListener('click',event=>{event.stopPropagation();this.closeHistory()});
    this.updateToolbar();
  }
  updateToolbar(){
    if(!this.toolbar)return;
    this.toolbar.querySelector('[data-dialogue-auto]').textContent=`AUTO: ${this.prefs.auto?'ON':'OFF'}`;
    this.toolbar.querySelector('[data-dialogue-speed]').textContent=`SPEED: ${String(this.prefs.speed||'normal').toUpperCase()}`;
  }
  openHistory(){
    if(!this.historyPanel)return;clearTimeout(this.advanceTimer);this.historyPanel.classList.remove('hidden');this.box.classList.add('history-open');
    const list=this.historyPanel.querySelector('[data-dialogue-history-list]');list.innerHTML=this.history.map(item=>`<article><strong>${safeText(item.speaker||'Narrator')}</strong><p>${safeText(item.text)}</p></article>`).join('')||'<p>No earlier lines yet.</p>';list.scrollTop=list.scrollHeight;
  }
  closeHistory(){this.historyPanel?.classList.add('hidden');this.box?.classList.remove('history-open');if(this.prefs.auto&&this.canAdvance)this.advanceTimer=setTimeout(()=>this.advance(),this.autoAdvanceDelay)}
  bindInput(){if(this.inputBound)return;document.addEventListener('keydown',this._onKey);this.inputBound=true}
  unbindInput(){if(!this.inputBound)return;document.removeEventListener('keydown',this._onKey);this.inputBound=false}
  _isActive(){return Boolean(this.overlay?.classList.contains('active'))}
  _onPointer(event){
    if(!this._isActive()||event.target.closest('.px-dialogue-choice,.sbDialogueChoice,.px-dialogue-toolbar,.px-dialogue-history'))return;
    event.preventDefault();if(this.isTyping)this.skipTyping();else if(this.canAdvance)this.advance();
  }
  _onKey(event){
    if(!this._isActive())return;
    if(!this.historyPanel?.classList.contains('hidden')){if(event.code==='Escape'||ADVANCE_KEYS.has(event.code)){event.preventDefault();this.closeHistory()}return}
    if(ADVANCE_KEYS.has(event.code)){event.preventDefault();if(this.isTyping)this.skipTyping();else if(this.choicesEl.style.display!=='none')this.selectChoice(this.choiceIndex);else if(this.canAdvance)this.advance();return}
    if(this.choicesEl.style.display!=='none'){if(PREVIOUS_KEYS.has(event.code)){event.preventDefault();this.navigateChoice(-1)}else if(NEXT_KEYS.has(event.code)){event.preventDefault();this.navigateChoice(1)}}
    if(event.code==='KeyH'){event.preventDefault();this.openHistory();return}
    if(event.code==='Escape'){
      event.preventDefault();event.stopImmediatePropagation();if(!this.allowSkip||this.skipPromptOpen)return;this.skipPromptOpen=true;
      storyConfirm({title:'SKIP THIS CONVERSATION?',message:'The remaining dialogue will be skipped and the story will continue from the next gameplay section.',accept:'SKIP DIALOGUE'}).then(skip=>{this.skipPromptOpen=false;if(skip&&this._isActive())this.close()});
    }
  }
  _pollGamepad(){
    if(!this._isActive())return;const pads=navigator.getGamepads?.()||[],pad=Array.from(pads).find(Boolean),confirm=Boolean(pad?.buttons?.[0]?.pressed);
    if(confirm&&!this.gamepadWasPressed){if(this.isTyping)this.skipTyping();else if(this.choicesEl.style.display!=='none')this.selectChoice(this.choiceIndex);else if(this.canAdvance)this.advance()}
    this.gamepadWasPressed=confirm;if(this._isActive())this.gamepadFrame=requestAnimationFrame(this._pollGamepad);
  }
  show(data){
    this.build();this.bindInput();this.completed=false;this.isClosing=false;this.overlay.classList.add('active');this.currentQueue=Array.isArray(data)?data:[data];this.queueIndex=0;this.history=[];this.displayEntry(this.currentQueue[0]||{});cancelAnimationFrame(this.gamepadFrame);this.gamepadFrame=requestAnimationFrame(this._pollGamepad);return this;
  }
  displayEntry(entry={}){
    clearInterval(this.typingTimer);clearTimeout(this.advanceTimer);this.canAdvance=false;this.promptEl.style.display='none';this.choicesEl.style.display='none';this.choicesEl.innerHTML='';
    const key=speakerKey(entry),emotion=inferEmotion(entry);this.overlay.dataset.emotion=emotion;
    if(entry.speaker){
      this.speakerEl.style.display='inline-flex';this.speakerEl.className=`px-dialogue-speaker sbDialogueSpeaker ${key}`;this.speakerEl.textContent=safeText(entry.speaker);
      if(entry.speakerIcon){const icon=document.createElement('span');icon.className='px-dialogue-speaker-icon sbDialogueSpeakerIcon';icon.style.background=`url(${entry.speakerIcon}) center/cover`;const label=document.createElement('span');label.textContent=safeText(entry.speaker);this.speakerEl.replaceChildren(icon,label)}
      this.emotionEl.textContent=emotion;this.speakerEl.appendChild(this.emotionEl);
    }else{this.speakerEl.style.display='none';this.speakerEl.textContent=''}
    this.tailEl.dataset.direction=entry.tail||'';this.renderSprite(entry,key,emotion);
    if(typeof entry.onShow==='function'){try{entry.onShow(entry,this)}catch(error){console.error('[Story Dialogue] onShow failed',error)}}
    this.textEl.textContent='';this.textEl.classList.add('typing');this.isTyping=true;
    const text=safeText(entry.text);this.history.push({speaker:entry.speaker||'Narrator',text,emotion});
    document.dispatchEvent(new CustomEvent('pxdialogueline',{detail:{speaker:key,emotion,text}}));
    let index=0;const selectedSpeed=SPEEDS[this.prefs.speed]??SPEEDS.normal,speed=Math.max(0,Number(entry.typeSpeed??(this.typeSpeed===24?selectedSpeed:this.typeSpeed)));
    if(speed===0){this.textEl.textContent=text;this.finishTyping()}else this.typingTimer=setInterval(()=>{if(index>=text.length){this.finishTyping();return}this.textEl.textContent+=text.charAt(index++)},speed);
    if(Array.isArray(entry.choices)&&entry.choices.length)this.renderChoices(entry.choices);
  }
  renderSprite(entry,key,emotion='neutral'){
    this.spriteEl.className=`px-dialogue-sprite sbDialoguePortrait emotion-${emotion}`;this.spriteEl.style.display='none';this.spriteEl.textContent='';this.spriteEl.replaceChildren();
    const image=entry.sprite||entry.portrait;
    if(image){const img=document.createElement('img');img.src=image;img.alt=entry.speaker?safeText(entry.speaker):'';img.decoding='async';this.spriteEl.appendChild(img);this.spriteEl.style.display='block'}
    else if(ATLAS_FIGHTERS[key]){this.renderAtlasPortrait(ATLAS_FIGHTERS[key],entry.speaker||key,emotion)}
    else if(entry.speaker){this.spriteEl.classList.add('is-fallback');this.spriteEl.textContent=safeText(entry.speaker);this.spriteEl.style.display='grid'}
    if(this.spriteEl.style.display!=='none'){this.spriteEl.classList.remove('bounce');void this.spriteEl.offsetWidth;this.spriteEl.classList.add('bounce')}
  }
  async renderAtlasPortrait(id,label,emotion){
    const token={id,queue:this.queueIndex};this.portraitToken=token;this.spriteEl.style.display='grid';this.spriteEl.classList.add('is-loading');this.spriteEl.textContent=label;
    try{
      const {manifest,image}=await loadAtlas(id);if(this.portraitToken!==token||!this.spriteEl)return;const frame=frameForEmotion(manifest,emotion);if(!frame)throw new Error('No portrait frame');
      const [sx,sy,sw,sh]=frame.source,canvas=document.createElement('canvas');canvas.width=sw;canvas.height=sh;canvas.setAttribute('aria-label',label);canvas.getContext('2d').drawImage(image,sx,sy,sw,sh,0,0,sw,sh);
      this.spriteEl.classList.remove('is-loading');this.spriteEl.classList.add('atlas-portrait');this.spriteEl.replaceChildren(canvas);this.spriteEl.style.display='block';
    }catch{if(this.portraitToken!==token||!this.spriteEl)return;this.spriteEl.classList.remove('is-loading');this.spriteEl.classList.add('is-fallback');this.spriteEl.textContent=label;this.spriteEl.style.display='grid'}
  }
  skipTyping(){if(!this.isTyping)return;clearInterval(this.typingTimer);const entry=this.currentQueue[this.queueIndex]||{};this.textEl.textContent=safeText(entry.text);this.finishTyping()}
  finishTyping(){
    if(!this.isTyping&&this.textEl&&!this.textEl.classList.contains('typing'))return;clearInterval(this.typingTimer);this.isTyping=false;this.textEl.classList.remove('typing');const entry=this.currentQueue[this.queueIndex]||{};
    if(Array.isArray(entry.choices)&&entry.choices.length){this.canAdvance=false;this.promptEl.style.display='none';this.choicesEl.style.display='grid';this.choiceIndex=0;this.updateChoiceSelection();this.choicesEl.querySelector('.px-dialogue-choice,.sbDialogueChoice')?.focus()}
    else{this.canAdvance=true;this.promptEl.style.display='flex';if(entry.autoAdvance||this.prefs.auto)this.advanceTimer=setTimeout(()=>this.advance(),this.autoAdvanceDelay)}
  }
  renderChoices(choices){
    this.choicesEl.innerHTML='';choices.forEach((choice,index)=>{const button=document.createElement('button');button.type='button';button.className='px-dialogue-choice sbDialogueChoice';button.dataset.index=String(index);const marker=document.createElement('span');marker.className='px-choice-marker sbChoiceMarker';const label=document.createElement('span');label.textContent=safeText(choice.text);button.append(marker,label);button.addEventListener('click',event=>{event.stopPropagation();this.selectChoice(index)});this.choicesEl.appendChild(button)});this.choiceIndex=0;this.updateChoiceSelection();
  }
  navigateChoice(direction){const choices=this.choicesEl.querySelectorAll('.px-dialogue-choice,.sbDialogueChoice');if(!choices.length)return;this.choiceIndex=(this.choiceIndex+direction+choices.length)%choices.length;this.updateChoiceSelection();choices[this.choiceIndex].focus()}
  updateChoiceSelection(){this.choicesEl.querySelectorAll('.px-dialogue-choice,.sbDialogueChoice').forEach((choice,index)=>choice.classList.toggle('selected',index===this.choiceIndex))}
  selectChoice(index){const entry=this.currentQueue[this.queueIndex]||{},choice=entry.choices?.[index];if(!choice)return;this.onChoice({entry,choice,index});this.advance()}
  advance(){if(this.isClosing)return;clearTimeout(this.advanceTimer);this.queueIndex++;if(this.queueIndex<this.currentQueue.length)this.displayEntry(this.currentQueue[this.queueIndex]);else this.close()}
  close(){
    if(this.isClosing)return;this.isClosing=true;clearInterval(this.typingTimer);clearTimeout(this.advanceTimer);cancelAnimationFrame(this.gamepadFrame);this.canAdvance=false;this.isTyping=false;
    const finish=()=>{if(this.completed)return;this.completed=true;const callback=this.onComplete;this.destroy();this.isClosing=false;callback()};if(this.box){this.box.classList.add('exit');setTimeout(finish,200)}else finish();
  }
  destroy(){
    clearInterval(this.typingTimer);clearTimeout(this.advanceTimer);cancelAnimationFrame(this.gamepadFrame);this.unbindInput();this.overlay?.removeEventListener('pointerdown',this._onPointer);this.overlay?.remove();
    this.overlay=this.spriteWrap=this.spriteEl=this.portraitEl=this.box=this.textEl=this.speakerEl=this.tailEl=this.promptEl=this.choicesEl=this.toolbar=this.historyPanel=this.emotionEl=null;
  }
  static say(text,speaker,options={}){const dialogue=new SonicBattleDialogue(options);dialogue.show({text,speaker,...options});return dialogue}
}
export const PXDialogue=SonicBattleDialogue;
