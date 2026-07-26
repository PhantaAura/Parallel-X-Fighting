export function fullscreenSupported(doc=globalThis.document,element=doc?.documentElement){return typeof element?.requestFullscreen==='function'&&typeof doc?.exitFullscreen==='function'}

export class FullscreenManager{
  constructor({root,doc=globalThis.document,element=doc?.documentElement,settings,onChange=()=>{},onLayout=()=>{},onUnexpectedExit=()=>{},onNotice=()=>{},onDismiss=()=>{}}={}){this.root=root;this.doc=doc;this.element=element;this.settings=settings;this.onChange=onChange;this.onLayout=onLayout;this.onUnexpectedExit=onUnexpectedExit;this.onNotice=onNotice;this.onDismiss=onDismiss;this.activeMatch=false;this.explicitExit=false;this.prompted=false;this.bind()}
  bind(){this.root?.querySelector?.('[data-fullscreen-enter]')?.addEventListener('click',()=>this.enter());this.root?.querySelector?.('[data-fullscreen-not-now]')?.addEventListener('click',()=>this.finish());this.root?.querySelector?.('[data-fullscreen-always]')?.addEventListener('click',()=>{this.settings.fullscreenPrompt='ask';this.onChange(this.settings);this.finish()});this.root?.querySelector?.('[data-fullscreen-never]')?.addEventListener('click',()=>{this.settings.fullscreenPrompt='never';this.onChange(this.settings);this.finish()});this.doc?.addEventListener?.('fullscreenchange',()=>this.changed())}
  start({touch=false}={}){this.activeMatch=true;if(touch&&this.settings.fullscreenPrompt!=='never'&&!this.prompted&&!this.isFullscreen()){this.prompted=true;this.show()}else this.hide()}
  stop(){this.activeMatch=false;this.hide()}
  show(){const unsupported=this.root?.querySelector?.('[data-fullscreen-fallback]');if(unsupported)unsupported.classList.toggle('hidden',fullscreenSupported(this.doc,this.element));this.root?.classList?.remove('hidden')}
  hide(){this.root?.classList?.add('hidden')}
  finish(){this.hide();this.onDismiss()}
  isFullscreen(){return !!this.doc?.fullscreenElement}
  async enter(){this.hide();if(!fullscreenSupported(this.doc,this.element)){this.doc?.body?.classList?.add('fullscreen-fallback');this.onNotice('Fullscreen is unavailable here. Using the maximum safe browser viewport.');this.onLayout();this.onDismiss();return false}try{await this.element.requestFullscreen({navigationUI:'hide'});this.onLayout();return true}catch{this.onNotice('Fullscreen request was not accepted. The match will continue normally.');this.onLayout();return false}finally{this.onDismiss()}}
  async exit(){if(!this.isFullscreen())return false;this.explicitExit=true;try{await this.doc.exitFullscreen();return true}catch{this.explicitExit=false;return false}}
  changed(){const entered=this.isFullscreen();this.doc?.body?.classList?.toggle('game-fullscreen',entered);this.onLayout();if(!entered&&this.activeMatch){if(this.explicitExit)this.explicitExit=false;else{this.onUnexpectedExit();this.onNotice('Fullscreen closed. Match paused and layout restored.')}}}
}
