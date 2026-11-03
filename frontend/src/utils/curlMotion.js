// Shared timing for the illustrated bicep curl, so the 2D diagram and the 3D model move the same way.

export const CURL_ANGLE_MAX = 152;
export const CURL_ANGLE_MIN = 38;
export const CURL_STILL_ANGLE = 42;
// Seconds per phase. The lowering is slower than the lift, the tempo FitMon coaches for.
const CURL_TEMPO = { lift: 1.4, hold: 0.4, lower: 2.2, rest: 0.5 };
const CURL_CYCLE = CURL_TEMPO.lift + CURL_TEMPO.hold + CURL_TEMPO.lower + CURL_TEMPO.rest;

const easeInOut = (x) => 0.5 - 0.5 * Math.cos(Math.PI * x);

// 0 is the arm fully extended, 1 is fully curled.
export function curlProgress(seconds) {
  let t = seconds % CURL_CYCLE;
  if (t < CURL_TEMPO.lift) return easeInOut(t / CURL_TEMPO.lift);
  t -= CURL_TEMPO.lift;
  if (t < CURL_TEMPO.hold) return 1;
  t -= CURL_TEMPO.hold;
  if (t < CURL_TEMPO.lower) return 1 - easeInOut(t / CURL_TEMPO.lower);
  return 0;
}

export const curlAngle = (progress) => CURL_ANGLE_MAX - (CURL_ANGLE_MAX - CURL_ANGLE_MIN) * progress;
export const curlDrift = (progress) => 0.5 + 2.5 * progress;
export const STILL_PROGRESS = (CURL_ANGLE_MAX - CURL_STILL_ANGLE) / (CURL_ANGLE_MAX - CURL_ANGLE_MIN);
