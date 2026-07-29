const DEFAULT_TASKS=Object.freeze([
  {id:'manifest',label:'FIGHTER MANIFESTS'},
  {id:'sprites',label:'SPRITE ATLASES'},
  {id:'stage',label:'STAGE & CAMERA'},
  {id:'audio',label:'AUDIO & INPUT'},
  {id:'match',label:'MATCH RULES'}
]);

export class LoadingManager{
  constructor(root,{onRetry=()=>{},onReturn=()=>{}}={}){
    this.root=root;
    this.progress=root?.querySelector('#loadingProgress');
    this.percent=root?.querySelector('#loadingPercent');
    this.category=root?.querySelector('#loadingCategory');
    this.message=root?.querySelector('#loadingMessage');
    this.actions=root?.querySelector('#loadingActions');
    this.taskList=root?.querySelector('#loadingTaskList');
    this.fighterArt=root?.querySelector('#loadingFighterArt');
    this.fighterName=root?.querySelector('#loadingFighterName');
    this.stageName=root?.querySelector('#loadingStageName');
    this.versus=root?.querySelector('#loadingVersus');
    this.tasks=[];
    this.runId=0;
    this.retryButton=root?.querySelector('#loadingRetry');
    this.returnButton=root?.querySelector('#loadingReturn');
    this.retryButton?.addEventListener('click',onRetry);
    this.returnButton?.addEventListener('click',onReturn);
  }

  start(category='MATCH INITIALIZATION',message='Preparing match…',options={}){
    this.runId+=1;
    this.root?.classList.remove('hidden');
    this.actions?.classList.add('hidden');
    const tasks=Array.isArray(options.tasks)&&options.tasks.length?options.tasks:DEFAULT_TASKS;
    this.tasks=tasks.map(task=>({...task,state:'pending'}));
    this.identity(options);
    this.renderTasks();
    this.set(0,category,message);
  }

  identity({fighterId='rrvvfo',fighterName='RRVVFO',opponentName='RIVAL',stageName='PREPARING ARENA',accent='#55d9ff'}={}){
    if(this.root)this.root.style.setProperty('--loading-accent',accent);
    if(this.fighterArt)this.fighterArt.dataset.fighter=['rrvvfo','revvfo','wade','bark','sage'].includes(fighterId)?fighterId:'rrvvfo';
    if(this.fighterName)this.fighterName.textContent=String(fighterName).toUpperCase();
    if(this.stageName)this.stageName.textContent=String(stageName).toUpperCase();
    if(this.versus)this.versus.textContent=opponentName?`VS ${String(opponentName).toUpperCase()}`:'READY';
  }

  renderTasks(){
    if(!this.taskList)return;
    this.taskList.innerHTML=this.tasks.map(task=>`<div class="loadingTask ${task.state}" data-loading-task="${task.id}"><span>${task.label}</span><b>${task.state==='done'?'READY':task.state==='active'?'LOADING':'WAITING'}</b></div>`).join('');
  }

  task(id,state='done',message=''){
    const index=this.tasks.findIndex(task=>task.id===id);
    if(index<0)return;
    this.tasks[index].state=state;
    if(state==='active'){
      for(let i=0;i<index;i++)if(this.tasks[i].state==='pending')this.tasks[i].state='done';
    }
    if(message&&this.message)this.message.textContent=message;
    this.renderTasks();
    const done=this.tasks.filter(task=>task.state==='done').length;
    const active=this.tasks.some(task=>task.state==='active')?.5:0;
    this.set(Math.round((done+active)/Math.max(1,this.tasks.length)*100));
  }

  set(value,category,message){
    const resolved=Math.max(0,Math.min(100,Number(value)||0));
    if(this.progress)this.progress.style.width=`${resolved}%`;
    if(this.percent)this.percent.textContent=`${Math.round(resolved)}%`;
    if(category&&this.category)this.category.textContent=category;
    if(message&&this.message)this.message.textContent=message;
  }

  finish(message='READY TO FIGHT'){
    const runId=this.runId;
    for(const task of this.tasks)task.state='done';
    this.renderTasks();
    this.set(100,'MATCH READY',message);
    // Let players actually see that initialization completed, while keeping
    // the transition short enough that rematches still feel immediate.
    window.setTimeout(()=>{if(runId===this.runId)this.root?.classList.add('hidden')},520);
  }

  fail(message='An asset could not load.'){
    if(this.message)this.message.textContent=message;
    this.actions?.classList.remove('hidden');
    const active=this.tasks.find(task=>task.state==='active');
    if(active)active.state='error';
    this.renderTasks();
  }
}
