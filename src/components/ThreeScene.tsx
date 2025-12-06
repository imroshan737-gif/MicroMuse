import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Sphere, Stars } from '@react-three/drei';
import { Suspense, useRef, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';

function FloatingShape({ position, color, size = 1, audioReactive = false, speed = 1 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const audioLevel = useStore((state) => state.audioLevel);
  const intensity = useStore((state) => state.settings.threeDIntensity);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002 * speed;
      meshRef.current.rotation.y += 0.003 * speed;
    }
  });
  
  return (
    <Float
      speed={2 * speed}
      rotationIntensity={0.5 * intensity}
      floatIntensity={0.8 * intensity}
    >
      <mesh ref={meshRef} position={position} scale={audioReactive ? size * (1 + audioLevel * 0.5) : size}>
        <Sphere args={[1, 32, 32]}>
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={audioReactive ? 0.3 + audioLevel * 0.2 : 0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.85}
          />
        </Sphere>
      </mesh>
    </Float>
  );
}

function ParticleField() {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 50; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
        ],
        size: Math.random() * 0.1 + 0.02,
      });
    }
    return temp;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005;
      groupRef.current.rotation.x += 0.0002;
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position as [number, number, number]}>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  const theme = useStore((state) => state.settings.theme);
  
  const themeColors = {
    studio: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8DADC', '#F06292'],
    galaxy: ['#667EEA', '#764BA2', '#F093FB', '#4FACFE', '#00F5D4'],
    watercolor: ['#FA709A', '#FEE140', '#30CFD0', '#A8EDEA', '#B8E986'],
  };
  
  const colors = themeColors[theme];
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color={colors[1]} />
      <pointLight position={[0, 10, -10]} intensity={0.5} color={colors[0]} />
      
      <Stars 
        radius={100} 
        depth={50} 
        count={2000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={0.5} 
      />
      
      <ParticleField />
      
      {/* Floating Creative Shapes - More shapes for richer visuals */}
      <FloatingShape position={[-4, 2, -3]} color={colors[0]} size={1.4} audioReactive speed={0.8} />
      <FloatingShape position={[4, -1.5, -4]} color={colors[1]} size={1} speed={1.2} />
      <FloatingShape position={[0, 1, -6]} color={colors[2]} size={1.8} audioReactive speed={0.6} />
      <FloatingShape position={[-2.5, -2.5, -2]} color={colors[3]} size={0.7} speed={1.4} />
      <FloatingShape position={[2.5, 3, -5]} color={colors[0]} size={1.1} speed={0.9} />
      <FloatingShape position={[5, 0.5, -3]} color={colors[2]} size={0.9} audioReactive speed={1.1} />
      <FloatingShape position={[-3, 3.5, -7]} color={colors[4]} size={0.6} speed={1.3} />
      <FloatingShape position={[1, -3, -4]} color={colors[1]} size={0.8} speed={1} />
      <FloatingShape position={[-5, 0, -5]} color={colors[3]} size={1.2} audioReactive speed={0.7} />
      <FloatingShape position={[3, 2, -8]} color={colors[4]} size={0.5} speed={1.5} />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
        autoRotate
        autoRotateSpeed={0.3}
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
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={energySaver ? 1 : [1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background/90 pointer-events-none" />
    </div>
  );
}