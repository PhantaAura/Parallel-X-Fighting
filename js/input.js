export const CONTROL_MAPS=[
  {l:'KeyA',r:'KeyD',j:'KeyW',b:'KeyS',a:'KeyF',h:'KeyR',x:'KeyT',s:'KeyG',u:'KeyH',d:'KeyQ',c:'KeyE'},
  {l:'ArrowLeft',r:'ArrowRight',j:'ArrowUp',b:'ArrowDown',a:'KeyJ',h:'KeyI',x:'KeyU',s:'KeyK',u:'KeyL',d:'KeyO',c:'Semicolon'}
];

export class InputManager{
  constructor(getGamepads=()=>navigator.getGamepads?.()||[]){
    this.keyboard={};this.controller={};this.touch={};this.current={};this.pressed={};this.previous={};this.queued={};this.getGamepads=getGamepads;
  }
  setKeyboard(code,down){if(down&&!this.keyboard[code])this.queued[code]=true;this.keyboard[code]=!!down}
  setTouch(code,down){if(down&&!this.touch[code])this.queued[code]=true;this.touch[code]=!!down}
  poll(){
    const nextController={};
    [...(this.getGamepads()||[])].forEach((pad,i)=>{
      if(!pad||i>1)return;
      const m=CONTROL_MAPS[i],set=(key,value)=>{nextController[key]=!!value};
      set(m.l,pad.axes?.[0]<-.35||pad.buttons?.[14]?.pressed);set(m.r,pad.axes?.[0]>.35||pad.buttons?.[15]?.pressed);set(m.b,pad.buttons?.[6]?.pressed||pad.buttons?.[13]?.pressed);
      [[0,m.a],[1,m.h],[2,m.x],[3,m.s],[4,m.u],[5,m.d],[7,m.j],[10,m.c]].forEach(([button,key])=>set(key,pad.buttons?.[button]?.pressed));
    });
    this.controller=nextController;
    const all=new Set([...Object.keys(this.keyboard),...Object.keys(this.controller),...Object.keys(this.touch),...Object.keys(this.previous)]);
    this.pressed={};this.current={};
    for(const key of all){const down=!!(this.keyboard[key]||this.controller[key]||this.touch[key]);this.current[key]=down;if(this.queued[key]||(down&&!this.previous[key]))this.pressed[key]=true}
    this.queued={};
    this.previous={...this.current};
  }
  down(code){return!!this.current[code]}
  consume(code){if(!this.pressed[code])return false;delete this.pressed[code];return true}
  suppress(map){for(const key of Object.values(map)){this.current[key]=false;delete this.pressed[key]}}
  clear(){this.keyboard={};this.controller={};this.touch={};this.current={};this.pressed={};this.previous={};this.queued={}}
}
