export class ConfirmationDialog{
  constructor(root){this.root=root;this.title=root?.querySelector('[data-confirm-title]');this.message=root?.querySelector('[data-confirm-message]');this.accept=root?.querySelector('[data-confirm-accept]');this.cancel=root?.querySelector('[data-confirm-cancel]');this.pending=null;this.accept?.addEventListener('click',()=>this.resolve(true));this.cancel?.addEventListener('click',()=>this.resolve(false))}
  open({title='Confirm',message='',accept='CONFIRM',cancel='CANCEL'}={}){if(!this.root)return Promise.resolve(false);if(this.pending)this.resolve(false);this.title.textContent=title;this.message.textContent=message;this.accept.textContent=accept;this.cancel.textContent=cancel;this.root.classList.remove('hidden');this.accept.focus();return new Promise(resolve=>{this.pending=resolve})}
  resolve(value){if(!this.pending)return;const resolve=this.pending;this.pending=null;this.root.classList.add('hidden');resolve(!!value)}
  close(){this.resolve(false)}
}

