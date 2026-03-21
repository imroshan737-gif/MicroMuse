import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense, useRef, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';

function FloatingCircles() {
  const count = 80;
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
      spd[i * 3] = (Math.random() - 0.5) * 0.008;
      spd[i * 3 + 1] = (Math.random() - 0.5) * 0.006;
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += speeds[i * 3];
      arr[i * 3 + 1] += speeds[i * 3 + 1];
      arr[i * 3 + 2] += speeds[i * 3 + 2];
      if (arr[i * 3] > 20) arr[i * 3] = -20;
      if (arr[i * 3] < -20) arr[i * 3] = 20;
      if (arr[i * 3 + 1] > 15) arr[i * 3 + 1] = -15;
      if (arr[i * 3 + 1] < -15) arr[i * 3 + 1] = 15;
    }
    posAttr.needsUpdate = true;
  });

  // Create a circle texture for round particles
  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        color="#4ECDC4"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        map={circleTexture}
        alphaMap={circleTexture}
        alphaTest={0.1}
      />
    </points>
  );
}

function FloatingParticles() {
  const count = 60;
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
      // Each particle gets a unique slow drift direction
      spd[i * 3] = (Math.random() - 0.5) * 0.008;
      spd[i * 3 + 1] = (Math.random() - 0.5) * 0.006;
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += speeds[i * 3];
      arr[i * 3 + 1] += speeds[i * 3 + 1];
      arr[i * 3 + 2] += speeds[i * 3 + 2];
      // Wrap around edges so particles never disappear
      if (arr[i * 3] > 20) arr[i * 3] = -20;
      if (arr[i * 3] < -20) arr[i * 3] = 20;
      if (arr[i * 3 + 1] > 15) arr[i * 3 + 1] = -15;
      if (arr[i * 3 + 1] < -15) arr[i * 3 + 1] = 15;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
        color="#E8927C"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}


function Scene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      
      <Stars 
        radius={120} 
        depth={60} 
        count={800} 
        factor={3} 
        saturation={0.3} 
        fade 
        speed={0.1} 
      />
      
      <FloatingCircles />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        maxPolarAngle={Math.PI / 1.4}
        minPolarAngle={Math.PI / 3.5}
        autoRotate
        autoRotateSpeed={0.05}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

export default function ThreeScene() {
  const enableThreeD = useStore((state) => state.settings.enableThreeD);
  const energySaver = useStore((state) => state.settings.energySaver);
  
  if (!enableThreeD || energySaver) return null;
  
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background/80 pointer-events-none" />
    </div>
  );
}
