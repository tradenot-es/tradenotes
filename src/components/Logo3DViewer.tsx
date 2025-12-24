import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import logo3d from "@/assets/tradenotes-logo-3d.png";

function LogoPlane() {
  const texture = useTexture(logo3d);
  
  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [texture]);

  return (
    <mesh>
      <planeGeometry args={[3, 3]} />
      <meshBasicMaterial 
        map={texture} 
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function FallbackLogo() {
  return (
    <mesh>
      <boxGeometry args={[1.5, 1.5, 0.1]} />
      <meshStandardMaterial color="#22c55e" />
    </mesh>
  );
}

interface Logo3DViewerProps {
  size?: number;
}

export function Logo3DViewer({ size = 120 }: Logo3DViewerProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div style={{ width: size, height: size }} className="cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
        onError={() => setHasError(true)}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} />
        <Suspense fallback={<FallbackLogo />}>
          {hasError ? <FallbackLogo /> : <LogoPlane />}
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
