import { useEffect, useRef, useState } from 'react';
import { CurlDiagram } from './ui';
import { CURL_ANGLE_MAX, CURL_ANGLE_MIN, curlAngle, curlDrift, curlProgress } from '../utils/curlMotion';
import { cx } from '../utils/format';

// Scene units are metres-ish, y up. The arm swings in the x/y plane, nearest the camera.
const SHOULDER = { x: 1.64, y: -1.0 };
const UPPER_ARM = 1.5;
const FOREARM = 1.53;
const ARM_Z = 0.28;
const TARGET = { x: 2.05, y: -2.35, z: 0 };

const THEMES = {
  light: { arm: '#0e1013', body: '#c9ced2', shoulder: '#ffffff', line: '#0e1013' },
  dark: { arm: '#eef0f1', body: '#3b4046', shoulder: '#1a1d21', line: '#eef0f1' },
};
const VOLT = '#def52b';

const supportsWebGL = () => {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
};

const prefersStill = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A 3D take on the curl diagram: the figure curls the dumbbell while the camera drifts around it.
 * Falls back to the flat diagram without WebGL or when the viewer prefers less motion.
 */
export default function CurlModel3D({ className = '' }) {
  const [use3D] = useState(() => supportsWebGL() && !prefersStill());
  const hostRef = useRef(null);
  const driftRef = useRef(null);
  const angleRef = useRef(null);

  useEffect(() => {
    if (!use3D) return undefined;
    let disposed = false;
    let cleanup = () => {};

    import('three').then((THREE) => {
      if (disposed) return;
      cleanup = buildScene(THREE, hostRef.current, driftRef.current, angleRef.current);
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [use3D]);

  if (!use3D) return <CurlDiagram className={className} />;

  return (
    <div className={cx('relative aspect-square', className)}>
      <div ref={hostRef} className="absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 text-ink"
        role="img"
        aria-label="3D model of a bicep curl. The elbow angle moves between 152 and 38 degrees while shoulder drift rises from 1 to 3 degrees"
      >
        <Readout className="top-[13%] left-0" label="Shoulder drift" valueRef={driftRef} initial="1°" />
        <Readout className="top-[44%] left-0" label="Elbow angle" valueRef={angleRef} initial="152°" />
        <Readout className="right-0 bottom-0 text-right" label="Range" initial={`${CURL_ANGLE_MIN}-${CURL_ANGLE_MAX}°`} />
      </div>
    </div>
  );
}

function Readout({ className, label, valueRef, initial }) {
  return (
    <div className={cx('absolute', className)}>
      <p className="text-[10px] text-muted">{label}</p>
      <p ref={valueRef} className="stat text-[22px]">{initial}</p>
    </div>
  );
}

function buildScene(THREE, host, driftEl, angleEl) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a9096, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 5, 8);
  scene.add(key);

  const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, ...extra });
  const mats = {
    arm: material(THEMES.light.arm),
    body: material(THEMES.light.body),
    shoulder: material(THEMES.light.shoulder),
    volt: material(VOLT, { roughness: 0.4 }),
    dumbbell: material(THEMES.light.arm, { roughness: 0.35, metalness: 0.4 }),
    wedge: new THREE.MeshBasicMaterial({ color: VOLT, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
    swept: new THREE.LineBasicMaterial({ color: THEMES.light.line }),
    range: new THREE.LineDashedMaterial({ color: THEMES.light.line, dashSize: 0.08, gapSize: 0.08, transparent: true, opacity: 0.35 }),
  };

  const disposables = [];
  const keep = (geometry) => {
    disposables.push(geometry);
    return geometry;
  };
  const Y = new THREE.Vector3(0, 1, 0);

  // A capsule from a to b, used for every limb.
  const limb = (radius, length, mat) => {
    const mesh = new THREE.Mesh(keep(new THREE.CapsuleGeometry(radius, length, 6, 16)), mat);
    scene.add(mesh);
    return mesh;
  };
  const placeLimb = (mesh, a, b) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    mesh.position.copy(a).addScaledVector(dir, 0.5);
    mesh.quaternion.setFromUnitVectors(Y, dir.normalize());
  };

  const head = new THREE.Mesh(keep(new THREE.SphereGeometry(0.26, 32, 16)), mats.body);
  head.position.set(1.7, -0.42, 0);
  scene.add(head);
  placeLimb(limb(0.07, 0.25, mats.body), new THREE.Vector3(1.68, -0.68, 0), new THREE.Vector3(1.6, -0.95, 0));
  placeLimb(limb(0.2, 1.65, mats.body), new THREE.Vector3(1.58, -1.12, 0), new THREE.Vector3(1.47, -2.85, 0));
  placeLimb(limb(0.13, 1.35, mats.body), new THREE.Vector3(1.47, -3.0, 0.06), new THREE.Vector3(1.55, -4.55, 0.06));
  placeLimb(limb(0.13, 1.35, mats.body), new THREE.Vector3(1.5, -3.0, -0.12), new THREE.Vector3(1.6, -4.55, -0.12));

  const upperArm = limb(0.085, UPPER_ARM, mats.arm);
  const forearm = limb(0.075, FOREARM, mats.arm);
  const joint = (radius, mat) => {
    const mesh = new THREE.Mesh(keep(new THREE.SphereGeometry(radius, 24, 12)), mat);
    scene.add(mesh);
    return mesh;
  };
  const shoulderJoint = joint(0.11, mats.shoulder);
  const elbowJoint = joint(0.13, mats.volt);
  const wristJoint = joint(0.1, mats.volt);
  shoulderJoint.position.set(SHOULDER.x, SHOULDER.y, ARM_Z);

  // Hex dumbbell, handle pointing into the screen like a real side-on curl.
  const dumbbell = new THREE.Group();
  const handle = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.04, 0.04, 0.78, 12)), mats.dumbbell);
  handle.rotation.x = Math.PI / 2;
  dumbbell.add(handle);
  for (const z of [-0.32, 0.32]) {
    const plate = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.26, 0.26, 0.16, 6)), mats.dumbbell);
    plate.rotation.x = Math.PI / 2;
    plate.position.z = z;
    dumbbell.add(plate);
  }
  scene.add(dumbbell);

  const wedge = new THREE.Mesh(new THREE.BufferGeometry(), mats.wedge);
  const swept = new THREE.Line(new THREE.BufferGeometry(), mats.swept);
  const range = new THREE.Line(new THREE.BufferGeometry(), mats.range);
  scene.add(wedge, swept, range);

  const arcPoints = (center, radius, from, to, steps = 48) =>
    Array.from({ length: steps + 1 }, (_, i) => {
      const a = from + ((to - from) * i) / steps;
      return new THREE.Vector3(center.x + radius * Math.cos(a), center.y + radius * Math.sin(a), ARM_Z);
    });
  const setLine = (line, points) => {
    line.geometry.dispose();
    line.geometry = new THREE.BufferGeometry().setFromPoints(points);
    if (line.material.isLineDashedMaterial) line.computeLineDistances();
  };

  const rad = (degrees) => (degrees * Math.PI) / 180;
  const shoulder = new THREE.Vector3(SHOULDER.x, SHOULDER.y, ARM_Z);

  function pose(progress) {
    const angle = curlAngle(progress);
    const drift = curlDrift(progress);
    const elbow = new THREE.Vector3(SHOULDER.x + UPPER_ARM * Math.sin(rad(drift)), SHOULDER.y - UPPER_ARM * Math.cos(rad(drift)), ARM_Z);
    const toShoulder = Math.atan2(shoulder.y - elbow.y, shoulder.x - elbow.x);
    // y is up here, so swinging forward is clockwise, the negative direction.
    const forearmDir = toShoulder - rad(angle);
    const wrist = new THREE.Vector3(elbow.x + FOREARM * Math.cos(forearmDir), elbow.y + FOREARM * Math.sin(forearmDir), ARM_Z);

    placeLimb(upperArm, shoulder, elbow);
    placeLimb(forearm, elbow, wrist);
    elbowJoint.position.copy(elbow);
    wristJoint.position.copy(wrist);
    dumbbell.position.copy(wrist);
    dumbbell.rotation.z = forearmDir;

    wedge.geometry.dispose();
    wedge.geometry = new THREE.CircleGeometry(0.5, 32, forearmDir, rad(angle));
    wedge.position.set(elbow.x, elbow.y, ARM_Z - 0.02);

    setLine(range, arcPoints(elbow, FOREARM, toShoulder - rad(CURL_ANGLE_MAX), toShoulder - rad(CURL_ANGLE_MIN)));
    setLine(swept, arcPoints(elbow, FOREARM, toShoulder - rad(CURL_ANGLE_MAX), forearmDir));

    driftEl.textContent = `${Math.max(1, Math.round(drift))}°`;
    angleEl.textContent = `${Math.round(angle)}°`;
  }

  function applyTheme() {
    const colors = THEMES[document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'];
    mats.arm.color.set(colors.arm);
    mats.dumbbell.color.set(colors.arm);
    mats.body.color.set(colors.body);
    mats.shoulder.color.set(colors.shoulder);
    mats.swept.color.set(colors.line);
    mats.range.color.set(colors.line);
  }
  applyTheme();
  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  function resize() {
    const size = Math.max(1, host.clientWidth);
    renderer.setSize(size, size, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  let frame = null;
  let last = null;
  let clock = 0;
  const tick = (now) => {
    if (last !== null) clock += Math.min((now - last) / 1000, 0.1);
    last = now;
    pose(curlProgress(clock));
    // A slow sway around the figure shows it has depth without making anyone seasick.
    const orbit = Math.sin(clock * 0.35) * 0.45;
    const distance = 11.5;
    camera.position.set(TARGET.x + distance * Math.sin(orbit), TARGET.y + 1.4, TARGET.z + distance * Math.cos(orbit));
    camera.lookAt(TARGET.x, TARGET.y, TARGET.z);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = null;
    last = null;
  };
  // Only animate while the card is on screen.
  const visibility = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && frame === null) frame = requestAnimationFrame(tick);
    else if (!entry.isIntersecting) stop();
  });
  visibility.observe(host);

  return () => {
    stop();
    visibility.disconnect();
    resizeObserver.disconnect();
    themeObserver.disconnect();
    [wedge, swept, range].forEach((object) => object.geometry.dispose());
    disposables.forEach((geometry) => geometry.dispose());
    Object.values(mats).forEach((mat) => mat.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
}
