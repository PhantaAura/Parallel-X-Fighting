let confirmRoot=null;
let pendingResolve=null;

function ensureConfirm(){
  if(confirmRoot&&document.body.contains(confirmRoot))return confirmRoot;
  confirmRoot=document.createElement('div');
  confirmRoot.className='storyConfirmOverlay';
  confirmRoot.hidden=true;
  confirmRoot.innerHTML=`
    <article class="storyConfirmCard" role="alertdialog" aria-modal="true" aria-labelledby="storyConfirmTitle">
      <small>STORY MODE</small>
      <h2 id="storyConfirmTitle" data-story-confirm-title>CONFIRM</h2>
      <p data-story-confirm-message></p>
      <div><button type="button" class="primary" data-story-confirm-accept>CONFIRM</button><button type="button" data-story-confirm-cancel>CANCEL</button></div>
    </article>`;
  document.body.appendChild(confirmRoot);
  confirmRoot.querySelector('[data-story-confirm-accept]').addEventListener('click',()=>resolveConfirm(true));
  confirmRoot.querySelector('[data-story-confirm-cancel]').addEventListener('click',()=>resolveConfirm(false));
  confirmRoot.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();resolveConfirm(false)}});
  return confirmRoot;
}

function resolveConfirm(value){
  if(!pendingResolve)return;
  const resolve=pendingResolve;pendingResolve=null;
  confirmRoot.hidden=true;
  resolve(Boolean(value));
}

export function storyConfirm({title='ARE YOU SURE?',message='',accept='CONFIRM',cancel='CANCEL',confirmLabel=null,cancelLabel=null}={}){
  const root=ensureConfirm();
  if(pendingResolve)resolveConfirm(false);
  root.querySelector('[data-story-confirm-title]').textContent=title;
  root.querySelector('[data-story-confirm-message]').textContent=message;
  root.querySelector('[data-story-confirm-accept]').textContent=confirmLabel||accept;
  root.querySelector('[data-story-confirm-cancel]').textContent=cancelLabel||cancel;
  root.hidden=false;
  return new Promise(resolve=>{
    pendingResolve=resolve;
    root.querySelector('[data-story-confirm-accept]').focus();
  });
}

export function showStoryStartupError(error,{onRetry=()=>location.reload(),onReturn=()=>{document.getElementById('mainMenuScreen')?.classList.remove('hidden')}}={}){
  document.getElementById('storyStartupError')?.remove();
  const root=document.createElement('section');
  root.id='storyStartupError';
  root.className='storyStartupError';
  root.innerHTML=`
    <article>
      <small>STORY MODE COULD NOT START</small>
      <h2>3D ARENA UNAVAILABLE</h2>
      <p>The browser could not create the WebGL arena. Try reloading, closing other graphics-heavy tabs, or enabling hardware acceleration.</p>
      <code>${String(error?.message||error||'Unknown WebGL error')}</code>
      <div><button type="button" class="primary" data-story-retry>RETRY</button><button type="button" data-story-return>RETURN TO STORY</button></div>
    </article>`;
  document.body.appendChild(root);
  root.querySelector('[data-story-retry]').addEventListener('click',()=>{root.remove();onRetry()});
  root.querySelector('[data-story-return]').addEventListener('click',()=>{root.remove();onReturn()});
  root.querySelector('[data-story-retry]').focus();
  return root;
}

export function requireLandscapeForStory({onReady=()=>{},message='Rotate your device to landscape to continue Story Mode.'}={}){
  const touch=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
  if(!touch||innerWidth>=innerHeight){onReady();return()=>{}}
  document.getElementById('storyLandscapeLock')?.remove();
  const root=document.createElement('section');
  root.id='storyLandscapeLock';
  root.className='storyLandscapeLock';
  root.innerHTML=`<article><div class="rotateIcon">↻</div><h2>ROTATE TO LANDSCAPE</h2><p>${message}</p></article>`;
  document.body.appendChild(root);
  const check=()=>{if(innerWidth>=innerHeight){removeEventListener('resize',check);removeEventListener('orientationchange',check);root.remove();onReady()}};
  addEventListener('resize',check);addEventListener('orientationchange',check);
  return()=>{removeEventListener('resize',check);removeEventListener('orientationchange',check);root.remove()};
}
