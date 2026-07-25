export const CONTROL_MAPS = [
  {l:'KeyA',r:'KeyD',j:'KeyW',b:'KeyS',a:'KeyF',s:'KeyG',u:'KeyH',d:'KeyQ'},
  {l:'ArrowLeft',r:'ArrowRight',j:'ArrowUp',b:'ArrowDown',a:'KeyJ',s:'KeyK',u:'KeyL',d:'KeyO'}
];

export function pollGamepads(keys, pressed) {
  const pads=navigator.getGamepads?navigator.getGamepads():[];
  pads.forEach((pad,i)=>{
    if(!pad||i>1)return;
    const m=CONTROL_MAPS[i],left=pad.axes[0]<-.35||pad.buttons[14]?.pressed,right=pad.axes[0]>.35||pad.buttons[15]?.pressed;
    keys[m.l]=!!left;keys[m.r]=!!right;keys[m.b]=!!(pad.buttons[6]?.pressed||pad.buttons[13]?.pressed);
    [[0,m.a],[2,m.s],[3,m.u],[1,m.j],[5,m.d]].forEach(([bi,k])=>{const down=!!pad.buttons[bi]?.pressed;if(down&&!keys[k])pressed[k]=1;keys[k]=down});
  });
}

