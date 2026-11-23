export const BUILD_VERSION='Parallels X • Version 2.9A.45';
export const SAVE_SCHEMA_VERSION=268;
export const BUILD_CACHE='29a417-adventure-presentation-20261122';

// Recovery modules are dynamically loaded after build-info finishes evaluating.
// This avoids circular-import hazards while keeping the 40.7.1 cumulative base intact.
if(typeof window!=='undefined'){
  queueMicrotask(()=>{
    import('./story/chapter1-adventure-runtime.js?v=29a417-adventure-presentation-20261122').catch(error=>console.error('[PX 40.12 Chapter 1]',error));
    import('./story/mobile-playtest-lab.js?v=29a417-adventure-presentation-20261122').catch(error=>console.error('[PX 40.12 Playtest Lab]',error));
  });
}
