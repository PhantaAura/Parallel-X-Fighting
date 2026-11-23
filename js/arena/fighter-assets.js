export const SPRITE_FIGHTER_IDS=new Set(['rrvvfo','revvfo','wade','bark','sage','jimmy','jonathan','raggie']);

// A fighter can change identity or be reset while its atlas is in flight.
// Share matching requests, and never let an older response overwrite a new actor.
export function bindFighterAsset(battle,fighter,id=fighter?.id,{force=false}={}){
  if(!fighter||!id||battle.disposed)return Promise.resolve(null);
  const expectedId=String(id);
  if(!force&&fighter.asset&&fighter.assetId===expectedId)return Promise.resolve(fighter.asset);
  if(!force&&fighter.assetPendingId===expectedId&&fighter.assetPendingPromise)return fighter.assetPendingPromise;
  if(fighter.assetId!==expectedId){fighter.asset=null;fighter.assetId=null}
  const token=(Number(fighter.assetLoadToken)||0)+1;
  fighter.assetLoadToken=token;fighter.assetPendingId=expectedId;
  const request=Promise.resolve().then(()=>battle.loadFighterAsset(expectedId)).then(asset=>{
    if(battle.disposed||fighter.assetLoadToken!==token||fighter.id!==expectedId)return null;
    fighter.asset=asset;fighter.assetId=asset?expectedId:null;
    fighter.assetRetryAt=asset?0:Date.now()+4000;
    return asset;
  }).catch(error=>{
    if(fighter.assetLoadToken===token)fighter.assetRetryAt=Date.now()+4000;
    console.warn('[Fighter atlas]',expectedId,error);return null;
  }).finally(()=>{
    if(fighter.assetLoadToken===token){fighter.assetPendingId=null;fighter.assetPendingPromise=null}
  });
  fighter.assetPendingPromise=request;
  return request;
}
