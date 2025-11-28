import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';

function FloatingShape({ position, color, size = 1, audioReactive = false }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const audioLevel = useStore((state) => state.audioLevel);
  const intensity = useStore((state) => state.settings.threeDIntensity);
  
  return (
    <Float
      speed={2}
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
          />
        </Sphere>
      </mesh>
    </Float>
  );
}

function Scene() {
  const theme = useStore((state) => state.settings.theme);
  
  const themeColors = {
    studio: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8DADC'],
    galaxy: ['#667EEA', '#764BA2', '#F093FB', '#4FACFE'],
    watercolor: ['#FA709A', '#FEE140', '#30CFD0', '#A8EDEA'],
  };
  
  const colors = themeColors[theme];
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4ECDC4" />
      
      {/* Floating Creative Shapes */}
      <FloatingShape position={[-3, 2, -2]} color={colors[0]} size={1.2} audioReactive />
      <FloatingShape position={[3, -1, -3]} color={colors[1]} size={0.8} />
      <FloatingShape position={[0, 0, -5]} color={colors[2]} size={1.5} audioReactive />
      <FloatingShape position={[-2, -2, -1]} color={colors[3]} size={0.6} />
      <FloatingShape position={[2, 3, -4]} color={colors[0]} size={1} />
      <FloatingShape position={[4, 0, -2]} color={colors[2]} size={0.9} audioReactive />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
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
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={energySaver ? 1 : [1, 2]}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-cosmic opacity-60" />
    </div>
  );
}
