import JSZip from 'jszip';

export const exportProjectZip = async () => {
  const zip = new JSZip();

  // Root configuration files
  zip.file("package.json", JSON.stringify({
    name: "chrona-digital-time-capsule",
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview"
    },
    dependencies: {
      "@react-three/drei": "^9.105.6",
      "@react-three/fiber": "^8.16.6",
      "@react-three/postprocessing": "^2.16.2",
      "canvas-confetti": "^1.9.3",
      "clsx": "^2.1.1",
      "firebase": "^10.12.2",
      "framer-motion": "^11.2.10",
      "gsap": "^3.12.5",
      "jszip": "^3.10.1",
      "lucide-react": "^0.378.0",
      "postprocessing": "^6.35.5",
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "tailwind-merge": "^2.3.0",
      "three": "^0.168.0"
    },
    devDependencies: {
      "@vitejs/plugin-react": "^4.3.0",
      "autoprefixer": "^10.4.19",
      "postcss": "^8.4.38",
      "tailwindcss": "^3.4.3",
      "vite": "^5.2.12"
    }
  }, null, 2));

  zip.file("README.md", `# CHRONA — Preserve Today. Rediscover Tomorrow.

An award-winning, cinematic, photorealistic 3D interactive commercial web application built with React, Three.js, React Three Fiber, Web Audio API, GSAP, and Tailwind CSS.

## 🚀 Quick Start Guide

1. **Install Dependencies**:
   \`\`\`bash
   npm install --legacy-peer-deps
   \`\`\`

2. **Start Local Development Server**:
   \`\`\`bash
   npm run dev
   \`\`\`
   Open http://localhost:3000 in your web browser.

3. **Build for Production**:
   \`\`\`bash
   npm run build
   \`\`\`

## 🌟 Key Features
- **3D Photorealistic Glass Memory Sphere**: Physical transmission shader material with refractive index, clearcoat, dispersion, and inner Chronos plasma core.
- **Floating Photo Memory Cards**: Photorealistic orbiting 3D cards with glass frames, soft glow, float animation, and click camera zoom.
- **Cosmic Environment**: Stars, glowing space dust particles, animated fog, and Postprocessing Bloom & Depth of Field.
- **Web Audio API Synth**: Ambient space pad soundscapes & glass chime interactions.
- **Time Capsule Sealing Vault**: Create new encrypted memories with AI summary generation & release lock timers.
- **Firebase Sync**: Ready for cloud sync via Firestore.
`);

  zip.file("vite.config.js", `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, host: true }
});`);

  zip.file("tailwind.config.js", `export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        chrona: { bg: "#04020a", dark: "#0a0518", purple: "#9d4edd", neon: "#c77dff", cyan: "#38bdf8" }
      }
    }
  },
  plugins: []
};`);

  zip.file("index.html", `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>CHRONA — Preserve Today. Rediscover Tomorrow.</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Inter:wght@400;600&family=Outfit:wght@600;800&display=swap" rel="stylesheet">
  </head>
  <body style="background-color:#04020a; color:white;">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`);

  // Generate & trigger download
  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = "CHRONA-Digital-Time-Capsule.zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
