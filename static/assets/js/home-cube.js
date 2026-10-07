import * as THREE from "three";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const createFaceTexture = ({ title, subtitle, tone }) => {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, tone[0]);
  gradient.addColorStop(1, tone[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 18;
  ctx.strokeRect(28, 28, size - 56, size - 56);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.arc(size * 0.78, size * 0.22, 90, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f5f5f5";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (subtitle) {
    ctx.font = "700 42px Arial, sans-serif";
    ctx.letterSpacing = "0.18em";
    ctx.fillText(subtitle, size / 2, size * 0.28);
  }

  ctx.font = title.length > 3 ? "700 150px Tahoma, Arial, sans-serif" : "700 180px Tahoma, Arial, sans-serif";
  ctx.fillText(title, size / 2, size * (subtitle ? 0.58 : 0.52));

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};

const mountCube = (host) => {
  const canvas = host.querySelector("canvas");
  const fallback = host.querySelector(".home-event-card-cube-fallback");
  const number = host.dataset.number || "۲۸۰";
  const label = host.dataset.label || "TEHLUG";

  if (!canvas || reduceMotion) {
    if (fallback) {
      fallback.hidden = false;
    }
    if (canvas) {
      canvas.hidden = true;
    }
    return;
  }

  const width = host.clientWidth || 112;
  const height = host.clientHeight || 216;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
  camera.position.set(0, 0.15, 4.2);

  const ambient = new THREE.AmbientLight(0xffffff, 0.85);
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(2.4, 3.2, 4);
  const fill = new THREE.DirectionalLight(0xb0b0b0, 0.45);
  fill.position.set(-3, -1, 2);
  scene.add(ambient, key, fill);

  const tones = [
    ["#2a2a2a", "#141414"],
    ["#3a3a3a", "#1c1c1c"],
    ["#242424", "#101010"],
    ["#303030", "#181818"],
    ["#262626", "#121212"],
    ["#343434", "#1a1a1a"],
  ];

  const materials = [
    new THREE.MeshStandardMaterial({ map: createFaceTexture({ title: "TL", tone: tones[0] }), roughness: 0.42, metalness: 0.28 }),
    new THREE.MeshStandardMaterial({ map: createFaceTexture({ title: label, tone: tones[1] }), roughness: 0.42, metalness: 0.28 }),
    new THREE.MeshStandardMaterial({ map: createFaceTexture({ title: number, subtitle: label, tone: tones[2] }), roughness: 0.4, metalness: 0.32 }),
    new THREE.MeshStandardMaterial({ map: createFaceTexture({ title: number, tone: tones[3] }), roughness: 0.4, metalness: 0.32 }),
    new THREE.MeshStandardMaterial({ map: createFaceTexture({ title: number, subtitle: "SESSION", tone: tones[4] }), roughness: 0.38, metalness: 0.35 }),
    new THREE.MeshStandardMaterial({ map: createFaceTexture({ title: "۳", subtitle: "بعدی", tone: tones[5] }), roughness: 0.45, metalness: 0.25 }),
  ];

  const cube = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.55, 1.55), materials);
  cube.rotation.set(0.45, -0.65, 0.18);
  scene.add(cube);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(cube.geometry),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 }),
  );
  cube.add(edges);

  const pointer = { active: false, x: 0, y: 0, vx: 0, vy: 0 };
  let targetX = cube.rotation.x;
  let targetY = cube.rotation.y;
  let hovering = false;

  const onPointerDown = (event) => {
    pointer.active = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    host.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!pointer.active) {
      return;
    }
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.vx = dx * 0.008;
    pointer.vy = dy * 0.008;
    targetY += pointer.vx;
    targetX += pointer.vy;
  };

  const onPointerUp = () => {
    pointer.active = false;
  };

  host.addEventListener("pointerdown", onPointerDown);
  host.addEventListener("pointermove", onPointerMove);
  host.addEventListener("pointerup", onPointerUp);
  host.addEventListener("pointercancel", onPointerUp);
  host.addEventListener("pointerenter", () => {
    hovering = true;
  });
  host.addEventListener("pointerleave", () => {
    hovering = false;
    pointer.active = false;
  });

  const resize = () => {
    const nextWidth = host.clientWidth || width;
    const nextHeight = host.clientHeight || height;
    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(nextWidth, nextHeight, false);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  let frame = 0;
  const animate = () => {
    frame = window.requestAnimationFrame(animate);

    if (!pointer.active) {
      const spin = hovering ? 0.006 : 0.012;
      targetY += spin;
      targetX += Math.sin(performance.now() * 0.0012) * 0.0015;
      pointer.vx *= 0.94;
      pointer.vy *= 0.94;
      targetY += pointer.vx;
      targetX += pointer.vy;
    }

    cube.rotation.x += (targetX - cube.rotation.x) * 0.12;
    cube.rotation.y += (targetY - cube.rotation.y) * 0.12;
    renderer.render(scene, camera);
  };

  animate();

  return () => {
    window.cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    host.removeEventListener("pointerdown", onPointerDown);
    host.removeEventListener("pointermove", onPointerMove);
    host.removeEventListener("pointerup", onPointerUp);
    host.removeEventListener("pointercancel", onPointerUp);
    materials.forEach((material) => {
      material.map?.dispose();
      material.dispose();
    });
    cube.geometry.dispose();
    edges.geometry.dispose();
    edges.material.dispose();
    renderer.dispose();
  };
};

const boot = () => {
  document.querySelectorAll("[data-home-cube]").forEach((host) => {
    mountCube(host);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
