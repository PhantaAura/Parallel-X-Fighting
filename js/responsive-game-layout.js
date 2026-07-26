export const LOGICAL_GAME_WIDTH=960;
export const LOGICAL_GAME_HEIGHT=540;
export const LOGICAL_GAME_ASPECT=LOGICAL_GAME_WIDTH/LOGICAL_GAME_HEIGHT;

export function classifyDisplay(width,height,{touch=false,tablet=false}={}){
  const safeWidth=Math.max(1,Number(width)||1),safeHeight=Math.max(1,Number(height)||1),aspect=safeWidth/safeHeight;
  if(tablet)return'tablet';if(aspect>=2.25)return'ultrawide';if(touch&&aspect>=1.55)return'mobile-landscape';if(aspect>=1.7)return'widescreen';if(aspect<1)return'portrait';return'narrow';
}

export function calculateResponsiveLayout({width,height,safeLeft=0,safeRight=0,safeTop=0,safeBottom=0,touch=false,tablet=false,desktopHotbar=false}={}){
  const availableWidth=Math.max(1,width-safeLeft-safeRight),availableHeight=Math.max(1,height-safeTop-safeBottom),profile=classifyDisplay(availableWidth,availableHeight,{touch,tablet});
  const reserveBottom=touch&&profile!=='portrait'?Math.min(118,availableHeight*.28):desktopHotbar?Math.min(112,availableHeight*.18):0;
  const stageHeight=Math.max(1,availableHeight-reserveBottom),displayWidth=Math.min(availableWidth,stageHeight*LOGICAL_GAME_ASPECT),displayHeight=displayWidth/LOGICAL_GAME_ASPECT;
  return{profile,availableWidth,availableHeight,displayWidth,displayHeight,reserveBottom,letterboxX:Math.max(0,(availableWidth-displayWidth)/2),logicalWidth:LOGICAL_GAME_WIDTH,logicalHeight:LOGICAL_GAME_HEIGHT,scale:displayWidth/LOGICAL_GAME_WIDTH,stretched:false};
}

export function controlsOverlap(a,b,padding=4){if(!a||!b)return false;return!(a.right+padding<=b.left||b.right+padding<=a.left||a.bottom+padding<=b.top||b.bottom+padding<=a.top)}

export class ResponsiveGameLayout{
  constructor({doc=globalThis.document,view=globalThis.window,gameScreen,gameWrap,canvas,touchRoot,platform=()=>({touch:false,tablet:false}),onLayout=()=>{}}={}){this.doc=doc;this.view=view;this.gameScreen=gameScreen;this.gameWrap=gameWrap;this.canvas=canvas;this.touchRoot=touchRoot;this.platform=platform;this.onLayout=onLayout;this.current=null}
  apply(metrics={width:this.view?.visualViewport?.width||this.view?.innerWidth||960,height:this.view?.visualViewport?.height||this.view?.innerHeight||540}){
    const info=this.platform()||{},layout=calculateResponsiveLayout({...metrics,touch:!!info.touch,tablet:!!info.tablet,desktopHotbar:!!info.desktopHotbar});this.current=layout;
    const root=this.doc?.documentElement;root?.style?.setProperty('--game-display-width',`${layout.displayWidth}px`);root?.style?.setProperty('--game-display-height',`${layout.displayHeight}px`);root?.style?.setProperty('--hotbar-reserve',`${layout.reserveBottom}px`);if(root)root.dataset.gameLayout=layout.profile;
    if(this.gameWrap){this.gameWrap.style.width=`min(100%, ${layout.displayWidth}px)`;this.gameWrap.style.aspectRatio=`${LOGICAL_GAME_WIDTH} / ${LOGICAL_GAME_HEIGHT}`}
    if(this.canvas){this.canvas.style.width='100%';this.canvas.style.height='100%';this.canvas.style.objectFit='contain'}
    this.touchRoot?.setAttribute?.('data-layout-profile',layout.profile);this.onLayout(layout);return layout;
  }
}
