const fs = require('fs');
const data = JSON.parse(fs.readFileSync('vehicle-images-audit.txt', 'utf8').substring(fs.readFileSync('vehicle-images-audit.txt', 'utf8').indexOf('[')));

console.log('Brand | Model | Slug | Cover Image URL | Image Source | VehicleImage Count');
console.log('---|---|---|---|---|---');

data.forEach(v => {
  let cover = v.image;
  let source = 'Vehicle.image';
  if (v.syncImagesCount > 0) {
    cover = v.syncImages[0].url;
    source = 'VehicleImage[0]';
  }
  console.log(`${v.brand} | ${v.model} | ${v.slug} | ${cover} | ${source} | ${v.syncImagesCount}`);
});
