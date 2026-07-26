export class NotificationSystem{
  constructor(root,{mode=()=> 'full',now=()=>Date.now(),duration=1600}={}){this.root=root;this.mode=mode;this.now=now;this.duration=duration;this.last=new Map()}
  push(message,{key=message,important=false,cooldown=700}={}){const setting=this.mode();if(setting==='off'||(setting==='important'&&!important))return false;const now=this.now();if(now-(this.last.get(key)||0)<cooldown)return false;this.last.set(key,now);if(!this.root)return true;const element=document.createElement('div');element.className=`combatNotice${important?' important':''}`;element.textContent=message;this.root.appendChild(element);setTimeout(()=>element.remove(),this.duration);return true}
  clear(){this.last.clear();if(this.root)this.root.innerHTML=''}
}

