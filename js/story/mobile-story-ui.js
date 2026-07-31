const OBJECTIVE_CONFIGS=Object.freeze([
  {root:'#rrvvfoRoadHubUI',card:'.roadObjective'},
  {root:'#rrvvfoMission2UI',card:'.chapter2Objective'},
  {root:'#rrvvfoChapter3PreviewUI',card:'.c3Objective'},
  {root:'#rrvvfoChapter4UI',card:'.c4Objective'}
]);

let observer=null;

function enhanceObjective(rootSelector,cardSelector){
  const root=document.querySelector(rootSelector),card=root?.querySelector(cardSelector);
  if(!card||card.querySelector('.mobileObjectiveToggle'))return;
  const button=document.createElement('button');
  button.type='button';
  button.className='mobileObjectiveToggle';
  button.setAttribute('aria-label','Show objective details');
  button.setAttribute('aria-expanded','false');
  button.addEventListener('click',event=>{
    event.preventDefault();
    event.stopPropagation();
    const expanded=card.classList.toggle('mobileObjectiveExpanded');
    button.setAttribute('aria-expanded',String(expanded));
    button.setAttribute('aria-label',expanded?'Hide objective details':'Show objective details');
  });
  card.appendChild(button);
}

function scan(){
  for(const config of OBJECTIVE_CONFIGS)enhanceObjective(config.root,config.card);
}

function collapseAll(){
  document.querySelectorAll('.mobileObjectiveExpanded').forEach(card=>{
    card.classList.remove('mobileObjectiveExpanded');
    const button=card.querySelector('.mobileObjectiveToggle');
    button?.setAttribute('aria-expanded','false');
    button?.setAttribute('aria-label','Show objective details');
  });
}

export function initializeMobileStoryUi(){
  scan();
  observer?.disconnect();
  observer=new MutationObserver(scan);
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('orientationchange',collapseAll,{passive:true});
  window.addEventListener('resize',()=>{
    if(!matchMedia('(pointer:coarse) and (max-width:1100px)').matches)collapseAll();
  },{passive:true});
}
