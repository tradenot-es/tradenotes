import { Suspense, useRef } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import logo3d from "@/assets/tradenotes-logo-3d.png";

function LogoPlane() {
  const texture = useLoader(THREE.TextureLoader, logo3d);
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[3, 3]} />
      <meshStandardMaterial 
        map={texture} 
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

interface Logo3DViewerProps {
  size?: number;
}

export function Logo3DViewer({ size = 120 }: Logo3DViewerProps) {
  return (
    <div style={{ width: size, height: size }} className="cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <Suspense fallback={null}>
          <LogoPlane />
        </Suspense>
        <OrbitControls
          enableRotate={true}
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI * 3 / 4}
        />
      </Canvas>
    </div>
  );
}
