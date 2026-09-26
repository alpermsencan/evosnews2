const fs = require('fs');
const data = JSON.parse(fs.readFileSync('vehicle-images-audit.txt', 'utf8').substring(fs.readFileSync('vehicle-images-audit.txt', 'utf8').indexOf('[')));

data.filter(v => v.brand === 'Hyundai').forEach(v => {
  console.log(`\n================ ${v.brand} ${v.model} (${v.syncImagesCount} images) ================`);
  v.syncImages.forEach(img => {
    console.log(`- PublicID: ${img.cloudinaryPublicId}`);
    console.log(`  Source: ${img.sourceUrl}`);
  });
});
