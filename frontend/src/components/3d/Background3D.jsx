import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function StarField() {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(4000 * 3);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta * 0.02;
      ref.current.rotation.y -= delta * 0.01;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#6272f1"
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

function FloatingOrb({ position, color, speed = 1 }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.z += 0.002;
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[0.8, 1]} />
      <meshStandardMaterial
        color={color}
        wireframe
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

function GridPlane() {
  return (
    <gridHelper
      args={[40, 40, '#6272f1', '#1e1b4b']}
      position={[0, -5, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

export default function Background3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#6272f1" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#22d3ee" />
      <StarField />
      <FloatingOrb position={[-6, 2, -3]} color="#6272f1" speed={0.7} />
      <FloatingOrb position={[6, -2, -4]} color="#22d3ee" speed={0.5} />
      <FloatingOrb position={[0, 4, -5]} color="#f59e0b" speed={0.9} />
      <GridPlane />
    </Canvas>
  );
}
