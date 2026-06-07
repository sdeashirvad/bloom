import sharp from 'sharp';
import { writeFileSync } from 'fs';

// ─── Bloom mark SVG ───────────────────────────────────────────────────────────
// 4 soft organic petal ellipses in diagonal arrangement (45°, 135°, 225°, 315°)
// centered on a warm cream background. Minimalist, premium, no flowers/hearts.

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="bg" cx="50%" cy="44%" r="62%">
      <stop offset="0%" stop-color="#FEF9F3"/>
      <stop offset="100%" stop-color="#F0E6D8"/>
    </radialGradient>
    <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#EEC8B4" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#EEC8B4" stop-opacity="0"/>
    </radialGradient>
    <filter id="petal-soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
    <filter id="center-blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>

  <!-- Warm cream background -->
  <rect width="1024" height="1024" fill="url(#bg)"/>

  <!-- Ambient center warmth -->
  <circle cx="512" cy="512" r="300" fill="url(#center-glow)" filter="url(#center-blur)"/>

  <!-- 4 petals: diagonal arrangement for organic, blooming feel -->
  <!-- Each petal is an ellipse centered 130px above canvas center, rotated around center -->

  <!-- Petal 1: upper-right (45°) — slightly lighter -->
  <ellipse cx="512" cy="382" rx="82" ry="122"
    fill="#D4A49A"
    opacity="0.72"
    transform="rotate(45, 512, 512)"/>

  <!-- Petal 2: lower-right (135°) -->
  <ellipse cx="512" cy="382" rx="82" ry="122"
    fill="#C89890"
    opacity="0.66"
    transform="rotate(135, 512, 512)"/>

  <!-- Petal 3: lower-left (225°) — slightly muted -->
  <ellipse cx="512" cy="382" rx="82" ry="122"
    fill="#D6ACA0"
    opacity="0.62"
    transform="rotate(225, 512, 512)"/>

  <!-- Petal 4: upper-left (315°) -->
  <ellipse cx="512" cy="382" rx="82" ry="122"
    fill="#C8948C"
    opacity="0.68"
    transform="rotate(315, 512, 512)"/>

  <!-- Soft center bloom — the heart of the mark -->
  <circle cx="512" cy="512" r="78" fill="#E8C4B0" opacity="0.48"/>
  <circle cx="512" cy="512" r="46" fill="#D4A090" opacity="0.72"/>
  <circle cx="512" cy="512" r="22" fill="#C89080" opacity="0.88"/>

  <!-- Subtle warm highlight on center -->
  <circle cx="504" cy="500" r="9" fill="#F2D8C8" opacity="0.60"/>
</svg>`;

// ─── Foreground icon for Android adaptive icon ────────────────────────────────
// Same mark, scaled smaller (safe zone), transparent background
// Android safe zone: content should fit within 66% of the foreground image

const foregroundSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#EEC8B4" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#EEC8B4" stop-opacity="0"/>
    </radialGradient>
    <filter id="center-blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
  </defs>

  <!-- Transparent background for adaptive icon -->

  <!-- Bloom mark scaled to 60% and centered (safe zone) -->
  <g transform="translate(512,512) scale(0.62) translate(-512,-512)">
    <!-- Ambient glow -->
    <circle cx="512" cy="512" r="280" fill="url(#center-glow)" filter="url(#center-blur)"/>

    <!-- Petals -->
    <ellipse cx="512" cy="382" rx="82" ry="122"
      fill="#D4A49A" opacity="0.82"
      transform="rotate(45, 512, 512)"/>
    <ellipse cx="512" cy="382" rx="82" ry="122"
      fill="#C89890" opacity="0.76"
      transform="rotate(135, 512, 512)"/>
    <ellipse cx="512" cy="382" rx="82" ry="122"
      fill="#D6ACA0" opacity="0.70"
      transform="rotate(225, 512, 512)"/>
    <ellipse cx="512" cy="382" rx="82" ry="122"
      fill="#C8948C" opacity="0.78"
      transform="rotate(315, 512, 512)"/>

    <!-- Center -->
    <circle cx="512" cy="512" r="78" fill="#E8C4B0" opacity="0.52"/>
    <circle cx="512" cy="512" r="46" fill="#D4A090" opacity="0.80"/>
    <circle cx="512" cy="512" r="22" fill="#C89080" opacity="0.92"/>
    <circle cx="504" cy="500" r="9" fill="#F2D8C8" opacity="0.65"/>
  </g>
</svg>`;

// ─── Splash screen SVG ────────────────────────────────────────────────────────

const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1284" height="2778" viewBox="0 0 1284 2778">
  <defs>
    <radialGradient id="bg-splash" cx="50%" cy="42%" r="60%">
      <stop offset="0%" stop-color="#FEF9F3"/>
      <stop offset="100%" stop-color="#F0E6D8"/>
    </radialGradient>
    <radialGradient id="splash-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#EEC8B4" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#EEC8B4" stop-opacity="0"/>
    </radialGradient>
    <filter id="splash-center-blur" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="28"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1284" height="2778" fill="url(#bg-splash)"/>

  <!-- Centered bloom mark -->
  <g transform="translate(642, 1389)">
    <!-- Ambient glow -->
    <circle cx="0" cy="0" r="360" fill="url(#splash-glow)" filter="url(#splash-center-blur)"/>

    <!-- Petals (mark at 1.4x app icon scale) -->
    <ellipse cx="0" cy="-182" rx="115" ry="171"
      fill="#D4A49A" opacity="0.70"
      transform="rotate(45)"/>
    <ellipse cx="0" cy="-182" rx="115" ry="171"
      fill="#C89890" opacity="0.64"
      transform="rotate(135)"/>
    <ellipse cx="0" cy="-182" rx="115" ry="171"
      fill="#D6ACA0" opacity="0.60"
      transform="rotate(225)"/>
    <ellipse cx="0" cy="-182" rx="115" ry="171"
      fill="#C8948C" opacity="0.66"
      transform="rotate(315)"/>

    <!-- Center -->
    <circle cx="0" cy="0" r="110" fill="#E8C4B0" opacity="0.44"/>
    <circle cx="0" cy="0" r="64" fill="#D4A090" opacity="0.68"/>
    <circle cx="0" cy="0" r="30" fill="#C89080" opacity="0.84"/>
    <circle cx="-10" cy="-14" r="13" fill="#F2D8C8" opacity="0.55"/>
  </g>
</svg>`;

async function generate() {
  console.log('Generating Bloom icon assets...');

  // Main app icon (1024x1024 PNG)
  const iconBuffer = Buffer.from(iconSvg);
  await sharp(iconBuffer)
    .resize(1024, 1024)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile('./assets/images/icon.png');
  console.log('✓ assets/images/icon.png');

  // Root icon (used by some Expo tooling)
  await sharp(iconBuffer)
    .resize(1024, 1024)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile('./assets/icon.png');
  console.log('✓ assets/icon.png');

  // Android adaptive icon foreground (transparent bg, safe-zone scaled)
  const fgBuffer = Buffer.from(foregroundSvg);
  await sharp(fgBuffer)
    .resize(1024, 1024)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile('./assets/images/adaptive-icon.png');
  console.log('✓ assets/images/adaptive-icon.png');

  // Splash screen (1284x2778 — iPhone 15 Pro Max scale, works for all devices)
  const splashBuffer = Buffer.from(splashSvg);
  await sharp(splashBuffer)
    .resize(1284, 2778)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile('./assets/images/splash.png');
  console.log('✓ assets/images/splash.png');

  // Small icon sizes for crisper favicon/notification icon
  await sharp(iconBuffer)
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile('./assets/images/icon-192.png');
  console.log('✓ assets/images/icon-192.png');

  console.log('\nAll icon assets generated successfully.');
}

generate().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
