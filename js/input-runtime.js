import {InputManager} from './input.js?v=29a363-chapter4-menu-state-recovery-20260801';

/**
 * The single semantic input runtime used by 2-D combat, Training, Arena, and
 * Story.  UI layers may present different controls, but all gameplay reads
 * this same buffered action state and controller profile.
 */
export const sharedInput=new InputManager();

export function sharedInputProfile(side=1){
  const device=sharedInput.lastInputDevice[side-1]||'keyboard';
  return{
    side,
    device,
    style:sharedInput.getControllerStyle(side),
    name:sharedInput.inputStyleName(side,device),
    mapping:sharedInput.controllerMapping(side)
  };
}
