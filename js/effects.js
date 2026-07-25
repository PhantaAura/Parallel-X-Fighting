export function tint(hex,amount,clamp) {
  const c=parseInt(hex.slice(1),16);
  return `rgb(${clamp((c>>16)+amount,0,255)},${clamp(((c>>8)&255)+amount,0,255)},${clamp((c&255)+amount,0,255)})`;
}

