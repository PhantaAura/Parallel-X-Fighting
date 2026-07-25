export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export const COMBO_RESET_FRAMES=48,JUGGLE_LIMIT=6;
export const ATTACKS={light:{kind:'light',damage:6.5,startup:4,recovery:13,hitstun:16,range:44,knockback:5,energyGain:7},heavy:{kind:'heavy',damage:12,startup:12,recovery:28,hitstun:24,range:58,knockback:11,energyGain:10},launcher:{kind:'launcher',damage:9,startup:15,recovery:30,hitstun:30,range:50,knockback:4,launch:12,energyGain:9},air:{kind:'air',damage:6,startup:5,recovery:14,hitstun:18,range:48,knockback:5,launch:3,energyGain:6}};
export function scaledDamage(base,hit,kind='light'){const floor=kind==='ultimate'?.55:kind==='special'?.35:.22;return Math.max(1,base*Math.max(floor,1-Math.max(0,hit-1)*.1))}
export function createComboState(){return{hits:0,damage:0,scale:1,timer:0,attacker:null,juggles:0}}
export function resetCombo(combo){Object.assign(combo,createComboState())}
