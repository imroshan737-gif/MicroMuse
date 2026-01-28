import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Sphere, Stars, Environment, Sparkles } from '@react-three/drei';
import { Suspense, useRef, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';

function FloatingShape({ position, color, size = 1, audioReactive = false, speed = 1, distort = 0.3 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const audioLevel = useStore((state) => state.audioLevel);
  const intensity = useStore((state) => state.settings.threeDIntensity);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001 * speed;
      meshRef.current.rotation.y += 0.002 * speed;
      
      // Subtle breathing effect
      const breathe = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.02;
      meshRef.current.scale.setScalar((audioReactive ? size * (1 + audioLevel * 0.3) : size) + breathe);
    }
  });
  
  return (
    <Float
      speed={1.5 * speed}
      rotationIntensity={0.4 * intensity}
      floatIntensity={0.6 * intensity}
    >
      <mesh ref={meshRef} position={position}>
        <Sphere args={[1, 64, 64]}>
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={audioReactive ? distort + audioLevel * 0.15 : distort}
            speed={1.5}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.7}
            envMapIntensity={1}
          />
        </Sphere>
      </mesh>
    </Float>
  );
}

function GlowingSphere({ position, color, size }: { position: [number, number, number]; color: string; size: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
      const pulse = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
      meshRef.current.scale.setScalar(size + pulse);
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

function ParticleRing() {
  const ref = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      const angle = (i / 200) * Math.PI * 2;
      const radius = 8 + Math.random() * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.0005;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });
  
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#FF6B6B"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function MovingLights() {
  const light1Ref = useRef<THREE.PointLight>(null);
  const light2Ref = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (light1Ref.current) {
      light1Ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 10;
      light1Ref.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 10;
    }
    if (light2Ref.current) {
      light2Ref.current.position.x = Math.cos(state.clock.elapsedTime * 0.3) * 8;
      light2Ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 5;
    }
  });
  
  return (
    <>
      <pointLight ref={light1Ref} position={[10, 5, 10]} intensity={0.5} color="#FF6B6B" />
      <pointLight ref={light2Ref} position={[-10, 0, -10]} intensity={0.4} color="#4ECDC4" />
    </>
  );
}

function NebulaCloud({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x += 0.0005;
      ref.current.rotation.y += 0.0003;
    }
  });
  
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[2, 3]} />
      <meshBasicMaterial color={color} transparent opacity={0.05} wireframe />
    </mesh>
  );
}

function Scene() {
  const theme = useStore((state) => state.settings.theme);
  
  const themeColors = {
    studio: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8DADC', '#F06292', '#9B59B6'],
    galaxy: ['#667EEA', '#764BA2', '#F093FB', '#4FACFE', '#00F5D4', '#FF6B9D'],
    watercolor: ['#FA709A', '#FEE140', '#30CFD0', '#A8EDEA', '#B8E986', '#FF9A8B'],
  };
  
  const colors = themeColors[theme];
  
  return (
    <>
      <ambientLight intensity={0.2} />
      <MovingLights />
      <pointLight position={[0, 15, 0]} intensity={0.3} color="#fff" />
      
      <Stars 
        radius={150} 
        depth={80} 
        count={3000} 
        factor={5} 
        saturation={0.5} 
        fade 
        speed={0.15} 
      />
      
      <Sparkles
        count={100}
        size={2}
        scale={30}
        speed={0.15}
        opacity={0.5}
        color={colors[0]}
      />
      
      <ParticleRing />
      
      {/* Nebula clouds for depth */}
      <NebulaCloud position={[-15, 5, -20]} color={colors[1]} scale={3} />
      <NebulaCloud position={[15, -5, -25]} color={colors[0]} scale={2.5} />
      <NebulaCloud position={[0, 10, -30]} color={colors[2]} scale={4} />
      
      {/* Glowing background spheres */}
      <GlowingSphere position={[-12, 4, -15]} color={colors[0]} size={2} />
      <GlowingSphere position={[10, -3, -18]} color={colors[1]} size={1.5} />
      <GlowingSphere position={[0, 8, -22]} color={colors[2]} size={2.5} />
      
      {/* Main floating shapes with distortion */}
      <FloatingShape position={[-5, 2, -4]} color={colors[0]} size={1.6} audioReactive speed={0.6} distort={0.4} />
      <FloatingShape position={[5, -1.5, -5]} color={colors[1]} size={1.2} speed={0.9} distort={0.3} />
      <FloatingShape position={[0, 1, -7]} color={colors[2]} size={2} audioReactive speed={0.5} distort={0.5} />
      <FloatingShape position={[-3, -3, -3]} color={colors[3]} size={0.8} speed={1.1} distort={0.2} />
      <FloatingShape position={[3, 4, -6]} color={colors[0]} size={1.3} speed={0.7} distort={0.35} />
      <FloatingShape position={[6, 0.5, -4]} color={colors[4]} size={1} audioReactive speed={0.8} distort={0.3} />
      <FloatingShape position={[-4, 4, -8]} color={colors[5]} size={0.7} speed={1} distort={0.25} />
      <FloatingShape position={[2, -4, -5]} color={colors[1]} size={0.9} speed={0.85} distort={0.28} />
      <FloatingShape position={[-6, 0, -6]} color={colors[3]} size={1.4} audioReactive speed={0.55} distort={0.4} />
      <FloatingShape position={[4, 3, -9]} color={colors[2]} size={0.6} speed={1.2} distort={0.2} />
      <FloatingShape position={[-2, 5, -10]} color={colors[4]} size={1.1} speed={0.65} distort={0.32} />
      <FloatingShape position={[7, -2, -7]} color={colors[5]} size={0.85} audioReactive speed={0.75} distort={0.27} />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        maxPolarAngle={Math.PI / 1.4}
        minPolarAngle={Math.PI / 3.5}
        autoRotate
        autoRotateSpeed={0.08}
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
        camera={{ position: [0, 0, 12], fov: 45 }}
        dpr={energySaver ? 1 : [1, 1.5]}
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
