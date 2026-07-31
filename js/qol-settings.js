export const QOL_SETTINGS_KEY='pxQolSettingsV1';
export const SETTINGS_CATEGORIES=Object.freeze(['Gameplay','Controls','Touch Controls','Controller','Audio','Video','Accessibility','HUD','Ability Hotbar','Save Data','Developer']);

export const DEFAULT_QOL_SETTINGS=Object.freeze({
  version:1,
  gameplay:{combatMessages:'full',pursuitPrompts:'full',firstTimeHints:true,holdConfirm:true,quickRestartKey:'Backspace',hubCamera:'drag',hubCameraSensitivity:1},
  audio:{master:80,music:65,sfx:85,ui:75,voice:80,mute:false},
  video:{quality:'automatic',particleScale:1,afterimages:4,backgroundMotion:'full',distortion:true,shadows:true,fireQuality:'full',ultimateQuality:'full',spriteSmoothing:true,resolutionScale:1},
  accessibility:{cameraShake:'full',impactFreeze:'full',screenFlash:'full',hitFlash:'full',backgroundMotion:'full',ultimateEffects:'full',lensOverlay:'standard',highContrastHud:false,largerHudText:false,strongOutlines:false,playerLabels:true,colorIndependentIcons:true,simplifiedBackground:false,clashInput:'repeated',holdInsteadOfMash:false,inputBufferDisplay:false},
  hud:{mode:'full'},
  hotbar:{desktop:'full',text:'full',size:'medium',customScale:1,cooldown:'both',activation:'tap',opacity:.92,locked:true,pauseForInfo:false},
  menu:{skipAnimations:false,reducedMotion:false,showQuickContinue:true},
  developer:{fps:false}
});

const enumValue=(value,allowed,fallback)=>allowed.includes(value)?value:fallback;
const numberValue=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
const bool=(value,fallback=false)=>typeof value==='boolean'?value:fallback;
const copy=()=>JSON.parse(JSON.stringify(DEFAULT_QOL_SETTINGS));

export function sanitizeQolSettings(value={}){
  const next=copy(),source=value&&typeof value==='object'?value:{};
  next.gameplay={...next.gameplay,...source.gameplay,combatMessages:enumValue(source.gameplay?.combatMessages,['full','important','off'],'full'),pursuitPrompts:enumValue(source.gameplay?.pursuitPrompts,['full','minimal','off'],'full'),firstTimeHints:bool(source.gameplay?.firstTimeHints,true),holdConfirm:bool(source.gameplay?.holdConfirm,true),hubCamera:enumValue(source.gameplay?.hubCamera,['drag','off'],'drag'),hubCameraSensitivity:numberValue(source.gameplay?.hubCameraSensitivity,.4,1.6,1)};
  for(const key of ['master','music','sfx','ui','voice'])next.audio[key]=numberValue(source.audio?.[key],0,100,next.audio[key]);next.audio.mute=bool(source.audio?.mute,false);
  next.video={...next.video,...source.video,quality:enumValue(source.video?.quality,['low','medium','high','automatic'],'automatic'),backgroundMotion:enumValue(source.video?.backgroundMotion,['full','reduced','off'],'full'),particleScale:numberValue(source.video?.particleScale,.25,1.5,1),afterimages:numberValue(source.video?.afterimages,0,8,4),resolutionScale:numberValue(source.video?.resolutionScale,.6,1,1)};
  next.accessibility={...next.accessibility,...source.accessibility,cameraShake:enumValue(source.accessibility?.cameraShake,['full','reduced','off'],'full'),impactFreeze:enumValue(source.accessibility?.impactFreeze,['full','reduced','off'],'full'),screenFlash:enumValue(source.accessibility?.screenFlash,['full','reduced','off'],'full'),hitFlash:enumValue(source.accessibility?.hitFlash,['full','reduced','off'],'full'),backgroundMotion:enumValue(source.accessibility?.backgroundMotion,['full','reduced','off'],'full'),ultimateEffects:enumValue(source.accessibility?.ultimateEffects,['full','reduced'],'full'),lensOverlay:enumValue(source.accessibility?.lensOverlay,['standard','reduced'],'standard'),clashInput:enumValue(source.accessibility?.clashInput,['repeated','timed','hold'],'repeated')};
  for(const key of ['highContrastHud','largerHudText','strongOutlines','playerLabels','colorIndependentIcons','simplifiedBackground','holdInsteadOfMash','inputBufferDisplay'])next.accessibility[key]=bool(source.accessibility?.[key],next.accessibility[key]);
  next.hud.mode=enumValue(source.hud?.mode,['full','compact','minimal','auto'],'full');
  next.hotbar={...next.hotbar,...source.hotbar,desktop:enumValue(source.hotbar?.desktop,['full','compact','cooldowns','hidden'],'full'),text:enumValue(source.hotbar?.text,['full','short','icons'],'full'),size:enumValue(source.hotbar?.size,['small','medium','large','custom'],'medium'),customScale:numberValue(source.hotbar?.customScale,.7,1.45,1),cooldown:enumValue(source.hotbar?.cooldown,['number','fill','both'],'both'),activation:enumValue(source.hotbar?.activation,['tap','double','confirm-ultimate'],'tap'),opacity:numberValue(source.hotbar?.opacity,.35,1,.92),locked:bool(source.hotbar?.locked,true),pauseForInfo:bool(source.hotbar?.pauseForInfo,false)};
  next.menu={...next.menu,...source.menu,skipAnimations:bool(source.menu?.skipAnimations,false),reducedMotion:bool(source.menu?.reducedMotion,false),showQuickContinue:bool(source.menu?.showQuickContinue,true)};
  next.developer.fps=bool(source.developer?.fps,false);return next;
}

export function loadQolSettings(storage=globalThis.localStorage){try{return sanitizeQolSettings(JSON.parse(storage?.getItem(QOL_SETTINGS_KEY)||'{}'))}catch{return copy()}}
export function saveQolSettings(settings,storage=globalThis.localStorage){try{storage?.setItem(QOL_SETTINGS_KEY,JSON.stringify(sanitizeQolSettings(settings)));return true}catch{return false}}
export function categoryDefaults(category){const key=String(category).toLowerCase().replaceAll(' ','');const map={gameplay:'gameplay',audio:'audio',video:'video',accessibility:'accessibility',hud:'hud',abilityhotbar:'hotbar',developer:'developer'};return map[key]?JSON.parse(JSON.stringify(DEFAULT_QOL_SETTINGS[map[key]])):null}
