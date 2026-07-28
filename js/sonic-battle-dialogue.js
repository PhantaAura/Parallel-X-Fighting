/* ═══════════════════════════════════════════════════════════════
   SONIC BATTLE DIALOGUE BOX SYSTEM
   Drop this file into your js/ folder and import it where needed:
   import {SonicBattleDialogue} from './sonic-battle-dialogue.js';
   ═══════════════════════════════════════════════════════════════ */

/**
 * SonicBattleDialogue — A dialogue box system styled after Sonic Battle (GBA).
 * Features: typewriter text, speaker tags, directional tails, portraits,
 * branching choices, and keyboard/controller input support.
 */
export class SonicBattleDialogue{
  constructor(options={}){
    this.container=document.body;
    this.onComplete=options.onComplete||(()=>{});
    this.onChoice=options.onChoice||(()=>{});
    this.typeSpeed=options.typeSpeed||28; // ms per char
    this.autoAdvanceDelay=options.autoAdvanceDelay||1200; // ms after typing
    this.overlay=null;
    this.box=null;
    this.textEl=null;
    this.speakerEl=null;
    this.tailEl=null;
    this.promptEl=null;
    this.choicesEl=null;
    this.portraitEl=null;
    this.typingTimer=null;
    this.advanceTimer=null;
    this.isTyping=false;
    this.canAdvance=false;
    this.currentQueue=[];
    this.queueIndex=0;
    this.choiceIndex=0;
    this.bindInput();
  }

  /* ─── Create DOM structure ─── */
  build(){
    if(this.overlay)return;

    this.overlay=document.createElement('div');
    this.overlay.className='sbDialogueOverlay';
    this.overlay.setAttribute('role','dialog');
    this.overlay.setAttribute('aria-live','polite');

    const wrap=document.createElement('div');
    wrap.className='sbDialoguePortraitWrap';

    this.portraitEl=document.createElement('div');
    this.portraitEl.className='sbDialoguePortrait';
    this.portraitEl.style.display='none';

    this.box=document.createElement('div');
    this.box.className='sbDialogueBox';

    this.speakerEl=document.createElement('div');
    this.speakerEl.className='sbDialogueSpeaker';
    this.speakerEl.style.display='none';

    this.tailEl=document.createElement('div');
    this.tailEl.className='sbDialogueTail down';

    this.textEl=document.createElement('div');
    this.textEl.className='sbDialogueText';

    this.choicesEl=document.createElement('div');
    this.choicesEl.className='sbDialogueChoices';
    this.choicesEl.style.display='none';

    this.promptEl=document.createElement('div');
    this.promptEl.className='sbDialoguePrompt';
    this.promptEl.innerHTML='<span>Press</span><kbd class="sbKey">A</kbd><span>to continue</span>';
    this.promptEl.style.display='none';

    this.box.appendChild(this.speakerEl);
    this.box.appendChild(this.tailEl);
    this.box.appendChild(this.textEl);
    this.box.appendChild(this.choicesEl);
    this.box.appendChild(this.promptEl);

    wrap.appendChild(this.portraitEl);
    wrap.appendChild(this.box);
    this.overlay.appendChild(wrap);
    this.container.appendChild(this.overlay);
  }

  /* ─── Input binding ─── */
  bindInput(){
    this._onKey=this._onKey.bind(this);
    document.addEventListener('keydown',this._onKey);
  }

  _onKey(e){
    if(!this.overlay||!this.overlay.classList.contains('active'))return;

    // Advance / confirm
    if(e.code==='Enter'||e.code==='Space'||e.code==='KeyZ'||e.code==='KeyJ'||e.code==='KeyF'){
      e.preventDefault();
      if(this.isTyping){
        this.skipTyping();
      }else if(this.canAdvance){
        this.advance();
      }
    }

    // Choice navigation
    if(this.choicesEl.style.display!=='none'){
      if(e.code==='ArrowUp'||e.code==='ArrowLeft'){
        e.preventDefault();
        this.navigateChoice(-1);
      }else if(e.code==='ArrowDown'||e.code==='ArrowRight'){
        e.preventDefault();
        this.navigateChoice(1);
      }
    }

    // Skip all (hold Escape)
    if(e.code==='Escape'){
      this.close();
    }
  }

  /* ─── Show a single line or a queue of lines ─── */
  show(data){
    this.build();
    this.overlay.classList.add('active');

    if(Array.isArray(data)){
      this.currentQueue=data;
      this.queueIndex=0;
      this.displayEntry(this.currentQueue[0]);
    }else{
      this.currentQueue=[data];
      this.queueIndex=0;
      this.displayEntry(data);
    }
  }

  /* ─── Display one dialogue entry ─── */
  displayEntry(entry){
    this.canAdvance=false;
    this.promptEl.style.display='none';
    this.choicesEl.style.display='none';

    // Speaker
    if(entry.speaker){
      this.speakerEl.style.display='inline-flex';
      this.speakerEl.textContent=entry.speaker;
      this.speakerEl.className='sbDialogueSpeaker '+(entry.speakerClass||'neutral');
      if(entry.speakerIcon){
        this.speakerEl.innerHTML=`<span class="sbDialogueSpeakerIcon" style="background:url(${entry.speakerIcon}) center/cover"></span><span>${entry.speaker}</span>`;
      }
    }else{
      this.speakerEl.style.display='none';
    }

    // Tail direction
    if(entry.tail){
      this.tailEl.className='sbDialogueTail '+entry.tail;
      this.tailEl.style.display='block';
    }else{
      this.tailEl.style.display='none';
    }

    // Portrait
    if(entry.portrait){
      this.portraitEl.style.display='block';
      this.portraitEl.innerHTML=`<img src="${entry.portrait}" alt="${entry.speaker||''}">`;
    }else{
      this.portraitEl.style.display='none';
    }

    // Text
    this.textEl.textContent='';
    this.textEl.classList.add('typing');
    this.isTyping=true;

    const text=entry.text||'';
    let i=0;
    this.typingTimer=setInterval(()=>{
      if(i>=text.length){
        this.finishTyping();
        return;
      }
      this.textEl.textContent+=text.charAt(i);
      i++;
    },this.typeSpeed);

    // Choices (if any)
    if(entry.choices&&entry.choices.length>0){
      this.renderChoices(entry.choices);
    }
  }

  /* ─── Finish typing immediately ─── */
  skipTyping(){
    if(!this.isTyping)return;
    clearInterval(this.typingTimer);
    const entry=this.currentQueue[this.queueIndex];
    this.textEl.textContent=entry.text||'';
    this.finishTyping();
  }

  finishTyping(){
    this.isTyping=false;
    this.textEl.classList.remove('typing');
    clearInterval(this.typingTimer);

    const entry=this.currentQueue[this.queueIndex];

    if(entry.choices&&entry.choices.length>0){
      this.canAdvance=false;
      this.promptEl.style.display='none';
      this.choicesEl.style.display='grid';
      this.choiceIndex=0;
      this.updateChoiceSelection();
    }else{
      this.canAdvance=true;
      this.promptEl.style.display='flex';

      // Auto-advance if configured
      if(entry.autoAdvance){
        this.advanceTimer=setTimeout(()=>this.advance(),this.autoAdvanceDelay);
      }
    }
  }

  /* ─── Render choice buttons ─── */
  renderChoices(choices){
    this.choicesEl.innerHTML='';
    choices.forEach((choice,index)=>{
      const btn=document.createElement('button');
      btn.className='sbDialogueChoice';
      btn.dataset.index=index;
      btn.innerHTML=`<span class="sbChoiceMarker"></span><span>${choice.text}</span>`;
      btn.addEventListener('click',()=>this.selectChoice(index));
      this.choicesEl.appendChild(btn);
    });
    this.choiceIndex=0;
    this.updateChoiceSelection();
  }

  navigateChoice(dir){
    const choices=this.choicesEl.querySelectorAll('.sbDialogueChoice');
    if(!choices.length)return;
    this.choiceIndex=(this.choiceIndex+dir+choices.length)%choices.length;
    this.updateChoiceSelection();
    choices[this.choiceIndex].focus();
  }

  updateChoiceSelection(){
    const choices=this.choicesEl.querySelectorAll('.sbDialogueChoice');
    choices.forEach((c,i)=>c.classList.toggle('selected',i===this.choiceIndex));
  }

  selectChoice(index){
    const entry=this.currentQueue[this.queueIndex];
    const choice=entry.choices[index];
    this.onChoice({entry,choice,index});
    this.advance();
  }

  /* ─── Advance to next line or close ─── */
  advance(){
    clearTimeout(this.advanceTimer);
    this.queueIndex++;
    if(this.queueIndex<this.currentQueue.length){
      this.displayEntry(this.currentQueue[this.queueIndex]);
    }else{
      this.close();
    }
  }

  /* ─── Close dialogue ─── */
  close(){
    clearInterval(this.typingTimer);
    clearTimeout(this.advanceTimer);
    if(this.box){
      this.box.classList.add('exit');
      setTimeout(()=>{
        if(this.overlay){
          this.overlay.classList.remove('active');
          this.box.classList.remove('exit');
        }
        this.onComplete();
      },220);
    }
  }

  /* ─── Destroy and clean up ─── */
  destroy(){
    this.close();
    document.removeEventListener('keydown',this._onKey);
    if(this.overlay){
      this.overlay.remove();
      this.overlay=null;
      this.box=null;
      this.textEl=null;
      this.speakerEl=null;
      this.tailEl=null;
      this.promptEl=null;
      this.choicesEl=null;
      this.portraitEl=null;
    }
  }

  /* ─── Quick static method for one-off messages ─── */
  static say(text,speaker,options={}){
    const dia=new SonicBattleDialogue(options);
    dia.show({text,speaker,...options});
    return dia;
  }
}

/* ═══════════════════════════════════════════════════════════════
   EXAMPLE USAGE:
   ═══════════════════════════════════════════════════════════════

   import {SonicBattleDialogue} from './sonic-battle-dialogue.js';

   const dialogue = new SonicBattleDialogue({
     onComplete: () => console.log('Dialogue finished'),
     onChoice: ({choice}) => console.log('Picked:', choice.text),
     typeSpeed: 24
   });

   dialogue.show([
     {
       speaker: 'Rrvvfo',
       speakerClass: 'p1',
       text: "You think you can take me? I've been training for this moment!",
       tail: 'down',
       portrait: 'assets/portraits/rrvvfo.png'
     },
     {
       speaker: 'Revvfo',
       speakerClass: 'p2',
       text: "Heh... let's see if your flames can match my blade.",
       tail: 'down',
       portrait: 'assets/portraits/revvfo.png'
     },
     {
       speaker: 'System',
       speakerClass: 'neutral',
       text: "Choose your response:",
       choices: [
         {text: "I'll burn you to ash!", value: 'aggressive'},
         {text: "Let's settle this fair.", value: 'neutral'},
         {text: "... (Say nothing)", value: 'silent'}
       ]
     }
   ]);

   ═══════════════════════════════════════════════════════════════ */
