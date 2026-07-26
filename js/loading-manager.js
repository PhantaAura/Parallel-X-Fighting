export class LoadingManager{
  constructor(root,{onRetry=()=>{},onReturn=()=>{}}={}){this.root=root;this.progress=root?.querySelector('#loadingProgress');this.category=root?.querySelector('#loadingCategory');this.message=root?.querySelector('#loadingMessage');this.actions=root?.querySelector('#loadingActions');root?.querySelector('#loadingRetry')?.addEventListener('click',onRetry);root?.querySelector('#loadingReturn')?.addEventListener('click',onReturn)}
  start(category='MATCH INITIALIZATION',message='Preparing match…'){this.root?.classList.remove('hidden');this.actions?.classList.add('hidden');this.set(0,category,message)}
  set(value,category,message){if(this.progress)this.progress.style.width=`${Math.max(0,Math.min(100,value))}%`;if(category&&this.category)this.category.textContent=category;if(message&&this.message)this.message.textContent=message}
  finish(){this.set(100);this.root?.classList.add('hidden')}
  fail(message='An asset could not load.'){if(this.message)this.message.textContent=message;this.actions?.classList.remove('hidden')}
}
