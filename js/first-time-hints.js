export const HINTS_DISMISSED_KEY='pxHintsDismissed';
const hints=[
  input=>`Open the Move List from Pause for ${input.inputStyleName(1)} controls.`,
  input=>`Block with ${input.actionLabel(1,'b')} just before impact for a Perfect Block.`,
  input=>`${input.actionLabel(1,'t')} performs a Throw.`,
  input=>`${input.actionLabel(1,'x')} performs a Launcher.`,
  input=>`${input.actionLabel(1,'k')} spends energy on a Combo Breaker.`,
  ()=>'Rrvvfo’s Lens of Truth costs 90 energy and sacrifices exactly 50 HP, stopping at 1.',
  ()=>'Shots of Agony cannot be used while its four-clone volley remains active.'
];
export class FirstTimeHints{
  constructor({input,storage=globalThis.localStorage,enabled=()=>true}={}){this.input=input;this.storage=storage;this.enabled=enabled;this.index=0}
  next({combo=false,cinematic=false,clash=false}={}){if(!this.enabled()||this.storage?.getItem?.(HINTS_DISMISSED_KEY)==='1'||combo||cinematic||clash)return null;const hint=hints[this.index%hints.length](this.input);this.index++;return hint}
  dismiss(){this.storage?.setItem?.(HINTS_DISMISSED_KEY,'1')}
  reset(){this.storage?.removeItem?.(HINTS_DISMISSED_KEY);this.index=0}
}
