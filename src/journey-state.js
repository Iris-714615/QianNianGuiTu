// Durable progress decides the resume point; transient overlays do not erase it.
export function resumeMuseumState(saved, fresh) {
  const state = {...fresh, ...saved, player:{...fresh.player,...saved.player},
    guard:saved.guard || fresh.guard, damageEffect:null, walking:false};
  if (state.solved) {
    state.mode='transition';
    state.integrity=3;
    state.transitionRemaining=Number.isFinite(saved.transitionRemaining)
      ? Math.max(0,Math.min(2.8,saved.transitionRemaining)) : 2.8;
  } else state.mode=state.integrity===0?'shattered':!state.talked?'dialogue':'play';
  return state;
}

export function advanceMuseumTransition(state, seconds, blocked) {
  if (state.mode!=='transition'||blocked) return false;
  state.transitionRemaining=Math.max(0,state.transitionRemaining-seconds);
  return state.transitionRemaining===0;
}

export function blocksRoomInput(state) {
  return state.mode!=='play'||state.exhausted||state.paused||state.puzzle||
    state.journal||state.help||state.envelope||state.memory;
}

// A suspended renderer cannot accept gameplay. Do not charge its first resumed
// frame's whole wall-clock gap to active play time or consume a transition.
export function activeFrameSeconds(seconds) {
  return Number.isFinite(seconds)&&seconds>=0&&seconds<=1?seconds:0;
}
