"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text3D, Center } from "@react-three/drei";
import * as THREE from "three";

// Dollar sign configuration type
interface DollarSignConfig {
  position: [number, number, number];
  size: number;
  initialRotation: number;
  rotationSpeedY: number;
  rotationSpeedX: number;
}

// Individual Dollar Sign Component
function DollarSign({
  position,
  size,
  initialRotation,
  rotationSpeedY,
  rotationSpeedX,
}: DollarSignConfig) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeedY;
      meshRef.current.rotation.x += delta * rotationSpeedX;
    }
  });

  const rotationRad = (initialRotation * Math.PI) / 180;

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={[rotationRad, 0, 0]}
    >
      <Center>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
          size={size}
          height={size * 0.25}
          curveSegments={32}
          bevelEnabled
          bevelThickness={size * 0.025}
          bevelSize={size * 0.017}
          bevelSegments={8}
        >
          $
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.95}
            roughness={0.15}
          />
        </Text3D>
      </Center>
    </group>
  );
}

export function RotatingDowel() {
  useEffect(() => {
    console.log("RotatingDollar mounted");
  }, []);

  // Configuration for multiple dollar signs with different positions, sizes, and rotations
  // Balanced spacing - comfortable distance between them
  const dollarSigns: DollarSignConfig[] = [
    {
      position: [0, 1, 0], // Center
      size: 6,
      initialRotation: 30,
      rotationSpeedY: 0.2,
      rotationSpeedX: 0.05,
    },
    {
      position: [-10, 6, -7], // Top-left
      size: 4,
      initialRotation: -20,
      rotationSpeedY: 0.15,
      rotationSpeedX: 0.03,
    },
    {
      position: [15, -6, -10], // Bottom-right
      size: 5,
      initialRotation: 45,
      rotationSpeedY: 0.18,
      rotationSpeedX: 0.04,
    },
    {
      position: [-15, -6, -5], // Bottom-left
      size: 3.5,
      initialRotation: 15,
      rotationSpeedY: 0.22,
      rotationSpeedX: 0.06,
    },
  ];

  return (
    <>
      {/* Lighting Setup */}
      {/* Ambient light for overall illumination - increased for visibility */}
      <ambientLight intensity={0.6} />
      
      {/* Main directional light from top-left - creates highlight */}
      <directionalLight
        position={[10, 12, 8]}
        intensity={2.5}
        color="#ffffff"
      />
      
      {/* Secondary directional light from right - creates rim light */}
      <directionalLight
        position={[-8, 5, 6]}
        intensity={1.5}
        color="#ffffff"
      />
      
      {/* Point light from top - creates top highlight */}
      <pointLight
        position={[0, 15, 0]}
        intensity={2}
        color="#ffffff"
        distance={30}
      />
      
      {/* Point light from front-right - creates side highlight */}
      <pointLight
        position={[8, 3, 10]}
        intensity={1.5}
        color="#ffffff"
        distance={25}
      />
      
      {/* Rim light from behind-left - creates edge lighting */}
      <pointLight
        position={[-6, 4, -10]}
        intensity={1}
        color="#ffffff"
        distance={20}
      />

      {/* Multiple Rotating Dollar Signs */}
      {dollarSigns.map((config, index) => (
        <DollarSign key={index} {...config} />
      ))}
    </>
  );
}
