export const HINTS_DISMISSED_KEY='pxHintsDismissed';
const hints=[
  input=>`Open the Move List from Pause for ${input.inputStyleName(1)} controls.`,
  input=>`Block with ${input.actionLabel(1,'b')} just before impact for a Perfect Block.`,
  input=>`${input.actionLabel(1,'s')} performs a Grab and beats predictable guarding.`,
  input=>`${input.actionLabel(1,'x')} performs a Launcher.`,
  input=>`Hold ${input.actionLabel(1,'k')} while standing still to Charge energy.`,
  input=>`${input.actionLabel(1,'q')} performs a Combo Breaker while you are trapped in hitstun.`,
  input=>`${input.actionLabel(1,'c')} enters a short Counter stance.`,
  input=>input.lastInputDevice?.[0]==='controller'?`Use D-Pad Left/Right to select an ability, then ${input.actionLabel(1,'u',{device:'controller'})} to activate it.`:input.lastInputDevice?.[0]==='touch'?'Tap an ability on the hotbar to activate it.':`Press 1–5 to use an ability directly, or ${input.actionLabel(1,'u')} to activate the highlighted slot.`,
  ()=>'Rrvvfo’s Lens of Truth costs 60 energy and 25 HP, stopping at 1. Its warning is always truthful, but starts broad.',
  ()=>'Shots of Agony cannot be used while its four-clone volley remains active.'
];
export class FirstTimeHints{
  constructor({input,storage=globalThis.localStorage,enabled=()=>true}={}){this.input=input;this.storage=storage;this.enabled=enabled;this.index=0}
  next({combo=false,cinematic=false,clash=false}={}){if(!this.enabled()||this.storage?.getItem?.(HINTS_DISMISSED_KEY)==='1'||combo||cinematic||clash)return null;const hint=hints[this.index%hints.length](this.input);this.index++;return hint}
  dismiss(){this.storage?.setItem?.(HINTS_DISMISSED_KEY,'1')}
  reset(){this.storage?.removeItem?.(HINTS_DISMISSED_KEY);this.index=0}
}
