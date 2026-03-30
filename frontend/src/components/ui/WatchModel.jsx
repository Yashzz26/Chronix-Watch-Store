/**
 * WatchModel.jsx — Production-Ready 3D Watch Viewer
 *
 * Root cause of vanishing model was:
 *   PresentationControls with `snap` (spring reset) + manual useFrame
 *   rotation.y accumulation were fighting each other. On mouse release,
 *   the spring tried to reset while useFrame kept adding rotation,
 *   pushing the model outside the camera frustum → invisible.
 *
 * Fix:
 *   Use OrbitControls with autoRotate instead.
 *   OrbitControls.autoRotate natively pauses during interaction and
 *   resumes after — zero conflict, zero disappearing.
 */

import { Suspense, useLayoutEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Html, Environment, OrbitControls } from '@react-three/drei';
import { Box3, Vector3 } from 'three';

// ─────────────────────────────────────────────────────────────
// LOADER
// ─────────────────────────────────────────────────────────────
function Loader() {
  return (
    <Html center>
      <div style={{
        color: '#d4af37',
        fontFamily: 'serif',
        letterSpacing: '0.2em',
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        opacity: 0.85,
      }}>
        Loading...
      </div>
    </Html>
  );
}

// ─────────────────────────────────────────────────────────────
// MODEL — Centers + normalizes the GLB to origin
// ─────────────────────────────────────────────────────────────
function Model() {
  const { scene } = useGLTF('/homewatch.glb');

  // Center and normalize size once, before first render
  useLayoutEffect(() => {
    if (!scene) return;
    const box = new Box3().setFromObject(scene);
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Shift to world origin
    scene.position.sub(center);

    // Normalize: fit into a 2-unit bounding box
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) scene.scale.setScalar(2 / maxDim);
  }, [scene]);

  return <primitive object={scene} />;
}

// ─────────────────────────────────────────────────────────────
// WATCHMODEL — Canvas wrapper
// ─────────────────────────────────────────────────────────────
export default function WatchModel() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', touchAction: 'none' }}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 5], fov: 45, near: 0.01, far: 500 }}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
      >
        <Suspense fallback={<Loader />}>

          {/* Luxury 4-point lighting rig */}
          <ambientLight intensity={0.35} />
          <directionalLight position={[4, 8, 4]} intensity={1.8} color="#ffffff" />
          <directionalLight position={[-4, 2, -4]} intensity={0.5} color="#c8d8ff" />
          <spotLight
            position={[0, 6, -5]}
            intensity={3}
            color="#d4af37"
            penumbra={1}
            angle={0.5}
            distance={30}
          />

          {/* HDRI for realistic PBR reflections on metal/glass */}
          <Environment preset="city" />

          {/* 
            OrbitControls with autoRotate:
            - autoRotate spins the model when idle
            - Automatically PAUSES when user clicks/drags
            - Automatically RESUMES after mouse release
            - No conflict with any useFrame animation → model NEVER disappears
            - enablePan=false keeps it focused on the product
            - enableZoom=false prevents accidental zoom-outs
            - polar angle clamped so model stays upright
          */}
          <OrbitControls
            autoRotate
            autoRotateSpeed={1.5}
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.7}
            enableDamping
            dampingFactor={0.08}
          />

          <Model />

        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/homewatch.glb');
