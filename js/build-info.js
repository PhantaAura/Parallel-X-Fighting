export const BUILD_VERSION='Prototype 2.9A.40.9 — Story Event Reliability';
export const SAVE_SCHEMA_VERSION=268;
export const BUILD_CACHE='29a409-wade-race-events-20261122';

// Recovery modules are dynamically loaded after build-info finishes evaluating.
// This avoids circular-import hazards while keeping the 40.7.1 cumulative base intact.
if(typeof window!=='undefined'){
  queueMicrotask(()=>{
    import('./story/chapter1-adventure-runtime.js?v=29a409-wade-race-events-20261122').catch(error=>console.error('[PX 40.9 Chapter 1]',error));
    import('./story/mobile-playtest-lab.js?v=29a409-wade-race-events-20261122').catch(error=>console.error('[PX 40.9 Playtest Lab]',error));
  });
}
