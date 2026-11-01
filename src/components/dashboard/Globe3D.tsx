import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ShieldAlert } from 'lucide-react';

export const Globe3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.9;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // fallback handled by container
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Inner Dark Core Sphere
    const coreGeo = new THREE.SphereGeometry(0.98, 48, 48);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x050b18,
      transparent: true,
      opacity: 0.95,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // Dot Grid Sphere (Continent Points)
    const particleCount = 2200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(0x38bdf8);
    const limeColor = new THREE.Color(0xc6f432);
    const blueColor = new THREE.Color(0x1d4ed8);

    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      const r = 1.0;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color variation: mostly cyan/blue with bright lime cyber clusters
      const isLimeHotspot = (i % 23 === 0);
      const chosenColor = isLimeHotspot ? limeColor : (i % 3 === 0 ? cyanColor : blueColor);

      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Canvas circular dot texture for soft particles
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 16, 16);
    }
    const dotTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      map: dotTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particles);

    // Glowing Wireframe Latitude/Longitude lines
    const wireGeo = new THREE.SphereGeometry(1.005, 18, 18);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a8a,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // Atmospheric Glow Ring
    const atmosphereGeo = new THREE.SphereGeometry(1.07, 32, 32);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.23, 0.45, 0.95, 1.0) * intensity * 1.5;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphere);

    // Orbit Rings
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    // Ring 1 (Tilted Lime Orbit)
    const ring1Geo = new THREE.RingGeometry(1.35, 1.365, 90);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0xc6f432,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2.7;
    ring1.rotation.y = Math.PI / 8;
    orbitGroup.add(ring1);

    // Ring 2 (Tilted Cyan Orbit)
    const ring2Geo = new THREE.RingGeometry(1.5, 1.515, 90);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 3.2;
    ring2.rotation.y = -Math.PI / 6;
    orbitGroup.add(ring2);

    // Orbiting Satellite Dots
    const sat1Geo = new THREE.SphereGeometry(0.035, 12, 12);
    const sat1Mat = new THREE.MeshBasicMaterial({ color: 0xc6f432 });
    const sat1 = new THREE.Mesh(sat1Geo, sat1Mat);
    orbitGroup.add(sat1);

    const sat2Geo = new THREE.SphereGeometry(0.03, 12, 12);
    const sat2Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const sat2 = new THREE.Mesh(sat2Geo, sat2Mat);
    orbitGroup.add(sat2);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow majestic rotation
      globeGroup.rotation.y = elapsedTime * 0.12;
      globeGroup.rotation.x = 0.15 * Math.sin(elapsedTime * 0.05);

      // Orbit satellites around their paths
      const angle1 = elapsedTime * 0.8;
      const r1 = 1.36;
      sat1.position.set(
        Math.cos(angle1) * r1,
        Math.sin(angle1) * r1 * Math.cos(Math.PI / 2.7),
        Math.sin(angle1) * r1 * Math.sin(Math.PI / 2.7)
      );

      const angle2 = -elapsedTime * 0.6;
      const r2 = 1.51;
      sat2.position.set(
        Math.cos(angle2) * r2,
        Math.sin(angle2) * r2 * Math.cos(-Math.PI / 3.2),
        Math.sin(angle2) * r2 * Math.sin(-Math.PI / 3.2)
      );

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 320;
      const newHeight = container.clientHeight || 320;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      particleGeo.dispose();
      wireGeo.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] lg:h-[340px] flex items-center justify-center select-none">
      {/* Background Soft Blue Radial Glow */}
      <div className="absolute inset-0 bg-radial from-blue-600/15 via-transparent to-transparent blur-2xl pointer-events-none" />

      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing" />

      {/* Floating Holographic Shield-Alert Badge */}
      <div className="absolute top-10 right-8 sm:right-16 flex items-center justify-center pointer-events-none animate-float">
        <div className="relative p-2.5 rounded-2xl bg-[#090D14]/90 border border-[#C6F432]/60 shadow-[0_0_25px_rgba(198,244,50,0.4)] backdrop-blur-md">
          <ShieldAlert className="w-5 h-5 text-[#C6F432]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C6F432] animate-ping" />
        </div>
      </div>
    </div>
  );
};
