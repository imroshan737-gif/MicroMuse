import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense, useRef, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';

function NetworkNodes() {
  const ref = useRef<THREE.Group>(null);
  
  const { positions, connections } = useMemo(() => {
    const count = 40;
    const pos: [number, number, number][] = [];
    const conn: [number, number][] = [];
    
    for (let i = 0; i < count; i++) {
      pos.push([
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15 - 10,
      ]);
    }
    
    // Connect nearby nodes
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = pos[i][0] - pos[j][0];
        const dy = pos[i][1] - pos[j][1];
        const dz = pos[i][2] - pos[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 8) conn.push([i, j]);
      }
    }
    
    return { positions: pos, connections: conn };
  }, []);

  const linePositions = useMemo(() => {
    const arr = new Float32Array(connections.length * 6);
    connections.forEach(([a, b], i) => {
      arr[i * 6] = positions[a][0];
      arr[i * 6 + 1] = positions[a][1];
      arr[i * 6 + 2] = positions[a][2];
      arr[i * 6 + 3] = positions[b][0];
      arr[i * 6 + 4] = positions[b][1];
      arr[i * 6 + 5] = positions[b][2];
    });
    return arr;
  }, [positions, connections]);

  const nodePositions = useMemo(() => {
    const arr = new Float32Array(positions.length * 3);
    positions.forEach((p, i) => {
      arr[i * 3] = p[0];
      arr[i * 3 + 1] = p[1];
      arr[i * 3 + 2] = p[2];
    });
    return arr;
  }, [positions]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
      ref.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.02) * 0.05;
    }
  });

  return (
    <group ref={ref}>
      {/* Connection lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={connections.length * 2}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#4ECDC4" transparent opacity={0.12} />
      </lineSegments>
      
      {/* Nodes */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length}
            array={nodePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#4ECDC4"
          transparent
          opacity={0.5}
          sizeAttenuation
        />
      </points>
    </group>
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


function SubtleGlow({ position, color, size }: { position: [number, number, number]; color: string; size: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.15;
      meshRef.current.scale.setScalar(size + pulse);
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.06} />
    </mesh>
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
      <FloatingParticles />
      
      {/* Subtle ambient glows */}
      <SubtleGlow position={[-10, 4, -18]} color="#4ECDC4" size={3} />
      <SubtleGlow position={[8, -3, -22]} color="#FF6B6B" size={2.5} />
      <SubtleGlow position={[0, 6, -25]} color="#667EEA" size={3.5} />
      
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
