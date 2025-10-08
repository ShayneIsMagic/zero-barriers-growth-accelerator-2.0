const fs = require('fs');
const path = require('path');

// Copy static API routes for GitHub Pages deployment
const staticRoutes = [
  {
    from: 'src/app/api/analyze/website/route.static.ts',
    to: 'src/app/api/analyze/website/route.ts'
  },
  {
    from: 'src/app/api/auth/me/route.static.ts',
    to: 'src/app/api/auth/me/route.ts'
  }
];

console.log('🔄 Preparing static routes for GitHub Pages deployment...');

staticRoutes.forEach(({ from, to }) => {
  try {
    // Ensure the destination directory exists
    const destDir = path.dirname(to);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Copy the static version
    fs.copyFileSync(from, to);
    console.log(`✅ Copied ${from} → ${to}`);
  } catch (error) {
    console.error(`❌ Error copying ${from}:`, error.message);
  }
});

console.log('✅ Static routes prepared successfully!');
