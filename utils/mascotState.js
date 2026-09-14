// What the broccoli is doing right now (v0.3.0).
//
// Damon's spec, verbatim:
//
//   Waving only appears when the user open the app.
//   Sleep takes place from 10pm to 7am.
//   Jump happens everytime a food is logged or a macro goal is met.
//   Otherwise, he alternates between running, idle, meditating and
//   lifting. each last for 30 seconds.
//
// plus three answers he gave when I asked:
//   - the wave plays once (2.9s) and then hands over to the rotation
//   - sleep is ABSOLUTE: between 10pm and 7am nothing wakes him, not a
//     logged meal and not opening the app
//   - the rotation is random, never repeating the pose just shown
//
// ---------------------------------------------------------------------
// WHY THIS IS A MODULE AND NOT COMPONENT STATE
//
// All four tabs mount components/Mascot.js. If the pose lived in that
// component, each tab would own a separate copy with a separate 30s
// timer, and changing tab would change the pose -- which is exactly the
// bug v0.2.3 was written to kill ("the mascot part doesn't change at
// all"). So there is one pose, here, and the four mounted components
// are subscribers to it. Switching tabs cannot restart, resize or
// re-pose anything.
//
// The transition rules below are pure functions of (state, now, random).
// No timers, no React, no Date.now() reached for in secret -- the clock
// and the random source are injectable, which is what lets a probe run
// nine simulated hours in a millisecond and check the 10pm boundary
// exactly rather than approximately.
// ---------------------------------------------------------------------

// The four that rotate. Order here is only the pool; the pick is random.
export const ROTATION = ['run', 'idle', 'meditate', 'curl'];

// Every pose the app knows, rotation and one-shots together.
export const ALL_POSES = ['wave', 'run', 'idle', 'jump', 'curl', 'meditate', 'sleep'];

export const SLOT_MS = 30000;

// The one-shots hold for exactly as long as their artwork runs, so each
// plays through once and stops rather than looping a second time and
// being cut off mid-gesture. These two numbers are measured from the
// files, not guessed: wave is 29 frames and jump is 34, both at 10fps.
export const ONE_SHOT_MS = { wave: 2900, jump: 3400 };

// 10pm to 7am, local time, wrapping midnight.
export const SLEEP_START_HOUR = 22;
export const SLEEP_END_HOUR = 7;

// Even with nothing scheduled the machine re-checks this often. It is
// what makes the 10pm boundary land while the app is sitting open, and
// what recovers the state after the OS has frozen a backgrounded app
// through a timer that should have fired hours ago.
export const HEARTBEAT_MS = 60000;

export function isSleepHour(date) {
  const h = date.getHours();
  // Wraps midnight, so it is an OR rather than the usual AND.
  return h >= SLEEP_START_HOUR || h < SLEEP_END_HOUR;
}

// Milliseconds until the clock next crosses 10pm or 7am. Used to wake
// the machine exactly on the boundary instead of up to a minute late.
export function msUntilSleepBoundary(nowMs) {
  const now = new Date(nowMs);
  let best = Infinity;
  for (const hour of [SLEEP_START_HOUR, SLEEP_END_HOUR]) {
    for (const dayOffset of [0, 1]) {
      const t = new Date(nowMs);
      t.setDate(t.getDate() + dayOffset);
      t.setHours(hour, 0, 0, 0);
      const delta = t.getTime() - nowMs;
      if (delta > 0 && delta < best) best = delta;
    }
  }
  return best;
}

function slot(nowMs, rand, avoid) {
  const pool = avoid ? ROTATION.filter((p) => p !== avoid) : ROTATION;
  // Math.min guards the rand() === 1 edge, which would index past the end.
  const pose = pool[Math.min(pool.length - 1, Math.floor(rand() * pool.length))];
  return { pose, since: nowMs, until: nowMs + SLOT_MS };
}

// The whole machine. Given where it is and what time it is, where should
// it be? Called on every tick, so it has to be idempotent: calling it
// twice with the same `now` must give the same answer, or the pose would
// flicker.
export function resolve(state, nowMs, rand) {
  if (isSleepHour(new Date(nowMs))) {
    // Absolute. Note it returns the SAME OBJECT when already asleep --
    // that identity is what stops a re-render on every heartbeat through
    // the nine hours.
    return state.pose === 'sleep' ? state : { pose: 'sleep', since: nowMs, until: null };
  }
  // 7am. Straight into the rotation rather than a wave: he did not just
  // open the app, he was here all night.
  if (state.pose === 'sleep') return slot(nowMs, rand, null);

  if (state.until != null && nowMs < state.until) return state;

  // A slot or a one-shot just ended. Only avoid repeating if the thing
  // that ended was itself a rotation pose -- after a wave or a jump, any
  // of the four is new.
  const avoid = ROTATION.indexOf(state.pose) >= 0 ? state.pose : null;
  return slot(nowMs, rand, avoid);
}

// "The user opened the app."
export function onOpen(state, nowMs, rand) {
  if (isSleepHour(new Date(nowMs))) return resolve(state, nowMs, rand);
  return { pose: 'wave', since: nowMs, until: nowMs + ONE_SHOT_MS.wave };
}

// "A food was logged, or a macro goal was met."
//
// A jump abandons the rest of the current 30s slot and a fresh slot
// starts when it lands, rather than resuming the interrupted pose for
// its remainder. Simpler, and at 3.4s the difference is invisible.
export function onCelebrate(state, nowMs, rand) {
  if (isSleepHour(new Date(nowMs))) return resolve(state, nowMs, rand);
  return { pose: 'jump', since: nowMs, until: nowMs + ONE_SHOT_MS.jump };
}

// How long until this state needs looking at again. Never longer than a
// heartbeat, never shorter than 250ms (a runaway timer would be worse
// than a late pose).
export function nextWakeMs(state, nowMs) {
  const untilEnd = state.until == null ? Infinity : state.until - nowMs;
  return Math.max(250, Math.min(untilEnd, msUntilSleepBoundary(nowMs), HEARTBEAT_MS));
}

// Which files are worth fetching before they are needed. Poses arrive
// from a CDN, so an un-warmed switch shows a blank corner for as long as
// the download takes. Jump comes first because it is the only one the
// user triggers and therefore the only one whose delay would read as the
// app being slow to respond.
export function posesToWarm(nowMs) {
  if (isSleepHour(new Date(nowMs))) return ['sleep'];
  return ['jump'].concat(ROTATION);
}

// ---------------------------------------------------------------------
// The store the four mounted mascots share.
// ---------------------------------------------------------------------

let clock = () => Date.now();
let random = Math.random;
let current = null;
let timer = null;
const listeners = new Set();

// Injection points, used by the probes. Not called by the app.
export function __setClock(fn) { clock = fn; }
export function __setRandom(fn) { random = fn; }
export function __reset() {
  if (timer) { clearTimeout(timer); timer = null; }
  current = null;
  listeners.clear();
}

function set(next) {
  if (next === current) { schedule(); return; }
  current = next;
  listeners.forEach((fn) => {
    try { fn(current); } catch (err) { /* one bad subscriber must not stop the rest */ }
  });
  schedule();
}

function schedule() {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!listeners.size || !current) return;
  timer = setTimeout(tick, nextWakeMs(current, clock()));
  // Node keeps a process alive while a timer is pending, so a probe that
  // mounts a screen and never unmounts it would hang forever instead of
  // reporting. React Native's setTimeout returns a number and has no
  // unref, so on a device this line does nothing at all.
  if (timer && typeof timer.unref === 'function') timer.unref();
}

function tick() {
  timer = null;
  if (!current) return;
  set(resolve(current, clock(), random));
}

// The machine's own clock, exported so that everything which reasons
// about the mascot reasons about the SAME time.
//
// components/Mascot.js used to call Date.now() when deciding which poses
// to warm, which the probe caught immediately: under a simulated 9:30am
// it warmed the night set, because the container's real clock said
// half eleven. In production the two clocks agree and the bug is
// invisible -- which is exactly the kind that survives to production.
export function now() {
  return clock();
}

export function getPoseState() {
  if (!current) {
    const now = clock();
    // First read of the session is an app open by definition.
    current = onOpen({ pose: 'idle', since: now, until: now }, now, random);
  }
  return current;
}

export function subscribe(fn) {
  const state = getPoseState();
  listeners.add(fn);
  fn(state);
  schedule();
  return () => {
    listeners.delete(fn);
    if (!listeners.size && timer) { clearTimeout(timer); timer = null; }
  };
}

// Called from App.js when the app comes back to the foreground, and once
// implicitly on the first getPoseState().
export function open() {
  set(onOpen(getPoseState(), clock(), random));
}

// Called from App.js every time an entry is logged.
export function celebrate() {
  set(onCelebrate(getPoseState(), clock(), random));
}
