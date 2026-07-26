import {isPortraitViewport} from './mobile-safe-area.js';

export const MOBILE_PRESENTATION_KEY='pxMobilePresentationV1';
export function createMobilePresentationSettings(stored={}){return{version:1,portraitPrompt:stored.portraitPrompt==='never'?'never':'show',fullscreenPrompt:stored.fullscreenPrompt==='never'?'never':'ask',homeScreenHint:stored.homeScreenHint!==false}}
export function loadMobilePresentationSettings(storage=globalThis.localStorage){try{return createMobilePresentationSettings(JSON.parse(storage?.getItem?.(MOBILE_PRESENTATION_KEY)||'{}'))}catch{return createMobilePresentationSettings()}}
export function saveMobilePresentationSettings(settings,storage=globalThis.localStorage){try{storage?.setItem?.(MOBILE_PRESENTATION_KEY,JSON.stringify(createMobilePresentationSettings(settings)));return true}catch{return false}}
export const shouldRecommendPortrait=(touch,portrait,preference='show')=>!!touch&&!!portrait&&preference!=='never';

export class OrientationManager{
  constructor({root,view=globalThis.window,settings,onChange=()=>{},onLayout=()=>{},onNotice=()=>{},onPrompt=()=>{},onDismiss=()=>{}}={}){this.root=root;this.view=view;this.settings=settings;this.onChange=onChange;this.onLayout=onLayout;this.onNotice=onNotice;this.onPrompt=onPrompt;this.onDismiss=onDismiss;this.active=false;this.dismissed=false;this.bind()}
  bind(){this.root?.querySelector?.('[data-orientation-rotate]')?.addEventListener('click',()=>this.requestLandscape());this.root?.querySelector?.('[data-orientation-continue]')?.addEventListener('click',()=>this.finish());this.root?.querySelector?.('[data-orientation-never]')?.addEventListener('click',()=>{this.settings.portraitPrompt='never';this.onChange(this.settings);this.finish()})}
  start({touch=false}={}){this.active=!!touch;this.dismissed=false;if(shouldRecommendPortrait(touch,isPortraitViewport(this.view),this.settings.portraitPrompt))this.show();else this.hide()}
  stop(){this.active=false;this.hide()}
  show(){this.root?.classList?.remove('hidden');this.onPrompt()}
  hide(){this.root?.classList?.add('hidden')}
  finish(){this.hide();if(!this.dismissed){this.dismissed=true;this.onDismiss()}}
  handleChange(metrics){this.onLayout(metrics);if(!this.active)return;if(!isPortraitViewport(this.view))this.finish();else if(this.settings.portraitPrompt!=='never'&&!this.dismissed)this.show()}
  async requestLandscape(){try{await this.view?.screen?.orientation?.lock?.('landscape');this.finish();return true}catch{this.onNotice('Rotate your device manually. Portrait play remains available.');this.finish();return false}}
}
