import { useEffect, useRef, useState } from 'react';
import { CurlDiagram } from './ui';
import { CURL_ANGLE_MAX, CURL_ANGLE_MIN, curlAngle, curlDrift, curlProgress } from '../utils/curlMotion';
import { cx } from '../utils/format';

// Scene units are metres-ish, y up. The figure faces +x and the tracked arm is the one nearest the camera (+z).
const SHOULDER = { x: 1.62, y: -1.14 };
const UPPER_ARM = 1.45;
const FOREARM = 1.35;
const ARM_Z = 0.5;
const FLOOR_Y = -4.845;
const TARGET = { x: 1.75, y: -2.42, z: 0 };

const THEMES = {
  light: { body: '#a9b0b6', kit: '#202326', rubber: '#1d1f22', chrome: '#d9dde0', overlay: '#0e1013', shadow: 0.22, ring: 0.14 },
  dark: { body: '#9da2a6', kit: '#34383c', rubber: '#2e3135', chrome: '#e6e9eb', overlay: '#ffffff', shadow: 0.6, ring: 0.16 },
};
const VOLT = '#def52b';

// Muscle outlines as [radius, y] from one end of a limb (-0.5) to the other (0.5). Smoothed into a spline when built.
const PROFILES = {
  upperArm: [[0, -0.5], [0.085, -0.46], [0.112, -0.36], [0.116, -0.18], [0.1, 0.12], [0.08, 0.36], [0.07, 0.46], [0, 0.5]],
  forearm: [[0, -0.5], [0.08, -0.46], [0.096, -0.3], [0.082, 0], [0.062, 0.3], [0.053, 0.45], [0, 0.5]],
  thigh: [[0, -0.5], [0.15, -0.46], [0.168, -0.3], [0.16, -0.05], [0.135, 0.25], [0.105, 0.44], [0, 0.5]],
  shin: [[0, -0.5], [0.1, -0.45], [0.118, -0.25], [0.1, 0.05], [0.072, 0.35], [0.06, 0.46], [0, 0.5]],
  neck: [[0, -0.5], [0.09, -0.44], [0.078, 0], [0.082, 0.4], [0, 0.5]],
  // The shorts leg is an open sleeve, so it ends without closing to a point.
  shortsLeg: [[0, -0.5], [0.168, -0.44], [0.182, -0.2], [0.176, 0.3], [0.172, 0.5]],
};
const CHEST = [[0, -2.3], [0.235, -2.28], [0.245, -2.15], [0.258, -1.95], [0.28, -1.7], [0.3, -1.45], [0.305, -1.25], [0.28, -1.12], [0.2, -1.03], [0.1, -0.98], [0, -0.96]];
const SHORTS = [[0, -3.04], [0.19, -3.02], [0.255, -2.92], [0.27, -2.7], [0.258, -2.45], [0.25, -2.25], [0.25, -2.14], [0, -2.13]];

const supportsWebGL = () => {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
};

const prefersStill = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Full body take on the curl model: an athlete figure curls a plated dumbbell under studio light, with
 * FitMon's pose tracking drawn over the working arm. Drag to turn it. Falls back to the flat diagram
 * without WebGL or when the viewer prefers less motion.
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

    Promise.all([
      import('three'),
      import('three/addons/environments/RoomEnvironment.js'),
      import('three/addons/geometries/RoundedBoxGeometry.js'),
    ]).then(([THREE, { RoomEnvironment }, { RoundedBoxGeometry }]) => {
      if (disposed) return;
      cleanup = buildScene({ THREE, RoomEnvironment, RoundedBoxGeometry }, hostRef.current, driftRef.current, angleRef.current);
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [use3D]);

  if (!use3D) return <CurlDiagram className={className} />;

  return (
    <div className={cx('relative aspect-square', className)}>
      <div ref={hostRef} className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 text-ink"
        role="img"
        aria-label="3D model of an athlete doing a bicep curl, with the shoulder, elbow and wrist tracked. The elbow angle moves between 152 and 38 degrees while shoulder drift rises from 1 to 3 degrees"
      >
        <Readout className="top-[13%] left-0" label="Shoulder drift" valueRef={driftRef} initial="1°" />
        <Readout className="top-[44%] left-0" label="Elbow angle" valueRef={angleRef} initial="152°" />
        <Readout className="right-0 bottom-0 text-right" label="Range" initial={`${CURL_ANGLE_MIN} to ${CURL_ANGLE_MAX}°`} />
      </div>
    </div>
  );
}

function Readout({ className, label, valueRef, initial }) {
  return (
    <div className={cx('absolute', className)}>
      <p className="caption-5 text-muted">{label}</p>
      <p ref={valueRef} className="stat text-xl">{initial}</p>
    </div>
  );
}

function buildScene({ THREE, RoomEnvironment, RoundedBoxGeometry }, host, driftEl, angleEl) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);

  // Studio lighting: a soft room for reflections, a key light that casts shadows, and a rim from behind.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.45;
  const key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(TARGET.x + 3, 4, 6);
  key.target.position.set(TARGET.x, TARGET.y, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 5;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.03;
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 4, bottom: -4, near: 1, far: 20 });
  const rim = new THREE.DirectionalLight(0xffffff, 1.5);
  rim.position.set(TARGET.x - 5, 2, -6);
  scene.add(key, key.target, rim);

  const overlay = (color, extra = {}) =>
    new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, toneMapped: false, ...extra });
  const mats = {
    body: new THREE.MeshPhysicalMaterial({ color: THEMES.light.body, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
    kit: new THREE.MeshPhysicalMaterial({ color: THEMES.light.kit, roughness: 0.75, sheen: 0.6, sheenRoughness: 0.6, side: THREE.DoubleSide }),
    rubber: new THREE.MeshStandardMaterial({ color: THEMES.light.rubber, roughness: 0.6 }),
    chrome: new THREE.MeshStandardMaterial({ color: THEMES.light.chrome, roughness: 0.18, metalness: 1 }),
    floor: new THREE.ShadowMaterial({ opacity: THEMES.light.shadow }),
    ring: new THREE.MeshBasicMaterial({ color: THEMES.light.overlay, transparent: true, opacity: THEMES.light.ring, toneMapped: false }),
    bone: overlay(THEMES.light.overlay),
    dotRing: overlay(THEMES.light.overlay),
    dot: overlay(VOLT),
    wedge: overlay(VOLT, { side: THREE.DoubleSide, opacity: 0.55 }),
    swept: new THREE.LineBasicMaterial({ color: THEMES.light.overlay, depthTest: false, toneMapped: false }),
    range: new THREE.LineDashedMaterial({
      color: THEMES.light.overlay, dashSize: 0.08, gapSize: 0.08, transparent: true, opacity: 0.35, depthTest: false, toneMapped: false,
    }),
  };

  const disposables = [];
  const keep = (geometry) => {
    disposables.push(geometry);
    return geometry;
  };
  const Y = new THREE.Vector3(0, 1, 0);
  const v = (x, y, z = 0) => new THREE.Vector3(x, y, z);

  const add = (mesh, solid = true) => {
    mesh.castShadow = solid;
    mesh.receiveShadow = solid;
    scene.add(mesh);
    return mesh;
  };
  const latheFrom = (points, segments = 40) => {
    const smooth = new THREE.SplineCurve(points.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(48);
    return keep(new THREE.LatheGeometry(smooth.map((p) => new THREE.Vector2(Math.max(0, p.x), p.y)), segments));
  };
  const limbGeometry = Object.fromEntries(Object.entries(PROFILES).map(([name, points]) => [name, latheFrom(points, 32)]));
  const sphereGeometry = keep(new THREE.SphereGeometry(1, 40, 20));

  const sphere = (radius, mat, at, scale = [1, 1, 1]) => {
    const mesh = add(new THREE.Mesh(sphereGeometry, mat));
    if (at) mesh.position.copy(at);
    mesh.scale.set(radius * scale[0], radius * scale[1], radius * scale[2]);
    return mesh;
  };
  const roundedBox = (size, radius, mat) => add(new THREE.Mesh(keep(new RoundedBoxGeometry(...size, 4, radius)), mat));
  const limb = (profile, mat) => add(new THREE.Mesh(limbGeometry[profile], mat));
  // Stretches a limb from a to b and returns the unit direction.
  const placeLimb = (mesh, a, b) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    mesh.position.copy(a).addScaledVector(dir, 0.5);
    mesh.scale.y = dir.length();
    mesh.quaternion.setFromUnitVectors(Y, dir.normalize());
    return dir;
  };
  const staticLimb = (profile, mat, a, b) => {
    const mesh = limb(profile, mat);
    placeLimb(mesh, a, b);
    return mesh;
  };

  // ── Torso: a turned chest and shorts, squashed so the body is wider side to side than front to back.
  const chest = add(new THREE.Mesh(latheFrom(CHEST), mats.body));
  const shorts = add(new THREE.Mesh(latheFrom(SHORTS), mats.kit));
  for (const part of [chest, shorts]) {
    part.position.x = 1.56;
    part.scale.set(1.1, 1, 1.5);
  }
  for (const z of [0.47, -0.47]) sphere(0.15, mats.body, v(1.6, -1.13, z), [1.05, 1, 0.9]);
  for (const z of [0.13, -0.13]) sphere(0.155, mats.kit, v(1.4, -2.8, z), [0.8, 1, 1]);

  // ── Head and neck. The chin, nose and ears show which way the figure faces when it turns.
  staticLimb('neck', mats.body, v(1.6, -1.02), v(1.67, -0.64));
  sphere(0.22, mats.body, v(1.69, -0.4), [1, 1.17, 0.9]);
  sphere(0.12, mats.body, v(1.78, -0.55), [0.95, 0.8, 0.85]);
  sphere(0.035, mats.body, v(1.9, -0.42), [1.1, 1.3, 0.8]);
  for (const z of [0.195, -0.195]) sphere(0.05, mats.body, v(1.64, -0.43, z), [0.7, 1.1, 0.45]);

  // ── Legs with a slight soft knee, shorts sleeves and trainers.
  for (const z of [0.19, -0.19]) {
    const hip = v(1.5, -2.95, z);
    const knee = v(1.58, -3.86, z);
    const ankle = v(1.5, -4.7, z);
    staticLimb('thigh', mats.body, hip, knee);
    staticLimb('shortsLeg', mats.kit, v(1.5, -2.86, z), hip.clone().lerp(knee, 0.45));
    sphere(0.1, mats.body, knee);
    staticLimb('shin', mats.body, knee, ankle);
    sphere(0.065, mats.body, ankle);
    roundedBox([0.44, 0.13, 0.17], 0.055, mats.kit).position.set(1.6, -4.775, z);
  }

  // ── Far arm hangs relaxed against the thigh.
  const farShoulder = v(1.58, -1.14, -ARM_Z);
  const farElbow = v(1.6, -2.56, -ARM_Z - 0.03);
  const farWrist = v(1.74, -3.88, -ARM_Z);
  staticLimb('upperArm', mats.body, farShoulder, farElbow);
  sphere(0.072, mats.body, farElbow);
  const farForearm = staticLimb('forearm', mats.body, farElbow, farWrist);
  const farHand = roundedBox([0.15, 0.24, 0.08], 0.035, mats.body);
  farHand.quaternion.copy(farForearm.quaternion);
  farHand.position.copy(farWrist).add(v(0.02, -0.11));

  // ── Working arm: upper arm with a bicep that swells as it contracts, forearm and a closed fist.
  const shoulder = v(SHOULDER.x, SHOULDER.y, ARM_Z);
  const upperArm = limb('upperArm', mats.body);
  const bicep = sphere(1, mats.body);
  const elbowCap = sphere(0.072, mats.body);
  const forearm = limb('forearm', mats.body);
  const fist = roundedBox([0.17, 0.19, 0.16], 0.06, mats.body);

  // Dumbbell with rubber plates and a chrome handle, pointing into the screen like a real side-on curl.
  const dumbbell = new THREE.Group();
  const part = (geometry, mat, z = 0) => {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.z = z;
    mesh.castShadow = true;
    dumbbell.add(mesh);
  };
  // Plates are turned with rounded edges so they catch the light.
  const plate = (radius, depth) => {
    const h = depth / 2;
    const c = 0.018;
    return latheFrom([[0, -h], [radius - c, -h], [radius, -h + c], [radius, h - c], [radius - c, h], [0, h]], 48);
  };
  part(keep(new THREE.CylinderGeometry(0.032, 0.032, 0.66, 24)), mats.chrome);
  for (const side of [-1, 1]) {
    part(keep(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 24)), mats.chrome, side * 0.2);
    part(plate(0.23, 0.075), mats.rubber, side * 0.258);
    part(plate(0.2, 0.06), mats.rubber, side * 0.326);
    part(keep(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 24)), mats.chrome, side * 0.37);
  }
  scene.add(dumbbell);

  // ── Floor: a soft contact shadow and a faint turntable ring.
  const floor = new THREE.Mesh(keep(new THREE.CircleGeometry(2.4, 64)), mats.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(1.6, FLOOR_Y, 0);
  floor.receiveShadow = true;
  const ring = new THREE.Mesh(keep(new THREE.RingGeometry(1.15, 1.17, 128)), mats.ring);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(1.6, FLOOR_Y + 0.002, 0);
  scene.add(floor, ring);

  // ── Pose tracking drawn over the working arm, the way FitMon reads it from the camera.
  const boneGeometry = keep(new THREE.CylinderGeometry(0.018, 0.018, 1, 12));
  const bones = [0, 1].map(() => {
    const mesh = new THREE.Mesh(boneGeometry, mats.bone);
    mesh.renderOrder = 10;
    scene.add(mesh);
    return mesh;
  });
  const dots = [0, 1, 2].map(() => {
    const outline = new THREE.Mesh(sphereGeometry, mats.dotRing);
    outline.scale.setScalar(0.075);
    outline.renderOrder = 11;
    const fill = new THREE.Mesh(sphereGeometry, mats.dot);
    fill.scale.setScalar(0.055);
    fill.renderOrder = 12;
    scene.add(outline, fill);
    return [outline, fill];
  });

  const wedge = new THREE.Mesh(new THREE.BufferGeometry(), mats.wedge);
  const swept = new THREE.Line(new THREE.BufferGeometry(), mats.swept);
  const range = new THREE.Line(new THREE.BufferGeometry(), mats.range);
  wedge.renderOrder = 8;
  swept.renderOrder = 9;
  range.renderOrder = 9;
  scene.add(wedge, swept, range);

  const arcPoints = (center, radius, from, to, steps = 48) =>
    Array.from({ length: steps + 1 }, (_, i) => {
      const a = from + ((to - from) * i) / steps;
      return v(center.x + radius * Math.cos(a), center.y + radius * Math.sin(a), ARM_Z);
    });
  const setLine = (line, points) => {
    line.geometry.dispose();
    line.geometry = new THREE.BufferGeometry().setFromPoints(points);
    if (line.material.isLineDashedMaterial) line.computeLineDistances();
  };

  const rad = (degrees) => (degrees * Math.PI) / 180;

  function pose(progress, seconds) {
    const angle = curlAngle(progress);
    const drift = curlDrift(progress);
    const elbow = v(SHOULDER.x + UPPER_ARM * Math.sin(rad(drift)), SHOULDER.y - UPPER_ARM * Math.cos(rad(drift)), ARM_Z);
    const toShoulder = Math.atan2(shoulder.y - elbow.y, shoulder.x - elbow.x);
    // y is up here, so swinging forward is clockwise, the negative direction.
    const forearmDir = toShoulder - rad(angle);
    const along = v(Math.cos(forearmDir), Math.sin(forearmDir));
    const wrist = elbow.clone().addScaledVector(along, FOREARM);

    const armDir = placeLimb(upperArm, shoulder, elbow);
    placeLimb(forearm, elbow, wrist);
    elbowCap.position.copy(elbow);

    // The bicep sits on the front of the upper arm and swells as the curl closes.
    const swell = 1 + 0.45 * progress;
    bicep.quaternion.copy(upperArm.quaternion);
    bicep.scale.set(0.082 * swell, 0.4, 0.088 * swell);
    bicep.position.copy(shoulder).lerp(elbow, 0.45).add(v(-armDir.y, armDir.x).multiplyScalar(0.04 * swell));

    fist.quaternion.copy(forearm.quaternion);
    fist.position.copy(wrist).addScaledVector(along, 0.08);
    dumbbell.position.copy(wrist).addScaledVector(along, 0.09);
    dumbbell.rotation.z = forearmDir;

    // A slow breath keeps the figure from looking frozen.
    chest.scale.z = 1.5 * (1 + 0.012 * Math.sin(seconds * 1.7));

    [[shoulder, elbow], [elbow, wrist]].forEach(([a, b], i) => placeLimb(bones[i], a, b));
    [shoulder, elbow, wrist].forEach((point, i) => dots[i].forEach((mesh) => mesh.position.copy(point)));

    wedge.geometry.dispose();
    wedge.geometry = new THREE.CircleGeometry(0.45, 32, forearmDir, rad(angle));
    wedge.position.copy(elbow);

    setLine(range, arcPoints(elbow, FOREARM, toShoulder - rad(CURL_ANGLE_MAX), toShoulder - rad(CURL_ANGLE_MIN)));
    setLine(swept, arcPoints(elbow, FOREARM, toShoulder - rad(CURL_ANGLE_MAX), forearmDir));

    driftEl.textContent = `${Math.max(1, Math.round(drift))}°`;
    angleEl.textContent = `${Math.round(angle)}°`;
  }

  function applyTheme() {
    const colors = THEMES[document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'];
    mats.body.color.set(colors.body);
    mats.kit.color.set(colors.kit);
    mats.rubber.color.set(colors.rubber);
    mats.chrome.color.set(colors.chrome);
    mats.floor.opacity = colors.shadow;
    mats.ring.color.set(colors.overlay);
    mats.ring.opacity = colors.ring;
    for (const mat of [mats.bone, mats.dotRing, mats.swept, mats.range]) mat.color.set(colors.overlay);
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

  // Drag sideways to turn the figure; it keeps a little momentum when you let go.
  let userYaw = 0;
  let spin = 0;
  let drag = null;
  const onDown = (event) => {
    drag = { x: event.clientX, yaw: userYaw };
    host.setPointerCapture(event.pointerId);
  };
  const onMove = (event) => {
    if (!drag) return;
    const next = drag.yaw + (event.clientX - drag.x) * 0.012;
    spin = next - userYaw;
    userYaw = next;
  };
  const onUp = () => {
    drag = null;
  };
  host.addEventListener('pointerdown', onDown);
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerup', onUp);
  host.addEventListener('pointercancel', onUp);

  let frame = null;
  let last = null;
  let clock = 0;
  const tick = (now) => {
    if (last !== null) clock += Math.min((now - last) / 1000, 0.1);
    last = now;
    pose(curlProgress(clock), clock);
    if (!drag) {
      userYaw += spin;
      spin *= 0.92;
    }
    // Starts at three quarters so the body reads as solid, then sways slowly around it.
    const orbit = 0.6 + userYaw + Math.sin(clock * 0.35) * 0.35;
    const distance = 10;
    camera.position.set(TARGET.x + distance * Math.sin(orbit), TARGET.y + 1.1, TARGET.z + distance * Math.cos(orbit));
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
    host.removeEventListener('pointerdown', onDown);
    host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerup', onUp);
    host.removeEventListener('pointercancel', onUp);
    [wedge, swept, range].forEach((object) => object.geometry.dispose());
    disposables.forEach((geometry) => geometry.dispose());
    Object.values(mats).forEach((mat) => mat.dispose());
    environment.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
