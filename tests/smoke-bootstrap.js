const RELEASE_CACHE_ID='29a4072r-ch1-adventure-playtestlab-20260802';
const EXPECTED_BUILD='Prototype 2.9A.40.7.1 — Chapter 3 Sabotage Investigation Rewrite';
const TOTAL_TESTS=482;
const IMPORT_TIMEOUT_MS=600000;
const STALL_TIMEOUT_MS=35000;

const $=id=>document.getElementById(id);
const elements={status:$('runStatus'),elapsed:$('elapsedTime'),current:$('currentTest'),last:$('lastCompleted'),progress:$('smokeProgress'),progressText:$('progressText'),counts:$('counts'),results:$('results'),warning:$('mixedBuildWarning'),retry:$('retryFailed'),again:$('runAgain'),copy:$('copyResults')};
const state={startedAt:performance.now(),lastProgressAt:performance.now(),running:true,total:TOTAL_TESTS,completed:0,passed:0,failed:0,lines:new Map(),runner:null,fatal:false};

const formatTime=ms=>`${(ms/1000).toFixed(1)}s`;
const errorText=error=>error?.stack||error?.message||String(error||'Unknown startup failure');
function touchProgress(){state.lastProgressAt=performance.now()}
function setStatus(text,className=''){elements.status.textContent=text;elements.status.className=className}
function renderLines(){
  const lines=[...state.lines.values()];
  elements.results.textContent=lines.length?lines.join('\n'):'No test results yet.';
  elements.results.scrollTop=elements.results.scrollHeight;
}
function refreshCounts(){
  elements.progress.max=Math.max(1,state.total);elements.progress.value=state.completed;
  elements.progressText.textContent=`${state.completed} / ${state.total}`;
  elements.counts.textContent=`${state.passed} / ${state.failed}`;
}
function setButtons(enabled){elements.retry.disabled=!enabled||state.failed===0;elements.again.disabled=!enabled;elements.copy.disabled=!enabled||state.lines.size===0}
function fatal(error,phase='Startup failure'){
  state.fatal=true;state.running=false;setStatus(phase,'failText');elements.current.textContent=error?.code==='PX_SMOKE_TIMEOUT'?'Timed-out test stopped the suite — reload before testing again':'Runner stopped before completing';
  state.lines.set('__fatal__',`FATAL  ${errorText(error)}`);elements.results.classList.add('fatal');renderLines();elements.retry.disabled=true;elements.again.disabled=false;elements.copy.disabled=state.lines.size===0;touchProgress();
}

const harness={
  beginRun({label,total}){state.running=true;state.fatal=false;state.startedAt=performance.now();state.lastProgressAt=performance.now();state.completed=0;state.passed=0;state.failed=0;state.total=total||TOTAL_TESTS;setStatus(label||'Running…');elements.current.textContent='Preparing first test';elements.last.textContent='None in this run';setButtons(false);refreshCounts()},
  testStarted({name,index,total}){state.running=true;state.total=total||state.total;elements.current.textContent=`${index}. ${name}`;setStatus('Running…');touchProgress();refreshCounts()},
  testFinished({result,index,total}){state.completed=index;state.total=total||state.total;if(result.pass)state.passed++;else state.failed++;elements.last.textContent=`${result.pass?'PASS':'FAIL'} — ${result.name}`;state.lines.set(result.name,`${result.pass?'PASS':'FAIL'}  ${result.name}${result.error?` — ${result.error}`:''}`);renderLines();refreshCounts();touchProgress()},
  complete(summary,{label}={}){state.running=false;state.completed=summary.total;state.total=summary.total;state.passed=summary.passed;state.failed=summary.failed;elements.current.textContent='None';setStatus(summary.failed?`${label||'Complete'} with ${summary.failed} failure${summary.failed===1?'':'s'}`:`${label||'Complete'} — all tests passed`,summary.failed?'failText':'passText');refreshCounts();setButtons(true);touchProgress()},
  fatal,
  runnerReady(runner){state.runner=runner;setButtons(!state.running)},
};
globalThis.__PX_SMOKE_HARNESS__=harness;

async function fetchWithTimeout(url,timeoutMs=12000){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{return await fetch(url,{cache:'no-store',signal:controller.signal})}finally{clearTimeout(timer)}
}
async function verifyActiveBuild(){
  try{
    const [buildResponse,indexResponse]=await Promise.all([
      fetchWithTimeout(`../js/build-info.js?v=${RELEASE_CACHE_ID}`),
      fetchWithTimeout(`../index.html?v=${RELEASE_CACHE_ID}`)
    ]);
    const buildText=await buildResponse.text(),indexText=await indexResponse.text();
    const buildOk=buildText.includes(EXPECTED_BUILD),cacheOk=indexText.includes(RELEASE_CACHE_ID);
    if(!buildOk||!cacheOk){
      elements.warning.style.display='block';
      elements.warning.textContent=`Mixed build detected: expected ${EXPECTED_BUILD} and cache ${RELEASE_CACHE_ID}. GitHub Pages or Safari may still be serving older files.`;
    }
  }catch(error){
    elements.warning.style.display='block';elements.warning.textContent=`Build verification could not finish: ${errorText(error)}`;
  }
}

setInterval(()=>{
  elements.elapsed.textContent=formatTime(performance.now()-state.startedAt);
  if(state.running&&!state.fatal&&performance.now()-state.lastProgressAt>STALL_TIMEOUT_MS){
    setStatus('Stalled — current test exceeded the progress watchdog','warnText');
    state.lines.set('__stall__',`STALLED  ${elements.current.textContent} — no progress for ${Math.round(STALL_TIMEOUT_MS/1000)} seconds`);renderLines();touchProgress();
  }
},250);

addEventListener('error',event=>{if(!state.fatal)fatal(event.error||event.message,'Script error')});
addEventListener('unhandledrejection',event=>{if(!state.fatal)fatal(event.reason,'Unhandled promise rejection')});
elements.retry.addEventListener('click',()=>state.runner?.rerunFailed());
elements.again.addEventListener('click',()=>state.runner?state.runner.rerunAll():location.reload());
elements.copy.addEventListener('click',async()=>{
  const summary=`${EXPECTED_BUILD}
Release cache: ${RELEASE_CACHE_ID}

${elements.results.textContent}

${state.passed}/${state.total} passing`;
  try{await navigator.clipboard.writeText(summary);elements.copy.textContent='Copied';setTimeout(()=>elements.copy.textContent='Copy Results',1200)}catch{elements.copy.textContent='Copy failed';setTimeout(()=>elements.copy.textContent='Copy Results',1200)}
});

await verifyActiveBuild();
harness.beginRun({label:'Loading test modules…',total:TOTAL_TESTS});
try{
  let timer;
  const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(`Smoke module startup exceeded ${IMPORT_TIMEOUT_MS/1000} seconds`)),IMPORT_TIMEOUT_MS)});
  await Promise.race([import(`./smoke.js?v=${RELEASE_CACHE_ID}`),timeout]);
  clearTimeout(timer);
}catch(error){fatal(error,'Module startup failed')}
