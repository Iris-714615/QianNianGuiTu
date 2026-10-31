const box={};
/* Pure geometry shared by movement, line of sight, and verification. */
(function (root) {
  'use strict';
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  function circleRect(x, y, radius, rect) {
    return Math.hypot(x - clamp(x, rect.x, rect.x + rect.w), y - clamp(y, rect.y, rect.y + rect.h)) < radius;
  }
  function segmentRect(ax, ay, bx, by, rect) {
    let lo = 0, hi = 1;
    for (const [start, delta, min, max] of [[ax, bx - ax, rect.x, rect.x + rect.w], [ay, by - ay, rect.y, rect.y + rect.h]]) {
      if (Math.abs(delta) < 1e-9) { if (start < min || start > max) return false; }
      else { const a = (min - start) / delta, b = (max - start) / delta; lo = Math.max(lo, Math.min(a, b)); hi = Math.min(hi, Math.max(a, b)); if (lo > hi) return false; }
    }
    return hi >= 0 && lo <= 1;
  }
  function visible(guard, player, obstacles) {
    const dx = player.x - guard.x, dy = player.y - guard.y, d = Math.hypot(dx, dy);
    if (d > guard.range) return false;
    if (d > 0 && (dx * Math.cos(guard.angle) + dy * Math.sin(guard.angle)) / d < Math.cos(guard.halfAngle)) return false;
    return !obstacles.some(r => segmentRect(guard.x, guard.y, player.x, player.y, r));
  }
  function move(body, dx, dy, obstacles, bounds) {
    const x = clamp(body.x + dx, bounds.x + body.r, bounds.x + bounds.w - body.r);
    if (!obstacles.some(r => circleRect(x, body.y, body.r, r))) body.x = x;
    const y = clamp(body.y + dy, bounds.y + body.r, bounds.y + bounds.h - body.r);
    if (!obstacles.some(r => circleRect(body.x, y, body.r, r))) body.y = y;
  }
  function interaction(player, targets, obstacles, reach = 64) {
    let best = null;
    for (const target of targets) {
      const point = {x:clamp(player.x,target.x,target.x+target.w),y:clamp(player.y,target.y,target.y+target.h)};
      const distance = Math.hypot(player.x-point.x,player.y-point.y);
      if (distance > reach || (best && distance >= best.distance)) continue;
      if (obstacles.some(r => r !== target && segmentRect(player.x,player.y,point.x,point.y,r))) continue;
      best = {id:target.id,point,distance};
    }
    return best;
  }
  function damageResult(integrity) { return clamp(integrity - 1, 0, 3); }
  function movementMultiplier(integrity) { return integrity === 0 ? 0 : integrity === 1 ? .85 : 1; }
  function nearestSafePoint(player, points) {
    return points.reduce((best, p) => Math.hypot(player.x-p.x,player.y-p.y) < Math.hypot(player.x-best.x,player.y-best.y) ? p : best);
  }
  root.MuseumCore = { clamp, circleRect, segmentRect, visible, move, interaction, damageResult, movementMultiplier, nearestSafePoint };
})(box);
export const MuseumCore=box.MuseumCore;
