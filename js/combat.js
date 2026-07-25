export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

