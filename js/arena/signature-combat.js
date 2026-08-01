export const SIGNATURE_COMBAT_PROFILES=Object.freeze({
  rrvvfo:Object.freeze({id:'rrvvfo',label:'IMPROVISED ANGLE',event:'signatureRrvvfo',color:'#ffb24f',detail:'Object Swap into a clean close-range hit.',reward:Object.freeze({energy:5,momentum:8})}),
  revvfo:Object.freeze({id:'revvfo',label:'RELENTLESS PRESSURE',event:'signatureRevvfo',color:'#c56cff',detail:'Three close connected actions before pressure expires.',reward:Object.freeze({momentum:10,cooldownReduction:.25})}),
  wade:Object.freeze({id:'wade',label:'LIGHTNING NEAR-MISS',event:'signatureWade',color:'#8ff3ff',detail:'Dash through an active strike without being hit.',reward:Object.freeze({energy:7,momentum:9})}),
  bark:Object.freeze({id:'bark',label:'ARMORED PUNISH',event:'signatureBark',color:'#e0b76d',detail:'Absorb a hit with armor, then answer before the window closes.',reward:Object.freeze({guard:6,momentum:12})}),
  default:Object.freeze({id:'default',label:'SIGNATURE MOMENT',event:'signatureMoment',color:'#ffffff',detail:'Use the fighter identity mechanic.',reward:Object.freeze({})})
});

export function signatureProfileFor(id){return SIGNATURE_COMBAT_PROFILES[id]||SIGNATURE_COMBAT_PROFILES.default}
export function signatureMeleeKind(kind=''){return ['light1','light2','light3','heavy','launcher','airLight','airHeavy','pursuitLight','pursuitHeavy'].includes(kind)}
export function finalKoImpactFor(id='default',kind='light'){
  const profile=signatureProfileFor(id),strong=['heavy','launcher','airHeavy','pursuitHeavy','ultimate'].includes(kind);
  const weight={rrvvfo:1.02,revvfo:1.08,wade:.94,bark:1.24}[id]||1;
  return Object.freeze({label:`FINAL K.O. • ${profile.label}`,color:profile.color,hitstopFrames:Math.round((strong?18:14)*weight),shake:(strong?18:14)*weight,burst:Math.round((strong?52:42)*weight),hold:strong?1.05:.9});
}
