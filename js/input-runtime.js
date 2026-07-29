import {InputManager} from './input.js?v=29a10-living-tournament-hub-20260729';

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
