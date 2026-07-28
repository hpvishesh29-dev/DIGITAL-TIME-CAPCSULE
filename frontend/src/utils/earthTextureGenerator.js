import * as THREE from 'three';

/**
 * Creates high-definition procedural Earth textures using HTML5 Canvas.
 * Generates:
 * 1. Earth surface texture (continents, oceans, ice caps, topography)
 * 2. Specular map (ocean gloss vs land matte)
 * 3. Night lights texture (glowing city clusters)
 * 4. Atmospheric cloud texture
 */

export function createProceduralEarthTextures() {
  const width = 2048;
  const height = 1024;

  // 1. EARTH SURFACE TEXTURE
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#0f2b48');
  oceanGrad.addColorStop(0.5, '#0a1d34');
  oceanGrad.addColorStop(1, '#0c243f');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Shallow water shelf around coasts
  ctx.fillStyle = '#1e4d75';
  ctx.globalAlpha = 0.4;

  // Helper to convert lat/long to canvas x/y
  const mapCoords = (lat, lon) => {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return [x, y];
  };

  // Draw landmass polygons (simplified high-detail equirectangular outlines)
  const drawLandmass = (pathCoords, baseColor, topoColor) => {
    if (pathCoords.length < 3) return;
    ctx.save();
    ctx.fillStyle = baseColor;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    const [startX, startY] = mapCoords(pathCoords[0][0], pathCoords[0][1]);
    ctx.moveTo(startX, startY);
    for (let i = 1; i < pathCoords.length; i++) {
      const [x, y] = mapCoords(pathCoords[i][0], pathCoords[i][1]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Topo detail inside landmass
    if (topoColor) {
      ctx.fillStyle = topoColor;
      ctx.globalAlpha = 0.4;
      ctx.fill();
    }
    ctx.restore();
  };

  // Continent definitions (Lat, Lon)
  const northAmerica = [
    [70, -165], [72, -125], [60, -80], [50, -55], [45, -64], [25, -80], [15, -90], [10, -83],
    [15, -105], [30, -115], [48, -125], [60, -140], [65, -168]
  ];

  const southAmerica = [
    [12, -72], [8, -60], [-5, -35], [-22, -40], [-40, -62], [-55, -68], [-50, -75],
    [-18, -70], [-5, -80], [8, -78]
  ];

  const europe = [
    [70, 20], [68, 40], [55, 60], [45, 50], [40, 40], [36, 28], [36, -9], [44, -8],
    [48, -4], [54, 8], [60, 5], [62, 12]
  ];

  const africa = [
    [37, 10], [32, 32], [12, 44], [0, 42], [-11, 40], [-34, 20], [-33, 18], [-18, 12],
    [5, 9], [15, -17], [30, -10], [35, -2]
  ];

  const asia = [
    [75, 100], [70, 170], [60, 160], [50, 140], [35, 120], [22, 115], [10, 105], [8, 77],
    [25, 65], [25, 57], [12, 44], [30, 35], [40, 50], [50, 60], [60, 70], [70, 80]
  ];

  const australia = [
    [-12, 130], [-15, 145], [-25, 153], [-38, 148], [-35, 117], [-22, 113], [-14, 126]
  ];

  const greenland = [
    [82, -40], [80, -20], [70, -25], [60, -45], [70, -55], [80, -60]
  ];

  const antarctica = [
    [-70, -180], [-65, -120], [-70, -60], [-68, 0], [-66, 60], [-68, 120], [-70, 180],
    [-89, 180], [-89, -180]
  ];

  // Draw landmasses with photorealistic terrain colors
  drawLandmass(northAmerica, '#2e5d38', '#4a7c59');
  drawLandmass(southAmerica, '#1e532b', '#1b4323');
  drawLandmass(europe, '#3a6b43', '#52825b');
  drawLandmass(africa, '#8c7647', '#5a6e38');
  drawLandmass(asia, '#345e3d', '#706b43');
  drawLandmass(australia, '#9c663b', '#b37744');
  drawLandmass(greenland, '#e2edf8', '#ffffff');
  drawLandmass(antarctica, '#f0f6fc', '#ffffff');

  // Add polar ice cap gradients
  const polarNorth = ctx.createLinearGradient(0, 0, 0, height * 0.12);
  polarNorth.addColorStop(0, 'rgba(240, 246, 252, 0.95)');
  polarNorth.addColorStop(1, 'rgba(240, 246, 252, 0)');
  ctx.fillStyle = polarNorth;
  ctx.fillRect(0, 0, width, height * 0.12);

  const polarSouth = ctx.createLinearGradient(0, height * 0.88, 0, height);
  polarSouth.addColorStop(0, 'rgba(240, 246, 252, 0)');
  polarSouth.addColorStop(1, 'rgba(240, 246, 252, 0.98)');
  ctx.fillStyle = polarSouth;
  ctx.fillRect(0, height * 0.88, width, height * 0.12);

  // Add fine noise/texture to continents
  ctx.save();
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 40000; i++) {
    const rx = Math.random() * width;
    const ry = Math.random() * height;
    ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
    ctx.fillRect(rx, ry, 2, 2);
  }
  ctx.restore();

  const earthMapTexture = new THREE.CanvasTexture(canvas);
  earthMapTexture.colorSpace = THREE.SRGBColorSpace;
  earthMapTexture.needsUpdate = true;

  // 2. SPECULAR MAP (Oceans reflective, land matte)
  const specCanvas = document.createElement('canvas');
  specCanvas.width = width;
  specCanvas.height = height;
  const specCtx = specCanvas.getContext('2d');

  // Oceans white (high reflection), land dark
  specCtx.fillStyle = '#ffffff';
  specCtx.fillRect(0, 0, width, height);

  const drawLandMask = (pathCoords) => {
    if (pathCoords.length < 3) return;
    specCtx.fillStyle = '#151515';
    specCtx.beginPath();
    const [startX, startY] = mapCoords(pathCoords[0][0], pathCoords[0][1]);
    specCtx.moveTo(startX, startY);
    for (let i = 1; i < pathCoords.length; i++) {
      const [x, y] = mapCoords(pathCoords[i][0], pathCoords[i][1]);
      specCtx.lineTo(x, y);
    }
    specCtx.closePath();
    specCtx.fill();
  };

  drawLandMask(northAmerica);
  drawLandMask(southAmerica);
  drawLandMask(europe);
  drawLandMask(africa);
  drawLandMask(asia);
  drawLandMask(australia);
  drawLandMask(greenland);
  drawLandMask(antarctica);

  const specularTexture = new THREE.CanvasTexture(specCanvas);
  specularTexture.needsUpdate = true;

  // 3. NIGHT LIGHTS TEXTURE
  const nightCanvas = document.createElement('canvas');
  nightCanvas.width = width;
  nightCanvas.height = height;
  const nightCtx = nightCanvas.getContext('2d');

  nightCtx.fillStyle = '#020205';
  nightCtx.fillRect(0, 0, width, height);

  // Major cities clusters
  const majorCities = [
    [40.71, -74.0], [34.05, -118.2], [51.5, -0.12], [48.85, 2.35], [35.67, 139.65],
    [31.23, 121.47], [22.31, 114.16], [1.35, 103.81], [28.61, 77.2], [19.07, 72.87],
    [-33.86, 151.2], [-23.55, -46.63], [30.04, 31.23], [25.2, 55.27], [55.75, 37.61],
    [37.77, -122.41], [41.87, -87.62], [29.76, -95.36], [45.5, -73.56], [-34.6, -58.38]
  ];

  nightCtx.fillStyle = '#ffc867';
  majorCities.forEach(([lat, lon]) => {
    const [x, y] = mapCoords(lat, lon);
    const grad = nightCtx.createRadialGradient(x, y, 0, x, y, 18);
    grad.addColorStop(0, 'rgba(255, 220, 140, 0.9)');
    grad.addColorStop(0.3, 'rgba(255, 170, 70, 0.6)');
    grad.addColorStop(1, 'rgba(255, 150, 40, 0)');
    nightCtx.fillStyle = grad;
    nightCtx.beginPath();
    nightCtx.arc(x, y, 18, 0, Math.PI * 2);
    nightCtx.fill();
  });

  const nightLightsTexture = new THREE.CanvasTexture(nightCanvas);
  nightLightsTexture.colorSpace = THREE.SRGBColorSpace;
  nightLightsTexture.needsUpdate = true;

  // 4. CLOUD TEXTURE
  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = width;
  cloudCanvas.height = height;
  const cloudCtx = cloudCanvas.getContext('2d');

  cloudCtx.fillStyle = 'rgba(0, 0, 0, 0)';
  cloudCtx.clearRect(0, 0, width, height);

  cloudCtx.fillStyle = '#ffffff';
  for (let i = 0; i < 220; i++) {
    const cx = Math.random() * width;
    const cy = (0.1 + Math.random() * 0.8) * height;
    const rx = 30 + Math.random() * 90;
    const ry = 10 + Math.random() * 30;

    const grad = cloudCtx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    cloudCtx.fillStyle = grad;

    cloudCtx.beginPath();
    cloudCtx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    cloudCtx.fill();
  }

  const cloudsTexture = new THREE.CanvasTexture(cloudCanvas);
  cloudsTexture.needsUpdate = true;

  return {
    earthMapTexture,
    specularTexture,
    nightLightsTexture,
    cloudsTexture,
  };
}
