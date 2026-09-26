const fs = require('fs');
const data = JSON.parse(fs.readFileSync('vehicle-images-audit.txt', 'utf8').substring(fs.readFileSync('vehicle-images-audit.txt', 'utf8').indexOf('[')));

data.forEach(v => {
  if (v.syncImagesCount === 0) return;
  console.log(`\n=== ${v.brand} ${v.model} (${v.syncImagesCount} images) ===`);
  v.syncImages.forEach((img, idx) => {
    console.log(`[${idx}] ${img.cloudinaryPublicId} (${img.url})`);
  });
});
