const normal=(name,damage,startup,recovery,hitstun,range,knockback,launch=0)=>({name,damage,startup,recovery,hitstun,range,knockback,launch});
export const MOVESETS={
  rrvvfo:{
    style:'Balanced fire extensions and risky evasion',
    light:[normal('Fire Jab',5.8,3,9,15,44,4),normal('Flame Cross',6.2,4,10,17,47,5),normal('Burning Finish',7.5,6,16,22,52,9)],
    heavy:normal('Flame Heavy',13,11,27,25,61,12),
    launcher:normal('Flame Launcher',9.5,15,30,31,52,4,12.5),
    air:normal('Air Fire Combo',6.4,4,12,19,50,5,3.5),
    moves:['Fire light combo','Flame Heavy','Flame Launcher','Air Fire Combo','Fire Blast','Shots of Agony','Object Swap Dash','Lens of Truth']
  },
  revvfo:{
    style:'Aggressive Astrylte pressure and teleports',
    light:[normal('Astrylte Cut',6.6,3,10,16,48,5),normal('Astrylte Cross',7,4,11,18,51,6),normal('Blade Break',8.2,5,16,23,57,10)],
    heavy:normal('Heavy Astrylte Strike',14,10,27,26,64,13),
    launcher:normal('Teleport Launcher',10,14,28,32,58,4,13),
    air:normal('Air Blade Combo',7,4,12,20,52,5,4),
    moves:['Astrylte blade combo','Heavy Astrylte Strike','Teleport Launcher','Air Blade Combo','Astrylte Beam','Teleport Strike','Astrylte Dragon','Perfected State']
  },
  wade:{
    style:'Fast low-damage rushdown',
    light:[normal('Lightning Jab',4.4,2,7,13,43,3),normal('Rapid Cross',4.6,2,8,14,45,4),normal('Volt Kick',5.2,3,11,17,48,6)],
    heavy:normal('Lightning Heavy',9.5,7,20,21,55,9),
    launcher:normal('Rising Lightning',7.5,10,22,27,48,3,12),
    air:normal('Fast Air Combo',4.8,3,9,16,46,4,3),
    moves:['Rapid light combo','Lightning Heavy','Rising Lightning','Fast Air Combo','Flash Step','Lightning Barrage','Air Dash','Thunderstorm']
  },
  bark:{
    style:'Slow armored defensive powerhouse',
    light:[normal('Stone Fist',8,7,17,20,49,7),normal('Boulder Hook',9,8,19,22,54,9),normal('Mountain Breaker',11,10,25,28,60,14)],
    heavy:normal('Armored Heavy',17,16,38,31,68,17),
    launcher:normal('Earth Launcher',12,18,36,33,57,6,11),
    air:normal('Air Slam',11,8,25,25,55,10,1),
    moves:['Heavy light chain','Armored Heavy','Earth Launcher','Air Slam','Rock Armor','Earth Wall','Seismic Counter (E / ;)','Earthquake']
  }
};
export function moveFor(id,kind,chain=0){const set=MOVESETS[id];if(!set)return null;const value=set[kind];return Array.isArray(value)?value[chain%value.length]:value}
export function moveList(id){return MOVESETS[id]?.moves||[]}

// Conservative full-move damage totals used by balance tests. Multi-hit scaling
// makes actual match damage equal or lower than these raw totals.
export const MOVE_DAMAGE_TOTALS={
  rrvvfo:{special:29.6,ultimate:0},revvfo:{special:19,ultimate:25},wade:{special:13.5,ultimate:21.6},bark:{special:12,ultimate:22},
  alt:{special:14,ultimate:17},robert:{special:11,ultimate:12},virek:{special:14,ultimate:24},shadow:{special:13,ultimate:28},
  phanta:{special:19.5,ultimate:20},creed:{special:12,ultimate:16},sage:{special:13,ultimate:20},raggie:{special:10,ultimate:0},
  jimmy:{special:15,ultimate:18},jonathan:{special:0,ultimate:21}
};
