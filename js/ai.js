export function difficultyProfile(level) {
  return {easy:.44,normal:.68,hard:.86}[level] ?? .68;
}

