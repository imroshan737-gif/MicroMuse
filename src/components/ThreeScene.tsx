import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense, useRef, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';

function NetworkNodes() {
  const count = 40;
  const ref = useRef<THREE.Group>(null);

  const { nodes, edges } = useMemo(() => {
    const nodePositions: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      nodePositions.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 35,
          (Math.random() - 0.5) * 20 - 5
        )
      );
    }

    const edgePairs: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 12) {
          edgePairs.push([i, j]);
        }
      }
    }

    return { nodes: nodePositions, edges: edgePairs };
  }, []);

  const linePositions = useMemo(() => {
    const positions: number[] = [];
    edges.forEach(([a, b]) => {
      positions.push(nodes[a].x, nodes[a].y, nodes[a].z);
      positions.push(nodes[b].x, nodes[b].y, nodes[b].z);
    });
    return new Float32Array(positions);
  }, [nodes, edges]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      {/* Thin network lines only */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#8a8a8a" transparent opacity={0.45} />
      </lineSegments>
    </group>
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
      
      <NetworkNodes />
      
      
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
