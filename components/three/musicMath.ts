/**
 * Shared wave math for the music strings + bouncing GLBs.
 *
 * The string and its rider need to use the *exact same* equation, otherwise
 * the GLB visibly drifts off the string. Centralising the math here is the
 * cleanest way to keep them in lockstep.
 */

import * as THREE from "three";

export const STRING_SEGMENTS = 64;
/** Spatial frequency along the string (how many waves fit between endpoints). */
export const STRING_SPATIAL_FREQ = 3.6;
/** Temporal frequency (how fast the wave moves). */
export const STRING_TEMPORAL_FREQ = 7.5;
/** Seconds between pluck pulses. */
export const STRING_PLUCK_PERIOD = 3.4;
/** How quickly each pluck decays after it fires. */
export const STRING_PLUCK_DECAY = 1.3;
/** Baseline + peak amplitudes (the wave never fully stops). */
export const STRING_BASE_AMP = 0.04;
export const STRING_PEAK_AMP = 0.26;

/**
 * Returns the perpendicular axis used to displace the string sideways.
 * For a vector pointing in `dir`, we want a unit vector orthogonal to it.
 */
export function computePerpendicular(
  endpoint: [number, number, number],
): THREE.Vector3 {
  const dir = new THREE.Vector3(...endpoint).normalize();
  let perp = new THREE.Vector3(0, 1, 0).cross(dir);
  // If the string is exactly vertical, fall back to the X axis.
  if (perp.length() < 0.001) perp = new THREE.Vector3(1, 0, 0);
  return perp.normalize();
}

/**
 * Wave amplitude at the current pluck phase (decays after each pluck).
 */
export function pluckAmplitude(time: number, phaseOffset = 0): number {
  const pluckPhase = (time + phaseOffset) % STRING_PLUCK_PERIOD;
  const decay = Math.exp(-pluckPhase * STRING_PLUCK_DECAY);
  return STRING_BASE_AMP + decay * STRING_PEAK_AMP;
}

/**
 * Lateral displacement of the string at fractional position `u` (0..1).
 * Multiplied by sin(πu) so endpoints stay clamped.
 */
export function stringDisplacement(
  u: number,
  time: number,
  amplitude: number,
): number {
  const envelope = Math.sin(u * Math.PI);
  return (
    Math.sin(u * Math.PI * STRING_SPATIAL_FREQ + time * STRING_TEMPORAL_FREQ) *
    envelope *
    amplitude
  );
}
