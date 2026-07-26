export const PAUSE_ACTIONS=Object.freeze([
  {id:'resume',label:'RESUME'},
  {id:'moves',label:'MOVE LIST'},
  {id:'controls',label:'CONTROLS'},
  {id:'training',label:'TRAINING SETTINGS',trainingOnly:true},
  {id:'touch',label:'MOBILE CONTROLS',touchOnly:true},
  {id:'exitFullscreen',label:'EXIT FULLSCREEN',fullscreenOnly:true},
  {id:'restart',label:'RESTART MATCH'},
  {id:'character',label:'CHARACTER SELECT'},
  {id:'stage',label:'STAGE SELECT'},
  {id:'settings',label:'SETTINGS'},
  {id:'quit',label:'QUIT TO MODE SELECT'}
]);
export const simulationCanAdvance=(state,paused)=>state==='playing'&&!paused;
export const requiresRestartConfirmation=mode=>mode!=='training';

export class PauseMenu{
  constructor(root,{onAction=()=>{}}={}){this.root=root;this.onAction=onAction;this.owner=root?.querySelector('[data-pause-owner]');this.actions=root?.querySelector('[data-pause-actions]');this.actions?.addEventListener('click',event=>{const button=event.target.closest('[data-pause-action]');if(button)this.onAction(button.dataset.pauseAction)})}
  show({training=false,touch=false,fullscreen=false,owner=1,local=false}={}){if(!this.root)return;this.owner.textContent=local?`Paused by Player ${owner}`:'Combat paused';this.actions.innerHTML=PAUSE_ACTIONS.filter(action=>(!action.trainingOnly||training)&&(!action.touchOnly||touch)&&(!action.fullscreenOnly||fullscreen)).map((action,index)=>`<button class="${index?'secondary':'primary'}" data-pause-action="${action.id}">${action.label}</button>`).join('');this.root.classList.remove('hidden');this.actions.querySelector('button')?.focus()}
  hide(){this.root?.classList.add('hidden')}
  get visible(){return !!this.root&&!this.root.classList.contains('hidden')}
}
