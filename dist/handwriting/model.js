// Input and progress helpers shared by the handwriting UI and its tests.
export function strokeLength(points) {
  return points.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - points[i].x, p.y - points[i].y), 0);
}
export function pointInBoard(clientX, clientY, rect) {
  return { x: Math.min(109, Math.max(0, (clientX - rect.left) / rect.width * 109)),
    y: Math.min(109, Math.max(0, (clientY - rect.top) / rect.height * 109)) };
}
export function pathFromPoints(points) {
  return points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}
export function cleanWritingProgress(value, allowed) {
  const result = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
  for (const [char, entry] of Object.entries(value)) {
    if (!allowed.includes(char) || !entry || typeof entry !== 'object') continue;
    const count = n => Number.isSafeInteger(n) && n >= 0 ? Math.min(n, 100000) : 0;
    result[char] = { trace: count(entry.trace), free: count(entry.free),
      lastAt: typeof entry.lastAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.lastAt) ? entry.lastAt : '' };
  }
  return result;
}
export function countFeedback(actual, expected) {
  if (actual === expected) return `你寫了 ${actual} 筆，和範例的筆畫數相同。接著比較位置、方向與比例。`;
  return `你寫了 ${actual} 筆，範例是 ${expected} 筆。可以重看筆順，留意是否有斷筆或多畫一筆。`;
}
