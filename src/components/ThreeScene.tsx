import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Suspense, useRef, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';

function NetworkGrid() {
  const groupRef = useRef<THREE.Group>(null);

  // Evenly distributed grid nodes across full viewport
  const { linePositions, glowPositions } = useMemo(() => {
    const cols = 16;
    const rows = 10;
    const depthLayers = 3;
    const spreadX = 160;
    const spreadY = 100;
    const spreadZ = 30;

    const nodes: THREE.Vector3[] = [];
    for (let layer = 0; layer < depthLayers; layer++) {
      const z = -15 + layer * (spreadZ / depthLayers) + (Math.random() - 0.5) * 4;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = -spreadX / 2 + c * (spreadX / (cols - 1)) + (Math.random() - 0.5) * (spreadX / cols) * 0.5;
          const y = -spreadY / 2 + r * (spreadY / (rows - 1)) + (Math.random() - 0.5) * (spreadY / rows) * 0.5;
          nodes.push(new THREE.Vector3(x, y, z));
        }
      }
    }

    // Edges — connect nearby nodes (max 2 connections per node)
    const edgeVerts: number[] = [];
    const used = new Map<number, number>();
    for (let i = 0; i < nodes.length; i++) {
      if ((used.get(i) ?? 0) >= 2) continue;
      for (let j = i + 1; j < nodes.length; j++) {
        if ((used.get(j) ?? 0) >= 2) continue;
        const d = nodes[i].distanceTo(nodes[j]);
        if (d < 14) {
          edgeVerts.push(nodes[i].x, nodes[i].y, nodes[i].z);
          edgeVerts.push(nodes[j].x, nodes[j].y, nodes[j].z);
          used.set(i, (used.get(i) ?? 0) + 1);
          used.set(j, (used.get(j) ?? 0) + 1);
          if ((used.get(i) ?? 0) >= 2) break;
        }
      }
    }

    // Subtle glow points at intersections (every 5th node)
    const glow: number[] = [];
    for (let i = 0; i < nodes.length; i += 5) {
      glow.push(nodes[i].x, nodes[i].y, nodes[i].z);
    }

    return {
      linePositions: new Float32Array(edgeVerts),
      glowPositions: new Float32Array(glow),
    };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.rotation.y = Math.sin(t * 0.012) * 0.06;
      groupRef.current.rotation.x = Math.cos(t * 0.008) * 0.025;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={linePositions.length / 3} array={linePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#3a4255" transparent opacity={0.28} />
      </lineSegments>

      {/* Tiny diamond-shaped glow markers (not circles) */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={glowPositions.length / 3} array={glowPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#6b9fff" size={0.3} transparent opacity={0.45} sizeAttenuation />
      </points>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.06} />
      <Stars radius={180} depth={90} count={1000} factor={3.5} saturation={0.4} fade speed={0.08} />
      <NetworkGrid />
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
        camera={{ position: [0, 0, 25], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background/80 pointer-events-none" />
    </div>
  );
}
