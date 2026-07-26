import {formatMatchDuration} from './match-statistics.js';

export const RESULT_ACTIONS=Object.freeze([
  {id:'rematch',label:'REMATCH'},
  {id:'character',label:'CHANGE CHARACTER'},
  {id:'stage',label:'CHANGE STAGE'},
  {id:'mode',label:'RETURN TO MODE SELECT'},
  {id:'main',label:'RETURN TO MAIN MENU'}
]);

export function buildResultsModel({winner,durationMs=0,players=[],local=false}={}){return{winner:winner||'Match Complete',duration:formatMatchDuration(durationMs),players:players.map(player=>({...player})),local:!!local,actions:RESULT_ACTIONS.map(action=>({...action}))}}

export class ResultsScreen{
  constructor(root,{onAction=()=>{}}={}){this.root=root;this.onAction=onAction;this.model=null;this.title=root?.querySelector('[data-results-title]');this.duration=root?.querySelector('[data-results-duration]');this.stats=root?.querySelector('[data-results-stats]');this.actions=root?.querySelector('[data-results-actions]');this.actions?.addEventListener('click',event=>{const button=event.target.closest('[data-result-action]');if(button)this.onAction(button.dataset.resultAction)})}
  show(data){if(!this.root)return;this.model=buildResultsModel(data);this.title.textContent=this.model.winner;this.duration.textContent=`MATCH TIME ${this.model.duration}`;this.stats.innerHTML=this.model.players.map((player,index)=>`<section><h3>PLAYER ${index+1}</h3><dl><div><dt>Total damage</dt><dd>${player.damage.toFixed(1)}</dd></div><div><dt>Highest combo</dt><dd>${player.highestCombo}</dd></div><div><dt>Highest combo damage</dt><dd>${player.highestComboDamage.toFixed(1)}</dd></div><div><dt>Perfect blocks</dt><dd>${player.perfectBlocks}</dd></div><div><dt>Guard breaks</dt><dd>${player.guardBreaks}</dd></div><div><dt>Throws landed</dt><dd>${player.throws}</dd></div><div><dt>Breakers used</dt><dd>${player.breakers}</dd></div><div><dt>Clashes won</dt><dd>${player.clashes}</dd></div><div><dt>Specials / Ultimates</dt><dd>${player.specials} / ${player.ultimates}</dd></div><div><dt>Health / Energy</dt><dd>${player.remainingHealth.toFixed(0)} / ${player.remainingEnergy.toFixed(0)}</dd></div></dl></section>`).join('');this.actions.innerHTML=this.model.actions.map((action,index)=>`<button class="${index?'secondary':'primary'}" data-result-action="${action.id}">${action.label}</button>`).join('');this.root.classList.remove('hidden');this.actions.querySelector('button')?.focus()}
  hide(){this.root?.classList.add('hidden')}
}

