export const BUILD_VERSION='Prototype 2.9A.40.7.2R — Complete Chapter 1 Adventure Rebuild + Mobile Playtest Lab';
export const SAVE_SCHEMA_VERSION=268;
export const BUILD_CACHE='29a4072r-ch1-adventure-playtestlab-20260802';

// Recovery modules are dynamically loaded after build-info finishes evaluating.
// This avoids circular-import hazards while keeping the 40.7.1 cumulative base intact.
if(typeof window!=='undefined'){
  queueMicrotask(()=>{
    import('./story/chapter1-adventure-runtime.js?v=29a4072r-ch1-adventure-playtestlab-20260802').catch(error=>console.error('[PX 40.7.2R Chapter 1]',error));
    import('./story/mobile-playtest-lab.js?v=29a4072r-ch1-adventure-playtestlab-20260802').catch(error=>console.error('[PX 40.7.2R Playtest Lab]',error));
  });
}
