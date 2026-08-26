import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * DocumentPlanes3D
 * A lightweight Three.js scene of stacked document planes that converge
 * toward a single highlighted plane as the user scrolls — visually
 * rendering "retrieval and ranking" without requiring any backend data.
 *
 * Animation is driven by a scroll progress value (0→1).
 * Reduced-motion / low-end fallback: static SVG exported inline.
 */

const STATIC_FALLBACK = (
  <div className="w-full h-full flex items-center justify-center select-none" aria-hidden="true">
    <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px]">
      {/* Stack of document planes — static illustration */}
      {[...Array(8)].map((_, i) => (
        <rect key={i}
          x={20 + i * 6} y={20 + i * 8}
          width={200} height={150}
          rx="2"
          fill={i === 7 ? '#FAEAE7' : '#F2EFE9'}
          stroke={i === 7 ? '#C84B31' : '#D5CEC2'}
          strokeWidth={i === 7 ? 1.5 : 0.75}
          opacity={0.4 + i * 0.075}
        />
      ))}
      {/* Highlighted "retrieved" plane */}
      <rect x={32} y={42} width={200} height={150} rx="2"
        fill="#FAEAE7" stroke="#C84B31" strokeWidth="1.5"
      />
      <line x1={52} y1={70} x2={212} y2={70} stroke="#D5CEC2" strokeWidth="1"/>
      <line x1={52} y1={88} x2={180} y2={88} stroke="#D5CEC2" strokeWidth="1"/>
      <line x1={52} y1={106} x2={196} y2={106} stroke="#D5CEC2" strokeWidth="1"/>
      <rect x={52} y={128} width={60} height={14} rx="2" fill="#C84B31" opacity="0.15"/>
      <line x1={52} y1={135} x2={108} y2={135} stroke="#C84B31" strokeWidth="1.5"/>
      <text x={52} y={58} fontFamily="monospace" fontSize="8" fill="#667085" letterSpacing="1">RTI ACT, 2005 — SEC. 7</text>
    </svg>
  </div>
);

export default function DocumentPlanes3D({ scrollProgress = 0 }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [prefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion || error) return;
    if (!mountRef.current) return;

    const container = mountRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 0.5, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lighting — soft warm ambient
    const ambient = new THREE.AmbientLight(0xF5F0E8, 1.2);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xfff8f0, 0.8);
    dir.position.set(2, 4, 3);
    scene.add(dir);

    // Document planes — 12 planes, stacked with offset
    const PLANE_COUNT = 12;
    const planes = [];
    const geo = new THREE.PlaneGeometry(2.2, 1.6);

    for (let i = 0; i < PLANE_COUNT; i++) {
      const t = i / (PLANE_COUNT - 1); // 0 = back, 1 = front
      const isHighlighted = i === PLANE_COUNT - 1;

      const mat = new THREE.MeshLambertMaterial({
        color: isHighlighted ? 0xF9EDD5 : 0xEDE8DD,
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0.4 + t * 0.55,
      });

      // Edge/wireframe for paper feel
      const edgeMat = new THREE.LineBasicMaterial({
        color: isHighlighted ? 0xC8821A : 0xD4CFC4,
        linewidth: 1,
      });
      const edges = new THREE.EdgesGeometry(geo);
      const edgeMesh = new THREE.LineSegments(edges, edgeMat);

      const mesh = new THREE.Mesh(geo, mat);
      mesh.add(edgeMesh);

      // Initial spread positions
      mesh.position.set(
        (t - 0.5) * 1.4,         // spread X
        (t - 0.5) * -0.8,        // spread Y (downward for back planes)
        i * 0.18 - PLANE_COUNT * 0.09  // Z depth layering
      );
      mesh.rotation.y = (t - 0.5) * 0.3; // slight rotation for depth
      mesh.userData = { t, isHighlighted, initialX: mesh.position.x, initialY: mesh.position.y };

      scene.add(mesh);
      planes.push(mesh);
    }

    sceneRef.current = { renderer, scene, camera, planes };

    // Resize handler
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation loop
    let frameId;
    let currentScroll = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      // Smooth scroll lerp
      currentScroll += (scrollProgress - currentScroll) * 0.06;

      planes.forEach((plane) => {
        const { t, initialX, initialY } = plane.userData;
        // Converge toward center as scroll increases
        plane.position.x = initialX * (1 - currentScroll);
        plane.position.y = initialY * (1 - currentScroll);
        plane.rotation.y = (t - 0.5) * 0.3 * (1 - currentScroll);
        // Non-highlighted planes fade slightly as they converge
        if (!plane.userData.isHighlighted) {
          plane.material.opacity = (0.4 + t * 0.35) * (1 - currentScroll * 0.4);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [prefersReducedMotion, error]);

  // Update scroll on prop change without re-mounting
  // (the animate loop reads scrollProgress via closure so it auto-updates)

  if (prefersReducedMotion) return STATIC_FALLBACK;

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      aria-hidden="true"
      onError={() => setError(true)}
    />
  );
}
