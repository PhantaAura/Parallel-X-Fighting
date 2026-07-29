import {storyConfirm} from './story/story-ux.js?v=29a10-living-tournament-hub-20260729';

/* ═══════════════════════════════════════════════════════════════
   PARALLELS X — COMPATIBLE SPRITE-ON-TOP DIALOGUE
   Prototype 2.6.5

   Keeps the current game's SonicBattleDialogue API while rendering the
   uploaded PX sprite-on-top visual design. PXDialogue is also exported as
   an alias for future scripts.
   ═══════════════════════════════════════════════════════════════ */

const ADVANCE_KEYS=new Set(['Enter','Space','KeyZ','KeyJ','KeyF','ArrowRight']);
const PREVIOUS_KEYS=new Set(['ArrowUp','ArrowLeft']);
const NEXT_KEYS=new Set(['ArrowDown']);

const SPEAKER_ALIASES=Object.freeze({
  p1:'rrvvfo',
  player1:'rrvvfo',
  rrvvfo:'rrvvfo',
  revvfo:'revvfo',
  sage:'sage',
  'the sage':'sage',
  wade:'wade',
  bark:'bark',
  alt:'alt',
  rover:'rover',
  robert:'robert',
  narrator:'narrator',
  system:'system',
  neutral:'narrator'
});

const ATLAS_SPRITES=Object.freeze({
  rrvvfo:'sprite-rrvvfo',
  sage:'sprite-sage'
});

function speakerKey(entry={}){
  const explicit=String(entry.speakerClass||'').trim().toLowerCase();
  const name=String(entry.speaker||'').trim().toLowerCase();
  if(name.includes('sage'))return 'sage';
  return SPEAKER_ALIASES[explicit]||SPEAKER_ALIASES[name]||explicit||'narrator';
}

function safeText(value){return value==null?'':String(value)}

export class SonicBattleDialogue{
  constructor(options={}){
    this.container=options.container||document.body;
    this.onComplete=options.onComplete||(()=>{});
    this.onChoice=options.onChoice||(()=>{});
    this.typeSpeed=options.typeSpeed??28;
    this.autoAdvanceDelay=options.autoAdvanceDelay??1200;

    this.overlay=null;
    this.spriteWrap=null;
    this.spriteEl=null;
    this.box=null;
    this.textEl=null;
    this.speakerEl=null;
    this.tailEl=null;
    this.promptEl=null;
    this.choicesEl=null;
    this.portraitEl=null; // Current Mission 1 cleanup code expects this name.

    this.typingTimer=null;
    this.advanceTimer=null;
    this.gamepadFrame=0;
    this.isTyping=false;
    this.canAdvance=false;
    this.currentQueue=[];
    this.queueIndex=0;
    this.choiceIndex=0;
    this.inputBound=false;
    this.isClosing=false;
    this.completed=false;
    this.gamepadWasPressed=false;
    this.skipPromptOpen=false;
    this.allowSkip=options.allowSkip!==false;

    this._onKey=this._onKey.bind(this);
    this._onPointer=this._onPointer.bind(this);
    this._pollGamepad=this._pollGamepad.bind(this);
    this.bindInput();
  }

  build(){
    if(this.overlay)return;

    this.overlay=document.createElement('div');
    this.overlay.className='px-dialogue-overlay sbDialogueOverlay';
    this.overlay.style.zIndex='2200';
    this.overlay.setAttribute('role','dialog');
    this.overlay.setAttribute('aria-modal','true');
    this.overlay.setAttribute('aria-live','polite');
    this.overlay.setAttribute('aria-label','Story dialogue');

    this.spriteWrap=document.createElement('div');
    this.spriteWrap.className='px-dialogue-sprite-wrap sbDialoguePortraitWrap';

    this.spriteEl=document.createElement('div');
    this.spriteEl.className='px-dialogue-sprite sbDialoguePortrait';
    this.spriteEl.style.display='none';
    this.spriteWrap.appendChild(this.spriteEl);
    this.portraitEl=this.spriteEl;

    this.box=document.createElement('div');
    this.box.className='px-dialogue-box sbDialogueBox';

    this.speakerEl=document.createElement('div');
    this.speakerEl.className='px-dialogue-speaker sbDialogueSpeaker';
    this.speakerEl.style.display='none';

    this.tailEl=document.createElement('div');
    this.tailEl.className='sbDialogueTail';
    this.tailEl.style.display='none';

    this.textEl=document.createElement('div');
    this.textEl.className='px-dialogue-text sbDialogueText';

    this.choicesEl=document.createElement('div');
    this.choicesEl.className='px-dialogue-choices sbDialogueChoices';
    this.choicesEl.style.display='none';

    this.promptEl=document.createElement('div');
    this.promptEl.className='px-dialogue-prompt sbDialoguePrompt';
    this.promptEl.innerHTML='<span>Click or press</span><kbd class="px-key sbKey">A</kbd><span>to continue</span>';
    this.promptEl.style.display='none';

    this.box.append(this.speakerEl,this.tailEl,this.textEl,this.choicesEl,this.promptEl);
    this.overlay.append(this.spriteWrap,this.box);
    this.overlay.addEventListener('pointerdown',this._onPointer);
    this.container.appendChild(this.overlay);
  }

  bindInput(){
    if(this.inputBound)return;
    document.addEventListener('keydown',this._onKey);
    this.inputBound=true;
  }

  unbindInput(){
    if(!this.inputBound)return;
    document.removeEventListener('keydown',this._onKey);
    this.inputBound=false;
  }

  _isActive(){return Boolean(this.overlay?.classList.contains('active'))}

  _onPointer(event){
    if(!this._isActive())return;
    if(event.target.closest('.px-dialogue-choice,.sbDialogueChoice'))return;
    event.preventDefault();
    if(this.isTyping)this.skipTyping();
    else if(this.canAdvance)this.advance();
  }

  _onKey(event){
    if(!this._isActive())return;

    if(ADVANCE_KEYS.has(event.code)){
      event.preventDefault();
      if(this.isTyping)this.skipTyping();
      else if(this.choicesEl.style.display!=='none')this.selectChoice(this.choiceIndex);
      else if(this.canAdvance)this.advance();
      return;
    }

    if(this.choicesEl.style.display!=='none'){
      if(PREVIOUS_KEYS.has(event.code)){
        event.preventDefault();
        this.navigateChoice(-1);
      }else if(NEXT_KEYS.has(event.code)){
        event.preventDefault();
        this.navigateChoice(1);
      }
    }

    if(event.code==='Escape'){
      event.preventDefault();
      event.stopImmediatePropagation();
      if(!this.allowSkip||this.skipPromptOpen)return;
      this.skipPromptOpen=true;
      storyConfirm({title:'SKIP THIS CONVERSATION?',message:'The remaining dialogue will be skipped and the story will continue from the next gameplay section.',accept:'SKIP DIALOGUE'}).then(skip=>{
        this.skipPromptOpen=false;
        if(skip&&this._isActive())this.close();
      });
    }
  }

  _pollGamepad(){
    if(!this._isActive())return;
    const pads=navigator.getGamepads?.()||[];
    const pad=Array.from(pads).find(Boolean);
    const confirm=Boolean(pad?.buttons?.[0]?.pressed);
    if(confirm&&!this.gamepadWasPressed){
      if(this.isTyping)this.skipTyping();
      else if(this.choicesEl.style.display!=='none')this.selectChoice(this.choiceIndex);
      else if(this.canAdvance)this.advance();
    }
    this.gamepadWasPressed=confirm;
    if(this._isActive())this.gamepadFrame=requestAnimationFrame(this._pollGamepad);
  }

  show(data){
    this.build();
    this.bindInput();
    this.completed=false;
    this.isClosing=false;
    this.overlay.classList.add('active');
    this.currentQueue=Array.isArray(data)?data:[data];
    this.queueIndex=0;
    this.displayEntry(this.currentQueue[0]||{});
    cancelAnimationFrame(this.gamepadFrame);
    this.gamepadFrame=requestAnimationFrame(this._pollGamepad);
    return this;
  }

  displayEntry(entry={}){
    clearInterval(this.typingTimer);
    clearTimeout(this.advanceTimer);
    this.canAdvance=false;
    this.promptEl.style.display='none';
    this.choicesEl.style.display='none';
    this.choicesEl.innerHTML='';

    const key=speakerKey(entry);

    if(entry.speaker){
      this.speakerEl.style.display='inline-flex';
      this.speakerEl.className=`px-dialogue-speaker sbDialogueSpeaker ${key}`;
      this.speakerEl.textContent=safeText(entry.speaker);
      if(entry.speakerIcon){
        const icon=document.createElement('span');
        icon.className='px-dialogue-speaker-icon sbDialogueSpeakerIcon';
        icon.style.background=`url(${entry.speakerIcon}) center/cover`;
        const label=document.createElement('span');
        label.textContent=safeText(entry.speaker);
        this.speakerEl.replaceChildren(icon,label);
      }
    }else{
      this.speakerEl.style.display='none';
      this.speakerEl.textContent='';
    }

    this.tailEl.dataset.direction=entry.tail||'';
    this.renderSprite(entry,key);
    if(typeof entry.onShow==='function'){
      try{entry.onShow(entry,this)}catch(error){console.error('[Story Dialogue] onShow failed',error)}
    }

    this.textEl.textContent='';
    this.textEl.classList.add('typing');
    this.isTyping=true;

    const text=safeText(entry.text);
    let index=0;
    const speed=Math.max(0,Number(entry.typeSpeed??this.typeSpeed));
    if(speed===0){
      this.textEl.textContent=text;
      this.finishTyping();
    }else{
      this.typingTimer=setInterval(()=>{
        if(index>=text.length){this.finishTyping();return;}
        this.textEl.textContent+=text.charAt(index++);
      },speed);
    }

    if(Array.isArray(entry.choices)&&entry.choices.length)this.renderChoices(entry.choices);
  }

  renderSprite(entry,key){
    this.spriteEl.className='px-dialogue-sprite sbDialoguePortrait';
    this.spriteEl.style.display='none';
    this.spriteEl.style.backgroundImage='';
    this.spriteEl.style.backgroundSize='';
    this.spriteEl.style.backgroundPosition='';
    this.spriteEl.textContent='';
    this.spriteEl.replaceChildren();

    const image=entry.sprite||entry.portrait;
    if(image){
      const img=document.createElement('img');
      img.src=image;
      img.alt=entry.speaker?safeText(entry.speaker):'';
      img.decoding='async';
      this.spriteEl.appendChild(img);
      this.spriteEl.style.display='block';
    }else if(ATLAS_SPRITES[key]){
      this.spriteEl.classList.add(ATLAS_SPRITES[key]);
      this.spriteEl.setAttribute('aria-label',entry.speaker||key);
      this.spriteEl.style.display='block';
    }else if(entry.speaker){
      this.spriteEl.classList.add('is-fallback');
      this.spriteEl.textContent=safeText(entry.speaker);
      this.spriteEl.style.display='grid';
    }

    if(this.spriteEl.style.display!=='none'){
      this.spriteEl.classList.remove('bounce');
      void this.spriteEl.offsetWidth;
      this.spriteEl.classList.add('bounce');
    }
  }

  skipTyping(){
    if(!this.isTyping)return;
    clearInterval(this.typingTimer);
    const entry=this.currentQueue[this.queueIndex]||{};
    this.textEl.textContent=safeText(entry.text);
    this.finishTyping();
  }

  finishTyping(){
    if(!this.isTyping&&this.textEl&&!this.textEl.classList.contains('typing'))return;
    clearInterval(this.typingTimer);
    this.isTyping=false;
    this.textEl.classList.remove('typing');
    const entry=this.currentQueue[this.queueIndex]||{};

    if(Array.isArray(entry.choices)&&entry.choices.length){
      this.canAdvance=false;
      this.promptEl.style.display='none';
      this.choicesEl.style.display='grid';
      this.choiceIndex=0;
      this.updateChoiceSelection();
      this.choicesEl.querySelector('.px-dialogue-choice,.sbDialogueChoice')?.focus();
    }else{
      this.canAdvance=true;
      this.promptEl.style.display='flex';
      if(entry.autoAdvance)this.advanceTimer=setTimeout(()=>this.advance(),this.autoAdvanceDelay);
    }
  }

  renderChoices(choices){
    this.choicesEl.innerHTML='';
    choices.forEach((choice,index)=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='px-dialogue-choice sbDialogueChoice';
      button.dataset.index=String(index);
      const marker=document.createElement('span');
      marker.className='px-choice-marker sbChoiceMarker';
      const label=document.createElement('span');
      label.textContent=safeText(choice.text);
      button.append(marker,label);
      button.addEventListener('click',event=>{
        event.stopPropagation();
        this.selectChoice(index);
      });
      this.choicesEl.appendChild(button);
    });
    this.choiceIndex=0;
    this.updateChoiceSelection();
  }

  navigateChoice(direction){
    const choices=this.choicesEl.querySelectorAll('.px-dialogue-choice,.sbDialogueChoice');
    if(!choices.length)return;
    this.choiceIndex=(this.choiceIndex+direction+choices.length)%choices.length;
    this.updateChoiceSelection();
    choices[this.choiceIndex].focus();
  }

  updateChoiceSelection(){
    const choices=this.choicesEl.querySelectorAll('.px-dialogue-choice,.sbDialogueChoice');
    choices.forEach((choice,index)=>choice.classList.toggle('selected',index===this.choiceIndex));
  }

  selectChoice(index){
    const entry=this.currentQueue[this.queueIndex]||{};
    const choice=entry.choices?.[index];
    if(!choice)return;
    this.onChoice({entry,choice,index});
    this.advance();
  }

  advance(){
    if(this.isClosing)return;
    clearTimeout(this.advanceTimer);
    this.queueIndex++;
    if(this.queueIndex<this.currentQueue.length)this.displayEntry(this.currentQueue[this.queueIndex]);
    else this.close();
  }

  close(){
    if(this.isClosing)return;
    this.isClosing=true;
    clearInterval(this.typingTimer);
    clearTimeout(this.advanceTimer);
    cancelAnimationFrame(this.gamepadFrame);
    this.canAdvance=false;
    this.isTyping=false;

    const finish=()=>{
      if(this.completed)return;
      this.completed=true;
      const callback=this.onComplete;
      this.destroy();
      this.isClosing=false;
      callback();
    };

    if(this.box){
      this.box.classList.add('exit');
      setTimeout(finish,200);
    }else finish();
  }

  destroy(){
    clearInterval(this.typingTimer);
    clearTimeout(this.advanceTimer);
    cancelAnimationFrame(this.gamepadFrame);
    this.unbindInput();
    this.overlay?.removeEventListener('pointerdown',this._onPointer);
    this.overlay?.remove();
    this.overlay=null;
    this.spriteWrap=null;
    this.spriteEl=null;
    this.portraitEl=null;
    this.box=null;
    this.textEl=null;
    this.speakerEl=null;
    this.tailEl=null;
    this.promptEl=null;
    this.choicesEl=null;
  }

  static say(text,speaker,options={}){
    const dialogue=new SonicBattleDialogue(options);
    dialogue.show({text,speaker,...options});
    return dialogue;
  }
}

export const PXDialogue=SonicBattleDialogue;
