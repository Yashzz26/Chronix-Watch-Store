import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // ─────────────────────────────────────────────────────────────
    // CRITICAL FIX: Force ALL imports of 'three' — including those
    // deep inside @react-three/drei and @react-three/fiber's own
    // bundled code — to resolve to the single physical file in
    // node_modules. This eliminates the "Multiple instances of
    // Three.js" warning and fixes the model vanishing during rotation.
    //
    // 'dedupe' alone is not enough because Vite's resolver can still
    // emit separate chunks. The 'alias' approach hard-rewires every
    // bare 'three' import to the same absolute path.
    // ─────────────────────────────────────────────────────────────
    alias: {
      three: path.resolve('./node_modules/three'),
    },
    dedupe: ['three'],
  },
  optimizeDeps: {
    // Pre-bundle these together so Vite's dep optimizer treats them
    // as a single unit and doesn't create duplicate Three instances.
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
})
