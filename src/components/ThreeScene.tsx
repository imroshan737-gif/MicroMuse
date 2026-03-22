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

  const nodePositionsArray = useMemo(() => {
    const arr = new Float32Array(count * 3);
    nodes.forEach((n, i) => {
      arr[i * 3] = n.x;
      arr[i * 3 + 1] = n.y;
      arr[i * 3 + 2] = n.z;
    });
    return arr;
  }, [nodes]);

  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      {/* Network lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#888888" transparent opacity={0.35} />
      </lineSegments>

      {/* Node dots */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={nodePositionsArray}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.6}
          color="#aaaaaa"
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
          map={circleTexture}
          alphaMap={circleTexture}
          alphaTest={0.1}
        />
      </points>
    </group>
  );
}

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

  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
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
        size={0.5}
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
