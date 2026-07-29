export const ROSTER = {
  rrvvfo:{n:'Rrvvfo',o:'S1/S2',c:'#e63224',a:'#ff9d2f',h:'#7a120f',sp:5.2,j:13.5,p:1.02,d:1,s:'Fire Blast / Shots of Agony',u:'Lens of Truth'},
  revvfo:{n:'Revvfo',o:'S1/S2',c:'#8b2cff',a:'#ff55c8',h:'#321047',sp:4.8,j:12.7,p:1.10,d:1.02,s:'Beam / Teleport Strike',u:'Perfected Astrylte'},
  wade:{n:'Wade',o:'S1',c:'#1677ff',a:'#82e8ff',h:'#0c2b6c',sp:6.7,j:14.2,p:.92,d:.94,s:'Flash Step / Barrage',u:'Thunderstorm'},
  bark:{n:'Bark',o:'S1',c:'#7d512d',a:'#c8a06a',h:'#2c2118',sp:3.9,j:11.8,p:1.12,d:1.18,s:'Rock Armor / Earth Wall',u:'Earthquake'},
  alt:{n:'Alt',o:'S1/S2',c:'#2da857',a:'#a6ff6f',h:'#123d25',sp:4.9,j:13,p:1.10,d:1.02,s:'Fist of Punishment',u:'Rage Form'},
  robert:{n:'Robert',o:'S1/S2',c:'#d8f3ff',a:'#7cdcff',h:'#718aa1',sp:4.7,j:12.9,p:1,d:1.05,s:'Ice Master',u:'Absolute Freeze'},
  virek:{n:'Virek',o:'S1/S2',c:'#00a97b',a:'#7dffbc',h:'#064f3c',sp:5.1,j:13,p:1.05,d:1,s:'Emerald Lance',u:'Island Sovereign'},
  shadow:{n:'Shadow',o:'S1/OVA',c:'#c9a7ff',a:'#eadcff',h:'#7965a0',sp:5,j:13.4,p:1.08,d:.96,s:'Sage Orb',u:'Cosmic Memory'},
  phanta:{n:'Phanta',o:'OVA',c:'#2a0f45',a:'#a855f7',h:'#12061f',sp:5.6,j:14,p:1.14,d:1.10,s:'Clone Barrage',u:'Terraform'},
  creed:{n:'Creed',o:'S2',c:'#153e51',a:'#32ecff',h:'#061a22',sp:6,j:13.8,p:1.04,d:.97,s:'Time Slice',u:'Frozen Moment'},
  sage:{n:'The Sage',o:'S1/OVA',c:'#c9b7ff',a:'#fff38a',h:'#6b5b89',sp:4.5,j:12.5,p:1.12,d:1.05,s:'Lazy Palm',u:'Serious Mode'},
  raggie:{n:'Raggie',o:'S1/S2',c:'#ffd53d',a:'#fff7a8',h:'#e4e4e4',sp:5.8,j:14.6,p:.88,d:.9,s:'Paper Disc',u:'Time Stone'},
  jimmy:{n:'Jimmy',o:'S1/S2',c:'#ff8a24',a:'#332519',h:'#3b2012',sp:4.6,j:12.3,p:1.13,d:1,s:'Dark Guardian',u:'Sealing Staff'},
  jonathan:{n:'Jonathan',o:'S1/S2',c:'#b07847',a:'#ffd18f',h:'#49311f',sp:5,j:13.1,p:.98,d:1.04,s:'Oddball Trap',u:'Chain Reaction'},
  rev:{n:'Rev',o:'S2',c:'#62778f',a:'#ff4e87',h:'#202936',sp:4.9,j:12.8,p:1.04,d:1.06,s:'Mechanical Barrage',u:'Maximum Ovation'}
};

export const ROSTER_IDS = Object.keys(ROSTER);
export const PLAYABLE_ROSTER_IDS=Object.freeze(['rrvvfo','revvfo','wade','bark','sage']);
export const isMirrorMatch=(playerOne,playerTwo)=>playerOne===playerTwo;

export const FIGHTER_META={
  rrvvfo:{style:'Adaptable fire pressure and risky foresight',difficulty:3},
  revvfo:{style:'Teleport pressure and Astrylte power',difficulty:4},
  wade:{style:'Lightning-fast rushdown',difficulty:3},
  bark:{style:'Armored defense and guard pressure',difficulty:2},
  alt:{style:'Rage-fueled close-range power',difficulty:2},
  robert:{style:'Ice control and defensive spacing',difficulty:3},
  virek:{style:'Balanced emerald rival',difficulty:3},
  shadow:{style:'Disciplined spacing and recovery',difficulty:4},
  phanta:{style:'Unpredictable clone pressure',difficulty:5},
  creed:{style:'Evasive whiff punisher',difficulty:4},
  sage:{style:'Patient, overwhelming technique',difficulty:3},
  raggie:{style:'Unusual Paper World zoning',difficulty:4},
  jimmy:{style:'Defensive sealing guardian',difficulty:3},
  jonathan:{style:'Chaotic close-range pressure',difficulty:2},
  rev:{style:'Cocky mechanical zoning',difficulty:3}
};

export const FIGHTER_STATUS=Object.freeze({
  rrvvfo:Object.freeze({id:'showcase',label:'SHOWCASE READY',selectable:true}),
  revvfo:Object.freeze({id:'showcase',label:'SHOWCASE READY',selectable:true}),
  sage:Object.freeze({id:'showcase',label:'SHOWCASE READY',selectable:true}),
  wade:Object.freeze({id:'playable',label:'PLAYABLE',selectable:true}),
  bark:Object.freeze({id:'playable',label:'PLAYABLE',selectable:true}),
  alt:Object.freeze({id:'in-development',label:'COMING SOON',selectable:false}),
  robert:Object.freeze({id:'in-development',label:'COMING SOON',selectable:false}),
  virek:Object.freeze({id:'in-development',label:'COMING SOON',selectable:false}),
  shadow:Object.freeze({id:'in-development',label:'COMING SOON',selectable:false}),
  phanta:Object.freeze({id:'in-development',label:'COMING SOON',selectable:false}),
  creed:Object.freeze({id:'in-development',label:'COMING SOON',selectable:false}),
  raggie:Object.freeze({id:'in-development',label:'COMING SOON',selectable:false}),
  jimmy:Object.freeze({id:'in-development',label:'COMING SOON',selectable:false}),
  jonathan:Object.freeze({id:'in-development',label:'COMING SOON',selectable:false}),
  rev:Object.freeze({id:'in-development',label:'COMING SOON',selectable:false})
});
