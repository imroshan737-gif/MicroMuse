import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense, useRef, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';

function NetworkNodes() {
  const count = 60;
  const ref = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    const nodePositions: THREE.Vector3[] = [];
    // Spread nodes evenly across the entire screen using a larger grid
    const cols = 12;
    const rows = 8;
    const spacingX = 120 / cols;
    const spacingY = 80 / rows;
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols) % rows;
      nodePositions.push(
        new THREE.Vector3(
          -60 + col * spacingX + (Math.random() - 0.5) * spacingX * 0.6,
          -40 + row * spacingY + (Math.random() - 0.5) * spacingY * 0.6,
          (Math.random() - 0.5) * 20 - 5
        )
      );
    }
    return nodePositions;
  }, []);

  // Build edges connecting nearby nodes - thin lines only
  const linePositions = useMemo(() => {
    const edgePairs: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      let connections = 0;
      for (let j = i + 1; j < count; j++) {
        if (connections >= 3) break; // limit connections per node
        if (nodes[i].distanceTo(nodes[j]) < 18) {
          edgePairs.push([i, j]);
          connections++;
        }
      }
    }
    const positions: number[] = [];
    edgePairs.forEach(([a, b]) => {
      positions.push(nodes[a].x, nodes[a].y, nodes[a].z);
      positions.push(nodes[b].x, nodes[b].y, nodes[b].z);
    });
    return new Float32Array(positions);
  }, [nodes]);

  // Small glowing dots at node intersections
  const dotPositions = useMemo(() => {
    const positions: number[] = [];
    // Only place dots at every 3rd node for subtlety
    for (let i = 0; i < count; i += 3) {
      positions.push(nodes[i].x, nodes[i].y, nodes[i].z);
    }
    return new Float32Array(positions);
  }, [nodes]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.015) * 0.08;
      ref.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.01) * 0.03;
    }
  });

  return (
    <group ref={ref}>
      {/* Network lines - thin and spread evenly */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#4a5568" transparent opacity={0.35} />
      </lineSegments>

      {/* Small glowing dots at some intersections */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dotPositions.length / 3}
            array={dotPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#63b3ed" size={0.4} transparent opacity={0.6} sizeAttenuation />
      </points>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.08} />
      
      <Stars 
        radius={150} 
        depth={80} 
        count={800} 
        factor={3.5} 
        saturation={0.3} 
        fade 
        speed={0.1} 
      />
      
      <NetworkNodes />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        maxPolarAngle={Math.PI / 1.4}
        minPolarAngle={Math.PI / 3.5}
        autoRotate
        autoRotateSpeed={0.04}
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
        camera={{ position: [0, 0, 20], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-background/30 to-background/70 pointer-events-none" />
    </div>
  );
}
